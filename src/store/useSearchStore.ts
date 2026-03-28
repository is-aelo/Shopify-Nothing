import { create } from 'zustand';
import { getSearchResults } from '@/lib/shopify';

interface SearchState {
  query: string;
  results: any[];
  isLoading: boolean;
  setQuery: (query: string) => void;
  fetchResults: (query: string) => Promise<void>;
  clearResults: () => void;
}

export const useSearchStore = create<SearchState>((set) => ({
  query: '',
  results: [],
  isLoading: false,

  setQuery: (query) => set({ query }),

  fetchResults: async (query) => {
    if (!query.trim()) {
      set({ results: [], isLoading: false });
      return;
    }

    set({ isLoading: true });
    try {
      const response = await getSearchResults(query);
      const products = response?.body?.data?.products?.edges?.map((edge: any) => edge.node) || [];
      set({ results: products });
    } catch (err) {
      console.error("SEARCH_SYSTEM_ERROR:", err);
      set({ results: [] });
    } finally {
      set({ isLoading: false });
    }
  },

  clearResults: () => set({ query: '', results: [], isLoading: false }),
}));