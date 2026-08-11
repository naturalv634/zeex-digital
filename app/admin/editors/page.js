'use client';
import { useState, useEffect } from 'react';
import {
  Pencil, Plus, Trash2, ExternalLink, Mail, Building2,
  Search, FolderKanban, ShieldCheck,
} from 'lucide-react';
import AdminLayout from '../../components/AdminLayout';
import { toast } from '../../components/Toast';
import { C } from '../../lib/colors';

const AVATAR_COLORS = ['#9D4EDD','#7C3AED','#A78BFA','#C084FC','#8B5CF6','#6D28D9','#DDD6FE','#4C1D95'];

const API = 'https://zeex-digital-production.up.railway.app';

export default function EditorsPage() {
  const [editors, setEditors]   = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search,  setSearch]    = useState('');

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [mRes, pRes] = await Promise.all([
        fetch(`${API}/api/members`),
        fetch(`${API}/api/projects`),
      ]);
      const allMembers = await mRes.json();
      setEditors(allMembers.filter(m => m.role === 'editor'));
      setProjects(await pRes.json());
    } catch {
      toast.error('Failed to load editors');
    }
    setLoading(false);
  };

  const deleteEditor = async (id, name) => {
    if (!confirm(`Delete editor "${name}"? This cannot be undone.`)) return;
    try {
      const res = await fetch(`${API}/api/members/${id}`, { method: 'DELETE' });
      const d   = await res.json();
      if (d.success) { toast.success(`"${name}" deleted`); fetchAll(); }
      else toast.error(d.error || 'Delete failed');
    } catch { toast.error('Network error'); }
  };

  const filtered = editors.filter(e =>
    !search ||
    e.name?.toLowerCase().includes(search.toLowerCase()) ||
    e.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout title="Editors">

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
            <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: 'rgba(157,78,221,0.15)', border: '1px solid rgba(157,78,221,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Pencil size={16} color={C.purple} />
            </div>
            <h2 style={{ color: C.text, fontSize: '20px', fontWeight: '800', margin: 0 }}>Editors</h2>
          </div>
          <p style={{ color: C.muted, fontSize: '13px', margin: 0 }}>
            {editors.length} editor{editors.length !== 1 ? 's' : ''} — only have access to Projects
          </p>
        </div>
        <a href="/admin/members/new" className="btn-glow" style={{
          backgroundColor: C.purple, color: '#fff', padding: '11px 20px',
          borderRadius: '12px', fontSize: '13.5px', fontWeight: '800',
          display: 'flex', alignItems: 'center', gap: '7px', textDecoration: 'none',
        }}>
          <Plus size={16} strokeWidth={2.8} /> Add Editor
        </a>
      </div>

      {/* Info Banner */}
      <div style={{
        backgroundColor: 'rgba(157,78,221,0.07)', border: '1px solid rgba(157,78,221,0.2)',
        borderRadius: '14px', padding: '16px 20px', marginBottom: '24px',
        display: 'flex', alignItems: 'center', gap: '14px',
      }}>
        <ShieldCheck size={20} color={C.purple} style={{ flexShrink: 0 }} />
        <p style={{ color: C.text2, fontSize: '13.5px', margin: 0, lineHeight: 1.6 }}>
          <strong style={{ color: C.purple }}>Editor Role:</strong> Editors can only view and edit projects — assign members and clients to projects. They have <strong>no access</strong> to Invoices, Attendance, Reports, or any other admin sections.
        </p>
      </div>

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: '22px', maxWidth: '320px' }}>
        <Search size={13} color={C.muted} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
        <input
          placeholder="Search editors..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ padding: '10px 14px 10px 34px', borderRadius: '10px', border: `1px solid ${search ? C.purple : C.border}`, backgroundColor: C.card2, color: C.text, fontSize: '13px', width: '100%', outline: 'none', fontFamily: 'inherit' }}
        />
      </div>

      {/* Content */}
      {loading ? (
        <div className="card-grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
          {[0,1,2].map(i => (
            <div key={i} style={{ backgroundColor: C.card, border: `1px solid ${C.border}`, borderRadius: '18px', padding: '24px' }}>
              <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', alignItems: 'center' }}>
                <div className="skeleton" style={{ width: 52, height: 52, borderRadius: '50%' }} />
                <div style={{ flex: 1 }}>
                  <div className="skeleton" style={{ height: 14, width: '70%', marginBottom: 7, borderRadius: 8 }} />
                  <div className="skeleton" style={{ height: 11, width: '50%', borderRadius: 8 }} />
                </div>
              </div>
              <div className="skeleton" style={{ height: 36, borderRadius: 10 }} />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 0', backgroundColor: C.card, border: `1px solid ${C.border}`, borderRadius: '20px' }}>
          <Pencil size={48} color={C.muted2} strokeWidth={1.2} style={{ marginBottom: '14px', opacity: 0.5 }} />
          <p style={{ color: C.text, fontSize: '17px', fontWeight: '700', margin: '0 0 8px 0' }}>
            {search ? 'No editors match your search' : 'No editors yet'}
          </p>
          <p style={{ color: C.muted, fontSize: '13.5px', margin: '0 0 22px 0' }}>
            {search ? 'Try different search terms.' : 'Create an editor account so they can manage projects.'}
          </p>
          {!search && (
            <a href="/admin/members/new" style={{
              backgroundColor: C.purple, color: '#fff', padding: '11px 24px',
              borderRadius: '12px', fontSize: '13.5px', fontWeight: '800', textDecoration: 'none',
            }}>
              + Add First Editor
            </a>
          )}
        </div>
      ) : (
        <div className="card-grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
          {filtered.map((editor, idx) => {
            const ac = editor.avatar_color || AVATAR_COLORS[idx % AVATAR_COLORS.length];
            // Count projects this editor is assigned to via project_members
            return (
              <div key={editor.id} className="hover-lift" style={{
                backgroundColor: C.card, border: `1px solid ${C.border}`,
                borderRadius: '18px', padding: '24px', display: 'flex',
                flexDirection: 'column', position: 'relative',
                transition: 'border-color 0.2s',
              }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(157,78,221,0.5)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = C.border}
              >
                {/* EDITOR badge */}
                <span style={{
                  position: 'absolute', top: '16px', right: '16px',
                  backgroundColor: 'rgba(157,78,221,0.15)', color: C.purple,
                  fontSize: '10px', padding: '3px 9px', borderRadius: '20px', fontWeight: '800',
                  border: '1px solid rgba(157,78,221,0.3)', letterSpacing: '0.5px',
                }}>EDITOR</span>

                {/* Avatar */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '13px', marginBottom: '18px', paddingRight: '60px' }}>
                  <div style={{
                    width: '52px', height: '52px', borderRadius: '50%', flexShrink: 0,
                    backgroundColor: ac, display: 'flex', alignItems: 'center',
                    justifyContent: 'center', color: '#fff', fontWeight: '800',
                    fontSize: '20px', border: `3px solid ${ac}50`,
                  }}>
                    {(editor.name || 'E')[0].toUpperCase()}
                  </div>
                  <div>
                    <p style={{ color: C.text, fontSize: '14.5px', fontWeight: '700', margin: '0 0 3px' }}>{editor.name}</p>
                    <p style={{ color: C.muted, fontSize: '11.5px', margin: 0 }}>{editor.department || 'Editor'}</p>
                  </div>
                </div>

                {/* Info */}
                <div style={{ marginBottom: '18px', display: 'flex', flexDirection: 'column', gap: '7px' }}>
                  <p style={{ color: C.muted, fontSize: '12px', margin: 0, display: 'flex', alignItems: 'center', gap: '7px' }}>
                    <Mail size={12} color={C.blue} /> {editor.email}
                  </p>
                  {editor.phone && (
                    <p style={{ color: C.muted, fontSize: '12px', margin: 0, display: 'flex', alignItems: 'center', gap: '7px' }}>
                      <FolderKanban size={12} color={C.purple} /> Only Projects Access
                    </p>
                  )}
                </div>

                {/* Access Info */}
                <div style={{
                  backgroundColor: 'rgba(157,78,221,0.06)', borderRadius: '10px',
                  padding: '12px 14px', marginBottom: '18px',
                  border: '1px solid rgba(157,78,221,0.15)',
                }}>
                  <p style={{ color: C.muted, fontSize: '11px', margin: '0 0 4px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Access Level</p>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    <span style={{ backgroundColor: 'rgba(157,78,221,0.15)', color: C.purple, fontSize: '11px', padding: '3px 8px', borderRadius: '6px', fontWeight: '700' }}>✓ Projects</span>
                    <span style={{ backgroundColor: C.card3, color: C.muted, fontSize: '11px', padding: '3px 8px', borderRadius: '6px', fontWeight: '600' }}>✗ Invoices</span>
                    <span style={{ backgroundColor: C.card3, color: C.muted, fontSize: '11px', padding: '3px 8px', borderRadius: '6px', fontWeight: '600' }}>✗ Reports</span>
                    <span style={{ backgroundColor: C.card3, color: C.muted, fontSize: '11px', padding: '3px 8px', borderRadius: '6px', fontWeight: '600' }}>✗ Admin</span>
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '8px', marginTop: 'auto' }}>
                  <a href="/editor/projects" style={{
                    flex: 1, padding: '9px', textAlign: 'center',
                    backgroundColor: 'rgba(157,78,221,0.1)', color: C.purple,
                    borderRadius: '10px', fontSize: '12.5px', fontWeight: '700',
                    border: '1px solid rgba(157,78,221,0.2)', textDecoration: 'none',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px',
                  }}>
                    <ExternalLink size={12} /> Editor View
                  </a>
                  <button onClick={() => deleteEditor(editor.id, editor.name)} style={{
                    padding: '9px 13px', backgroundColor: 'rgba(255,107,107,0.08)', color: C.red,
                    border: '1px solid rgba(255,107,107,0.2)', borderRadius: '10px', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', fontFamily: 'inherit', transition: 'background 0.15s',
                  }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(255,107,107,0.18)'}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = 'rgba(255,107,107,0.08)'}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Quick Create Guide */}
      {!loading && (
        <div style={{
          backgroundColor: C.card, border: `1px solid ${C.border}`,
          borderRadius: '16px', padding: '20px 24px', marginTop: '24px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          flexWrap: 'wrap', gap: '14px',
        }}>
          <div>
            <p style={{ color: C.text, fontWeight: '700', fontSize: '14px', margin: '0 0 4px' }}>Want to add a new Editor?</p>
            <p style={{ color: C.muted, fontSize: '12.5px', margin: 0 }}>Go to "Add Member" and select <strong style={{ color: C.purple }}>Editor</strong> as the role.</p>
          </div>
          <a href="/admin/members/new" style={{
            backgroundColor: C.purple, color: '#fff', padding: '10px 20px',
            borderRadius: '10px', fontSize: '13px', fontWeight: '700', textDecoration: 'none',
            display: 'flex', alignItems: 'center', gap: '6px',
          }}>
            <Plus size={14} /> Create Editor Account
          </a>
        </div>
      )}
    </AdminLayout>
  );
}
