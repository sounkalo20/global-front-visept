import { create } from 'zustand';

/**
 * Store global pour l'ouverture / fermeture de la Command Palette (Ctrl+K)
 */
const useCommandPaletteStore = create((set) => ({
  isOpen: false,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
  toggle: () => set((state) => ({ isOpen: !state.isOpen })),
  setIsOpen: (isOpen) => set({ isOpen }),
}));

export default useCommandPaletteStore;
