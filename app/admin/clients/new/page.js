'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Building2, Mail, Phone, Globe, User, ArrowLeft,
  CheckCircle2, Sparkles, Lock, FileText,
} from 'lucide-react';
import AdminLayout from '../../../components/AdminLayout';
import { toast } from '../../../components/Toast';

const C = {
  bg: '#030712', bg2: '#080E1E', card: '#0C1327', card2: '#121C38', card3: '#18264B',
  border: '#1E2D56', border2: '#2A3F75',
  primary: '#00F0FF', primaryDark: '#0072FF',
  green: '#00E599', red: '#FF4757', orange: '#FF9900', purple: '#9D4EDD',
  muted: '#64748B', muted2: '#334155', text: '#F1F5F9', text2: '#94A3B8',
};

const AVATAR_COLORS = [
  '#00E599', '#0072FF', '#FF9900', '#FF4757',
  '#9D4EDD', '#00F0FF', '#F472B6', '#34D399',
];

const INPUT = {
  width: '100%', padding: '11px 14px', backgroundColor: C.bg2,
  border: `1px solid ${C.border}`, borderRadius: '10px',
  color: C.text, fontSize: '13.5px', outline: 'none',
  fontFamily: 'inherit', transition: 'border-color 0.2s, box-shadow 0.2s',
};

function Field({ label, icon: Icon, required, children }) {
  return (
    <div>
      <label className="form-label">
        {Icon && <Icon size={12} style={{ display: 'inline', marginRight: 5, verticalAlign: 'middle' }} />}
        {label}{required && <span style={{ color: C.red, marginLeft: 3 }}>*</span>}
      </label>
      {children}
    </div>
  );
}

