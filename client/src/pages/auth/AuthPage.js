import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { BLOOD_GROUPS, INDIAN_CITIES, INDIAN_STATES } from '../../utils/helpers';

export default function AuthPage() {
  const [searchParams] = useSearchParams();
  const [isRegister, setIsRegister] = useState(searchParams.get('register') === '1');
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '', email: '', password: '', bloodGroup: '', city: '', state: '', phone: '', age: '', gender: '',
  });
  const { login, register } = useAuth();
  const navigate = useNavigate();

  useEffect(() => { setIsRegister(searchParams.get('register') === '1'); }, [searchParams]);

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let user;
      if (isRegister) {
        user = await register(form);
        toast.success('Account created! Welcome to BloodBridge 🩸');
      } else {
        user = await login(form.email, form.password);
        toast.success(`Welcome back, ${user.name.split(' ')[0]}!`);
      }
      navigate(user.role === 'admin' ? '/admin' : '/dashboard', { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (role) => {
    if (role === 'admin') setForm(f => ({ ...f, email: 'admin@example.com', password: 'password123' }));
    else setForm(f => ({ ...f, email: 'user@example.com', password: 'password123' }));
    setIsRegister(false);
  };

  return (
    <div className="auth-page">
      <div className="auth-card fade-in">
        <div className="auth-logo">
          <div style={{ fontSize: '42px' }}>🩸</div>
          <div style={{ fontFamily: 'Sora, sans-serif', fontWeight: 800, fontSize: '20px', color: 'var(--text-primary)', marginTop: '6px' }}>
            BloodBridge
          </div>
        </div>

        <h2 className="auth-title">{isRegister ? 'Create Account' : 'Welcome Back'}</h2>
        <p className="auth-sub">
          {isRegister ? 'Join India\'s largest blood donation network' : 'Sign in to continue saving lives'}
        </p>

        <form onSubmit={handleSubmit} className="auth-form">
          {isRegister && (
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input className="form-control" name="name" placeholder="Ravi Kumar" value={form.name} onChange={handleChange} required />
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Email *</label>
            <input className="form-control" name="email" type="email" placeholder="you@example.com" value={form.email} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label className="form-label">Password *</label>
            <input className="form-control" name="password" type="password" placeholder="Min 6 characters" value={form.password} onChange={handleChange} required />
          </div>

          {isRegister && (
            <>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Blood Group</label>
                  <select className="form-control" name="bloodGroup" value={form.bloodGroup} onChange={handleChange}>
                    <option value="">Select</option>
                    {BLOOD_GROUPS.map(bg => <option key={bg} value={bg}>{bg}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Phone</label>
                  <input className="form-control" name="phone" placeholder="98765XXXXX" value={form.phone} onChange={handleChange} />
                </div>
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
                  <input className="form-control" name="age" type="number" placeholder="18-65" min="18" max="65" value={form.age} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label className="form-label">Gender</label>
                  <select className="form-control" name="gender" value={form.gender} onChange={handleChange}>
                    <option value="">Select</option>
                    <option>Male</option><option>Female</option><option>Other</option>
                  </select>
                </div>
              </div>
            </>
          )}

          <button className="btn btn-primary" type="submit" disabled={loading} style={{ width: '100%', marginTop: '4px' }}>
            {loading ? '⏳ Please wait...' : isRegister ? '🩸 Create Account' : '→ Sign In'}
          </button>
        </form>

        <div className="auth-divider" style={{ margin: '16px 0' }}>demo credentials</div>

        <div className="demo-creds">
          <div className="demo-creds-title">Quick Fill</div>
          <div className="demo-cred-row">
            <span>👑 Admin</span>
            <button className="btn btn-ghost btn-sm" onClick={() => fillDemo('admin')}>Fill</button>
          </div>
          <div className="demo-cred-row">
            <span>👤 User</span>
            <button className="btn btn-ghost btn-sm" onClick={() => fillDemo('user')}>Fill</button>
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '8px' }}>
            password123 for both
          </div>
        </div>

        <p className="auth-switch">
          {isRegister ? 'Already have an account? ' : "Don't have an account? "}
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => setIsRegister(r => !r)}
            style={{ color: 'var(--red-400)', padding: '0' }}
          >
            {isRegister ? 'Sign In' : 'Register'}
          </button>
        </p>

        <p style={{ textAlign: 'center', marginTop: '12px' }}>
          <Link to="/" style={{ fontSize: '13px', color: 'var(--text-muted)' }}>← Back to home</Link>
        </p>
      </div>
    </div>
  );
}
