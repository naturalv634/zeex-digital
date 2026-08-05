'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  LayoutDashboard, Users, Handshake, Bell,
  Eye, EyeOff, Zap, ArrowRight, CheckCircle2,
} from 'lucide-react';

const C = {
  bg: '#02050E', card: '#080E1E', card2: '#0C1327',
  border: '#1E2D56', border2: '#2A3F75',
  primary: '#00F0FF', primaryDark: '#0072FF',
  green: '#00E599', red: '#FF4757', orange: '#FF9900',
  muted: '#4A628A', muted2: '#7590C2', text: '#FFFFFF', text2: '#C9D6F0',
};

const FEATURES = [
  { Icon: LayoutDashboard, label: 'Real-time Dashboard',  desc: 'Live project tracking with progress' },
  { Icon: Users,           label: 'Team Management',      desc: 'Assign tasks, track performance' },
  { Icon: Handshake,       label: 'Client Portal',        desc: 'Professional client-facing portal' },
  { Icon: Bell,            label: 'Smart Notifications',  desc: 'Instant alerts for tasks & deadlines' },
];

const SERVICES = ['WordPress', 'React', 'Figma/UI', 'Mobile Apps', 'SEO', 'Video Editing', 'QA Testing', 'Content Writing'];

export default function Home() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const handleAuth = async () => {
    if (!form.email || !form.password) { setError('Email aur password required hain'); return; }
    setLoading(true);
    setError('');
    try {
      const res = await fetch('https://zeex-digital-production.up.railway.app/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email, password: form.password }),
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        if      (data.user.role === 'admin')  router.push('/admin/dashboard');
        else if (data.user.role === 'member') router.push(`/member/${data.user.id}/dashboard`);
        else                                  router.push(`/client/${data.user.id}/dashboard`);
      } else {
        setError(data.error || 'Login failed. Check credentials.');
      }
    } catch {
      setError('Server se connect nahi ho pa raha!');
    }
    setLoading(false);
  };

  const handleKey = (e) => { if (e.key === 'Enter') handleAuth(); };

  return (
    <div style={{
      backgroundColor: C.bg, minHeight: '100vh', display: 'flex',
      fontFamily: "var(--font, 'Inter', sans-serif)",
      backgroundImage: `
        radial-gradient(ellipse at 20% 50%, rgba(0,114,255,0.07) 0%, transparent 60%),
        radial-gradient(ellipse at 80% 20%, rgba(0,240,255,0.05) 0%, transparent 50%)
      `,
    }}>

      {/* ── LEFT: Branding ───────────────────────── */}
      <div style={{
        flex: 1, padding: '60px 64px', display: 'flex', flexDirection: 'column', justifyContent: 'center',
        borderRight: `1px solid ${C.border}`, position: 'relative', overflow: 'hidden',
      }}>
        {/* Decorative glow orbs */}
        <div style={{ position: 'absolute', top: '-80px', left: '-80px', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(0,114,255,0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-60px', right: '-60px', width: '240px', height: '240px', background: 'radial-gradient(circle, rgba(0,240,255,0.07) 0%, transparent 70%)', pointerEvents: 'none' }} />

        {/* Logo */}
        <div style={{ marginBottom: '48px', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
            <img src="/logo.png" alt="ZEEX Digital" style={{ height: '56px', objectFit: 'contain' }} />
            <div>
              <p style={{ color: C.muted, fontSize: '13px', margin: 0, marginTop: '4px' }}>Project Management Portal</p>
            </div>
          </div>
          {/* Tagline */}
          <h2 style={{ color: C.text, fontSize: '36px', fontWeight: '900', margin: '0 0 14px', lineHeight: 1.15, letterSpacing: '-0.8px' }}>
            Manage Projects.<br />
            <span style={{ background: `linear-gradient(135deg, ${C.primaryDark}, ${C.primary})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Deliver Results.
            </span>
          </h2>
          <p style={{ color: C.muted2, fontSize: '14.5px', margin: 0, lineHeight: 1.7, maxWidth: '420px' }}>
            A complete project management solution for ZEEX-Digital — track projects, manage team members, and keep clients updated in real-time.
          </p>
        </div>

        {/* Features */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '48px', position: 'relative', zIndex: 1 }}>
          {FEATURES.map(({ Icon, label, desc }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{
                width: '40px', height: '40px', borderRadius: '11px', flexShrink: 0,
                backgroundColor: 'rgba(0,240,255,0.08)',
                border: `1px solid rgba(0,240,255,0.15)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Icon size={18} color={C.primary} strokeWidth={2} />
              </div>
              <div>
                <p style={{ color: C.text, fontSize: '13.5px', fontWeight: '700', margin: 0 }}>{label}</p>
                <p style={{ color: C.muted, fontSize: '12px', margin: 0 }}>{desc}</p>
              </div>
              <CheckCircle2 size={14} color={C.green} style={{ marginLeft: 'auto', flexShrink: 0 }} />
            </div>
          ))}
        </div>

        {/* Services */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <p style={{ color: C.muted, fontSize: '10.5px', margin: '0 0 10px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '700' }}>
            Our Services
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '7px' }}>
            {SERVICES.map(s => (
              <span key={s} style={{
                backgroundColor: 'rgba(255,255,255,0.04)', color: C.muted2,
                fontSize: '11.5px', padding: '4px 12px', borderRadius: '20px',
                border: `1px solid ${C.border}`,
              }}>{s}</span>
            ))}
          </div>
        </div>
      </div>

      {/* ── RIGHT: Auth Form ──────────────────────── */}
      <div style={{
        width: '460px', flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '60px 44px', backgroundColor: C.card,
      }}>
        <div style={{ width: '100%', opacity: mounted ? 1 : 0, transform: mounted ? 'none' : 'translateY(12px)', transition: 'all 0.4s ease' }}>

          {/* Header */}
          <div style={{ marginBottom: '32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <Zap size={18} color={C.primary} />
              <span style={{ color: C.primary, fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                Secure Login
              </span>
            </div>
            <h2 style={{ color: C.text, fontSize: '26px', fontWeight: '900', margin: '0 0 6px', letterSpacing: '-0.4px' }}>
              Welcome Back
            </h2>
            <p style={{ color: C.muted2, fontSize: '13.5px', margin: 0 }}>
              Sign in to your ZEEX-Digital account
            </p>
          </div>

          {/* Error */}
          {error && (
            <div style={{
              backgroundColor: 'rgba(255,71,87,0.1)', border: `1px solid rgba(255,71,87,0.3)`,
              borderRadius: '10px', padding: '12px 16px', color: C.red,
              fontSize: '13px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px',
            }}>
              ⚠ {error}
            </div>
          )}

          {/* Email Field */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ color: C.muted2, fontSize: '12.5px', display: 'block', marginBottom: '8px', fontWeight: '600' }}>
              Email Address
            </label>
            <input
              type="email"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              onKeyDown={handleKey}
              placeholder="you@zeex-digital.com"
              style={{
                width: '100%', padding: '12px 16px',
                backgroundColor: C.bg, border: `1px solid ${C.border}`,
                borderRadius: '10px', color: C.text, fontSize: '14px',
                outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box',
                transition: 'all 0.2s',
              }}
              onFocus={e => { e.target.style.borderColor = C.primary; e.target.style.boxShadow = `0 0 14px rgba(0,240,255,0.15)`; }}
              onBlur={e => { e.target.style.borderColor = C.border; e.target.style.boxShadow = 'none'; }}
            />
          </div>

          {/* Password Field */}
          <div style={{ marginBottom: '26px' }}>
            <label style={{ color: C.muted2, fontSize: '12.5px', display: 'block', marginBottom: '8px', fontWeight: '600' }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPass ? 'text' : 'password'}
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                onKeyDown={handleKey}
                placeholder="••••••••"
                style={{
                  width: '100%', padding: '12px 42px 12px 16px',
                  backgroundColor: C.bg, border: `1px solid ${C.border}`,
                  borderRadius: '10px', color: C.text, fontSize: '14px',
                  outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box',
                  transition: 'all 0.2s',
                }}
                onFocus={e => { e.target.style.borderColor = C.primary; e.target.style.boxShadow = `0 0 14px rgba(0,240,255,0.15)`; }}
                onBlur={e => { e.target.style.borderColor = C.border; e.target.style.boxShadow = 'none'; }}
              />
              <button
                type="button"
                onClick={() => setShowPass(v => !v)}
                style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: C.muted, padding: 0 }}
              >
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            onClick={handleAuth}
            disabled={loading}
            style={{
              width: '100%', padding: '13px',
              background: loading ? `rgba(0,240,255,0.3)` : `linear-gradient(135deg, ${C.primaryDark}, ${C.primary})`,
              color: '#030712', border: 'none', borderRadius: '10px',
              fontSize: '15px', fontWeight: '800', cursor: loading ? 'not-allowed' : 'pointer',
              marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              boxShadow: loading ? 'none' : `0 0 20px rgba(0,240,255,0.3)`,
              transition: 'all 0.2s', fontFamily: 'inherit',
            }}
            onMouseEnter={e => { if (!loading) { e.currentTarget.style.boxShadow = `0 0 30px rgba(0,240,255,0.5)`; e.currentTarget.style.transform = 'translateY(-1px)'; } }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = `0 0 20px rgba(0,240,255,0.3)`; e.currentTarget.style.transform = 'none'; }}
          >
            {loading ? (
              <>
                <span style={{ width: 14, height: 14, border: `2px solid #030712`, borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.6s linear infinite' }} />
                Signing in...
              </>
            ) : (
              <>Sign In <ArrowRight size={16} /></>
            )}
          </button>

          {/* Quick Access */}
          <div style={{ padding: '16px', backgroundColor: C.bg, borderRadius: '12px', border: `1px solid ${C.border}` }}>
            <p style={{ color: C.muted, fontSize: '10.5px', margin: '0 0 12px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '700' }}>
              Quick Access
            </p>
            <div
              onClick={() => setForm({ email: 'admin@zeex.com', password: 'admin1234' })}
              style={{
                padding: '10px 14px', backgroundColor: 'rgba(0,240,255,0.06)', borderRadius: '10px',
                cursor: 'pointer', border: `1px solid rgba(0,240,255,0.12)`,
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(0,240,255,0.12)'; }}
              onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'rgba(0,240,255,0.06)'; }}
            >
              <p style={{ color: C.primary, fontSize: '12.5px', fontWeight: '700', margin: '0 0 2px' }}>⚡ Super Admin</p>
              <p style={{ color: C.muted2, fontSize: '11.5px', margin: 0 }}>admin@zeex.com · Click to autofill</p>
            </div>
          </div>

        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}