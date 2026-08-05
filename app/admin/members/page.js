'use client';
import { useState, useEffect } from 'react';
import {
  Users, Plus, Trash2, ExternalLink, Mail, Building2,
  Search, Phone, CheckCircle2, Clock, AlertCircle,
} from 'lucide-react';
import AdminLayout from '../../components/AdminLayout';
import { toast } from '../../components/Toast';

import { C } from '../../lib/colors';

const AVATAR_COLORS = ['#00D68F','#4E9BFF','#A78BFA','#FFB800','#FF6B6B','#34D399','#F472B6','#60A5FA'];

const statusCfg = (s) => {
  if (s === 'Active') return { color: C.green,  bg: 'rgba(0,214,143,0.1)',   icon: CheckCircle2 };
  if (s === 'Busy')   return { color: C.orange, bg: 'rgba(255,184,0,0.1)',   icon: Clock        };
  return               { color: C.muted,  bg: 'rgba(138,138,163,0.1)', icon: AlertCircle  };
};

export default function Members() {
  const [members, setMembers] = useState([]);
  const [tasks,   setTasks]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState('');
  const [dept,    setDept]    = useState('All');

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    try {
      const [mR, tR] = await Promise.all([
        fetch('https://zeex-digital-production.up.railway.app/api/members'),
        fetch('https://zeex-digital-production.up.railway.app/api/tasks'),
      ]);
      setMembers(await mR.json());
      setTasks(await tR.json());
    } catch { toast.error('Failed to load members'); }
    setLoading(false);
  };

  const deleteMember = async (id, name) => {
    if (!confirm(`Delete "${name}"?`)) return;
    try {
      const res = await fetch(`https://zeex-digital-production.up.railway.app/api/members/${id}`, { method: 'DELETE' });
      const d   = await res.json();
      if (d.success) { toast.success('Member removed'); fetchAll(); }
      else toast.error(d.error || 'Delete failed');
    } catch { toast.error('Network error'); }
  };

  const departments = ['All', ...new Set(members.map(m => m.department).filter(Boolean))];

  const filtered = members.filter(m => {
    const matchSearch = !search || m.name?.toLowerCase().includes(search.toLowerCase()) || m.email?.toLowerCase().includes(search.toLowerCase()) || m.department?.toLowerCase().includes(search.toLowerCase());
    const matchDept   = dept === 'All' || m.department === dept;
    return matchSearch && matchDept;
  });

  const getMemberStats = (memberId) => ({
    total:     tasks.filter(t => t.member_id === memberId).length,
    completed: tasks.filter(t => t.member_id === memberId && t.status === 'Completed').length,
    active:    tasks.filter(t => t.member_id === memberId && t.status === 'In Progress').length,
  });

  return (
    <AdminLayout title="Team Members">

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <h2 style={{ color: C.text, fontSize: '20px', fontWeight: '800', margin: 0 }}>Team Members</h2>
          <p style={{ color: C.muted, fontSize: '13px', margin: '4px 0 0 0' }}>{members.length} members total</p>
        </div>
        <a href="/admin/members/new" className="btn-glow" style={{
          backgroundColor: C.green, color: '#0A0A12', padding: '11px 20px',
          borderRadius: '12px', fontSize: '13.5px', fontWeight: '800',
          display: 'flex', alignItems: 'center', gap: '6px',
        }}>
          <Plus size={16} strokeWidth={2.8} /> Add Member
        </a>
      </div>

      {/* Stats */}
      <div className="kpi-grid-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '22px' }}>
        {[
          { label: 'Total Members', value: members.length,                                          color: C.blue   },
          { label: 'Active',        value: members.filter(m=>m.status==='Active').length,           color: C.green  },
          { label: 'Departments',   value: new Set(members.map(m=>m.department).filter(Boolean)).size, color: C.purple },
          { label: 'Tasks Assigned',value: tasks.length,                                            color: C.orange },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ backgroundColor: C.card, border: `1px solid ${C.border}`, borderRadius: '14px', padding: '18px', textAlign: 'center' }}>
            <p style={{ color, fontSize: '26px', fontWeight: '900', margin: '0 0 4px' }}>{value}</p>
            <p style={{ color: C.muted, fontSize: '12px', fontWeight: '600', margin: 0 }}>{label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '22px', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative' }}>
          <Search size={13} color={C.muted} style={{ position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
          <input
            placeholder="Search members..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ padding: '9px 14px 9px 32px', borderRadius: '10px', border: `1px solid ${search ? C.green : C.border}`, backgroundColor: C.card2, color: C.text, fontSize: '13px', width: '220px', outline: 'none', fontFamily: 'inherit' }}
          />
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {departments.map(d => (
            <button key={d} onClick={() => setDept(d)} style={{
              padding: '7px 16px', borderRadius: '20px', border: 'none', cursor: 'pointer',
              backgroundColor: dept === d ? C.green : C.card,
              color: dept === d ? '#0A0A12' : C.muted,
              fontSize: '12.5px', fontWeight: dept === d ? '800' : '500',
              outline: dept === d ? 'none' : `1px solid ${C.border}`, fontFamily: 'inherit',
            }}>{d}</button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="card-grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
          {[0,1,2,3,4,5].map(i => (
            <div key={i} style={{ backgroundColor: C.card, border: `1px solid ${C.border}`, borderRadius: '18px', padding: '24px' }}>
              <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', alignItems: 'center' }}>
                <div className="skeleton" style={{ width: 52, height: 52, borderRadius: '50%' }} />
                <div style={{ flex: 1 }}>
                  <div className="skeleton" style={{ height: 14, width: '70%', marginBottom: 7, borderRadius: 8 }} />
                  <div className="skeleton" style={{ height: 11, width: '50%', borderRadius: 8 }} />
                </div>
              </div>
              <div className="skeleton" style={{ height: 11, marginBottom: 8, borderRadius: 8 }} />
              <div className="skeleton" style={{ height: 11, width: '80%', marginBottom: 18, borderRadius: 8 }} />
              <div className="skeleton" style={{ height: 38, borderRadius: 10 }} />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 0', backgroundColor: C.card, border: `1px solid ${C.border}`, borderRadius: '20px' }}>
          <Users size={48} color={C.muted2} strokeWidth={1.2} style={{ marginBottom: '14px' }} />
          <p style={{ color: C.text, fontSize: '17px', fontWeight: '700', margin: '0 0 6px 0' }}>No members found</p>
          <p style={{ color: C.muted, fontSize: '13.5px', margin: '0 0 22px 0' }}>
            {search ? 'Try different search terms.' : 'Add your first team member.'}
          </p>
          <a href="/admin/members/new" style={{ backgroundColor: C.green, color: '#0A0A12', padding: '11px 24px', borderRadius: '12px', fontSize: '13.5px', fontWeight: '800' }}>
            + Add Member
          </a>
        </div>
      ) : (
        <div className="card-grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
          {filtered.map((member, idx) => {
            const sc  = statusCfg(member.status);
            const SI  = sc.icon;
            const ms  = getMemberStats(member.id);
            const ac  = member.avatar_color || AVATAR_COLORS[idx % AVATAR_COLORS.length];
            const pct = ms.total > 0 ? Math.round((ms.completed / ms.total) * 100) : 0;
            return (
              <div key={member.id} className="hover-lift" style={{ backgroundColor: C.card, border: `1px solid ${C.border}`, borderRadius: '18px', padding: '24px', display: 'flex', flexDirection: 'column' }}>

                {/* Avatar + Status */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ position: 'relative' }}>
                      <div style={{ width: '52px', height: '52px', borderRadius: '50%', backgroundColor: ac, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0A0A12', fontWeight: '800', fontSize: '20px', border: `3px solid ${ac}40` }}>
                        {(member.name || 'M')[0].toUpperCase()}
                      </div>
                      <span style={{ position: 'absolute', bottom: '0', right: '0', width: '14px', height: '14px', borderRadius: '50%', backgroundColor: sc.color, border: `2px solid ${C.card}` }} />
                    </div>
                    <div>
                      <p style={{ color: C.text, fontSize: '14.5px', fontWeight: '700', margin: '0 0 2px 0' }}>{member.name}</p>
                      <p style={{ color: C.muted, fontSize: '11.5px', margin: 0, textTransform: 'capitalize' }}>{member.role || 'Member'}</p>
                    </div>
                  </div>
                  <span style={{ backgroundColor: sc.bg, color: sc.color, fontSize: '10.5px', padding: '4px 9px', borderRadius: '20px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
                    <SI size={10} strokeWidth={2.5} /> {member.status || 'Active'}
                  </span>
                </div>

                {/* Info */}
                <div style={{ marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <p style={{ color: C.muted, fontSize: '12px', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Mail size={12} color={C.blue} /> {member.email}
                  </p>
                  {member.department && (
                    <p style={{ color: C.muted, fontSize: '12px', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Building2 size={12} color={C.purple} /> {member.department}
                    </p>
                  )}
                  {member.phone && (
                    <p style={{ color: C.muted, fontSize: '12px', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Phone size={12} color={C.green} /> {member.phone}
                    </p>
                  )}
                </div>

                {/* Task stats */}
                <div style={{ backgroundColor: C.card3, borderRadius: '12px', padding: '12px 14px', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ color: C.muted, fontSize: '11px', fontWeight: '600' }}>Task completion</span>
                    <span style={{ color: C.text, fontSize: '11.5px', fontWeight: '700' }}>{ms.completed}/{ms.total}</span>
                  </div>
                  <div style={{ height: '5px', borderRadius: '99px', backgroundColor: C.card2, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: `linear-gradient(90deg, ${C.greenDark}, ${C.green})`, borderRadius: '99px' }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
                    <span style={{ color: C.blue, fontSize: '11px' }}>{ms.active} in progress</span>
                    <span style={{ color: C.green, fontSize: '11px', fontWeight: '700' }}>{pct}%</span>
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '8px', marginTop: 'auto' }}>
                  <a href={`/member/${member.id}/dashboard`} style={{
                    flex: 1, padding: '9px', textAlign: 'center',
                    backgroundColor: 'rgba(0,214,143,0.1)', color: C.green,
                    borderRadius: '10px', fontSize: '12.5px', fontWeight: '700',
                    border: `1px solid rgba(0,214,143,0.2)`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px',
                  }}>
                    <ExternalLink size={12.5} /> Dashboard
                  </a>
                  <button onClick={() => deleteMember(member.id, member.name)} style={{
                    padding: '9px 12px', backgroundColor: 'rgba(255,107,107,0.08)', color: C.red,
                    border: '1px solid rgba(255,107,107,0.2)', borderRadius: '10px', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', fontFamily: 'inherit',
                    transition: 'background 0.15s',
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
    </AdminLayout>
  );
}