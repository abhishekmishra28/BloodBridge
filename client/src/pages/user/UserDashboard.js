import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import { formatDate, statusBadgeClass } from '../../utils/helpers';

export default function UserDashboard() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/bookings/my'),
      api.get('/requests/my'),
    ]).then(([b, r]) => {
      setBookings(b.data.bookings.slice(0, 3));
      setRequests(r.data.requests.slice(0, 3));
    }).finally(() => setLoading(false));
  }, []);

  const quickActions = [
    { icon: '🩸', label: 'Donate Blood', sub: 'Book a donation slot', to: '/dashboard/donate', color: '#e63946' },
    { icon: '🆘', label: 'Request Blood', sub: 'Post an urgent request', to: '/dashboard/request', color: '#f39c12' },
    { icon: '🔍', label: 'Find Donors', sub: 'Search by city & blood group', to: '/dashboard/search', color: '#3498db' },
    { icon: '🏥', label: 'Hospitals', sub: 'View nearby hospitals', to: '/dashboard/hospitals', color: '#2ecc71' },
  ];

  return (
    <div className="fade-in">
      {/* Welcome */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(192,57,43,0.2), rgba(230,57,70,0.08))',
        border: '1px solid rgba(230,57,70,0.2)',
        borderRadius: 'var(--radius-xl)',
        padding: '28px 32px',
        marginBottom: '28px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
      }}>
        <div>
          <h1 style={{ fontSize: '26px', marginBottom: '6px' }}>
            Hello, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>
            {user?.city ? `Serving ${user.city} and beyond.` : 'Welcome to BloodBridge.'}
            {' '}Every donation saves up to 3 lives.
          </p>
          {user?.totalDonations > 0 && (
            <div style={{ marginTop: '10px', display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(46,204,113,0.15)', color: '#5dd08a', padding: '4px 12px', borderRadius: '20px', fontSize: '13px', fontWeight: 600 }}>
              🏅 {user.totalDonations} Donation{user.totalDonations > 1 ? 's' : ''} completed
            </div>
          )}
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '4px' }}>
            {user?.canDonate !== false ? '✅' : '⏳'}
          </div>
          <div style={{ fontSize: '13px', fontWeight: 700, color: user?.canDonate !== false ? 'var(--green-500)' : 'var(--amber-500)' }}>
            {user?.canDonate !== false ? 'Eligible to Donate' : 'Cooldown Active'}
          </div>
          {user?.lastDonationDate && (
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
              Last: {formatDate(user.lastDonationDate)}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid-4" style={{ marginBottom: '28px', gap: '14px' }}>
        {quickActions.map(a => (
          <Link key={a.to} to={a.to} style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            padding: '20px 12px', gap: '8px',
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)', textDecoration: 'none',
            transition: 'all 0.18s', cursor: 'pointer', textAlign: 'center',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = a.color; e.currentTarget.style.transform = 'translateY(-2px)'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = ''; }}
          >
            <div style={{ fontSize: '28px' }}>{a.icon}</div>
            <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--text-primary)' }}>{a.label}</div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{a.sub}</div>
          </Link>
        ))}
      </div>

      {/* Recent Activity */}
      {!loading && (
        <div className="grid-2" style={{ gap: '20px' }}>
          {/* Recent Bookings */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">Recent Bookings</span>
              <Link to="/dashboard/donate" style={{ fontSize: '13px', color: 'var(--red-400)' }}>View all →</Link>
            </div>
            {bookings.length === 0 ? (
              <div className="empty-state" style={{ padding: '30px' }}>
                <div style={{ fontSize: '32px' }}>📋</div>
                <p style={{ marginTop: '8px', fontSize: '13px' }}>No bookings yet</p>
                <Link to="/dashboard/donate" className="btn btn-primary btn-sm" style={{ marginTop: '10px' }}>Book Now</Link>
              </div>
            ) : bookings.map(b => (
              <div key={b._id} style={{ padding: '10px 0', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>{b.slot?.hospital?.name || 'Hospital'}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{formatDate(b.slot?.date)} · {b.slot?.time}</div>
                </div>
                <span className={`badge ${statusBadgeClass(b.status)}`}>{b.status}</span>
              </div>
            ))}
          </div>

          {/* Recent Requests */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">My Blood Requests</span>
              <Link to="/dashboard/request" style={{ fontSize: '13px', color: 'var(--red-400)' }}>View all →</Link>
            </div>
            {requests.length === 0 ? (
              <div className="empty-state" style={{ padding: '30px' }}>
                <div style={{ fontSize: '32px' }}>🆘</div>
                <p style={{ marginTop: '8px', fontSize: '13px' }}>No requests posted</p>
                <Link to="/dashboard/request" className="btn btn-primary btn-sm" style={{ marginTop: '10px' }}>Post Request</Link>
              </div>
            ) : requests.map(r => (
              <div key={r._id} style={{ padding: '10px 0', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div className="blood-chip blood-chip-sm">{r.bloodGroup}</div>
                    <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>{r.patientName}</span>
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                    📍 {r.city} · Needed by {formatDate(r.requiredDate)}
                  </div>
                </div>
                <span className={`badge ${r.urgency === 'Critical' ? 'badge-red' : r.urgency === 'Urgent' ? 'badge-amber' : 'badge-blue'}`}>{r.urgency}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
