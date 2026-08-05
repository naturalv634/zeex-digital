'use client';
import { useState, useEffect } from 'react';
import { Bell, Plus, CheckCircle2, AlertTriangle, BarChart3, Send, Users, ShieldAlert, Trash2, Check, X, Filter } from 'lucide-react';
import AdminLayout from '../../components/AdminLayout';
import { toast } from '../../components/Toast';

const C = {
  bg: '#030712', bg2: '#080E1E', card: '#0C1327', card2: '#121C38', card3: '#18264B',
  border: '#1E2D56', border2: '#2A3F75',
  primary: '#00F0FF', primaryDark: '#0072FF',
  green: '#00E599', greenDark: '#00B377',
  blue: '#0072FF', orange: '#FF9900', red: '#FF4757', purple: '#9D4EDD',
  muted: '#4A628A', muted2: '#7590C2', text: '#F1F5F9', text2: '#94A3B8',
};

const TYPE_CONFIG = {
  task:     { Icon: CheckCircle2,  color: C.green,  label: 'Task',     bg: 'rgba(0,229,153,0.12)' },
  deadline: { Icon: AlertTriangle, color: C.red,    label: 'Deadline', bg: 'rgba(255,71,87,0.12)' },
  progress: { Icon: BarChart3,     color: C.blue,   label: 'Progress', bg: 'rgba(0,114,255,0.12)' },
  general:  { Icon: Bell,          color: C.orange, label: 'General',  bg: 'rgba(255,153,0,0.12)' },
};

const inp = {
  width: '100%', padding: '10px 14px', borderRadius: '10px',
  border: `1px solid ${C.border}`, backgroundColor: C.card2,
  color: C.text, fontSize: '13px', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit',
};

