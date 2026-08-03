'use client';
import { useState, useEffect } from 'react';
import {
  BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer,
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, AreaChart, Area,
} from 'recharts';
import {
  FolderKanban, Users, CheckSquare, Handshake,
  TrendingUp, TrendingDown, AlertTriangle, Clock,
  FolderPlus, UserPlus, RefreshCw, CheckCircle2,
  ArrowRight, CalendarDays, Zap, Award, Target,
} from 'lucide-react';
import AdminLayout from '../../components/AdminLayout';

const C = {
  bg: '#02050E', bg2: '#050A15', card: 'rgba(8, 14, 26, 0.75)', card2: 'rgba(12, 20, 36, 0.65)', card3: 'rgba(20, 32, 58, 0.55)',
  border: '#112240', border2: '#1A3366',
  primary: '#00F3FF', primaryDark: '#0066FF', primaryLight: '#80FAFF',
  green: '#00FF9D', greenDark: '#00A86B',
  blue: '#0066FF', orange: '#FFB800', red: '#FF2A5F', purple: '#B02AFF',
  muted: '#4A628A', muted2: '#7590C2', text: '#FFFFFF', text2: '#C9D6F0',
};

const ACTIVITY_ICONS = {
  project_created:  { Icon: FolderPlus,   color: C.green  },
  project_updated:  { Icon: RefreshCw,    color: C.blue   },
  progress_updated: { Icon: RefreshCw,    color: C.blue   },
  task_assigned:    { Icon: CheckSquare,  color: C.orange },
  task_completed:   { Icon: CheckCircle2, color: C.green  },
  member_added:     { Icon: UserPlus,     color: C.purple },
  client_added:     { Icon: Handshake,    color: C.blue   },
};

const timeAgo = (d) => {
  const s = Math.floor((Date.now() - new Date(d)) / 1000);
  if (s < 60)   return 'just now';
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
};

const daysLeft = (dateStr) => {
  if (!dateStr) return null;
  return Math.ceil((new Date(dateStr) - Date.now()) / 86400000);
};

