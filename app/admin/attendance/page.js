'use client';
import { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import {
  Camera, Users, UserCheck, UserX, Clock, Calendar, RefreshCw, Search
} from 'lucide-react';

import { C } from '../../lib/colors';

const fmt = (ts) => {
  if (!ts) return '—';
  return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

function Avatar({ name, color, size = 44, photo }) {
  if (photo) return (
    <img
      src={`https://zeex-digital-production.up.railway.app${photo}`}
      alt={name}
      style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', border: `2px solid ${color || C.green}`, flexShrink: 0 }}
      onError={e => { e.target.style.display = 'none'; }}
    />
  );
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', backgroundColor: color || C.green, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0A0A12', fontWeight: '800', fontSize: Math.round(size * 0.36) + 'px', flexShrink: 0 }}>
      {(name || '?')[0].toUpperCase()}
    </div>
  );
}

export default function AttendancePage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]);
  const [search, setSearch] = useState('');
  const [historyRows, setHistoryRows] = useState([]);
  const [monthlyRows, setMonthlyRows] = useState([]);
  const [monthlyMonth, setMonthlyMonth] = useState(new Date().toISOString().substring(0, 7)); // 'YYYY-MM'
  const [tab, setTab] = useState('today');

  useEffect(() => { fetchToday(); }, []);

  const fetchToday = async () => {
    setLoading(true);
    try {
      const r = await fetch('https://zeex-digital-production.up.railway.app/api/attendance/today');
      setData(await r.json());
    } catch {}
    setLoading(false);
  };

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const r = await fetch(`https://zeex-digital-production.up.railway.app/api/attendance?date=${filterDate}`);
      setHistoryRows(await r.json());
    } catch {}
    setLoading(false);
  };

  const fetchMonthly = async () => {
    setLoading(true);
    try {
      const r = await fetch(`https://zeex-digital-production.up.railway.app/api/attendance/monthly?month=${monthlyMonth}`);
      setMonthlyRows(await r.json());
    } catch {}
    setLoading(false);
  };

  useEffect(() => {
    if (tab === 'history') fetchHistory();
    if (tab === 'monthly') fetchMonthly();
  }, [tab, filterDate, monthlyMonth]);

  const present = data?.present || [];
  const absent  = data?.absent  || [];
  const total   = data?.total   || 0;

  const filteredPresent = present.filter(m => m.member_name?.toLowerCase().includes(search.toLowerCase()));
  const filteredAbsent  = absent.filter(m => m.name?.toLowerCase().includes(search.toLowerCase()));

  const attendanceRate = total > 0 ? Math.round((present.length / total) * 100) : 0;

  return (
    <AdminLayout title="Attendance">
      <style>{`
        .att-card { transition: transform 0.15s, box-shadow 0.15s; }
        .att-card:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.4) !important; }
        .tab-btn { transition: all 0.15s; }
      `}</style>

      {/* KPI Row */}
      <div className="kpi-grid-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '16px', marginBottom: '24px' }}>
        {[
          { label: 'Total Members', value: total,           icon: Users,      color: C.blue   },
          { label: 'Present Today', value: present.length,  icon: UserCheck,  color: C.green  },
          { label: 'Absent Today',  value: absent.length,   icon: UserX,      color: C.red    },
          { label: 'Attendance %',  value: `${attendanceRate}%`, icon: Camera, color: C.primary },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="att-card" style={{ backgroundColor: C.card, border: `1px solid ${C.border}`, borderRadius: '16px', padding: '22px', backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.4)' }}>
            <div style={{ width: '46px', height: '46px', borderRadius: '12px', backgroundColor: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Icon size={22} color={color} strokeWidth={2.2} />
            </div>
            <div>
              <p style={{ color: C.text, fontSize: '28px', fontWeight: '900', margin: 0 }}>{value}</p>
              <p style={{ color: C.muted, fontSize: '12px', fontWeight: '600', margin: 0 }}>{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '20px', backgroundColor: C.card2, padding: '4px', borderRadius: '12px', width: 'fit-content', border: `1px solid ${C.border}` }}>
        {['today', 'history', 'monthly'].map(t => (
          <button key={t} onClick={() => setTab(t)} className="tab-btn" style={{
            padding: '8px 22px', borderRadius: '9px', border: 'none', cursor: 'pointer', fontFamily: 'inherit',
            backgroundColor: tab === t ? C.primary : 'transparent',
            color: tab === t ? '#020B18' : C.muted2, fontWeight: '700', fontSize: '13px',
          }}>
            {t === 'today' ? "Today's Attendance" : t === 'history' ? 'Daily History' : 'Monthly Report'}
          </button>
        ))}
      </div>

      {tab === 'today' && (
        <>
          {/* Toolbar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', gap: '12px' }}>
            <div style={{ position: 'relative', flex: 1, maxWidth: 300 }}>
              <Search size={14} color={C.muted} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
              <input
                value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search member..."
                style={{ width: '100%', padding: '9px 12px 9px 34px', borderRadius: '10px', border: `1px solid ${C.border}`, backgroundColor: C.card2, color: C.text, fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>
            <button onClick={fetchToday} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 16px', borderRadius: '10px', border: `1px solid ${C.border}`, backgroundColor: C.card2, color: C.muted2, cursor: 'pointer', fontFamily: 'inherit', fontSize: '13px', fontWeight: '600' }}>
              <RefreshCw size={14} /> Refresh
            </button>
          </div>

          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' }}>
              {[0,1,2,3,4,5].map(i => <div key={i} className="skeleton" style={{ height: 120, borderRadius: 14 }} />)}
            </div>
          ) : (
            <>
              {/* Present */}
              {filteredPresent.length > 0 && (
                <div style={{ marginBottom: '28px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: C.green, boxShadow: `0 0 8px ${C.green}` }} />
                    <h3 style={{ color: C.green, fontSize: '14px', fontWeight: '800', margin: 0, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Present ({filteredPresent.length})
                    </h3>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '14px' }}>
                    {filteredPresent.map(m => (
                      <div key={m.member_id} className="att-card" style={{ backgroundColor: C.card, border: `1px solid rgba(0,255,157,0.2)`, borderRadius: '14px', padding: '18px', display: 'flex', gap: '14px', alignItems: 'flex-start', backdropFilter: 'blur(12px)', boxShadow: '0 4px 16px rgba(0,255,157,0.05)' }}>
                        <Avatar name={m.member_name} color={m.avatar_color} photo={m.photo_path} size={50} />
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <p style={{ color: C.text, fontSize: '14px', fontWeight: '800', margin: '0 0 3px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.member_name}</p>
                          <p style={{ color: C.muted2, fontSize: '11.5px', margin: '0 0 8px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.department || 'Team Member'}</p>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ backgroundColor: 'rgba(0,255,157,0.1)', color: C.green, fontSize: '11px', fontWeight: '800', padding: '3px 10px', borderRadius: '20px' }}>✓ Present</span>
                            <span style={{ color: C.muted, fontSize: '10.5px', display: 'flex', alignItems: 'center', gap: '3px' }}>
                              <Clock size={10} /> {fmt(m.check_in_time)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Absent */}
              {filteredAbsent.length > 0 && (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: C.red, boxShadow: `0 0 8px ${C.red}` }} />
                    <h3 style={{ color: C.red, fontSize: '14px', fontWeight: '800', margin: 0, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Absent ({filteredAbsent.length})
                    </h3>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '14px' }}>
                    {filteredAbsent.map(m => (
                      <div key={m.id} className="att-card" style={{ backgroundColor: C.card, border: `1px solid rgba(255,42,95,0.15)`, borderRadius: '14px', padding: '18px', display: 'flex', gap: '14px', alignItems: 'center', backdropFilter: 'blur(12px)', opacity: 0.75 }}>
                        <Avatar name={m.name} color={m.avatar_color} size={50} />
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <p style={{ color: C.text2, fontSize: '14px', fontWeight: '700', margin: '0 0 3px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.name}</p>
                          <p style={{ color: C.muted, fontSize: '11.5px', margin: '0 0 8px' }}>{m.department || 'Team Member'}</p>
                          <span style={{ backgroundColor: 'rgba(255,42,95,0.1)', color: C.red, fontSize: '11px', fontWeight: '800', padding: '3px 10px', borderRadius: '20px' }}>✗ Absent</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {filteredPresent.length === 0 && filteredAbsent.length === 0 && (
                <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                  <Camera size={44} color={C.muted} style={{ marginBottom: 12 }} />
                  <p style={{ color: C.muted, fontSize: '14px' }}>No attendance records found for today.</p>
                  <p style={{ color: C.muted2, fontSize: '12px', marginTop: 6 }}>Members can mark attendance from their portal using the camera.</p>
                </div>
              )}
            </>
          )}
        </>
      )}

      {tab === 'history' && (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <Calendar size={16} color={C.muted} />
            <input
              type="date" value={filterDate} onChange={e => setFilterDate(e.target.value)}
              style={{ padding: '9px 14px', borderRadius: '10px', border: `1px solid ${C.border}`, backgroundColor: C.card2, color: C.text, fontSize: '13px', outline: 'none' }}
            />
            <span style={{ color: C.muted, fontSize: '12px' }}>Showing records for {new Date(filterDate + 'T00:00:00').toDateString()}</span>
          </div>

          {loading ? (
            [0,1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 60, borderRadius: 10, marginBottom: 10 }} />)
          ) : historyRows.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px', backgroundColor: C.card, borderRadius: 16, border: `1px solid ${C.border}` }}>
              <p style={{ color: C.muted, fontSize: '14px' }}>No records for this date.</p>
            </div>
          ) : (
            <div style={{ backgroundColor: C.card, border: `1px solid ${C.border}`, borderRadius: '16px', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                    {['Member', 'Department', 'Status', 'Check-in Time', 'Selfie'].map(h => (
                      <th key={h} style={{ padding: '14px 18px', textAlign: 'left', color: C.muted2, fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {historyRows.map((r, i) => (
                    <tr key={r.id} style={{ borderBottom: i < historyRows.length - 1 ? `1px solid ${C.border}` : 'none' }}
                      onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.02)'}
                      onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                      <td style={{ padding: '14px 18px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <Avatar name={r.member_name} color={r.avatar_color} size={34} />
                          <span style={{ color: C.text, fontSize: '13.5px', fontWeight: '600' }}>{r.member_name}</span>
                        </div>
                      </td>
                      <td style={{ padding: '14px 18px', color: C.muted2, fontSize: '12.5px' }}>{r.department || '—'}</td>
                      <td style={{ padding: '14px 18px' }}>
                        <span style={{ backgroundColor: r.status === 'Present' ? 'rgba(0,255,157,0.1)' : 'rgba(255,42,95,0.1)', color: r.status === 'Present' ? C.green : C.red, fontSize: '11px', fontWeight: '800', padding: '3px 10px', borderRadius: '20px' }}>
                          {r.status === 'Present' ? '✓' : '✗'} {r.status}
                        </span>
                      </td>
                      <td style={{ padding: '14px 18px', color: C.muted2, fontSize: '12.5px' }}>{fmt(r.check_in_time)}</td>
                      <td style={{ padding: '14px 18px' }}>
                        {r.photo_path ? (
                          <img src={`https://zeex-digital-production.up.railway.app${r.photo_path}`} alt="selfie" style={{ width: 38, height: 38, borderRadius: '50%', objectFit: 'cover', border: `2px solid ${C.green}`, cursor: 'pointer' }}
                            onClick={() => window.open(`https://zeex-digital-production.up.railway.app${r.photo_path}`, '_blank')} />
                        ) : <span style={{ color: C.muted, fontSize: '12px' }}>No photo</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {tab === 'monthly' && (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <Calendar size={16} color={C.muted} />
            <input
              type="month" value={monthlyMonth} onChange={e => setMonthlyMonth(e.target.value)}
              style={{ padding: '9px 14px', borderRadius: '10px', border: `1px solid ${C.border}`, backgroundColor: C.card2, color: C.text, fontSize: '13px', outline: 'none' }}
            />
            <span style={{ color: C.muted, fontSize: '12px' }}>Showing summary for {new Date(monthlyMonth + '-01').toLocaleString('default', { month: 'long', year: 'numeric' })}</span>
          </div>

          {loading ? (
             <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' }}>
                {[0,1,2,3,4,5].map(i => <div key={i} className="skeleton" style={{ height: 120, borderRadius: 14 }} />)}
             </div>
          ) : monthlyRows.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px', backgroundColor: C.card, borderRadius: 16, border: `1px solid ${C.border}` }}>
              <p style={{ color: C.muted, fontSize: '14px' }}>No members found.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
              {monthlyRows.map((m) => (
                <div key={m.id} className="att-card" style={{ backgroundColor: C.card, border: `1px solid ${C.border}`, borderRadius: '14px', padding: '18px', display: 'flex', gap: '14px', alignItems: 'center', backdropFilter: 'blur(12px)', boxShadow: '0 4px 16px rgba(0,0,0,0.3)' }}>
                  <Avatar name={m.name} color={m.avatar_color} size={54} />
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <p style={{ color: C.text, fontSize: '15px', fontWeight: '800', margin: '0 0 3px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.name}</p>
                    <p style={{ color: C.muted2, fontSize: '11.5px', margin: '0 0 8px' }}>{m.department || 'Team Member'}</p>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <span style={{ backgroundColor: 'rgba(0,255,157,0.1)', color: C.green, fontSize: '11px', fontWeight: '800', padding: '4px 10px', borderRadius: '6px' }}>{m.present_count} Present</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </AdminLayout>
  );
}
