import { create } from "zustand";

interface TokensScannedStore {
  count: number;
  setCount: (count: number) => void;
}

export const useTokensScannedStore = create<TokensScannedStore>((set) => ({
  count: 0,
  setCount: (count) => set({ count }),
}));
