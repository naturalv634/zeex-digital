'use client';
import { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { BarChart2, TrendingUp, DollarSign, Clock, CheckCircle, Users, FolderKanban, AlertTriangle, RefreshCw, Download, Printer } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie, Legend, LineChart, Line, AreaChart, Area,
} from 'recharts';

const C = {
  bg: '#030712', bg2: '#080E1E', card: '#0C1327', card2: '#121C38', card3: '#18264B',
  border: '#1E2D56', border2: '#2A3F75',
  primary: '#00F0FF', primaryDark: '#0072FF',
  green: '#00E599', greenDark: '#00B377',
  blue: '#0072FF', orange: '#FF9900', red: '#FF4757', purple: '#9D4EDD',
  muted: '#4A628A', muted2: '#7590C2', text: '#F1F5F9', text2: '#94A3B8',
};

const TASK_COLORS = { Pending: C.orange, 'In Progress': C.blue, Completed: C.green, Cancelled: C.muted2, Blocked: C.red };
const PALETTE = [C.green, C.blue, C.orange, C.purple, C.red, '#00CFE8', '#FF9F43'];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ backgroundColor: C.card2, border: `1px solid ${C.border}`, borderRadius: '10px', padding: '10px 14px', fontSize: '12px', color: C.text }}>
      <p style={{ margin: '0 0 4px', color: C.muted, fontSize: '11px' }}>{label}</p>
      {payload.map((p, i) => <p key={i} style={{ margin: '2px 0', color: p.color || C.green }}>{p.name}: <strong>{p.value}</strong></p>)}
    </div>
  );
};

