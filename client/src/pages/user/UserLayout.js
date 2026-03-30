import React, { useState, useEffect, useCallback } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getInitials } from '../../utils/helpers';
import api from '../../utils/api';

const userNav = [
  { to: '/dashboard', icon: '🏠', label: 'Dashboard', end: true },
  { to: '/dashboard/donate', icon: '🩸', label: 'Donate Blood' },
  { to: '/dashboard/request', icon: '🆘', label: 'Request Blood' },
  { to: '/dashboard/search', icon: '🔍', label: 'Search Donors' },
  { to: '/dashboard/hospitals', icon: '🏥', label: 'Hospitals' },
  { to: '/dashboard/notifications', icon: '🔔', label: 'Notifications' },
  { to: '/dashboard/profile', icon: '👤', label: 'My Profile' },
];

export default function UserLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchUnread = useCallback(async () => {
    try {
      const { data } = await api.get('/notifications');
      setUnreadCount(data.unreadCount);
    } catch {}
  }, []);

  useEffect(() => {
    fetchUnread();
    const interval = setInterval(fetchUnread, 30000); // poll every 30s
    return () => clearInterval(interval);
  }, [fetchUnread]);

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <div className="app-layout">
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 99 }}
        />
      )}

      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="logo">
          <div className="logo-icon">🩸</div>
          <div>
            <div className="logo-text">BloodBridge</div>
            <div className="logo-sub">{user?.city || 'India'}</div>
          </div>
        </div>

        <nav className="nav">
          <div className="nav-section-label">Menu</div>
          {userNav.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              <span className="icon">{item.icon}</span>
              {item.label}
              {item.label === 'Notifications' && unreadCount > 0 && (
                <span style={{
                  marginLeft: 'auto',
                  background: 'var(--red-600)',
                  color: '#fff',
                  fontSize: '10px',
                  fontWeight: 700,
                  borderRadius: '10px',
                  padding: '1px 6px',
                  minWidth: '18px',
                  textAlign: 'center',
                }}>{unreadCount}</span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Donation eligibility widget */}
        <div style={{ margin: '0 12px 12px', padding: '12px', background: 'var(--bg-elevated)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
          {user?.canDonate !== false ? (
            <>
              <div style={{ fontSize: '11px', color: 'var(--green-500)', fontWeight: 700, marginBottom: '4px' }}>✅ Eligible to Donate</div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>You can donate blood now!</div>
            </>
          ) : (
            <>
              <div style={{ fontSize: '11px', color: 'var(--amber-500)', fontWeight: 700, marginBottom: '4px' }}>⏳ Wait Period Active</div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>3-month cooldown in effect</div>
            </>
          )}
        </div>

        <div className="sidebar-footer">
          <div className="user-pill">
            <div className="avatar">{getInitials(user?.name)}</div>
            <div>
              <div className="user-pill-name">{user?.name?.split(' ')[0]}</div>
              <div className="user-pill-role">{user?.bloodGroup || 'No blood group'}</div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="btn btn-ghost btn-sm"
            style={{ width: '100%', marginTop: '8px', color: 'var(--text-muted)' }}
          >
            🚪 Logout
          </button>
        </div>
      </aside>

      <div className="main-content">
        <header className="topbar">
          <button className="btn btn-ghost btn-icon" onClick={() => setSidebarOpen(o => !o)}
            style={{ display: window.innerWidth <= 900 ? 'flex' : 'none' }}>☰</button>
          <div style={{ flex: 1 }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ position: 'relative' }}>
              <NavLink to="/dashboard/notifications" className={({ isActive }) => `btn btn-ghost btn-icon ${isActive ? 'active' : ''}`} title="Notifications">
                🔔
              </NavLink>
              {unreadCount > 0 && (
                <span className="notif-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
              )}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div className="avatar">{getInitials(user?.name)}</div>
              <div>
                <div style={{ fontSize: '14px', fontWeight: 600 }}>{user?.name}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{user?.city || 'India'}</div>
              </div>
            </div>
          </div>
        </header>

        <div className="page-content">
          <Outlet context={{ refreshNotifs: fetchUnread }} />
        </div>
      </div>
    </div>
  );
}
