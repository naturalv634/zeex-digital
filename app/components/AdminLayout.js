'use client';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import {
  LayoutDashboard, FolderKanban, Users, Handshake, CheckSquare,
  Bell, Settings, Search, CalendarDays, ChevronDown, X,
  FolderKanban as FolderIcon, LogOut, Menu, Sparkles,
  Clock, FileText, BarChart2, Camera,
} from 'lucide-react';
import ToastContainer from './Toast';
import Logo from './Logo';

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: 'Dashboard',     path: '/admin/dashboard' },
  { icon: FolderKanban,    label: 'Projects',      path: '/admin/projects'  },
  { icon: Users,           label: 'Team Members',  path: '/admin/members'   },
  { icon: Handshake,       label: 'Clients',       path: '/admin/clients'   },
  { icon: CheckSquare,     label: 'Tasks',         path: '/admin/tasks'     },
  { icon: CalendarDays,    label: 'Calendar',      path: '/admin/calendar'  },
  { icon: Clock,           label: 'Time Tracking', path: '/admin/time-tracking' },
  { icon: FileText,        label: 'Invoices',      path: '/admin/invoices'  },
  { icon: Camera,          label: 'Attendance',    path: '/admin/attendance' },
  { icon: BarChart2,       label: 'Reports',       path: '/admin/reports'   },
  { icon: Bell,            label: 'Notifications', path: '/admin/notifications' },
  { icon: Settings,        label: 'Settings',      path: '/admin/settings'  },
];

const C = {
  bg: '#02050E', bg2: '#050A15', card: 'rgba(8, 14, 26, 0.75)', card2: 'rgba(12, 20, 36, 0.65)', card3: 'rgba(20, 32, 58, 0.55)',
  border: '#112240', border2: '#1A3366',
  primary: '#00F3FF', primaryDark: '#0066FF', primaryLight: '#80FAFF',
  green: '#00FF9D', greenDark: '#00A86B',
  blue: '#0066FF', orange: '#FFB800', red: '#FF2A5F', purple: '#B02AFF',
  muted: '#4A628A', muted2: '#7590C2', text: '#FFFFFF', text2: '#C9D6F0',
};