export default function AddClient() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: '', company: '', email: '', phone: '', website: '',
    password: 'client123', notes: '', avatar_color: AVATAR_COLORS[0],
  });
  const [loading, setLoading] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.email.trim()) {
      toast.error('Client Name aur Email required hain!');
      return;
    }
    if (!/\S+@\S+\.\S+/.test(form.email)) {
      toast.error('Valid email address enter karein');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          department: form.company,
          email: form.email,
          phone: form.phone,
          website: form.website,
          notes: form.notes,
          password: form.password,
          avatar_color: form.avatar_color,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Client "${form.name}" successfully create ho gaya!`);
        setTimeout(() => router.push('/admin/clients'), 1200);
      } else {
        toast.error(data.error || 'Client create karne mein error aaya');
      }
    } catch {
      toast.error('Server se connect nahi ho pa raha!');
    }
    setLoading(false);
  };

  const previewLetter = (form.company || form.name || '?')[0]?.toUpperCase();

  return (
    <AdminLayout title="Add New Client">
      <div style={{ maxWidth: '960px', margin: '0 auto' }}>

        {/* ── Breadcrumb ─────────────────── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '28px' }}>
          <a
            href="/admin/clients"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', color: C.muted, fontSize: '13px', transition: 'color 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.color = C.text}
            onMouseLeave={e => e.currentTarget.style.color = C.muted}
          >
            <ArrowLeft size={14} /> Back to Clients
          </a>
          <span style={{ color: C.muted2, fontSize: '13px' }}>/</span>
          <span style={{ color: C.text2, fontSize: '13px' }}>Add New Client</span>
        </div>

        {/* ── Page Header ────────────────── */}
        <div style={{ marginBottom: '28px' }}>
          <h2 style={{ color: C.text, fontSize: '22px', fontWeight: '800', margin: '0 0 4px 0', letterSpacing: '-0.3px' }}>
            Create Client Portal
          </h2>
          <p style={{ color: C.muted, fontSize: '13px', margin: 0 }}>
            Client ka account create karo — woh apna dedicated portal dekh sakenge
          </p>
        </div>

        {/* ── Main Grid ──────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '20px', alignItems: 'start' }}>

          {/* ── Form Card ────────────── */}
          <div className="card" style={{ padding: '28px' }}>

            {/* Section: Basic Info */}
            <p className="section-title" style={{ marginBottom: '18px' }}>Basic Information</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
              <Field label="Client Name" icon={User} required>
                <input
                  style={INPUT}
                  value={form.name}
                  placeholder="e.g. Ahmed Malik"
                  onChange={e => set('name', e.target.value)}
                  onFocus={e => { e.target.style.borderColor = C.primary; e.target.style.boxShadow = `0 0 12px rgba(0,240,255,0.15)`; }}
                  onBlur={e => { e.target.style.borderColor = C.border; e.target.style.boxShadow = 'none'; }}
                />
              </Field>
              <Field label="Company / Brand Name" icon={Building2} required>
                <input
                  style={INPUT}
                  value={form.company}
                  placeholder="e.g. Al-Noor Group"
                  onChange={e => set('company', e.target.value)}
                  onFocus={e => { e.target.style.borderColor = C.primary; e.target.style.boxShadow = `0 0 12px rgba(0,240,255,0.15)`; }}
                  onBlur={e => { e.target.style.borderColor = C.border; e.target.style.boxShadow = 'none'; }}
                />
              </Field>
            </div>

            {/* Section: Contact */}
            <hr className="divider" style={{ marginBottom: '20px' }} />
            <p className="section-title" style={{ marginBottom: '18px' }}>Contact Details</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
              <Field label="Email Address" icon={Mail} required>
                <input
                  type="email"
                  style={INPUT}
                  value={form.email}
                  placeholder="client@company.com"
                  onChange={e => set('email', e.target.value)}
                  onFocus={e => { e.target.style.borderColor = C.primary; e.target.style.boxShadow = `0 0 12px rgba(0,240,255,0.15)`; }}
                  onBlur={e => { e.target.style.borderColor = C.border; e.target.style.boxShadow = 'none'; }}
                />
              </Field>
              <Field label="Phone Number" icon={Phone}>
                <input
                  style={INPUT}
                  value={form.phone}
                  placeholder="+92 300 0000000"
                  onChange={e => set('phone', e.target.value)}
                  onFocus={e => { e.target.style.borderColor = C.primary; e.target.style.boxShadow = `0 0 12px rgba(0,240,255,0.15)`; }}
                  onBlur={e => { e.target.style.borderColor = C.border; e.target.style.boxShadow = 'none'; }}
                />
              </Field>
              <Field label="Website" icon={Globe}>
                <input
                  style={INPUT}
                  value={form.website}
                  placeholder="https://example.com"
                  onChange={e => set('website', e.target.value)}
                  onFocus={e => { e.target.style.borderColor = C.primary; e.target.style.boxShadow = `0 0 12px rgba(0,240,255,0.15)`; }}
                  onBlur={e => { e.target.style.borderColor = C.border; e.target.style.boxShadow = 'none'; }}
                />
              </Field>
              <Field label="Portal Password" icon={Lock}>
                <input
                  style={INPUT}
                  value={form.password}
                  placeholder="Portal login password"
                  onChange={e => set('password', e.target.value)}
                  onFocus={e => { e.target.style.borderColor = C.primary; e.target.style.boxShadow = `0 0 12px rgba(0,240,255,0.15)`; }}
                  onBlur={e => { e.target.style.borderColor = C.border; e.target.style.boxShadow = 'none'; }}
                />
              </Field>
            </div>

            {/* Section: Avatar Color */}
            <hr className="divider" style={{ marginBottom: '20px' }} />
            <p className="section-title" style={{ marginBottom: '14px' }}>Avatar Color</p>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '20px' }}>
              {AVATAR_COLORS.map(col => (
                <button
                  key={col}
                  onClick={() => set('avatar_color', col)}
                  style={{
                    width: '34px', height: '34px', borderRadius: '10px',
                    backgroundColor: col, border: 'none', cursor: 'pointer',
                    outline: form.avatar_color === col ? `3px solid ${C.primary}` : '3px solid transparent',
                    outlineOffset: '2px',
                    transform: form.avatar_color === col ? 'scale(1.15)' : 'scale(1)',
                    transition: 'all 0.15s ease',
                    boxShadow: form.avatar_color === col ? `0 0 14px ${col}80` : 'none',
                  }}
                />
              ))}
            </div>

            {/* Section: Notes */}
            <hr className="divider" style={{ marginBottom: '20px' }} />
            <Field label="Internal Notes" icon={FileText}>
              <textarea
                style={{ ...INPUT, resize: 'vertical', minHeight: '80px', lineHeight: '1.6' }}
                value={form.notes}
                placeholder="Client ke baare mein koi important notes..."
                onChange={e => set('notes', e.target.value)}
                onFocus={e => { e.target.style.borderColor = C.primary; e.target.style.boxShadow = `0 0 12px rgba(0,240,255,0.15)`; }}
                onBlur={e => { e.target.style.borderColor = C.border; e.target.style.boxShadow = 'none'; }}
              />
            </Field>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="btn-glow"
                style={{
                  flex: 1, justifyContent: 'center', padding: '13px',
                  opacity: loading ? 0.7 : 1, cursor: loading ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                }}
              >
                {loading ? (
                  <>
                    <span style={{ width: 14, height: 14, border: `2px solid #030712`, borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.6s linear infinite' }} />
                    Creating...
                  </>
                ) : (
                  <><Sparkles size={15} /> Create Client Portal</>
                )}
              </button>
              <a
                href="/admin/clients"
                className="btn-ghost"
                style={{ padding: '13px 22px', justifyContent: 'center' }}
              >
                Cancel
              </a>
            </div>
          </div>

          {/* ── Preview Card ──────────── */}
          <div style={{ position: 'sticky', top: '88px' }}>
            <div className="card-cyber" style={{ padding: '24px' }}>
              <p className="section-title" style={{ marginBottom: '20px' }}>Portal Preview</p>

              {/* Avatar Preview */}
              <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <div style={{
                  width: '72px', height: '72px', borderRadius: '18px',
                  backgroundColor: form.avatar_color,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#030712', fontWeight: '900', fontSize: '28px',
                  margin: '0 auto 14px',
                  boxShadow: `0 0 24px ${form.avatar_color}60`,
                  transition: 'all 0.3s ease',
                }}>
                  {previewLetter}
                </div>
                <p style={{ color: C.text, fontSize: '16px', fontWeight: '700', margin: '0 0 3px 0' }}>
                  {form.company || form.name || 'Company Name'}
                </p>
                <p style={{ color: C.muted, fontSize: '12px', margin: '0 0 4px 0' }}>
                  {form.name || 'Contact Name'}
                </p>
                {form.email && (
                  <p style={{ color: C.primary, fontSize: '11.5px', margin: 0, opacity: 0.8 }}>
                    {form.email}
                  </p>
                )}
              </div>

              <hr className="divider" style={{ marginBottom: '16px' }} />

              {/* Portal Features */}
              <p style={{ color: C.muted, fontSize: '11.5px', fontWeight: '600', margin: '0 0 12px 0' }}>
                Client Portal Includes:
              </p>
              {[
                'Live Project Progress',
                'Milestone Tracker',
                'Invoice History',
                'Real-time Updates',
                'Dedicated Dashboard',
              ].map(item => (
                <div key={item} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <CheckCircle2 size={13} color={C.green} />
                  <span style={{ color: C.text2, fontSize: '12.5px' }}>{item}</span>
                </div>
              ))}

              {/* Credentials Box */}
              {form.email && (
                <>
                  <hr className="divider" style={{ margin: '16px 0' }} />
                  <div style={{ backgroundColor: C.card2, borderRadius: '10px', padding: '12px' }}>
                    <p style={{ color: C.muted, fontSize: '10.5px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 8px 0' }}>
                      Login Credentials
                    </p>
                    <p style={{ color: C.text2, fontSize: '12px', margin: '0 0 4px 0' }}>
                      📧 {form.email}
                    </p>
                    <p style={{ color: C.text2, fontSize: '12px', margin: 0 }}>
                      🔑 {form.password || '—'}
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Spin animation */}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </AdminLayout>
  );
}