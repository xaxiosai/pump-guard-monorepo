import { create } from "zustand";

export interface LastScannedToken {
  tokenAddress: string;
  name: string;
  symbol: string;
  image: string | null;
  marketCap: number;
  score: number;
  timestamp: number;
}

interface LastScannedStore {
  tokens: LastScannedToken[];
  addToken: (token: LastScannedToken) => void;
}

export const useLastScannedStore = create<LastScannedStore>((set) => ({
  tokens: [],
  addToken: (token) =>
    set((state) => {
      const filtered = state.tokens.filter((t) => t.tokenAddress !== token.tokenAddress);
      return {
        tokens: [token, ...filtered].slice(0, 3),
      };
    }),
}));
