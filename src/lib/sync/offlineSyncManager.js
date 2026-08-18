/**
 * lib/sync/offlineSyncManager.js
 * Moteur de synchronisation en tâche de fond pour VISEPT POS Mode Hors-Ligne
 * Traitement séquentiel FIFO avec Exponential Backoff, Idempotence et Heartbeat Intelligent
 */

import api from '@/lib/axios';
import { getSyncQueue, updateSyncQueueStatus } from '@/lib/db/posDatabase';
import useOfflineStore from '@/store/offlineStore';

class OfflineSyncManager {
  constructor() {
    this.isSyncRunning = false;
    this.intervalId = null;
    this.companyId = null;
    this.isListening = false;
    this.backoffDelay = 1000; // 1s initial
    this.maxBackoff = 10000; // 10s max
    this.handleOnline = this.handleOnline.bind(this);
    this.handleOffline = this.handleOffline.bind(this);
  }

  /**
   * Initialiser les écouteurs réseau et la boucle de synchronisation
   * @param {number|string} companyId 
   */
  start(companyId) {
    if (!companyId || typeof window === 'undefined') return;
    this.companyId = companyId;

    // 1. Écouteurs d'événements navigateur uniques
    if (!this.isListening) {
      window.addEventListener('online', this.handleOnline);
      window.addEventListener('offline', this.handleOffline);
      this.isListening = true;
    }

    // 2. Vérification immédiate
    this.checkHealthAndSync(true);

    // 3. Boucle périodique intelligente (toutes les 15s)
    if (this.intervalId) clearInterval(this.intervalId);
    this.intervalId = setInterval(() => {
      this.checkHealthAndSync(false);
    }, 15000);
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  handleOnline() {
    useOfflineStore.getState().setOnline(true);
    // Ping immédiat et déclenchement de la synchronisation
    this.checkHealthAndSync(true);
  }

  handleOffline() {
    useOfflineStore.getState().setOnline(false);
    useOfflineStore.getState().setServerReachable(false);
  }

  /**
   * Vérifier la connectivité réelle au serveur via l'endpoint /api/health
   */
  async checkServerHealth() {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2500);

      const response = await api.get('/health', {
        signal: controller.signal,
        timeout: 2500,
      });

      clearTimeout(timeoutId);

      const isOk = response.status === 200 && response.data?.status === 'ok';
      useOfflineStore.getState().setServerReachable(isOk);
      useOfflineStore.getState().setOnline(true);
      return isOk;
    } catch (error) {
      useOfflineStore.getState().setServerReachable(false);
      return false;
    }
  }

  /**
   * Vérifier la santé du serveur et déclencher la synchronisation si nécessaire
   * @param {boolean} forceCheckHealth Forcer l'appel /api/health même sans vente en attente
   */
  async checkHealthAndSync(forceCheckHealth = false) {
    if (!this.companyId) return;

    // Mettre à jour l'état de la file locale
    await useOfflineStore.getState().refreshQueue(this.companyId);
    const { pendingCount, isServerReachable, isOnline } = useOfflineStore.getState();

    // N'interroger /api/health que si :
    // 1. Il y a des ventes en attente à synchroniser (pendingCount > 0)
    // 2. Le serveur était marqué inaccessible et on veut vérifier la reconnexion
    // 3. Un contrôle forcé est demandé (au montage ou lors de l'événement 'online')
    const needsHealthCheck = pendingCount > 0 || !isServerReachable || !isOnline || forceCheckHealth;

    if (!needsHealthCheck) {
      return;
    }

    const isHealthy = await this.checkServerHealth();
    if (!isHealthy) return;

    if (pendingCount > 0 && !this.isSyncRunning) {
      this.syncPendingSales();
    }
  }

  /**
   * Dépiler la file FIFO vente par vente de manière idempotente
   */
  async syncPendingSales() {
    if (this.isSyncRunning || !this.companyId) return;
    this.isSyncRunning = true;
    useOfflineStore.getState().setSyncing(true);

    try {
      const queue = await getSyncQueue(this.companyId);
      const pendingSales = queue.filter(item => item.status === 'pending' || item.status === 'syncing');

      for (const saleRecord of pendingSales) {
        // Marquer en cours d'envoi
        await updateSyncQueueStatus(this.companyId, saleRecord.offline_uuid, 'syncing', {
          attempts: (saleRecord.attempts || 0) + 1,
        });
        await useOfflineStore.getState().refreshQueue(this.companyId);

        try {
          const payload = {
            ...saleRecord.payload,
            offline_uuid: saleRecord.offline_uuid,
            device_id: saleRecord.device_id,
            is_offline_sync: true,
            offline_created_at: saleRecord.created_at,
          };

          const response = await api.post('/sales', payload);

          if (response.status === 200 || response.status === 201) {
            const serverSale = response.data?.data?.sale;
            await updateSyncQueueStatus(this.companyId, saleRecord.offline_uuid, 'synced', {
              server_sale: serverSale,
              synced_at: new Date().toISOString(),
            });

            this.backoffDelay = 1000; // Reset backoff en cas de succès
            useOfflineStore.getState().setLastSyncTime(new Date());
          }
        } catch (error) {
          const status = error.response?.status;

          if (status === 401) {
            // Token expiré : suspendre la synchro et inviter à renouveler
            useOfflineStore.getState().setOfflineLeaseExpired(true);
            await updateSyncQueueStatus(this.companyId, saleRecord.offline_uuid, 'pending');
            break; // Arrêter la boucle
          } else if (!status || status >= 500) {
            // Erreur réseau ou 500 : remettre à pending et appliquer le backoff
            await updateSyncQueueStatus(this.companyId, saleRecord.offline_uuid, 'pending', {
              error: error.message || 'Erreur de connexion serveur',
            });
            this.backoffDelay = Math.min(this.backoffDelay * 2, this.maxBackoff);
            break; // Retenter au prochain tick
          } else if (status >= 400 && status < 500) {
            // Erreur 4xx critique de validation : marquer en anomalie / failed sans bloquer les autres
            await updateSyncQueueStatus(this.companyId, saleRecord.offline_uuid, 'failed', {
              error: error.response?.data?.message || `Erreur validation client (${status})`,
            });
            // Continuer la boucle pour ne pas bloquer les autres ventes valides
          }
        }

        await useOfflineStore.getState().refreshQueue(this.companyId);
      }
    } catch (e) {
      console.warn("Erreur globale SyncManager:", e);
      useOfflineStore.getState().setLastError(e.message);
    } finally {
      this.isSyncRunning = false;
      useOfflineStore.getState().setSyncing(false);
      await useOfflineStore.getState().refreshQueue(this.companyId);
    }
  }
}

export const syncManager = new OfflineSyncManager();
export default syncManager;
