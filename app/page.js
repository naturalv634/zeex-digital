'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  LayoutDashboard, Users, Handshake, Bell,
  Eye, EyeOff, Zap, ArrowRight, CheckCircle2,
} from 'lucide-react';

import { C } from './lib/colors';
import Logo from './components/Logo';

const FEATURES = [
  { Icon: LayoutDashboard, label: 'Real-time Dashboard',  desc: 'Live project tracking with progress' },
  { Icon: Users,           label: 'Team Management',      desc: 'Assign tasks, track performance' },
  { Icon: Handshake,       label: 'Client Portal',        desc: 'Professional client-facing portal' },
  { Icon: Bell,            label: 'Smart Notifications',  desc: 'Instant alerts for tasks & deadlines' },
];

const SERVICES = ['WordPress', 'React', 'Figma/UI', 'Mobile Apps', 'SEO', 'Video Editing', 'QA Testing', 'Content Writing'];

/* ─────────────────────────────────────────────────────
   Cartoon Robot Character (SVG)
   A cute robot mascot that "pulls" the login form
───────────────────────────────────────────────────── */
function CartoonRobot({ phase }) {
  // phase: 'idle' | 'walking' | 'pulling' | 'done'
  const armAngle = phase === 'pulling' ? -25 : 0;
  const bodyBounce = (phase === 'walking') ? 'robot-walk' : (phase === 'pulling' ? 'robot-pull' : '');

  return (
    <svg
      className={`cartoon-robot ${bodyBounce}`}
      viewBox="0 0 160 220"
      xmlns="http://www.w3.org/2000/svg"
      style={{ width: '120px', height: 'auto', overflow: 'visible' }}
    >
      <defs>
        <linearGradient id="robotBodyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#A78BFA" />
          <stop offset="100%" stopColor="#7C3AED" />
        </linearGradient>
        <linearGradient id="robotFaceGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#1E1B4B" />
          <stop offset="100%" stopColor="#0F0A2A" />
        </linearGradient>
        <filter id="robotGlow">
          <feDropShadow dx="0" dy="3" stdDeviation="5" floodColor="#7C3AED" floodOpacity="0.4" />
        </filter>
      </defs>

      {/* Antenna */}
      <line x1="80" y1="8" x2="80" y2="28" stroke="#A78BFA" strokeWidth="3" strokeLinecap="round" />
      <circle cx="80" cy="6" r="5" fill="#C084FC">
        <animate attributeName="opacity" values="1;0.3;1" dur="1.5s" repeatCount="indefinite" />
      </circle>

      {/* Head */}
      <rect x="40" y="28" width="80" height="60" rx="18" fill="url(#robotBodyGrad)" filter="url(#robotGlow)" />
      {/* Face screen */}
      <rect x="50" y="38" width="60" height="40" rx="10" fill="url(#robotFaceGrad)" />
      {/* Eyes */}
      <circle cx="68" cy="56" r="7" fill="#34D399">
        <animate attributeName="r" values="7;5;7" dur="3s" repeatCount="indefinite" />
      </circle>
      <circle cx="92" cy="56" r="7" fill="#34D399">
        <animate attributeName="r" values="7;5;7" dur="3s" repeatCount="indefinite" />
      </circle>
      {/* Eye shine */}
      <circle cx="65" cy="53" r="2.5" fill="white" opacity="0.8" />
      <circle cx="89" cy="53" r="2.5" fill="white" opacity="0.8" />
      {/* Mouth */}
      <rect x="65" y="66" width="30" height="4" rx="2" fill="#34D399" opacity="0.6" />

      {/* Neck */}
      <rect x="72" y="88" width="16" height="10" rx="4" fill="#6D28D9" />

      {/* Body */}
      <rect x="35" y="98" width="90" height="60" rx="16" fill="url(#robotBodyGrad)" filter="url(#robotGlow)" />
      {/* Chest circle */}
      <circle cx="80" cy="125" r="12" fill="#1E1B4B" stroke="#A78BFA" strokeWidth="2">
        <animate attributeName="stroke-opacity" values="1;0.3;1" dur="2s" repeatCount="indefinite" />
      </circle>
      {/* Power icon in chest */}
      <text x="80" y="130" textAnchor="middle" fontSize="13" fill="#C084FC" fontWeight="bold">⚡</text>

      {/* Left Arm (pulling arm - points toward form) */}
      <g transform={`rotate(${armAngle}, 35, 108)`} style={{ transition: 'transform 0.5s ease' }}>
        <rect x="8" y="102" width="27" height="14" rx="7" fill="#6D28D9" />
        {/* Hand */}
        <circle cx="10" cy="109" r="8" fill="#A78BFA" />
        {/* Fingers */}
        <rect x="0" y="104" width="8" height="4" rx="2" fill="#C084FC" />
        <rect x="0" y="110" width="8" height="4" rx="2" fill="#C084FC" />
      </g>

      {/* Right Arm */}
      <rect x="125" y="102" width="27" height="14" rx="7" fill="#6D28D9" />
      <circle cx="150" cy="109" r="8" fill="#A78BFA" />

      {/* Left Leg */}
      <rect x="48" y="158" width="18" height="30" rx="8" fill="#6D28D9" />
      <rect x="44" y="184" width="26" height="14" rx="6" fill="#A78BFA" />

      {/* Right Leg */}
      <rect x="94" y="158" width="18" height="30" rx="8" fill="#6D28D9" />
      <rect x="90" y="184" width="26" height="14" rx="6" fill="#A78BFA" />
    </svg>
  );
}

