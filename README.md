# Pump Guard

**Open-source security layer for Solana token traders**

Pump Guard is a real-time risk analysis tool that detects manipulation patterns in pump.fun tokens by analyzing blockchain data, wallet behavior, and liquidity flows.

---

## The Problem

Traders on pump.fun face two critical threats:

### 1. Rug Pulls
- Creators use coordinated wallets to fake demand
- Artificially inflate price and market cap
- Suddenly dump holdings → 99% crash

### 2. Farming Manipulation
- Botnets simulate healthy volatility
- Attract new buyers with fake patterns
- Gradually drain liquidity → ~99% loss

**The Challenge:** High-speed blockchain activity + multi-wallet obfuscation makes scams hard to detect until it's too late.

---

## The Solution

Pump Guard analyzes tokens using real-time blockchain data:

### Risk Metrics
- **Fresh Wallet Concentration** - Wallets created < 7 days ago
- **Zero-SOL Holders** - Suspicious wallets with no native balance
- **Top Holder Analysis** - Total SOL balance of largest holders

### Core Principles
- **Open-source & auditable** - Community-driven transparency
- **Real-time analysis** - Instant risk scoring
- **Neutral reporting** - No price predictions, only risk signals

---

## Tech Stack

### Backend (Express.js + TypeScript)
- Solana RPC, DexScreener API, Redis caching
- Zod validation, Rate limiting, Helmet security

### Frontend (React + TypeScript + Vite)
- React 19, TypeScript, Vite bundler

---

## Quick Start

### Prerequisites
- Node.js 18+
- Redis server
- Solana RPC endpoint (Triton, Helius, QuickNode, etc.)

### Installation & Setup

```bash
# Install dependencies
pnpm install

# Configure backend
cd server
cp .env.example .env
# Edit .env with your RPC URL
```

### Running

```bash
# Backend (Terminal 1)
cd server && pnpm dev

# Frontend (Terminal 2)
cd web && pnpm dev
```

---

## API Reference

See [server/README.md](server/README.md) for complete API documentation including:
- Risk scoring algorithms
- Caching strategy
- Rate limiting details
- Response formats

**Quick Example:**
```http
GET /api/scanner/scan/:tokenAddress
```

---

## Project Structure

```
pump-guard-monorepo/
├── server/          # Backend API (detailed README inside)
├── web/             # Frontend React app
├── shared/          # Shared TypeScript types
└── .claude/         # Development guidelines
```

---

## Contributing

Contributions welcome! Please follow these patterns:
- TypeScript strict mode
- Path aliases (`~/`) for imports
- Timestamps via `moment.utc().unix()`
- Responses via `sendSuccess()` / `sendError()`

See [.claude/CLAUDE.md](.claude/CLAUDE.md) for detailed guidelines.

---

## Learn More

- [Documentation](https://docs.pump-guard.com/)

---

**Mission:** Protect traders and builders from hidden manipulation without limiting innovation.
