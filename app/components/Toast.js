'use client';
import { useState, useEffect, useCallback } from 'react';
import { CheckCircle2, XCircle, Info, AlertTriangle, X } from 'lucide-react';

/* ─── Toast Store (singleton) ─────────────────────────── */
let _setToasts = null;
let _id = 0;

export function toast(message, type = 'success', duration = 3500) {
  if (!_setToasts) return;
  const id = ++_id;
  _setToasts(prev => [...prev, { id, message, type, duration, exiting: false }]);
}
toast.success = (msg, dur) => toast(msg, 'success', dur);
toast.error   = (msg, dur) => toast(msg, 'error',   dur);
toast.info    = (msg, dur) => toast(msg, 'info',    dur);
toast.warning = (msg, dur) => toast(msg, 'warning', dur);

/* ─── Config ──────────────────────────────────────────── */
const CONFIG = {
  success: { icon: CheckCircle2, color: '#00D68F', bg: 'rgba(0,214,143,0.12)',  border: 'rgba(0,214,143,0.25)'  },
  error:   { icon: XCircle,      color: '#FF6B6B', bg: 'rgba(255,107,107,0.12)', border: 'rgba(255,107,107,0.25)' },
  info:    { icon: Info,         color: '#4E9BFF', bg: 'rgba(78,155,255,0.12)',  border: 'rgba(78,155,255,0.25)'  },
  warning: { icon: AlertTriangle,color: '#FFB800', bg: 'rgba(255,184,0,0.12)',   border: 'rgba(255,184,0,0.25)'   },
};

/* ─── ToastContainer ──────────────────────────────────── */
export default function ToastContainer() {
  const [toasts, setToasts] = useState([]);
  _setToasts = setToasts;

  const dismiss = useCallback((id) => {
    setToasts(prev => prev.map(t => t.id === id ? { ...t, exiting: true } : t));
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 320);
  }, []);

  useEffect(() => {
    if (toasts.length === 0) return;
    const latest = toasts[toasts.length - 1];
    if (latest.exiting) return;
    const timer = setTimeout(() => dismiss(latest.id), latest.duration);
    return () => clearTimeout(timer);
  }, [toasts, dismiss]);

  return (
    <div style={{
      position: 'fixed', top: '20px', right: '20px',
      zIndex: 9999, display: 'flex', flexDirection: 'column', gap: '10px',
      maxWidth: '360px', width: '100%', pointerEvents: 'none',
    }}>
      {toasts.map(t => {
        const cfg = CONFIG[t.type] || CONFIG.success;
        const Icon = cfg.icon;
        return (
          <div
            key={t.id}
            className={t.exiting ? 'toast-exit' : 'toast-enter'}
            style={{
              background: '#1A1A2E',
              border: `1px solid ${cfg.border}`,
              borderLeft: `3px solid ${cfg.color}`,
              borderRadius: '12px',
              padding: '14px 16px',
              display: 'flex', alignItems: 'flex-start', gap: '12px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
              pointerEvents: 'all',
              backdropFilter: 'blur(12px)',
            }}
          >
            <div style={{
              width: '32px', height: '32px', borderRadius: '9px',
              background: cfg.bg, display: 'flex', alignItems: 'center',
              justifyContent: 'center', flexShrink: 0,
            }}>
              <Icon size={16} color={cfg.color} strokeWidth={2.3} />
            </div>
            <p style={{
              color: '#E0E0F0', fontSize: '13.5px', fontWeight: '500',
              lineHeight: 1.45, flex: 1, margin: 0, paddingTop: '6px',
            }}>
              {t.message}
            </p>
            <button
              onClick={() => dismiss(t.id)}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: '#5A5A72', padding: '4px', marginTop: '2px', flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                borderRadius: '6px', transition: 'color 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.color = '#fff'}
              onMouseLeave={e => e.currentTarget.style.color = '#5A5A72'}
            >
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
