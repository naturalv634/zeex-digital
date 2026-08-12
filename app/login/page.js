'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

export default function Login() {
  const router = useRouter();
  const [form, setForm] = useState({ email: 'admin@zeex.com', password: '12345678' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formState, setFormState] = useState(''); // 'enter', 'settle'

  const canvasRef = useRef(null);

  useEffect(() => {
    // Trigger entrance animation sequence
    const timer1 = setTimeout(() => {
      setFormState('enter');
    }, 200);

    const timer2 = setTimeout(() => {
      setFormState('enter settle');
    }, 1150);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  // Simple ambient canvas particle/character effect
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    let frame = 0;
    const render = () => {
      frame++;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Subtle cyan/purple ambient energy particles on right panel
      const rightX = canvas.width * 0.55;
      const count = 18;
      for (let i = 0; i < count; i++) {
        const x = rightX + Math.sin(frame * 0.02 + i) * (canvas.width * 0.2) + (i * 30);
        const y = (canvas.height * 0.2) + Math.cos(frame * 0.015 + i * 2) * (canvas.height * 0.3) + (i * 25);
        const size = Math.sin(frame * 0.03 + i) * 2 + 3;
        const alpha = (Math.sin(frame * 0.02 + i) + 1) * 0.25;

        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fillStyle = i % 2 === 0 ? `rgba(6, 190, 248, ${alpha})` : `rgba(146, 50, 232, ${alpha})`;
        ctx.shadowBlur = 12;
        ctx.shadowColor = i % 2 === 0 ? '#06bef8' : '#9232e8';
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
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
        else if (data.user.role === 'editor') router.push('/editor/projects');
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

  const handleQuickAdmin = () => {
    setForm({ email: 'admin@zeex.com', password: '12345678' });
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleLogin(e);
  };

  return (
    <>
      <style>{`
        :root {
          --bg-left: #020c1d;
          --bg-right: #080f1c;
          --purple: #9232e8;
          --cyan: #06bef8;
          --cyan2: #00e0ff;
          --blue-grad: #0077ff;
          --green: #01b172;
          --input-bg: rgba(14, 22, 48, 0.85);
          --text-dim: #7d8ba3;
          --text-dim2: #5b6a85;
          --panel-line: #132038;
        }

        * { box-sizing: border-box; }
        
        .stage {
          position: relative;
          width: 100%;
          min-height: 100vh;
          display: flex;
          background: var(--bg-left);
          overflow: hidden;
          font-family: 'Segoe UI', Inter, system-ui, -apple-system, sans-serif;
        }

        /* LEFT SIDE */
        .left {
          flex: 1.15;
          padding: 64px 64px 40px 64px;
          position: relative;
          z-index: 2;
          opacity: 0;
          transform: translateX(-24px);
          animation: fadeInLeft 0.8s ease-out 0.15s forwards;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }
        @keyframes fadeInLeft {
          to { opacity: 1; transform: translateX(0); }
        }

        .logo { display: flex; align-items: baseline; gap: 6px; font-weight: 800; font-size: 34px; letter-spacing: 1px; }
        .logo .ze { color: #fff; }
        .logo .sigma { color: var(--purple); font-size: 38px; }
        .logo .x { color: var(--purple); }
        .logo-sub { color: var(--purple); font-weight: 700; font-size: 12px; letter-spacing: 6px; margin-top: 2px; margin-bottom: 26px; }

        .tag { color: var(--text-dim); font-size: 14px; margin-bottom: 18px; font-weight: 600; letter-spacing: 0.5px; }

        .headline { font-size: 38px; font-weight: 800; line-height: 1.25; margin: 0 0 18px 0; }
        .headline .white { color: #fff; }
        .headline .cyan { color: var(--cyan2); display: block; }

        .desc { color: var(--text-dim); font-size: 15px; line-height: 1.7; max-width: 440px; margin-bottom: 34px; }

        .feature { display: flex; align-items: center; gap: 16px; margin-bottom: 20px; max-width: 460px; }
        .feature .icon-box {
          width: 38px; height: 38px; border-radius: 9px; background: #031d2d; border: 1px solid #0d3550;
          display: flex; align-items: center; justify-content: center; color: var(--cyan); flex-shrink: 0;
          font-size: 16px;
        }
        .feature .ftitle { color: #fff; font-weight: 700; font-size: 14.5px; }
        .feature .fsub { color: var(--text-dim2); font-size: 12.5px; margin-top: 2px; }
        .feature .grow { flex: 1; }
        .feature .check { color: var(--green); flex-shrink: 0; font-weight: bold; }

        /* RIGHT SIDE */
        .right {
          flex: 0.85;
          position: relative;
          background: var(--bg-right);
          border-left: 1px solid var(--panel-line);
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .right-inner {
          position: relative;
          width: 100%;
          max-width: 480px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 40px 54px;
          transform: translateX(140%);
          opacity: 0;
          z-index: 10;
        }
        .right-inner.enter {
          animation: formIn 0.95s cubic-bezier(0.2, 0.85, 0.35, 1.15) forwards;
        }
        @keyframes formIn {
          0% { transform: translateX(140%); opacity: 0; }
          70% { transform: translateX(-3%); opacity: 1; }
          85% { transform: translateX(1.5%); }
          100% { transform: translateX(0); opacity: 1; }
        }
        .right-inner.settle {
          animation: settleBounce 0.45s ease-out;
        }
        @keyframes settleBounce {
          0% { transform: translateX(0) scale(1); }
          30% { transform: translateX(-6px) scale(1.008); }
          60% { transform: translateX(3px) scale(0.998); }
          100% { transform: translateX(0) scale(1); }
        }

        .rlogo { display: flex; align-items: baseline; gap: 6px; font-weight: 800; font-size: 28px; justify-content: flex-start; }
        .rlogo .ze { color: #fff; }
        .rlogo .sigma { color: var(--purple); font-size: 31px; }
        .rlogo .x { color: var(--purple); }
        .rlogo-sub { color: var(--purple); font-weight: 700; font-size: 10.5px; letter-spacing: 5px; margin-top: 2px; margin-bottom: 22px; }

        .badge { display: flex; align-items: center; gap: 6px; color: var(--cyan); font-weight: 700; font-size: 12px; letter-spacing: 2px; margin-bottom: 10px; }
        .welcome { color: #fff; font-size: 26px; font-weight: 800; margin: 0 0 6px 0; }
        .subwelcome { color: var(--text-dim); font-size: 13.5px; margin-bottom: 26px; }

        .field-label { color: var(--text-dim); font-size: 12.5px; font-weight: 600; margin-bottom: 7px; display: block; }
        .field {
          width: 100%;
          background: var(--input-bg);
          border: 1px solid var(--panel-line);
          border-radius: 9px;
          padding: 13px 16px;
          font-size: 14px;
          color: #ffffff;
          margin-bottom: 18px;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
          font-family: inherit;
        }
        .field:focus {
          border-color: var(--cyan);
          box-shadow: 0 0 12px rgba(6, 190, 248, 0.2);
        }
        .field-wrap { position: relative; }
        .eye {
          position: absolute;
          right: 14px;
          top: 12px;
          color: var(--text-dim2);
          font-size: 16px;
          cursor: pointer;
          user-select: none;
          transition: color 0.2s;
        }
        .eye:hover { color: var(--cyan); }

        .login-error-msg {
          background: rgba(255, 71, 87, 0.12);
          border: 1px solid rgba(255, 71, 87, 0.3);
          border-radius: 8px;
          padding: 10px 14px;
          color: #ff4757;
          font-size: 13px;
          margin-bottom: 18px;
        }

        .signin-btn {
          width: 100%;
          border: none;
          border-radius: 9px;
          padding: 14px;
          background: linear-gradient(90deg, var(--blue-grad), var(--cyan2));
          color: #031421;
          font-weight: 800;
          font-size: 15px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          box-shadow: 0 8px 24px -6px rgba(0, 190, 255, 0.55);
          transition: transform 0.15s, opacity 0.2s;
          font-family: inherit;
        }
        .signin-btn:hover:not(:disabled) { transform: translateY(-1px); }
        .signin-btn:disabled { opacity: 0.6; cursor: not-allowed; }

        .quick {
          margin-top: 22px;
          border: 1px solid var(--panel-line);
          border-radius: 10px;
          padding: 14px 16px;
          background: rgba(8, 15, 28, 0.6);
        }
        .quick-label { color: var(--text-dim2); font-size: 10.5px; letter-spacing: 2px; font-weight: 700; margin-bottom: 10px; }
        .quick-btn {
          color: #f5b400;
          font-size: 13px;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 6px;
          background: none;
          border: none;
          padding: 0;
          cursor: pointer;
          transition: opacity 0.2s;
        }
        .quick-btn:hover { opacity: 0.8; }

        #charCanvas {
          position: absolute;
          top: 0; left: 0;
          width: 100%; height: 100%;
          z-index: 6;
          pointer-events: none;
        }

        @media (max-width: 960px) {
          .stage { flex-direction: column; overflow-y: auto; }
          .left { flex: none; padding: 40px 24px 20px; }
          .right { flex: none; width: 100%; border-left: none; border-top: 1px solid var(--panel-line); padding: 40px 0; }
          .right-inner { padding: 0 24px; }
        }
      `}</style>

      <div className="stage" id="stage">
        {/* LEFT PANEL */}
        <div className="left">
          <div className="logo"><span class="ze">ZE</span><span className="sigma">Σ</span><span className="x">X</span></div>
          <div className="logo-sub">DIGITAL</div>
          <div className="tag">Project Management Portal</div>
          <h1 className="headline">
            <span className="white">Manage Projects.</span>
            <span className="cyan">Deliver Results.</span>
          </h1>
          <div className="desc">
            A complete project management solution for ZEEX-Digital — track projects, manage team members, and keep clients updated in real-time.
          </div>

          <div className="feature">
            <div className="icon-box">▦</div>
            <div className="grow">
              <div className="ftitle">Real-time Dashboard</div>
              <div className="fsub">Live project tracking with progress</div>
            </div>
            <div className="check">✔</div>
          </div>
          <div className="feature">
            <div className="icon-box">◑</div>
            <div className="grow">
              <div className="ftitle">Team Management</div>
              <div className="fsub">Assign tasks, track performance</div>
            </div>
            <div className="check">✔</div>
          </div>
          <div className="feature">
            <div className="icon-box">◫</div>
            <div className="grow">
              <div className="ftitle">Client Portal</div>
              <div className="fsub">Professional client-facing portal</div>
            </div>
            <div className="check">✔</div>
          </div>
          <div className="feature">
            <div className="icon-box">🔔</div>
            <div className="grow">
              <div className="ftitle">Smart Notifications</div>
              <div className="fsub">Instant alerts for tasks &amp; deadlines</div>
            </div>
            <div className="check">✔</div>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="right" id="rightPanel">
          <div className={`right-inner ${formState}`} id="formPanel">
            <div className="rlogo"><span className="ze">ZE</span><span className="sigma">Σ</span><span className="x">X</span></div>
            <div className="rlogo-sub">DIGITAL</div>
            <div className="badge">⚡ SECURE LOGIN</div>
            <div className="welcome">Welcome Back</div>
            <div className="subwelcome">Sign in to your ZEEX-Digital account</div>

            {error && <div className="login-error-msg">{error}</div>}

            <form onSubmit={handleLogin}>
              <div className="field-label">Email Address</div>
              <input
                className="field"
                type="email"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                onKeyDown={handleKeyDown}
                placeholder="admin@zeex.com"
                required
              />

              <div className="field-label">Password</div>
              <div className="field-wrap">
                <input
                  className="field"
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  onKeyDown={handleKeyDown}
                  placeholder="••••••••"
                  required
                />
                <span className="eye" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? '🙈' : '👁'}
                </span>
              </div>

              <button type="submit" className="signin-btn" disabled={loading}>
                {loading ? 'Signing In...' : 'Sign In →'}
              </button>
            </form>

            <div className="quick">
              <div className="quick-label">QUICK ACCESS</div>
              <button type="button" className="quick-btn" onClick={handleQuickAdmin}>
                ⚡ Super Admin
              </button>
            </div>
          </div>
        </div>

        <canvas id="charCanvas" ref={canvasRef}></canvas>
      </div>
    </>
  );
}