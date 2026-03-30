import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import { BLOOD_GROUPS, INDIAN_CITIES, INDIAN_STATES, formatDate, getInitials } from '../../utils/helpers';

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    city: user?.city || '',
    state: user?.state || '',
    bloodGroup: user?.bloodGroup || '',
    age: user?.age || '',
    gender: user?.gender || '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.put('/api/users/profile', form);
      await refreshUser();
      toast.success('Profile updated successfully!');
    } catch (err) { toast.error(err.response?.data?.message || 'Update failed'); }
    finally { setLoading(false); }
  };

  const stats = [
    { label: 'Total Donations', value: user?.totalDonations || 0, icon: '🩸', color: 'var(--red-400)' },
    { label: 'Blood Group', value: user?.bloodGroup || '—', icon: '💉', color: 'var(--blue-500)' },
    { label: 'Last Donation', value: formatDate(user?.lastDonationDate), icon: '📅', color: 'var(--green-500)' },
    { label: 'Account Status', value: user?.status || 'active', icon: '✅', color: 'var(--green-500)' },
  ];

  return (
    <div className="fade-in">
      <div className="page-header">
        <div className="page-header-left">
          <h1>👤 My Profile</h1>
          <p>Manage your personal information and donation history</p>
        </div>
      </div>

      <div className="grid-2" style={{ gap: '24px', alignItems: 'flex-start' }}>
        {/* Profile card */}
        <div>
          {/* Avatar & info */}
          <div className="card" style={{ textAlign: 'center', padding: '32px', marginBottom: '20px' }}>
            <div style={{
              width: '80px', height: '80px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--red-700), var(--red-500))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '28px', fontWeight: 800, color: '#fff',
              margin: '0 auto 16px',
              border: '3px solid var(--red-600)',
              boxShadow: 'var(--shadow-red)',
            }}>
              {getInitials(user?.name)}
            </div>
            <h2 style={{ fontSize: '22px', marginBottom: '4px' }}>{user?.name}</h2>
            <div style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '12px' }}>{user?.email}</div>
            {user?.bloodGroup && (
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(230,57,70,0.12)', border: '1px solid rgba(230,57,70,0.25)', padding: '6px 14px', borderRadius: '20px', color: 'var(--red-400)', fontWeight: 700 }}>
                🩸 {user.bloodGroup}
              </div>
            )}
            <div style={{ marginTop: '12px' }}>
              <span className={`badge ${user?.status === 'active' ? 'badge-green' : 'badge-amber'}`}>
                {user?.status}
              </span>
            </div>
          </div>

          {/* Stats */}
          <div className="grid-2" style={{ gap: '12px' }}>
            {stats.map(s => (
              <div key={s.label} className="card card-sm" style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '24px', marginBottom: '6px' }}>{s.icon}</div>
                <div style={{ fontWeight: 800, fontSize: '20px', color: s.color, fontFamily: 'Sora, sans-serif' }}>{s.value}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Donation eligibility */}
          <div className="card" style={{ marginTop: '20px', background: user?.canDonate !== false ? 'rgba(46,204,113,0.06)' : 'rgba(243,156,18,0.06)', borderColor: user?.canDonate !== false ? 'rgba(46,204,113,0.2)' : 'rgba(243,156,18,0.2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '28px' }}>{user?.canDonate !== false ? '✅' : '⏳'}</span>
              <div>
                <div style={{ fontWeight: 700, color: user?.canDonate !== false ? 'var(--green-500)' : 'var(--amber-500)', fontSize: '15px' }}>
                  {user?.canDonate !== false ? 'Eligible to Donate' : 'Donation Cooldown Active'}
                </div>
                <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>
                  {user?.canDonate !== false
                    ? 'You can book a donation slot now!'
                    : `Last donated ${formatDate(user?.lastDonationDate)} — 3-month wait period in effect`
                  }
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Edit form */}
        <div className="card">
          <h3 style={{ marginBottom: '20px' }}>Edit Profile</h3>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input className="form-control" name="name" value={form.name} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input className="form-control" name="phone" value={form.phone} onChange={handleChange} placeholder="98765XXXXX" />
            </div>
            <div className="form-group">
              <label className="form-label">Blood Group</label>
              <select className="form-control" name="bloodGroup" value={form.bloodGroup} onChange={handleChange}>
                <option value="">Select</option>
                {BLOOD_GROUPS.map(bg => <option key={bg} value={bg}>{bg}</option>)}
              </select>
            </div>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">City</label>
                <select className="form-control" name="city" value={form.city} onChange={handleChange}>
                  <option value="">Select City</option>
                  {INDIAN_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">State</label>
                <select className="form-control" name="state" value={form.state} onChange={handleChange}>
                  <option value="">Select State</option>
                  {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Age</label>
                <input className="form-control" name="age" type="number" min="18" max="65" value={form.age} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label className="form-label">Gender</label>
                <select className="form-control" name="gender" value={form.gender} onChange={handleChange}>
                  <option value="">Select</option>
                  <option>Male</option><option>Female</option><option>Other</option>
                </select>
              </div>
            </div>
            <div style={{ padding: '12px', background: 'var(--bg-elevated)', borderRadius: 'var(--radius)', border: '1px solid var(--border)', fontSize: '13px', color: 'var(--text-muted)' }}>
              📧 Email: <strong style={{ color: 'var(--text-secondary)' }}>{user?.email}</strong>
              <span style={{ marginLeft: '8px', fontSize: '11px' }}>(cannot be changed)</span>
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? '⏳ Saving…' : '✓ Save Changes'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
