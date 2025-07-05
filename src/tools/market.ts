import { z } from "zod";
import axios from "axios";

/**
 * Get current token price from CoinGecko
 */
export const getTokenPrice = async ({
  tokenSymbol,
  vsCurrency = "usd",
}: {
  tokenSymbol: string;
  vsCurrency?: string;
}): Promise<string> => {
  try {
    const symbol = tokenSymbol.toLowerCase();

    // Map common symbols to CoinGecko IDs
    const tokenMap: { [key: string]: string } = {
      eth: "ethereum",
      btc: "bitcoin",
      matic: "matic-network",
      arb: "arbitrum",
      op: "optimism",
      uni: "uniswap",
      link: "chainlink",
      aave: "aave",
      comp: "compound-governance-token",
      mkr: "maker",
      snx: "havven",
      crv: "curve-dao-token",
      sushi: "sushi",
      usdc: "usd-coin",
      usdt: "tether",
      dai: "dai",
    };

    const tokenId = tokenMap[symbol] || symbol;

    const response = await axios.get(
      `https://api.coingecko.com/api/v3/simple/price?ids=${tokenId}&vs_currencies=${vsCurrency}&include_24hr_change=true&include_market_cap=true`,
      { timeout: 10000 }
    );

    const priceData = response.data[tokenId];

    if (!priceData) {
      return `❌ Price data not found for ${tokenSymbol.toUpperCase()}`;
    }

    const price = priceData[vsCurrency];
    const change24h = priceData[`${vsCurrency}_24h_change`];
    const marketCap = priceData[`${vsCurrency}_market_cap`];

    const changeEmoji = change24h >= 0 ? "📈" : "📉";
    const changeColor = change24h >= 0 ? "+" : "";

    return (
      `💰 ${tokenSymbol.toUpperCase()} Price Analysis\n` +
      `💵 Current Price: $${price.toLocaleString()}\n` +
      `${changeEmoji} 24h Change: ${changeColor}${change24h.toFixed(2)}%\n` +
      `🏪 Market Cap: $${marketCap ? marketCap.toLocaleString() : "N/A"}\n` +
      `📊 Data from CoinGecko`
    );
  } catch (error) {
    console.error("Token price error:", error);
    return `❌ Failed to get price for ${tokenSymbol}: ${error instanceof Error ? error.message : "Unknown error"}`;
  }
};

/**
 * Get comprehensive market data for multiple tokens
 */
export const getMarketData = async ({
  tokens = ["ethereum", "bitcoin", "matic-network"],
  limit = 10,
}: {
  tokens?: string[];
  limit?: number;
}): Promise<string> => {
  try {
    const response = await axios.get(
      `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${limit}&page=1&sparkline=false&price_change_percentage=1h%2C24h%2C7d`,
      { timeout: 15000 }
    );

    const marketData = response.data;

    let report = "📊 Crypto Market Overview\n\n";

    marketData.forEach((coin: any, index: number) => {
      const change24h = coin.price_change_percentage_24h || 0;
      const change7d = coin.price_change_percentage_7d_in_currency || 0;
      const changeEmoji = change24h >= 0 ? "📈" : "📉";

      report += `${index + 1}. ${coin.symbol.toUpperCase()} (${coin.name})\n`;
      report += `   💵 $${coin.current_price.toLocaleString()}\n`;
      report += `   ${changeEmoji} 24h: ${change24h.toFixed(2)}% | 7d: ${change7d.toFixed(2)}%\n`;
      report += `   🏪 MCap: $${(coin.market_cap / 1e9).toFixed(2)}B\n\n`;
    });

    // Calculate market sentiment
    const positiveCoins = marketData.filter(
      (coin: any) => (coin.price_change_percentage_24h || 0) > 0
    ).length;
    const totalCoins = marketData.length;
    const sentimentPercentage = ((positiveCoins / totalCoins) * 100).toFixed(1);

    report += `🌡️ Market Sentiment: ${sentimentPercentage}% bullish (${positiveCoins}/${totalCoins} coins up)\n`;

    if (parseFloat(sentimentPercentage) > 60) {
      report += "✅ Overall market trend: BULLISH";
    } else if (parseFloat(sentimentPercentage) > 40) {
      report += "⚠️ Overall market trend: NEUTRAL";
    } else {
      report += "❌ Overall market trend: BEARISH";
    }

    return report;
  } catch (error) {
    console.error("Market data error:", error);
    return `❌ Failed to get market data: ${error instanceof Error ? error.message : "Unknown error"}`;
  }
};

/**
 * Analyze market trends and provide trading insights
 */
