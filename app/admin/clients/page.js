'use client';
import { useState, useEffect } from 'react';
import {
  Handshake, Plus, Trash2, ExternalLink, Mail, Phone,
  Building2, Search, Globe, TrendingUp, CheckCircle2, Clock,
} from 'lucide-react';
import AdminLayout from '../../components/AdminLayout';
import { toast } from '../../components/Toast';

const C = {
  bg: '#030712', bg2: '#080E1E', card: '#0C1327', card2: '#121C38', card3: '#18264B',
  border: '#1E2D56', border2: '#2A3F75',
  primary: '#00F0FF', primaryDark: '#0072FF',
  green: '#00E599', greenDark: '#00B377',
  blue: '#0072FF', orange: '#FF9900', red: '#FF4757', purple: '#9D4EDD',
  muted: '#64748B', muted2: '#334155', text: '#F1F5F9', text2: '#94A3B8',
};

export default function Clients() {
  const [clients,  setClients]  = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState('');

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    try {
      const [cR, pR] = await Promise.all([
        fetch('http://localhost:5000/api/clients'),
        fetch('http://localhost:5000/api/projects'),
      ]);
      setClients(await cR.json());
      setProjects(await pR.json());
    } catch { toast.error('Failed to load clients'); }
    setLoading(false);
  };

  const deleteClient = async (id, name) => {
    if (!confirm(`Delete client "${name}"? This will remove all their data.`)) return;
    try {
      const res = await fetch(`http://localhost:5000/api/clients/${id}`, { method: 'DELETE' });
      const d   = await res.json();
      if (d.success) { toast.success(`"${name}" deleted successfully`); fetchAll(); }
      else toast.error(d.error || 'Delete failed');
    } catch { toast.error('Network error'); }
  };

  const filtered = clients.filter(c =>
    !search ||
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.email?.toLowerCase().includes(search.toLowerCase()) ||
    c.department?.toLowerCase().includes(search.toLowerCase())
  );

  const totalActive    = projects.filter(p => p.status !== 'Completed').length;
  const totalCompleted = projects.filter(p => p.status === 'Completed').length;

  return (
    <AdminLayout title="Clients">

      {/* ── Header ─────────────────────────────── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <h2 style={{ color: C.text, fontSize: '20px', fontWeight: '800', margin: 0, letterSpacing: '-0.3px' }}>
            Client Directory
          </h2>
          <p style={{ color: C.muted, fontSize: '13px', margin: '4px 0 0 0' }}>
            {clients.length} registered clients
          </p>
        </div>
        <a href="/admin/clients/new" className="btn-glow">
          <Plus size={15} strokeWidth={2.8} /> Add Client
        </a>
      </div>

      {/* ── Stats ──────────────────────────────── */}
      <div className="kpi-grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
        {[
          { label: 'Total Clients',   value: clients.length,  color: C.green,  icon: Handshake,   bg: 'rgba(0,255,157,0.12)'   },
          { label: 'Active Projects', value: totalActive,     color: C.primary, icon: TrendingUp,  bg: 'rgba(0,240,255,0.12)'   },
          { label: 'Completed Work',  value: totalCompleted,  color: C.purple, icon: CheckCircle2, bg: 'rgba(176,42,255,0.12)' },
        ].map(({ label, value, color, icon: Icon, bg }, idx) => (
          <div key={label} className={`card-elite fade-in-up delay-${idx+1}`} style={{ padding: '22px', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '14px', backgroundColor: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: `0 0 16px ${bg}` }}>
              <Icon size={22} color={color} strokeWidth={2.2} />
            </div>
            <div>
              <p style={{ color, fontSize: '28px', fontWeight: '900', margin: '0 0 2px', letterSpacing: '-0.5px' }}>{value}</p>
              <p style={{ color: C.muted2, fontSize: '12px', fontWeight: '600', margin: 0 }}>{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Search ─────────────────────────────── */}
      <div style={{ marginBottom: '24px', position: 'relative', maxWidth: '420px' }}>
        <Search size={15} color={C.muted2} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
        <input
          placeholder="Search by name, email, or company..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="input-base"
          style={{ paddingLeft: '38px' }}
        />
      </div>

      {/* ── Grid ───────────────────────────────── */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '18px' }}>
          {[0,1,2,3,4,5].map(i => <div key={i} className="skeleton" style={{ height: 250, borderRadius: 18 }} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="card-elite" style={{ textAlign: 'center', padding: '80px 20px' }}>
          <Handshake size={56} color={C.muted} strokeWidth={1} style={{ marginBottom: '16px' }} />
          <p style={{ color: C.text, fontSize: '18px', fontWeight: '800', margin: '0 0 8px 0' }}>No clients found</p>
          <p style={{ color: C.muted2, fontSize: '14px', margin: '0 0 24px 0' }}>
            {search ? 'Try different search terms.' : 'Add your first client to get started.'}
          </p>
          <a href="/admin/clients/new" className="btn-glow">
            <Plus size={16} /> Add Client
          </a>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: '18px' }}>
          {filtered.map((client, idx) => {
            const clientProjects = projects.filter(p => p.client_id === client.id || p.client_name === client.name);
            const activeProjects = clientProjects.filter(p => p.status !== 'Completed').length;
            const avgProgress    = clientProjects.length
              ? Math.round(clientProjects.reduce((s, p) => s + (p.progress || 0), 0) / clientProjects.length)
              : 0;
            const avatarColor = client.avatar_color || C.green;

            return (
              <div key={client.id} className={`card-elite fade-in-up delay-${(idx % 4) + 1}`} style={{ padding: '22px', display: 'flex', flexDirection: 'column' }}>

                {/* Top: Avatar + Name + Status */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '48px', height: '48px', borderRadius: '14px',
                      backgroundColor: avatarColor,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#030712', fontWeight: '900', fontSize: '20px', flexShrink: 0,
                      boxShadow: `0 0 20px ${avatarColor}60`,
                    }}>
                      {(client.name || 'C')[0].toUpperCase()}
                    </div>
                    <div>
                      <p style={{ color: C.text, fontSize: '15px', fontWeight: '800', margin: '0 0 3px 0', letterSpacing: '-0.2px' }}>{client.name}</p>
                      <p style={{ color: C.muted2, fontSize: '11.5px', margin: 0, display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Building2 size={11} color={C.primary} /> {client.department || 'Direct Client'}
                      </p>
                    </div>
                  </div>
                  <span className={`badge ${client.status === 'Inactive' ? 'badge-red' : 'badge-green'}`}>
                    {client.status || 'Active'}
                  </span>
                </div>

                {/* Contact Info */}
                <div style={{ marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <p style={{ color: C.text2, fontSize: '12px', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Mail size={12} color={C.primary} /> {client.email || '—'}
                  </p>
                  {client.phone && (
                    <p style={{ color: C.text2, fontSize: '12px', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Phone size={12} color={C.green} /> {client.phone}
                    </p>
                  )}
                  {client.website && (
                    <p style={{ color: C.text2, fontSize: '12px', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Globe size={12} color={C.orange} />
                      <a href={client.website} target="_blank" rel="noopener noreferrer"
                        style={{ color: C.orange, textDecoration: 'none', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '170px', fontWeight: '600' }}>
                        {client.website.replace(/^https?:\/\//, '')}
                      </a>
                    </p>
                  )}
                </div>

                {/* Project Stats */}
                <div style={{ backgroundColor: C.card2, border: `1px solid ${C.border}`, borderRadius: '14px', padding: '14px', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <TrendingUp size={13} color={C.primary} />
                      <span style={{ color: C.muted2, fontSize: '11.5px', fontWeight: '600' }}>Projects</span>
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <span style={{ color: C.text, fontSize: '11.5px', fontWeight: '800' }}>
                        {activeProjects} active
                      </span>
                      <span style={{ color: C.muted2, fontSize: '11.5px' }}>
                        / {clientProjects.length} total
                      </span>
                    </div>
                  </div>
                  {clientProjects.length > 0 && (
                    <>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <span style={{ color: C.muted2, fontSize: '11px' }}>Avg Progress</span>
                        <span style={{ color: C.primary, fontSize: '11px', fontWeight: '800' }}>{avgProgress}%</span>
                      </div>
                      <div className="progress-track" style={{ height: '6px' }}>
                        <div className="progress-fill" style={{ width: `${avgProgress}%` }} />
                      </div>
                    </>
                  )}
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '10px', marginTop: 'auto' }}>
                  <a href={`/client/${client.id}/dashboard`} style={{
                    flex: 1, padding: '10px',
                    backgroundColor: 'rgba(0,240,255,0.08)', color: C.primary,
                    borderRadius: '12px', fontSize: '13px', fontWeight: '800',
                    border: `1px solid rgba(0,240,255,0.25)`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 0 15px rgba(0,240,255,0.1)'
                  }}
                    onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(0,240,255,0.18)'; e.currentTarget.style.boxShadow = '0 0 20px rgba(0,240,255,0.3)'; }}
                    onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'rgba(0,240,255,0.08)'; e.currentTarget.style.boxShadow = '0 0 15px rgba(0,240,255,0.1)'; }}
                  >
                    <ExternalLink size={13} /> Client Portal
                  </a>
                  <button onClick={() => deleteClient(client.id, client.name)} style={{
                    padding: '10px 14px', backgroundColor: 'rgba(255,42,95,0.08)', color: C.red,
                    border: '1px solid rgba(255,42,95,0.25)', borderRadius: '12px', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', fontFamily: 'inherit',
                    transition: 'all 0.2s ease',
                  }}
                    onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(255,42,95,0.2)'; e.currentTarget.style.boxShadow = '0 0 15px rgba(255,42,95,0.3)'; }}
                    onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'rgba(255,42,95,0.08)'; e.currentTarget.style.boxShadow = 'none'; }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </AdminLayout>
  );
}