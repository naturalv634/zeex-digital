'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Logo from '../components/Logo';

export default function Login() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('https://zeex-digital-production.up.railway.app/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email, password: form.password })
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        if (data.user.role === 'admin') router.push('/admin/dashboard');
        else if (data.user.role === 'member') router.push(`/member/${data.user.id}/dashboard`);
        else router.push(`/client/${data.user.id}/dashboard`);
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      setError('Server not connected. Make sure backend is running.');
    }
    setLoading(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleLogin();
  };

  return (
    <>
      <style>{`
        .login-outer {
          background: linear-gradient(135deg, #020B18 0%, #0A0F2C 50%, #030712 100%);
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px 16px;
          font-family: 'Inter', sans-serif;
        }
        .login-card-inner {
          background: rgba(14, 22, 48, 0.95);
          padding: 48px 44px;
          border-radius: 20px;
          width: 100%;
          max-width: 420px;
          border: 1px solid rgba(0, 212, 255, 0.2);
          box-shadow: 0 25px 60px rgba(0,0,0,0.6), 0 0 40px rgba(0,212,255,0.05);
          backdrop-filter: blur(20px);
        }
        .login-input {
          width: 100%;
          padding: 13px 16px;
          background: rgba(2, 5, 14, 0.8);
          border: 1px solid rgba(0, 212, 255, 0.25);
          border-radius: 10px;
          color: #ffffff;
          font-size: 15px;
          outline: none;
          box-sizing: border-box;
          transition: border-color 0.2s;
          font-family: inherit;
        }
        .login-input:focus {
          border-color: rgba(0, 212, 255, 0.7);
          box-shadow: 0 0 12px rgba(0,212,255,0.15);
        }
        .login-input::placeholder { color: rgba(255,255,255,0.3); }
        .login-btn {
          width: 100%;
          padding: 14px;
          background: linear-gradient(135deg, #0066FF 0%, #00D4FF 100%);
          color: #020B18;
          border: none;
          border-radius: 10px;
          font-size: 15px;
          font-weight: 800;
          cursor: pointer;
          transition: all 0.25s;
          font-family: inherit;
          letter-spacing: 0.3px;
        }
        .login-btn:hover:not(:disabled) {
          box-shadow: 0 0 24px rgba(0,212,255,0.4);
          transform: translateY(-1px);
        }
        .login-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .login-error {
          background: rgba(255,107,107,0.1);
          border: 1px solid rgba(255,107,107,0.3);
          border-radius: 10px;
          padding: 12px 16px;
          color: #FF6B6B;
          font-size: 13px;
          margin-bottom: 20px;
        }
        @media (max-width: 480px) {
          .login-card-inner {
            padding: 32px 22px;
            border-radius: 16px;
          }
        }
      `}</style>

      <div className="login-outer">
        <div className="login-card-inner">
          <div style={{ textAlign: 'center', marginBottom: '36px' }}>
            <Logo width={180} />
            <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '13.5px', marginTop: '10px', letterSpacing: '0.2px' }}>
              Project Management Portal
            </p>
          </div>

          {error && <div className="login-error">{error}</div>}

          <div style={{ marginBottom: '20px' }}>
            <label style={{ color: 'rgba(255,255,255,0.65)', fontSize: '13px', fontWeight: '600', display: 'block', marginBottom: '8px' }}>
              Email Address
            </label>
            <input
              className="login-input"
              type="email"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              onKeyDown={handleKeyDown}
              placeholder="admin@zeex.com"
            />
          </div>

          <div style={{ marginBottom: '28px' }}>
            <label style={{ color: 'rgba(255,255,255,0.65)', fontSize: '13px', fontWeight: '600', display: 'block', marginBottom: '8px' }}>
              Password
            </label>
            <input
              className="login-input"
              type="password"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              onKeyDown={handleKeyDown}
              placeholder="••••••••"
            />
          </div>

          <button className="login-btn" onClick={handleLogin} disabled={loading}>
            {loading ? 'Signing In...' : 'Sign In →'}
          </button>
        </div>
      </div>
    </>
  );
}