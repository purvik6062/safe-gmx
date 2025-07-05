import { z } from "zod";
import axios from "axios";

/**
 * Monitor trading positions and performance
 */
export const monitorPositions = async ({
  safeAddress,
  chainId = "42161",
  includeHistory = false,
}: {
  safeAddress: string;
  chainId?: string;
  includeHistory?: boolean;
}): Promise<string> => {
  try {
    let report = `📊 Portfolio Position Monitor\n\n`;
    report += `🏦 Safe Address: ${safeAddress}\n`;

    // Determine chain name
    const chainNames: { [key: string]: string } = {
      "1": "Ethereum",
      "42161": "Arbitrum",
      "137": "Polygon",
      "8453": "Base",
      "11155111": "Sepolia",
    };

    const chainName = chainNames[chainId] || "Unknown";
    report += `🌐 Network: ${chainName}\n\n`;

    // Get Safe balance data (simulated for demo)
    // In production, this would call the actual Safe Transaction Service
    const mockPositions = [
      {
        token: "ETH",
        symbol: "ETH",
        balance: "2.5",
        valueUsd: "6250.00",
        change24h: "+3.2%",
        allocation: "65%",
      },
      {
        token: "USDC",
        symbol: "USDC",
        balance: "2500.00",
        valueUsd: "2500.00",
        change24h: "0.0%",
        allocation: "26%",
      },
      {
        token: "ARB",
        symbol: "ARB",
        balance: "450.00",
        valueUsd: "855.00",
        change24h: "+5.7%",
        allocation: "9%",
      },
    ];

    const totalValue = mockPositions.reduce(
      (sum, pos) => sum + parseFloat(pos.valueUsd),
      0
    );

    report += `💰 Total Portfolio Value: $${totalValue.toLocaleString()}\n\n`;

    report += `📋 Current Positions:\n`;
    mockPositions.forEach((position, index) => {
      const changeEmoji = position.change24h.startsWith("+")
        ? "📈"
        : position.change24h.startsWith("-")
          ? "📉"
          : "➡️";

      report += `${index + 1}. ${position.symbol}\n`;
      report += `   🪙 Balance: ${position.balance} ${position.symbol}\n`;
      report += `   💵 Value: $${position.valueUsd}\n`;
      report += `   ${changeEmoji} 24h: ${position.change24h}\n`;
      report += `   📊 Allocation: ${position.allocation}\n\n`;
    });

    // Portfolio analytics
    const totalChange24h = mockPositions.reduce((sum, pos) => {
      const change = parseFloat(
        pos.change24h.replace("%", "").replace("+", "")
      );
      const weight = parseFloat(pos.allocation.replace("%", "")) / 100;
      return sum + change * weight;
    }, 0);

    report += `📈 Portfolio Performance:\n`;
    report += `🎯 24h Change: ${totalChange24h > 0 ? "+" : ""}${totalChange24h.toFixed(2)}%\n`;

    if (totalChange24h > 2) {
      report += `✅ Strong performance today\n`;
    } else if (totalChange24h > 0) {
      report += `🟢 Positive performance\n`;
    } else if (totalChange24h > -2) {
      report += `🟡 Minor decline\n`;
    } else {
      report += `🔴 Significant decline - consider reviewing strategy\n`;
    }

    // Risk assessment
    report += `\n⚠️ Risk Analysis:\n`;
    const ethAllocation = parseFloat(
      mockPositions[0].allocation.replace("%", "")
    );
    if (ethAllocation > 70) {
      report += `🚨 High ETH concentration (${ethAllocation}%) - consider diversification\n`;
    } else if (ethAllocation > 50) {
      report += `⚠️ Moderate ETH concentration - monitor closely\n`;
    } else {
      report += `✅ Well diversified allocation\n`;
    }

    // Trading suggestions
    report += `\n💡 Suggestions:\n`;
    if (totalChange24h > 5) {
      report += `📈 Consider taking some profits while market is strong\n`;
    } else if (totalChange24h < -5) {
      report += `💰 Potential buying opportunity on the dip\n`;
    } else {
      report += `⚖️ Hold current positions - market showing stability\n`;
    }

    if (includeHistory) {
      report += `\n📊 Position History:\n`;
      report += `🕐 Last 7 days: +12.5% (simulated)\n`;
      report += `🕐 Last 30 days: +28.3% (simulated)\n`;
      report += `🕐 All time: +156.7% (simulated)\n`;
    }

    return report;
  } catch (error) {
    console.error("Position monitoring error:", error);
    return `❌ Failed to monitor positions: ${error instanceof Error ? error.message : "Unknown error"}`;
  }
};

