import React, { useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import api from '../../utils/api';
import { formatDate, urgencyBadgeClass, timeAgo } from '../../utils/helpers';

function RequestModal({ request, onClose, onSaved }) {
  const [status, setStatus] = useState(request.status);
  const [adminNote, setAdminNote] = useState(request.adminNote || '');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await api.patch(`/api/requests/${request._id}/status`, { status, adminNote });
      toast.success('Request updated');
      onSaved();
    } catch { toast.error('Failed'); }
    finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h3 className="modal-title">Manage Blood Request</h3>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <div style={{ background: 'var(--bg-elevated)', borderRadius: 'var(--radius)', padding: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
              <div className="blood-chip">{request.bloodGroup}</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '15px', color: 'var(--text-primary)' }}>{request.patientName}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Requested by {request.requester?.name}</div>
              </div>
              <span className={`badge ${urgencyBadgeClass(request.urgency)}`} style={{ marginLeft: 'auto' }}>{request.urgency}</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>
              <span>📍 {request.city}</span>
              <span>🏥 {request.hospital || 'Any'}</span>
              <span>🩸 {request.units} unit(s)</span>
              <span>📅 Needed by {formatDate(request.requiredDate)}</span>
              <span>📞 {request.contactPhone}</span>
            </div>
            {request.notes && <p style={{ marginTop: '8px', fontSize: '13px', color: 'var(--text-muted)', fontStyle: 'italic' }}>"{request.notes}"</p>}
          </div>
          <div className="form-group">
            <label className="form-label">Status</label>
            <select className="form-control" value={status} onChange={e => setStatus(e.target.value)}>
              <option value="open">Open</option>
              <option value="fulfilled">Fulfilled</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Admin Note</label>
            <textarea className="form-control" rows={2} value={adminNote} onChange={e => setAdminNote(e.target.value)} placeholder="Update for the requester…" />
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
            {loading ? '⏳' : '✓ Update Request'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminRequests() {
  const [requests, setRequests] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('open');
  const [urgencyFilter, setUrgencyFilter] = useState('');
  const [modal, setModal] = useState(null);

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/api/requests', { params: { status: statusFilter, urgency: urgencyFilter, limit: 50 } });
      setRequests(data.requests);
      setTotal(data.total);
    } catch { toast.error('Failed to load requests'); }
    finally { setLoading(false); }
  }, [statusFilter, urgencyFilter]);

  useEffect(() => { fetchRequests(); }, [fetchRequests]);

  return (
    <div className="fade-in">
      <div className="page-header">
        <div className="page-header-left">
          <h1>Blood Requests</h1>
          <p>{total} total requests</p>
        </div>
        <button className="btn btn-secondary btn-sm" onClick={fetchRequests}>↻ Refresh</button>
      </div>

      <div className="card" style={{ marginBottom: '20px', padding: '16px 20px' }}>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <select className="form-control" style={{ width: '160px' }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="">All Status</option>
            <option value="open">Open</option>
            <option value="fulfilled">Fulfilled</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <select className="form-control" style={{ width: '160px' }} value={urgencyFilter} onChange={e => setUrgencyFilter(e.target.value)}>
            <option value="">All Urgency</option>
            <option value="Critical">Critical</option>
            <option value="Urgent">Urgent</option>
            <option value="Normal">Normal</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="spinner-wrap"><div className="spinner" /></div>
      ) : requests.length === 0 ? (
        <div className="empty-state">
          <div className="icon">🆘</div>
          <h3>No blood requests</h3>
          <p>All requests have been handled</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {requests.map(r => (
            <div
              key={r._id}
              className="card card-sm"
              style={{
                borderLeft: `3px solid ${r.urgency === 'Critical' ? '#e63946' : r.urgency === 'Urgent' ? '#f39c12' : '#3498db'}`,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', flexWrap: 'wrap' }}>
                <div className="blood-chip">{r.bloodGroup}</div>
                <div style={{ flex: 1, minWidth: '200px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{ fontWeight: 700, fontSize: '15px', color: 'var(--text-primary)' }}>{r.patientName}</span>
                    <span className={`badge ${urgencyBadgeClass(r.urgency)}`}>{r.urgency}</span>
                    <span className={`badge ${r.status === 'open' ? 'badge-blue' : r.status === 'fulfilled' ? 'badge-green' : 'badge-gray'}`}>{r.status}</span>
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)', display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                    <span>👤 {r.requester?.name}</span>
                    <span>📍 {r.city}</span>
                    <span>🩸 {r.units} unit(s)</span>
                    <span>📅 By {formatDate(r.requiredDate)}</span>
                    <span>📞 {r.contactPhone}</span>
                  </div>
                  {r.hospital && <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>🏥 {r.hospital}</div>}
                  {r.adminNote && <div style={{ fontSize: '12px', color: 'var(--amber-500)', marginTop: '4px' }}>📝 Admin: {r.adminNote}</div>}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{timeAgo(r.createdAt)}</span>
                  {r.status === 'open' && (
                    <button className="btn btn-secondary btn-sm" onClick={() => setModal(r)}>⚙️ Manage</button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal && (
        <RequestModal
          request={modal}
          onClose={() => setModal(null)}
          onSaved={() => { setModal(null); fetchRequests(); }}
        />
      )}
    </div>
  );
}
