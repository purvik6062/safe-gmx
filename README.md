# 🤖 AI Agent API Signal Trader

**AI-Powered Autonomous Trading System with Safe Multi-Signature Wallets**

A sophisticated trading platform that processes trading signals via API and executes trades using AI decision-making across multiple blockchain networks. Built with Safe multi-signature wallets for security and LangChain for intelligent trading decisions.

![AI Trading](https://img.shields.io/badge/AI-Powered%20Trading-blue)
![Safe Wallets](https://img.shields.io/badge/Safe%20Multi-Sig-green)
![Multi-Chain](https://img.shields.io/badge/Multi-Chain%20Support-orange)
![Real-Time](https://img.shields.io/badge/Real-Time%20Processing-red)

## 🚀 Key Features

### 🧠 **AI-Powered Decision Making**

- **Intelligent Signal Analysis**: AI evaluates every trading signal before execution
- **Risk Assessment**: Dynamic position sizing and risk management
- **Market Context**: Real-time market analysis for informed decisions
- **Autonomous Trading**: AI can make independent trading decisions

### 🛡️ **Safe Multi-Signature Security**

- **1-of-2 Multisig**: User + AI Agent ownership for secure trading
- **Multi-Chain Support**: Safes deployed across 7 blockchain networks
- **Secure Execution**: All trades require Safe transaction approval
- **User Control**: Users maintain full control over their funds

### 🔄 **API-Based Signal Processing**

- **Direct API Integration**: Receive signals via REST API endpoints
- **Real-Time Processing**: Instant signal processing without database delays
- **Flexible Signal Format**: Support for customizable signal structures
- **WebSocket Updates**: Real-time trade notifications

### 🌐 **Multi-Chain Trading**

- **7 Supported Networks**: Ethereum, Arbitrum, Polygon, Base, Optimism, Sepolia
- **Automatic Network Selection**: Based on token availability and user Safes
- **Gas Optimization**: Network-specific pricing strategies
- **Cross-Chain Compatibility**: Seamless trading across different networks

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    AI Agent API Signal Trader                  │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
                    ┌─────────────────────┐
                    │   API Endpoint      │
                    │  /api/signal/process │
                    └─────────────────────┘
                                │
                                ▼
                    ┌─────────────────────┐
                    │ ApiSignalProcessor  │
                    │ • Validation        │
                    │ • Processing        │
                    │ • Error Handling    │
                    └─────────────────────┘
                                │
                                ▼
                    ┌─────────────────────┐
                    │ AI Analysis Engine  │
                    │ • Signal Evaluation │
                    │ • Risk Assessment   │
                    │ • Market Context    │
                    └─────────────────────┘
                                │
                                ▼
                    ┌─────────────────────┐
                    │ Trade Execution     │
                    │ • Safe Integration  │
                    │ • Multi-chain       │
                    │ • Gas Optimization  │
                    └─────────────────────┘
```

## 📋 Signal Format

The API accepts signals in this format:

```json
{
  "Signal Message": "buy",
  "Token Mentioned": "VIRTUAL",
  "TP1": 1.475,
  "TP2": 1.5,
  "SL": 1.46,
  "Current Price": 1.47,
  "Max Exit Time": { "$date": "2025-07-10T11:20:29.000Z" },
  "username": "abhidavinci",
  "safeAddress": "0x1234567890abcdef1234567890abcdef12345678"
}
```

## 🔧 Installation

### Prerequisites

- **Node.js 18+**
- **MongoDB** for user data storage
- **Redis** (optional) for caching and queues
- **Safe wallet deployment** on target networks
- **OpenAI API key** for AI decision-making

### Quick Start

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd safe-gmx
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure environment**

   ```bash
   cp env.example .env
   # Edit .env with your configuration
   ```

4. **Start the server**

   ```bash
   # Development mode
   npm run dev

   # Production mode
   npm run build
   npm start
   ```

## ⚙️ Configuration

### Environment Variables

```bash
# AI Configuration
OPENAI_API_KEY=sk-your-openai-api-key
AGENT_PRIVATE_KEY=0x-your-agent-private-key
AGENT_ADDRESS=0x-your-agent-address

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/ai-trading-agent
REDIS_URL=redis://localhost:6379
REDIS_ENABLED=true

# Safe Configuration
SAFE_DEPLOYMENT_URI=mongodb://localhost:27017/safe-deployment-service
SAFE_DEPLOYMENT_DB=safe-deployment-service
SAFE_COLLECTION=safes

# Trading Configuration
DEFAULT_POSITION_SIZE_USD=100
MAX_DAILY_TRADES=20
DEFAULT_SLIPPAGE=1
RISK_PER_TRADE=2
STOP_LOSS_THRESHOLD=5
```

### Trading Parameters

```javascript
{
  positionSizeUsd: 100,        // Default position size in USD
  maxDailyTrades: 20,          // Maximum trades per day
  enableTrailingStop: true,    // Enable trailing stop loss
  trailingStopRetracement: 2,  // Trailing stop percentage
  defaultSlippage: 1,          // Default slippage percentage
  gasBuffer: 20                // Gas buffer percentage
}
```

## 🔌 API Endpoints

### Signal Processing

#### `POST /api/signal/process`

Process a trading signal through the AI agent.

**Request:**

```json
{
  "Signal Message": "buy",
  "Token Mentioned": "VIRTUAL",
  "TP1": 1.475,
  "TP2": 1.5,
  "SL": 1.46,
  "Current Price": 1.47,
  "Max Exit Time": { "$date": "2025-07-10T11:20:29.000Z" },
  "username": "abhidavinci",
  "safeAddress": "0x1234567890abcdef1234567890abcdef12345678"
}
```

**Response:**

```json
{
  "success": true,
  "signalId": "550e8400-e29b-41d4-a716-446655440000",
  "status": "success",
  "result": {
    "signalId": "550e8400-e29b-41d4-a716-446655440000",
    "tradingPair": {
      "userId": "abhidavinci",
      "tradeId": "550e8400-e29b-41d4-a716-446655440000_abhidavinci",
      "safeAddress": "0x1234567890abcdef1234567890abcdef12345678",
      "networkKey": "arbitrum",
      "status": "success"
    },
    "status": "success"
  },
  "timestamp": "2025-01-27T10:30:00.000Z"
}
```

### AI Agent Control

#### `POST /api/agentic/start`

Start AI-powered autonomous trading.

```bash
curl -X POST http://localhost:3001/api/agentic/start \
  -H "Content-Type: application/json" \
  -d '{"enabled": true, "debug": false}'
```

#### `POST /api/agentic/stop`

Stop AI autonomous trading.

```bash
curl -X POST http://localhost:3001/api/agentic/stop
```

#### `GET /api/agentic/status`

Get AI trading system status.

```bash
curl http://localhost:3001/api/agentic/status
```

### Status Monitoring

#### `GET /api/signal/status`

Get signal processor status.

```json
{
  "success": true,
  "status": {
    "isActive": true,
    "processingQueue": 0,
    "activeTrades": 3,
    "monitoredTrades": 5,
    "lastProcessed": "2025-01-27T10:30:00.000Z"
  },
  "timestamp": "2025-01-27T10:30:00.000Z"
}
```

### Health Check

#### `GET /health`

Server health and status check.

```json
{
  "status": "healthy",
  "timestamp": "2025-01-27T10:30:00.000Z",
  "uptime": 3600,
  "agent": {
    "initialized": true,
    "status": "ready"
  },
  "database": {
    "mongo": "connected",
    "redis": "connected"
  }
}
```

## 🌐 Supported Networks

| Network          | Chain ID | RPC URL                                       | Status |
| ---------------- | -------- | --------------------------------------------- | ------ |
| Ethereum         | 1        | `https://mainnet.infura.io/v3/YOUR_KEY`       | ✅     |
| Arbitrum         | 42161    | `https://arb1.arbitrum.io/rpc`                | ✅     |
| Polygon          | 137      | `https://polygon-rpc.com`                     | ✅     |
| Base             | 8453     | `https://mainnet.base.org`                    | ✅     |
| Optimism         | 10       | `https://mainnet.optimism.io`                 | ✅     |
| Sepolia          | 11155111 | `https://ethereum-sepolia-rpc.publicnode.com` | ✅     |
| Arbitrum Sepolia | 421614   | `https://sepolia-rollup.arbitrum.io/rpc`      | ✅     |

## 🛡️ Security Features

### Signal Validation

- **Schema Validation**: Strict validation of signal format
- **User Verification**: Validation of user and safe address mapping
- **Price Validation**: Sanity checks on price and target levels
- **Rate Limiting**: Protection against spam and abuse

### Safe Integration

- **Multisig Security**: All trades require user or AI agent approval
- **Network Validation**: Verification of safe deployment on target network
- **Gas Estimation**: Pre-execution gas cost estimation
- **Transaction Simulation**: Dry-run execution before actual trade

## 📊 Trading Flow

### 1. Signal Reception

```
📡 API Signal Received
    ↓
✅ Validate Signal Format
    ↓
🔍 Detect Token Chain
    ↓
🔐 Validate Safe Deployment
    ↓
💰 Check USDC Availability
    ↓
📊 Calculate Position Size (20% of balance)
    ↓
💱 Execute Trade
    ↓
🎉 Success!
```

### 2. AI Decision Making

- **Signal Analysis**: AI evaluates signal validity and risk
- **Market Context**: Real-time market data integration
- **Position Sizing**: Dynamic calculation based on balance
- **Risk Assessment**: Intelligent risk management

### 3. Trade Execution

- **Safe Transaction**: Multi-signature wallet execution
- **DEX Aggregation**: 0x Protocol for optimal routing
- **Gas Optimization**: Network-specific gas strategies
- **Transaction Monitoring**: Real-time status tracking

## 🧪 Testing

### Test Signal Processing

```bash
curl -X POST http://localhost:3001/api/signal/process \
  -H "Content-Type: application/json" \
  -d '{
    "Signal Message": "buy",
    "Token Mentioned": "VIRTUAL",
    "TP1": 1.475,
    "TP2": 1.5,
    "SL": 1.46,
    "Current Price": 1.47,
    "Max Exit Time": {"$date": "2025-07-10T11:20:29.000Z"},
    "username": "abhidavinci",
    "safeAddress": "0x1234567890abcdef1234567890abcdef12345678"
  }'
```

### Test AI Agent

```bash
# Start AI trading
curl -X POST http://localhost:3001/api/agentic/start

# Check status
curl http://localhost:3001/api/agentic/status

# Stop AI trading
curl -X POST http://localhost:3001/api/agentic/stop
```

## 📈 Performance Optimization

### API Response Times

- **Signal Processing**: < 2 seconds average
- **AI Analysis**: < 5 seconds average
- **Trade Execution**: < 10 seconds average

### Scalability

- **Concurrent Signals**: Handles 100+ concurrent signal processing
- **Database Connections**: Connection pooling for optimal performance
- **Memory Usage**: Efficient memory management with garbage collection

## 🚨 Troubleshooting

### Common Issues

1. **Signal Processing Failures**
   - Check signal format validation
   - Verify user and safe address mapping
   - Ensure AI agent is initialized

2. **Database Connection Issues**
   - Verify MongoDB and Redis connectivity
   - Check connection strings in environment variables
   - Ensure database services are running

3. **Trade Execution Failures**
   - Verify safe deployment status
   - Check network RPC endpoints
   - Ensure sufficient gas funds

### Debug Mode

Enable debug logging by setting:

```bash
NODE_ENV=development
DEBUG=true
```

## 📚 Documentation

### Additional Guides

- **[AUTONOMOUS-TRADING-GUIDE.md](./AUTONOMOUS-TRADING-GUIDE.md)**: Advanced autonomous trading features
- **[ENHANCED-TRADING-FLOW.md](./ENHANCED-TRADING-FLOW.md)**: Detailed trading flow explanation
- **[SAFE-SDK-INTEGRATION.md](./SAFE-SDK-INTEGRATION.md)**: Safe wallet integration details

### WebSocket Events

The system emits real-time events via WebSocket:

```javascript
// Connect to WebSocket
const socket = io("http://localhost:3001");

// Listen for signal processing events
socket.on("signal-processed", (data) => {
  console.log("Signal processed:", data);
});

// Listen for trade execution events
socket.on("trade-executed", (data) => {
  console.log("Trade executed:", data);
});
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📞 Support

For support and questions:

- Create an issue in the GitHub repository
- Check the troubleshooting section
- Review the API documentation

## ⚠️ Important Notes

### Security Considerations

- **Test Thoroughly**: Always test in development environment before production
- **Risk Management**: Implement proper risk controls for autonomous trading
- **User Consent**: Ensure users understand autonomous trading risks
- **Fund Limits**: Set appropriate position size limits

### Production Deployment

- **Environment Variables**: Use secure environment variable management
- **Database Security**: Implement proper database access controls
- **Network Security**: Use HTTPS and proper firewall rules
- **Monitoring**: Implement comprehensive logging and monitoring

---

**🚀 Ready to start AI-powered autonomous trading with Safe multi-signature security!**

_Built with ❤️ using TypeScript, Node.js, Safe SDK, and OpenAI_
