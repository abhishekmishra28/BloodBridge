import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getInitials } from '../../utils/helpers';

const adminNav = [
  { to: '/admin', icon: '📊', label: 'Dashboard', end: true },
  { to: '/admin/users', icon: '👥', label: 'Users' },
  { to: '/admin/hospitals', icon: '🏥', label: 'Hospitals' },
  { to: '/admin/slots', icon: '📅', label: 'Slot Management' },
  { to: '/admin/bookings', icon: '📋', label: 'Bookings' },
  { to: '/admin/requests', icon: '🩸', label: 'Blood Requests' },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="app-layout">
      {/* Mobile overlay */}
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
            <div className="logo-sub">Admin Panel</div>
          </div>
        </div>

        <nav className="nav">
          <div className="nav-section-label">Management</div>
          {adminNav.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              <span className="icon">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="user-pill">
            <div className="avatar">{getInitials(user?.name)}</div>
            <div>
              <div className="user-pill-name">{user?.name?.split(' ')[0]}</div>
              <div className="user-pill-role">Administrator</div>
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
          <button
            className="btn btn-ghost btn-icon"
            onClick={() => setSidebarOpen(o => !o)}
            style={{ display: 'none' }}
            id="menu-toggle"
          >
            ☰
          </button>
          <div style={{ flex: 1 }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div className="avatar">{getInitials(user?.name)}</div>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 600 }}>{user?.name}</div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>admin@bloodbridge.in</div>
            </div>
          </div>
        </header>

        <div className="page-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
