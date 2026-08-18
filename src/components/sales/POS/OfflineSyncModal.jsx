'use client';
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Wifi,
  WifiOff,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Trash2,
  Receipt,
  Server,
  Laptop,
} from 'lucide-react';
import useOfflineStore from '@/store/offlineStore';
import syncManager from '@/lib/sync/offlineSyncManager';
import { clearSyncedItems } from '@/lib/db/posDatabase';
import { getOrCreateDeviceId } from '@/lib/db/posDatabase';
import { toast } from 'sonner';

export default function OfflineSyncModal({ open, onOpenChange, companyId }) {
  const { isOnline, isServerReachable, isSyncing, syncQueue, pendingCount, failedCount, refreshQueue } = useOfflineStore();
  const [filter, setFilter] = useState('all'); // 'all' | 'pending' | 'synced' | 'failed'
  const deviceId = getOrCreateDeviceId();

  const handleForceSync = async () => {
    toast.info("Lancement de la synchronisation...");
    await syncManager.checkHealthAndSync();
  };

  const handleClearSynced = async () => {
    if (!companyId) return;
    const count = await clearSyncedItems(companyId);
    await refreshQueue(companyId);
    toast.success(`${count} vente(s) synchronisée(s) purgée(s) de la mémoire locale.`);
  };

  const filteredItems = syncQueue.filter(item => {
    if (filter === 'pending') return item.status === 'pending' || item.status === 'syncing';
    if (filter === 'synced') return item.status === 'synced';
    if (filter === 'failed') return item.status === 'failed';
    return true;
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl flex items-center gap-2">
              <RefreshCw className={isSyncing ? 'animate-spin text-blue-500' : 'text-primary'} size={20} />
              Gestionnaire de Synchronisation POS
            </DialogTitle>
            <Button
              size="sm"
              variant="outline"
              onClick={handleForceSync}
              disabled={isSyncing || (!isOnline && !isServerReachable)}
              className="gap-1.5"
            >
              <RefreshCw size={14} className={isSyncing ? 'animate-spin' : ''} />
              Synchroniser maintenant
            </Button>
          </div>
          <DialogDescription>
            Suivi des ventes enregistrées localement et de l'état de la réconciliation serveur.
          </DialogDescription>
        </DialogHeader>

        {/* État du Système */}
        <div className="grid grid-cols-3 gap-3 p-3 bg-muted/40 rounded-lg border text-xs">
          <div className="flex items-center gap-2">
            {isOnline ? <Wifi className="text-emerald-500" size={16} /> : <WifiOff className="text-red-500" size={16} />}
            <div>
              <div className="font-semibold">Connexion Internet</div>
              <div className="text-muted-foreground">{isOnline ? 'Active' : 'Déconnecté'}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Server className={isServerReachable ? 'text-emerald-500' : 'text-amber-500'} size={16} />
            <div>
              <div className="font-semibold">Serveur VISEPT</div>
              <div className="text-muted-foreground">{isServerReachable ? 'Joignable (200 OK)' : 'Inaccessible'}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Laptop className="text-blue-500" size={16} />
            <div className="truncate">
              <div className="font-semibold">Terminal ID</div>
              <div className="text-muted-foreground truncate" title={deviceId}>{deviceId}</div>
            </div>
          </div>
        </div>

        {/* Filtres & Actions */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex gap-1.5">
            <Button
              size="xs"
              variant={filter === 'all' ? 'default' : 'outline'}
              onClick={() => setFilter('all')}
            >
              Toutes ({syncQueue.length})
            </Button>
            <Button
              size="xs"
              variant={filter === 'pending' ? 'default' : 'outline'}
              onClick={() => setFilter('pending')}
            >
              En attente ({pendingCount})
            </Button>
            <Button
              size="xs"
              variant={filter === 'synced' ? 'default' : 'outline'}
              onClick={() => setFilter('synced')}
            >
              Synchronisées ({syncQueue.filter(i => i.status === 'synced').length})
            </Button>
            {failedCount > 0 && (
              <Button
                size="xs"
                variant={filter === 'failed' ? 'destructive' : 'outline'}
                onClick={() => setFilter('failed')}
              >
                Anomalies ({failedCount})
              </Button>
            )}
          </div>

          {syncQueue.some(i => i.status === 'synced') && (
            <Button
              size="xs"
              variant="ghost"
              onClick={handleClearSynced}
              className="text-muted-foreground hover:text-foreground text-xs gap-1"
            >
              <Trash2 size={12} />
              Purger synchronisées
            </Button>
          )}
        </div>

        {/* Liste des ventes */}
        <div className="flex-1 overflow-y-auto min-h-[220px] max-h-[340px] space-y-2 pr-1 pt-1">
          {filteredItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-44 text-muted-foreground text-center">
              <CheckCircle2 size={32} className="text-emerald-500/60 mb-2" />
              <p className="text-sm font-medium">Aucune opération dans cette vue</p>
              <p className="text-xs text-muted-foreground">Toutes les opérations locales sont synchronisées.</p>
            </div>
          ) : (
            filteredItems.map((item) => {
              const payload = item.payload || {};
              const totalAmount = (payload.items || []).reduce((acc, it) => acc + (it.unit_price * it.quantity), 0);
              const isSynced = item.status === 'synced';
              const isPending = item.status === 'pending' || item.status === 'syncing';
              const isFailed = item.status === 'failed';

              return (
                <div
                  key={item.offline_uuid}
                  className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/30 transition-colors text-sm"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs text-primary">
                        {item.temp_number || 'OFF-VENTE'}
                      </span>
                      {isSynced && (
                        <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 text-[10px] gap-1">
                          <CheckCircle2 size={10} /> {item.server_sale?.sale_number || 'Synchronisé'}
                        </Badge>
                      )}
                      {isPending && (
                        <Badge variant="outline" className="bg-blue-500/10 text-blue-600 text-[10px] gap-1">
                          <Clock size={10} /> En attente
                        </Badge>
                      )}
                      {isFailed && (
                        <Badge variant="destructive" className="text-[10px] gap-1">
                          <AlertTriangle size={10} /> Échec
                        </Badge>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {payload.client_name ? `Client: ${payload.client_name} · ` : 'Client passager · '}
                      {(payload.items || []).length} article(s) · {new Date(item.created_at).toLocaleTimeString('fr-FR')}
                    </div>
                    {item.error && (
                      <div className="text-xs text-destructive font-medium">
                        Motif : {item.error}
                      </div>
                    )}
                  </div>

                  <div className="text-right">
                    <div className="font-bold text-sm">
                      {Number(totalAmount).toLocaleString()} FCFA
                    </div>
                    <div className="text-[11px] text-muted-foreground uppercase">
                      {payload.payment_method || 'Espèces'}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
