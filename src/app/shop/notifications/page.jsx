// src/app/shop/notifications/page.jsx
'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Bell,
  CheckCheck,
  Trash2,
  Filter,
  AlertCircle,
  AlertTriangle,
  Info,
  Calendar,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Search,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import useCompanyStore from '@/store/companyStore';
import api from '@/lib/axios';
import { toast } from 'sonner';

export default function NotificationsPage() {
  const { activeCompany } = useCompanyStore();
  const router = useRouter();

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  // Filtres
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [filterUnreadOnly, setFilterUnreadOnly] = useState(false);

  const companyId = activeCompany?.id;

  const fetchNotifications = async () => {
    if (!companyId) return;
    try {
      setIsLoading(true);
      let url = `/notifications?company_id=${companyId}&page=${page}&limit=20`;
      if (filterUnreadOnly) url += '&unread_only=true';
      if (filterSeverity !== 'all') url += `&severity=${filterSeverity}`;
      if (filterType !== 'all') url += `&type=${filterType}`;

      const res = await api.get(url);
      if (res.data?.success) {
        setNotifications(res.data.data.notifications || []);
        setUnreadCount(res.data.data.unread_count || 0);
        setTotalCount(res.data.data.pagination.total || 0);
        setTotalPages(res.data.data.pagination.pages || 1);
      }
    } catch (error) {
      console.error('Erreur chargement notifications:', error);
      toast.error('Impossible de charger les notifications');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [companyId, page, filterSeverity, filterType, filterUnreadOnly]);

  const handleMarkAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read?company_id=${companyId}`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: 1 } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
      toast.success('Notification marquée comme lue');
    } catch (error) {
      toast.error('Erreur lors de la mise à jour');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await api.put(`/notifications/read-all?company_id=${companyId}`);
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: 1 })));
      setUnreadCount(0);
      toast.success('Toutes les notifications sont marquées comme lues');
    } catch (error) {
      toast.error('Erreur lors du traitement');
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    try {
      await api.delete(`/notifications/${id}?company_id=${companyId}`);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      toast.success('Notification supprimée');
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    }
  };

  const getSeverityBadge = (severity) => {
    switch (severity) {
      case 'critical':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-950/80 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-900">
            <AlertCircle size={12} /> Critique
          </span>
        );
      case 'warning':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-900">
            <AlertTriangle size={12} /> Attention
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900">
            <Info size={12} /> Information
          </span>
        );
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-6">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center">
              <Bell size={22} />
            </div>
            Centre de Notifications
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Suivez les alertes de stock, les événements de caisse, et les activités financières en temps réel.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Button
              onClick={handleMarkAllAsRead}
              variant="outline"
              size="sm"
              className="gap-1.5 text-xs font-medium border-gray-200 dark:border-gray-700"
              title="Marquer toutes les alertes de la boutique comme lues"
            >
              <CheckCheck size={15} /> Tout marquer comme lu
            </Button>
          )}

          <Button
            onClick={fetchNotifications}
            variant="ghost"
            size="sm"
            className="gap-1.5 text-xs text-gray-600 dark:text-gray-300"
            title="Actualiser les alertes"
          >
            <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
          </Button>
        </div>
      </div>

      {/* Barre de filtres */}
      <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 shadow-2xs">
        <CardContent className="p-4 flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 dark:text-gray-400">
            <Filter size={15} /> Filtres :
          </div>

          <div className="w-40">
            <Select value={filterSeverity} onValueChange={(val) => { setFilterSeverity(val); setPage(1); }}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="Gravité" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes gravités</SelectItem>
                <SelectItem value="critical">🔴 Critiques uniquement</SelectItem>
                <SelectItem value="warning">🟡 Avertissements</SelectItem>
                <SelectItem value="info">🔵 Informations</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="w-44">
            <Select value={filterType} onValueChange={(val) => { setFilterType(val); setPage(1); }}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="Type d'alerte" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les types</SelectItem>
                <SelectItem value="low_stock">📦 Rupture & Stock bas</SelectItem>
                <SelectItem value="session_anomaly">💰 Écarts de caisse</SelectItem>
                <SelectItem value="supplier_credit_created">📜 Avoirs fournisseurs</SelectItem>
                <SelectItem value="inventory_done">📋 Inventaires</SelectItem>
                <SelectItem value="order_received">🚚 Commandes reçues</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            variant={filterUnreadOnly ? 'default' : 'outline'}
            size="sm"
            onClick={() => { setFilterUnreadOnly(!filterUnreadOnly); setPage(1); }}
            className="h-8 text-xs font-medium"
          >
            Non lues uniquement ({unreadCount})
          </Button>
        </CardContent>
      </Card>

      {/* Liste des notifications */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="py-16 text-center">
            <div className="w-8 h-8 border-3 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm text-gray-500 dark:text-gray-400">Chargement des notifications...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="py-20 text-center bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl">
            <div className="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-3 text-gray-400">
              <Bell size={28} />
            </div>
            <h3 className="text-base font-semibold text-gray-800 dark:text-gray-200">Aucune notification trouvée</h3>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 max-w-sm mx-auto">
              Aucune alerte ne correspond à vos filtres actuels.
            </p>
          </div>
        ) : (
          notifications.map((notif) => (
            <div
              key={notif.id}
              onClick={() => {
                if (!notif.is_read) handleMarkAsRead(notif.id);
                if (notif.action_url) router.push(notif.action_url);
              }}
              className={`group relative p-4 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                notif.is_read
                  ? 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700'
                  : 'bg-blue-50/50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900/60 shadow-xs hover:shadow-md'
              }`}
            >
              <div className="flex items-start gap-3.5 flex-1 min-w-0">
                <div className="mt-1">{getSeverityBadge(notif.severity)}</div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className={`text-sm font-semibold truncate ${
                      notif.is_read ? 'text-gray-800 dark:text-gray-200' : 'text-gray-900 dark:text-white'
                    }`}>
                      {notif.title}
                    </h4>
                    {!notif.is_read && (
                      <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0 animate-ping" />
                    )}
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 leading-relaxed">
                    {notif.message}
                  </p>
                  <div className="flex items-center gap-3 mt-2 text-[11px] text-gray-400 dark:text-gray-500">
                    <span className="flex items-center gap-1">
                      <Calendar size={12} />
                      {new Date(notif.created_at).toLocaleString('fr-FR')}
                    </span>
                    {notif.action_url && (
                      <span className="text-brand-600 dark:text-brand-400 flex items-center gap-0.5 hover:underline font-medium">
                        Accéder à l'élément <ExternalLink size={11} />
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center">
                {!notif.is_read && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMarkAsRead(notif.id);
                    }}
                    className="h-8 text-xs text-gray-500 hover:text-brand-600"
                    title="Marquer cette notification comme lue"
                  >
                    Marquer lu
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => handleDelete(notif.id, e)}
                  className="h-8 w-8 p-0 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40"
                  title="Supprimer la notification"
                >
                  <Trash2 size={14} />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-800">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Page {page} sur {totalPages} ({totalCount} notifications au total)
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="h-8 text-xs"
            >
              <ChevronLeft size={14} className="mr-1" /> Précédent
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="h-8 text-xs"
            >
              Suivant <ChevronRight size={14} className="ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
