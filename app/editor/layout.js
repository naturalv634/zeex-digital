'use client';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import {
  FolderKanban, Settings, LogOut, Menu, Sparkles, X, ChevronDown, Bell
} from 'lucide-react';
import ToastContainer from '../components/Toast';
import Logo from '../components/Logo';
import ThemeToggle from '../components/ThemeToggle';

import { C } from '../lib/colors';

// Restrict navigation for editor
const NAV_ITEMS = [
  { icon: FolderKanban,    label: 'Projects',      path: '/editor/projects'  },
];

export default function EditorLayout({ children, title = 'Projects' }) {
  const pathname = usePathname();
  const router   = useRouter();
  const [user, setUser]               = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userRef    = useRef(null);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) {
      const parsedUser = JSON.parse(stored);
      if (parsedUser.role !== 'editor') {
         router.push('/login'); // Basic protection
         return;
      }
      setUser(parsedUser);
    } else {
      router.push('/login');
    }
  }, [router]);

  useEffect(() => {
    const handler = (e) => {
      if (userRef.current   && !userRef.current.contains(e.target))   setUserMenuOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => {
      document.removeEventListener('mousedown', handler);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  if (!user) return <div style={{ height: '100vh', background: C.bg }}></div>;

  return (
    <>
      <ToastContainer />
      <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: C.bg, fontFamily: 'var(--font, "Inter", sans-serif)' }}>
        
        {/* Sidebar */}
        <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
          <div className="sidebar-header">
            <Logo />
          </div>

          <div className="sidebar-nav">
            <div className="nav-group-title">MAIN MENU</div>
            {NAV_ITEMS.map(item => {
              const active = pathname.startsWith(item.path);
              const Icon = item.icon;
              return (
                <Link key={item.label} href={item.path} className={`nav-item ${active ? 'active' : ''}`}>
                  <Icon size={18} className="nav-icon" />
                  <span className="nav-label">{item.label}</span>
                </Link>
              );
            })}
          </div>

          <div className="sidebar-footer">
            <button className="logout-btn" onClick={handleLogout}>
              <LogOut size={16} /> Logout
            </button>
          </div>
        </aside>

        {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)}></div>}

        {/* Main Content Area */}
        <main style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
          
          {/* Header */}
          <header className="admin-header">
            <div className="header-left">
              <button className="menu-toggle" onClick={() => setSidebarOpen(true)}>
                <Menu size={20} color={C.text} />
              </button>
              <h1 className="header-title">{title}</h1>
            </div>

            <div className="header-right">
              <ThemeToggle />
              
              {/* User Menu */}
              <div className="user-profile" ref={userRef} onClick={() => setUserMenuOpen(!userMenuOpen)}>
                <div className="avatar" style={{ backgroundColor: user?.avatar_color || C.primary }}>
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                <div className="user-info">
                  <span className="user-name">{user?.name}</span>
                  <span className="user-role">Editor</span>
                </div>
                <ChevronDown size={14} color={C.muted} style={{ marginLeft: 8 }} />
                
                {userMenuOpen && (
                  <div className="user-dropdown">
                    <div className="dropdown-header">
                      <strong>{user?.name}</strong>
                      <span>{user?.email}</span>
                    </div>
                    <div className="dropdown-divider"></div>
                    <button onClick={handleLogout} className="dropdown-item logout">
                      <LogOut size={14} style={{ marginRight: 8 }} /> Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </header>

          {/* Scrollable Page Content */}
          <div className="admin-content" style={{ flex: 1, overflowY: 'auto', padding: '24px 32px' }}>
            {children}
          </div>
        </main>
      </div>

      <style>{`
        .admin-sidebar {
          width: 250px;
          background-color: ${C.card};
          border-right: 1px solid ${C.border};
          display: flex;
          flex-direction: column;
          z-index: 100;
        }
        .sidebar-header {
          padding: 24px;
          border-bottom: 1px solid ${C.border};
        }
        .sidebar-nav {
          flex: 1;
          padding: 24px 16px;
          overflow-y: auto;
        }
        .nav-group-title {
          font-size: 11px;
          font-weight: 700;
          color: ${C.muted};
          letter-spacing: 1px;
          margin-bottom: 12px;
          padding-left: 12px;
        }
        .nav-item {
          display: flex;
          align-items: center;
          padding: 10px 12px;
          color: ${C.text2};
          text-decoration: none;
          border-radius: 8px;
          margin-bottom: 4px;
          font-size: 14px;
          font-weight: 500;
          transition: all 0.2s;
        }
        .nav-item:hover {
          background-color: ${C.bg2};
          color: ${C.text};
        }
        .nav-item.active {
          background-color: rgba(0, 212, 255, 0.1);
          color: ${C.primary};
        }
        .nav-icon { margin-right: 12px; }
        
        .sidebar-footer {
          padding: 24px;
          border-top: 1px solid ${C.border};
        }
        .logout-btn {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 10px;
          background: rgba(255,71,87,0.1);
          color: ${C.red};
          border: 1px solid rgba(255,71,87,0.2);
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.2s;
        }
        .logout-btn:hover { background: rgba(255,71,87,0.2); }

        .admin-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 32px;
          background-color: ${C.bg};
          border-bottom: 1px solid ${C.border};
        }
        .header-left, .header-right { display: flex; align-items: center; gap: 20px; }
        .header-title { font-size: 20px; font-weight: 700; color: ${C.text}; margin: 0; }
        .menu-toggle { display: none; background: none; border: none; cursor: pointer; padding: 0; }
        
        .user-profile {
          display: flex;
          align-items: center;
          cursor: pointer;
          position: relative;
        }
        .avatar {
          width: 36px; height: 36px;
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          color: white; font-weight: bold; font-size: 16px;
          margin-right: 10px;
        }
        .user-info { display: flex; flex-direction: column; }
        .user-name { font-size: 13.5px; font-weight: 600; color: ${C.text}; }
        .user-role { font-size: 11.5px; color: ${C.muted}; text-transform: capitalize; }
        
        .user-dropdown {
          position: absolute;
          top: 50px; right: 0;
          width: 220px;
          background-color: ${C.card2};
          border: 1px solid ${C.border};
          border-radius: 12px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.5);
          z-index: 200;
          padding: 8px 0;
        }
        .dropdown-header { padding: 12px 16px; display: flex; flex-direction: column; gap: 4px; }
        .dropdown-header strong { font-size: 14px; color: ${C.text}; }
        .dropdown-header span { font-size: 12px; color: ${C.muted}; }
        .dropdown-divider { height: 1px; background-color: ${C.border}; margin: 8px 0; }
        .dropdown-item {
          display: flex; align-items: center; padding: 10px 16px;
          color: ${C.text2}; text-decoration: none; font-size: 13.5px;
          background: none; border: none; width: 100%; text-align: left;
          cursor: pointer;
        }
        .dropdown-item:hover { background-color: ${C.bg2}; color: ${C.text}; }
        .dropdown-item.logout { color: ${C.red}; }

        @media (max-width: 768px) {
          .admin-sidebar {
            position: fixed; top: 0; left: -250px; height: 100vh;
            transition: left 0.3s ease;
          }
          .admin-sidebar.open { left: 0; }
          .menu-toggle { display: block; }
          .sidebar-overlay {
            position: fixed; inset: 0; background: rgba(0,0,0,0.5);
            z-index: 90; backdrop-filter: blur(2px);
          }
          .user-info { display: none; }
          .admin-header { padding: 16px 20px; }
          .admin-content { padding: 16px !important; }
        }
      `}</style>
    </>
  );
}
