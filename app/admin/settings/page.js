'use client';
import { useState, useEffect } from 'react';
import { Building2, Bell, UserCircle2, ShieldCheck, Save, RotateCcw } from 'lucide-react';
import AdminLayout from '../../components/AdminLayout';
import { toast } from '../../components/Toast';

import { C } from '../../lib/colors';

const Toggle = ({ checked, onClick, label }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '13px 0' }}>
    {label && <span style={{ color: C.text, fontSize: '13.5px', fontWeight: '500' }}>{label}</span>}
    <div onClick={onClick} style={{
      width: '46px', height: '26px', borderRadius: '13px',
      backgroundColor: checked ? C.green : C.card3,
      cursor: 'pointer', position: 'relative', transition: 'background 0.25s',
      border: `1px solid ${checked ? C.green : C.border}`, flexShrink: 0,
    }}>
      <div style={{
        width: '18px', height: '18px', borderRadius: '50%', backgroundColor: '#fff',
        position: 'absolute', top: '3px', left: checked ? '24px' : '3px',
        transition: 'left 0.25s cubic-bezier(0.22,1,0.36,1)',
        boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
      }} />
    </div>
  </div>
);

const Field = ({ label, value, onChange, type = 'text', placeholder = '' }) => (
  <div style={{ marginBottom: '16px' }}>
    <label style={{ color: C.muted, fontSize: '11.5px', display: 'block', marginBottom: '7px', fontWeight: '700', letterSpacing: '0.3px' }}>{label}</label>
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      style={{
        width: '100%', padding: '11px 14px', backgroundColor: C.card2,
        border: `1px solid ${C.border}`, borderRadius: '10px', color: C.text,
        fontSize: '13.5px', outline: 'none', fontFamily: 'inherit', transition: 'border-color 0.2s, box-shadow 0.2s',
      }}
      onFocus={e => { e.target.style.borderColor = C.green; e.target.style.boxShadow = '0 0 0 3px rgba(0,214,143,0.1)'; }}
      onBlur={e =>  { e.target.style.borderColor = C.border; e.target.style.boxShadow = 'none'; }}
    />
  </div>
);

