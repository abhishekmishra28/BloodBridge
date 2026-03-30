import React, { useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../utils/api';
import { BLOOD_GROUPS, INDIAN_CITIES, formatDate, getInitials } from '../../utils/helpers';

export default function SearchDonors() {
  const [city, setCity] = useState('');
  const [bloodGroup, setBloodGroup] = useState('');
  const [donors, setDonors] = useState([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  const search = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/api/users/donors', { params: { city, bloodGroup } });
      setDonors(data.donors);
      setSearched(true);
      if (data.donors.length === 0) toast('No donors found for these filters', { icon: 'ℹ️' });
    } catch { toast.error('Search failed'); }
    finally { setLoading(false); }
  };

  const canDonateSince = (lastDonationDate) => {
    if (!lastDonationDate) return true;
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    return new Date(lastDonationDate) <= threeMonthsAgo;
  };

  return (
    <div className="fade-in">
      <div className="page-header">
        <div className="page-header-left">
          <h1>🔍 Search Donors</h1>
          <p>Find compatible blood donors in your city</p>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '24px' }}>
        <h3 style={{ marginBottom: '16px' }}>Filter Donors</h3>
        <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div className="form-group" style={{ flex: '1', minWidth: '160px' }}>
            <label className="form-label">City</label>
            <select className="form-control" value={city} onChange={e => setCity(e.target.value)}>
              <option value="">All Cities</option>
              {INDIAN_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="form-group" style={{ flex: '1', minWidth: '160px' }}>
            <label className="form-label">Blood Group</label>
            <select className="form-control" value={bloodGroup} onChange={e => setBloodGroup(e.target.value)}>
              <option value="">All Blood Groups</option>
              {BLOOD_GROUPS.map(bg => <option key={bg} value={bg}>{bg}</option>)}
            </select>
          </div>
          <button className="btn btn-primary" onClick={search} disabled={loading} style={{ marginBottom: '0', height: '40px' }}>
            {loading ? '⏳ Searching…' : '🔍 Search'}
          </button>
        </div>
      </div>

      {/* Blood type compatibility guide */}
      <div className="card" style={{ marginBottom: '24px', padding: '16px 20px' }}>
        <div style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '10px' }}>🩸 Quick Compatibility Guide</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', fontSize: '12px' }}>
          {[
            { type: 'O-', can: 'Universal Donor' },
            { type: 'AB+', can: 'Universal Recipient' },
            { type: 'O+', can: 'Donates to O+, A+, B+, AB+' },
            { type: 'A+', can: 'Donates to A+, AB+' },
          ].map(g => (
            <div key={g.type} style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '4px 10px', borderRadius: '20px',
              background: 'var(--bg-elevated)', border: '1px solid var(--border)',
            }}>
              <div className="blood-chip" style={{ width: '22px', height: '22px', fontSize: '9px' }}>{g.type}</div>
              <span style={{ color: 'var(--text-secondary)' }}>{g.can}</span>
            </div>
          ))}
        </div>
      </div>

      {searched && (
        donors.length === 0 ? (
          <div className="empty-state">
            <div className="icon">🔍</div>
            <h3>No donors found</h3>
            <p>Try expanding your search filters</p>
          </div>
        ) : (
          <>
            <div style={{ marginBottom: '16px', color: 'var(--text-muted)', fontSize: '14px' }}>
              Found <strong style={{ color: 'var(--text-primary)' }}>{donors.length}</strong> donor{donors.length !== 1 ? 's' : ''}
              {city && ` in ${city}`}{bloodGroup && ` with blood type ${bloodGroup}`}
            </div>
            <div className="grid-3" style={{ gap: '14px' }}>
              {donors.map(d => {
                const eligible = canDonateSince(d.lastDonationDate);
                return (
                  <div key={d._id} className="card card-sm" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '44px', height: '44px', borderRadius: '50%',
                        background: 'linear-gradient(135deg, var(--red-700), var(--red-500))',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '14px', fontWeight: 700, color: '#fff',
                      }}>{getInitials(d.name)}</div>
                      <div>
                        <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '14px' }}>{d.name}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>📍 {d.city || 'India'}</div>
                      </div>
                      <div className="blood-chip" style={{ marginLeft: 'auto' }}>{d.bloodGroup}</div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        Last donated: {d.lastDonationDate ? formatDate(d.lastDonationDate) : 'Never'}
                      </div>
                      <span className={`badge ${eligible ? 'badge-green' : 'badge-amber'}`}>
                        {eligible ? '✓ Eligible' : 'On cooldown'}
                      </span>
                    </div>
                    {d.phone && (
                      <a
                        href={`tel:${d.phone}`}
                        className="btn btn-secondary btn-sm"
                        style={{ textAlign: 'center' }}
                      >
                        📞 {d.phone}
                      </a>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )
      )}
    </div>
  );
}
