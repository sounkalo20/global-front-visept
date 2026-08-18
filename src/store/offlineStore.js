import { create } from 'zustand';
import { getSyncQueue } from '@/lib/db/posDatabase';

const useOfflineStore = create((set, get) => ({
  isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
  isServerReachable: true,
  isSyncing: false,
  syncQueue: [],
  pendingCount: 0,
  failedCount: 0,
  lastSyncTime: null,
  lastError: null,
  isModalOpen: false,
  offlineLeaseExpired: false,

  setOnline: (isOnline) => set({ isOnline }),
  setServerReachable: (isServerReachable) => set({ isServerReachable }),
  setSyncing: (isSyncing) => set({ isSyncing }),
  setModalOpen: (isModalOpen) => set({ isModalOpen }),
  setOfflineLeaseExpired: (expired) => set({ offlineLeaseExpired: expired }),

  refreshQueue: async (companyId) => {
    if (!companyId) return;
    try {
      const items = await getSyncQueue(companyId);
      const pending = items.filter(i => i.status === 'pending' || i.status === 'syncing').length;
      const failed = items.filter(i => i.status === 'failed').length;
      set({
        syncQueue: items,
        pendingCount: pending,
        failedCount: failed,
      });
    } catch (e) {
      console.warn("Erreur rafraîchissement file offline:", e);
    }
  },

  setLastSyncTime: (date) => set({ lastSyncTime: date, lastError: null }),
  setLastError: (error) => set({ lastError: error }),
}));

export default useOfflineStore;
