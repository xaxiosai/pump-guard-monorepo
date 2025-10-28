import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface RecentSearch {
  tokenAddress: string;
  symbol: string;
  name: string;
  image: string | null;
  score: number;
  riskLevel: "low" | "medium" | "high";
  marketCap: number;
  timestamp: number;
}

interface RecentSearchesStore {
  searches: RecentSearch[];
  addSearch: (search: Omit<RecentSearch, "timestamp">) => void;
  removeSearch: (tokenAddress: string) => void;
  clearSearches: () => void;
}

export const useRecentSearchesStore = create<RecentSearchesStore>()(
  persist(
    (set) => ({
      searches: [],
      addSearch: (search) =>
        set((state) => {
          const filtered = state.searches.filter(
            (s) => s.tokenAddress !== search.tokenAddress
          );
          return {
            searches: [
              { ...search, timestamp: Date.now() },
              ...filtered,
            ].slice(0, 5), // Keep only last 5
          };
        }),
      removeSearch: (tokenAddress) =>
        set((state) => ({
          searches: state.searches.filter((s) => s.tokenAddress !== tokenAddress),
        })),
      clearSearches: () => set({ searches: [] }),
    }),
    {
      name: "recent-searches",
    }
  )
);
