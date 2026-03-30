import React, { useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import api from '../../utils/api';
import { formatDate } from '../../utils/helpers';

const TIMES = ['8:00 AM','9:00 AM','10:00 AM','11:00 AM','12:00 PM','1:00 PM','2:00 PM','3:00 PM','4:00 PM','5:00 PM'];
const EMPTY_FORM = { hospital: '', date: '', time: '', capacity: 10 };

function SlotModal({ slot, hospitals, onClose, onSaved }) {
  const [form, setForm] = useState(slot
    ? { hospital: slot.hospital?._id || '', date: slot.date?.slice(0, 10) || '', time: slot.time, capacity: slot.capacity }
    : EMPTY_FORM
  );
  const [loading, setLoading] = useState(false);
  const isEdit = Boolean(slot?._id);

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isEdit) {
        await api.put(`/api/slots/${slot._id}`, form);
        toast.success('Slot updated');
      } else {
        await api.post('/api/slots', form);
        toast.success('Slot created');
      }
      onSaved();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h3 className="modal-title">{isEdit ? 'Edit Slot' : 'Create Donation Slot'}</h3>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Hospital *</label>
              <select className="form-control" name="hospital" value={form.hospital} onChange={handleChange} required>
                <option value="">Select Hospital</option>
                {hospitals.map(h => <option key={h._id} value={h._id}>{h.name} — {h.city}</option>)}
              </select>
            </div>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Date *</label>
                <input className="form-control" name="date" type="date" value={form.date} onChange={handleChange} required
                  min={new Date().toISOString().slice(0, 10)} />
              </div>
              <div className="form-group">
                <label className="form-label">Time *</label>
                <select className="form-control" name="time" value={form.time} onChange={handleChange} required>
                  <option value="">Select Time</option>
                  {TIMES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Capacity (max donors)</label>
              <input className="form-control" name="capacity" type="number" min={1} max={50} value={form.capacity} onChange={handleChange} />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? '⏳ Saving…' : isEdit ? '✓ Update' : '+ Create Slot'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AdminSlots() {
  const [slots, setSlots] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [hospitalFilter, setHospitalFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [slotsRes, hospRes] = await Promise.all([
        api.get('/api/slots', { params: { hospitalId: hospitalFilter, date: dateFilter } }),
        api.get('/api/hospitals', { params: { limit: 100 } }),
      ]);
      setSlots(slotsRes.data.slots);
      setHospitals(hospRes.data.hospitals);
    } catch { toast.error('Failed to load slots'); }
    finally { setLoading(false); }
  }, [hospitalFilter, dateFilter]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const deleteSlot = async (id) => {
    if (!window.confirm('Delete this slot?')) return;
    try {
      await api.delete(`/api/slots/${id}`);
      toast.success('Slot deleted');
      fetchAll();
    } catch { toast.error('Failed'); }
  };

  return (
    <div className="fade-in">
      <div className="page-header">
        <div className="page-header-left">
          <h1>Slot Management</h1>
          <p>Create and manage donation time slots</p>
        </div>
        <button className="btn btn-primary" onClick={() => setModal('add')}>+ Create Slot</button>
      </div>

      <div className="card" style={{ marginBottom: '20px', padding: '16px 20px' }}>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <select className="form-control" style={{ width: '200px' }} value={hospitalFilter} onChange={e => setHospitalFilter(e.target.value)}>
            <option value="">All Hospitals</option>
            {hospitals.map(h => <option key={h._id} value={h._id}>{h.name}</option>)}
          </select>
          <input
            className="form-control"
            type="date"
            style={{ width: '180px' }}
            value={dateFilter}
            onChange={e => setDateFilter(e.target.value)}
          />
          <button className="btn btn-secondary btn-sm" onClick={() => { setHospitalFilter(''); setDateFilter(''); }}>Clear</button>
          <button className="btn btn-secondary btn-sm" onClick={fetchAll}>↻ Refresh</button>
        </div>
      </div>

      <div className="card">
        {loading ? (
          <div className="spinner-wrap"><div className="spinner" /></div>
        ) : slots.length === 0 ? (
          <div className="empty-state">
            <div className="icon">📅</div>
            <h3>No slots found</h3>
            <p>Create donation slots for hospitals</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Hospital</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Capacity</th>
                  <th>Booked</th>
                  <th>Available</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {slots.map(s => {
                  const available = s.capacity - s.bookedCount;
                  const isFull = available <= 0;
                  const isPast = new Date(s.date) < new Date();
                  return (
                    <tr key={s._id}>
                      <td>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '14px' }}>{s.hospital?.name}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>📍 {s.hospital?.city}</div>
                      </td>
                      <td>{formatDate(s.date)}</td>
                      <td><span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{s.time}</span></td>
                      <td>{s.capacity}</td>
                      <td>
                        <span style={{ fontWeight: 700, color: s.bookedCount > 0 ? 'var(--amber-500)' : 'var(--text-muted)' }}>
                          {s.bookedCount}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontWeight: 700, color: isFull ? 'var(--red-400)' : 'var(--green-500)' }}>
                          {isFull ? 'Full' : available}
                        </span>
                      </td>
                      <td>
                        {isPast
                          ? <span className="badge badge-gray">Past</span>
                          : isFull
                            ? <span className="badge badge-red">Full</span>
                            : <span className="badge badge-green">Open</span>
                        }
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button className="btn btn-secondary btn-sm" onClick={() => setModal(s)}>✏️ Edit</button>
                          <button className="btn btn-danger btn-sm" onClick={() => deleteSlot(s._id)}>🗑</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modal && (
        <SlotModal
          slot={modal === 'add' ? null : modal}
          hospitals={hospitals}
          onClose={() => setModal(null)}
          onSaved={() => { setModal(null); fetchAll(); }}
        />
      )}
    </div>
  );
}
