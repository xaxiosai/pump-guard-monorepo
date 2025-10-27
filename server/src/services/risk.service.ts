import { PublicKey } from "@solana/web3.js";
import moment from "moment-timezone";
import { solana } from "~/services/solana.service";
import { cacheService } from "~/services/cache.service";
import { env } from "~/config/env";

interface WalletInfo {
  address: string;
  balance: number;
  tokenAmount: number;
  isFresh: boolean;
  createdAt?: number;
}

interface WalletCreationCache {
  createdAt: number;
  isFresh: boolean;
}

interface MetricResult {
  value: number;
  score: number;
  type: "positive" | "negative";
  thresholds: {
    low: number;
    medium: number;
    high: number;
  };
}

interface RiskMetrics {
  totalNativeBalance: MetricResult;
  freshWalletsConcentration: MetricResult;
  zeroSolHolders: MetricResult;
}

async function getWalletCreationData(
  walletAddress: string
): Promise<WalletCreationCache> {
  const cacheKey = `wallet:creation:${walletAddress}`;

  const cached = await cacheService.get<WalletCreationCache>(cacheKey);
  if (cached) {
    return cached;
  }

  try {
    const pubkey = new PublicKey(walletAddress);

    const signatures = await solana.getSignaturesForAddress(pubkey, {
      limit: 1000,
    });

    let createdAt: number;
    if (signatures.length === 0) {
      createdAt = moment.utc().unix();
    } else {
      const oldestSignature = signatures[signatures.length - 1];
      createdAt = oldestSignature.blockTime || moment.utc().unix();
    }

    const sevenDaysAgo = moment.utc().subtract(7, "days").unix();
    const isFresh = createdAt > sevenDaysAgo;

    const result: WalletCreationCache = { createdAt, isFresh };

    const ttl = parseInt(env.CACHE_TTL_WALLETS_CREATION);
    await cacheService.set(cacheKey, result, ttl);

    return result;
  } catch (error) {
    console.error(`Error checking wallet age for ${walletAddress}:`, error);
    return {
      createdAt: moment.utc().unix(),
      isFresh: false,
    };
  }
}

export function calculateTotalNativeBalance(wallets: WalletInfo[]): MetricResult {
  const totalSOL = wallets.reduce((sum, wallet) => sum + wallet.balance, 0);
  const score = Math.min((totalSOL / 2000) * 100, 100);

  return {
    value: totalSOL,
    score: Math.round(score * 100) / 100,
    type: "positive",
    thresholds: {
      low: 1000,
      medium: 500,
      high: 0,
    },
  };
}

export function calculateFreshWalletsConcentration(
  wallets: WalletInfo[],
  totalSupply: number
): MetricResult {
  const freshWalletCount = wallets.filter((w) => w.isFresh).length;

  const penalty = 2;
  const score = Math.max(100 - freshWalletCount * penalty, 0);

  return {
    value: freshWalletCount,
    score: Math.round(score * 100) / 100,
    type: "negative",
    thresholds: {
      low: 15,
      medium: 25,
      high: 40,
    },
  };
}

export function calculateZeroSolHolders(wallets: WalletInfo[]): MetricResult {
  const ZERO_THRESHOLD = 0.01;
  const zeroSolCount = wallets.filter((w) => w.balance < ZERO_THRESHOLD).length;

  const penalty = 2;
  const penaltyScore = zeroSolCount * penalty;
  const score = Math.max(100 - penaltyScore, 0);

  return {
    value: zeroSolCount,
    score: Math.round(score * 100) / 100,
    type: "negative",
    thresholds: {
      low: 5,
      medium: 15,
      high: 25,
    },
  };
}

export function normalizeScore(value: number, min: number, max: number): number {
  return Math.min(Math.max(((value - min) / (max - min)) * 100, 0), 100);
}

export function calculateOverallRisk(metrics: RiskMetrics): {
  overallScore: number;
  riskLevel: "low" | "medium" | "high";
} {
  const weights = {
    totalNativeBalance: 1,
    freshWalletsConcentration: 2,
    zeroSolHolders: 1.5,
  };

  const weightedSum =
    metrics.totalNativeBalance.score * weights.totalNativeBalance +
    metrics.freshWalletsConcentration.score * weights.freshWalletsConcentration +
    metrics.zeroSolHolders.score * weights.zeroSolHolders;

  const totalWeights =
    weights.totalNativeBalance +
    weights.freshWalletsConcentration +
    weights.zeroSolHolders;

  const overallScore = Math.round((weightedSum / totalWeights) * 100) / 100;

  let riskLevel: "low" | "medium" | "high";
  if (overallScore >= 70) riskLevel = "low";
  else if (overallScore >= 40) riskLevel = "medium";
  else riskLevel = "high";

  return { overallScore, riskLevel };
}

export async function analyzeToken(
  tokenAddress: string,
  holders: Array<{ address: string; balance: number; tokenAmount: number }>
): Promise<{
  metrics: RiskMetrics;
  overallScore: number;
  riskLevel: "low" | "medium" | "high";
}> {
  const walletInfoPromises = holders.map(async (holder) => {
    const creationData = await getWalletCreationData(holder.address);
    return {
      address: holder.address,
      balance: holder.balance,
      tokenAmount: holder.tokenAmount,
      isFresh: creationData.isFresh,
      createdAt: creationData.createdAt,
    };
  });

  const wallets = await Promise.all(walletInfoPromises);

  const totalSupply = holders.reduce((sum, h) => sum + h.tokenAmount, 0);

  const metrics: RiskMetrics = {
    totalNativeBalance: calculateTotalNativeBalance(wallets),
    freshWalletsConcentration: calculateFreshWalletsConcentration(
      wallets,
      totalSupply
    ),
    zeroSolHolders: calculateZeroSolHolders(wallets),
  };

  const { overallScore, riskLevel } = calculateOverallRisk(metrics);

  return { metrics, overallScore, riskLevel };
}
