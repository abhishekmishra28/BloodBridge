import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { INDIAN_CITIES, BLOOD_GROUPS, formatDate, statusBadgeClass } from '../../utils/helpers';

export default function DonatePage() {
  const { user, refreshUser } = useAuth();
  const [step, setStep] = useState(1); // 1=filter, 2=slots, 3=confirm
  const [city, setCity] = useState(user?.city || '');
  const [date, setDate] = useState('');
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [bloodGroup, setBloodGroup] = useState(user?.bloodGroup || '');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [bookingLoading, setBookingLoading] = useState(false);

  // Load my bookings
  useEffect(() => {
    api.get('/bookings/my').then(r => setBookings(r.data.bookings));
  }, []);

  const searchSlots = async () => {
    if (!city) { toast.error('Please select a city'); return; }
    setLoading(true);
    try {
      const { data } = await api.get('/slots', { params: { city, date } });
      setSlots(data.slots);
      setStep(2);
      if (data.slots.length === 0) toast('No slots found for selected filters', { icon: 'ℹ️' });
    } catch { toast.error('Failed to fetch slots'); }
    finally { setLoading(false); }
  };

  const confirmBooking = async () => {
    if (!selectedSlot) return;
    setBookingLoading(true);
    try {
      await api.post('/bookings', { slotId: selectedSlot._id, bloodGroup, notes });
      toast.success('Booking submitted! Awaiting admin approval 🎉');
      await refreshUser();
      setStep(1);
      setSelectedSlot(null);
      setSlots([]);
      // Refresh bookings
      const r = await api.get('/bookings/my');
      setBookings(r.data.bookings);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Booking failed');
    } finally { setBookingLoading(false); }
  };

  const canDonate = user?.canDonate !== false;

  return (
    <div className="fade-in">
      <div className="page-header">
        <div className="page-header-left">
          <h1>🩸 Donate Blood</h1>
          <p>Find a slot at a nearby hospital and book your donation</p>
        </div>
      </div>

      {/* 3-month restriction warning */}
      {!canDonate && (
        <div style={{ background: 'rgba(243,156,18,0.12)', border: '1px solid rgba(243,156,18,0.3)', borderRadius: 'var(--radius-lg)', padding: '16px 20px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '24px' }}>⏳</span>
          <div>
            <div style={{ fontWeight: 700, color: 'var(--amber-500)' }}>Donation Cooldown Active</div>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>
              You donated on {formatDate(user?.lastDonationDate)}. You can donate again after the 3-month period.
            </div>
          </div>
        </div>
      )}

      <div className="grid-2" style={{ gap: '24px', alignItems: 'flex-start' }}>
        {/* Left: Search / Slot List / Confirm */}
        <div>
          {step === 1 && (
            <div className="card">
              <h3 style={{ marginBottom: '20px' }}>Find Donation Slots</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">City *</label>
                  <select className="form-control" value={city} onChange={e => setCity(e.target.value)}>
                    <option value="">Select City</option>
                    {INDIAN_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Date (optional)</label>
                  <input className="form-control" type="date" value={date} onChange={e => setDate(e.target.value)}
                    min={new Date().toISOString().slice(0, 10)} />
                </div>
                <button
                  className="btn btn-primary"
                  onClick={searchSlots}
                  disabled={loading || !canDonate}
                  style={{ width: '100%' }}
                >
                  {loading ? '⏳ Searching…' : '🔍 Find Slots'}
                </button>
                {!canDonate && <p style={{ fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center' }}>Donation restricted — cooldown active</p>}
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                <button className="btn btn-ghost btn-sm" onClick={() => setStep(1)}>← Back</button>
                <span style={{ color: 'var(--text-muted)', fontSize: '14px' }}>{slots.length} slots in {city}</span>
              </div>
              {slots.length === 0 ? (
                <div className="card">
                  <div className="empty-state">
                    <div className="icon">📅</div>
                    <h3>No slots available</h3>
                    <p>Try a different city or date</p>
                    <button className="btn btn-secondary btn-sm" style={{ marginTop: '12px' }} onClick={() => setStep(1)}>Search Again</button>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {slots.map(s => {
                    const available = s.capacity - s.bookedCount;
                    const isFull = available <= 0;
                    const isSelected = selectedSlot?._id === s._id;
                    return (
                      <div
                        key={s._id}
                        onClick={() => !isFull && setSelectedSlot(s)}
                        style={{
                          padding: '14px 18px',
                          borderRadius: 'var(--radius-lg)',
                          border: `1px solid ${isSelected ? 'var(--red-500)' : 'var(--border)'}`,
                          background: isSelected ? 'rgba(230,57,70,0.08)' : 'var(--bg-card)',
                          cursor: isFull ? 'not-allowed' : 'pointer',
                          opacity: isFull ? 0.5 : 1,
                          transition: 'all 0.18s',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <div>
                            <div style={{ fontWeight: 700, fontSize: '15px', color: 'var(--text-primary)' }}>{s.hospital?.name}</div>
                            <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>📍 {s.hospital?.address}</div>
                            <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '6px' }}>
                              📅 {formatDate(s.date)} &nbsp;·&nbsp; ⏰ {s.time}
                            </div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <span className={`badge ${isFull ? 'badge-red' : 'badge-green'}`}>
                              {isFull ? 'Full' : `${available} spots`}
                            </span>
                            {isSelected && <div style={{ marginTop: '6px', fontSize: '12px', color: 'var(--red-400)', fontWeight: 700 }}>✓ Selected</div>}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              {selectedSlot && (
                <button className="btn btn-primary" style={{ width: '100%', marginTop: '16px' }} onClick={() => setStep(3)}>
                  Continue with {selectedSlot.hospital?.name} →
                </button>
              )}
            </div>
          )}

          {step === 3 && selectedSlot && (
            <div className="card">
              <h3 style={{ marginBottom: '20px' }}>Confirm Booking</h3>
              <div style={{ background: 'var(--bg-elevated)', borderRadius: 'var(--radius)', padding: '16px', marginBottom: '20px' }}>
                <div style={{ fontWeight: 700, fontSize: '15px', color: 'var(--text-primary)', marginBottom: '6px' }}>{selectedSlot.hospital?.name}</div>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                  📅 {formatDate(selectedSlot.date)} &nbsp;·&nbsp; ⏰ {selectedSlot.time}
                </div>
                <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>📍 {selectedSlot.hospital?.address}</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div className="form-group">
                  <label className="form-label">Blood Group</label>
                  <select className="form-control" value={bloodGroup} onChange={e => setBloodGroup(e.target.value)}>
                    <option value="">Select</option>
                    {BLOOD_GROUPS.map(bg => <option key={bg} value={bg}>{bg}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Notes (optional)</label>
                  <textarea className="form-control" rows={2} value={notes} onChange={e => setNotes(e.target.value)} placeholder="Any special notes for the hospital…" />
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setStep(2)}>← Back</button>
                  <button className="btn btn-primary" style={{ flex: 2 }} onClick={confirmBooking} disabled={bookingLoading}>
                    {bookingLoading ? '⏳ Booking…' : '🩸 Confirm Booking'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right: My Bookings */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">My Bookings</span>
          </div>
          {bookings.length === 0 ? (
            <div className="empty-state" style={{ padding: '30px' }}>
              <div className="icon">📋</div>
              <p>No bookings yet</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {bookings.map(b => (
                <div key={b._id} style={{ padding: '12px', background: 'var(--bg-elevated)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '14px', color: 'var(--text-primary)' }}>{b.slot?.hospital?.name || 'Hospital'}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{formatDate(b.slot?.date)} · {b.slot?.time}</div>
                    </div>
                    <span className={`badge ${statusBadgeClass(b.status)}`}>{b.status}</span>
                  </div>
                  {b.adminNote && (
                    <div style={{ marginTop: '6px', fontSize: '12px', color: 'var(--amber-500)' }}>📝 {b.adminNote}</div>
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
