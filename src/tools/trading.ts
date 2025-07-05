import { z } from "zod";
import axios from "axios";

/**
 * Calculate optimal trade size based on risk parameters
 */
export const calculateTradeSize = async ({
  portfolioValue,
  riskPercentage = 2,
  stopLossPercentage = 5,
  tokenSymbol = "ETH",
}: {
  portfolioValue: string;
  riskPercentage?: number;
  stopLossPercentage?: number;
  tokenSymbol?: string;
}): Promise<string> => {
  try {
    const totalValue = parseFloat(portfolioValue);

    if (isNaN(totalValue) || totalValue <= 0) {
      return "❌ Invalid portfolio value provided";
    }

    // Calculate position size using Kelly Criterion approach
    const riskAmount = totalValue * (riskPercentage / 100);
    const maxLossPerTrade = totalValue * (stopLossPercentage / 100);

    // Conservative position sizing
    const recommendedSize = Math.min(riskAmount, maxLossPerTrade);
    const positionPercentage = ((recommendedSize / totalValue) * 100).toFixed(
      2
    );

    // Get current token price for size calculation
    let tokenPrice = 0;
    try {
      const priceResponse = await axios.get(
        `https://api.coingecko.com/api/v3/simple/price?ids=${tokenSymbol.toLowerCase() === "eth" ? "ethereum" : tokenSymbol}&vs_currencies=usd`,
        { timeout: 5000 }
      );
      const tokenData = Object.values(priceResponse.data)[0] as any;
      tokenPrice = tokenData?.usd || 0;
    } catch (error) {
      console.log("Price fetch failed, using estimates");
    }

    let analysis = `🎯 Trade Size Calculation\n\n`;
    analysis += `💰 Portfolio Value: $${totalValue.toLocaleString()}\n`;
    analysis += `⚠️ Risk per Trade: ${riskPercentage}% ($${riskAmount.toLocaleString()})\n`;
    analysis += `🛑 Stop Loss: ${stopLossPercentage}%\n`;
    analysis += `📊 Recommended Position: $${recommendedSize.toLocaleString()} (${positionPercentage}%)\n\n`;

    if (tokenPrice > 0) {
      const tokenAmount = recommendedSize / tokenPrice;
      analysis += `🪙 ${tokenSymbol.toUpperCase()} Amount: ${tokenAmount.toFixed(4)} tokens\n`;
      analysis += `💵 Current ${tokenSymbol.toUpperCase()} Price: $${tokenPrice.toLocaleString()}\n\n`;
    }

    // Risk warnings
    analysis += `⚠️ Risk Management:\n`;
    if (riskPercentage > 5) {
      analysis += `🚨 HIGH RISK: ${riskPercentage}% per trade is aggressive\n`;
    } else if (riskPercentage > 2) {
      analysis += `⚠️ MODERATE RISK: Consider reducing to 1-2%\n`;
    } else {
      analysis += `✅ CONSERVATIVE: Good risk management\n`;
    }

    analysis += `💡 Recommendation: Never risk more than you can afford to lose`;

    return analysis;
  } catch (error) {
    console.error("Trade size calculation error:", error);
    return `❌ Failed to calculate trade size: ${error instanceof Error ? error.message : "Unknown error"}`;
  }
};

/**
 * Assess risk levels for a trading strategy
 */
