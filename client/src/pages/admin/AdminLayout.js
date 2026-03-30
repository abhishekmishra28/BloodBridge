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
        <div className="logo" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
  
          {/* Logo Image */}
          <img 
            src="/logo.png" 
            alt="logo"
            style={{
              width: '36px',
              height: '36px',
              objectFit: 'contain'
            }}
          />

          <div>
            {/* Styled Name */}
            <div 
              className="logo-text"
              style={{
                fontWeight: 800,
                fontFamily: 'Sora, sans-serif',
                letterSpacing: '0.5px'
              }}
            >
              <span style={{ color: '#e63946' }}>BLOOD</span>
              <span style={{ color: '#ffffff' }}>BRIDGE</span>
            </div>

            {/* Sub text */}
            <div 
              className="logo-sub"
              style={{
                fontSize: '12px',
                color: '#aaa'
              }}
            >
              Admin Panel
            </div>
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
              <div className="user-pill-role">{user?.bloodGroup || 'No blood group'}</div>
            </div>
          </div>

          {/* Divider */}
          <div style={{
            height: '1px',
            background: 'rgba(255,255,255,0.08)',
            margin: '12px 0'
          }} />

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '10px',
              borderRadius: '10px',
              border: '1px solid rgba(230,57,70,0.25)',
              background: 'rgba(230,57,70,0.08)',
              color: '#e63946',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(230,57,70,0.18)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(230,57,70,0.08)';
            }}
          >
            <span style={{ fontSize: '16px' }}>🚪</span>
            Logout
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
