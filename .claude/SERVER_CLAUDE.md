# Pump Guard Server - Claude AI Guidelines

## Critical Rules (MUST Follow)

### 1. Timestamps
- **ALWAYS** use `moment.utc().unix()` for timestamps
- **NEVER** use `Date.now()` or `new Date()`
- All timestamps are Unix UTC seconds (Number type)

### 2. Response Format
- **ALWAYS** use `sendSuccess(res, message, data)` or `sendError(res, message, statusCode)`
- **NEVER** use `res.json()` directly
- Standard format:
```typescript
{
  success: boolean;
  message: string;
  data: T | null;
}
```

### 3. Imports
- **ALWAYS** use `~/` path alias (not `../`)
- Shared types: `@shared/index`
- Example: `import { env } from "~/config/env"`

### 4. Language & Comments
- **ALWAYS** write in English (code, comments, variables)
- **MINIMAL** comments - code should be self-explanatory
- No emojis unless explicitly requested

---

## Project Structure

```
server/src/
├── config/
│   └── env.ts              # Environment validation with Zod
├── controllers/
│   └── scanner.controller.ts
├── services/
│   ├── solana.service.ts    # Solana RPC (just Connection export)
│   ├── dexscreener.service.ts
│   ├── cache.service.ts     # Redis cache singleton (ioredis)
│   ├── risk.service.ts      # Risk calculation algorithms
│   ├── metadata.service.ts  # Token metadata from IPFS (Metaplex)
│   └── socket.service.ts    # Socket.io for real-time events
├── routes/
│   ├── index.ts             # Route aggregator
│   ├── scanner.routes.ts
│   └── health.routes.ts
├── middleware/
│   └── validate.ts          # validateParams, validateQuery, validateBody
├── utils/
│   ├── response.ts          # sendSuccess, sendError
│   └── validators.ts        # Zod schemas
└── index.ts                 # Express app + Socket.io server
```

---

## Tech Stack (Current)

### Confirmed
- **Redis** - ioredis for caching + counters
- **Express.js** + TypeScript
- **Socket.io** - Real-time communication
- **Zod** for validation
- **moment-timezone** for timestamps
- **@solana/web3.js** for Solana
- **@metaplex-foundation/mpl-token-metadata** - Token metadata
- **axios** for DexScreener API
- **helmet, cors, express-rate-limit**

### Not Using
- ~~MongoDB~~ - not implemented
- ~~Mongoose~~ - not implemented
- ~~p-queue~~ - not implemented
- ~~logger libraries~~ - console.log only

---

## API Endpoints

### Current Implementation

**GET /api/health**
- Returns: `{ success: true, message: "Service is healthy", data: { timestamp: ... } }`

**GET /api/scanner/scan/:tokenAddress**
- Validates Solana address (Zod + PublicKey)
- Fetches from DexScreener
- Checks: Solana chain + (Pumpfun OR Pumpswap) only
- Returns: Token info + risk metrics (mock for now)

---

## Code Patterns

### Environment Config
```typescript
// env.ts - uses Zod validation
export const env = parseEnv();

// Usage
import { env } from "~/config/env";
const port = env.PORT;
```

### Validation Middleware
```typescript
// Route params
router.get("/scan/:tokenAddress", validateParams(scanTokenParamsSchema), controller);

// Query params
router.get("/data", validateQuery(querySchema), controller);

// Body
router.post("/data", validateBody(bodySchema), controller);
```

### Response Handlers
```typescript
// Success
return sendSuccess(res, "Token scan completed", data);

// Error
return sendError(res, "Token not found", 404);
```

### Timestamps
```typescript
import moment from "moment-timezone";

const timestamp = moment.utc().unix(); // ✅ CORRECT (Unix seconds)
const timestamp = Date.now(); // ❌ WRONG
```

### Rate Limiting
```typescript
import rateLimit from "express-rate-limit";

// Multiple rate limiters stack together (all must pass)
const perSecondLimiter = rateLimit({
  windowMs: 1000,    // 1 second
  max: 2,            // 2 requests
  message: { success: false, message: "Too many requests, max 2 per second", data: null },
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply to routes
app.use("/api", perSecondLimiter);
app.use("/api", per15SecondsLimiter);
app.use("/api", perMinuteLimiter);
```

