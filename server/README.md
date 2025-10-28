# Pump Guard Server

Pump Guard is a Solana token risk analysis API that scans Pumpfun and Pumpswap tokens to detect potential risks based on holder wallet analysis.

## Features

- 🔍 **Token Scanning** - Analyzes top 50 token holders on Solana
- 🎯 **Risk Metrics** - Calculates multiple risk indicators:
  - Total Native Balance (SOL holdings of top holders)
  - Fresh Wallets Concentration (wallets < 7 days old)
  - Zero-SOL Holders (holders with minimal SOL balance)
- ⚡ **Redis Caching** - Intelligent caching system:
  - Token scan results cached for 60 seconds
  - Wallet creation data cached for 24 hours
- 🛡️ **Rate Limiting** - Multi-layer protection:
  - 2 requests per second
  - 5 requests per 15 seconds
  - 10 requests per minute
- 🔒 **Security** - Helmet, CORS, validation with Zod

## Tech Stack

- **Runtime**: Node.js + TypeScript
- **Framework**: Express.js 5
- **Blockchain**: @solana/web3.js
- **Cache**: Redis (ioredis)
- **Validation**: Zod
- **Time**: moment-timezone
- **HTTP Client**: Axios (DexScreener API)
- **Security**: helmet, cors, express-rate-limit

## Prerequisites

- Node.js 18+
- Redis server
- Solana RPC endpoint

## Installation

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Edit .env with your configuration
```

## Environment Variables

```env
# Server Configuration
PORT=3001
NODE_ENV=development

# Redis Configuration
REDIS_URL=redis://localhost:6379

# Solana RPC Configuration
RPC_URL=https://your-rpc-endpoint.com

# DexScreener API
DEXSCREENER_API_URL=https://api.dexscreener.com

# Cache TTL (seconds)
CACHE_TTL_RISK_SCORE=60           # Token scan cache: 60 seconds
CACHE_TTL_WALLETS_CREATION=86400  # Wallet data cache: 24 hours
```

## Running the Server

```bash
# Development mode (auto-reload)
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## API Endpoints

### Health Check

```http
GET /api/health
```

**Response:**
```json
{
  "success": true,
  "message": "Service is healthy",
  "data": {
    "timestamp": 1234567890
  }
}
```

### Scan Token

```http
GET /api/scanner/scan/:tokenAddress
```

**Parameters:**
- `tokenAddress` (required) - Solana token address

**Response:**
```json
{
  "success": true,
  "message": "Token scan completed",
  "data": {
    "tokenAddress": "7GCihgDB8fe6KNjn2MYtkzZcRjQy3t9GHdC8uHYmW2hr",
    "tokenInfo": {
      "name": "BONK",
      "symbol": "BONK",
      "pairAddress": "...",
      "priceUsd": "0.00001234",
      "marketCap": 12345678,
      "pairCreatedAt": 1234567890
    },
    "metrics": {
      "totalNativeBalance": {
        "value": 1500.5,
        "score": 75.03,
        "type": "positive",
        "thresholds": {
          "low": 1000,
          "medium": 500,
          "high": 0
        }
      },
      "freshWalletsConcentration": {
        "value": 12,
        "score": 76.0,
        "type": "negative",
        "thresholds": {
          "low": 15,
          "medium": 25,
          "high": 40
        }
      },
      "zeroSolHolders": {
        "value": 8,
        "score": 84.0,
        "type": "negative",
        "thresholds": {
          "low": 5,
          "medium": 15,
          "high": 25
        }
      }
    },
    "overallScore": 78.34,
    "riskLevel": "low",
    "scannedAt": 1234567890
  }
}
```

**Error Response (Rate Limit):**
```json
{
  "success": false,
  "message": "Too many requests, max 2 per second",
  "data": null
}
```

**Error Response (Invalid Token):**
```json
{
  "success": false,
  "message": "Only Pumpfun and Pumpswap tokens on Solana are supported",
  "data": null
}
```

## Risk Scoring Algorithm

### Overall Score Calculation

The overall risk score (0-100, higher is better) is calculated using weighted averages:

```typescript
weights = {
  totalNativeBalance: 1.0,
  freshWalletsConcentration: 2.0,
  zeroSolHolders: 1.5
}

overallScore = (
  totalNativeBalance.score × 1.0 +
  freshWalletsConcentration.score × 2.0 +
  zeroSolHolders.score × 1.5
) / 4.5
```

### Risk Levels

- **Low Risk**: Score ≥ 70
- **Medium Risk**: 40 ≤ Score < 70
- **High Risk**: Score < 40

### Individual Metrics

#### 1. Total Native Balance
Measures the total SOL holdings of the top 50 token holders.

- **Type**: Positive (higher is better)
- **Calculation**: `score = min((totalSOL / 2000) × 100, 100)`
- **Thresholds**:
  - Low risk: ≥ 1000 SOL
  - Medium risk: ≥ 500 SOL
  - High risk: < 500 SOL

#### 2. Fresh Wallets Concentration
Counts wallets created within the last 7 days among top 50 holders.

- **Type**: Negative (lower is better)
- **Calculation**: `score = max(100 - freshWalletCount × 2, 0)`
- **Thresholds**:
  - Low risk: ≤ 15 fresh wallets
  - Medium risk: ≤ 25 fresh wallets
  - High risk: > 25 fresh wallets