/* ── KPI Card ────────────────────────────────────────── */
function KpiCard({ icon: Icon, label, value, sub, subColor, iconBg, iconColor, trend, trendUp }) {
  return (
    <div className="card-elite fade-in-up" style={{
      padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px',
      position: 'relative', overflow: 'hidden'
    }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: `linear-gradient(90deg, transparent, ${iconColor}, transparent)`, opacity: 0.8 }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative', zIndex: 1 }}>
        <div style={{ width: '46px', height: '46px', borderRadius: '14px', backgroundColor: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 0 15px ${iconColor}33` }}>
          <Icon size={22} color={iconColor} strokeWidth={2.4} />
        </div>
        {trend != null && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', backgroundColor: trendUp ? 'rgba(0,255,157,0.12)' : 'rgba(255,42,95,0.12)', padding: '5px 10px', borderRadius: '20px', border: `1px solid ${trendUp ? 'rgba(0,255,157,0.25)' : 'rgba(255,42,95,0.25)'}` }}>
            {trendUp ? <TrendingUp size={12} color={C.green} /> : <TrendingDown size={12} color={C.red} />}
            <span style={{ fontSize: '11px', fontWeight: '800', color: trendUp ? C.green : C.red }}>{trend}</span>
          </div>
        )}
      </div>
      <div>
        <p style={{ color: C.muted2, fontSize: '12.5px', fontWeight: '600', margin: '0 0 4px 0', letterSpacing: '0.2px' }}>{label}</p>
        <p style={{ color: C.text, fontSize: '32px', fontWeight: '900', margin: '0 0 4px 0', letterSpacing: '-0.8px', lineHeight: 1.1 }}>{value}</p>
        {sub && <p style={{ color: subColor || C.green, fontSize: '12px', fontWeight: '700', margin: 0, display: 'flex', alignItems: 'center', gap: '4px' }}>{sub}</p>}
      </div>
    </div>
  );
}

/* ── Skeleton ─────────────────────────────────────────── */
function Skeleton({ h = 18, w = '100%', r = 8 }) {
  return <div className="skeleton" style={{ height: h, width: w, borderRadius: r }} />;
}

/* ── Main Dashboard ──────────────────────────────────── */
export default function AdminDashboard() {
  const [stats,    setStats]    = useState(null);
  const [projects, setProjects] = useState([]);
  const [activity, setActivity] = useState([]);
  const [members,  setMembers]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [tasks,    setTasks]    = useState([]);
  const [reports,  setReports]  = useState(null);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    try {
      const [sR, pR, aR, mR, tR, repR] = await Promise.all([
        fetch('http://localhost:5000/api/stats'),
        fetch('http://localhost:5000/api/projects'),
        fetch('http://localhost:5000/api/activity?limit=10'),
        fetch('http://localhost:5000/api/members'),
        fetch('http://localhost:5000/api/tasks'),
        fetch('http://localhost:5000/api/reports/overview'),
      ]);
      const [s, p, a, m, t, rep] = await Promise.all([sR.json(), pR.json(), aR.json(), mR.json(), tR.json(), repR.json()]);
      setStats(s); setProjects(Array.isArray(p) ? p : []);
      setActivity(Array.isArray(a) ? a : []); setMembers(Array.isArray(m) ? m : []);
      setTasks(Array.isArray(t) ? t : []);
      setReports(rep);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  /* ── Derived data ─────────────────────────────────── */
  const completionRate = stats?.totalTasks > 0
    ? Math.round((stats.completedTasks / stats.totalTasks) * 100) : 0;

  const donutData = [
    { name: 'Done', value: completionRate },
    { name: 'Left', value: 100 - completionRate },
  ];

  // Project progress bar chart
  const barData = projects.slice(0, 7).map(p => ({
    name: p.name.length > 10 ? p.name.slice(0, 10) + '…' : p.name,
    progress: p.progress || 0,
  }));

  // Upcoming deadlines (next 14 days)
  const upcoming = projects
    .filter(p => p.end_date && daysLeft(p.end_date) !== null && daysLeft(p.end_date) <= 14 && daysLeft(p.end_date) >= -2 && p.status !== 'Completed')
    .sort((a, b) => new Date(a.end_date) - new Date(b.end_date))
    .slice(0, 5);

  // Top performers (members with most completed tasks)
  const memberTaskCount = members.map(m => ({
    ...m,
    completed: tasks.filter(t => t.member_id === m.id && t.status === 'Completed').length,
    total:     tasks.filter(t => t.member_id === m.id).length,
  })).sort((a, b) => b.completed - a.completed).slice(0, 4);

  // Task status breakdown
  const taskBreakdown = [
    { label: 'Pending',     color: C.muted,  count: tasks.filter(t => t.status === 'Pending').length },
    { label: 'In Progress', color: C.blue,   count: tasks.filter(t => t.status === 'In Progress').length },
    { label: 'Under Review',color: C.orange, count: tasks.filter(t => t.status === 'Under Review').length },
    { label: 'Completed',   color: C.green,  count: tasks.filter(t => t.status === 'Completed').length },
    { label: 'Blocked',     color: C.red,    count: tasks.filter(t => t.status === 'Blocked').length },
  ];

  const overdue = tasks.filter(t => t.due_date && daysLeft(t.due_date) < 0 && t.status !== 'Completed');

  return (
    <AdminLayout title="Dashboard">

      {/* ── WELCOME BANNER ────────────────────────────── */}
      <div style={{
        borderRadius: '20px', padding: '26px 32px', marginBottom: '16px',
        background: `linear-gradient(135deg, #080F20 0%, #0D1A30 50%, #12082A 100%)`,
        border: `1px solid ${C.border2}`, position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: '-60px', right: '-40px', width: '260px', height: '260px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,240,255,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-40px', left: '30%', width: '180px', height: '180px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,114,255,0.05) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <Zap size={14} color={C.primary} />
            <span style={{ color: C.primary, fontSize: '11px', fontWeight: '700', letterSpacing: '0.8px', textTransform: 'uppercase' }}>ZEEX-DIGITAL ADMIN</span>
          </div>
          <h2 style={{ color: C.text, fontSize: '22px', fontWeight: '900', margin: '0 0 8px 0', letterSpacing: '-0.4px' }}>
            Welcome back! <span style={{ background: `linear-gradient(135deg, ${C.primaryDark}, ${C.primary})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Let's ship it. 🚀</span>
          </h2>
          <p style={{ color: C.muted, fontSize: '13px', margin: '0 0 20px 0' }}>
            {overdue.length > 0 && <span style={{ color: C.red, fontWeight: '700' }}>{overdue.length} overdue tasks · </span>}
            <span style={{ color: C.orange, fontWeight: '700' }}>{upcoming.length} deadlines</span> coming up ·{' '}
            <span style={{ color: C.green, fontWeight: '700' }}>{projects.filter(p=>p.status==='In Progress').length} projects</span> in progress
          </p>
          {/* Quick Actions */}
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {[
              { label: 'New Project',  icon: FolderPlus, href: '/admin/projects/new',  color: C.primary,     bg: 'rgba(0,240,255,0.12)',  border: 'rgba(0,240,255,0.25)' },
              { label: 'Add Task',     icon: CheckSquare, href: '/admin/tasks',          color: C.green,       bg: 'rgba(0,229,153,0.1)',   border: 'rgba(0,229,153,0.2)'  },
              { label: 'Add Member',   icon: UserPlus,    href: '/admin/members/new',    color: C.purple,      bg: 'rgba(157,78,221,0.1)',  border: 'rgba(157,78,221,0.2)' },
              { label: 'Add Client',   icon: Handshake,   href: '/admin/clients/new',    color: C.orange,      bg: 'rgba(255,153,0,0.1)',   border: 'rgba(255,153,0,0.2)'  },
            ].map(({ label, icon: Icon, href, color, bg, border: bd }) => (
              <a key={label} href={href} style={{
                display: 'flex', alignItems: 'center', gap: '7px',
                padding: '9px 16px', borderRadius: '10px',
                backgroundColor: bg, color, fontSize: '13px', fontWeight: '700',
                border: `1px solid ${bd}`, transition: 'all 0.15s', textDecoration: 'none',
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = `0 4px 16px ${color}30`; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
              >
                <Icon size={14} strokeWidth={2.5} /> {label}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* ── KPI CARDS ─────────────────────────────────── */}
      <div className="kpi-grid-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
        {loading ? (
          [0,1,2,3].map(i => <div key={i} style={{ backgroundColor: C.card, border: `1px solid ${C.border}`, borderRadius: '16px', padding: '22px' }}><Skeleton h={42} w={42} r={12} /><div style={{marginTop:14}}><Skeleton h={12} w="60%" /><Skeleton h={30} w="40%" /><Skeleton h={11} w="70%" /></div></div>)
        ) : (
          <>
            <KpiCard icon={FolderKanban} label="Total Projects" value={stats?.totalProjects ?? 0}
              sub={`${projects.filter(p=>p.status==='Completed').length} completed`}
              iconBg="rgba(78,155,255,0.12)" iconColor={C.blue} trendUp={true} trend="+12%" />
            <KpiCard icon={Users} label="Team Members" value={stats?.totalMembers ?? 0}
              sub={`${members.filter(m=>m.status==='Active').length} active`}
              iconBg="rgba(167,139,250,0.12)" iconColor={C.purple} trendUp={true} trend="+3" />
            <KpiCard icon={CheckSquare} label="Total Tasks" value={stats?.totalTasks ?? 0}
              sub={`${stats?.completedTasks ?? 0} completed`}
              iconBg="rgba(0,214,143,0.12)" iconColor={C.green} trendUp={true} trend="+8%" />
            <KpiCard icon={Target} label="Completion Rate" value={`${completionRate}%`}
              sub={overdue.length > 0 ? `${overdue.length} overdue` : 'All on track!'}
              subColor={overdue.length > 0 ? C.red : C.green}
              iconBg="rgba(255,184,0,0.12)" iconColor={C.orange} trendUp={completionRate >= 50} trend={completionRate >= 50 ? 'Good' : 'Low'} />
          </>
        )}
      </div>

      {/* ── ROW 2: Charts ─────────────────────────────── */}
      <div className="two-col-layout" style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '16px', marginBottom: '20px' }}>

        {/* Bar Chart */}
        <div style={{ backgroundColor: C.card, border: `1px solid ${C.border}`, borderRadius: '16px', padding: '22px', backdropFilter: 'blur(10px)', boxShadow: '0 4px 20px rgba(0,0,0,0.4), inset 0 0 0 1px rgba(255,255,255,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h3 style={{ color: C.text, fontSize: '15px', fontWeight: '700', margin: 0 }}>Project Progress</h3>
              <p style={{ color: C.muted, fontSize: '12px', margin: '3px 0 0 0' }}>Progress % by project</p>
            </div>
            <a href="/admin/projects" style={{ color: C.green, fontSize: '12.5px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
              View all <ArrowRight size={13} />
            </a>
          </div>
          {loading ? <Skeleton h={220} /> : barData.length === 0 ? (
            <div style={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <p style={{ color: C.muted, fontSize: '13px' }}>No projects yet.</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={barData} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
                <defs>
                  <linearGradient id="neonGlow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={C.primary} stopOpacity={0.6}/>
                    <stop offset="95%" stopColor={C.blue} stopOpacity={0}/>
                  </linearGradient>
                  <filter id="glow">
                    <feGaussianBlur stdDeviation="3.5" result="coloredBlur"/>
                    <feMerge>
                      <feMergeNode in="coloredBlur"/>
                      <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                  </filter>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false} opacity={0.3} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: C.muted }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: C.muted }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: 'rgba(5, 10, 21, 0.9)', border: `1px solid ${C.primary}`, borderRadius: '8px', fontSize: '12.5px', boxShadow: `0 0 10px ${C.primaryDark}` }}
                  labelStyle={{ color: C.primary, fontWeight: 700 }}
                  itemStyle={{ color: C.text }}
                  formatter={v => [`${v}%`, 'Progress']}
                />
                <Area type="monotone" dataKey="progress" stroke={C.primary} strokeWidth={3} fillOpacity={1} fill="url(#neonGlow)" filter="url(#glow)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Donut + Task Breakdown */}
        <div style={{ backgroundColor: C.card, border: `1px solid ${C.border}`, borderRadius: '16px', padding: '22px', backdropFilter: 'blur(10px)', boxShadow: '0 4px 20px rgba(0,0,0,0.4), inset 0 0 0 1px rgba(255,255,255,0.02)' }}>
          <h3 style={{ color: C.text, fontSize: '15px', fontWeight: '700', margin: '0 0 6px 0' }}>Task Overview</h3>
          <p style={{ color: C.muted, fontSize: '12px', margin: '0 0 16px 0' }}>Status breakdown</p>

          {loading ? <Skeleton h={140} r={70} /> : (
            <div style={{ position: 'relative', width: '140px', height: '140px', margin: '0 auto 20px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <defs>
                    <filter id="glowPie">
                      <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
                      <feMerge>
                        <feMergeNode in="coloredBlur"/>
                        <feMergeNode in="SourceGraphic"/>
                      </feMerge>
                    </filter>
                  </defs>
                  <Pie data={donutData} dataKey="value" innerRadius={48} outerRadius={65}
                    startAngle={90} endAngle={-270} stroke="none">
                    <Cell fill={C.primary} filter="url(#glowPie)" />
                    <Cell fill={C.card3} />
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', textAlign: 'center' }}>
                <p style={{ color: C.green, fontSize: '24px', fontWeight: '900', margin: 0 }}>{completionRate}%</p>
                <p style={{ color: C.muted, fontSize: '10px', margin: 0 }}>done</p>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '9px' }}>
            {taskBreakdown.map(t => (
              <div key={t.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: t.color, flexShrink: 0 }} />
                  <span style={{ color: C.muted, fontSize: '12px' }}>{t.label}</span>
                </div>
                <span style={{ color: C.text, fontSize: '12.5px', fontWeight: '700' }}>{t.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── ROW 2.5: Advanced Analytics (Revenue & Productivity) ── */}
      <div className="two-col-layout" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
        
        {/* Weekly Time Logged (Productivity) */}
        <div style={{ backgroundColor: C.card, border: `1px solid ${C.border}`, borderRadius: '16px', padding: '22px', backdropFilter: 'blur(10px)', boxShadow: '0 4px 20px rgba(0,0,0,0.4), inset 0 0 0 1px rgba(255,255,255,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h3 style={{ color: C.text, fontSize: '15px', fontWeight: '700', margin: 0 }}>Team Productivity</h3>
              <p style={{ color: C.muted, fontSize: '12px', margin: '3px 0 0 0' }}>Hours logged per week</p>
            </div>
            <div style={{ padding: '6px', backgroundColor: 'rgba(167,139,250,0.12)', borderRadius: '8px' }}>
              <TrendingUp size={16} color={C.purple} />
            </div>
          </div>
          {loading ? <Skeleton h={220} /> : !reports?.weeklyHours || reports.weeklyHours.length === 0 ? (
            <div style={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <p style={{ color: C.muted, fontSize: '13px' }}>No time tracked yet.</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={reports.weeklyHours} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false} opacity={0.3} />
                <XAxis dataKey="week" tickFormatter={v => new Date(v).toLocaleDateString(undefined, {month:'short', day:'numeric'})} tick={{ fontSize: 11, fill: C.muted }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: C.muted }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: 'rgba(5, 10, 21, 0.9)', border: `1px solid ${C.purple}`, borderRadius: '8px', fontSize: '12.5px', boxShadow: `0 0 10px ${C.purple}40` }}
                  labelFormatter={v => new Date(v).toLocaleDateString(undefined, {month:'short', day:'numeric', year:'numeric'})}
                  itemStyle={{ color: C.text }}
                  formatter={v => [`${parseFloat(v).toFixed(1)} hrs`, 'Logged']}
                />
                <Bar dataKey="hours" fill={C.purple} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Top Members (Hours) */}
        <div style={{ backgroundColor: C.card, border: `1px solid ${C.border}`, borderRadius: '16px', padding: '22px', backdropFilter: 'blur(10px)', boxShadow: '0 4px 20px rgba(0,0,0,0.4), inset 0 0 0 1px rgba(255,255,255,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h3 style={{ color: C.text, fontSize: '15px', fontWeight: '700', margin: 0 }}>Top Members by Hours</h3>
              <p style={{ color: C.muted, fontSize: '12px', margin: '3px 0 0 0' }}>Total tracked time</p>
            </div>
            <div style={{ padding: '6px', backgroundColor: 'rgba(0,214,143,0.12)', borderRadius: '8px' }}>
              <Clock size={16} color={C.green} />
            </div>
          </div>
          {loading ? <Skeleton h={220} /> : !reports?.hoursPerMember || reports.hoursPerMember.length === 0 ? (
            <div style={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <p style={{ color: C.muted, fontSize: '13px' }}>No member hours logged.</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={reports.hoursPerMember} layout="vertical" margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={C.border} horizontal={false} opacity={0.3} />
                <XAxis type="number" tick={{ fontSize: 11, fill: C.muted }} axisLine={false} tickLine={false} />
                <YAxis dataKey="member_name" type="category" tick={{ fontSize: 11, fill: C.text2 }} axisLine={false} tickLine={false} width={80} />
                <Tooltip
                  contentStyle={{ backgroundColor: 'rgba(5, 10, 21, 0.9)', border: `1px solid ${C.green}`, borderRadius: '8px', fontSize: '12.5px', boxShadow: `0 0 10px ${C.green}40` }}
                  itemStyle={{ color: C.text }}
                  formatter={v => [`${parseFloat(v).toFixed(1)} hrs`, 'Logged']}
                />
                <Bar dataKey="hours" fill={C.green} radius={[0, 4, 4, 0]}>
                  {reports.hoursPerMember.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.avatar_color || C.green} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* ── ROW 3: Deadlines + Performers + Activity ── */}
      <div className="card-grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '20px' }}>

        {/* Upcoming Deadlines */}
        <div style={{ backgroundColor: C.card, border: `1px solid ${C.border}`, borderRadius: '16px', padding: '22px', backdropFilter: 'blur(10px)', boxShadow: '0 4px 20px rgba(0,0,0,0.4), inset 0 0 0 1px rgba(255,255,255,0.02)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <CalendarDays size={16} color={C.orange} strokeWidth={2.2} />
            <h3 style={{ color: C.text, fontSize: '15px', fontWeight: '700', margin: 0 }}>Deadlines</h3>
            <span style={{ marginLeft: 'auto', backgroundColor: 'rgba(255,184,0,0.12)', color: C.orange, fontSize: '11px', fontWeight: '700', padding: '2px 8px', borderRadius: '20px' }}>
              {upcoming.length} upcoming
            </span>
          </div>
          {loading ? [0,1,2,3].map(i=><div key={i} style={{marginBottom:12}}><Skeleton h={14} /><div style={{marginTop:5}}><Skeleton h={10} w="60%"/></div></div>) : upcoming.length === 0 ? (
            <p style={{ color: C.muted, fontSize: '13px', textAlign: 'center', padding: '30px 0' }}>No upcoming deadlines 🎉</p>
          ) : upcoming.map((p, i) => {
            const d = daysLeft(p.end_date);
            const dColor = d < 0 ? C.red : d <= 2 ? C.orange : C.green;
            const dLabel = d < 0 ? `${Math.abs(d)}d overdue` : d === 0 ? 'Today!' : `${d}d left`;
            return (
              <div key={p.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: i < upcoming.length - 1 ? `1px solid ${C.border}` : 'none' }}>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <p style={{ color: C.text, fontSize: '13px', fontWeight: '600', margin: '0 0 2px 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</p>
                  <p style={{ color: C.muted, fontSize: '11px', margin: 0 }}>{p.client_name || 'No client'}</p>
                </div>
                <span style={{ backgroundColor: d < 0 ? 'rgba(255,107,107,0.12)' : d <= 2 ? 'rgba(255,184,0,0.12)' : 'rgba(0,214,143,0.12)', color: d < 0 ? C.red : d <= 2 ? C.orange : C.green, fontSize: '11px', fontWeight: '700', padding: '3px 9px', borderRadius: '20px', flexShrink: 0, marginLeft: '8px' }}>
                  {dLabel}
                </span>
              </div>
            );
          })}
        </div>

        {/* Top Performers */}
        <div style={{ backgroundColor: C.card, border: `1px solid ${C.border}`, borderRadius: '16px', padding: '22px', backdropFilter: 'blur(10px)', boxShadow: '0 4px 20px rgba(0,0,0,0.4), inset 0 0 0 1px rgba(255,255,255,0.02)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <Award size={16} color={C.purple} strokeWidth={2.2} />
            <h3 style={{ color: C.text, fontSize: '15px', fontWeight: '700', margin: 0 }}>Top Performers</h3>
          </div>
          {loading ? [0,1,2,3].map(i=><div key={i} style={{display:'flex',gap:10,marginBottom:12,alignItems:'center'}}><Skeleton h={36} w={36} r={18} /><div style={{flex:1}}><Skeleton h={13} /><div style={{marginTop:4}}><Skeleton h={10} w="60%"/></div></div></div>) : memberTaskCount.length === 0 ? (
            <p style={{ color: C.muted, fontSize: '13px', textAlign: 'center', padding: '30px 0' }}>No members yet</p>
          ) : memberTaskCount.map((m, i) => (
            <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 0', borderBottom: i < memberTaskCount.length - 1 ? `1px solid ${C.border}` : 'none' }}>
              <div style={{ position: 'relative', flexShrink: 0 }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: m.avatar_color || C.green, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0A0A12', fontWeight: '800', fontSize: '13px' }}>
                  {(m.name || 'M')[0].toUpperCase()}
                </div>
                {i === 0 && <span style={{ position: 'absolute', top: '-5px', right: '-5px', fontSize: '12px' }}>🏆</span>}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ color: C.text, fontSize: '13px', fontWeight: '600', margin: '0 0 4px 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.name}</p>
                <div style={{ height: '4px', borderRadius: '99px', backgroundColor: C.card3, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: m.total > 0 ? `${(m.completed / m.total) * 100}%` : '0%', background: `linear-gradient(90deg, ${C.greenDark}, ${C.green})`, borderRadius: '99px' }} />
                </div>
              </div>
              <span style={{ color: C.green, fontSize: '12px', fontWeight: '700', flexShrink: 0 }}>{m.completed} ✓</span>
            </div>
          ))}
        </div>

        {/* Recent Activity */}
        <div style={{ backgroundColor: C.card, border: `1px solid ${C.border}`, borderRadius: '16px', padding: '22px', backdropFilter: 'blur(10px)', boxShadow: '0 4px 20px rgba(0,0,0,0.4), inset 0 0 0 1px rgba(255,255,255,0.02)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <Clock size={16} color={C.green} strokeWidth={2.2} />
            <h3 style={{ color: C.text, fontSize: '15px', fontWeight: '700', margin: 0 }}>Recent Activity</h3>
          </div>
          {loading ? [0,1,2,3,4].map(i=><div key={i} style={{display:'flex',gap:10,marginBottom:12,alignItems:'flex-start'}}><Skeleton h={30} w={30} r={9}/><div style={{flex:1}}><Skeleton h={13}/><div style={{marginTop:4}}><Skeleton h={10} w="50%"/></div></div></div>) : activity.length === 0 ? (
            <p style={{ color: C.muted, fontSize: '13px', textAlign: 'center', padding: '30px 0' }}>No activity yet</p>
          ) : (
            <div style={{ maxHeight: '300px', overflowY: 'auto', marginRight: '-6px', paddingRight: '6px' }}>
              {activity.map((a, i) => {
                const cfg = ACTIVITY_ICONS[a.type] || { Icon: Clock, color: C.muted };
                const { Icon } = cfg;
                return (
                  <div key={a.id} style={{ display: 'flex', gap: '10px', padding: '9px 0', borderBottom: i < activity.length - 1 ? `1px solid ${C.border}` : 'none' }}>
                    <span style={{ width: '30px', height: '30px', borderRadius: '9px', flexShrink: 0, backgroundColor: `${cfg.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Icon size={13} color={cfg.color} strokeWidth={2.3} />
                    </span>
                    <div style={{ minWidth: 0 }}>
                      <p style={{ color: C.text2, fontSize: '12.5px', margin: 0, lineHeight: 1.4 }}>{a.message}</p>
                      <p style={{ color: C.muted2, fontSize: '10.5px', margin: '2px 0 0 0' }}>{timeAgo(a.created_at)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── ROW 4: Active Projects Table ──────────────── */}
      <div style={{ backgroundColor: C.card, border: `1px solid ${C.border}`, borderRadius: '16px', padding: '22px', backdropFilter: 'blur(10px)', boxShadow: '0 4px 20px rgba(0,0,0,0.4), inset 0 0 0 1px rgba(255,255,255,0.02)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
          <h3 style={{ color: C.text, fontSize: '15px', fontWeight: '700', margin: 0 }}>Active Projects</h3>
          <a href="/admin/projects" style={{ color: C.green, fontSize: '12.5px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
            View all <ArrowRight size={13} />
          </a>
        </div>
        {loading ? (
          [0,1,2,3].map(i => <div key={i} style={{ display: 'flex', gap: '16px', padding: '14px 0', borderBottom: `1px solid ${C.border}`, alignItems: 'center' }}>
            <div style={{ flex: 1 }}><Skeleton h={14} /><div style={{marginTop:8}}><Skeleton h={6}/></div></div>
            <Skeleton h={24} w={60} />
            <Skeleton h={24} w={70} />
          </div>)
        ) : projects.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <FolderKanban size={36} color={C.muted2} style={{ marginBottom: '10px' }} />
            <p style={{ color: C.muted, fontSize: '13.5px' }}>No projects yet. <a href="/admin/projects/new" style={{ color: C.green }}>Create your first project →</a></p>
          </div>
        ) : (
          <div className="table-responsive">
            <div style={{ minWidth: '600px' }}>
              {/* Header */}
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 100px 110px', gap: '16px', padding: '0 0 10px 0', borderBottom: `1px solid ${C.border}`, marginBottom: '4px' }}>
                {['Project', 'Client', 'Progress', 'Status'].map(h => (
                  <p key={h} style={{ color: C.muted2, fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', margin: 0 }}>{h}</p>
                ))}
              </div>
              {projects.slice(0, 6).map((p, i) => {
                const sColor = p.status === 'Completed' ? C.green : p.status === 'On Hold' ? C.red : p.status === 'Under Review' ? C.orange : C.blue;
                const sBg    = p.status === 'Completed' ? 'rgba(0,214,143,0.1)' : p.status === 'On Hold' ? 'rgba(255,107,107,0.1)' : p.status === 'Under Review' ? 'rgba(255,184,0,0.1)' : 'rgba(78,155,255,0.1)';
                return (
                  <div key={p.id} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 100px 110px', gap: '16px', padding: '14px 0', borderBottom: i < Math.min(5, projects.length - 1) ? `1px solid ${C.border}` : 'none', alignItems: 'center' }}>
                    <a href={`/admin/projects/${p.id}`} style={{ color: C.text, fontSize: '13.5px', fontWeight: '600', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
                      onMouseEnter={e => e.currentTarget.style.color = C.green}
                      onMouseLeave={e => e.currentTarget.style.color = C.text}
                    >{p.name}</a>
                    <p style={{ color: C.muted, fontSize: '12.5px', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.client_name || '—'}</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ flex: 1, height: '5px', borderRadius: '99px', backgroundColor: C.card3, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${p.progress}%`, background: `linear-gradient(90deg, ${C.greenDark}, ${C.green})`, borderRadius: '99px' }} />
                      </div>
                      <span style={{ color: C.muted, fontSize: '11.5px', fontWeight: '700', width: '32px', flexShrink: 0 }}>{p.progress}%</span>
                    </div>
                    <span style={{ backgroundColor: sBg, color: sColor, fontSize: '11px', fontWeight: '700', padding: '4px 10px', borderRadius: '20px', width: 'fit-content' }}>{p.status}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

    </AdminLayout>
  );
}