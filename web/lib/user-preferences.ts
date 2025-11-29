import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface UserPreferences {
  techStack: string[];
  alertThreshold: number;
  notifications: boolean;
  
  // Actions
  toggleTech: (tech: string) => void;
  setThreshold: (val: number) => void;
  toggleNotifications: () => void;
}

export const useUserPreferences = create<UserPreferences>()(
  persist(
    (set) => ({
      techStack: ["AWS", "Python", "Node.js"], // Defaults
      alertThreshold: 70,
      notifications: true,

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
    }),
    {
      name: 'shepherd-preferences',
    }
  )
);

export const AVAILABLE_TECH = [
  { id: "AWS", label: "AWS" },
  { id: "Azure", label: "Azure" },
  { id: "GCP", label: "GCP" },
  { id: "Python", label: "Python" },
  { id: "Node.js", label: "Node.js" },
  { id: "React", label: "React" },
  { id: "Docker", label: "Docker" },
  { id: "Kubernetes", label: "Kubernetes" },
  { id: "PostgreSQL", label: "PostgreSQL" },
  { id: "Redis", label: "Redis" },
];

