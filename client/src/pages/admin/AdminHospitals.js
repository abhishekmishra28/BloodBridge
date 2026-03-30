import React, { useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import api from '../../utils/api';
import { BLOOD_GROUPS, INDIAN_CITIES, INDIAN_STATES } from '../../utils/helpers';

const EMPTY_FORM = { name: '', address: '', city: '', state: '', phone: '', email: '', bloodBankAvailable: true, bloodGroups: [], pincode: '', description: '' };

function HospitalModal({ hospital, onClose, onSaved }) {
  const [form, setForm] = useState(hospital || EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const isEdit = Boolean(hospital?._id);

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  const toggleBloodGroup = (bg) => {
    setForm(f => ({
      ...f,
      bloodGroups: f.bloodGroups.includes(bg) ? f.bloodGroups.filter(x => x !== bg) : [...f.bloodGroups, bg],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isEdit) {
        await api.put(`/hospitals/${hospital._id}`, form);
        toast.success('Hospital updated');
      } else {
        await api.post('/hospitals', form);
        toast.success('Hospital added');
      }
      onSaved();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h3 className="modal-title">{isEdit ? 'Edit Hospital' : 'Add Hospital'}</h3>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Hospital Name *</label>
              <input className="form-control" name="name" value={form.name} onChange={handleChange} required placeholder="e.g. AIIMS Delhi" />
            </div>
            <div className="form-group">
              <label className="form-label">Address *</label>
              <input className="form-control" name="address" value={form.address} onChange={handleChange} required placeholder="Street address" />
            </div>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">City *</label>
                <select className="form-control" name="city" value={form.city} onChange={handleChange} required>
                  <option value="">Select City</option>
                  {INDIAN_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">State *</label>
                <select className="form-control" name="state" value={form.state} onChange={handleChange} required>
                  <option value="">Select State</option>
                  {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Phone *</label>
                <input className="form-control" name="phone" value={form.phone} onChange={handleChange} required placeholder="Contact number" />
              </div>
              <div className="form-group">
                <label className="form-label">Pincode</label>
                <input className="form-control" name="pincode" value={form.pincode} onChange={handleChange} placeholder="110001" />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input className="form-control" name="email" type="email" value={form.email} onChange={handleChange} placeholder="hospital@example.com" />
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea className="form-control" name="description" value={form.description} onChange={handleChange} rows={2} placeholder="Brief description" />
            </div>
            <div className="form-group">
              <label className="form-label">Available Blood Groups</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '4px' }}>
                {BLOOD_GROUPS.map(bg => (
                  <button
                    type="button"
                    key={bg}
                    onClick={() => toggleBloodGroup(bg)}
                    style={{
                      padding: '4px 12px', borderRadius: '20px', border: '1px solid',
                      fontSize: '12px', fontWeight: 700, cursor: 'pointer',
                      background: form.bloodGroups.includes(bg) ? 'var(--red-600)' : 'var(--bg-elevated)',
                      borderColor: form.bloodGroups.includes(bg) ? 'var(--red-500)' : 'var(--border)',
                      color: form.bloodGroups.includes(bg) ? '#fff' : 'var(--text-secondary)',
                    }}
                  >{bg}</button>
                ))}
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? '⏳ Saving…' : isEdit ? '✓ Update' : '+ Add Hospital'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AdminHospitals() {
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // null | 'add' | hospital object
  const [search, setSearch] = useState('');
  const [cityFilter, setCityFilter] = useState('');

  const fetchHospitals = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/hospitals', { params: { city: cityFilter, limit: 100 } });
      setHospitals(data.hospitals);
    } catch { toast.error('Failed to load hospitals'); }
    finally { setLoading(false); }
  }, [cityFilter]);

  useEffect(() => { fetchHospitals(); }, [fetchHospitals]);

  const deleteHospital = async (id, name) => {
    if (!window.confirm(`Remove ${name}?`)) return;
    try {
      await api.delete(`/hospitals/${id}`);
      toast.success('Hospital removed');
      fetchHospitals();
    } catch { toast.error('Failed'); }
  };

  const filtered = hospitals.filter(h =>
    !search || h.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fade-in">
      <div className="page-header">
        <div className="page-header-left">
          <h1>Hospital Management</h1>
          <p>{hospitals.length} partner hospitals</p>
        </div>
        <button className="btn btn-primary" onClick={() => setModal('add')}>+ Add Hospital</button>
      </div>

      <div className="card" style={{ marginBottom: '20px', padding: '16px 20px' }}>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <div className="search-bar">
            <span className="search-icon">🔍</span>
            <input placeholder="Search hospitals…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="form-control" style={{ width: '160px' }} value={cityFilter} onChange={e => setCityFilter(e.target.value)}>
            <option value="">All Cities</option>
            {INDIAN_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <button className="btn btn-secondary btn-sm" onClick={fetchHospitals}>↻ Refresh</button>
        </div>
      </div>

      {loading ? (
        <div className="spinner-wrap"><div className="spinner" /></div>
      ) : (
        <div className="grid-2" style={{ gap: '16px' }}>
          {filtered.length === 0 ? (
            <div className="empty-state" style={{ gridColumn: '1/-1' }}>
              <div className="icon">🏥</div>
              <h3>No hospitals found</h3>
              <p>Add your first partner hospital</p>
            </div>
          ) : filtered.map(h => (
            <div key={h._id} className="card card-sm" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '15px', color: 'var(--text-primary)', marginBottom: '4px' }}>{h.name}</div>
                  <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>📍 {h.address}</div>
                  <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{h.city}, {h.state}</div>
                </div>
                <span className={`badge ${h.isActive ? 'badge-green' : 'badge-gray'}`}>{h.isActive ? 'Active' : 'Inactive'}</span>
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                📞 {h.phone}{h.email && <span> · ✉️ {h.email}</span>}
              </div>
              {h.bloodGroups?.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                  {h.bloodGroups.map(bg => (
                    <span key={bg} style={{
                      padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 700,
                      background: 'rgba(230,57,70,0.15)', color: 'var(--red-400)',
                    }}>{bg}</span>
                  ))}
                </div>
              )}
              <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                <button className="btn btn-secondary btn-sm" onClick={() => setModal(h)}>✏️ Edit</button>
                <button className="btn btn-danger btn-sm" onClick={() => deleteHospital(h._id, h.name)}>🗑 Remove</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal && (
        <HospitalModal
          hospital={modal === 'add' ? null : modal}
          onClose={() => setModal(null)}
          onSaved={() => { setModal(null); fetchHospitals(); }}
        />
      )}
    </div>
  );
}