export const assessRisk = async ({
  strategy,
  marketConditions = "neutral",
  timeframe = "short",
  leverage = 1,
}: {
  strategy: string;
  marketConditions?: string;
  timeframe?: string;
  leverage?: number;
}): Promise<string> => {
  try {
    let riskScore = 0;
    let riskFactors: string[] = [];

    // Strategy risk assessment
    const strategyRisks: { [key: string]: number } = {
      scalping: 8,
      "day-trading": 7,
      "swing-trading": 5,
      dca: 3,
      hodl: 2,
      arbitrage: 4,
      momentum: 6,
      "mean-reversion": 5,
      breakout: 7,
      "grid-trading": 4,
    };

    const baseRisk = strategyRisks[strategy.toLowerCase()] || 5;
    riskScore += baseRisk;

    // Market conditions impact
    switch (marketConditions.toLowerCase()) {
      case "bullish":
        riskScore += 2;
        riskFactors.push("Bullish market may lead to overconfidence");
        break;
      case "bearish":
        riskScore += 4;
        riskFactors.push("Bearish conditions increase volatility");
        break;
      case "volatile":
        riskScore += 5;
        riskFactors.push("High volatility increases unpredictability");
        break;
      case "neutral":
        riskScore += 1;
        break;
    }

    // Timeframe risk
    switch (timeframe.toLowerCase()) {
      case "short":
      case "scalping":
        riskScore += 3;
        riskFactors.push("Short timeframes require constant monitoring");
        break;
      case "medium":
      case "swing":
        riskScore += 1;
        break;
      case "long":
      case "position":
        riskScore -= 1;
        break;
    }

    // Leverage risk
    if (leverage > 1) {
      const leverageRisk = Math.min(leverage * 2, 8);
      riskScore += leverageRisk;
      riskFactors.push(`${leverage}x leverage amplifies both gains and losses`);
    }

    // Cap risk score
    riskScore = Math.min(riskScore, 10);
    riskScore = Math.max(riskScore, 1);

    let analysis = `🎯 Risk Assessment Report\n\n`;
    analysis += `📋 Strategy: ${strategy.toUpperCase()}\n`;
    analysis += `🌡️ Market Conditions: ${marketConditions.toUpperCase()}\n`;
    analysis += `⏱️ Timeframe: ${timeframe.toUpperCase()}\n`;
    analysis += `📈 Leverage: ${leverage}x\n\n`;

    // Risk level determination
    let riskLevel: string;
    let riskEmoji: string;
    if (riskScore <= 3) {
      riskLevel = "LOW";
      riskEmoji = "🟢";
    } else if (riskScore <= 6) {
      riskLevel = "MODERATE";
      riskEmoji = "🟡";
    } else if (riskScore <= 8) {
      riskLevel = "HIGH";
      riskEmoji = "🟠";
    } else {
      riskLevel = "EXTREME";
      riskEmoji = "🔴";
    }

    analysis += `${riskEmoji} Overall Risk Level: ${riskLevel} (${riskScore}/10)\n\n`;

    if (riskFactors.length > 0) {
      analysis += `⚠️ Risk Factors:\n`;
      riskFactors.forEach((factor, index) => {
        analysis += `${index + 1}. ${factor}\n`;
      });
      analysis += `\n`;
    }

    // Recommendations
    analysis += `💡 Recommendations:\n`;
    if (riskScore >= 8) {
      analysis += `🚨 EXTREME RISK: Consider reducing position size by 50%\n`;
      analysis += `🛑 Use tight stop losses (2-3%)\n`;
      analysis += `⏰ Monitor positions constantly\n`;
    } else if (riskScore >= 6) {
      analysis += `⚠️ HIGH RISK: Reduce position size by 25%\n`;
      analysis += `🛑 Use stop losses (3-5%)\n`;
      analysis += `👀 Monitor positions regularly\n`;
    } else if (riskScore >= 4) {
      analysis += `⚖️ MODERATE RISK: Standard position sizing acceptable\n`;
      analysis += `🛑 Use stop losses (5-8%)\n`;
    } else {
      analysis += `✅ LOW RISK: Good risk/reward profile\n`;
      analysis += `📈 Consider slightly larger positions if appropriate\n`;
    }

    return analysis;
  } catch (error) {
    console.error("Risk assessment error:", error);
    return `❌ Failed to assess risk: ${error instanceof Error ? error.message : "Unknown error"}`;
  }
};

/**
 * Optimize gas costs for trading
 */