export default function AdminLayout({ children, title = 'Dashboard' }) {
  const pathname = usePathname();
  const router   = useRouter();
  const [user, setUser]               = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQ, setSearchQ]         = useState('');
  const [searchRes, setSearchRes]     = useState(null);
  const [showSearch, setShowSearch]   = useState(false);
  const [notifsList, setNotifsList]   = useState([]);
  const [showNotifs, setShowNotifs]   = useState(false);
  const [notifCount, setNotifCount]   = useState(0);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const searchRef  = useRef(null);
  const searchInputRef = useRef(null);
  const userRef    = useRef(null);
  const notifRef   = useRef(null);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) setUser(JSON.parse(stored));
    fetchNotifCount();
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) setShowSearch(false);
      if (userRef.current   && !userRef.current.contains(e.target))   setUserMenuOpen(false);
      if (notifRef.current  && !notifRef.current.contains(e.target))  setShowNotifs(false);
    };
    const keyHandler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (searchInputRef.current) {
          searchInputRef.current.focus();
          setShowSearch(true);
        }
      }
    };
    document.addEventListener('mousedown', handler);
    document.addEventListener('keydown', keyHandler);
    return () => {
      document.removeEventListener('mousedown', handler);
      document.removeEventListener('keydown', keyHandler);
    };
  }, []);

  useEffect(() => {
    if (!searchQ.trim()) { setSearchRes(null); return; }
    const timer = setTimeout(async () => {
      try {
        const [p, m, c, t] = await Promise.all([
          fetch('http://localhost:5000/api/projects').then(r => r.json()),
          fetch('http://localhost:5000/api/members').then(r => r.json()),
          fetch('http://localhost:5000/api/clients').then(r => r.json()),
          fetch('http://localhost:5000/api/tasks').then(r => r.json()),
        ]);
        const q = searchQ.trim().toLowerCase();
        setSearchRes({
          projects: p.filter(x => x.name?.toLowerCase().includes(q)).slice(0, 3),
          members:  m.filter(x => x.name?.toLowerCase().includes(q)).slice(0, 3),
          clients:  c.filter(x => x.name?.toLowerCase().includes(q)).slice(0, 3),
          tasks:    t.filter(x => x.name?.toLowerCase().includes(q) || x.member_name?.toLowerCase().includes(q)).slice(0, 3),
        });
      } catch {}
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQ]);

  const fetchNotifCount = async () => {
    try {
      const r = await fetch(`http://localhost:5000/api/notifications?user_id=${user?.id || 1}`);
      const d = await r.json();
      if (Array.isArray(d)) {
        setNotifsList(d);
        setNotifCount(d.filter(n => !n.read).length);
      }
    } catch {}
  };

  const markNotifRead = async (id) => {
    try {
      await fetch(`http://localhost:5000/api/notifications/${id}/read`, { method: 'PUT' });
      setNotifsList(notifsList.map(n => n.id === id ? { ...n, read: true } : n));
      setNotifCount(prev => Math.max(0, prev - 1));
    } catch {}
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  const avatarLetter = (name) => (name || 'A')[0].toUpperCase();
  const avatarColor  = user?.avatar_color || C.green;
  const initials     = user ? avatarLetter(user.name) : 'A';

  const hasResults = searchRes && (
    searchRes.projects.length + searchRes.members.length + searchRes.clients.length + (searchRes.tasks?.length || 0) > 0
  );

  return (
    <>
      <ToastContainer />
      {/* Ambient background light orbs for depth & luxury */}
      <div className="ambient-bg-orbs">
        <div className="orb-1" />
        <div className="orb-2" />
      </div>

      <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: C.bg, fontFamily: "var(--font, 'Inter', sans-serif)", color: C.text, position: 'relative', zIndex: 1 }}>

        {/* ── MOBILE OVERLAY ────────────────────────── */}
        {sidebarOpen && (
          <div
            onClick={() => setSidebarOpen(false)}
            style={{
              position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)',
              zIndex: 49, backdropFilter: 'blur(6px)',
            }}
          />
        )}

        {/* ── SIDEBAR ───────────────────────────────── */}
        <aside className={`admin-sidebar${sidebarOpen ? ' open' : ''}`} style={{
          width: '245px',
          backgroundColor: 'rgba(6, 12, 24, 0.85)',
          backdropFilter: 'blur(20px) saturate(180%)',
          borderRight: `1px solid ${C.border}`,
          display: 'flex', flexDirection: 'column', position: 'fixed',
          top: 0, left: 0, height: '100vh', zIndex: 50,
          boxShadow: '8px 0 32px rgba(0,0,0,0.6)',
        }}>
          {/* Logo */}
          <div style={{ padding: '22px 20px 20px', borderBottom: `1px solid ${C.border}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Logo width={120} />
            </div>
          </div>

          {/* Nav */}
          <nav style={{ flex: 1, padding: '14px 10px', overflowY: 'auto' }}>
            <p style={{ color: C.muted2, fontSize: '10px', fontWeight: '700', letterSpacing: '0.8px', textTransform: 'uppercase', padding: '6px 10px 10px' }}>MAIN MENU</p>
            {NAV_ITEMS.map(item => {
              const active = pathname?.startsWith(item.path);
              const Icon   = item.icon;
              return (
                <a
                  key={item.path}
                  href={item.path}
                  onClick={() => setSidebarOpen(false)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '11px',
                    padding: '10px 12px', borderRadius: '10px', marginBottom: '2px',
                    backgroundColor: active ? 'rgba(0, 240, 255, 0.12)' : 'transparent',
                    color: active ? C.primary : C.muted,
                    fontSize: '13.5px', fontWeight: active ? '700' : '500',
                    transition: 'all 0.15s ease', position: 'relative',
                    borderLeft: active ? `3px solid ${C.primary}` : '3px solid transparent',
                    boxShadow: active ? '0 0 12px rgba(0, 240, 255, 0.15)' : 'none',
                  }}
                  onMouseEnter={e => { if (!active) { e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)'; e.currentTarget.style.color = C.text; } }}
                  onMouseLeave={e => { if (!active) { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = C.muted; } }}
                >
                  <Icon size={16.5} strokeWidth={2.3} />
                  <span>{item.label}</span>
                  {item.label === 'Notifications' && notifCount > 0 && (
                    <span style={{
                      marginLeft: 'auto', backgroundColor: C.red, color: '#fff',
                      fontSize: '10px', fontWeight: '700', borderRadius: '99px',
                      padding: '1px 6px', minWidth: '18px', textAlign: 'center',
                    }}>{notifCount}</span>
                  )}
                </a>
              );
            })}
          </nav>

          {/* User card */}
          <div style={{ padding: '12px', borderTop: `1px solid ${C.border}` }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '10px 12px', borderRadius: '10px', backgroundColor: C.card2,
              cursor: 'pointer',
            }}
              onClick={handleLogout}
              title="Logout"
            >
              <div style={{
                width: '32px', height: '32px', borderRadius: '9px',
                backgroundColor: avatarColor, display: 'flex', alignItems: 'center',
                justifyContent: 'center', color: '#0A0A12', fontWeight: '800', fontSize: '13px', flexShrink: 0,
              }}>{initials}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ color: C.text, fontSize: '12.5px', fontWeight: '700', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.name || 'Admin'}</p>
                <p style={{ color: C.muted, fontSize: '10.5px', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.email || 'admin@zeex.com'}</p>
              </div>
              <LogOut size={14} color={C.muted} strokeWidth={2.2} />
            </div>
          </div>
        </aside>

        {/* ── MAIN CONTENT ──────────────────────────── */}
        <div className="admin-main" style={{ flex: 1, marginLeft: '240px', display: 'flex', flexDirection: 'column', minWidth: 0 }}>

          {/* Top Bar */}
          <header className="admin-topbar" style={{
            position: 'sticky', top: 0, zIndex: 40,
            backgroundColor: 'rgba(3, 7, 18, 0.85)', backdropFilter: 'blur(20px)',
            borderBottom: `1px solid ${C.border}`,
            padding: '0 28px', height: '64px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <button
                className="mobile-only"
                onClick={() => setSidebarOpen(s => !s)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.muted, padding: '6px', display: 'flex' }}
              >
                <Menu size={20} />
              </button>
              <div>
                <h1 style={{ color: C.text, fontSize: '18px', fontWeight: '800', margin: 0, letterSpacing: '-0.3px' }}>{title}</h1>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {/* Search */}
              <div ref={searchRef} style={{ position: 'relative' }} className="search-bar-desktop">
                <Search size={14} color={C.muted} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                <input
                  ref={searchInputRef}
                  placeholder="Search (Cmd+K)..."
                  value={searchQ}
                  onChange={e => { setSearchQ(e.target.value); setShowSearch(true); }}
                  onFocus={() => setShowSearch(true)}
                  style={{
                    padding: '9px 32px 9px 34px', borderRadius: '20px',
                    border: `1px solid ${searchQ ? C.green : C.border}`,
                    backgroundColor: C.card2, color: C.text, fontSize: '13px',
                    width: '220px', outline: 'none', transition: 'all 0.2s',
                  }}
                />
                {searchQ && (
                  <X size={13} color={C.muted} onClick={() => { setSearchQ(''); setSearchRes(null); }}
                    style={{ position: 'absolute', right: '11px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer' }} />
                )}

                {showSearch && searchQ && (
                  <div style={{
                    position: 'absolute', top: '46px', right: 0, width: '300px',
                    backgroundColor: C.card, border: `1px solid ${C.border}`,
                    borderRadius: '14px', boxShadow: '0 16px 40px rgba(0,0,0,0.5)',
                    zIndex: 200, overflow: 'hidden',
                  }}>
                    {!hasResults ? (
                      <p style={{ color: C.muted, fontSize: '13px', textAlign: 'center', padding: '20px' }}>No results for "{searchQ}"</p>
                    ) : (
                      <>
                        {searchRes.projects.length > 0 && (
                          <div>
                            <p style={{ color: C.muted2, fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.6px', padding: '12px 14px 6px' }}>Projects</p>
                            {searchRes.projects.map(p => (
                              <a key={p.id} href={`/admin/projects/${p.id}`}
                                style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 14px' }}
                                onMouseEnter={e => e.currentTarget.style.backgroundColor = C.card2}
                                onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                              >
                                <span style={{ width: '26px', height: '26px', borderRadius: '7px', backgroundColor: 'rgba(78,155,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                  <FolderKanban size={12} color={C.blue} />
                                </span>
                                <div><p style={{ color: C.text, fontSize: '12.5px', fontWeight: '600', margin: 0 }}>{p.name}</p><p style={{ color: C.muted, fontSize: '11px', margin: 0 }}>{p.client_name}</p></div>
                              </a>
                            ))}
                          </div>
                        )}
                        {searchRes.members.length > 0 && (
                          <div style={{ borderTop: `1px solid ${C.border}` }}>
                            <p style={{ color: C.muted2, fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.6px', padding: '12px 14px 6px' }}>Members</p>
                            {searchRes.members.map(m => (
                              <a key={m.id} href={`/member/${m.id}/dashboard`}
                                style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 14px' }}
                                onMouseEnter={e => e.currentTarget.style.backgroundColor = C.card2}
                                onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                              >
                                <span style={{ width: '26px', height: '26px', borderRadius: '50%', backgroundColor: m.avatar_color || C.green, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0A0A12', fontWeight: '700', fontSize: '10px' }}>{avatarLetter(m.name)}</span>
                                <div><p style={{ color: C.text, fontSize: '12.5px', fontWeight: '600', margin: 0 }}>{m.name}</p><p style={{ color: C.muted, fontSize: '11px', margin: 0 }}>{m.department || 'Member'}</p></div>
                              </a>
                            ))}
                          </div>
                        )}
                        {searchRes.clients.length > 0 && (
                          <div style={{ borderTop: `1px solid ${C.border}` }}>
                            <p style={{ color: C.muted2, fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.6px', padding: '12px 14px 6px' }}>Clients</p>
                            {searchRes.clients.map(c => (
                              <a key={c.id} href={`/client/${c.id}/dashboard`}
                                style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 14px' }}
                                onMouseEnter={e => e.currentTarget.style.backgroundColor = C.card2}
                                onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                              >
                                <span style={{ width: '26px', height: '26px', borderRadius: '7px', backgroundColor: 'rgba(0,214,143,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.green, fontWeight: '700', fontSize: '10px' }}>{avatarLetter(c.name)}</span>
                                <div><p style={{ color: C.text, fontSize: '12.5px', fontWeight: '600', margin: 0 }}>{c.name}</p><p style={{ color: C.muted, fontSize: '11px', margin: 0 }}>Client</p></div>
                              </a>
                            ))}
                          </div>
                        )}
                        {searchRes.tasks?.length > 0 && (
                          <div style={{ borderTop: `1px solid ${C.border}` }}>
                            <p style={{ color: C.muted2, fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.6px', padding: '12px 14px 6px' }}>Tasks</p>
                            {searchRes.tasks.map(t => (
                              <a key={t.id} href={`/admin/tasks`}
                                style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 14px' }}
                                onMouseEnter={e => e.currentTarget.style.backgroundColor = C.card2}
                                onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                              >
                                <span style={{ width: '26px', height: '26px', borderRadius: '7px', backgroundColor: 'rgba(0,114,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                  <CheckSquare size={12} color={C.primaryDark} />
                                </span>
                                <div><p style={{ color: C.text, fontSize: '12.5px', fontWeight: '600', margin: 0 }}>{t.name}</p><p style={{ color: C.muted, fontSize: '11px', margin: 0 }}>{t.member_name} · {t.status}</p></div>
                              </a>
                            ))}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Bell */}
              <div ref={notifRef} style={{ position: 'relative' }}>
                <button onClick={() => setShowNotifs(!showNotifs)} style={{
                  width: '38px', height: '38px', borderRadius: '50%',
                  backgroundColor: C.card2, border: `1px solid ${C.border}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', position: 'relative', flexShrink: 0, padding: 0
                }}>
                  <Bell size={16} color={C.muted} strokeWidth={2.2} />
                  {notifCount > 0 && (
                    <span style={{
                      position: 'absolute', top: '-3px', right: '-3px',
                      backgroundColor: C.red, color: '#fff',
                      fontSize: '9px', fontWeight: '700', borderRadius: '99px',
                      padding: '1px 4px', border: `2px solid ${C.bg}`,
                    }}>{notifCount}</span>
                  )}
                </button>

                {showNotifs && (
                  <div style={{
                    position: 'absolute', top: '52px', right: 0, width: '320px',
                    backgroundColor: C.card, border: `1px solid ${C.border}`,
                    borderRadius: '14px', boxShadow: '0 16px 40px rgba(0,0,0,0.5)',
                    zIndex: 200, overflow: 'hidden',
                  }}>
                    <div style={{ padding: '14px 16px', borderBottom: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <p style={{ color: C.text, fontSize: '14px', fontWeight: '800', margin: 0 }}>Notifications</p>
                      {notifCount > 0 && <span style={{ backgroundColor: 'rgba(0, 240, 255, 0.1)', color: C.primary, fontSize: '11px', padding: '2px 8px', borderRadius: '10px', fontWeight: '700' }}>{notifCount} New</span>}
                    </div>
                    <div style={{ maxHeight: '350px', overflowY: 'auto' }}>
                      {notifsList.length === 0 ? (
                        <p style={{ color: C.muted, fontSize: '13px', textAlign: 'center', padding: '30px 20px' }}>No notifications right now.</p>
                      ) : (
                        notifsList.map(n => (
                          <div key={n.id} onClick={() => !n.read && markNotifRead(n.id)} style={{
                            padding: '14px 16px', borderBottom: `1px solid ${C.border}`,
                            backgroundColor: n.read ? 'transparent' : 'rgba(0, 240, 255, 0.03)',
                            cursor: n.read ? 'default' : 'pointer', display: 'flex', gap: '12px'
                          }}
                          onMouseEnter={e => { if (!n.read) e.currentTarget.style.backgroundColor = 'rgba(0, 240, 255, 0.08)' }}
                          onMouseLeave={e => { if (!n.read) e.currentTarget.style.backgroundColor = 'rgba(0, 240, 255, 0.03)' }}>
                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: n.read ? 'transparent' : C.primary, marginTop: '6px', flexShrink: 0 }} />
                            <div>
                              <p style={{ color: n.read ? C.muted2 : C.text, fontSize: '13px', fontWeight: n.read ? '500' : '700', margin: '0 0 4px' }}>{n.title}</p>
                              <p style={{ color: C.muted, fontSize: '12px', margin: 0 }}>{n.message}</p>
                              <p style={{ color: C.muted, fontSize: '10px', marginTop: '6px' }}>{new Date(n.created_at).toLocaleString()}</p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* User */}
              <div ref={userRef} style={{ position: 'relative' }}>
                <div
                  onClick={() => setUserMenuOpen(o => !o)}
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', padding: '4px 8px', borderRadius: '10px', transition: 'background 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = C.card2}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <div style={{ width: '34px', height: '34px', borderRadius: '50%', backgroundColor: avatarColor, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0A0A12', fontWeight: '800', fontSize: '13px' }}>{initials}</div>
                  <div className="topbar-username">
                    <p style={{ color: C.text, fontSize: '12.5px', fontWeight: '700', margin: 0 }}>{user?.name || 'Admin'}</p>
                    <p style={{ color: C.muted, fontSize: '10.5px', margin: 0 }}>Admin</p>
                  </div>
                  <ChevronDown size={13} color={C.muted} className="topbar-chevron" style={{ transform: userMenuOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                </div>

                {userMenuOpen && (
                  <div style={{
                    position: 'absolute', top: '52px', right: 0, width: '180px',
                    backgroundColor: C.card, border: `1px solid ${C.border}`,
                    borderRadius: '12px', boxShadow: '0 12px 32px rgba(0,0,0,0.4)',
                    zIndex: 200, overflow: 'hidden',
                  }}>
                    <a href="/admin/settings" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '11px 14px', color: C.muted, fontSize: '13px' }}
                      onMouseEnter={e => e.currentTarget.style.backgroundColor = C.card2}
                      onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <Settings size={14} /> Settings
                    </a>
                    <div style={{ height: '1px', backgroundColor: C.border }} />
                    <button onClick={handleLogout}
                      style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '11px 14px', color: C.red, fontSize: '13px', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
                      onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(255,107,107,0.08)'}
                      onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <LogOut size={14} /> Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </header>

          {/* Page Content */}
          <main className="admin-page-content fade-in" style={{ flex: 1, padding: '28px 28px 48px', overflowX: 'hidden' }}>
            {children}
          </main>
        </div>
      </div>
    </>
  );
}
