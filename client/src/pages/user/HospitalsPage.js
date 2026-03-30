import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { INDIAN_CITIES, formatDate } from '../../utils/helpers';

function BookSlotModal({ hospital, onClose, onBooked }) {
  const { user } = useAuth();
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [bloodGroup, setBloodGroup] = useState(user?.bloodGroup || '');
  const [loading, setLoading] = useState(false);
  const [slotsLoading, setSlotsLoading] = useState(true);

  useEffect(() => {
    api.get('/slots', { params: { hospitalId: hospital._id } })
      .then(r => setSlots(r.data.slots.filter(s => s.availableSpots > 0)))
      .finally(() => setSlotsLoading(false));
  }, [hospital._id]);

  const book = async () => {
    if (!selectedSlot) { toast.error('Select a slot'); return; }
    setLoading(true);
    try {
      await api.post('/bookings', { slotId: selectedSlot._id, bloodGroup });
      toast.success('Slot booked! Awaiting approval 🎉');
      onBooked();
    } catch (err) { toast.error(err.response?.data?.message || 'Booking failed'); }
    finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <div>
            <h3 className="modal-title">Book Slot</h3>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>{hospital.name}</div>
          </div>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <div className="form-group">
            <label className="form-label">Your Blood Group</label>
            <select className="form-control" value={bloodGroup} onChange={e => setBloodGroup(e.target.value)}>
              <option value="">Select</option>
              {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(bg => <option key={bg} value={bg}>{bg}</option>)}
            </select>
          </div>
          <div>
            <div className="form-label" style={{ marginBottom: '8px' }}>Available Slots</div>
            {slotsLoading ? (
              <div className="spinner-wrap" style={{ padding: '30px' }}><div className="spinner" /></div>
            ) : slots.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)', fontSize: '14px' }}>
                No available slots for this hospital
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '280px', overflowY: 'auto' }}>
                {slots.map(s => (
                  <div
                    key={s._id}
                    onClick={() => setSelectedSlot(s)}
                    style={{
                      padding: '12px 14px', borderRadius: 'var(--radius)',
                      border: `1px solid ${selectedSlot?._id === s._id ? 'var(--red-500)' : 'var(--border)'}`,
                      background: selectedSlot?._id === s._id ? 'rgba(230,57,70,0.08)' : 'var(--bg-elevated)',
                      cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>{s.time}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{formatDate(s.date)}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span className="badge badge-green">{s.availableSpots} spots</span>
                      {selectedSlot?._id === s._id && <div style={{ fontSize: '11px', color: 'var(--red-400)', marginTop: '2px' }}>✓ Selected</div>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={book} disabled={loading || !selectedSlot}>
            {loading ? '⏳ Booking…' : '🩸 Book Slot'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function HospitalsPage() {
  const { user } = useAuth();
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [city, setCity] = useState(user?.city || '');
  const [bookModal, setBookModal] = useState(null);
  const [search, setSearch] = useState('');

  const fetchHospitals = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/hospitals', { params: { city, limit: 100 } });
      setHospitals(data.hospitals);
    } catch { toast.error('Failed to load hospitals'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchHospitals(); }, [city]);

  const filtered = hospitals.filter(h =>
    !search || h.name.toLowerCase().includes(search.toLowerCase()) || h.address.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fade-in">
      <div className="page-header">
        <div className="page-header-left">
          <h1>🏥 Hospitals</h1>
          <p>Find partner hospitals and book donation slots</p>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '24px', padding: '16px 20px' }}>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <div className="search-bar" style={{ flex: 1 }}>
            <span className="search-icon">🔍</span>
            <input placeholder="Search by name or address…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="form-control" style={{ width: '180px' }} value={city} onChange={e => setCity(e.target.value)}>
            <option value="">All Cities</option>
            {INDIAN_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="spinner-wrap"><div className="spinner" /></div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="icon">🏥</div>
          <h3>No hospitals found</h3>
          <p>Try a different city</p>
        </div>
      ) : (
        <>
          <div style={{ marginBottom: '16px', color: 'var(--text-muted)', fontSize: '14px' }}>
            Showing <strong style={{ color: 'var(--text-primary)' }}>{filtered.length}</strong> hospital{filtered.length !== 1 ? 's' : ''}
          </div>
          <div className="grid-2" style={{ gap: '16px' }}>
            {filtered.map(h => (
              <div key={h._id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '16px', color: 'var(--text-primary)', marginBottom: '4px' }}>{h.name}</div>
                    <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>📍 {h.address}</div>
                    <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{h.city}, {h.state}{h.pincode && ` — ${h.pincode}`}</div>
                  </div>
                  <span className="badge badge-green">Active</span>
                </div>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                  📞 {h.phone}
                  {h.email && <span style={{ marginLeft: '12px' }}>✉️ {h.email}</span>}
                </div>
                {h.bloodGroups?.length > 0 && (
                  <div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '6px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Available Blood Types</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                      {h.bloodGroups.map(bg => (
                        <span key={bg} style={{
                          padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 700,
                          background: 'rgba(230,57,70,0.15)', color: 'var(--red-400)',
                        }}>{bg}</span>
                      ))}
                    </div>
                  </div>
                )}
                {h.description && (
                  <div style={{ fontSize: '13px', color: 'var(--text-muted)', fontStyle: 'italic' }}>{h.description}</div>
                )}
                <button className="btn btn-primary btn-sm" onClick={() => setBookModal(h)}>
                  📅 Book Donation Slot
                </button>
              </div>
            ))}
          </div>
        </>
      )}

      {bookModal && (
        <BookSlotModal
          hospital={bookModal}
          onClose={() => setBookModal(null)}
          onBooked={() => setBookModal(null)}
        />
      )}
    </div>
  );
}
