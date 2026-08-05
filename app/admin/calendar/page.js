'use client';
import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, FolderKanban, CheckSquare } from 'lucide-react';
import AdminLayout from '../../components/AdminLayout';
import { toast } from '../../components/Toast';

import { C } from '../../lib/colors';

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DAY_NAMES   = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function CalendarView() {
  const [projects,    setProjects]    = useState([]);
  const [tasks,       setTasks]       = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(null);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [pR, tR] = await Promise.all([
        fetch('https://zeex-digital-production.up.railway.app/api/projects'),
        fetch('https://zeex-digital-production.up.railway.app/api/tasks'),
      ]);
      setProjects(await pR.json());
      setTasks(await tR.json());
    } catch { toast.error('Failed to load calendar events'); }
    setLoading(false);
  };

  const year  = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth     = new Date(year, month + 1, 0).getDate();
  const today           = new Date();

  const dateKey = (y, m, d) => `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

  const eventsForDate = (y, m, d) => {
    const key = dateKey(y, m, d);
    const pEvents = projects.filter(p => p.end_date && p.end_date.split('T')[0] === key).map(p => ({ type: 'project', data: p }));
    const tEvents = tasks.filter(t => t.due_date && t.due_date.split('T')[0] === key).map(t => ({ type: 'task', data: t }));
    return [...pEvents, ...tEvents];
  };

  const changeMonth = (delta) => {
    setCurrentDate(new Date(year, month + delta, 1));
    setSelectedDay(null);
  };

  const cells = [];
  for (let i = 0; i < firstDayOfMonth; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const selectedEvents = selectedDay ? eventsForDate(year, month, selectedDay) : [];

  return (
    <AdminLayout title="Calendar">

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <h2 style={{ color: C.text, fontSize: '20px', fontWeight: '800', margin: 0 }}>Project & Task Calendar</h2>
          <p style={{ color: C.muted, fontSize: '13px', margin: '4px 0 0 0' }}>Track all deadlines visually</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '3px', backgroundColor: C.blue }} />
            <span style={{ color: C.muted, fontSize: '12.5px', fontWeight: '600' }}>Project Deadline</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '3px', backgroundColor: C.orange }} />
            <span style={{ color: C.muted, fontSize: '12.5px', fontWeight: '600' }}>Task Due Date</span>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="skeleton" style={{ height: 480, borderRadius: 20 }} />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: selectedDay ? '1fr 340px' : '1fr', gap: '18px', alignItems: 'flex-start' }}>

          {/* Calendar Box */}
          <div style={{ backgroundColor: C.card, border: `1px solid ${C.border}`, borderRadius: '20px', padding: '24px' }}>

            {/* Controls */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ color: C.text, fontSize: '18px', fontWeight: '800', margin: 0 }}>{MONTH_NAMES[month]} {year}</h3>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={() => changeMonth(-1)} style={{ width: '34px', height: '34px', borderRadius: '10px', backgroundColor: C.card2, border: `1px solid ${C.border}`, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ChevronLeft size={16} color={C.muted} />
                </button>
                <button onClick={() => { setCurrentDate(new Date()); setSelectedDay(null); }} style={{ padding: '0 14px', borderRadius: '10px', backgroundColor: C.card2, border: `1px solid ${C.border}`, cursor: 'pointer', color: C.text, fontSize: '12.5px', fontWeight: '700', fontFamily: 'inherit' }}>
                  Today
                </button>
                <button onClick={() => changeMonth(1)} style={{ width: '34px', height: '34px', borderRadius: '10px', backgroundColor: C.card2, border: `1px solid ${C.border}`, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ChevronRight size={16} color={C.muted} />
                </button>
              </div>
            </div>

            {/* Days header */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px', marginBottom: '8px' }}>
              {DAY_NAMES.map(d => (
                <div key={d} style={{ textAlign: 'center', color: C.muted2, fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.6px', padding: '6px 0' }}>{d}</div>
              ))}
            </div>

            {/* Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px' }}>
              {cells.map((d, i) => {
                if (d === null) return <div key={`empty-${i}`} style={{ minHeight: '94px' }} />;
                const events   = eventsForDate(year, month, d);
                const isToday  = d === today.getDate() && month === today.getMonth() && year === today.getFullYear();
                const isSelected = selectedDay === d;
                return (
                  <div
                    key={d}
                    onClick={() => setSelectedDay(isSelected ? null : d)}
                    style={{
                      minHeight: '94px', borderRadius: '12px', padding: '8px',
                      backgroundColor: isSelected ? 'rgba(0,214,143,0.1)' : C.card2,
                      border: isToday ? `2px solid ${C.green}` : isSelected ? `1.5px solid ${C.green}` : `1px solid ${C.border}`,
                      cursor: 'pointer', transition: 'all 0.15s ease',
                    }}
                  >
                    <p style={{ color: isToday ? C.green : C.text, fontSize: '12.5px', fontWeight: isToday ? '900' : '700', margin: '0 0 6px 0' }}>{d}</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                      {events.slice(0, 3).map((e, idx) => (
                        <div key={idx} style={{
                          fontSize: '9.5px', padding: '2px 6px', borderRadius: '4px', overflow: 'hidden',
                          whiteSpace: 'nowrap', textOverflow: 'ellipsis',
                          backgroundColor: e.type === 'project' ? 'rgba(78,155,255,0.15)' : 'rgba(255,184,0,0.15)',
                          color: e.type === 'project' ? C.blue : C.orange, fontWeight: '700',
                        }}>
                          {e.data.name}
                        </div>
                      ))}
                      {events.length > 3 && (
                        <p style={{ color: C.muted, fontSize: '9.5px', margin: 0, fontWeight: '600' }}>+{events.length - 3} more</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Details Sidebar */}
          {selectedDay && (
            <div style={{ backgroundColor: C.card, border: `1px solid ${C.border}`, borderRadius: '20px', padding: '22px' }} className="fade-in">
              <h3 style={{ color: C.text, fontSize: '15px', fontWeight: '800', margin: '0 0 4px 0' }}>
                {MONTH_NAMES[month]} {selectedDay}, {year}
              </h3>
              <p style={{ color: C.muted, fontSize: '12px', margin: '0 0 16px 0' }}>{selectedEvents.length} scheduled event{selectedEvents.length !== 1 ? 's' : ''}</p>

              {selectedEvents.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '30px 0' }}>
                  <p style={{ color: C.muted, fontSize: '13px' }}>No deadlines on this date 🎉</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {selectedEvents.map((e, i) => (
                    <a
                      key={i}
                      href={e.type === 'project' ? `/admin/projects/${e.data.id}` : '/admin/tasks'}
                      style={{
                        display: 'block', padding: '12px 14px', borderRadius: '12px', textDecoration: 'none',
                        backgroundColor: C.card2, border: `1px solid ${C.border}`, transition: 'border-color 0.2s',
                      }}
                      onMouseEnter={ex => ex.currentTarget.style.borderColor = e.type === 'project' ? C.blue : C.orange}
                      onMouseLeave={ex => ex.currentTarget.style.borderColor = C.border}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                        {e.type === 'project' ? <FolderKanban size={12} color={C.blue} /> : <CheckSquare size={12} color={C.orange} />}
                        <span style={{
                          fontSize: '10px', padding: '2px 7px', borderRadius: '20px', fontWeight: '800',
                          backgroundColor: e.type === 'project' ? 'rgba(78,155,255,0.15)' : 'rgba(255,184,0,0.15)',
                          color: e.type === 'project' ? C.blue : C.orange,
                        }}>
                          {e.type === 'project' ? 'Project' : 'Task'}
                        </span>
                      </div>
                      <p style={{ color: C.text, fontSize: '13px', fontWeight: '700', margin: '0 0 4px 0' }}>{e.data.name}</p>
                      {e.type === 'project' ? (
                        <p style={{ color: C.muted, fontSize: '11.5px', margin: 0 }}>{e.data.client_name || 'No Client'} · {e.data.progress}% progress</p>
                      ) : (
                        <p style={{ color: C.muted, fontSize: '11.5px', margin: 0 }}>Assigned to: {e.data.member_name || 'Unassigned'}</p>
                      )}
                    </a>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
      )}

    </AdminLayout>
  );
}