/**
 * Check profit and loss for trading activities
 */
export const checkProfitLoss = async ({
  safeAddress,
  timeframe = "7d",
  includeBreakdown = true,
}: {
  safeAddress: string;
  timeframe?: string;
  includeBreakdown?: boolean;
}): Promise<string> => {
  try {
    let report = `💹 Profit & Loss Report (${timeframe})\n\n`;
    report += `🏦 Safe: ${safeAddress}\n\n`;

    // Simulated P&L data - in production this would analyze transaction history
    const plData = {
      "1d": { pnl: "+$125.50", percentage: "+1.3%", trades: 3 },
      "7d": { pnl: "+$1,247.80", percentage: "+12.8%", trades: 15 },
      "30d": { pnl: "+$2,890.25", percentage: "+28.9%", trades: 45 },
      "90d": { pnl: "+$4,567.30", percentage: "+45.7%", trades: 120 },
    };

    const selectedData =
      plData[timeframe as keyof typeof plData] || plData["7d"];

    report += `📊 ${timeframe.toUpperCase()} Performance:\n`;
    report += `💰 Total P&L: ${selectedData.pnl}\n`;
    report += `📈 Percentage: ${selectedData.percentage}\n`;
    report += `🔄 Total Trades: ${selectedData.trades}\n`;
    report += `📊 Avg per Trade: $${(parseFloat(selectedData.pnl.replace("$", "").replace("+", "").replace(",", "")) / selectedData.trades).toFixed(2)}\n\n`;

    if (includeBreakdown) {
      report += `📋 Performance Breakdown:\n`;

      // Simulated trade breakdown
      const trades = [
        { pair: "ETH/USDC", pnl: "+$347.20", success: true },
        { pair: "ARB/ETH", pnl: "+$189.60", success: true },
        { pair: "MATIC/USDC", pnl: "-$45.30", success: false },
        { pair: "ETH/USDC", pnl: "+$456.10", success: true },
        { pair: "UNI/ETH", pnl: "+$78.90", success: true },
      ];

      trades.forEach((trade, index) => {
        const emoji = trade.success ? "✅" : "❌";
        report += `${emoji} ${trade.pair}: ${trade.pnl}\n`;
      });

      const winRate = (
        (trades.filter((t) => t.success).length / trades.length) *
        100
      ).toFixed(1);
      report += `\n🎯 Win Rate: ${winRate}%\n`;

      // Performance metrics
      report += `\n📊 Key Metrics:\n`;
      report += `🔥 Best Trade: +$456.10 (ETH/USDC)\n`;
      report += `📉 Worst Trade: -$45.30 (MATIC/USDC)\n`;
      report += `⚖️ Risk/Reward: 1:2.8\n`;
      report += `📈 Sharpe Ratio: 1.65 (estimated)\n`;
    }

    // Performance analysis
    const pnlPercentage = parseFloat(
      selectedData.percentage.replace("%", "").replace("+", "")
    );

    report += `\n🎯 Performance Analysis:\n`;
    if (pnlPercentage > 20) {
      report += `🚀 EXCELLENT: Outstanding returns!\n`;
    } else if (pnlPercentage > 10) {
      report += `✅ GOOD: Above market average\n`;
    } else if (pnlPercentage > 0) {
      report += `🟢 POSITIVE: Steady gains\n`;
    } else if (pnlPercentage > -5) {
      report += `🟡 MINOR LOSS: Within acceptable range\n`;
    } else {
      report += `🔴 SIGNIFICANT LOSS: Review strategy needed\n`;
    }

    // Recommendations
    report += `\n💡 Recommendations:\n`;
    if (pnlPercentage > 15) {
      report += `📈 Consider taking profits and securing gains\n`;
      report += `📊 Review what's working well to replicate success\n`;
    } else if (pnlPercentage < -10) {
      report += `⏸️ Consider pausing trading to reassess strategy\n`;
      report += `🔍 Analyze losing trades for pattern identification\n`;
    } else {
      report += `⚖️ Maintain current strategy with minor optimizations\n`;
      report += `📊 Continue monitoring for trend changes\n`;
    }

    return report;
  } catch (error) {
    console.error("P&L check error:", error);
    return `❌ Failed to check P&L: ${error instanceof Error ? error.message : "Unknown error"}`;
  }
};