export default function Notifications() {
  const [notifs,       setNotifs]       = useState([]);
  const [members,      setMembers]      = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [showForm,     setShowForm]     = useState(false);
  const [sending,      setSending]      = useState(false);
  const [typeFilter,   setTypeFilter]   = useState('All');
  const [readFilter,   setReadFilter]   = useState('All');
  const [newNotif,     setNewNotif]     = useState({ user_id: '', title: '', message: '', type: 'general' });

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const mR = await fetch('https://zeex-digital-production.up.railway.app/api/members');
      const mData = await mR.json();
      setMembers(Array.isArray(mData) ? mData : []);

      const allNotifs = [];
      for (const m of (Array.isArray(mData) ? mData : [])) {
        const res = await fetch(`https://zeex-digital-production.up.railway.app/api/notifications/${m.id}`);
        const d   = await res.json();
        if (Array.isArray(d)) {
          allNotifs.push(...d.map(n => ({ ...n, memberName: m.name, memberColor: m.avatar_color })));
        }
      }
      setNotifs(allNotifs.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));
    } catch { toast.error('Failed to load notifications'); }
    setLoading(false);
  };

  const markRead = async (n) => {
    setNotifs(prev => prev.map(x => x.id === n.id ? { ...x, read: true } : x));
    try {
      await fetch(`https://zeex-digital-production.up.railway.app/api/notifications/${n.id}/read`, { method: 'PUT' });
    } catch {}
  };

  const markAllRead = async () => {
    setNotifs(prev => prev.map(x => ({ ...x, read: true })));
    try {
      await Promise.all(notifs.filter(n => !n.read).map(n =>
        fetch(`https://zeex-digital-production.up.railway.app/api/notifications/${n.id}/read`, { method: 'PUT' })
      ));
      toast.success('All notifications marked as read');
    } catch { toast.error('Could not update all notifications'); }
  };

  const deleteNotif = async (id) => {
    setNotifs(prev => prev.filter(x => x.id !== id));
    try {
      await fetch(`https://zeex-digital-production.up.railway.app/api/notifications/${id}`, { method: 'DELETE' });
    } catch {}
  };

  const sendNotification = async () => {
    if (!newNotif.user_id || !newNotif.title || !newNotif.message) {
      toast.error('Member, Title, and Message are required');
      return;
    }
    setSending(true);
    try {
      const res = await fetch('https://zeex-digital-production.up.railway.app/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newNotif),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Notification sent!');
        setNewNotif({ user_id: '', title: '', message: '', type: 'general' });
        setShowForm(false);
        fetchData();
      } else {
        toast.error(data.error || 'Failed to send');
      }
    } catch { toast.error('Network error'); }
    setSending(false);
  };

  const filtered = notifs.filter(n => {
    const matchType = typeFilter === 'All' || n.type === typeFilter;
    const matchRead = readFilter === 'All' || (readFilter === 'Unread' ? !n.read : n.read);
    return matchType && matchRead;
  });

  const unread = notifs.filter(n => !n.read).length;

  return (
    <AdminLayout title="Notifications">
      <style>{`
        .notif-row:hover { background: rgba(255,255,255,0.03) !important; }
        .notif-row:hover .notif-actions { opacity: 1 !important; }
        .notif-actions { opacity: 0; transition: opacity 0.15s; }
        .fade-in { animation: fadeIn 0.3s ease; }
        @keyframes fadeIn { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
      `}</style>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <h2 style={{ color: C.text, fontSize: '20px', fontWeight: '800', margin: '0 0 4px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            Notifications Center
            {unread > 0 && (
              <span style={{ backgroundColor: C.red, color: '#fff', fontSize: '11px', padding: '2px 9px', borderRadius: '20px', fontWeight: '800' }}>
                {unread} unread
              </span>
            )}
          </h2>
          <p style={{ color: C.muted, fontSize: '13px', margin: 0 }}>Send and manage team alerts</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          {unread > 0 && (
            <button onClick={markAllRead} style={{
              padding: '10px 18px', backgroundColor: 'transparent', color: C.green,
              border: `1px solid ${C.green}44`, borderRadius: '10px', cursor: 'pointer',
              fontSize: '13px', fontWeight: '700', fontFamily: 'inherit',
              display: 'flex', alignItems: 'center', gap: '6px',
            }}>
              <Check size={14} /> Mark All Read
            </button>
          )}
          <button onClick={() => setShowForm(s => !s)} style={{
            padding: '10px 18px', backgroundColor: C.green, color: '#030712',
            border: 'none', borderRadius: '10px', cursor: 'pointer',
            fontSize: '13px', fontWeight: '800', fontFamily: 'inherit',
            display: 'flex', alignItems: 'center', gap: '6px',
          }}>
            <Plus size={15} /> Send Notification
          </button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '14px', marginBottom: '22px' }}>
        {[
          { label: 'Total',    value: notifs.length,  color: C.primary, Icon: Bell         },
          { label: 'Unread',   value: unread,          color: C.red,     Icon: ShieldAlert  },
          { label: 'Read',     value: notifs.length - unread, color: C.green, Icon: CheckCircle2 },
          { label: 'Members',  value: members.length,  color: C.orange,  Icon: Users        },
        ].map(({ label, value, color, Icon }) => (
          <div key={label} style={{ backgroundColor: C.card, border: `1px solid ${C.border}`, borderRadius: '16px', padding: '18px 20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '12px', backgroundColor: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon size={18} color={color} />
            </div>
            <div>
              <p style={{ color: C.text, fontSize: '22px', fontWeight: '900', margin: 0 }}>{value}</p>
              <p style={{ color: C.muted2, fontSize: '11.5px', fontWeight: '600', margin: 0 }}>{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Send Form */}
      {showForm && (
        <div className="fade-in" style={{ backgroundColor: C.card, border: `1.5px solid ${C.green}55`, borderRadius: '18px', padding: '24px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
            <h3 style={{ color: C.green, fontSize: '15px', fontWeight: '800', margin: 0 }}>Send Custom Notification</h3>
            <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.muted }}><X size={18} /></button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
            <div>
              <label style={{ color: C.muted2, fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '6px' }}>Send To *</label>
              <select value={newNotif.user_id} onChange={e => setNewNotif({ ...newNotif, user_id: e.target.value })} style={inp}>
                <option value="">Select Member…</option>
                {members.map(m => <option key={m.id} value={m.id}>{m.name} ({m.department || 'Team'})</option>)}
              </select>
            </div>
            <div>
              <label style={{ color: C.muted2, fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '6px' }}>Type</label>
              <select value={newNotif.type} onChange={e => setNewNotif({ ...newNotif, type: e.target.value })} style={inp}>
                {Object.entries(TYPE_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
            </div>
            <div>
              <label style={{ color: C.muted2, fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '6px' }}>Title *</label>
              <input value={newNotif.title} onChange={e => setNewNotif({ ...newNotif, title: e.target.value })} placeholder="e.g. New Task Assigned" style={inp} />
            </div>
            <div>
              <label style={{ color: C.muted2, fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '6px' }}>Message *</label>
              <input value={newNotif.message} onChange={e => setNewNotif({ ...newNotif, message: e.target.value })} placeholder="e.g. Please review the design specs" style={inp} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={sendNotification} disabled={sending} style={{
              padding: '10px 22px', backgroundColor: sending ? `${C.green}60` : C.green,
              color: '#030712', border: 'none', borderRadius: '10px',
              fontSize: '13px', fontWeight: '800', cursor: sending ? 'not-allowed' : 'pointer',
              fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: '7px',
            }}>
              <Send size={14} /> {sending ? 'Sending…' : 'Send Now'}
            </button>
            <button onClick={() => setShowForm(false)} style={{ padding: '10px 18px', backgroundColor: 'transparent', color: C.muted, border: `1px solid ${C.border}`, borderRadius: '10px', fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit' }}>Cancel</button>
          </div>
        </div>
      )}

      {/* Filters + List */}
      <div style={{ backgroundColor: C.card, border: `1px solid ${C.border}`, borderRadius: '20px', overflow: 'hidden' }}>
        {/* Filter bar */}
        <div style={{ padding: '16px 24px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
          <p style={{ color: C.text, fontSize: '14px', fontWeight: '700', margin: 0 }}>
            All Notifications <span style={{ color: C.muted, fontWeight: '500', fontSize: '13px' }}>({filtered.length})</span>
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Filter size={13} color={C.muted} />
            <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} style={{ padding: '6px 12px', borderRadius: '8px', border: `1px solid ${C.border}`, backgroundColor: C.card2, color: C.text, fontSize: '12px', outline: 'none', fontFamily: 'inherit', cursor: 'pointer' }}>
              <option value="All">All Types</option>
              {Object.entries(TYPE_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
            <select value={readFilter} onChange={e => setReadFilter(e.target.value)} style={{ padding: '6px 12px', borderRadius: '8px', border: `1px solid ${C.border}`, backgroundColor: C.card2, color: C.text, fontSize: '12px', outline: 'none', fontFamily: 'inherit', cursor: 'pointer' }}>
              <option value="All">All Status</option>
              <option value="Unread">Unread</option>
              <option value="Read">Read</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div style={{ padding: '20px' }}>
            {[0,1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 68, borderRadius: 12, marginBottom: 10 }} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '64px 0' }}>
            <Bell size={40} color={C.muted} style={{ marginBottom: '12px', opacity: 0.5 }} />
            <p style={{ color: C.muted, fontSize: '14px' }}>No notifications found.</p>
          </div>
        ) : (
          <div>
            {filtered.map((n, i) => {
              const cfg  = TYPE_CONFIG[n.type] || TYPE_CONFIG.general;
              const Icon = cfg.Icon;
              const initials = (n.memberName || '?')[0].toUpperCase();
              return (
                <div
                  key={n.id}
                  className="notif-row"
                  style={{
                    display: 'flex', alignItems: 'center', gap: '16px', padding: '16px 24px',
                    borderBottom: i < filtered.length - 1 ? `1px solid ${C.border}` : 'none',
                    backgroundColor: n.read ? 'transparent' : `${C.green}08`,
                    transition: 'background 0.15s', position: 'relative',
                  }}
                >
                  {/* Unread dot */}
                  {!n.read && (
                    <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', width: '6px', height: '6px', borderRadius: '50%', backgroundColor: C.green }} />
                  )}

                  {/* Type Icon */}
                  <div style={{ width: '40px', height: '40px', borderRadius: '12px', backgroundColor: cfg.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon size={17} color={cfg.color} />
                  </div>

                  {/* Content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
                      <p style={{ color: C.text, fontSize: '13.5px', fontWeight: n.read ? '600' : '800', margin: 0 }}>{n.title}</p>
                      <span style={{ padding: '2px 8px', borderRadius: '20px', fontSize: '10.5px', fontWeight: '700', backgroundColor: cfg.bg, color: cfg.color }}>{cfg.label}</span>
                    </div>
                    <p style={{ color: C.muted2, fontSize: '12.5px', margin: '0 0 3px' }}>{n.message}</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ width: '16px', height: '16px', borderRadius: '50%', backgroundColor: n.memberColor || C.green, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#030712', fontWeight: '900', fontSize: '8px' }}>{initials}</span>
                      <span style={{ color: C.muted, fontSize: '11.5px' }}>→ {n.memberName}</span>
                    </div>
                  </div>

                  {/* Timestamp */}
                  <span style={{ color: C.muted, fontSize: '11px', flexShrink: 0 }}>
                    {new Date(n.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </span>

                  {/* Actions */}
                  <div className="notif-actions" style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                    {!n.read && (
                      <button onClick={() => markRead(n)} title="Mark as Read" style={{ padding: '6px', backgroundColor: `${C.green}18`, color: C.green, border: 'none', borderRadius: '7px', cursor: 'pointer', display: 'flex' }}>
                        <Check size={13} />
                      </button>
                    )}
                    <button onClick={() => deleteNotif(n.id)} title="Delete" style={{ padding: '6px', backgroundColor: `${C.red}18`, color: C.red, border: 'none', borderRadius: '7px', cursor: 'pointer', display: 'flex' }}>
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}