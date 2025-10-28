export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T | null;
}

export interface TokenInfo {
  name: string;
  symbol: string;
  pairAddress: string;
  priceUsd: string;
  marketCap: number;
  pairCreatedAt: number;
}

export interface MetricResult {
  value: number;
  score: number;
  type: "positive" | "negative";
  thresholds: {
    low: number;
    medium: number;
    high: number;
  };
}

export interface RiskMetrics {
  totalNativeBalance: MetricResult;
  freshWalletsConcentration: MetricResult;
  zeroSolHolders: MetricResult;
}

export interface TokenScanResult {
  tokenAddress: string;
  tokenInfo: TokenInfo;
  metrics: RiskMetrics;
  overallScore: number;
  riskLevel: "low" | "medium" | "high";
  scannedAt: number;
}