export default function Home() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Animation phases
  const [animPhase, setAnimPhase] = useState('waiting'); // waiting -> robotEnter -> pulling -> formVisible -> done

  useEffect(() => {
    setMounted(true);
    // Start animation sequence
    const t1 = setTimeout(() => setAnimPhase('robotEnter'), 400);
    const t2 = setTimeout(() => setAnimPhase('pulling'), 1600);
    const t3 = setTimeout(() => setAnimPhase('formVisible'), 2400);
    const t4 = setTimeout(() => setAnimPhase('done'), 3200);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
  }, []);

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

  // Determine robot visual phase
  const robotPhase =
    animPhase === 'pulling' ? 'pulling' :
    animPhase === 'robotEnter' ? 'walking' :
    'idle';

  return (
    <>
      <style>{`
        .login-landing-container {
          background-color: ${C.bg};
          min-height: 100vh;
          display: flex;
          font-family: var(--font, 'Inter', sans-serif);
          background-image:
            radial-gradient(ellipse at 20% 50%, rgba(0,114,255,0.07) 0%, transparent 60%),
            radial-gradient(ellipse at 80% 20%, rgba(0,240,255,0.05) 0%, transparent 50%);
        }
        .landing-branding-side {
          flex: 1;
          padding: 60px 64px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          border-right: 1px solid ${C.border};
          position: relative;
          overflow: hidden;
        }
        .landing-form-side {
          width: 460px;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 60px 44px;
          background-color: ${C.card};
          position: relative;
          z-index: 1;
          overflow: hidden;
        }

        /* ── Robot + Form Animation Container ── */
        .form-animation-wrapper {
          position: relative;
          width: 100%;
        }

        /* ── Robot Animation ── */
        .robot-container {
          position: absolute;
          z-index: 10;
          transition: all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
          pointer-events: none;
        }

        /* Desktop: robot enters from right side */
        .robot-waiting {
          right: -180px;
          top: 50%;
          transform: translateY(-50%);
          opacity: 0;
        }
        .robot-enter {
          right: -60px;
          top: 50%;
          transform: translateY(-50%);
          opacity: 1;
        }
        .robot-pulling {
          right: -40px;
          top: 50%;
          transform: translateY(-50%) scaleX(-1);
          opacity: 1;
        }
        .robot-done {
          right: -50px;
          top: -10px;
          transform: scale(0.55);
          opacity: 1;
        }

        /* ── Form Slide Animation ── */
        .login-form-content {
          transition: all 0.9s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .form-hidden {
          opacity: 0;
          transform: translateX(120%);
        }
        .form-pulling {
          opacity: 0.4;
          transform: translateX(40%);
        }
        .form-visible {
          opacity: 1;
          transform: translateX(0);
        }

        /* ── Robot Walking Animation ── */
        @keyframes robotWalkBounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        .robot-walk .cartoon-robot {
          animation: robotWalkBounce 0.4s ease-in-out infinite;
        }

        /* ── Robot Pulling Animation ── */
        @keyframes robotPullStrain {
          0%, 100% { transform: translateX(0) rotate(0deg); }
          25% { transform: translateX(-6px) rotate(-3deg); }
          75% { transform: translateX(4px) rotate(2deg); }
        }
        .robot-pull .cartoon-robot {
          animation: robotPullStrain 0.3s ease-in-out infinite;
        }

        /* ── "Let me help!" speech bubble ── */
        .robot-speech {
          position: absolute;
          background: rgba(124, 58, 237, 0.9);
          color: white;
          padding: 8px 14px;
          border-radius: 12px;
          font-size: 11px;
          font-weight: 700;
          white-space: nowrap;
          opacity: 0;
          transition: opacity 0.4s;
          pointer-events: none;
          top: -16px;
          right: 40px;
        }
        .robot-speech::after {
          content: '';
          position: absolute;
          bottom: -6px;
          right: 20px;
          width: 0;
          height: 0;
          border-left: 6px solid transparent;
          border-right: 6px solid transparent;
          border-top: 8px solid rgba(124, 58, 237, 0.9);
        }
        .robot-speech.show {
          opacity: 1;
        }

        /* ── Rope/cord visual connecting robot to form ── */
        .pull-rope {
          position: absolute;
          top: 50%;
          right: 0;
          width: 0;
          height: 3px;
          background: linear-gradient(90deg, #7C3AED, #C084FC);
          border-radius: 2px;
          transition: width 0.5s ease;
          z-index: 5;
          opacity: 0;
        }
        .pull-rope.active {
          width: 80px;
          opacity: 1;
        }

        /* ── Sparkle particles when form appears ── */
        @keyframes sparkle {
          0% { opacity: 0; transform: scale(0) rotate(0deg); }
          50% { opacity: 1; transform: scale(1) rotate(180deg); }
          100% { opacity: 0; transform: scale(0) rotate(360deg); }
        }
        .sparkle-particle {
          position: absolute;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          pointer-events: none;
          animation: sparkle 0.8s ease forwards;
        }

        @media (max-width: 768px) {
          .login-landing-container {
            flex-direction: column !important;
            justify-content: center !important;
            align-items: center !important;
            padding: 24px 16px !important;
          }
          .landing-branding-side {
            display: none !important;
          }
          .landing-form-side {
            width: 100% !important;
            max-width: 420px !important;
            padding: 36px 22px !important;
            border-radius: 20px !important;
            border: 1px solid ${C.border} !important;
            box-shadow: 0 20px 50px rgba(0,0,0,0.6) !important;
            overflow: visible !important;
          }
          /* Mobile: robot comes from top */
          .robot-waiting {
            right: auto;
            left: 50%;
            top: -180px;
            transform: translateX(-50%);
          }
          .robot-enter {
            right: auto;
            left: 50%;
            top: -120px;
            transform: translateX(-50%);
          }
          .robot-pulling {
            right: auto;
            left: 50%;
            top: -110px;
            transform: translateX(-50%);
          }
          .robot-done {
            right: auto;
            left: 50%;
            top: -70px;
            transform: translateX(-50%) scale(0.5);
          }
          .form-hidden {
            transform: translateY(80px);
          }
          .form-pulling {
            transform: translateY(30px);
          }
          .pull-rope {
            display: none;
          }
        }
        @media (max-width: 480px) {
          .login-landing-container {
            padding: 16px 12px !important;
          }
          .landing-form-side {
            padding: 28px 18px !important;
            border-radius: 16px !important;
          }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      <div className="login-landing-container">

        {/* ── LEFT: Branding (Desktop Only) ───────────────────────── */}
        <div className="landing-branding-side">
          {/* Decorative glow orbs */}
          <div style={{ position: 'absolute', top: '-80px', left: '-80px', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(0,114,255,0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: '-60px', right: '-60px', width: '240px', height: '240px', background: 'radial-gradient(circle, rgba(0,240,255,0.07) 0%, transparent 70%)', pointerEvents: 'none' }} />

          {/* Logo */}
          <div style={{ marginBottom: '48px', position: 'relative', zIndex: 1 }}>
            <div style={{ marginBottom: '24px' }}>
              <Logo width={200} />
              <p style={{ color: C.muted, fontSize: '13px', margin: 0, marginTop: '8px' }}>Project Management Portal</p>
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

        {/* ── RIGHT: Auth Form with Robot Animation ──────────────────────── */}
        <div className="landing-form-side">
          <div className="form-animation-wrapper">

            {/* ── Robot Character ── */}
            <div className={`robot-container robot-${
              animPhase === 'waiting' ? 'waiting' :
              animPhase === 'robotEnter' ? 'enter' :
              animPhase === 'pulling' ? 'pulling' :
              'done'
            }`}>
              {/* Speech bubble */}
              <div className={`robot-speech ${animPhase === 'robotEnter' || animPhase === 'pulling' ? 'show' : ''}`}>
                {animPhase === 'pulling' ? '🔥 Almost there!' : '👋 Let me help!'}
              </div>
              <CartoonRobot phase={robotPhase} />
            </div>

            {/* ── Pull Rope ── */}
            <div className={`pull-rope ${animPhase === 'pulling' ? 'active' : ''}`} />

            {/* ── Sparkle particles when form appears ── */}
            {animPhase === 'formVisible' && (
              <>
                {[
                  { top: '10%', left: '5%', bg: '#C084FC', delay: '0s' },
                  { top: '20%', right: '10%', bg: '#34D399', delay: '0.1s' },
                  { top: '80%', left: '15%', bg: '#7C3AED', delay: '0.2s' },
                  { top: '60%', right: '8%', bg: '#A78BFA', delay: '0.15s' },
                  { top: '40%', left: '80%', bg: '#34D399', delay: '0.25s' },
                  { top: '5%', left: '50%', bg: '#C084FC', delay: '0.05s' },
                ].map((s, i) => (
                  <div key={i} className="sparkle-particle" style={{ ...s, animationDelay: s.delay }} />
                ))}
              </>
            )}

            {/* ── Login Form ── */}
            <div className={`login-form-content ${
              animPhase === 'waiting' || animPhase === 'robotEnter' ? 'form-hidden' :
              animPhase === 'pulling' ? 'form-pulling' :
              'form-visible'
            }`}>

              {/* Login Card Header Logo (Always Visible) */}
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '28px' }}>
                <Logo width={210} />
              </div>

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
        </div>
      </div>
    </>
  );
}