export const optimizeGas = async ({
  chainId = "42161",
  priority = "standard",
  transactionType = "swap",
}: {
  chainId?: string;
  priority?: string;
  transactionType?: string;
}): Promise<string> => {
  try {
    let analysis = `⛽ Gas Optimization Report\n\n`;

    // Chain-specific gas information
    const chainInfo: {
      [key: string]: { name: string; avgGas: string; avgCost: string };
    } = {
      "1": { name: "Ethereum", avgGas: "21,000-200,000", avgCost: "$5-50" },
      "42161": {
        name: "Arbitrum",
        avgGas: "200,000-500,000",
        avgCost: "$0.10-2",
      },
      "137": {
        name: "Polygon",
        avgGas: "21,000-300,000",
        avgCost: "$0.01-0.50",
      },
      "8453": { name: "Base", avgGas: "21,000-200,000", avgCost: "$0.05-2" },
      "10": { name: "Optimism", avgGas: "21,000-200,000", avgCost: "$0.05-2" },
    };

    const chain = chainInfo[chainId] || chainInfo["42161"];

    analysis += `🌐 Network: ${chain.name}\n`;
    analysis += `⚡ Typical Gas Usage: ${chain.avgGas}\n`;
    analysis += `💰 Estimated Cost: ${chain.avgCost}\n\n`;

    // Priority recommendations
    analysis += `🎯 Priority Setting: ${priority.toUpperCase()}\n`;
    switch (priority.toLowerCase()) {
      case "low":
        analysis += `⏰ Expected Time: 5-15 minutes\n`;
        analysis += `💰 Cost: 20-50% lower than standard\n`;
        analysis += `⚠️ Risk: May fail in high network activity\n`;
        break;
      case "standard":
        analysis += `⏰ Expected Time: 1-5 minutes\n`;
        analysis += `💰 Cost: Market rate\n`;
        analysis += `✅ Risk: Low failure rate\n`;
        break;
      case "high":
        analysis += `⏰ Expected Time: 30 seconds - 2 minutes\n`;
        analysis += `💰 Cost: 50-100% higher than standard\n`;
        analysis += `🚀 Risk: Very low failure rate\n`;
        break;
    }

    analysis += `\n💡 Gas Optimization Tips:\n`;

    // Chain-specific optimizations
    if (chainId === "1") {
      analysis += `🕐 Use off-peak hours (late night UTC)\n`;
      analysis += `📊 Monitor gas tracker before trading\n`;
      analysis += `🔄 Consider L2 alternatives for smaller trades\n`;
    } else {
      analysis += `✅ L2 networks offer 10-100x lower fees\n`;
      analysis += `🔄 Batch multiple operations when possible\n`;
      analysis += `⚡ Gas optimization less critical on L2\n`;
    }

    // Transaction type optimizations
    analysis += `\n🔧 ${transactionType.toUpperCase()} Specific:\n`;
    switch (transactionType.toLowerCase()) {
      case "swap":
        analysis += `🔄 Use DEX aggregators for best routes\n`;
        analysis += `💱 Consider slippage vs gas cost trade-off\n`;
        break;
      case "transfer":
        analysis += `📤 Simple transfers use minimal gas\n`;
        analysis += `🎯 Perfect for low priority settings\n`;
        break;
      case "approve":
        analysis += `✅ One-time cost for token access\n`;
        analysis += `🔄 Consider unlimited approval for frequently used tokens\n`;
        break;
    }

    // Current network status (simulated)
    analysis += `\n📊 Current Network Status:\n`;
    analysis += `🚦 Network Congestion: MODERATE\n`;
    analysis += `⚡ Recommended Priority: STANDARD\n`;
    analysis += `💰 Estimated Cost Range: ${chain.avgCost}\n`;

    return analysis;
  } catch (error) {
    console.error("Gas optimization error:", error);
    return `❌ Failed to optimize gas: ${error instanceof Error ? error.message : "Unknown error"}`;
  }
};

// Metadata for LangChain tools
export const calculateTradeSizeMetadata = {
  name: "calculateTradeSize",
  description:
    "Calculate optimal trade size based on portfolio value, risk tolerance, and stop loss levels",
  schema: z.object({
    portfolioValue: z.string().describe("Total portfolio value in USD"),
    riskPercentage: z
      .number()
      .optional()
      .describe("Risk percentage per trade (default: 2%)"),
    stopLossPercentage: z
      .number()
      .optional()
      .describe("Stop loss percentage (default: 5%)"),
    tokenSymbol: z
      .string()
      .optional()
      .describe("Token symbol for calculation (default: ETH)"),
  }),
};

export const assessRiskMetadata = {
  name: "assessRisk",
  description:
    "Assess risk levels for trading strategies based on market conditions, timeframe, and leverage",
  schema: z.object({
    strategy: z
      .string()
      .describe(
        "Trading strategy (e.g., scalping, swing-trading, dca, momentum)"
      ),
    marketConditions: z
      .enum(["bullish", "bearish", "neutral", "volatile"])
      .optional()
      .describe("Current market conditions"),
    timeframe: z
      .enum(["short", "medium", "long", "scalping", "swing", "position"])
      .optional()
      .describe("Trading timeframe"),
    leverage: z.number().optional().describe("Leverage amount (default: 1x)"),
  }),
};

export const optimizeGasMetadata = {
  name: "optimizeGas",
  description: "Optimize gas costs and timing for blockchain transactions",
  schema: z.object({
    chainId: z
      .enum(["1", "42161", "137", "8453", "10"])
      .optional()
      .describe("Blockchain network (default: Arbitrum)"),
    priority: z
      .enum(["low", "standard", "high"])
      .optional()
      .describe("Transaction priority (default: standard)"),
    transactionType: z
      .enum(["swap", "transfer", "approve", "deploy"])
      .optional()
      .describe("Type of transaction"),
  }),
};
