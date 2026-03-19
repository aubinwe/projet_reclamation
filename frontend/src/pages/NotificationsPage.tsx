import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Bell, CheckCircle, AlertCircle, Clock, Info, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import api from '@/lib/axios';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

interface Notification {
  id: string;
  message: string;
  type: string;
  read_at: string | null;
  created_at: string;
  demande_id: number | null;
}

const typeConfig: Record<string, any> = {
  status_update: {
    icon: CheckCircle,
    bg: 'bg-status-success-bg',
    iconColor: 'text-status-success',
    border: 'border-status-success/30',
    title: 'Mise à jour de statut',
  },
  assignment: {
    icon: Info,
    bg: 'bg-status-info-bg',
    iconColor: 'text-status-info',
    border: 'border-status-info/30',
    title: 'Nouvelle imputation',
  },
  general: {
    icon: Bell,
    bg: 'bg-muted/30',
    iconColor: 'text-muted-foreground',
    border: 'border-border',
    title: 'Notification',
  },
  warning: {
    icon: Clock,
    bg: 'bg-status-pending-bg',
    iconColor: 'text-status-pending',
    border: 'border-status-pending/30',
    title: 'Attention',
  },
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const response = await api.get('/notifications');
      setNotifications(response.data);
    } catch (error) {
      console.error('Failed to fetch notifications', error);
      toast.error('Erreur lors du chargement des notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markAsRead = async (id: string) => {
    try {
      await api.post(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read_at: new Date().toISOString() } : n));
    } catch (error) {
      console.error('Failed to mark as read', error);
    }
  };

  const markAllAsRead = async () => {
    const unread = notifications.filter(n => !n.read_at);
    if (unread.length === 0) return;

    try {
      await Promise.all(unread.map(n => api.post(`/notifications/${n.id}/read`)));
      setNotifications(prev => prev.map(n => ({ ...n, read_at: new Date().toISOString() })));
      toast.success('Toutes les notifications ont été marquées comme lues');
    } catch (error) {
      console.error('Failed to mark all as read', error);
    }
  };

  const getUnreadCount = () => notifications.filter(n => !n.read_at).length;
  const unreadCount = getUnreadCount();

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 text-foreground">
          <div>
            <h1 className="text-2xl font-bold mb-1">Notifications</h1>
            <p className="text-muted-foreground">
              {unreadCount > 0
                ? `${unreadCount} notification${unreadCount > 1 ? 's' : ''} non lue${unreadCount > 1 ? 's' : ''}`
                : 'Toutes les notifications sont lues'}
            </p>
          </div>
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={markAllAsRead}>
              Tout marquer comme lu
            </Button>
          )}
        </div>

        {/* Notifications List */}
        <div className="space-y-4">
          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
                <Bell className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Aucune notification</h3>
              <p className="text-muted-foreground">
                Vous n'avez pas encore reçu de notifications.
              </p>
            </div>
          ) : (
            notifications.map((notification, index) => {
              const config = typeConfig[notification.type] || typeConfig.general;
              const Icon = config.icon;
              const isRead = !!notification.read_at;

              return (
                <div
                  key={notification.id}
                  onClick={() => !isRead && markAsRead(notification.id)}
                  className={cn(
                    'flex items-start gap-4 p-5 rounded-xl border transition-all animate-slide-up cursor-pointer hover:shadow-md',
                    isRead
                      ? 'bg-card/50 border-border opacity-75'
                      : `${config.bg} ${config.border} shadow-sm`,
                  )}
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className={cn(
                    'w-10 h-10 rounded-xl flex items-center justify-center shrink-0',
                    isRead ? 'bg-muted' : `${config.bg}`,
                  )}>
                    <Icon className={cn('w-5 h-5', config.iconColor)} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        {notification.demande_id ? (
                          <Link to={`/claims/${notification.demande_id}`} className="hover:underline">
                            <h3 className="font-semibold mb-1 text-foreground">
                              {config.title}
                            </h3>
                          </Link>
                        ) : (
                          <h3 className="font-semibold mb-1 text-foreground">
                            {config.title}
                          </h3>
                        )}
                        <p className="text-sm text-foreground/80">
                          {notification.message}
                        </p>
                      </div>
                      {!isRead && (
                        <div className="w-2.5 h-2.5 rounded-full bg-accent shrink-0 mt-2 shadow-sm" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true, locale: fr })}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
