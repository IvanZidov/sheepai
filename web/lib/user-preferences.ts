import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Priority } from './types';

export type DateRange = '24h' | '7d' | '30d' | 'all';
export type SortOption = 'newest' | 'relevance' | 'priority';

export interface UserPreferences {
  // Existing
  techStack: string[];
  alertThreshold: number;
  notifications: boolean;
  
  // New
  searchQuery: string;
  dateRange: DateRange;
  priorityFilter: Priority[]; // Empty means all
  targetedEntities: string[]; // Empty means all
  sortBy: SortOption;

  // Actions
  toggleTech: (tech: string) => void;
  setThreshold: (val: number) => void;
  toggleNotifications: () => void;
  
  setSearchQuery: (query: string) => void;
  setDateRange: (range: DateRange) => void;
  togglePriority: (priority: Priority) => void;
  toggleEntity: (entity: string) => void;
  setSortBy: (sort: SortOption) => void;
  
  resetFilters: () => void;
}

export const useUserPreferences = create<UserPreferences>()(
  persist(
    (set) => ({
      // Defaults
      techStack: [],
      alertThreshold: 0,
      notifications: true,
      
      searchQuery: "",
      dateRange: "all",
      priorityFilter: [],
      targetedEntities: [],
      sortBy: "newest",

      toggleTech: (tech) => set((state) => {
        const exists = state.techStack.includes(tech);
        return {
          techStack: exists 
            ? state.techStack.filter(t => t !== tech)
            : [...state.techStack, tech]
        };
      }),

      setThreshold: (val) => set({ alertThreshold: val }),
      
      toggleNotifications: () => set((state) => ({ notifications: !state.notifications })),

      setSearchQuery: (query) => set({ searchQuery: query }),
      
      setDateRange: (range) => set({ dateRange: range }),
      
      togglePriority: (priority) => set((state) => {
        const exists = state.priorityFilter.includes(priority);
        return {
          priorityFilter: exists
            ? state.priorityFilter.filter(p => p !== priority)
            : [...state.priorityFilter, priority]
        };
      }),

      toggleEntity: (entity) => set((state) => {
        const exists = state.targetedEntities.includes(entity);
        return {
          targetedEntities: exists 
            ? state.targetedEntities.filter(e => e !== entity)
            : [...state.targetedEntities, entity]
        };
      }),
      
      setSortBy: (sort) => set({ sortBy: sort }),

      resetFilters: () => set({ 
        techStack: [], 
        alertThreshold: 0, 
        searchQuery: "", 
        dateRange: "all", 
        priorityFilter: [],
        targetedEntities: [],
        sortBy: "newest" 
      }),
    }),
    {
      name: 'shepherd-preferences',
    }
  )
);