### Redis Caching
```typescript
import { cacheService } from "~/services/cache.service";
import { env } from "~/config/env";

// Get from cache
const cached = await cacheService.get<DataType>(cacheKey);
if (cached) return cached;

// Set with TTL (seconds)
const ttl = parseInt(env.CACHE_TTL_WALLETS_CREATION); // 86400 = 24 hours
await cacheService.set(cacheKey, data, ttl);

// Cache key pattern: "wallet:creation:{address}"
```

### DexScreener Integration
```typescript
// Service returns first pair
const tokenData = await dexscreenerService.getTokenData("solana", tokenAddress);

// Controller validates chain + dex
if (tokenData.chainId !== "solana" || !ALLOWED_DEX_IDS.includes(tokenData.dexId)) {
  return sendError(res, "Only Pumpfun and Pumpswap tokens on Solana are supported", 400);
}
```

### Token Metadata (IPFS)
```typescript
import { MetadataService } from "~/services/metadata.service";

const metadataService = new MetadataService();
const tokenImage = await metadataService.getTokenImage(tokenAddress);
```

### Socket.io Real-time Events
```typescript
// Server-side (controller)
import { socketService } from "~/services/socket.service";

const tokensScanned = await cacheService.incrementTokensScanned();
await socketService.emitTokenScanned(tokenAddress, tokensScanned);

// Initialize in index.ts
import { createServer } from "http";
import { socketService } from "~/services/socket.service";

const httpServer = createServer(app);
socketService.initialize(httpServer);
httpServer.listen(port);
```

### Redis Counter
```typescript
// Increment counter
const count = await cacheService.incrementTokensScanned();

// Get current count
const count = await cacheService.getTokensScanned();
```

---

## Common Mistakes to Avoid

❌ **DON'T**:
- Use `res.json()` directly
- Use `Date.now()` or `new Date()`
- Use relative imports (`../utils`)
- Write comments for obvious code
- Create unnecessary files

✅ **DO**:
- Use `sendSuccess` / `sendError`
- Use `moment.utc().valueOf()`
- Use path aliases (`~/utils`)
- Keep code self-explanatory
- Write in English
- Edit existing files when possible

---

## Risk Calculation (Future)

### Service Location
- All risk algorithms go in `services/risk.service.ts`
- Controller just calls the service
- Keep business logic separate from request handling

### Metrics (Planned)
1. **Total Native Balance** - Top 50 holders SOL sum
2. **Fresh Wallets Concentration** - Wallets < 7 days old
3. **Zero-SOL Holders** - Count of holders with 0 SOL

---

## Environment Variables

```env
PORT=3000
NODE_ENV=development

REDIS_URL=redis://localhost:6379

RPC_URL=https://...
DEXSCREENER_API_URL=https://api.dexscreener.com

CACHE_TTL_RISK_SCORE=15
CACHE_TTL_WALLETS_CREATION=86400
```

- Validated with Zod in `config/env.ts`
- Auto-loaded via `dotenv/config` in package.json scripts
- TTL values in seconds (15 = 15 seconds for risk scores, 86400 = 24 hours for wallet creation)

---

## Quick Reference

### Add New Route
1. Create route file in `routes/`
2. Add to `routes/index.ts`
3. Create controller in `controllers/`
4. Add validation schema in `utils/validators.ts`
5. Use `validateParams/Query/Body` middleware

### Add New Service
1. Create in `services/`
2. Export singleton instance
3. Import with `~/services/...`

### Add New Validation
1. Add Zod schema in `utils/validators.ts`
2. Use in route with `validateParams/Query/Body`

---

## Response Examples

### Success
```json
{
  "success": true,
  "message": "Token scan completed",
  "data": {
    "tokenAddress": "...",
    "tokenInfo": { ... },
    "metrics": { ... },
    "scannedAt": 1234567890123
  }
}
```

### Error
```json
{
  "success": false,
  "message": "Only Pumpfun and Pumpswap tokens on Solana are supported",
  "data": null
}
```

---

## Remember

- **Plan before code** - understand the existing structure
- **Follow patterns** - look at existing code for consistency
- **Ask when unclear** - don't assume requirements
- **Update this doc** - when patterns change
