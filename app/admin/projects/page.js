'use client';
import { useState, useEffect } from 'react';
import {
  FolderKanban, Plus, Trash2, Eye, CalendarDays,
  FolderOpen, Search, LayoutGrid, List, Users,
  TrendingUp, Clock, CheckCircle2, CheckSquare, X,
} from 'lucide-react';
import AdminLayout from '../../components/AdminLayout';
import { toast } from '../../components/Toast';

const C = {
  bg: '#030712', bg2: '#080E1E', card: '#0C1327', card2: '#121C38', card3: '#18264B',
  border: '#1E2D56', border2: '#2A3F75',
  primary: '#00F0FF', primaryDark: '#0072FF', primaryLight: '#38BDF8',
  green: '#00E599', greenDark: '#00B377',
  blue: '#0072FF', orange: '#FF9900', red: '#FF4757', purple: '#9D4EDD',
  muted: '#64748B', muted2: '#334155', text: '#F1F5F9', text2: '#94A3B8',
};

const STATUSES = ['All', 'Not Started', 'In Progress', 'Under Review', 'Completed', 'On Hold'];
const BULK_STATUSES = ['Not Started', 'In Progress', 'Under Review', 'Completed', 'On Hold'];

const statusCfg = (s) => {
  if (s === 'Completed')   return { color: C.green,  bg: 'rgba(0,214,143,0.1)'  };
  if (s === 'Under Review')return { color: C.orange, bg: 'rgba(255,184,0,0.1)'  };
  if (s === 'On Hold')     return { color: C.red,    bg: 'rgba(255,107,107,0.1)' };
  if (s === 'In Progress') return { color: C.blue,   bg: 'rgba(78,155,255,0.1)' };
  return { color: C.muted, bg: 'rgba(138,138,163,0.1)' };
};

