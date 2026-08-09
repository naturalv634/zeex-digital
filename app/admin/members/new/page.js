'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  User, Mail, Phone, Lock, Briefcase, Building2,
  ArrowLeft, Sparkles, ShieldCheck, UserCircle2,
} from 'lucide-react';
import AdminLayout from '../../../components/AdminLayout';
import { toast } from '../../../components/Toast';

import { C } from '../../../lib/colors';

const AVATAR_COLORS = [
  '#00E599', '#0072FF', '#FF9900', '#FF4757',
  '#9D4EDD', '#00F0FF', '#F472B6', '#34D399',
];

const DEPARTMENTS = ['Development', 'Design', 'Marketing', 'SEO', 'Content', 'QA Testing', 'Video Editing', 'Management'];

const ROLES = [
  { value: 'member',  label: 'Team Member',     icon: User,        color: C.blue   },
  { value: 'editor',  label: 'Editor',          icon: ShieldCheck, color: C.purple },
  { value: 'client',  label: 'Client',          icon: Briefcase,   color: C.green  },
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

function focusInput(e) {
  e.target.style.borderColor = C.primary;
  e.target.style.boxShadow = `0 0 12px rgba(0,240,255,0.15)`;
}
function blurInput(e) {
  e.target.style.borderColor = C.border;
  e.target.style.boxShadow = 'none';
}

export default function AddMember() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: '', email: '', role: 'member', department: '', phone: '',
    password: '', avatar_color: AVATAR_COLORS[0],
  });
  const [loading, setLoading] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.email.trim() || !form.password.trim()) {
      toast.error('Name, Email aur Password required hain!');
      return;
    }
    if (!/\S+@\S+\.\S+/.test(form.email)) {
      toast.error('Valid email address enter karein');
      return;
    }
    if (form.password.length < 6) {
      toast.error('Password kam se kam 6 characters ka hona chahiye');
      return;
    }
    setLoading(true);
    try {
      const endpoint = form.role === 'client' ? '/api/clients' : '/api/members';
      const res = await fetch(`https://zeex-digital-production.up.railway.app${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name, email: form.email, password: form.password,
          role: form.role, department: form.department, phone: form.phone,
          avatar_color: form.avatar_color,
          company: form.department,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`"${form.name}" successfully add ho gaya!`);
        setTimeout(() => router.push(form.role === 'client' ? '/admin/clients' : '/admin/members'), 1200);
      } else {
        toast.error(data.error || 'Member add karne mein error aaya');
      }
    } catch {
      toast.error('Server se connect nahi ho pa raha!');
    }
    setLoading(false);
  };

  const previewLetter = (form.name || '?')[0]?.toUpperCase();

  return (
    <AdminLayout title="Add Team Member">
      <div style={{ maxWidth: '920px', margin: '0 auto' }}>

        {/* Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '28px' }}>
          <a
            href="/admin/members"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', color: C.muted, fontSize: '13px', transition: 'color 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.color = C.text}
            onMouseLeave={e => e.currentTarget.style.color = C.muted}
          >
            <ArrowLeft size={14} /> Back to Members
          </a>
          <span style={{ color: C.muted2 }}>/</span>
          <span style={{ color: C.text2, fontSize: '13px' }}>Add Team Member</span>
        </div>

        {/* Header */}
        <div style={{ marginBottom: '28px' }}>
          <h2 style={{ color: C.text, fontSize: '22px', fontWeight: '800', margin: '0 0 4px', letterSpacing: '-0.3px' }}>
            Add New Member
          </h2>
          <p style={{ color: C.muted, fontSize: '13px', margin: 0 }}>
            Team ya client ka account create karo aur unka portal activate karo
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '20px', alignItems: 'start' }}>

          {/* Form Card */}
          <div className="card" style={{ padding: '28px' }}>

            {/* Role Selector */}
            <p className="section-title" style={{ marginBottom: '14px' }}>Account Type</p>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '24px' }}>
              {ROLES.map(r => {
                const Icon = r.icon;
                const active = form.role === r.value;
                return (
                  <button key={r.value} onClick={() => set('role', r.value)} style={{
                    flex: 1, padding: '12px', borderRadius: '12px', cursor: 'pointer',
                    backgroundColor: active ? `rgba(${r.color === C.blue ? '0,114,255' : '0,229,153'},0.12)` : C.card2,
                    border: `1px solid ${active ? r.color : C.border}`,
                    display: 'flex', alignItems: 'center', gap: '10px',
                    transition: 'all 0.2s', fontFamily: 'inherit',
                    boxShadow: active ? `0 0 16px ${r.color}25` : 'none',
                  }}>
                    <div style={{
                      width: '34px', height: '34px', borderRadius: '9px',
                      backgroundColor: active ? `${r.color}20` : 'rgba(255,255,255,0.04)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Icon size={16} color={active ? r.color : C.muted} />
                    </div>
                    <div style={{ textAlign: 'left' }}>
                      <p style={{ color: active ? C.text : C.muted, fontSize: '13px', fontWeight: '700', margin: 0 }}>{r.label}</p>
                      <p style={{ color: C.muted, fontSize: '11px', margin: 0 }}>
                        {r.value === 'member' ? 'System access + tasks' : 'Client portal only'}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Basic Info */}
            <hr className="divider" style={{ marginBottom: '20px' }} />
            <p className="section-title" style={{ marginBottom: '16px' }}>Personal Information</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
              <Field label="Full Name" icon={User} required>
                <input style={INPUT} value={form.name} placeholder="e.g. Ali Hassan"
                  onChange={e => set('name', e.target.value)}
                  onFocus={focusInput} onBlur={blurInput} />
              </Field>
              <Field label="Phone Number" icon={Phone}>
                <input style={INPUT} value={form.phone} placeholder="+92 300 0000000"
                  onChange={e => set('phone', e.target.value)}
                  onFocus={focusInput} onBlur={blurInput} />
              </Field>
            </div>

            {/* Department */}
            <div style={{ marginBottom: '20px' }}>
              <Field label="Department / Role" icon={Building2}>
                <select
                  value={form.department}
                  onChange={e => set('department', e.target.value)}
                  onFocus={focusInput} onBlur={blurInput}
                  style={{ ...INPUT, appearance: 'none', cursor: 'pointer' }}
                >
                  <option value="">-- Select Department --</option>
                  {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </Field>
            </div>

            {/* Credentials */}
            <hr className="divider" style={{ marginBottom: '20px' }} />
            <p className="section-title" style={{ marginBottom: '16px' }}>Login Credentials</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
              <Field label="Email Address" icon={Mail} required>
                <input type="email" style={INPUT} value={form.email} placeholder="member@zeex.com"
                  onChange={e => set('email', e.target.value)}
                  onFocus={focusInput} onBlur={blurInput} />
              </Field>
              <Field label="Password" icon={Lock} required>
                <input type="password" style={INPUT} value={form.password} placeholder="Min 6 characters"
                  onChange={e => set('password', e.target.value)}
                  onFocus={focusInput} onBlur={blurInput} />
              </Field>
            </div>

            {/* Avatar Color */}
            <hr className="divider" style={{ marginBottom: '20px' }} />
            <p className="section-title" style={{ marginBottom: '14px' }}>Avatar Color</p>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '24px' }}>
              {AVATAR_COLORS.map(col => (
                <button key={col} onClick={() => set('avatar_color', col)} style={{
                  width: '34px', height: '34px', borderRadius: '10px',
                  backgroundColor: col, border: 'none', cursor: 'pointer',
                  outline: form.avatar_color === col ? `3px solid #00F0FF` : '3px solid transparent',
                  outlineOffset: '2px',
                  transform: form.avatar_color === col ? 'scale(1.15)' : 'scale(1)',
                  transition: 'all 0.15s ease',
                  boxShadow: form.avatar_color === col ? `0 0 14px ${col}80` : 'none',
                }} />
              ))}
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="btn-glow"
                style={{ flex: 1, justifyContent: 'center', padding: '13px', fontSize: '14px', opacity: loading ? 0.7 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}
              >
                {loading ? (
                  <>
                    <span style={{ width: 14, height: 14, border: `2px solid #030712`, borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.6s linear infinite' }} />
                    Adding...
                  </>
                ) : (
                  <><Sparkles size={15} /> Add Member</>
                )}
              </button>
              <a href="/admin/members" className="btn-ghost" style={{ padding: '13px 22px', justifyContent: 'center' }}>
                Cancel
              </a>
            </div>
          </div>

          {/* Preview Card */}
          <div style={{ position: 'sticky', top: '88px' }}>
            <div className="card-cyber" style={{ padding: '24px' }}>
              <p className="section-title" style={{ marginBottom: '18px' }}>Profile Preview</p>

              <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <div style={{
                  width: '68px', height: '68px', borderRadius: '50%',
                  backgroundColor: form.avatar_color,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#030712', fontWeight: '900', fontSize: '26px',
                  margin: '0 auto 12px',
                  boxShadow: `0 0 24px ${form.avatar_color}60`,
                  transition: 'all 0.3s ease',
                }}>
                  {previewLetter}
                </div>
                <p style={{ color: C.text, fontSize: '15px', fontWeight: '700', margin: '0 0 3px' }}>
                  {form.name || 'Member Name'}
                </p>
                <p style={{ color: C.muted, fontSize: '12px', margin: '0 0 6px' }}>
                  {form.department || 'No Department'}
                </p>
                <span className={`badge ${form.role === 'client' ? 'badge-green' : 'badge-blue'}`}>
                  {form.role === 'client' ? 'Client' : 'Team Member'}
                </span>
              </div>

              <hr className="divider" style={{ marginBottom: '16px' }} />

              {/* Access Info */}
              <p style={{ color: C.muted, fontSize: '11.5px', fontWeight: '600', margin: '0 0 10px' }}>
                Access Permissions:
              </p>
              {(form.role === 'member' ? [
                'Admin dashboard view',
                'Own task management',
                'Time tracking',
                'Member dashboard',
              ] : [
                'Client portal view',
                'Project progress',
                'Invoice history',
                'Milestone tracking',
              ]).map(item => (
                <div key={item} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '7px' }}>
                  <ShieldCheck size={12} color={C.green} />
                  <span style={{ color: C.text2, fontSize: '12px' }}>{item}</span>
                </div>
              ))}

              {form.email && (
                <>
                  <hr className="divider" style={{ margin: '16px 0' }} />
                  <div style={{ backgroundColor: C.card2, borderRadius: '10px', padding: '12px' }}>
                    <p style={{ color: C.muted, fontSize: '10.5px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 8px' }}>
                      Login Info
                    </p>
                    <p style={{ color: C.text2, fontSize: '12px', margin: '0 0 4px' }}>📧 {form.email}</p>
                    <p style={{ color: C.text2, fontSize: '12px', margin: 0 }}>🔑 {form.password ? '••••••' : '—'}</p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </AdminLayout>
  );
}