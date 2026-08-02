'use client';
import { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { Clock, Plus, Trash2, Filter, ChevronDown, Timer, TrendingUp, Users, FolderKanban, X, Check } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const C = {
  bg: '#030712', bg2: '#080E1E', card: '#0C1327', card2: '#121C38', card3: '#18264B',
  border: '#1E2D56', border2: '#2A3F75',
  primary: '#00F0FF', primaryDark: '#0072FF', primaryLight: '#38BDF8',
  green: '#00E599', greenDark: '#00B377',
  blue: '#0072FF', orange: '#FF9900', red: '#FF4757', purple: '#9D4EDD',
  muted: '#64748B', muted2: '#334155', text: '#F1F5F9', text2: '#94A3B8',
};

const inp = {
  width: '100%', padding: '10px 14px', borderRadius: '10px',
  border: `1px solid ${C.border}`, backgroundColor: C.card2,
  color: C.text, fontSize: '13px', outline: 'none', boxSizing: 'border-box',
};

const COLORS = ['#00F0FF', '#0072FF', '#FF9900', '#9D4EDD', '#00E599', '#FF4757', '#38BDF8'];

export default function TimeTrackingPage() {
  const [logs, setLogs]         = useState([]);
  const [projects, setProjects] = useState([]);
  const [members, setMembers]   = useState([]);
  const [tasks, setTasks]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [filterProject, setFilterProject] = useState('');
  const [filterMember, setFilterMember]   = useState('');

  const [form, setForm] = useState({
    project_id: '', member_id: '', task_id: '',
    hours: '', description: '', log_date: new Date().toISOString().split('T')[0],
  });

  // Live Timer State
  const [timerActive, setTimerActive] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [liveForm, setLiveForm] = useState({ project_id: '', task_id: '', description: '' });

  useEffect(() => {
    let interval;
    if (timerActive) {
      interval = setInterval(() => setTimerSeconds(s => s + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timerActive]);

  const formatTime = (totalSeconds) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleStopTimer = async () => {
    if (!liveForm.project_id) {
      toast.error("Please select a project to log the tracked time.");
      return;
    }
    const hours = (timerSeconds / 3600).toFixed(4); // Keep precision
    
    // We only log if it's more than a few seconds (e.g., > 0.01 hours)
    if (parseFloat(hours) > 0) {
      try {
        await fetch('http://localhost:5000/api/time-logs', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            project_id: liveForm.project_id, 
            task_id: liveForm.task_id || null, 
            member_id: members.length > 0 ? members[0].id : 1, // Assume Admin/Self
            hours: parseFloat(hours),
            description: liveForm.description || 'Live tracked session',
            log_date: new Date().toISOString().split('T')[0]
          }),
        });
        fetchAll();
      } catch (err) {
        console.error(err);
      }
    }
    setTimerActive(false);
    setTimerSeconds(0);
    setLiveForm({ project_id: '', task_id: '', description: '' });
  };

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [l, p, m, t] = await Promise.all([
        fetch('http://localhost:5000/api/time-logs').then(r => r.json()),
        fetch('http://localhost:5000/api/projects').then(r => r.json()),
        fetch('http://localhost:5000/api/members').then(r => r.json()),
        fetch('http://localhost:5000/api/tasks').then(r => r.json()),
      ]);
      setLogs(Array.isArray(l) ? l : []);
      setProjects(Array.isArray(p) ? p : []);
      setMembers(Array.isArray(m) ? m : []);
      setTasks(Array.isArray(t) ? t : []);
    } catch {}
    setLoading(false);
  };

  const handleLog = async () => {
    if (!form.project_id || !form.member_id || !form.hours) return;
    try {
      await fetch('http://localhost:5000/api/time-logs', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, hours: parseFloat(form.hours) }),
      });
      setShowModal(false);
      setForm({ project_id: '', member_id: '', task_id: '', hours: '', description: '', log_date: new Date().toISOString().split('T')[0] });
      fetchAll();
    } catch {}
  };

  const handleDelete = async (id) => {
    await fetch(`http://localhost:5000/api/time-logs/${id}`, { method: 'DELETE' });
    fetchAll();
  };

  const filtered = logs.filter(l =>
    (!filterProject || String(l.project_id) === filterProject) &&
    (!filterMember  || String(l.member_id)  === filterMember)
  );

  const totalHours   = filtered.reduce((s, l) => s + parseFloat(l.hours || 0), 0);
  const thisWeekHrs  = filtered.filter(l => {
    const d = new Date(l.log_date);
    const now = new Date();
    const weekAgo = new Date(now); weekAgo.setDate(now.getDate() - 7);
    return d >= weekAgo;
  }).reduce((s, l) => s + parseFloat(l.hours || 0), 0);

  // Hours per project for chart
  const byProject = Object.values(logs.reduce((acc, l) => {
    const key = l.project_name || 'Unknown';
    if (!acc[key]) acc[key] = { name: key.length > 14 ? key.slice(0, 14) + '…' : key, hours: 0 };
    acc[key].hours += parseFloat(l.hours || 0);
    return acc;
  }, {})).sort((a, b) => b.hours - a.hours).slice(0, 7);

  // Hours per member for chart
  const byMember = Object.values(logs.reduce((acc, l) => {
    const key = l.member_name || 'Unknown';
    if (!acc[key]) acc[key] = { name: key.split(' ')[0], hours: 0, color: l.avatar_color || C.green };
    acc[key].hours += parseFloat(l.hours || 0);
    return acc;
  }, {})).sort((a, b) => b.hours - a.hours).slice(0, 6);

  const topMember = byMember[0];

  return (
    <AdminLayout title="Time Tracking">
      <style>{`
        .tl-row:hover { background: rgba(255,255,255,0.03) !important; }
        .tl-del:hover { color: ${C.red} !important; }
        .fade-in { animation: fadeIn 0.35s ease; }
        @keyframes fadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pulseGlow { 0% {box-shadow: 0 0 0 0 rgba(0, 229, 153, 0.4);} 70% {box-shadow: 0 0 0 10px rgba(0, 229, 153, 0);} 100% {box-shadow: 0 0 0 0 rgba(0, 229, 153, 0);} }
      `}</style>

      {/* Live Timer Widget */}
      <div style={{ backgroundColor: C.card, border: `1px solid ${timerActive ? C.green : C.border}`, borderRadius: '16px', padding: '20px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '20px', transition: 'all 0.3s' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: '200px' }}>
          <div style={{ width: '46px', height: '46px', borderRadius: '12px', backgroundColor: timerActive ? `${C.green}20` : `${C.muted}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', animation: timerActive ? 'pulseGlow 2s infinite' : 'none', flexShrink: 0 }}>
            <Timer size={24} color={timerActive ? C.green : C.muted} />
          </div>
          <div>
            <p style={{ color: timerActive ? C.green : C.text, fontSize: '24px', fontWeight: '800', margin: '0 0 2px', fontFamily: 'monospace' }}>
              {formatTime(timerSeconds)}
            </p>
            <p style={{ color: C.muted, fontSize: '12px', margin: 0 }}>Live Tracker</p>
          </div>
        </div>
        
        <div style={{ flex: 1, display: 'flex', gap: '12px', transition: 'opacity 0.3s' }}>
          <select value={liveForm.project_id} onChange={e => setLiveForm({ ...liveForm, project_id: e.target.value })} style={{...inp, flex: 1}}>
            <option value="">Select Project</option>
            {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <select value={liveForm.task_id} onChange={e => setLiveForm({ ...liveForm, task_id: e.target.value })} style={{...inp, flex: 1}}>
            <option value="">Select Task (Optional)</option>
            {tasks.filter(t => !liveForm.project_id || String(t.project_id) === liveForm.project_id).map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
          <input type="text" placeholder="What are you working on?" value={liveForm.description} onChange={e => setLiveForm({ ...liveForm, description: e.target.value })} style={{...inp, flex: 1.5}} />
        </div>

        <div style={{ flexShrink: 0 }}>
          {!timerActive ? (
            <button 
              onClick={() => {
                if (!liveForm.project_id) {
                  toast.error("Please select a project before starting the timer.");
                  return;
                }
                setTimerActive(true);
              }} 
              style={{ backgroundColor: C.green, color: '#000', border: 'none', borderRadius: '10px', padding: '12px 24px', fontSize: '14px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <Clock size={16} /> Start Timer
            </button>
          ) : (
            <button onClick={handleStopTimer} style={{ backgroundColor: C.red, color: '#FFF', border: 'none', borderRadius: '10px', padding: '12px 24px', fontSize: '14px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Check size={16} /> Stop & Save
            </button>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '16px', marginBottom: '24px' }}>
        {[
          { label: 'Total Hours Logged', value: `${parseFloat(totalHours).toFixed(1)}h`, icon: Clock, color: C.green, sub: 'All time' },
          { label: 'This Week', value: `${parseFloat(thisWeekHrs).toFixed(1)}h`, icon: Timer, color: C.blue, sub: 'Last 7 days' },
          { label: 'Total Entries', value: filtered.length, icon: TrendingUp, color: C.orange, sub: 'Time log records' },
          { label: 'Top Contributor', value: topMember?.name?.split(' ')[0] || '—', icon: Users, color: C.purple, sub: topMember ? `${parseFloat(topMember.hours).toFixed(1)}h total` : 'No data' },
        ].map((k, i) => (
          <div key={i} style={{ backgroundColor: C.card, border: `1px solid ${C.border}`, borderRadius: '16px', padding: '20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: '46px', height: '46px', borderRadius: '12px', backgroundColor: `${k.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <k.icon size={20} color={k.color} />
            </div>
            <div>
              <p style={{ color: C.muted, fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 4px' }}>{k.label}</p>
              <p style={{ color: C.text, fontSize: '22px', fontWeight: '800', margin: '0 0 2px' }}>{loading ? '…' : k.value}</p>
              <p style={{ color: C.muted2, fontSize: '11px', margin: 0 }}>{k.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
        {/* Hours by Project */}
        <div style={{ backgroundColor: C.card, border: `1px solid ${C.border}`, borderRadius: '16px', padding: '20px' }}>
          <p style={{ color: C.text, fontSize: '14px', fontWeight: '700', margin: '0 0 18px' }}>Hours by Project</p>
          {byProject.length === 0 ? (
            <div style={{ height: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <p style={{ color: C.muted, fontSize: '13px' }}>No data yet</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={byProject} barSize={24}>
                <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false} />
                <XAxis dataKey="name" tick={{ fill: C.muted, fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: C.muted, fontSize: 11 }} axisLine={false} tickLine={false} unit="h" />
                <Tooltip contentStyle={{ backgroundColor: C.card2, border: `1px solid ${C.border}`, borderRadius: '10px', color: C.text, fontSize: '12px' }} formatter={(v) => [`${v}h`, 'Hours']} />
                <Bar dataKey="hours" radius={[6, 6, 0, 0]}>
                  {byProject.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Hours by Member */}
        <div style={{ backgroundColor: C.card, border: `1px solid ${C.border}`, borderRadius: '16px', padding: '20px' }}>
          <p style={{ color: C.text, fontSize: '14px', fontWeight: '700', margin: '0 0 18px' }}>Hours by Member</p>
          {byMember.length === 0 ? (
            <div style={{ height: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <p style={{ color: C.muted, fontSize: '13px' }}>No data yet</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', paddingTop: '4px' }}>
              {byMember.map((m, i) => {
                const max = byMember[0].hours;
                const pct = max > 0 ? (m.hours / max) * 100 : 0;
                return (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: m.color || C.green, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0A0A12', fontWeight: '800', fontSize: '11px', flexShrink: 0 }}>
                      {m.name[0]}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span style={{ color: C.text2, fontSize: '12px', fontWeight: '600' }}>{m.name}</span>
                        <span style={{ color: C.muted, fontSize: '11px' }}>{parseFloat(m.hours).toFixed(1)}h</span>
                      </div>
                      <div style={{ height: '5px', backgroundColor: C.card3, borderRadius: '99px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${pct}%`, backgroundColor: m.color || C.green, borderRadius: '99px', transition: 'width 0.6s ease' }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Logs Table */}
      <div style={{ backgroundColor: C.card, border: `1px solid ${C.border}`, borderRadius: '16px', overflow: 'hidden' }}>
        {/* Header */}
        <div style={{ padding: '18px 24px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <p style={{ color: C.text, fontSize: '15px', fontWeight: '700', margin: 0 }}>Time Log Entries</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <select value={filterProject} onChange={e => setFilterProject(e.target.value)}
              style={{ ...inp, width: '150px', padding: '8px 12px', fontSize: '12px' }}>
              <option value="">All Projects</option>
              {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <select value={filterMember} onChange={e => setFilterMember(e.target.value)}
              style={{ ...inp, width: '140px', padding: '8px 12px', fontSize: '12px' }}>
              <option value="">All Members</option>
              {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
            <button onClick={() => setShowModal(true)} style={{
              display: 'flex', alignItems: 'center', gap: '7px', padding: '9px 16px',
              backgroundColor: C.green, color: '#0A0A12', border: 'none',
              borderRadius: '10px', cursor: 'pointer', fontSize: '13px', fontWeight: '700',
            }}>
              <Plus size={15} /> Log Time
            </button>
          </div>
        </div>

        {/* Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                {['Member', 'Project', 'Task', 'Hours', 'Description', 'Date', ''].map(h => (
                  <th key={h} style={{ padding: '11px 16px', textAlign: 'left', color: C.muted, fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} style={{ padding: '40px', textAlign: 'center', color: C.muted }}>Loading…</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={7}>
                  <div style={{ padding: '50px', textAlign: 'center' }}>
                    <Clock size={36} color={C.muted2} style={{ marginBottom: '12px' }} />
                    <p style={{ color: C.muted, fontSize: '14px', margin: 0 }}>No time logs yet. Start tracking!</p>
                  </div>
                </td></tr>
              ) : filtered.map(l => (
                <tr key={l.id} className="tl-row" style={{ borderBottom: `1px solid ${C.border}`, transition: 'background 0.15s' }}>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: l.avatar_color || C.green, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0A0A12', fontWeight: '800', fontSize: '11px', flexShrink: 0 }}>
                        {(l.member_name || 'U')[0]}
                      </div>
                      <span style={{ color: C.text2, fontSize: '13px', fontWeight: '600' }}>{l.member_name || '—'}</span>
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ color: C.blue, fontSize: '12.5px', fontWeight: '600' }}>{l.project_name || '—'}</span>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ color: C.muted, fontSize: '12px' }}>{l.task_name || '—'}</span>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ color: C.green, fontSize: '14px', fontWeight: '800' }}>{parseFloat(l.hours).toFixed(1)}h</span>
                  </td>
                  <td style={{ padding: '12px 16px', maxWidth: '200px' }}>
                    <span style={{ color: C.text2, fontSize: '12px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block' }}>{l.description || '—'}</span>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ color: C.muted, fontSize: '12px' }}>{l.log_date ? new Date(l.log_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}</span>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <button onClick={() => handleDelete(l.id)} className="tl-del"
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.muted, padding: '4px', transition: 'color 0.15s' }}>
                      <Trash2 size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
          <div className="fade-in" style={{ backgroundColor: C.card, border: `1px solid ${C.border}`, borderRadius: '20px', padding: '28px', width: '460px', maxWidth: '95vw', boxShadow: '0 24px 64px rgba(0,0,0,0.5)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: `${C.green}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Clock size={18} color={C.green} />
                </div>
                <p style={{ color: C.text, fontSize: '16px', fontWeight: '800', margin: 0 }}>Log Time</p>
              </div>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.muted }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ color: C.muted, fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '6px' }}>Project *</label>
                  <select value={form.project_id} onChange={e => setForm(f => ({ ...f, project_id: e.target.value }))} style={inp}>
                    <option value="">Select project</option>
                    {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ color: C.muted, fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '6px' }}>Member *</label>
                  <select value={form.member_id} onChange={e => setForm(f => ({ ...f, member_id: e.target.value }))} style={inp}>
                    <option value="">Select member</option>
                    {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ color: C.muted, fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '6px' }}>Task (optional)</label>
                  <select value={form.task_id} onChange={e => setForm(f => ({ ...f, task_id: e.target.value }))} style={inp}>
                    <option value="">No specific task</option>
                    {tasks.filter(t => !form.project_id || String(t.project_id) === form.project_id).map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ color: C.muted, fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '6px' }}>Hours *</label>
                  <input type="number" step="0.25" min="0.25" max="24" placeholder="e.g. 2.5"
                    value={form.hours} onChange={e => setForm(f => ({ ...f, hours: e.target.value }))} style={inp} />
                </div>
              </div>
              <div>
                <label style={{ color: C.muted, fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '6px' }}>Date</label>
                <input type="date" value={form.log_date} onChange={e => setForm(f => ({ ...f, log_date: e.target.value }))} style={inp} />
              </div>
              <div>
                <label style={{ color: C.muted, fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '6px' }}>Description</label>
                <textarea placeholder="What did you work on?" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  rows={3} style={{ ...inp, resize: 'vertical', fontFamily: 'inherit' }} />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
                <button onClick={() => setShowModal(false)} style={{ flex: 1, padding: '11px', backgroundColor: C.card2, color: C.muted, border: `1px solid ${C.border}`, borderRadius: '10px', cursor: 'pointer', fontSize: '13px', fontWeight: '700' }}>
                  Cancel
                </button>
                <button onClick={handleLog} style={{ flex: 2, padding: '11px', backgroundColor: C.green, color: '#0A0A12', border: 'none', borderRadius: '10px', cursor: 'pointer', fontSize: '13px', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                  <Check size={15} /> Log Time
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
