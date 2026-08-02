'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  FolderKanban, Handshake, CalendarDays, FileText,
  ArrowLeft, Sparkles, TrendingUp, Users,
} from 'lucide-react';
import AdminLayout from '../../../components/AdminLayout';
import { toast } from '../../../components/Toast';

const C = {
  bg2: '#080E1E', card: '#0C1327', card2: '#121C38', card3: '#18264B',
  border: '#1E2D56',
  primary: '#00F0FF', primaryDark: '#0072FF',
  green: '#00E599', greenDark: '#00B377',
  red: '#FF4757', orange: '#FF9900', blue: '#0072FF', purple: '#9D4EDD',
  muted: '#64748B', muted2: '#334155', text: '#F1F5F9', text2: '#94A3B8',
};

const SERVICES = [
  'WordPress Development', 'React Development', 'Figma/UI Design',
  'Mobile App Development', 'QA & Testing', 'SEO', 'Content Writing',
  'Professional Video Editing', 'Frontend Development',
  'Backend Development', 'Full Stack Development',
];

const STATUSES = ['Not Started', 'In Progress', 'Under Review', 'On Hold', 'Completed'];

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

function fi(e) { e.target.style.borderColor = C.primary; e.target.style.boxShadow = '0 0 12px rgba(0,240,255,0.15)'; }
function bi(e) { e.target.style.borderColor = C.border; e.target.style.boxShadow = 'none'; }

