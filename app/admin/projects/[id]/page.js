'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import {
  LayoutDashboard, FolderKanban, Users, Handshake, CheckSquare,
  Bell, Settings, ArrowLeft, Pencil, Check, X as XIcon, Clock, Calendar, Paperclip, Download, Upload
} from 'lucide-react';
import AdminLayout from '../../../components/AdminLayout'; // using layout component
import { toast } from '../../../components/Toast';

import { C } from '../../../lib/colors';

export default function ProjectDetail() {
  const params = useParams();
  const projectId = params.id;
  
  const [project, setProject] = useState(null);
  const [projectMembers, setProjectMembers] = useState([]);
  const [members, setMembers] = useState([]);
  const [clients, setClients] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [milestones, setMilestones] = useState([]);
  const [timeLogs, setTimeLogs] = useState([]);
  const [files, setFiles] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [activeTab, setActiveTab] = useState('Overview');
  
  const [selectedMember, setSelectedMember] = useState('');
  const [selectedClient, setSelectedClient] = useState('');

  useEffect(() => {
    fetchData();
  }, [projectId]);

  const fetchData = async () => {
    try {
      const [pRes, mRes, pmRes, cRes, tRes, milRes, tlRes, filesRes] = await Promise.all([
        fetch('https://zeex-digital-production.up.railway.app/api/projects'),
        fetch('https://zeex-digital-production.up.railway.app/api/members'),
        fetch(`https://zeex-digital-production.up.railway.app/api/projects/${projectId}/members`),
        fetch('https://zeex-digital-production.up.railway.app/api/clients'),
        fetch('https://zeex-digital-production.up.railway.app/api/tasks'),
        fetch(`https://zeex-digital-production.up.railway.app/api/milestones?project_id=${projectId}`),
        fetch(`https://zeex-digital-production.up.railway.app/api/time-logs?project_id=${projectId}`),
        fetch(`https://zeex-digital-production.up.railway.app/api/projects/${projectId}/files`)
      ]);
      const projectsData = await pRes.json();
      const found = projectsData.find(p => String(p.id) === String(projectId));
      setProject(found);
      setForm(found || {});
      
      setMembers(await mRes.json());
      setProjectMembers(await pmRes.json());
      setClients(await cRes.json());
      
      const allTasks = await tRes.json();
      setTasks(allTasks.filter(t => String(t.project_id) === String(projectId)));
      setMilestones(await milRes.json());
      setTimeLogs(await tlRes.json());
      setFiles(await filesRes.json());
      
      setSelectedClient(found?.client_id ? String(found.client_id) : '');
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const handleSave = async () => {
    try {
      const res = await fetch(`https://zeex-digital-production.up.railway.app/api/projects/${projectId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (data.success) {
        setProject(data.project);
        setEditing(false);
        toast?.success('Project updated');
      }
    } catch (err) {
      toast?.error('Error: ' + err.message);
    }
  };

  const assignMember = async () => {
    if (!selectedMember) return;
    try {
      const res = await fetch(`https://zeex-digital-production.up.railway.app/api/projects/${projectId}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ member_id: selectedMember })
      });
      if ((await res.json()).success) fetchData();
    } catch (err) {}
  };

  const removeMember = async (memberId) => {
    try {
      await fetch(`https://zeex-digital-production.up.railway.app/api/projects/${projectId}/members/${memberId}`, { method: 'DELETE' });
      setProjectMembers(projectMembers.filter(m => m.id !== memberId));
    } catch (err) {}
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await fetch(`https://zeex-digital-production.up.railway.app/api/projects/${projectId}/files`, {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (res.ok) {
        toast?.success('File uploaded');
        const fRes = await fetch(`https://zeex-digital-production.up.railway.app/api/projects/${projectId}/files`);
        setFiles(await fRes.json());
      } else {
        toast?.error(data.error || 'Upload failed');
      }
    } catch (err) {
      toast?.error('Upload failed');
    }
    setUploading(false);
  };

  const handleDeleteFile = async (id) => {
    if (!confirm('Delete this file?')) return;
    try {
      await fetch(`https://zeex-digital-production.up.railway.app/api/files/${id}`, { method: 'DELETE' });
      setFiles(files.filter(f => f.id !== id));
      toast?.success('File deleted');
    } catch (err) {}
  };

  const assignClient = async () => {
    try {
      const res = await fetch(`https://zeex-digital-production.up.railway.app/api/projects/${projectId}/client`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ client_id: selectedClient || null })
      });
      const data = await res.json();
      if (data.success) setProject(data.project);
    } catch (err) {}
  };

  const inputStyle = { width: '100%', padding: '10px 14px', backgroundColor: C.card2, border: `1px solid ${C.border}`, borderRadius: '8px', color: C.text, fontSize: '14px', outline: 'none' };

  if (loading || !project) return <AdminLayout title="Loading..."><div style={{color: C.green}}>Loading...</div></AdminLayout>;

  return (
    <AdminLayout title={project.name}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '26px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <a href="/admin/projects" style={{ color: C.muted, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ArrowLeft size={16} /> Back
          </a>
          <div>
            <h2 style={{ color: C.text, fontSize: '22px', fontWeight: '800', margin: 0 }}>{project.name}</h2>
            <p style={{ color: C.muted, fontSize: '13.5px', margin: '4px 0 0 0' }}>{project.client_name || 'Internal Project'}</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          {editing ? (
            <>
              <button onClick={handleSave} className="btn-glow" style={{ backgroundColor: C.green, color: '#0A0A12', border: 'none', padding: '10px 18px', borderRadius: '9px', fontWeight: '700', cursor: 'pointer' }}>Save</button>
              <button onClick={() => setEditing(false)} style={{ backgroundColor: 'transparent', color: C.muted, border: `1px solid ${C.border}`, padding: '10px 18px', borderRadius: '9px', cursor: 'pointer' }}>Cancel</button>
            </>
          ) : (
            <button onClick={() => setEditing(true)} style={{ backgroundColor: C.card2, color: C.green, border: `1px solid ${C.border}`, padding: '10px 18px', borderRadius: '9px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Pencil size={14} /> Edit Project
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '16px', borderBottom: `1px solid ${C.border}`, marginBottom: '24px', overflowX: 'auto' }}>
        {['Overview', 'Tasks', 'Milestones', 'Time Logs', 'Team Members', 'Files'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{
            padding: '12px 16px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: '600',
            color: activeTab === tab ? C.green : C.muted,
            borderBottom: activeTab === tab ? `2px solid ${C.green}` : '2px solid transparent'
          }}>
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {activeTab === 'Overview' && (
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
            <div style={{ backgroundColor: C.card, padding: '24px', borderRadius: '16px', border: `1px solid ${C.border}` }}>
              <h3 style={{ color: C.text, margin: '0 0 16px' }}>Project Details</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ color: C.muted, fontSize: '12px', display: 'block', marginBottom: '4px' }}>Start Date</label>
                  {editing ? <input type="date" value={form.start_date?.split('T')[0] || ''} onChange={e => setForm({...form, start_date: e.target.value})} style={inputStyle} /> : <p style={{ color: C.text, margin: 0 }}>{project.start_date?.split('T')[0] || '—'}</p>}
                </div>
                <div>
                  <label style={{ color: C.muted, fontSize: '12px', display: 'block', marginBottom: '4px' }}>End Date</label>
                  {editing ? <input type="date" value={form.end_date?.split('T')[0] || ''} onChange={e => setForm({...form, end_date: e.target.value})} style={inputStyle} /> : <p style={{ color: C.text, margin: 0 }}>{project.end_date?.split('T')[0] || '—'}</p>}
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ color: C.muted, fontSize: '12px', display: 'block', marginBottom: '4px' }}>Description</label>
                  {editing ? <textarea value={form.description || ''} onChange={e => setForm({...form, description: e.target.value})} style={inputStyle} rows={4} /> : <p style={{ color: C.text, margin: 0 }}>{project.description || 'No description provided.'}</p>}
                </div>
              </div>
            </div>
            
            <div style={{ backgroundColor: C.card, padding: '24px', borderRadius: '16px', border: `1px solid ${C.border}` }}>
              <h3 style={{ color: C.text, margin: '0 0 16px' }}>Progress</h3>
              <div style={{ textAlign: 'center' }}>
                <p style={{ color: C.green, fontSize: '48px', fontWeight: '800', margin: '0 0 8px' }}>{editing ? form.progress : project.progress}%</p>
                <div style={{ backgroundColor: C.card2, height: '8px', borderRadius: '4px', overflow: 'hidden', marginBottom: '16px' }}>
                  <div style={{ width: `${editing ? form.progress : project.progress}%`, backgroundColor: C.green, height: '100%' }} />
                </div>
                {editing && <input type="range" min="0" max="100" value={form.progress || 0} onChange={e => setForm({...form, progress: e.target.value})} style={{ width: '100%' }} />}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'Tasks' && (
          <div style={{ backgroundColor: C.card, padding: '24px', borderRadius: '16px', border: `1px solid ${C.border}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ color: C.text, margin: 0 }}>Project Tasks</h3>
              <a href="/admin/tasks" style={{ color: C.primary, fontSize: '13px', textDecoration: 'none' }}>Go to Kanban Board →</a>
            </div>
            {tasks.length === 0 ? <p style={{ color: C.muted }}>No tasks found for this project.</p> : (
              <div style={{ display: 'grid', gap: '10px' }}>
                {tasks.map(t => (
                  <div key={t.id} style={{ padding: '12px', backgroundColor: C.card2, borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <p style={{ color: C.text, margin: '0 0 4px', fontWeight: '600' }}>{t.name}</p>
                      <p style={{ color: C.muted, margin: 0, fontSize: '12px' }}>Assigned to: {t.member_name || 'Unassigned'}</p>
                    </div>
                    <span style={{ padding: '4px 8px', backgroundColor: 'rgba(0,240,255,0.1)', color: C.primary, borderRadius: '12px', fontSize: '12px', height: 'fit-content' }}>{t.status}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'Milestones' && (
          <div style={{ backgroundColor: C.card, padding: '24px', borderRadius: '16px', border: `1px solid ${C.border}` }}>
            <h3 style={{ color: C.text, margin: '0 0 16px' }}>Milestones</h3>
            {milestones.length === 0 ? <p style={{ color: C.muted }}>No milestones created yet.</p> : (
              <div style={{ display: 'grid', gap: '10px' }}>
                {milestones.map(m => (
                  <div key={m.id} style={{ padding: '12px', backgroundColor: C.card2, borderRadius: '8px', display: 'flex', justifyContent: 'space-between' }}>
                    <p style={{ color: C.text, margin: 0, fontWeight: '600' }}>{m.title}</p>
                    <span style={{ color: m.status === 'Completed' ? C.green : C.orange }}>{m.status}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'Time Logs' && (
          <div style={{ backgroundColor: C.card, padding: '24px', borderRadius: '16px', border: `1px solid ${C.border}` }}>
            <h3 style={{ color: C.text, margin: '0 0 16px' }}>Time Logs</h3>
            {timeLogs.length === 0 ? <p style={{ color: C.muted }}>No time logged for this project.</p> : (
              <div style={{ display: 'grid', gap: '10px' }}>
                {timeLogs.map(l => (
                  <div key={l.id} style={{ padding: '12px', backgroundColor: C.card2, borderRadius: '8px', display: 'flex', justifyContent: 'space-between' }}>
                    <div>
                      <p style={{ color: C.text, margin: '0 0 4px', fontWeight: '600' }}>{l.description || 'No description'}</p>
                      <p style={{ color: C.muted, margin: 0, fontSize: '12px' }}>{new Date(l.log_date).toLocaleDateString()} · By {l.member_name || 'Admin'}</p>
                    </div>
                    <span style={{ color: C.green, fontWeight: '700' }}>{l.hours} hrs</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'Files' && (
          <div style={{ backgroundColor: C.card, padding: '24px', borderRadius: '16px', border: `1px solid ${C.border}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ color: C.text, margin: 0 }}>Project Files</h3>
              <label style={{ backgroundColor: C.blue, color: '#fff', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '700' }}>
                <Upload size={14} /> {uploading ? 'Uploading...' : 'Upload File'}
                <input type="file" style={{ display: 'none' }} onChange={handleFileUpload} disabled={uploading} />
              </label>
            </div>
            {files.length === 0 ? <p style={{ color: C.muted }}>No files uploaded yet.</p> : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
                {files.map(f => (
                  <div key={f.id} style={{ padding: '16px', backgroundColor: C.card2, borderRadius: '12px', border: `1px solid ${C.border}`, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: 'rgba(0,114,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Paperclip size={20} color={C.blue} />
                      </div>
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <p style={{ color: C.text, margin: '0 0 4px', fontSize: '14px', fontWeight: '600', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={f.file_name}>{f.file_name}</p>
                        <p style={{ color: C.muted, margin: 0, fontSize: '11px' }}>{(f.file_size / 1024 / 1024).toFixed(2)} MB · {new Date(f.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <a href={`https://zeex-digital-production.up.railway.app${f.file_path}`} target="_blank" rel="noreferrer" style={{ flex: 1, padding: '8px', backgroundColor: 'rgba(0,240,255,0.1)', color: C.primary, textAlign: 'center', borderRadius: '6px', textDecoration: 'none', fontSize: '12px', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                        <Download size={12} /> Download
                      </a>
                      <button onClick={() => handleDeleteFile(f.id)} style={{ padding: '8px', backgroundColor: 'rgba(255,71,87,0.1)', color: C.red, border: 'none', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <XIcon size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'Team Members' && (
          <div style={{ backgroundColor: C.card, padding: '24px', borderRadius: '16px', border: `1px solid ${C.border}` }}>
            <h3 style={{ color: C.text, margin: '0 0 16px' }}>Assigned Members</h3>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
              <select value={selectedMember} onChange={e => setSelectedMember(e.target.value)} style={inputStyle}>
                <option value="">Select member to assign...</option>
                {members.filter(m => !projectMembers.find(pm => pm.id === m.id)).map(m => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
              <button onClick={assignMember} style={{ padding: '0 20px', backgroundColor: C.green, color: '#000', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Assign</button>
            </div>
            
            <div style={{ display: 'grid', gap: '10px' }}>
              {projectMembers.map(m => (
                <div key={m.id} style={{ padding: '12px', backgroundColor: C.card2, borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: C.text, fontWeight: '600' }}>{m.name}</span>
                  <button onClick={() => removeMember(m.id)} style={{ background: 'none', border: 'none', color: C.red, cursor: 'pointer' }}>Remove</button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}