export default function ReportsPage() {
  const [data, setData]       = useState(null);
  const [stats, setStats]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [r, s] = await Promise.all([
        fetch('https://zeex-digital-production.up.railway.app/api/reports/overview').then(res => res.json()),
        fetch('https://zeex-digital-production.up.railway.app/api/stats').then(res => res.json()),
      ]);
      setData(r);
      setStats(s);
      setLastUpdated(new Date().toLocaleTimeString());
    } catch {}
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const taskPie = (data?.tasksByStatus || []).map(t => ({
    name: t.status, value: parseInt(t.count),
    fill: TASK_COLORS[t.status] || C.muted,
  }));

  const weeklyData = (data?.weeklyHours || []).map(w => ({
    week: new Date(w.week).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }),
    hours: parseFloat(w.hours).toFixed(1),
  }));

  const milestonePie = (data?.milestoneSummary || []).map((m, i) => ({
    name: m.status, value: parseInt(m.count),
    fill: PALETTE[i],
  }));

  const invSummary = data?.invoicesByStatus || [];
  const totalRevenue = invSummary.filter(i => i.status === 'Paid').reduce((s, i) => s + parseFloat(i.total || 0), 0);

  return (
    <AdminLayout title="Reports & Analytics">
      <style>{`
        .fade-in { animation: fadeIn 0.35s ease; }
        @keyframes fadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        @media print {
          body * { visibility: hidden !important; }
          #printable-report, #printable-report * { visibility: visible !important; }
          #printable-report { position: absolute; left: 0; top: 0; width: 100%; }
          .no-print { display: none !important; }
          @page { margin: 15mm; size: A4; }
        }
      `}</style>

      {/* Header actions */}
      <div className="no-print" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h2 style={{ color: C.text, fontSize: '20px', fontWeight: '800', margin: '0 0 4px' }}>Business Overview</h2>
          <p style={{ color: C.muted, fontSize: '13px', margin: 0 }}>
            {lastUpdated ? `Last updated: ${lastUpdated}` : 'Loading data...'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={fetchData} style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '9px 16px', backgroundColor: C.card2, color: C.text2, border: `1px solid ${C.border}`, borderRadius: '10px', cursor: 'pointer', fontSize: '13px', fontWeight: '600', fontFamily: 'inherit' }}>
            <RefreshCw size={14} /> Refresh
          </button>
          <button onClick={() => window.print()} style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '9px 16px', backgroundColor: C.blue, color: '#fff', border: 'none', borderRadius: '10px', cursor: 'pointer', fontSize: '13px', fontWeight: '700', fontFamily: 'inherit' }}>
            <Printer size={14} /> Download Report
          </button>
        </div>
      </div>

      {/* ── START PRINTABLE REGION ── */}
      <div id="printable-report">

      {/* Print Header (only visible when printing) */}
      <div style={{ display: 'none' }} className="print-header">
        <style>{`.print-header { display: none; } @media print { .print-header { display: flex !important; justify-content: space-between; align-items: center; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 2px solid #E2E8F0; } }`}</style>
        <div>
          <h1 style={{ margin: 0, fontSize: '22px', fontWeight: '900' }}>ZEEX DIGITAL — Analytics Report</h1>
          <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#64748B' }}>Generated: {lastUpdated}</p>
        </div>
      </div>

      {/* Top KPIs */}
      <div className="kpi-grid-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '16px', marginBottom: '24px' }}>
        {[
          { label: 'Total Projects',    value: stats?.totalProjects || '0',   icon: FolderKanban, color: C.blue,   sub: 'Active & archived' },
          { label: 'Team Members',      value: stats?.totalMembers  || '0',   icon: Users,        color: C.purple, sub: 'Across all projects' },
          { label: 'Hours Logged',      value: `${parseFloat(stats?.totalHours || 0).toFixed(0)}h`, icon: Clock, color: C.orange, sub: 'Total tracked time' },
          { label: 'Revenue (Paid)',     value: `$${parseFloat(totalRevenue).toLocaleString('en-US', { maximumFractionDigits: 0 })}`, icon: DollarSign, color: C.green, sub: 'Paid invoices' },
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

      {/* Alert Banner */}
      {stats?.overdueTasks > 0 && (
        <div style={{ backgroundColor: 'rgba(255,107,107,0.1)', border: `1px solid ${C.red}44`, borderRadius: '12px', padding: '14px 18px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <AlertTriangle size={16} color={C.red} />
          <p style={{ color: C.red, margin: 0, fontSize: '13px', fontWeight: '600' }}>
            {stats.overdueTasks} task{stats.overdueTasks > 1 ? 's are' : ' is'} overdue. Immediate attention required.
          </p>
          <a href="/admin/tasks" style={{ marginLeft: 'auto', color: C.red, fontSize: '12px', fontWeight: '700', textDecoration: 'underline' }}>View Tasks →</a>
        </div>
      )}

      {/* Row 1: Weekly Hours + Task Breakdown */}
      <div className="two-col-layout" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', marginBottom: '20px' }}>
        {/* Weekly Hours Area Chart */}
        <div style={{ backgroundColor: C.card, border: `1px solid ${C.border}`, borderRadius: '16px', padding: '20px' }}>
          <p style={{ color: C.text, fontSize: '14px', fontWeight: '700', margin: '0 0 4px' }}>Weekly Hours Logged</p>
          <p style={{ color: C.muted, fontSize: '12px', margin: '0 0 18px' }}>Last 8 weeks</p>
          {weeklyData.length === 0 ? (
            <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <p style={{ color: C.muted, fontSize: '13px' }}>No time logged yet</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={weeklyData}>
                <defs>
                  <linearGradient id="hoursGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={C.green} stopOpacity={0.25} />
                    <stop offset="95%" stopColor={C.green} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false} />
                <XAxis dataKey="week" tick={{ fill: C.muted, fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: C.muted, fontSize: 11 }} axisLine={false} tickLine={false} unit="h" />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="hours" name="Hours" stroke={C.green} strokeWidth={2.5} fill="url(#hoursGrad)" dot={{ fill: C.green, r: 4 }} activeDot={{ r: 6 }} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Task Status Pie */}
        <div style={{ backgroundColor: C.card, border: `1px solid ${C.border}`, borderRadius: '16px', padding: '20px' }}>
          <p style={{ color: C.text, fontSize: '14px', fontWeight: '700', margin: '0 0 4px' }}>Task Status</p>
          <p style={{ color: C.muted, fontSize: '12px', margin: '0 0 10px' }}>Breakdown by status</p>
          {taskPie.length === 0 ? (
            <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <p style={{ color: C.muted, fontSize: '13px' }}>No tasks yet</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={taskPie} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
                  {taskPie.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: C.card2, border: `1px solid ${C.border}`, borderRadius: '10px', color: C.text, fontSize: '12px' }} />
                <Legend wrapperStyle={{ fontSize: '11px', color: C.muted }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Row 2: Hours by Project + Hours by Member */}
      <div className="two-col-layout" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
        {/* Hours by Project */}
        <div style={{ backgroundColor: C.card, border: `1px solid ${C.border}`, borderRadius: '16px', padding: '20px' }}>
          <p style={{ color: C.text, fontSize: '14px', fontWeight: '700', margin: '0 0 18px' }}>Hours by Project</p>
          {(data?.hoursPerProject || []).length === 0 ? (
            <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <p style={{ color: C.muted, fontSize: '13px' }}>No data yet</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={(data?.hoursPerProject || []).map(p => ({ ...p, name: p.project_name?.length > 12 ? p.project_name.slice(0, 12) + '…' : p.project_name, hours: parseFloat(p.hours) }))} barSize={22} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke={C.border} horizontal={false} />
                <XAxis type="number" tick={{ fill: C.muted, fontSize: 11 }} axisLine={false} tickLine={false} unit="h" />
                <YAxis type="category" dataKey="name" tick={{ fill: C.muted2, fontSize: 11 }} axisLine={false} tickLine={false} width={90} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="hours" name="Hours" radius={[0, 6, 6, 0]}>
                  {(data?.hoursPerProject || []).map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Hours by Member */}
        <div style={{ backgroundColor: C.card, border: `1px solid ${C.border}`, borderRadius: '16px', padding: '20px' }}>
          <p style={{ color: C.text, fontSize: '14px', fontWeight: '700', margin: '0 0 18px' }}>Hours by Member</p>
          {(data?.hoursPerMember || []).length === 0 ? (
            <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <p style={{ color: C.muted, fontSize: '13px' }}>No data yet</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', paddingTop: '4px' }}>
              {(data?.hoursPerMember || []).slice(0, 6).map((m, i) => {
                const max = parseFloat((data?.hoursPerMember || [])[0]?.hours || 1);
                const pct = max > 0 ? (parseFloat(m.hours) / max) * 100 : 0;
                return (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '30px', height: '30px', borderRadius: '50%', backgroundColor: m.avatar_color || C.green, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0A0A12', fontWeight: '800', fontSize: '11px', flexShrink: 0 }}>
                      {m.member_name?.[0] || '?'}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                        <span style={{ color: C.text2, fontSize: '12.5px', fontWeight: '600' }}>{m.member_name}</span>
                        <span style={{ color: C.muted, fontSize: '11px' }}>{parseFloat(m.hours).toFixed(1)}h</span>
                      </div>
                      <div style={{ height: '6px', backgroundColor: C.card3, borderRadius: '99px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${pct}%`, backgroundColor: m.avatar_color || PALETTE[i], borderRadius: '99px', transition: 'width 0.8s ease' }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Row 3: Invoices Summary + Milestones */}
      <div className="two-col-layout" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {/* Invoice Summary Table */}
        <div style={{ backgroundColor: C.card, border: `1px solid ${C.border}`, borderRadius: '16px', padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <p style={{ color: C.text, fontSize: '14px', fontWeight: '700', margin: 0 }}>Invoice Summary</p>
            <a href="/admin/invoices" style={{ color: C.blue, fontSize: '12px', fontWeight: '600' }}>View All →</a>
          </div>
          {invSummary.length === 0 ? (
            <p style={{ color: C.muted, fontSize: '13px', textAlign: 'center', padding: '30px 0' }}>No invoices yet</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {invSummary.map((inv, i) => {
                const colors = { Draft: C.muted, Sent: C.blue, Paid: C.green, Overdue: C.red, Cancelled: C.muted2 };
                const col = colors[inv.status] || C.muted;
                return (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', backgroundColor: C.card2, borderRadius: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: col }} />
                      <span style={{ color: C.text2, fontSize: '13px', fontWeight: '600' }}>{inv.status}</span>
                      <span style={{ color: C.muted, fontSize: '11px' }}>{inv.count} invoice{inv.count > 1 ? 's' : ''}</span>
                    </div>
                    <span style={{ color: col, fontSize: '13px', fontWeight: '700' }}>
                      ${parseFloat(inv.total || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Milestone Summary */}
        <div style={{ backgroundColor: C.card, border: `1px solid ${C.border}`, borderRadius: '16px', padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <p style={{ color: C.text, fontSize: '14px', fontWeight: '700', margin: 0 }}>Milestone Status</p>
            <a href="/admin/projects" style={{ color: C.blue, fontSize: '12px', fontWeight: '600' }}>View Projects →</a>
          </div>
          {milestonePie.length === 0 ? (
            <p style={{ color: C.muted, fontSize: '13px', textAlign: 'center', padding: '30px 0' }}>No milestones created yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={milestonePie} cx="50%" cy="50%" outerRadius={70} dataKey="value" paddingAngle={3}>
                  {milestonePie.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: C.card2, border: `1px solid ${C.border}`, borderRadius: '10px', color: C.text, fontSize: '12px' }} />
                <Legend wrapperStyle={{ fontSize: '11px', color: C.muted }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
      </div>
      {/* ── END PRINTABLE REGION ── */}

    </AdminLayout>
  );
}
