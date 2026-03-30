import React from 'react';
import { Link } from 'react-router-dom';

export default function Landing() {
  const features = [
    { icon: '🩸', title: 'Donate Blood', desc: 'Book your donation slot at the nearest hospital. One donation can save up to three lives.' },
    { icon: '🆘', title: 'Request Blood', desc: 'Urgent blood need? Post a request with urgency level and connect with nearby donors instantly.' },
    { icon: '🔍', title: 'Search Donors', desc: 'Find compatible donors in your city by blood group. Quick, efficient, life-saving.' },
    { icon: '🏥', title: 'Hospital Network', desc: 'Access 200+ partnered hospitals across India with real-time slot availability.' },
    { icon: '📅', title: 'Slot Booking', desc: 'Choose convenient date and time slots. Get reminders and approval notifications.' },
    { icon: '🔐', title: 'Secure & Private', desc: 'JWT-secured accounts with role-based access. Your data stays protected.' },
  ];

  const stats = [
    { num: '50,000+', label: 'Registered Donors' },
    { num: '200+', label: 'Partner Hospitals' },
    { num: '1.2L+', label: 'Lives Saved' },
    { num: '28', label: 'States Covered' },
  ];

  return (
    <div className="landing">
      {/* Navbar */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        background: 'rgba(15,15,16,0.85)', backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        padding: '0 40px', height: '64px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '32px', height: '32px',
            background: 'linear-gradient(135deg, #c0392b, #e63946)',
            borderRadius: '8px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '18px',
          }}>🩸</div>
          <span style={{ fontFamily: 'Sora, sans-serif', fontWeight: 800, fontSize: '18px' }}>BloodBridge</span>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <Link to="/auth" className="btn btn-ghost btn-sm">Log In</Link>
          <Link to="/auth?register=1" className="btn btn-primary btn-sm">Register</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="landing-hero">
        <div className="hero-eyebrow">🇮🇳 India's Blood Donation Network</div>
        <h1 className="hero-title">
          Every Drop Counts.<br />
          <span className="accent">Save a Life Today.</span>
        </h1>
        <p className="hero-sub">
          BloodBridge connects blood donors, recipients, and hospitals across India.
          Book donation slots, request emergency blood, and track everything in one place.
        </p>
        <div className="hero-cta">
          <Link to="/auth?register=1" className="btn btn-primary btn-lg">
            🩸 Start Donating
          </Link>
          <Link to="/auth" className="btn btn-secondary btn-lg">
            Sign In
          </Link>
        </div>

        <div className="hero-stats">
          {stats.map(s => (
            <div key={s.label} style={{ textAlign: 'center' }}>
              <div className="hero-stat-num">{s.num}</div>
              <div className="hero-stat-label">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="features-section">
        <div className="section-label">Features</div>
        <h2 className="section-title">Everything you need to save lives</h2>
        <div className="grid-3" style={{ gap: '20px' }}>
          {features.map(f => (
            <div key={f.title} className="feature-card">
              <div className="feature-icon">{f.icon}</div>
              <div className="feature-title">{f.title}</div>
              <div className="feature-desc">{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Banner */}
      <section style={{
        background: 'linear-gradient(135deg, rgba(192,57,43,0.2), rgba(230,57,70,0.1))',
        border: '1px solid rgba(230,57,70,0.2)',
        margin: '0 24px 80px',
        borderRadius: '24px',
        padding: '60px 40px',
        textAlign: 'center',
        maxWidth: '900px',
        marginLeft: 'auto',
        marginRight: 'auto',
      }}>
        <h2 style={{ fontSize: '36px', marginBottom: '16px' }}>Ready to make a difference?</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '16px', marginBottom: '32px' }}>
          Join thousands of donors across India. It only takes 30 minutes to donate blood and could save up to 3 lives.
        </p>
        <Link to="/auth?register=1" className="btn btn-primary btn-lg">
          Create Your Account — It's Free
        </Link>
      </section>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid var(--border)',
        padding: '40px',
        textAlign: 'center',
        color: 'var(--text-muted)',
        fontSize: '14px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '12px' }}>
          <span style={{ fontSize: '20px' }}>🩸</span>
          <span style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: '16px', color: 'var(--text-secondary)' }}>BloodBridge</span>
        </div>
        <p>© 2024 BloodBridge — Connecting donors, saving lives across India.</p>
        <p style={{ marginTop: '6px', fontSize: '12px' }}>Built with ❤️ by Abhishek Kumar Mishra</p>
      </footer>
    </div>
  );
}