const daysLeft = (d) => d ? Math.ceil((new Date(d) - Date.now()) / 86400000) : null;

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [filter,   setFilter]   = useState('All');
  const [search,   setSearch]   = useState('');
  const [view,     setView]     = useState('grid');
  
  // Bulk Selection State
  const [selected, setSelected] = useState([]);
  const [bulkStatus, setBulkStatus] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => { fetchProjects(); }, []);

  const fetchProjects = async () => {
    try {
      const res = await fetch('https://zeex-digital-nftm.vercel.app/api/projects');
      setProjects(await res.json());
    } catch { toast.error('Failed to load projects'); }
    setLoading(false);
  };

  const deleteProject = async (id, name) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    try {
      const res  = await fetch(`https://zeex-digital-nftm.vercel.app/api/projects/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) { toast.success('Project deleted'); fetchProjects(); }
      else toast.error(data.error || 'Delete failed');
    } catch { toast.error('Network error'); }
  };

  const handleBulkUpdate = async () => {
    if (!bulkStatus || selected.length === 0) return;
    setUpdating(true);
    try {
      const res = await fetch('https://zeex-digital-nftm.vercel.app/api/projects/bulk/status', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectIds: selected, status: bulkStatus })
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Updated ${selected.length} projects to ${bulkStatus}`);
        setSelected([]);
        setBulkStatus('');
        fetchProjects();
      } else {
        toast.error(data.error || 'Bulk update failed');
      }
    } catch { toast.error('Network error during bulk update'); }
    setUpdating(false);
  };

  const toggleSelect = (id) => {
    setSelected(prev => prev.includes(id) ? prev.filter(pid => pid !== id) : [...prev, id]);
  };

  const toggleAll = (visibleIds) => {
    const allSelected = visibleIds.every(id => selected.includes(id));
    if (allSelected) {
      setSelected(prev => prev.filter(id => !visibleIds.includes(id)));
    } else {
      const newSelected = [...selected];
      visibleIds.forEach(id => { if (!newSelected.includes(id)) newSelected.push(id); });
      setSelected(newSelected);
    }
  };

  const filtered = projects.filter(p => {
    const matchFilter = filter === 'All' || p.status === filter;
    const matchSearch = !search || p.name?.toLowerCase().includes(search.toLowerCase()) || p.client_name?.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const visibleIds = filtered.map(p => p.id);

  const counts = STATUSES.slice(1).reduce((acc, s) => {
    acc[s] = projects.filter(p => p.status === s).length;
    return acc;
  }, {});

  return (
    <AdminLayout title="Projects">

      {/* ── Header ──────────────────────────────────── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <h2 style={{ color: C.text, fontSize: '20px', fontWeight: '800', margin: 0 }}>All Projects</h2>
          <p style={{ color: C.muted, fontSize: '13px', margin: '4px 0 0 0' }}>{projects.length} projects total</p>
        </div>
        <a href="/admin/projects/new" className="btn-glow" style={{
          backgroundColor: C.green, color: '#0A0A12', padding: '11px 20px',
          borderRadius: '12px', fontSize: '13.5px', fontWeight: '800',
          display: 'flex', alignItems: 'center', gap: '6px',
        }}>
          <Plus size={16} strokeWidth={2.8} /> New Project
        </a>
      </div>

      {/* ── Stats Bar ────────────────────────────────── */}
      <div className="kpi-grid-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '22px' }}>
        {[
          { label: 'Active',      value: counts['In Progress'] || 0,  color: C.blue,   icon: TrendingUp   },
          { label: 'Completed',   value: counts['Completed']   || 0,  color: C.green,  icon: CheckCircle2 },
          { label: 'Under Review',value: counts['Under Review'] || 0, color: C.orange, icon: Clock        },
          { label: 'On Hold',     value: counts['On Hold']     || 0,  color: C.red,    icon: FolderOpen   },
        ].map(({ label, value, color, icon: Icon }) => (
          <div key={label} style={{ backgroundColor: C.card, border: `1px solid ${C.border}`, borderRadius: '14px', padding: '16px 18px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '10px', backgroundColor: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Icon size={18} color={color} strokeWidth={2.2} />
            </div>
            <div>
              <p style={{ color: C.text, fontSize: '22px', fontWeight: '800', margin: 0 }}>{value}</p>
              <p style={{ color: C.muted, fontSize: '11.5px', margin: 0, fontWeight: '600' }}>{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Filters + Search + View ───────────────────── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', gap: '14px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {STATUSES.map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{
              padding: '7px 16px', borderRadius: '20px', cursor: 'pointer', border: 'none',
              backgroundColor: filter === f ? C.green : C.card,
              color: filter === f ? '#0A0A12' : C.muted,
              fontSize: '12.5px', fontWeight: filter === f ? '800' : '500',
              outline: filter === f ? 'none' : `1px solid ${C.border}`,
              fontFamily: 'inherit', transition: 'all 0.15s',
            }}>{f}</button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <Search size={13} color={C.muted} style={{ position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
            <input
              placeholder="Search projects..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ padding: '9px 14px 9px 32px', borderRadius: '10px', border: `1px solid ${search ? C.green : C.border}`, backgroundColor: C.card2, color: C.text, fontSize: '13px', width: '200px', outline: 'none', fontFamily: 'inherit' }}
            />
          </div>
          <div style={{ display: 'flex', gap: '2px', backgroundColor: C.card2, border: `1px solid ${C.border}`, borderRadius: '10px', padding: '3px' }}>
            {[['grid', LayoutGrid], ['list', List]].map(([v, Icon]) => (
              <button key={v} onClick={() => setView(v)} style={{
                padding: '6px 10px', borderRadius: '8px', cursor: 'pointer', border: 'none',
                backgroundColor: view === v ? C.green : 'transparent',
                color: view === v ? '#0A0A12' : C.muted,
                display: 'flex', alignItems: 'center', transition: 'all 0.15s', fontFamily: 'inherit',
              }}>
                <Icon size={15} strokeWidth={2.2} />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Bulk Actions Toolbar ──────────────────────── */}
      {selected.length > 0 && (
        <div style={{
          backgroundColor: C.card2, border: `1px solid ${C.border}`, borderRadius: '12px',
          padding: '12px 18px', marginBottom: '20px', display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', animation: 'slideDown 0.3s ease',
          boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ backgroundColor: C.primary, color: '#000', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: '800' }}>
                {selected.length}
              </span>
              <span style={{ color: C.text, fontSize: '14px', fontWeight: '600' }}>selected</span>
            </div>
            <button onClick={() => setSelected([])} style={{ background: 'none', border: 'none', color: C.muted, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12.5px' }}>
              <X size={14} /> Clear
            </button>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <select
              value={bulkStatus}
              onChange={e => setBulkStatus(e.target.value)}
              style={{ padding: '8px 12px', borderRadius: '8px', border: `1px solid ${C.border}`, backgroundColor: C.bg, color: C.text, outline: 'none', fontSize: '13px', cursor: 'pointer' }}
            >
              <option value="">Change Status...</option>
              {BULK_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <button onClick={handleBulkUpdate} disabled={!bulkStatus || updating} className="btn-glow" style={{ padding: '9px 16px', borderRadius: '8px', opacity: (!bulkStatus || updating) ? 0.5 : 1, cursor: (!bulkStatus || updating) ? 'not-allowed' : 'pointer' }}>
              {updating ? 'Updating...' : 'Apply'}
            </button>
          </div>
        </div>
      )}

      {/* ── Content ──────────────────────────────────── */}
      {loading ? (
        <div className="card-grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
          {[0,1,2,3,4,5].map(i => (
            <div key={i} style={{ backgroundColor: C.card, border: `1px solid ${C.border}`, borderRadius: '16px', padding: '22px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '14px' }}>
                <div className="skeleton" style={{ height: 22, width: 80, borderRadius: 20 }} />
                <div className="skeleton" style={{ height: 22, width: 80, borderRadius: 20 }} />
              </div>
              <div className="skeleton" style={{ height: 16, width: '80%', borderRadius: 8, marginBottom: 8 }} />
              <div className="skeleton" style={{ height: 12, width: '50%', borderRadius: 8, marginBottom: 20 }} />
              <div className="skeleton" style={{ height: 6, borderRadius: 99, marginBottom: 20 }} />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 0', backgroundColor: C.card, border: `1px solid ${C.border}`, borderRadius: '20px' }}>
          <FolderOpen size={48} color={C.muted2} strokeWidth={1.2} style={{ marginBottom: '14px' }} />
          <p style={{ color: C.text, fontSize: '17px', fontWeight: '700', margin: '0 0 6px 0' }}>No projects found</p>
          <a href="/admin/projects/new" style={{ backgroundColor: C.green, color: '#0A0A12', padding: '11px 24px', borderRadius: '12px', fontSize: '13.5px', fontWeight: '800' }}>
            + Create Project
          </a>
        </div>
      ) : view === 'grid' ? (
        /* GRID VIEW */
        <div className="card-grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
          {filtered.map(project => {
            const st = statusCfg(project.status);
            const d  = daysLeft(project.end_date);
            const dColor = d !== null && d < 0 ? C.red : d !== null && d <= 3 ? C.orange : C.muted;
            const isSelected = selected.includes(project.id);
            return (
              <div key={project.id} className="hover-lift" style={{
                backgroundColor: isSelected ? 'rgba(0,240,255,0.05)' : C.card,
                border: `1px solid ${isSelected ? C.primary : C.border}`,
                borderRadius: '18px', padding: '22px', display: 'flex', flexDirection: 'column', gap: '0',
                position: 'relative', transition: 'all 0.2s',
                boxShadow: isSelected ? `0 0 0 1px ${C.primary}` : 'none',
              }}>
                {/* Checkbox Overlay for Bulk Selection */}
                <div style={{ position: 'absolute', top: '22px', left: '22px', zIndex: 2 }}>
                  <input type="checkbox" checked={isSelected} onChange={() => toggleSelect(project.id)}
                    style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: C.primary }} />
                </div>

                {/* Top badges */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginBottom: '14px' }}>
                  <span style={{ backgroundColor: 'rgba(78,155,255,0.1)', color: C.blue, fontSize: '10px', padding: '3px 8px', borderRadius: '20px', fontWeight: '700' }}>
                    {project.service_type || 'General'}
                  </span>
                  <span style={{ backgroundColor: st.bg, color: st.color, fontSize: '10px', padding: '3px 8px', borderRadius: '20px', fontWeight: '700' }}>
                    {project.status}
                  </span>
                </div>

                {/* Title + Client */}
                <div style={{ paddingLeft: '32px' }}>
                  <a href={`/admin/projects/${project.id}`} style={{ color: C.text, fontSize: '15px', fontWeight: '700', marginBottom: '4px', display: 'block', lineHeight: 1.3 }}
                    onMouseEnter={e => e.currentTarget.style.color = C.green}
                    onMouseLeave={e => e.currentTarget.style.color = C.text}
                  >
                    {project.name}
                  </a>
                  <p style={{ color: C.muted, fontSize: '12.5px', margin: '0 0 18px 0' }}>
                    {project.client_name || 'No client'}
                  </p>
                </div>

                {/* Progress */}
                <div style={{ marginBottom: '18px', paddingLeft: '32px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '7px' }}>
                    <span style={{ color: C.muted, fontSize: '11.5px', fontWeight: '600' }}>Progress</span>
                    <span style={{ color: C.text, fontSize: '12px', fontWeight: '800' }}>{project.progress}%</span>
                  </div>
                  <div style={{ height: '6px', borderRadius: '99px', backgroundColor: C.card3, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${project.progress}%`, background: `linear-gradient(90deg, ${C.greenDark}, ${C.green})`, borderRadius: '99px', transition: 'width 0.5s' }} />
                  </div>
                </div>

                {/* Footer */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingLeft: '32px' }}>
                  <span style={{ color: dColor, fontSize: '11.5px', display: 'flex', alignItems: 'center', gap: '5px', fontWeight: '600' }}>
                    <CalendarDays size={12} strokeWidth={2.2} /> {d === null ? 'No deadline' : d < 0 ? `${Math.abs(d)}d overdue` : d === 0 ? 'Due today!' : `${d}d left`}
                  </span>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <a href={`/admin/projects/${project.id}`} style={{ backgroundColor: 'rgba(0,214,143,0.1)', color: C.green, padding: '5px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Eye size={12} /> View
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* LIST VIEW */
        <div className="table-responsive">
          <div style={{ backgroundColor: C.card, border: `1px solid ${C.border}`, borderRadius: '16px', overflow: 'hidden', minWidth: '800px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '40px 2fr 1fr 130px 120px 120px', gap: '16px', padding: '14px 22px', borderBottom: `1px solid ${C.border}`, backgroundColor: C.card2, alignItems: 'center' }}>
              <input type="checkbox" onChange={() => toggleAll(visibleIds)} checked={visibleIds.length > 0 && visibleIds.every(id => selected.includes(id))} style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: C.primary }} />
              {['Project', 'Client', 'Progress', 'Deadline', 'Status'].map(h => (
                <p key={h} style={{ color: C.muted2, fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', margin: 0 }}>{h}</p>
              ))}
            </div>
            {filtered.map((p, i) => {
              const st = statusCfg(p.status);
              const isSelected = selected.includes(p.id);
              return (
                <div key={p.id} style={{
                  display: 'grid', gridTemplateColumns: '40px 2fr 1fr 130px 120px 120px', gap: '16px',
                  padding: '14px 22px', borderBottom: i < filtered.length - 1 ? `1px solid ${C.border}` : 'none',
                  alignItems: 'center', backgroundColor: isSelected ? 'rgba(0,240,255,0.04)' : 'transparent',
                  transition: 'background-color 0.15s'
                }}>
                  <input type="checkbox" checked={isSelected} onChange={() => toggleSelect(p.id)} style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: C.primary }} />
                  <div>
                    <a href={`/admin/projects/${p.id}`} style={{ color: C.text, fontSize: '13.5px', fontWeight: '600' }}>{p.name}</a>
                    <p style={{ color: C.muted, fontSize: '11px', margin: '2px 0 0' }}>{p.service_type || 'General'}</p>
                  </div>
                  <p style={{ color: C.muted, fontSize: '13px', margin: 0 }}>{p.client_name || '—'}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ flex: 1, height: '5px', borderRadius: '99px', backgroundColor: C.card3, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${p.progress}%`, background: `linear-gradient(90deg, ${C.greenDark}, ${C.green})`, borderRadius: '99px' }} />
                    </div>
                    <span style={{ color: C.muted, fontSize: '11.5px', fontWeight: '700', flexShrink: 0 }}>{p.progress}%</span>
                  </div>
                  <span style={{ color: C.muted, fontSize: '12px', fontWeight: '600' }}>{p.end_date ? new Date(p.end_date).toLocaleDateString() : '—'}</span>
                  <span style={{ backgroundColor: st.bg, color: st.color, fontSize: '10.5px', fontWeight: '700', padding: '3px 9px', borderRadius: '20px', width: 'fit-content' }}>{p.status}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
      <style>{`@keyframes slideDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }`}</style>
    </AdminLayout>
  );
}