/**
 * Rebalance portfolio based on target allocations
 */
export const rebalancePortfolio = async ({
  safeAddress,
  targetAllocations,
  rebalanceThreshold = 5,
  chainId = "42161",
}: {
  safeAddress: string;
  targetAllocations: { [key: string]: number };
  rebalanceThreshold?: number;
  chainId?: string;
}): Promise<string> => {
  try {
    let report = `⚖️ Portfolio Rebalancing Analysis\n\n`;
    report += `🏦 Safe: ${safeAddress}\n`;
    report += `🎯 Rebalance Threshold: ${rebalanceThreshold}%\n\n`;

    // Current allocations (simulated)
    const currentAllocations: { [key: string]: number } = {
      ETH: 65,
      USDC: 26,
      ARB: 9,
    };

    const totalCurrentValue = 9605; // $9,605 total portfolio

    report += `📊 Current vs Target Allocations:\n\n`;

    const rebalanceActions: string[] = [];
    let needsRebalancing = false;

    Object.keys(targetAllocations).forEach((token) => {
      const current = currentAllocations[token] || 0;
      const target = targetAllocations[token];
      const difference = current - target;
      const absDifference = Math.abs(difference);

      const currentValue = (current / 100) * totalCurrentValue;
      const targetValue = (target / 100) * totalCurrentValue;
      const dollarDifference = currentValue - targetValue;

      report += `${token}:\n`;
      report += `  📈 Current: ${current}% ($${currentValue.toLocaleString()})\n`;
      report += `  🎯 Target: ${target}% ($${targetValue.toLocaleString()})\n`;
      report += `  📊 Difference: ${difference > 0 ? "+" : ""}${difference.toFixed(1)}% ($${dollarDifference > 0 ? "+" : ""}${dollarDifference.toFixed(0)})\n`;

      if (absDifference > rebalanceThreshold) {
        needsRebalancing = true;
        if (difference > 0) {
          rebalanceActions.push(
            `SELL $${Math.abs(dollarDifference).toFixed(0)} of ${token}`
          );
          report += `  ⬇️ Action: REDUCE by ${absDifference.toFixed(1)}%\n`;
        } else {
          rebalanceActions.push(
            `BUY $${Math.abs(dollarDifference).toFixed(0)} of ${token}`
          );
          report += `  ⬆️ Action: INCREASE by ${absDifference.toFixed(1)}%\n`;
        }
      } else {
        report += `  ✅ Action: NO CHANGE NEEDED\n`;
      }
      report += `\n`;
    });

    report += `🎯 Rebalancing Decision:\n`;
    if (needsRebalancing) {
      report += `⚖️ REBALANCING REQUIRED\n\n`;
      report += `📋 Recommended Actions:\n`;
      rebalanceActions.forEach((action, index) => {
        report += `${index + 1}. ${action}\n`;
      });

      // Calculate estimated costs
      const estimatedGasCost = rebalanceActions.length * 2; // $2 per trade on L2
      const estimatedSlippage = rebalanceActions.length * 0.1; // 0.1% per trade

      report += `\n💰 Estimated Costs:\n`;
      report += `⛽ Gas Fees: ~$${estimatedGasCost}\n`;
      report += `📉 Slippage: ~${estimatedSlippage}%\n`;
      report += `💸 Total Cost: ~$${(estimatedGasCost + (totalCurrentValue * estimatedSlippage) / 100).toFixed(2)}\n`;

      // Cost-benefit analysis
      const rebalanceBenefit = totalCurrentValue * 0.02; // Assume 2% efficiency gain
      const totalCost =
        estimatedGasCost + (totalCurrentValue * estimatedSlippage) / 100;

      report += `\n📊 Cost-Benefit Analysis:\n`;
      report += `📈 Expected Benefit: $${rebalanceBenefit.toFixed(2)}\n`;
      report += `💸 Total Cost: $${totalCost.toFixed(2)}\n`;

      if (rebalanceBenefit > totalCost) {
        report += `✅ RECOMMENDATION: PROCEED with rebalancing\n`;
      } else {
        report += `⚠️ RECOMMENDATION: WAIT - costs exceed benefits\n`;
      }
    } else {
      report += `✅ NO REBALANCING NEEDED\n`;
      report += `📊 All allocations within ${rebalanceThreshold}% threshold\n`;
    }

    // Additional insights
    report += `\n💡 Portfolio Insights:\n`;
    const dominantAsset = Object.keys(currentAllocations).reduce((a, b) =>
      currentAllocations[a] > currentAllocations[b] ? a : b
    );

    report += `👑 Dominant Asset: ${dominantAsset} (${currentAllocations[dominantAsset]}%)\n`;

    const diversificationScore =
      100 - Math.max(...Object.values(currentAllocations));
    report += `🌍 Diversification Score: ${diversificationScore}/100\n`;

    if (diversificationScore < 50) {
      report += `⚠️ Low diversification - consider spreading risk\n`;
    } else if (diversificationScore > 70) {
      report += `✅ Well diversified portfolio\n`;
    }

    return report;
  } catch (error) {
    console.error("Portfolio rebalancing error:", error);
    return `❌ Failed to analyze rebalancing: ${error instanceof Error ? error.message : "Unknown error"}`;
  }
};

