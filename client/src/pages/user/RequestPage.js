import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { BLOOD_GROUPS, INDIAN_CITIES, URGENCY_LEVELS, formatDate, urgencyBadgeClass } from '../../utils/helpers';

const EMPTY_FORM = { patientName: '', bloodGroup: '', units: 1, urgency: 'Normal', city: '', hospital: '', requiredDate: '', contactPhone: '', notes: '' };

export default function RequestPage() {
  const { user } = useAuth();
  const [form, setForm] = useState({ ...EMPTY_FORM, city: user?.city || '', contactPhone: user?.phone || '' });
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchRequests = async () => {
    try {
      const { data } = await api.get('/requests/my');
      setRequests(data.requests);
    } catch {}
  };

  useEffect(() => { fetchRequests(); }, []);

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.patientName || !form.bloodGroup || !form.requiredDate || !form.contactPhone) {
      toast.error('Please fill all required fields');
      return;
    }
    setLoading(true);
    try {
      await api.post('/requests', form);
      toast.success('Blood request submitted successfully!');
      setForm({ ...EMPTY_FORM, city: user?.city || '', contactPhone: user?.phone || '' });
      fetchRequests();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to submit'); }
    finally { setLoading(false); }
  };

  return (
    <div className="fade-in">
      <div className="page-header">
        <div className="page-header-left">
          <h1>🆘 Request Blood</h1>
          <p>Post an urgent blood requirement — our admin team will help you</p>
        </div>
      </div>

      <div className="grid-2" style={{ gap: '24px', alignItems: 'flex-start' }}>
        {/* Form */}
        <div className="card">
          <h3 style={{ marginBottom: '20px' }}>New Blood Request</h3>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div className="form-group">
              <label className="form-label">Patient Name *</label>
              <input className="form-control" name="patientName" value={form.patientName} onChange={handleChange} placeholder="Patient's full name" required />
            </div>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Blood Group *</label>
                <select className="form-control" name="bloodGroup" value={form.bloodGroup} onChange={handleChange} required>
                  <option value="">Select</option>
                  {BLOOD_GROUPS.map(bg => <option key={bg} value={bg}>{bg}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Units Required *</label>
                <input className="form-control" name="units" type="number" min={1} max={10} value={form.units} onChange={handleChange} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Urgency Level</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                {URGENCY_LEVELS.map(u => (
                  <button
                    type="button"
                    key={u}
                    onClick={() => setForm(f => ({ ...f, urgency: u }))}
                    style={{
                      flex: 1, padding: '8px', borderRadius: 'var(--radius-sm)',
                      border: `1px solid ${form.urgency === u ? (u === 'Critical' ? '#e63946' : u === 'Urgent' ? '#f39c12' : '#3498db') : 'var(--border)'}`,
                      background: form.urgency === u ? (u === 'Critical' ? 'rgba(230,57,70,0.15)' : u === 'Urgent' ? 'rgba(243,156,18,0.15)' : 'rgba(52,152,219,0.15)') : 'var(--bg-elevated)',
                      color: form.urgency === u ? (u === 'Critical' ? '#f07070' : u === 'Urgent' ? '#f5b754' : '#6ab7e8') : 'var(--text-muted)',
                      fontWeight: form.urgency === u ? 700 : 500,
                      cursor: 'pointer', fontSize: '13px',
                    }}
                  >{u}</button>
                ))}
              </div>
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
                <label className="form-label">Required By *</label>
                <input className="form-control" name="requiredDate" type="date" value={form.requiredDate} onChange={handleChange} required
                  min={new Date().toISOString().slice(0, 10)} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Hospital (optional)</label>
              <input className="form-control" name="hospital" value={form.hospital} onChange={handleChange} placeholder="Hospital name if known" />
            </div>
            <div className="form-group">
              <label className="form-label">Contact Phone *</label>
              <input className="form-control" name="contactPhone" value={form.contactPhone} onChange={handleChange} placeholder="98765XXXXX" required />
            </div>
            <div className="form-group">
              <label className="form-label">Additional Notes</label>
              <textarea className="form-control" name="notes" rows={2} value={form.notes} onChange={handleChange} placeholder="Any additional information…" />
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? '⏳ Submitting…' : '🆘 Submit Request'}
            </button>
          </form>
        </div>

        {/* My Requests */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">My Requests</span>
          </div>
          {requests.length === 0 ? (
            <div className="empty-state" style={{ padding: '30px' }}>
              <div className="icon">🆘</div>
              <p>No requests submitted yet</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {requests.map(r => (
                <div key={r._id} style={{
                  padding: '14px', borderRadius: 'var(--radius)',
                  background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                  borderLeft: `3px solid ${r.urgency === 'Critical' ? '#e63946' : r.urgency === 'Urgent' ? '#f39c12' : '#3498db'}`,
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                      <div className="blood-chip blood-chip-sm">{r.bloodGroup}</div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '14px', color: 'var(--text-primary)' }}>{r.patientName}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>📍 {r.city} · {r.units} unit(s)</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                      <span className={`badge ${urgencyBadgeClass(r.urgency)}`}>{r.urgency}</span>
                      <span className={`badge ${r.status === 'open' ? 'badge-blue' : r.status === 'fulfilled' ? 'badge-green' : 'badge-gray'}`}>{r.status}</span>
                    </div>
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px' }}>
                    Needed by {formatDate(r.requiredDate)}
                  </div>
                  {r.adminNote && (
                    <div style={{ marginTop: '6px', fontSize: '12px', color: 'var(--amber-500)', padding: '6px 10px', background: 'rgba(243,156,18,0.08)', borderRadius: '6px' }}>
                      📝 Admin: {r.adminNote}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