export default function NewProject() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: '', client_name: '', client_id: '', service_type: '',
    start_date: '', end_date: '', progress: 0, status: 'Not Started', description: '',
  });
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  useEffect(() => {
    fetch('http://localhost:5000/api/clients')
      .then(r => r.json())
      .then(d => { if (Array.isArray(d)) setClients(d); })
      .catch(() => {});
  }, []);

  const handleClientSelect = (e) => {
    const id = e.target.value;
    set('client_id', id);
    const cl = clients.find(c => String(c.id) === id);
    if (cl) set('client_name', cl.name);
    else if (!id) set('client_name', '');
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) { toast.error('Project Name required hai!'); return; }
    if (!form.client_name.trim()) { toast.error('Client Name required hai!'); return; }
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name, client_name: form.client_name, client_id: form.client_id || null,
          service_type: form.service_type, start_date: form.start_date, end_date: form.end_date,
          progress: form.progress, status: form.status, description: form.description,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Project "${form.name}" created!`);
        setTimeout(() => router.push('/admin/projects'), 1200);
      } else {
        toast.error(data.error || 'Project create karne mein error aaya');
      }
    } catch { toast.error('Server se connect nahi ho pa raha!'); }
    setLoading(false);
  };

  const statusColor = {
    'Not Started': C.muted,
    'In Progress': C.blue,
    'Under Review': C.orange,
    'On Hold': C.red,
    'Completed': C.green,
  }[form.status] || C.muted;

  return (
    <AdminLayout title="Create Project">
      <div style={{ maxWidth: '840px', margin: '0 auto' }}>

        {/* Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '28px' }}>
          <a href="/admin/projects" style={{ display: 'flex', alignItems: 'center', gap: '6px', color: C.muted, fontSize: '13px', transition: 'color 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.color = C.text}
            onMouseLeave={e => e.currentTarget.style.color = C.muted}
          >
            <ArrowLeft size={14} /> Back to Projects
          </a>
          <span style={{ color: C.muted2 }}>/</span>
          <span style={{ color: C.text2, fontSize: '13px' }}>Create New Project</span>
        </div>

        {/* Header */}
        <div style={{ marginBottom: '28px' }}>
          <h2 style={{ color: C.text, fontSize: '22px', fontWeight: '800', margin: '0 0 4px', letterSpacing: '-0.3px' }}>
            Create New Project
          </h2>
          <p style={{ color: C.muted, fontSize: '13px', margin: 0 }}>
            Project details aur milestones set karo — client ke liye portal automatically update hoga
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 260px', gap: '20px', alignItems: 'start' }}>

          {/* Form */}
          <div className="card" style={{ padding: '28px' }}>

            {/* Project Name */}
            <Field label="Project Name" icon={FolderKanban} required>
              <input style={INPUT} value={form.name} placeholder="e.g. Al-Noor Hospital Website"
                onChange={e => set('name', e.target.value)} onFocus={fi} onBlur={bi} />
            </Field>

            <hr className="divider" style={{ margin: '20px 0' }} />
            <p className="section-title" style={{ marginBottom: '16px' }}>Client Information</p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
              <Field label="Select Existing Client" icon={Handshake}>
                <select style={{ ...INPUT, appearance: 'none', cursor: 'pointer' }}
                  value={form.client_id} onChange={handleClientSelect} onFocus={fi} onBlur={bi}>
                  <option value="">-- Select Client --</option>
                  {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </Field>
              <Field label="Or Type Client Name" icon={Handshake} required>
                <input style={INPUT} value={form.client_name} placeholder="e.g. Al-Noor Group"
                  onChange={e => set('client_name', e.target.value)} onFocus={fi} onBlur={bi} />
              </Field>
            </div>

            <Field label="Service Type" icon={TrendingUp}>
              <select style={{ ...INPUT, appearance: 'none', cursor: 'pointer', marginBottom: '20px' }}
                value={form.service_type} onChange={e => set('service_type', e.target.value)} onFocus={fi} onBlur={bi}>
                <option value="">-- Select Service --</option>
                {SERVICES.map(s => <option key={s}>{s}</option>)}
              </select>
            </Field>

            <hr className="divider" style={{ margin: '4px 0 20px' }} />
            <p className="section-title" style={{ marginBottom: '16px' }}>Timeline & Status</p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
              <Field label="Start Date" icon={CalendarDays}>
                <input type="date" style={INPUT} value={form.start_date}
                  onChange={e => set('start_date', e.target.value)} onFocus={fi} onBlur={bi} />
              </Field>
              <Field label="Deadline / End Date" icon={CalendarDays}>
                <input type="date" style={INPUT} value={form.end_date}
                  onChange={e => set('end_date', e.target.value)} onFocus={fi} onBlur={bi} />
              </Field>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
              <Field label="Status">
                <select style={{ ...INPUT, appearance: 'none', cursor: 'pointer' }}
                  value={form.status} onChange={e => set('status', e.target.value)} onFocus={fi} onBlur={bi}>
                  {STATUSES.map(s => <option key={s}>{s}</option>)}
                </select>
              </Field>
              <Field label={`Initial Progress: ${form.progress}%`} icon={TrendingUp}>
                <div style={{ paddingTop: '4px' }}>
                  <input type="range" min="0" max="100" value={form.progress}
                    onChange={e => set('progress', Number(e.target.value))}
                    style={{ width: '100%', accentColor: C.primary, cursor: 'pointer', marginBottom: '8px' }} />
                  <div className="progress-track" style={{ height: '6px' }}>
                    <div className="progress-fill" style={{ width: `${form.progress}%` }} />
                  </div>
                </div>
              </Field>
            </div>

            <hr className="divider" style={{ margin: '0 0 20px' }} />
            <Field label="Description / Project Scope" icon={FileText}>
              <textarea style={{ ...INPUT, resize: 'vertical', minHeight: '90px', lineHeight: '1.6', marginBottom: '24px' }}
                value={form.description} placeholder="Project goals, scope, requirements, notes..."
                onChange={e => set('description', e.target.value)} onFocus={fi} onBlur={bi} />
            </Field>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={handleSubmit} disabled={loading} className="btn-glow"
                style={{ flex: 1, justifyContent: 'center', padding: '13px', fontSize: '14px', opacity: loading ? 0.7 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}>
                {loading ? (
                  <><span style={{ width: 14, height: 14, border: `2px solid #030712`, borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.6s linear infinite' }} /> Creating...</>
                ) : (
                  <><Sparkles size={15} /> Create Project</>
                )}
              </button>
              <a href="/admin/projects" className="btn-ghost" style={{ padding: '13px 22px', justifyContent: 'center' }}>
                Cancel
              </a>
            </div>
          </div>

          {/* Preview */}
          <div style={{ position: 'sticky', top: '88px' }}>
            <div className="card-cyber" style={{ padding: '24px' }}>
              <p className="section-title" style={{ marginBottom: '18px' }}>Project Preview</p>

              <div style={{ marginBottom: '18px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '11px', backgroundColor: 'rgba(0,114,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <FolderKanban size={18} color={C.blue} />
                  </div>
                  <div>
                    <p style={{ color: C.text, fontSize: '14px', fontWeight: '700', margin: 0 }}>
                      {form.name || 'Project Name'}
                    </p>
                    <p style={{ color: C.muted, fontSize: '11.5px', margin: 0 }}>
                      {form.service_type || 'Service Type'}
                    </p>
                  </div>
                </div>

                {form.client_name && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
                    <Handshake size={12} color={C.green} />
                    <span style={{ color: C.text2, fontSize: '12px' }}>{form.client_name}</span>
                  </div>
                )}

                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '3px 10px', borderRadius: '99px', fontSize: '11px', fontWeight: '700', backgroundColor: `${statusColor}15`, color: statusColor }}>
                  {form.status}
                </span>
              </div>

              <hr className="divider" style={{ marginBottom: '16px' }} />

              <p style={{ color: C.muted, fontSize: '11.5px', fontWeight: '600', margin: '0 0 8px' }}>Progress</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ color: C.text2, fontSize: '12px' }}>Completion</span>
                <span style={{ color: C.primary, fontSize: '12px', fontWeight: '700' }}>{form.progress}%</span>
              </div>
              <div className="progress-track" style={{ height: '6px', marginBottom: '16px' }}>
                <div className="progress-fill" style={{ width: `${form.progress}%` }} />
              </div>

              {(form.start_date || form.end_date) && (
                <>
                  <hr className="divider" style={{ marginBottom: '14px' }} />
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {form.start_date && (
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: C.muted, fontSize: '12px' }}>Start</span>
                        <span style={{ color: C.text2, fontSize: '12px', fontWeight: '600' }}>
                          {new Date(form.start_date).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: '2-digit' })}
                        </span>
                      </div>
                    )}
                    {form.end_date && (
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: C.muted, fontSize: '12px' }}>Deadline</span>
                        <span style={{ color: C.orange, fontSize: '12px', fontWeight: '600' }}>
                          {new Date(form.end_date).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: '2-digit' })}
                        </span>
                      </div>
                    )}
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