// src/components/notifications/NotificationBell.jsx
'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, Check, CheckCheck, Trash2, AlertTriangle, AlertCircle, Info, ExternalLink, X } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import useAuthStore from '@/store/authStore';
import useCompanyStore from '@/store/companyStore';
import api from '@/lib/axios';
import { toast } from 'sonner';

export default function NotificationBell() {
  const { token, user } = useAuthStore();
  const { activeCompany } = useCompanyStore();
  const router = useRouter();

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const eventSourceRef = useRef(null);

  const companyId = activeCompany?.id;

  // Charger le compte initial et les notifications
  const fetchNotifications = async () => {
    if (!companyId) return;
    try {
      setIsLoading(true);
      const res = await api.get(`/notifications?company_id=${companyId}&limit=10`);
      if (res.data?.success) {
        setNotifications(res.data.data.notifications || []);
        setUnreadCount(res.data.data.unread_count || 0);
      }
    } catch (error) {
      console.error('Erreur chargement notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Connexion SSE en temps réel
  useEffect(() => {
    if (!companyId || !token) return;

    fetchNotifications();

    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    const sseUrl = `${baseUrl}/notifications/stream?company_id=${companyId}&token=${token}`;

    try {
      const es = new EventSource(sseUrl);
      eventSourceRef.current = es;

      es.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data);
          if (parsed.event === 'new_notification' && parsed.notification) {
            const notif = parsed.notification;

            // Ajouter à la liste en temps réel
            setNotifications((prev) => [notif, ...prev.filter((n) => n.id !== notif.id)]);
            setUnreadCount((prev) => prev + 1);

            // Toast d'alerte immédiat
            if (notif.severity === 'critical') {
              toast.error(notif.title, {
                description: notif.message,
                duration: 6000,
                action: notif.action_url
                  ? {
                      label: 'Voir',
                      onClick: () => router.push(notif.action_url),
                    }
                  : undefined,
              });
            } else if (notif.severity === 'warning') {
              toast.warning(notif.title, {
                description: notif.message,
                duration: 5000,
              });
            } else {
              toast.info(notif.title, {
                description: notif.message,
                duration: 4000,
              });
            }
          }
        } catch (e) {
          // Heartbeat or malformed
        }
      };

      es.onerror = (err) => {
        // En cas d'erreur de connexion SSE, le navigateur réessaie automatiquement
      };
    } catch (e) {
      console.error('Erreur initialisation EventSource:', e);
    }

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, [companyId, token]);

  const handleMarkAsRead = async (id, e) => {
    e?.stopPropagation();
    try {
      await api.put(`/notifications/${id}/read?company_id=${companyId}`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: 1 } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Erreur marquage notification:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await api.put(`/notifications/read-all?company_id=${companyId}`);
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: 1 })));
      setUnreadCount(0);
      toast.success('Toutes les notifications ont été marquées comme lues');
    } catch (error) {
      console.error('Erreur mark-all-read:', error);
    }
  };

  const handleNotificationClick = (notif) => {
    if (!notif.is_read) {
      handleMarkAsRead(notif.id);
    }
    setIsOpen(false);
    if (notif.action_url) {
      router.push(notif.action_url);
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'critical':
        return <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />;
      default:
        return <Info className="w-4 h-4 text-blue-500 shrink-0" />;
    }
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <button
          className="relative w-9 h-9 rounded-xl hover:bg-gray-100 dark:hover:bg-[#1F2937] text-gray-600 dark:text-[#D1D5DB] flex items-center justify-center transition-colors focus:outline-none"
          title="Notifications en temps réel"
        >
          <Bell size={18} />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white shadow-xs animate-pulse">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-80 sm:w-96 p-0 bg-white dark:bg-[#1F2937] border border-gray-200 dark:border-[#374151] rounded-2xl shadow-2xl overflow-hidden z-50"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-[#374151] bg-gray-50/70 dark:bg-[#111827]/60">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm text-gray-900 dark:text-[#F9FAFB]">
              Notifications
            </span>
            {unreadCount > 0 && (
              <span className="text-[11px] font-medium bg-red-100 text-red-700 dark:bg-red-950/80 dark:text-red-300 px-2 py-0.5 rounded-full">
                {unreadCount} non lue{unreadCount > 1 ? 's' : ''}
              </span>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="text-xs font-medium text-brand-600 dark:text-brand-400 hover:text-brand-700 flex items-center gap-1 transition-colors"
              title="Tout marquer comme lu"
            >
              <CheckCheck size={14} /> Tout lire
            </button>
          )}
        </div>

        {/* Liste */}
        <div className="max-h-[380px] overflow-y-auto divide-y divide-gray-100 dark:divide-[#374151]">
          {notifications.length === 0 ? (
            <div className="py-10 text-center px-4">
              <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-[#111827] flex items-center justify-center mx-auto mb-2 text-gray-400">
                <Bell size={20} />
              </div>
              <p className="text-sm font-medium text-gray-600 dark:text-[#D1D5DB]">Aucune notification</p>
              <p className="text-xs text-gray-400 dark:text-[#9CA3AF] mt-0.5">
                Vous êtes parfaitement à jour !
              </p>
            </div>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif.id}
                onClick={() => handleNotificationClick(notif)}
                className={`p-3.5 flex items-start gap-3 cursor-pointer transition-colors ${
                  notif.is_read
                    ? 'hover:bg-gray-50 dark:hover:bg-[#111827]/40 opacity-80'
                    : 'bg-blue-50/40 dark:bg-blue-950/20 hover:bg-blue-50/70 dark:hover:bg-blue-950/40'
                }`}
              >
                <div className="mt-0.5">{getSeverityIcon(notif.severity)}</div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <p className={`text-xs font-semibold truncate ${
                      notif.is_read ? 'text-gray-800 dark:text-[#E5E7EB]' : 'text-gray-900 dark:text-white'
                    }`}>
                      {notif.title}
                    </p>
                    <span className="text-[10px] text-gray-400 shrink-0">
                      {new Date(notif.created_at).toLocaleTimeString('fr-FR', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-[#9CA3AF] line-clamp-2 mt-0.5 leading-relaxed">
                    {notif.message}
                  </p>
                </div>

                {!notif.is_read && (
                  <button
                    onClick={(e) => handleMarkAsRead(notif.id, e)}
                    className="p-1 rounded-md text-gray-400 hover:text-brand-600 hover:bg-white dark:hover:bg-[#111827] transition-all"
                    title="Marquer comme lu"
                  >
                    <Check size={13} />
                  </button>
                )}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-2 border-t border-gray-100 dark:border-[#374151] bg-gray-50/50 dark:bg-[#111827]/40 text-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setIsOpen(false);
              router.push('/shop/notifications');
            }}
            className="w-full text-xs font-medium text-brand-600 dark:text-brand-400 hover:bg-brand-50/60 dark:hover:bg-brand-950/40 h-8 rounded-lg"
          >
            Voir tout le centre de notifications
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