#### 3. Zero-SOL Holders
Counts holders with less than 0.01 SOL balance.

- **Type**: Negative (lower is better)
- **Calculation**: `score = max(100 - zeroSolCount × 2, 0)`
- **Thresholds**:
  - Low risk: ≤ 5 holders
  - Medium risk: ≤ 15 holders
  - High risk: > 15 holders

## Caching Strategy

### Token Scan Results
- **Key Pattern**: `token:scan:{tokenAddress}`
- **TTL**: 60 seconds
- **Purpose**: Reduce load on Solana RPC and DexScreener API

### Wallet Creation Data
- **Key Pattern**: `wallet:creation:{walletAddress}`
- **TTL**: 24 hours (86400 seconds)
- **Purpose**: Cache wallet age checks (oldest transaction lookup)
- **Data Stored**:
  ```typescript
  {
    createdAt: number,  // Unix timestamp (seconds)
    isFresh: boolean    // true if wallet < 7 days old
  }
  ```

## Project Structure

```
server/
├── src/
│   ├── config/
│   │   └── env.ts                    # Environment validation (Zod)
│   ├── controllers/
│   │   └── scanner.controller.ts     # Request handlers
│   ├── services/
│   │   ├── cache.service.ts          # Redis caching
│   │   ├── dexscreener.service.ts    # DexScreener API client
│   │   ├── risk.service.ts           # Risk calculation algorithms
│   │   └── solana.service.ts         # Solana RPC connection
│   ├── routes/
│   │   ├── index.ts                  # Route aggregator
│   │   ├── health.routes.ts          # Health check endpoint
│   │   └── scanner.routes.ts         # Scanner endpoints
│   ├── middleware/
│   │   └── validate.ts               # Zod validation middleware
│   ├── utils/
│   │   ├── response.ts               # sendSuccess/sendError helpers
│   │   └── validators.ts             # Zod schemas
│   └── index.ts                      # Express app entry point
├── .env                              # Environment variables (git-ignored)
├── .env.example                      # Environment template
├── package.json
├── tsconfig.json
└── README.md
```

## Code Patterns

### Response Format

All responses use standardized format:

```typescript
import { sendSuccess, sendError } from "~/utils/response";

// Success
return sendSuccess(res, "Token scan completed", data);

// Error
return sendError(res, "Token not found", 404);
```

### Timestamps

Always use `moment.utc().unix()` for Unix timestamps (seconds):

```typescript
import moment from "moment-timezone";

const timestamp = moment.utc().unix(); // ✅ Correct
const timestamp = Date.now();          // ❌ Wrong
```

### Path Aliases

Use `~/` for imports (configured in tsconfig.json):

```typescript
import { env } from "~/config/env";           // ✅ Correct
import { env } from "../config/env";          // ❌ Wrong
```

### Validation

Use Zod schemas with validation middleware:

```typescript
import { validateParams } from "~/middleware/validate";
import { scanTokenParamsSchema } from "~/utils/validators";

router.get(
  "/scan/:tokenAddress",
  validateParams(scanTokenParamsSchema),
  scanToken
);
```

## Rate Limiting Details

The API implements three concurrent rate limiters (all must pass):

```typescript
// Layer 1: Per-second limit
windowMs: 1000ms, max: 2 requests

// Layer 2: Per-15-seconds limit
windowMs: 15000ms, max: 5 requests

// Layer 3: Per-minute limit
windowMs: 60000ms, max: 10 requests
```

When a limit is exceeded, the API returns:
- Status: `429 Too Many Requests`
- Standard error response format

## Development Guidelines

### Critical Rules

1. **Timestamps**: Always use `moment.utc().unix()` (Unix seconds)
2. **Response Format**: Always use `sendSuccess()` or `sendError()`
3. **Imports**: Always use `~/` path alias
4. **Comments**: Minimal - code should be self-explanatory
5. **Language**: All code, comments, and variables in English

### Adding New Routes

1. Create route file in `routes/`
2. Add controller in `controllers/`
3. Add validation schema in `utils/validators.ts`
4. Register route in `routes/index.ts`

### Adding New Services

1. Create service file in `services/`
2. Export singleton instance
3. Import using `~/services/...`

## Error Handling

All errors return standard format:

```json
{
  "success": false,
  "message": "Error description",
  "data": null
}
```

Common error codes:
- `400` - Bad Request (validation failed, unsupported token)
- `404` - Not Found (token not found)
- `429` - Too Many Requests (rate limit exceeded)
- `500` - Internal Server Error

## Performance Considerations

- Top 50 holders analyzed per scan
- Redis caching reduces RPC calls by ~95%
- Rate limiting prevents abuse
- Parallel processing of wallet data
- Token account filtering at RPC level

## Supported Tokens

- **Chain**: Solana only
- **DEX**: Pumpfun and Pumpswap only
- **Validation**: Automatic via DexScreener API

## Future Enhancements

- [ ] Support for additional DEXes
- [ ] Historical risk score tracking
- [ ] Webhook notifications
- [ ] WebSocket real-time updates
- [ ] Advanced holder pattern detection
- [ ] Multi-chain support

## License

ISC

## Contributing

See the main monorepo README for contribution guidelines.