// Metadata for LangChain tools
export const monitorPositionsMetadata = {
  name: "monitorPositions",
  description:
    "Monitor current trading positions, balances, and portfolio performance",
  schema: z.object({
    safeAddress: z.string().describe("Safe wallet address to monitor"),
    chainId: z.string().optional().describe("Chain ID (default: Arbitrum)"),
    includeHistory: z
      .boolean()
      .optional()
      .describe("Include historical performance data"),
  }),
};

export const checkProfitLossMetadata = {
  name: "checkProfitLoss",
  description:
    "Check profit and loss performance for trading activities over specified timeframe",
  schema: z.object({
    safeAddress: z.string().describe("Safe wallet address to analyze"),
    timeframe: z
      .enum(["1d", "7d", "30d", "90d"])
      .optional()
      .describe("Time period for P&L analysis"),
    includeBreakdown: z
      .boolean()
      .optional()
      .describe("Include detailed trade breakdown"),
  }),
};

export const rebalancePortfolioMetadata = {
  name: "rebalancePortfolio",
  description:
    "Analyze portfolio rebalancing needs based on target allocations and current positions",
  schema: z.object({
    safeAddress: z.string().describe("Safe wallet address to rebalance"),
    targetAllocations: z
      .record(z.number())
      .describe(
        "Target allocation percentages (e.g., {'ETH': 60, 'USDC': 30, 'ARB': 10})"
      ),
    rebalanceThreshold: z
      .number()
      .optional()
      .describe("Percentage threshold to trigger rebalancing (default: 5%)"),
    chainId: z.string().optional().describe("Chain ID (default: Arbitrum)"),
  }),
};
