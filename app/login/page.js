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
      const res = await fetch('https://zeex-backend.vercel.app/api/auth/login', {
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

  return (
    <div style={{
      backgroundColor: '#0A0F2C',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Inter, sans-serif'
    }}>
      <div style={{
        backgroundColor: '#1E2A45',
        padding: '48px',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '420px',
        border: '1px solid rgba(0, 212, 255, 0.2)',
        boxShadow: '0 25px 50px rgba(0,0,0,0.5)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <Logo width={200} />
          <p style={{ color: '#FFFFFF', opacity: 0.5, fontSize: '14px', marginTop: '8px' }}>Project Management Portal</p>
        </div>

        {error && (
          <div style={{
            backgroundColor: 'rgba(255,107,107,0.1)',
            border: '1px solid rgba(255,107,107,0.3)',
            borderRadius: '8px', padding: '12px 16px',
            color: '#FF6B6B', fontSize: '13px', marginBottom: '20px'
          }}>{error}</div>
        )}

        <div style={{ marginBottom: '20px' }}>
          <label style={{ color: '#FFFFFF', opacity: 0.7, fontSize: '14px', display: 'block', marginBottom: '8px' }}>Email Address</label>
          <input
            type="email"
            value={form.email}
            onChange={e => setForm({ ...form, email: e.target.value })}
            placeholder="admin@zeex.com"
            style={{
              width: '100%', padding: '12px 16px',
              backgroundColor: '#0A0F2C',
              border: '1px solid rgba(0, 212, 255, 0.3)',
              borderRadius: '8px', color: '#FFFFFF',
              fontSize: '15px', outline: 'none', boxSizing: 'border-box'
            }}
          />
        </div>

        <div style={{ marginBottom: '28px' }}>
          <label style={{ color: '#FFFFFF', opacity: 0.7, fontSize: '14px', display: 'block', marginBottom: '8px' }}>Password</label>
          <input
            type="password"
            value={form.password}
            onChange={e => setForm({ ...form, password: e.target.value })}
            placeholder="••••••••"
            style={{
              width: '100%', padding: '12px 16px',
              backgroundColor: '#0A0F2C',
              border: '1px solid rgba(0, 212, 255, 0.3)',
              borderRadius: '8px', color: '#FFFFFF',
              fontSize: '15px', outline: 'none', boxSizing: 'border-box'
            }}
          />
        </div>

        <button
          onClick={handleLogin}
          disabled={loading}
          style={{
            width: '100%', padding: '14px',
            backgroundColor: loading ? 'rgba(0,212,255,0.5)' : '#00D4FF',
            color: '#0A0F2C', border: 'none',
            borderRadius: '8px', fontSize: '16px',
            fontWeight: 'bold', cursor: loading ? 'not-allowed' : 'pointer'
          }}>
          {loading ? 'Signing In...' : 'Sign In'}
        </button>
      </div>
    </div>
  );
}