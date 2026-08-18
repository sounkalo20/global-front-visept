'use client';
import { useMemo } from 'react';
import { Wifi, WifiOff, RefreshCw, AlertTriangle, CheckCircle2 } from 'lucide-react';
import useOfflineStore from '@/store/offlineStore';
import { cn } from '@/lib/utils';

export default function NetworkStatusBadge({ onClick }) {
  const { isOnline, isServerReachable, isSyncing, pendingCount, failedCount } = useOfflineStore();

  const status = useMemo(() => {
    if (failedCount > 0) {
      return {
        type: 'anomaly',
        label: `${failedCount} anomalie${failedCount > 1 ? 's' : ''}`,
        icon: AlertTriangle,
        bg: 'bg-amber-500/15 text-amber-600 border-amber-300 dark:border-amber-700/50',
        dot: 'bg-amber-500',
      };
    }
    if (isSyncing) {
      return {
        type: 'syncing',
        label: `Synchro (${pendingCount})...`,
        icon: RefreshCw,
        spin: true,
        bg: 'bg-blue-500/15 text-blue-600 border-blue-300 dark:border-blue-700/50',
        dot: 'bg-blue-500',
      };
    }
    if (!isOnline || !isServerReachable) {
      return {
        type: 'offline',
        label: pendingCount > 0 ? `Hors-ligne (${pendingCount})` : 'Hors-ligne',
        icon: WifiOff,
        bg: 'bg-red-500/15 text-red-600 border-red-300 dark:border-red-700/50',
        dot: 'bg-red-500',
      };
    }
    if (pendingCount > 0) {
      return {
        type: 'pending',
        label: `${pendingCount} en attente`,
        icon: RefreshCw,
        bg: 'bg-indigo-500/15 text-indigo-600 border-indigo-300 dark:border-indigo-700/50',
        dot: 'bg-indigo-500',
      };
    }
    return {
      type: 'online',
      label: 'Connecté',
      icon: Wifi,
      bg: 'bg-emerald-500/15 text-emerald-600 border-emerald-300 dark:border-emerald-700/50',
      dot: 'bg-emerald-500',
    };
  }, [isOnline, isServerReachable, isSyncing, pendingCount, failedCount]);

  const Icon = status.icon;

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border transition-all hover:scale-105 cursor-pointer shadow-xs',
        status.bg
      )}
      title="Statut de connexion et synchronisation (Cliquer pour voir la file)"
    >
      <span className={cn('h-2 w-2 rounded-full', status.dot, status.type === 'syncing' && 'animate-ping')} />
      <Icon size={13} className={cn(status.spin && 'animate-spin')} />
      <span>{status.label}</span>
    </button>
  );
}
