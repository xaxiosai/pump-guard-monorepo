import axios from "axios";
import { env } from "~/config/env";

type ChainId = "solana";
type DexId = "pumpfun" | "pumpswap";

const ALLOWED_DEX_IDS: DexId[] = ["pumpfun", "pumpswap"];

interface BaseToken {
  address: string;
  name: string;
  symbol: string;
}

interface QuoteToken {
  address: string;
  name: string;
  symbol: string;
}

interface Txns {
  m5: { buys: number; sells: number };
  h1: { buys: number; sells: number };
  h6: { buys: number; sells: number };
  h24: { buys: number; sells: number };
}

interface Volume {
  h24: number;
  h6: number;
  h1: number;
  m5: number;
}

interface PriceChange {
  h1: number;
  h6: number;
  h24: number;
}

export interface DexScreenerPair {
  chainId: ChainId;
  dexId: DexId;
  url: string;
  pairAddress: string;
  baseToken: BaseToken;
  quoteToken: QuoteToken;
  priceNative: string;
  priceUsd: string;
  txns: Txns;
  volume: Volume;
  priceChange: PriceChange;
  fdv: number;
  marketCap: number;
  pairCreatedAt: number;
}

class DexScreenerService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = env.DEXSCREENER_API_URL;
  }

  async getTokenData(
    chainId: ChainId,
    tokenAddress: string
  ): Promise<DexScreenerPair | null> {
    try {
      const response = await axios.get<DexScreenerPair[]>(
        `${this.baseUrl}/tokens/v1/${chainId}/${tokenAddress}`
      );

      if (!response.data || response.data.length === 0) {
        return null;
      }

      return response.data[0];
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  }
}

export const dexscreenerService = new DexScreenerService();
export { ALLOWED_DEX_IDS };
