import { create } from 'zustand';

interface AppState {
  sidebarOpen: boolean;
  edicionHabilitada: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  toggleEdicion: () => void;
  setEdicion: (enabled: boolean) => void;
}

export const useAppStore = create<AppState>(set => ({
  sidebarOpen: true,
  edicionHabilitada: false,
  toggleSidebar: () => set(s => ({ sidebarOpen: !s.sidebarOpen })),
  setSidebarOpen: open => set({ sidebarOpen: open }),
  toggleEdicion: () => set(s => ({ edicionHabilitada: !s.edicionHabilitada })),
  setEdicion: enabled => set({ edicionHabilitada: enabled }),
}));
