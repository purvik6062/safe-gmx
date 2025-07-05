import { EventEmitter } from "events";
import winston from "winston";
import { ChangeStreamDocument } from "mongodb";
import DatabaseService from "./DatabaseService";
import TradeStateManager from "./TradeStateManager";
import TradeExecutionService from "./TradeExecutionService";
import PriceMonitoringService from "./PriceMonitoringService";
import TradingSignalWatcher from "./TradingSignalWatcher";
import { NetworkUtils } from "../utils/NetworkUtils";

interface AgenticConfig {
  database: any;
  aiAgent: any; // Reference to the AI agent for decision-making
  enabled: boolean;
  debug: boolean;
}

/**
 * Agentic Trading Orchestrator
 *
 * This orchestrator uses AI decision-making at every step instead of automated responses.
 * The AI agent analyzes signals, makes trade decisions, and manages positions intelligently.
 */
class AgenticTradingOrchestrator extends EventEmitter {
  private logger: winston.Logger;
  private config: AgenticConfig;
  private isWatching: boolean = false;
  private changeStream: any = null;

  // Core services (initialized in initializeServices)
  private dbService: DatabaseService;
  private tradeStateManager: TradeStateManager;
  private tradeExecutionService: TradeExecutionService;
  private priceMonitoringService: PriceMonitoringService;
  private tradingSignalWatcher: TradingSignalWatcher;
  private aiAgent: any; // The AI agent that makes all decisions

  // Pending decisions queue (signals waiting for AI analysis)
  private pendingSignals: Map<string, any> = new Map();

