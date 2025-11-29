import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Priority } from './types';

export type DateRange = '24h' | '7d' | '30d' | 'all';
export type SortOption = 'newest' | 'relevance' | 'priority';

export interface CompanyFilters {
  companyName: string;
  categories: string[];
  regions: string[];
  technologies: string[];
  watchCompanies: string[];
  watchProducts: string[];
  keywords: string[];
}

export interface UserPreferences {
  // Existing
  techStack: string[];
  alertThreshold: number;
  notifications: boolean;
  
  // Search & Filters
  searchQuery: string;
  dateRange: DateRange;
  priorityFilter: Priority[]; // Empty means all
  targetedEntities: string[]; // Empty means all
  sortBy: SortOption;
  
  // Category-based filters
  categoryFilter: string[];
  regionFilter: string[];
  technologyFilter: string[];
  
  // Company-derived filters (from AI suggestion)
  companyFilters: CompanyFilters | null;
  useCompanyFilters: boolean;

  // Actions
  toggleTech: (tech: string) => void;
  setThreshold: (val: number) => void;
  toggleNotifications: () => void;
  
  setSearchQuery: (query: string) => void;
  setDateRange: (range: DateRange) => void;
  togglePriority: (priority: Priority) => void;
  toggleEntity: (entity: string) => void;
  setSortBy: (sort: SortOption) => void;
  
  // Category/Region/Tech toggles
  toggleCategory: (category: string) => void;
  setCategories: (categories: string[]) => void;
  toggleRegion: (region: string) => void;
  setRegions: (regions: string[]) => void;
  toggleTechnology: (tech: string) => void;
  setTechnologies: (techs: string[]) => void;
  
  // Company filters
  setCompanyFilters: (filters: CompanyFilters) => void;
  clearCompanyFilters: () => void;
  toggleUseCompanyFilters: () => void;
  applyCompanyFilters: () => void;
  
  resetFilters: () => void;
}

export const useUserPreferences = create<UserPreferences>()(
  persist(
    (set, get) => ({
      // Defaults
      techStack: [],
      alertThreshold: 0,
      notifications: true,
      
      searchQuery: "",
      dateRange: "all",
      priorityFilter: [],
      targetedEntities: [],
      sortBy: "newest",
      
      categoryFilter: [],
      regionFilter: [],
      technologyFilter: [],
      
      companyFilters: null,
      useCompanyFilters: false,

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

      // Category filter actions
      toggleCategory: (category) => set((state) => {
        const exists = state.categoryFilter.includes(category);
        return {
          categoryFilter: exists
            ? state.categoryFilter.filter(c => c !== category)
            : [...state.categoryFilter, category]
        };
      }),
      
      setCategories: (categories) => set({ categoryFilter: categories }),

      // Region filter actions
      toggleRegion: (region) => set((state) => {
        const exists = state.regionFilter.includes(region);
        return {
          regionFilter: exists
            ? state.regionFilter.filter(r => r !== region)
            : [...state.regionFilter, region]
        };
      }),
      
      setRegions: (regions) => set({ regionFilter: regions }),

      // Technology filter actions
      toggleTechnology: (tech) => set((state) => {
        const exists = state.technologyFilter.includes(tech);
        return {
          technologyFilter: exists
            ? state.technologyFilter.filter(t => t !== tech)
            : [...state.technologyFilter, tech]
        };
      }),
      
      setTechnologies: (techs) => set({ technologyFilter: techs }),

      // Company filter actions
      setCompanyFilters: (filters) => set({ 
        companyFilters: filters,
        useCompanyFilters: true 
      }),
      
      clearCompanyFilters: () => set({ 
        companyFilters: null,
        useCompanyFilters: false 
      }),
      
      toggleUseCompanyFilters: () => set((state) => ({ 
        useCompanyFilters: !state.useCompanyFilters 
      })),
      
      applyCompanyFilters: () => {
        const { companyFilters } = get();
        if (companyFilters) {
          set({
            categoryFilter: companyFilters.categories,
            regionFilter: companyFilters.regions,
            technologyFilter: companyFilters.technologies,
            techStack: companyFilters.technologies,
          });
        }
      },

      resetFilters: () => set({ 
        techStack: [], 
        alertThreshold: 0, 
        searchQuery: "", 
        dateRange: "all", 
        priorityFilter: [],
        targetedEntities: [],
        sortBy: "newest",
        categoryFilter: [],
        regionFilter: [],
        technologyFilter: [],
        useCompanyFilters: false,
      }),
    }),
    {
      name: 'shepherd-preferences',
    }
  )
);
