'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import {
  ArrowLeft, Pencil, Users, Handshake, LayoutDashboard, X as XIcon, Check,
} from 'lucide-react';
import EditorLayout from '../../layout';
import { toast } from '../../../components/Toast';
import { C } from '../../../lib/colors';

const API = 'https://zeex-digital-production.up.railway.app';

export default function EditorProjectDetail() {
  const params = useParams();
  const projectId = params.id;

  const [project, setProject]           = useState(null);
  const [projectMembers, setProjectMembers] = useState([]);
  const [members, setMembers]           = useState([]);
  const [clients, setClients]           = useState([]);
  const [loading, setLoading]           = useState(true);
  const [editing, setEditing]           = useState(false);
  const [saving,  setSaving]            = useState(false);
  const [form,    setForm]              = useState({});
  const [activeTab, setActiveTab]       = useState('Overview');
  const [selectedMember, setSelectedMember] = useState('');
  const [selectedClient, setSelectedClient] = useState('');

  useEffect(() => { fetchData(); }, [projectId]);

  const fetchData = async () => {
    try {
      const [pRes, mRes, pmRes, cRes] = await Promise.all([
        fetch(`${API}/api/projects`),
        fetch(`${API}/api/members`),
        fetch(`${API}/api/projects/${projectId}/members`),
        fetch(`${API}/api/clients`),
      ]);
      const projectsData = await pRes.json();
      const found = projectsData.find(p => String(p.id) === String(projectId));
      setProject(found);
      setForm(found || {});
      setMembers(await mRes.json());
      setProjectMembers(await pmRes.json());
      setClients(await cRes.json());
      setSelectedClient(found?.client_id ? String(found.client_id) : '');
    } catch (err) {
      toast.error('Failed to load project data');
    }
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${API}/api/projects/${projectId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        setProject(data.project);
        setEditing(false);
        toast.success('Project updated successfully!');
        fetchData();
      } else {
        toast.error(data.error || 'Update failed');
      }
    } catch (err) {
      toast.error('Network error: ' + err.message);
    }
    setSaving(false);
  };

  const assignMember = async () => {
    if (!selectedMember) return;
    try {
      const res = await fetch(`${API}/api/projects/${projectId}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ member_id: selectedMember }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Member assigned!');
        setSelectedMember('');
        fetchData();
      } else {
        toast.error(data.error || 'Failed to assign member');
      }
    } catch (err) {
      toast.error('Network error');
    }
  };

  const removeMember = async (memberId) => {
    try {
      await fetch(`${API}/api/projects/${projectId}/members/${memberId}`, { method: 'DELETE' });
      toast.success('Member removed');
      setProjectMembers(prev => prev.filter(m => m.id !== memberId));
    } catch (err) {
      toast.error('Failed to remove member');
    }
  };

  const assignClient = async () => {
    try {
      const res = await fetch(`${API}/api/projects/${projectId}/client`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ client_id: selectedClient || null }),
      });
      const data = await res.json();
      if (data.success) {
        setProject(data.project);
        toast.success('Client assigned!');
        fetchData();
      } else {
        toast.error(data.error || 'Failed to assign client');
      }
    } catch (err) {
      toast.error('Network error');
    }
  };

  const inputStyle = {
    width: '100%', padding: '10px 14px', backgroundColor: C.card2,
    border: `1px solid ${C.border}`, borderRadius: '8px',
    color: C.text, fontSize: '14px', outline: 'none', fontFamily: 'inherit',
    boxSizing: 'border-box',
  };

  if (loading || !project) return (
    <EditorLayout title="Loading...">
      <div style={{ color: C.green, padding: '40px', textAlign: 'center' }}>Loading project...</div>
    </EditorLayout>
  );

  const statusCfg = (s) => {
    if (s === 'Completed')   return { color: C.green,  bg: 'rgba(0,214,143,0.1)'  };
    if (s === 'Under Review') return { color: C.orange, bg: 'rgba(255,184,0,0.1)'  };
    if (s === 'On Hold')     return { color: C.red,    bg: 'rgba(255,107,107,0.1)' };
    if (s === 'In Progress') return { color: C.blue,   bg: 'rgba(78,155,255,0.1)' };
    return { color: C.muted, bg: 'rgba(138,138,163,0.1)' };
  };
  const st = statusCfg(project.status);

  return (
    <EditorLayout title={project.name}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '26px', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <a href="/editor/projects" style={{ color: C.muted, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px' }}>
            <ArrowLeft size={16} /> Back to Projects
          </a>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h2 style={{ color: C.text, fontSize: '22px', fontWeight: '800', margin: 0 }}>{project.name}</h2>
              <span style={{ backgroundColor: st.bg, color: st.color, fontSize: '11px', padding: '3px 10px', borderRadius: '20px', fontWeight: '700' }}>{project.status}</span>
            </div>
            <p style={{ color: C.muted, fontSize: '13.5px', margin: '4px 0 0 0' }}>{project.client_name || 'No client assigned'}</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          {editing ? (
            <>
              <button onClick={handleSave} disabled={saving} style={{ backgroundColor: C.green, color: '#0A0A12', border: 'none', padding: '10px 20px', borderRadius: '9px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Check size={14} /> {saving ? 'Saving...' : 'Save Changes'}
              </button>
              <button onClick={() => { setEditing(false); setForm(project); }} style={{ backgroundColor: 'transparent', color: C.muted, border: `1px solid ${C.border}`, padding: '10px 18px', borderRadius: '9px', cursor: 'pointer' }}>
                Cancel
              </button>
            </>
          ) : (
            <button onClick={() => setEditing(true)} style={{ backgroundColor: C.card2, color: C.green, border: `1px solid ${C.border}`, padding: '10px 18px', borderRadius: '9px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Pencil size={14} /> Edit Project
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '4px', borderBottom: `1px solid ${C.border}`, marginBottom: '28px', overflowX: 'auto' }}>
        {[
          { label: 'Overview',    icon: LayoutDashboard },
          { label: 'Team Members', icon: Users           },
          { label: 'Client',      icon: Handshake       },
        ].map(({ label, icon: Icon }) => (
          <button key={label} onClick={() => setActiveTab(label)} style={{
            padding: '12px 18px', background: 'none', border: 'none', cursor: 'pointer',
            fontSize: '14px', fontWeight: '600', whiteSpace: 'nowrap',
            color: activeTab === label ? C.green : C.muted,
            borderBottom: activeTab === label ? `2px solid ${C.green}` : '2px solid transparent',
            display: 'flex', alignItems: 'center', gap: '7px',
          }}>
            <Icon size={15} /> {label}
          </button>
        ))}
      </div>

      {/* ── OVERVIEW TAB ── */}
      {activeTab === 'Overview' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>

          {/* Project Details Card */}
          <div style={{ backgroundColor: C.card, padding: '24px', borderRadius: '16px', border: `1px solid ${C.border}` }}>
            <h3 style={{ color: C.text, margin: '0 0 20px', fontSize: '16px', fontWeight: '700' }}>Project Details</h3>
            <div style={{ display: 'grid', gap: '16px' }}>
              <div>
                <label style={{ color: C.muted, fontSize: '12px', display: 'block', marginBottom: '6px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Project Name</label>
                {editing
                  ? <input value={form.name || ''} onChange={e => setForm({ ...form, name: e.target.value })} style={inputStyle} />
                  : <p style={{ color: C.text, margin: 0, fontSize: '15px', fontWeight: '600' }}>{project.name}</p>
                }
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ color: C.muted, fontSize: '12px', display: 'block', marginBottom: '6px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Start Date</label>
                  {editing
                    ? <input type="date" value={form.start_date?.split('T')[0] || ''} onChange={e => setForm({ ...form, start_date: e.target.value })} style={inputStyle} />
                    : <p style={{ color: C.text, margin: 0 }}>{project.start_date?.split('T')[0] || '—'}</p>
                  }
                </div>
                <div>
                  <label style={{ color: C.muted, fontSize: '12px', display: 'block', marginBottom: '6px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>End Date</label>
                  {editing
                    ? <input type="date" value={form.end_date?.split('T')[0] || ''} onChange={e => setForm({ ...form, end_date: e.target.value })} style={inputStyle} />
                    : <p style={{ color: C.text, margin: 0 }}>{project.end_date?.split('T')[0] || '—'}</p>
                  }
                </div>
              </div>
              <div>
                <label style={{ color: C.muted, fontSize: '12px', display: 'block', marginBottom: '6px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Status</label>
                {editing
                  ? <select value={form.status || ''} onChange={e => setForm({ ...form, status: e.target.value })} style={inputStyle}>
                      {['Not Started', 'In Progress', 'Under Review', 'Completed', 'On Hold'].map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  : <span style={{ backgroundColor: st.bg, color: st.color, fontSize: '12px', padding: '4px 12px', borderRadius: '20px', fontWeight: '700' }}>{project.status}</span>
                }
              </div>
              <div>
                <label style={{ color: C.muted, fontSize: '12px', display: 'block', marginBottom: '6px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Description</label>
                {editing
                  ? <textarea value={form.description || ''} onChange={e => setForm({ ...form, description: e.target.value })} style={{ ...inputStyle, minHeight: '100px', resize: 'vertical' }} rows={4} />
                  : <p style={{ color: C.text, margin: 0, lineHeight: 1.6 }}>{project.description || 'No description provided.'}</p>
                }
              </div>
            </div>
          </div>

          {/* Progress Card */}
          <div style={{ backgroundColor: C.card, padding: '24px', borderRadius: '16px', border: `1px solid ${C.border}` }}>
            <h3 style={{ color: C.text, margin: '0 0 20px', fontSize: '16px', fontWeight: '700' }}>Progress</h3>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <p style={{ color: C.green, fontSize: '56px', fontWeight: '900', margin: '0 0 8px', lineHeight: 1 }}>{editing ? form.progress || 0 : project.progress}%</p>
              <p style={{ color: C.muted, margin: 0, fontSize: '13px' }}>Project Completion</p>
            </div>
            <div style={{ backgroundColor: C.card2, height: '10px', borderRadius: '99px', overflow: 'hidden', marginBottom: '16px' }}>
              <div style={{
                width: `${editing ? form.progress || 0 : project.progress}%`,
                background: `linear-gradient(90deg, ${C.primary}, ${C.green})`,
                height: '100%', borderRadius: '99px',
                transition: 'width 0.5s cubic-bezier(0.25, 1, 0.5, 1)',
              }} />
            </div>
            {editing && (
              <div>
                <input
                  type="range" min="0" max="100"
                  value={form.progress || 0}
                  onChange={e => setForm({ ...form, progress: Number(e.target.value) })}
                  style={{ width: '100%', accentColor: C.green }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
                  <span style={{ color: C.muted, fontSize: '12px' }}>0%</span>
                  <span style={{ color: C.muted, fontSize: '12px' }}>100%</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── TEAM MEMBERS TAB ── */}
      {activeTab === 'Team Members' && (
        <div style={{ backgroundColor: C.card, padding: '24px', borderRadius: '16px', border: `1px solid ${C.border}` }}>
          <h3 style={{ color: C.text, margin: '0 0 20px', fontSize: '16px', fontWeight: '700' }}>Assign Team Members</h3>

          {/* Assign New Member */}
          <div style={{ backgroundColor: C.card2, padding: '18px', borderRadius: '12px', marginBottom: '24px', border: `1px solid ${C.border}` }}>
            <label style={{ color: C.muted, fontSize: '12px', display: 'block', marginBottom: '8px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Add Member to Project</label>
            <div style={{ display: 'flex', gap: '10px' }}>
              <select
                value={selectedMember}
                onChange={e => setSelectedMember(e.target.value)}
                style={{ ...inputStyle, flex: 1 }}
              >
                <option value="">Select member to assign...</option>
                {members.filter(m => !projectMembers.find(pm => pm.id === m.id)).map(m => (
                  <option key={m.id} value={m.id}>{m.name} — {m.department || 'General'}</option>
                ))}
              </select>
              <button
                onClick={assignMember}
                disabled={!selectedMember}
                style={{
                  padding: '10px 22px', backgroundColor: selectedMember ? C.green : C.card3,
                  color: selectedMember ? '#0A0A12' : C.muted,
                  border: 'none', borderRadius: '8px', fontWeight: '700',
                  cursor: selectedMember ? 'pointer' : 'not-allowed', flexShrink: 0,
                  transition: 'all 0.2s',
                }}
              >
                Assign
              </button>
            </div>
          </div>

          {/* Assigned Members List */}
          <div>
            <p style={{ color: C.muted, fontSize: '13px', margin: '0 0 12px', fontWeight: '600' }}>{projectMembers.length} member{projectMembers.length !== 1 ? 's' : ''} assigned</p>
            {projectMembers.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: C.muted }}>
                <Users size={36} strokeWidth={1.2} style={{ marginBottom: '10px', opacity: 0.5 }} />
                <p style={{ margin: 0 }}>No members assigned yet. Assign your first member above.</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '10px' }}>
                {projectMembers.map(m => (
                  <div key={m.id} style={{
                    padding: '14px 16px', backgroundColor: C.card2, borderRadius: '10px',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    border: `1px solid ${C.border}`,
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '36px', height: '36px', borderRadius: '50%',
                        backgroundColor: m.avatar_color || C.primary,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#fff', fontWeight: '700', fontSize: '14px', flexShrink: 0,
                      }}>
                        {m.name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p style={{ color: C.text, margin: 0, fontWeight: '600', fontSize: '14px' }}>{m.name}</p>
                        <p style={{ color: C.muted, margin: 0, fontSize: '12px' }}>{m.department || 'Team Member'}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => removeMember(m.id)}
                      style={{ background: 'rgba(255,71,87,0.1)', border: '1px solid rgba(255,71,87,0.2)', color: C.red, padding: '6px 14px', borderRadius: '7px', cursor: 'pointer', fontWeight: '600', fontSize: '12.5px', display: 'flex', alignItems: 'center', gap: '5px' }}
                    >
                      <XIcon size={12} /> Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── CLIENT TAB ── */}
      {activeTab === 'Client' && (
        <div style={{ backgroundColor: C.card, padding: '24px', borderRadius: '16px', border: `1px solid ${C.border}` }}>
          <h3 style={{ color: C.text, margin: '0 0 20px', fontSize: '16px', fontWeight: '700' }}>Assign Client</h3>

          {/* Current Client */}
          {project.client_name && (
            <div style={{
              backgroundColor: 'rgba(0,240,255,0.06)', border: `1px solid ${C.primary}30`,
              borderRadius: '12px', padding: '16px 20px', marginBottom: '24px',
              display: 'flex', alignItems: 'center', gap: '12px',
            }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: C.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000', fontWeight: '700', fontSize: '16px', flexShrink: 0 }}>
                {project.client_name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p style={{ color: C.text, margin: 0, fontWeight: '700', fontSize: '15px' }}>{project.client_name}</p>
                <p style={{ color: C.muted, margin: 0, fontSize: '12px' }}>Current Client</p>
              </div>
            </div>
          )}

          <div style={{ backgroundColor: C.card2, padding: '18px', borderRadius: '12px', border: `1px solid ${C.border}` }}>
            <label style={{ color: C.muted, fontSize: '12px', display: 'block', marginBottom: '8px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Change / Assign Client</label>
            <div style={{ display: 'flex', gap: '10px' }}>
              <select
                value={selectedClient}
                onChange={e => setSelectedClient(e.target.value)}
                style={{ ...inputStyle, flex: 1 }}
              >
                <option value="">— No Client —</option>
                {clients.map(c => (
                  <option key={c.id} value={c.id}>{c.name} {c.company ? `(${c.company})` : ''}</option>
                ))}
              </select>
              <button
                onClick={assignClient}
                style={{
                  padding: '10px 22px', backgroundColor: C.green, color: '#0A0A12',
                  border: 'none', borderRadius: '8px', fontWeight: '700',
                  cursor: 'pointer', flexShrink: 0,
                }}
              >
                Update
              </button>
            </div>
          </div>
        </div>
      )}
    </EditorLayout>
  );
}