export const analyzeMarketTrends = async ({
  timeframe = "24h",
  focusTokens = ["ethereum", "bitcoin"],
}: {
  timeframe?: string;
  focusTokens?: string[];
}): Promise<string> => {
  try {
    let analysis = `🔍 Market Trend Analysis (${timeframe})\n\n`;

    // Get global market data
    const globalResponse = await axios.get(
      "https://api.coingecko.com/api/v3/global",
      { timeout: 10000 }
    );

    const globalData = globalResponse.data.data;
    const marketCapChange = globalData.market_cap_change_percentage_24h_usd;
    const btcDominance = globalData.market_cap_percentage.btc;
    const ethDominance = globalData.market_cap_percentage.eth;

    analysis += `🌍 Global Market Metrics:\n`;
    analysis += `📊 Total Market Cap Change: ${marketCapChange.toFixed(2)}%\n`;
    analysis += `₿ Bitcoin Dominance: ${btcDominance.toFixed(2)}%\n`;
    analysis += `⟠ Ethereum Dominance: ${ethDominance.toFixed(2)}%\n\n`;

    // Analyze specific tokens
    for (const token of focusTokens) {
      const tokenResponse = await axios.get(
        `https://api.coingecko.com/api/v3/coins/${token}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false`,
        { timeout: 10000 }
      );

      const tokenData = tokenResponse.data;
      const price = tokenData.market_data.current_price.usd;
      const change24h = tokenData.market_data.price_change_percentage_24h;
      const change7d = tokenData.market_data.price_change_percentage_7d;
      const volume24h = tokenData.market_data.total_volume.usd;
      const marketCap = tokenData.market_data.market_cap.usd;

      analysis += `${tokenData.symbol.toUpperCase()} Analysis:\n`;
      analysis += `💰 Price: $${price.toLocaleString()}\n`;
      analysis += `📈 24h: ${change24h.toFixed(2)}% | 7d: ${change7d.toFixed(2)}%\n`;
      analysis += `📊 Volume: $${(volume24h / 1e9).toFixed(2)}B\n`;

      // Simple trend analysis
      if (change24h > 5 && change7d > 10) {
        analysis += `🚀 Trend: STRONG BULLISH\n`;
      } else if (change24h > 2 && change7d > 5) {
        analysis += `📈 Trend: BULLISH\n`;
      } else if (change24h < -5 && change7d < -10) {
        analysis += `📉 Trend: STRONG BEARISH\n`;
      } else if (change24h < -2 && change7d < -5) {
        analysis += `📉 Trend: BEARISH\n`;
      } else {
        analysis += `➡️ Trend: SIDEWAYS/CONSOLIDATING\n`;
      }

      analysis += `\n`;
    }

    // Trading recommendations
    analysis += `💡 Trading Insights:\n`;

    if (marketCapChange > 3) {
      analysis += `✅ Strong market momentum - Consider long positions\n`;
    } else if (marketCapChange < -3) {
      analysis += `❌ Market weakness - Consider short positions or cash\n`;
    } else {
      analysis += `⚠️ Sideways market - Range trading or wait for breakout\n`;
    }

    if (btcDominance > 45) {
      analysis += `₿ High BTC dominance - Bitcoin leading, altcoins may lag\n`;
    } else if (btcDominance < 40) {
      analysis += `🔄 Low BTC dominance - Altcoin season potential\n`;
    }

    return analysis;
  } catch (error) {
    console.error("Market analysis error:", error);
    return `❌ Failed to analyze market trends: ${error instanceof Error ? error.message : "Unknown error"}`;
  }
};

// Metadata for LangChain tools
export const getTokenPriceMetadata = {
  name: "getTokenPrice",
  description: "Get current price and 24h change for any cryptocurrency token",
  schema: z.object({
    tokenSymbol: z.string().describe("Token symbol (e.g., ETH, BTC, MATIC)"),
    vsCurrency: z
      .string()
      .optional()
      .describe("Currency to quote price in (default: usd)"),
  }),
};

export const getMarketDataMetadata = {
  name: "getMarketData",
  description:
    "Get comprehensive market data for top cryptocurrencies including prices, changes, and market sentiment",
  schema: z.object({
    tokens: z
      .array(z.string())
      .optional()
      .describe("Specific tokens to analyze (CoinGecko IDs)"),
    limit: z
      .number()
      .optional()
      .describe("Number of top coins to analyze (default: 10)"),
  }),
};

export const analyzeMarketTrendsMetadata = {
  name: "analyzeMarketTrends",
  description:
    "Perform comprehensive market trend analysis with trading insights and recommendations",
  schema: z.object({
    timeframe: z
      .string()
      .optional()
      .describe("Analysis timeframe (default: 24h)"),
    focusTokens: z
      .array(z.string())
      .optional()
      .describe("Specific tokens to focus on (default: ETH, BTC)"),
  }),
};
