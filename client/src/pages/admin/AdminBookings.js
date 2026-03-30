import React, { useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import api from '../../utils/api';
import { formatDate, formatDateTime, statusBadgeClass, getInitials } from '../../utils/helpers';

function ActionModal({ booking, onClose, onSaved }) {
  const [status, setStatus] = useState(booking.status);
  const [adminNote, setAdminNote] = useState(booking.adminNote || '');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await api.patch(`/api/bookings/${booking._id}/status`, { status, adminNote });
      toast.success(`Booking ${status}`);
      onSaved();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h3 className="modal-title">Update Booking Status</h3>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <div style={{ background: 'var(--bg-elevated)', borderRadius: 'var(--radius)', padding: '14px 16px', marginBottom: '4px' }}>
            <div style={{ fontWeight: 600, fontSize: '15px', color: 'var(--text-primary)' }}>{booking.user?.name}</div>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
              {booking.slot?.hospital?.name} · {formatDate(booking.slot?.date)} · {booking.slot?.time}
            </div>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Blood Group: <strong>{booking.bloodGroup || '—'}</strong>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">New Status</label>
            <select className="form-control" value={status} onChange={e => setStatus(e.target.value)}>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="completed">Completed</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Admin Note (optional)</label>
            <textarea className="form-control" rows={2} value={adminNote} onChange={e => setAdminNote(e.target.value)} placeholder="Message to donor…" />
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
            {loading ? '⏳' : '✓ Update Status'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [actionModal, setActionModal] = useState(null);

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/api/bookings', { params: { status: statusFilter, limit: 50 } });
      setBookings(data.bookings);
      setTotal(data.total);
    } catch { toast.error('Failed to load bookings'); }
    finally { setLoading(false); }
  }, [statusFilter]);

  useEffect(() => { fetchBookings(); }, [fetchBookings]);

  const STATUS_TABS = ['', 'pending', 'approved', 'completed', 'rejected', 'cancelled'];

  return (
    <div className="fade-in">
      <div className="page-header">
        <div className="page-header-left">
          <h1>Booking Management</h1>
          <p>{total} total bookings</p>
        </div>
        <button className="btn btn-secondary btn-sm" onClick={fetchBookings}>↻ Refresh</button>
      </div>

      <div className="tabs">
        {STATUS_TABS.map(s => (
          <button
            key={s}
            className={`tab ${statusFilter === s ? 'active' : ''}`}
            onClick={() => setStatusFilter(s)}
          >
            {s === '' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      <div className="card">
        {loading ? (
          <div className="spinner-wrap"><div className="spinner" /></div>
        ) : bookings.length === 0 ? (
          <div className="empty-state">
            <div className="icon">📋</div>
            <h3>No bookings found</h3>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Donor</th>
                  <th>Hospital</th>
                  <th>Slot</th>
                  <th>Blood Group</th>
                  <th>Status</th>
                  <th>Booked On</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map(b => (
                  <tr key={b._id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div className="avatar" style={{ width: '28px', height: '28px', fontSize: '11px' }}>{getInitials(b.user?.name)}</div>
                        <div>
                          <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '13px' }}>{b.user?.name}</div>
                          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{b.user?.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '13px' }}>{b.slot?.hospital?.name || '—'}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{b.slot?.hospital?.city}</div>
                    </td>
                    <td>
                      <div style={{ fontSize: '13px' }}>{formatDate(b.slot?.date)}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{b.slot?.time}</div>
                    </td>
                    <td>
                      {b.bloodGroup
                        ? <div className="blood-chip blood-chip-sm">{b.bloodGroup}</div>
                        : '—'}
                    </td>
                    <td><span className={`badge ${statusBadgeClass(b.status)}`}>{b.status}</span></td>
                    <td style={{ fontSize: '12px' }}>{formatDateTime(b.createdAt)}</td>
                    <td>
                      {['pending', 'approved'].includes(b.status) && (
                        <button className="btn btn-secondary btn-sm" onClick={() => setActionModal(b)}>
                          ⚙️ Update
                        </button>
                      )}
                      {b.status === 'approved' && (
                        <button
                          className="btn btn-success btn-sm"
                          style={{ marginLeft: '6px' }}
                          onClick={async () => {
                            try {
                              await api.patch(`/api/bookings/${b._id}/status`, { status: 'completed' });
                              toast.success('Marked complete');
                              fetchBookings();
                            } catch { toast.error('Failed'); }
                          }}
                        >✓ Complete</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {actionModal && (
        <ActionModal
          booking={actionModal}
          onClose={() => setActionModal(null)}
          onSaved={() => { setActionModal(null); fetchBookings(); }}
        />
      )}
    </div>
  );
}
