# 🤖 AI Trading Agent - TypeScript Implementation

A sophisticated AI-powered trading agent built with LangChain that autonomously manages cryptocurrency trades using Safe smart wallets. This implementation follows the [Safe AI Agent tutorial](https://docs.safe.global/home/ai-agent-setup) architecture while providing advanced trading capabilities.

## 🏗️ Architecture Overview

This agent uses the **createReactAgent** pattern from LangChain, where the AI decides which tools to call based on the trading context and market conditions.

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   AI Agent      │    │   Tool Router   │    │   Safe Wallets  │
│   (GPT-4)       │◄──►│   (LangChain)   │◄──►│   (Multi-chain) │
└─────────────────┘    └─────────────────┘    └─────────────────┘
        │                       │                       │
        ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│ Market Analysis │    │ Risk Assessment │    │ Portfolio Mgmt  │
│ • Price Data    │    │ • Strategy Risk │    │ • P&L Tracking  │
│ • Trends        │    │ • Position Size │    │ • Rebalancing   │
│ • Sentiment     │    │ • Gas Costs     │    │ • Monitoring    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🛠️ Tool Categories

### 🏦 Safe Management (`tools/safe.ts`)

- **getEthBalance**: Check ETH balance across multiple chains
- **deploySafeForTrading**: Deploy 1-of-2 multisig Safe (User + AI Agent)
- **executeTokenSwap**: Execute token swaps through Safe
- **getSafeInfo**: Get comprehensive Safe information

### 📊 Market Analysis (`tools/market.ts`)

- **getTokenPrice**: Real-time token prices from CoinGecko
- **getMarketData**: Comprehensive market overview
- **analyzeMarketTrends**: AI-powered trend analysis with insights

### 💱 Trading Strategy (`tools/trading.ts`)

- **calculateTradeSize**: Risk-based position sizing
- **assessRisk**: Multi-factor risk assessment
- **optimizeGas**: Gas cost optimization strategies

### 📈 Portfolio Management (`tools/portfolio.ts`)

- **monitorPositions**: Real-time portfolio monitoring
- **checkProfitLoss**: P&L analysis with trade breakdown
- **rebalancePortfolio**: Automated portfolio rebalancing

## 🚀 Quick Start

### 1. Installation

```bash
cd agent-backend
npm install
```

### 2. Environment Setup

Copy the environment template:

```bash
cp src/env.example .env
```

Configure your environment variables:

```env
# AI Configuration
OPENAI_API_KEY=sk-your-openai-api-key
AGENT_PRIVATE_KEY=0x-your-agent-private-key
AGENT_ADDRESS=0x-your-agent-address

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/ai-trading-agent
REDIS_URL=redis://localhost:6379
```

### 3. Development

Start the development server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
npm start
```

## 💡 Usage Examples

### Command Line Interface

```bash
# Market analysis
npm run agent

# Portfolio analysis for specific user
npm run agent analyze user123

# Manual trading instruction
npm run agent trade "Swap 0.1 ETH to USDC with 1% slippage"

# Start autonomous trading
npm run agent auto user123 dca momentum
```

### HTTP API Endpoints

#### Analyze Market Conditions

```bash
curl -X POST http://localhost:3001/api/agent/analyze \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Analyze current ETH market conditions and recommend trades"}'
```

#### Execute Manual Trade

```bash
curl -X POST http://localhost:3001/api/agent/trade \
  -H "Content-Type: application/json" \
  -d '{"instruction": "Buy 0.5 ETH if price drops below $2000"}'
```

#### Start Autonomous Trading

```bash
curl -X POST http://localhost:3001/api/agent/start-autonomous \
  -H "Content-Type: application/json" \
  -d '{"userId": "user123", "strategies": ["dca", "momentum"]}'
```

### WebSocket Real-time Updates

```javascript
const socket = io("http://localhost:3001");

// Join user room for personalized updates
socket.emit("join-user-room", "user123");

// Listen for trading updates
socket.on("trade-executed", (data) => {
  console.log("Trade executed:", data);
});

// Request market analysis
socket.emit("request-market-analysis");
socket.on("market-analysis", (data) => {
  console.log("Market analysis:", data.analysis);
});
```

## 🤖 AI Decision Making

The agent uses **createReactAgent** from LangChain, which follows this decision-making process:

1. **Analyze Input**: Understand the trading request or market condition
2. **Tool Selection**: Choose appropriate tools based on context
3. **Execute Tools**: Run selected tools to gather data
4. **Reasoning**: Analyze results and make informed decisions
5. **Action**: Execute trades or provide recommendations

### Example Decision Flow

```
User: "Should I buy ETH now?"

Agent Thought Process:
1. 🔍 Calls getTokenPrice("ETH") → Gets current ETH price
2. 📊 Calls analyzeMarketTrends() → Analyzes market conditions
3. ⚖️ Calls assessRisk("momentum", "bullish") → Evaluates risk
4. 💭 Reasons about all data points
5. 📋 Provides recommendation with reasoning

Result: "Based on current analysis, ETH is showing bullish momentum
at $2,340 (+3.2% today). Risk assessment shows MODERATE risk.
Recommendation: Consider buying with 2% position size and 5% stop loss."
```

## 🔧 Configuration

### Trading Parameters

```env
DEFAULT_SLIPPAGE=1          # 1% default slippage
RISK_PER_TRADE=2           # 2% risk per trade
STOP_LOSS_THRESHOLD=5      # 5% stop loss
MAX_POSITION_SIZE=10000    # $10k max position
```

### Risk Management

```env
MAX_DAILY_TRADES=20        # Max 20 trades per day
MAX_DAILY_LOSS=500         # Max $500 loss per day
EMERGENCY_STOP_LOSS=10     # 10% emergency stop
```

### Supported Networks

- **Arbitrum** (Primary) - Low fees, fast execution
- **Polygon** - Ultra-low fees
- **Base** - Coinbase L2
- **Ethereum** - Mainnet (higher fees)
- **Sepolia** - Testnet

## 📊 Monitoring & Analytics

### Health Check

```bash
curl http://localhost:3001/health
```

Response:

```json
{
  "status": "healthy",
  "agent": { "initialized": true, "running": false },
  "database": { "mongo": "connected", "redis": "connected" }
}
```

### Performance Metrics

- **Win Rate**: Percentage of profitable trades
- **Sharpe Ratio**: Risk-adjusted returns
- **Max Drawdown**: Largest portfolio decline
- **Daily P&L**: Day-over-day performance

## 🔐 Security Features

### Safe Integration

- **1-of-2 Multisig**: User + AI Agent ownership
- **Autonomous Execution**: Agent can trade independently
- **User Override**: Users maintain full control

### Risk Controls

- **Position Limits**: Maximum position sizes
- **Stop Losses**: Automatic loss prevention
- **Daily Limits**: Trade frequency and loss caps
- **Emergency Stops**: Circuit breakers for market crashes

## 🚀 Production Deployment

### Docker Setup

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
EXPOSE 3001
CMD ["npm", "start"]
```

### Environment Variables

Ensure all production environment variables are configured:

- OpenAI API key with sufficient credits
- Agent wallet with trading funds
- Database connections (MongoDB + Redis)
- Safe API keys for transaction services

### Monitoring

- Use health check endpoint for uptime monitoring
- Monitor logs for trading decisions and errors
- Set up alerts for unusual trading activity
- Track performance metrics and P&L

## 🤝 Integration with Safe Backend

This AI Agent integrates seamlessly with the Safe Backend service:

1. **Safe Deployment**: AI can request Safe deployment via Safe Backend APIs
2. **Transaction Execution**: Uses Safe Backend for complex multi-sig operations
3. **Portfolio Sync**: Shares portfolio data between services
4. **User Management**: Coordinated user session management

## 📚 Additional Resources

- [Safe AI Agent Tutorial](https://docs.safe.global/home/ai-agent-setup)
- [LangChain Documentation](https://langchain.readthedocs.io/)
- [Safe Protocol Kit](https://docs.safe.global/sdk/protocol-kit)
- [Trading Strategy Guides](../AI-TRADING-GUIDE.md)

## 🆘 Troubleshooting

### Common Issues

**Agent not initializing:**

- Check OpenAI API key
- Verify environment variables
- Ensure database connections

**Tools not working:**

- Validate network RPC endpoints
- Check API rate limits
- Verify agent wallet funding

**Trading errors:**

- Confirm Safe deployment
- Check gas settings
- Validate token addresses

## 🏁 Next Steps

1. **Deploy Safe Wallets**: Use Safe Backend to deploy trading Safes
2. **Configure Strategies**: Set up DCA, momentum, or custom strategies
3. **Start Trading**: Begin with small positions and monitor performance
4. **Scale Up**: Increase position sizes as confidence grows
5. **Optimize**: Fine-tune parameters based on performance data

Ready to start autonomous crypto trading with AI! 🚀
