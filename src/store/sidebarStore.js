import { create } from "zustand";

const useSidebarStore = create((set, get) => ({
  // Desktop : sidebar expanded ou collapsed
  isCollapsed: false,
  // Mobile : drawer ouvert ou fermé
  isMobileOpen: false,

  toggleCollapsed: () => {
    const newState = !get().isCollapsed;
    set({ isCollapsed: newState });
    if (typeof window !== "undefined") {
      localStorage.setItem(
        "visept_sidebar_collapsed",
        JSON.stringify(newState),
      );
    }
  },

  setCollapsed: (collapsed) => {
    set({ isCollapsed: collapsed });
    if (typeof window !== "undefined") {
      localStorage.setItem(
        "visept_sidebar_collapsed",
        JSON.stringify(collapsed),
      );
    }
  },

  toggleMobile: () => set({ isMobileOpen: !get().isMobileOpen }),
  setMobileOpen: (open) => set({ isMobileOpen: open }),

  init: () => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("visept_sidebar_collapsed");
      if (stored !== null) {
        try {
          set({ isCollapsed: JSON.parse(stored) });
        } catch {}
      }
    }
  },
}));

export default useSidebarStore;