export default function Settings() {
  const [company, setCompany]   = useState({ name: '', email: '', phone: '', website: '' });
  const [notifs,  setNotifs]    = useState({ taskAssigned: true, deadlineAlert: true, projectUpdate: true, clientView: false, dailyReport: true });
  const [loading, setLoading]   = useState(true);
  const [saving,  setSaving]    = useState(false);

  useEffect(() => { fetchSettings(); }, []);

  const fetchSettings = async () => {
    try {
      const res  = await fetch('https://zeex-digital-production.up.railway.app/api/settings');
      const data = await res.json();
      setCompany({ name: data.company_name || '', email: data.company_email || '', phone: data.company_phone || '', website: data.company_website || '' });
      setNotifs({ taskAssigned: data.notify_task_assigned, deadlineAlert: data.notify_deadline_alert, projectUpdate: data.notify_project_update, clientView: data.notify_client_view, dailyReport: data.notify_daily_report });
    } catch { toast.error('Could not load settings'); }
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('https://zeex-digital-production.up.railway.app/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company_name: company.name, company_email: company.email,
          company_phone: company.phone, company_website: company.website,
          notify_task_assigned: notifs.taskAssigned, notify_deadline_alert: notifs.deadlineAlert,
          notify_project_update: notifs.projectUpdate, notify_client_view: notifs.clientView,
          notify_daily_report: notifs.dailyReport,
        }),
      });
      const d = await res.json();
      if (d.success) toast.success('Settings saved successfully!');
      else toast.error(d.error || 'Save failed');
    } catch { toast.error('Server not connected!'); }
    setSaving(false);
  };

  const SectionCard = ({ icon: Icon, iconColor, title, children }) => (
    <div style={{ backgroundColor: C.card, border: `1px solid ${C.border}`, borderRadius: '18px', padding: '26px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '22px', paddingBottom: '16px', borderBottom: `1px solid ${C.border}` }}>
        <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: `${iconColor}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={18} color={iconColor} strokeWidth={2.2} />
        </div>
        <h3 style={{ color: C.text, fontSize: '15px', fontWeight: '700', margin: 0 }}>{title}</h3>
      </div>
      {children}
    </div>
  );

  if (loading) return (
    <AdminLayout title="Settings">
      <div className="two-col-layout" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {[0,1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 280, borderRadius: 18 }} />)}
      </div>
    </AdminLayout>
  );

  return (
    <AdminLayout title="Settings">
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ color: C.text, fontSize: '20px', fontWeight: '800', margin: 0 }}>Settings</h2>
        <p style={{ color: C.muted, fontSize: '13px', margin: '4px 0 0 0' }}>Manage your agency preferences</p>
      </div>

      <div className="two-col-layout" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>

        {/* Company Info */}
        <SectionCard icon={Building2} iconColor={C.green} title="Company Info">
          <Field label="Company Name"  value={company.name}    onChange={v => setCompany({ ...company, name: v })}    placeholder="ZEEX-Digital" />
          <Field label="Email Address" value={company.email}   onChange={v => setCompany({ ...company, email: v })}   type="email" placeholder="admin@zeex.com" />
          <Field label="Phone Number"  value={company.phone}   onChange={v => setCompany({ ...company, phone: v })}   placeholder="+92 300 0000000" />
          <Field label="Website"       value={company.website} onChange={v => setCompany({ ...company, website: v })} placeholder="https://zeex.com" />
        </SectionCard>

        {/* Notification Settings */}
        <SectionCard icon={Bell} iconColor={C.orange} title="Notification Settings">
          {[
            { label: 'Task Assigned to Member',         key: 'taskAssigned'  },
            { label: 'Deadline Alert (3 days before)',   key: 'deadlineAlert' },
            { label: 'Project Progress Updated',         key: 'projectUpdate' },
            { label: 'Client Viewed Portal',             key: 'clientView'    },
            { label: 'Daily Summary Report (9 AM)',      key: 'dailyReport'   },
          ].map((s, i) => (
            <div key={s.key} style={{ borderBottom: i < 4 ? `1px solid ${C.border}` : 'none' }}>
              <Toggle
                label={s.label}
                checked={notifs[s.key]}
                onClick={() => setNotifs({ ...notifs, [s.key]: !notifs[s.key] })}
              />
            </div>
          ))}
        </SectionCard>

        {/* Admin Profile */}
        <SectionCard icon={UserCircle2} iconColor={C.blue} title="Admin Profile">
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '22px', padding: '16px', backgroundColor: C.card2, borderRadius: '12px', border: `1px solid ${C.border}` }}>
            <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: `linear-gradient(135deg, ${C.greenDark}, ${C.green})`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0A0A12', fontWeight: '900', fontSize: '24px', flexShrink: 0 }}>A</div>
            <div>
              <p style={{ color: C.text, fontSize: '15px', fontWeight: '800', margin: '0 0 3px 0' }}>Super Admin</p>
              <p style={{ color: C.muted, fontSize: '12.5px', margin: 0 }}>admin@zeex.com</p>
              <span style={{ backgroundColor: 'rgba(0,214,143,0.1)', color: C.green, fontSize: '10.5px', fontWeight: '700', padding: '2px 8px', borderRadius: '20px', display: 'inline-block', marginTop: '5px' }}>Admin Role</span>
            </div>
          </div>
          <div style={{ backgroundColor: 'rgba(78,155,255,0.06)', border: `1px solid rgba(78,155,255,0.15)`, borderRadius: '10px', padding: '12px 16px' }}>
            <p style={{ color: C.blue, fontSize: '12.5px', margin: 0, fontWeight: '500' }}>
              💡 Password change & profile editing — coming soon in next update.
            </p>
          </div>
        </SectionCard>

        {/* Security */}
        <SectionCard icon={ShieldCheck} iconColor={C.purple} title="Security">
          {[
            { label: 'Two-Factor Authentication', desc: 'Extra security for your account'   },
            { label: 'Session Timeout (30 min)',  desc: 'Auto logout after inactivity'      },
            { label: 'Email Login Alerts',        desc: 'Get notified on every new login'   },
          ].map((s, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '13px 0', borderBottom: i < 2 ? `1px solid ${C.border}` : 'none' }}>
              <div>
                <p style={{ color: C.text, fontSize: '13.5px', fontWeight: '600', margin: '0 0 2px 0' }}>{s.label}</p>
                <p style={{ color: C.muted, fontSize: '11.5px', margin: 0 }}>{s.desc}</p>
              </div>
              <Toggle checked={false} onClick={() => toast.info('Security features coming soon!')} />
            </div>
          ))}
        </SectionCard>
      </div>

      {/* Save / Cancel */}
      <div style={{ marginTop: '24px', display: 'flex', gap: '12px' }}>
        <button onClick={handleSave} disabled={saving} className="btn-glow" style={{
          padding: '13px 36px', backgroundColor: saving ? `${C.green}70` : C.green,
          color: '#0A0A12', border: 'none', borderRadius: '12px', fontSize: '14px', fontWeight: '800',
          cursor: saving ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontFamily: 'inherit',
        }}>
          <Save size={16} /> {saving ? 'Saving...' : 'Save Settings'}
        </button>
        <button onClick={fetchSettings} style={{
          padding: '13px 28px', backgroundColor: 'transparent', color: C.muted,
          border: `1px solid ${C.border}`, borderRadius: '12px', fontSize: '14px', cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: '8px', fontFamily: 'inherit',
          transition: 'border-color 0.15s, color 0.15s',
        }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = C.muted; e.currentTarget.style.color = C.text; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.muted; }}
        >
          <RotateCcw size={15} /> Reset
        </button>
      </div>
    </AdminLayout>
  );
}