  constructor(config: AgenticConfig) {
    super();

    this.config = config;
    this.aiAgent = config.aiAgent;

    this.logger = winston.createLogger({
      level: config.debug ? "debug" : "info",
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
      transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: "agentic-trading.log" }),
      ],
    });

    // Initialize core services
    this.dbService = new DatabaseService(this.config.database);
    this.tradeStateManager = new TradeStateManager();
    this.tradeExecutionService = new TradeExecutionService();
    this.priceMonitoringService = new PriceMonitoringService();

    // Initialize trading signal watcher for Safe execution
    this.tradingSignalWatcher = new TradingSignalWatcher(
      this.dbService,
      this.tradeStateManager,
      this.tradeExecutionService,
      this.priceMonitoringService,
      {
        positionSizeUsd: 100,
        maxDailyTrades: 20,
        enableTrailingStop: true,
        trailingStopRetracement: 2,
        defaultSlippage: 1,
        gasBuffer: 20,
      }
    );

    this.logger.info(
      "🧠 Agentic trading services initialized with Safe execution"
    );

    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    // Handle price monitoring events by asking AI what to do
    this.priceMonitoringService.on("tradeExit", async (exitData) => {
      await this.handlePriceAlert(exitData);
    });

    // Process AI decisions every 10 seconds
    setInterval(() => {
      this.processAIDecisionQueue();
    }, 10000);
  }

  async start(): Promise<void> {
    if (this.isWatching) {
      this.logger.warn("Agentic trading already running");
      return;
    }

    if (!this.config.enabled) {
      this.logger.warn("Agentic trading is disabled");
      return;
    }

    try {
      this.logger.info("🚀 Starting agentic trading orchestrator...");

      // Connect to databases
      await this.dbService.connect();

      // Start price monitoring
      await this.priceMonitoringService.start();

      // Start trading signal watcher for Safe execution
      await this.tradingSignalWatcher.start();

      // Create and setup change stream for signals
      this.changeStream = this.dbService.createSignalChangeStream();

      this.changeStream.on("change", async (change: ChangeStreamDocument) => {
        await this.handleNewSignal(change);
      });

      this.isWatching = true;
      this.logger.info(
        "🧠 Agentic trading orchestrator started - AI is now in control"
      );
      this.emit("started");
    } catch (error) {
      this.logger.error("Failed to start agentic trading:", error);
      throw error;
    }
  }

  async stop(): Promise<void> {
    if (!this.isWatching) return;

    try {
      if (this.changeStream) {
        await this.changeStream.close();
      }
      this.priceMonitoringService.stop();
      await this.tradingSignalWatcher.stop();
      await this.dbService.disconnect();

      this.isWatching = false;
      this.logger.info("⏹️ Agentic trading stopped");
      this.emit("stopped");
    } catch (error) {
      this.logger.error("Error stopping agentic trading:", error);
    }
  }

  /**
   * Handle new trading signal by asking AI to analyze and decide
   */
  private async handleNewSignal(change: ChangeStreamDocument): Promise<void> {
    try {
      if (change.operationType !== "insert" || !change.fullDocument) {
        return;
      }

      const signal = change.fullDocument;
      const signalId = signal._id.toString();

      this.logger.info(
        `📡 New signal received: ${signalId} - Asking AI to analyze...`
      );

      // Add to pending signals for AI analysis
      this.pendingSignals.set(signalId, signal);

      // Ask AI to analyze the signal immediately
      await this.requestAISignalAnalysis(signal);
    } catch (error) {
      this.logger.error("Error handling new signal:", error);
    }
  }

  /**
   * Request AI to analyze a trading signal and make decisions
   */
  private async requestAISignalAnalysis(signal: any): Promise<void> {
    try {
      const signalData = signal.signal_data;
      const subscribers = signal.subscribers || [];

      // Construct AI prompt for signal analysis
      const analysisPrompt = `
🔍 NEW TRADING SIGNAL ANALYSIS REQUEST

Signal Details:
• Token: ${signalData.tokenMentioned} (${signalData.tokenId})
• Current Price: $${signalData.currentPrice}
• Signal: ${signalData.signal}
• Targets: TP1=$${signalData.targets[0]}, TP2=$${signalData.targets[1] || signalData.targets[0]}
• Stop Loss: $${signalData.stopLoss}
• Timeline: ${signalData.timeline}
• Max Exit Time: ${signalData.maxExitTime}
• Source: ${signalData.twitterHandle}
• Subscribers: ${subscribers.length} users

As an AI trading agent, please analyze this signal and decide:

1. Should we execute trades for this signal? (Consider market conditions, risk, token legitimacy)
2. What position size should we use for each user? (Risk-adjusted)
3. Which network should we prioritize? (Consider gas costs, liquidity)
4. Any modifications to the exit strategy? (TP/SL adjustments)

Please use your trading analysis tools to make informed decisions.
If you decide to proceed, use the executeSignalTrades tool.
If you decide to reject, use the rejectSignal tool with reasoning.
`;

      // Send to AI agent for analysis and decision
      const result = await this.aiAgent.executeDecision(analysisPrompt);

      this.logger.info(
        `🧠 AI Analysis Result for signal ${signal._id}: ${result.substring(0, 200)}...`
      );
    } catch (error) {
      this.logger.error("Error requesting AI signal analysis:", error);
    }
  }

  /**
   * Handle price alerts by asking AI what to do
   */
  private async handlePriceAlert(exitData: any): Promise<void> {
    try {
      const { tradeId, exitCondition, exitPrice, config } = exitData;

      this.logger.info(
        `🔔 Price alert for trade ${tradeId}: ${exitCondition} at $${exitPrice}`
      );

      const trade = this.tradeStateManager.getTrade(tradeId);
      if (!trade) {
        this.logger.error(`Trade ${tradeId} not found`);
        return;
      }

      // Ask AI to decide what to do with this price alert
      const decisionPrompt = `
🚨 TRADE EXIT DECISION REQUIRED

Trade Details:
• Trade ID: ${tradeId}
• User: ${trade.userId}
• Token: ${trade.tokenSymbol}
• Entry Price: $${trade.entryPrice}
• Current Price: $${exitPrice}
• Alert Condition: ${exitCondition}
• Targets: TP1=$${trade.targets.tp1}, TP2=$${trade.targets.tp2}
• Stop Loss: $${trade.stopLoss}

Current Market Context:
Please analyze current market conditions for ${trade.tokenSymbol} and decide:

1. Should we exit this trade now based on the ${exitCondition} condition?
2. Should we modify the exit strategy (partial exit, hold longer, adjust stops)?
3. Consider market momentum, volatility, and overall conditions

Use your market analysis tools and then use the executeTradeExit or modifyTradeStrategy tool based on your decision.
`;

      // Send to AI for decision
      const result = await this.aiAgent.executeDecision(decisionPrompt);

      this.logger.info(
        `🧠 AI Exit Decision for trade ${tradeId}: ${result.substring(0, 200)}...`
      );
    } catch (error) {
      this.logger.error("Error handling price alert:", error);
    }
  }

  /**
   * Process any pending AI decisions or analyses
   */
  private async processAIDecisionQueue(): Promise<void> {
    try {
      // Check for any stale pending signals (older than 5 minutes)
      const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;

      for (const [signalId, signal] of this.pendingSignals) {
        const signalTime = new Date(
          signal.generatedAt.$date || signal.generatedAt
        ).getTime();

        if (signalTime < fiveMinutesAgo) {
          this.logger.warn(
            `⏰ Signal ${signalId} has been pending for >5 minutes, requesting AI re-analysis`
          );
          await this.requestAISignalAnalysis(signal);
        }
      }

      // Ask AI to review overall portfolio and positions
      if (this.tradeStateManager.getActiveTrades().length > 0) {
        await this.requestAIPortfolioReview();
      }
    } catch (error) {
      this.logger.error("Error processing AI decision queue:", error);
    }
  }

  /**
   * Request AI to review overall portfolio and make adjustments
   */
  private async requestAIPortfolioReview(): Promise<void> {
    try {
      const activeTrades = this.tradeStateManager.getActiveTrades();
      const stats = this.tradeStateManager.getStats();

      const reviewPrompt = `
📊 PORTFOLIO REVIEW REQUEST

Current Portfolio Status:
• Active Trades: ${stats.activeTrades}
• Total Trades: ${stats.activeTrades + stats.historicalTrades}
• Queued Executions: ${stats.queuedExecutions}

Active Positions:
${activeTrades
  .slice(0, 5)
  .map(
    (trade) =>
      `• ${trade.tokenSymbol}: ${trade.status} (Entry: $${trade.entryPrice})`
  )
  .join("\n")}

Please review the portfolio and consider:
1. Risk distribution across positions
2. Correlation between holdings
3. Any rebalancing needed
4. Market conditions impact on portfolio

Use your portfolio analysis tools if adjustments are needed.
`;

      const result = await this.aiAgent.executeDecision(reviewPrompt);
      this.logger.debug(
        `🧠 AI Portfolio Review: ${result.substring(0, 100)}...`
      );
    } catch (error) {
      this.logger.error("Error requesting AI portfolio review:", error);
    }
  }

  // Public methods for AI agent tools to use

  async executeSignalForSubscribers(
    signalId: string,
    approvedUsers: string[],
    positionSize: number
  ): Promise<any> {
    const signal = this.pendingSignals.get(signalId);
    if (!signal) {
      throw new Error(`Signal ${signalId} not found in pending queue`);
    }

    const results = [];

    for (const username of approvedUsers) {
      try {
        const userSafe = await this.dbService.getUserSafe(username);
        if (!userSafe) {
          this.logger.warn(`No Safe found for user ${username}`);
          continue;
        }

        const activeDeployments =
          await this.dbService.getActiveDeployments(userSafe);
        if (activeDeployments.length === 0) {
          this.logger.warn(`No active deployments for user ${username}`);
          continue;
        }

        const optimalNetwork = NetworkUtils.determineOptimalNetwork(
          signal.signal_data.tokenMentioned,
          activeDeployments
        );

        if (!optimalNetwork) {
          this.logger.warn(
            `No optimal network for ${signal.signal_data.tokenMentioned}`
          );
          continue;
        }

        const deployment = activeDeployments.find(
          (d) => d.networkKey === optimalNetwork
        );
        if (!deployment) continue;

        // Create trade entry
        const trade = this.tradeStateManager.createTradeEntry(
          username,
          signalId,
          deployment.address,
          optimalNetwork,
          signal.signal_data.tokenMentioned,
          signal.signal_data
        );

        // Queue for execution with AI-determined position size
        this.tradeStateManager.queueTradeExecution({
          action: "enter",
          tradeId: trade.tradeId,
          amount: positionSize.toString(),
          reason: `AI-approved signal for ${signal.signal_data.tokenMentioned}`,
          urgency: "high",
        });

        results.push({
          username,
          tradeId: trade.tradeId,
          status: "queued",
          network: optimalNetwork,
        });

        this.logger.info(
          `✅ AI-approved trade queued: ${username} - ${trade.tradeId}`
        );
      } catch (error) {
        this.logger.error(`Failed to process user ${username}:`, error);
        results.push({
          username,
          status: "failed",
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    // Remove from pending signals
    this.pendingSignals.delete(signalId);

    return {
      signalId,
      processedUsers: results.length,
      successfulTrades: results.filter((r) => r.status === "queued").length,
      results,
    };
  }

  async rejectSignal(signalId: string, reason: string): Promise<void> {
    this.pendingSignals.delete(signalId);
    this.logger.info(`❌ AI rejected signal ${signalId}: ${reason}`);

    this.emit("signalRejected", { signalId, reason });
  }

  async executeTradeExit(
    tradeId: string,
    exitPercentage: number = 100,
    reason: string
  ): Promise<void> {
    const trade = this.tradeStateManager.getTrade(tradeId);
    if (!trade) {
      throw new Error(`Trade ${tradeId} not found`);
    }

    const exitAmount = (
      (parseFloat(trade.entryAmount) * exitPercentage) /
      100
    ).toString();

    this.tradeStateManager.queueTradeExecution({
      action: "exit",
      tradeId,
      amount: exitAmount,
      reason: `AI decision: ${reason}`,
      urgency: "high",
    });

    this.logger.info(
      `🤖 AI queued exit for trade ${tradeId}: ${exitPercentage}% - ${reason}`
    );
  }

  getSystemStatus(): any {
    return {
      isWatching: this.isWatching,
      pendingSignals: this.pendingSignals.size,
      activeTrades: this.tradeStateManager.getActiveTrades().length,
      monitoredTrades: this.priceMonitoringService.getMonitoredTrades().size,
      mode: "agentic",
    };
  }
}

export default AgenticTradingOrchestrator;
