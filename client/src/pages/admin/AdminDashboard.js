import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import toast from 'react-hot-toast';
import api from '../../utils/api';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const PIE_COLORS = ['#e63946','#f39c12','#2ecc71','#3498db','#9b59b6','#1abc9c','#e74c3c','#f1c40f'];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-light)', borderRadius: '8px', padding: '10px 14px' }}>
      <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>{label}</p>
      {payload.map(p => (
        <p key={p.name} style={{ fontSize: '14px', fontWeight: 700, color: p.color || 'var(--red-400)' }}>
          {p.value} {p.name}
        </p>
      ))}
    </div>
  );
};

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/admin/dashboard')
      .then(r => setData(r.data.data))
      .catch(() => toast.error('Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="spinner-wrap"><div className="spinner" /></div>;
  if (!data) return null;

  const { stats, monthlyDonations, bloodGroupStats, urgencyStats } = data;

  // Format monthly data
  const monthlyChartData = monthlyDonations.map(d => ({
    name: MONTHS[d._id.month - 1],
    Donations: d.count,
  }));

  const bloodGroupChartData = bloodGroupStats.map(b => ({ name: b._id, value: b.count }));
  const urgencyChartData = urgencyStats.map(u => ({ name: u._id, value: u.count }));

  const statCards = [
    { icon: '👥', label: 'Total Users', value: stats.totalUsers, sub: 'Registered donors', color: 'blue' },
    { icon: '🩸', label: 'Active Donors', value: stats.totalDonors, sub: 'Have donated before', color: 'red' },
    { icon: '📋', label: 'Total Bookings', value: stats.totalBookings, sub: `${stats.pendingBookings} pending`, color: 'amber' },
    { icon: '✅', label: 'Donations Done', value: stats.completedDonations, sub: 'Completed slots', color: 'green' },
    { icon: '🆘', label: 'Blood Requests', value: stats.totalRequests, sub: `${stats.openRequests} open`, color: 'red' },
    { icon: '⚠️', label: 'Critical Cases', value: stats.criticalRequests, sub: 'Needs urgent action', color: 'amber' },
    { icon: '🏥', label: 'Hospitals', value: stats.totalHospitals, sub: 'Partner hospitals', color: 'blue' },
    { icon: '🎯', label: 'Fulfilment Rate', value: stats.totalBookings > 0 ? `${Math.round((stats.completedDonations / stats.totalBookings) * 100)}%` : '0%', sub: 'Completion rate', color: 'green' },
  ];

  return (
    <div className="fade-in">
      <div className="page-header">
        <div className="page-header-left">
          <h1>Dashboard</h1>
          <p>Welcome back — here's what's happening at BloodBridge</p>
        </div>
        <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
          {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid-4" style={{ marginBottom: '28px' }}>
        {statCards.map(s => (
          <div key={s.label} className="stat-card">
            <div className={`stat-icon ${s.color}`}>{s.icon}</div>
            <div>
              <div className="stat-label">{s.label}</div>
              <div className="stat-value">{s.value}</div>
              <div className="stat-sub">{s.sub}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid-2" style={{ gap: '20px', marginBottom: '28px' }}>
        {/* Monthly donations bar chart */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Monthly Donations (Last 6 months)</span>
          </div>
          {monthlyChartData.length === 0 ? (
            <div className="empty-state" style={{ padding: '40px' }}>
              <div>No donation data yet</div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={monthlyChartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <XAxis dataKey="name" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
                <Bar dataKey="Donations" fill="var(--red-600)" radius={[4, 4, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Blood group pie */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Donor Blood Groups</span>
          </div>
          {bloodGroupChartData.length === 0 ? (
            <div className="empty-state" style={{ padding: '40px' }}><div>No data yet</div></div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={bloodGroupChartData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
                  {bloodGroupChartData.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend iconType="circle" iconSize={8} formatter={v => <span style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>{v}</span>} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Urgency chart + Quick actions */}
      <div className="grid-2" style={{ gap: '20px' }}>
        {/* Urgency distribution */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Request Urgency Distribution</span>
          </div>
          {urgencyChartData.length === 0 ? (
            <div className="empty-state" style={{ padding: '40px' }}><div>No requests yet</div></div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', paddingTop: '8px' }}>
              {urgencyChartData.map((u, i) => {
                const total = urgencyChartData.reduce((s, x) => s + x.value, 0);
                const pct = Math.round((u.value / total) * 100);
                const color = u.name === 'Critical' ? '#e63946' : u.name === 'Urgent' ? '#f39c12' : '#3498db';
                return (
                  <div key={u.name}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ fontSize: '14px', color: color, fontWeight: 600 }}>{u.name}</span>
                      <span style={{ fontSize: '14px', fontWeight: 700 }}>{u.value} <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>({pct}%)</span></span>
                    </div>
                    <div style={{ height: '6px', background: 'var(--bg-elevated)', borderRadius: '3px' }}>
                      <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: '3px', transition: 'width 0.6s ease' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Quick actions */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Quick Actions</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              { icon: '👥', label: 'Manage Users', sub: `${stats.totalUsers} registered`, link: '/admin/users', color: '#3498db' },
              { icon: '📋', label: 'Review Bookings', sub: `${stats.pendingBookings} pending approval`, link: '/admin/bookings', color: '#f39c12' },
              { icon: '🆘', label: 'Blood Requests', sub: `${stats.criticalRequests} critical`, link: '/admin/requests', color: '#e63946' },
              { icon: '🏥', label: 'Manage Hospitals', sub: `${stats.totalHospitals} active`, link: '/admin/hospitals', color: '#2ecc71' },
            ].map(a => (
              <a key={a.label} href={a.link} style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '12px 14px', borderRadius: 'var(--radius)',
                background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                textDecoration: 'none', transition: 'border-color 0.18s',
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = a.color}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
              >
                <div style={{
                  width: '38px', height: '38px', borderRadius: '8px',
                  background: a.color + '20', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px',
                }}>{a.icon}</div>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>{a.label}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{a.sub}</div>
                </div>
                <div style={{ marginLeft: 'auto', color: 'var(--text-muted)' }}>→</div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
