import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../utils/api';
import { timeAgo } from '../../utils/helpers';

const TYPE_ICONS = {
  booking: '📋',
  request: '🆘',
  system: '🔔',
  approval: '✅',
  rejection: '❌',
};

const TYPE_COLORS = {
  booking: 'var(--blue-500)',
  request: 'var(--red-400)',
  system: 'var(--text-muted)',
  approval: 'var(--green-500)',
  rejection: 'var(--red-400)',
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/notifications');
      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
    } catch { toast.error('Failed to load notifications'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchNotifications(); }, []);

  const markAllRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      toast.success('All notifications marked as read');
      fetchNotifications();
    } catch { toast.error('Failed'); }
  };

  const grouped = notifications.reduce((acc, n) => {
    const date = new Date(n.createdAt).toDateString();
    if (!acc[date]) acc[date] = [];
    acc[date].push(n);
    return acc;
  }, {});

  return (
    <div className="fade-in">
      <div className="page-header">
        <div className="page-header-left">
          <h1>🔔 Notifications</h1>
          <p>{unreadCount > 0 ? `${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}` : 'All caught up!'}</p>
        </div>
        {unreadCount > 0 && (
          <button className="btn btn-secondary btn-sm" onClick={markAllRead}>✓ Mark All Read</button>
        )}
      </div>

      {loading ? (
        <div className="spinner-wrap"><div className="spinner" /></div>
      ) : notifications.length === 0 ? (
        <div className="empty-state">
          <div className="icon">🔔</div>
          <h3>No notifications yet</h3>
          <p>You'll receive updates here about bookings, requests, and more</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {Object.entries(grouped).map(([date, items]) => (
            <div key={date}>
              <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '12px' }}>
                {date === new Date().toDateString() ? 'Today' : date === new Date(Date.now() - 86400000).toDateString() ? 'Yesterday' : date}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {items.map(n => (
                  <div
                    key={n._id}
                    style={{
                      display: 'flex', gap: '14px', alignItems: 'flex-start',
                      padding: '14px 16px',
                      background: n.isRead ? 'var(--bg-card)' : 'rgba(230,57,70,0.04)',
                      border: `1px solid ${n.isRead ? 'var(--border)' : 'rgba(230,57,70,0.15)'}`,
                      borderRadius: 'var(--radius-lg)',
                      transition: 'all 0.18s',
                    }}
                  >
                    <div style={{
                      width: '40px', height: '40px', borderRadius: '50%', flexShrink: 0,
                      background: 'var(--bg-elevated)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '18px',
                      border: `1px solid ${TYPE_COLORS[n.type] || 'var(--border)'}22`,
                    }}>
                      {TYPE_ICONS[n.type] || '🔔'}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                        <div style={{ fontWeight: n.isRead ? 600 : 700, fontSize: '14px', color: n.isRead ? 'var(--text-secondary)' : 'var(--text-primary)' }}>
                          {n.title}
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)', flexShrink: 0 }}>{timeAgo(n.createdAt)}</div>
                      </div>
                      <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px', lineHeight: '1.5' }}>
                        {n.message}
                      </div>
                    </div>
                    {!n.isRead && (
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--red-500)', flexShrink: 0, marginTop: '6px' }} />
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
