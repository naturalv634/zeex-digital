'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  CheckSquare, FolderKanban, Bell, LogOut, CheckCircle2, Clock,
  AlertCircle, ChevronRight, X, ArrowUpRight, Sparkles, User,
  Camera, CheckCircle, XCircle, Video, RefreshCcw
} from 'lucide-react';
import ToastContainer, { toast } from '../../../components/Toast';
import Logo from '../../../components/Logo';
import ThemeToggle from '../../../components/ThemeToggle';

import { C } from '../../../lib/colors';

const PRIORITY_COLORS = { Urgent: C.red, High: C.orange, Medium: C.blue, Low: C.green };
const STATUSES        = ['Pending', 'In Progress', 'Under Review', 'Completed', 'Blocked'];

export default function MemberDashboard() {
  const params   = useParams();
  const router   = useRouter();
  const memberId = params.id;

  const [member,       setMember]       = useState(null);
  const [tasks,        setTasks]        = useState([]);
  const [myProjects,   setMyProjects]   = useState([]);
  const [notifs,       setNotifs]       = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [showNotifDrop,setShowNotifDrop]= useState(false);
  const [isAdmin,      setIsAdmin]      = useState(false);

  // Detect if the current viewer is an admin (visiting member's page)
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('user') || '{}');
      if (saved?.role === 'admin') setIsAdmin(true);
    } catch {}
  }, []);

  // Attendance state
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [showCamera,      setShowCamera]      = useState(false);
  const [capturedPhoto,   setCapturedPhoto]   = useState(null);
  const [markingAtt,      setMarkingAtt]      = useState(false);
  const [cameraError,     setCameraError]     = useState(null);
  const [monthlyStats,    setMonthlyStats]    = useState(null);
  const videoRef   = useRef(null);
  const streamRef  = useRef(null);

  useEffect(() => {
    if (memberId) fetchData();
  }, [memberId]);

  const fetchData = async () => {
    try {
      const [mR, tR, pR, nR] = await Promise.all([
        fetch('https://zeex-digital-production.up.railway.app/api/members'),
        fetch('https://zeex-digital-production.up.railway.app/api/tasks'),
        fetch(`https://zeex-digital-production.up.railway.app/api/members/${memberId}/projects`),
        fetch(`https://zeex-digital-production.up.railway.app/api/notifications/${memberId}`),
      ]);
      const mData = await mR.json();
      const tData = await tR.json();
      const pData = await pR.json();
      const nData = await nR.json();

      const current = mData.find(m => String(m.id) === String(memberId));
      setMember(current || { name: 'Team Member', role: 'Member', email: 'member@zeex.com' });
      setTasks(tData.filter(t => String(t.member_id) === String(memberId)));
      setMyProjects(Array.isArray(pData) ? pData : []);
      setNotifs(Array.isArray(nData) ? nData : []);
    } catch { toast.error('Failed to load member portal data'); }
    setLoading(false);
    // Check today's attendance
    checkTodayAttendance();
  };

  const updateTaskStatus = async (taskId, newStatus) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
    try {
      const res = await fetch(`https://zeex-digital-production.up.railway.app/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const d = await res.json();
      if (d.success) toast.success(`Task status updated to ${newStatus}`);
    } catch { toast.error('Network error updating task status'); fetchData(); }
  };

  const markNotifRead = async (notifId) => {
    try {
      await fetch(`https://zeex-digital-production.up.railway.app/api/notifications/${notifId}/read`, { method: 'PUT' });
      setNotifs(prev => prev.map(n => n.id === notifId ? { ...n, read: true } : n));
    } catch {}
  };

  const updateProjectProgress = async (projectId, progress) => {
    setMyProjects(prev => prev.map(p => p.id === projectId ? { ...p, progress } : p));
    try {
      const res = await fetch(`https://zeex-digital-production.up.railway.app/api/projects/${projectId}/progress`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ progress }),
      });
      const data = await res.json();
      if (data.success) toast.success(`Project progress set to ${progress}%`);
    } catch { toast.error('Could not update progress'); }
  };

  const unreadCount = notifs.filter(n => !n.read).length;

  // ── Camera / Attendance helpers ──────────────────────
  const checkTodayAttendance = async () => {
    try {
      const r = await fetch(`https://zeex-digital-production.up.railway.app/api/attendance/member/${memberId}/today`);
      const d = await r.json();
      setTodayAttendance(d);

      const month = new Date().toISOString().substring(0, 7);
      const mR = await fetch(`https://zeex-digital-production.up.railway.app/api/attendance/monthly?month=${month}&member_id=${memberId}`);
      const mD = await mR.json();
      if (Array.isArray(mD)) {
         setMonthlyStats(mD.length); // The array length is the present count since it filters by date & member
      }
    } catch {}
  };

  const startCamera = async () => {
    setCapturedPhoto(null);
    setCameraError(null);
    setShowCamera(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: 640, height: 480 }, audio: false });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (e) {
      setCameraError('Camera access denied. Please allow camera permission in your browser.');
    }
  };

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;
    setShowCamera(false);
    setCapturedPhoto(null);
    setCameraError(null);
  }, []);

  const takePhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width  = videoRef.current.videoWidth  || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    canvas.getContext('2d').drawImage(videoRef.current, 0, 0);
    setCapturedPhoto(canvas.toDataURL('image/jpeg', 0.85));
    // Pause video after capture
    if (streamRef.current) streamRef.current.getTracks().forEach(t => t.enabled = false);
  };

  const retakePhoto = () => {
    setCapturedPhoto(null);
    if (streamRef.current) streamRef.current.getTracks().forEach(t => t.enabled = true);
  };

  const submitAttendance = async () => {
    if (!capturedPhoto) return;
    setMarkingAtt(true);
    try {
      // Convert base64 to blob
      const res = await fetch(capturedPhoto);
      const blob = await res.blob();
      const file = new File([blob], `selfie_${memberId}_${Date.now()}.jpg`, { type: 'image/jpeg' });

      const form = new FormData();
      form.append('member_id', memberId);
      form.append('status', 'Present');
      form.append('photo', file);

      const r = await fetch('https://zeex-digital-production.up.railway.app/api/attendance', { method: 'POST', body: form });
      const d = await r.json();
      if (d.success) {
        setTodayAttendance(d.attendance);
        toast.success('✅ Attendance marked! You are now Present.');
        stopCamera();
      } else {
        toast.error(d.error || 'Could not mark attendance');
      }
    } catch { toast.error('Network error, please try again.'); }
    setMarkingAtt(false);
  };

  // Cleanup camera on unmount
  useEffect(() => () => { if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop()); }, []);

  const completedTasks = tasks.filter(t => t.status === 'Completed').length;
  const taskPct = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;

  return (
    <>
      <ToastContainer />
      <style>{`
        .member-header { padding: 0 32px; }
        .member-main { padding: 32px; max-width: 1280px; margin: 0 auto; }
        .member-hero-wrap { display: flex; justify-content: space-between; align-items: center; }
        .member-name-text { display: block; }
        .member-logout-text { display: inline; }
        .member-notif-dropdown { width: 320px; right: 0; }
        @media (max-width: 768px) {
          .member-header { padding: 0 14px !important; }
          .member-main { padding: 16px 14px 56px !important; }
          .member-hero-wrap { flex-direction: column !important; align-items: flex-start !important; gap: 14px !important; }
          .member-name-text { display: none !important; }
          .member-logout-text { display: none !important; }
          .member-notif-dropdown { width: 90vw !important; right: -80px !important; }
          .member-stats-grid { grid-template-columns: repeat(2,1fr) !important; gap: 12px !important; }
        }
        @media (max-width: 480px) {
          .member-header { padding: 0 10px !important; }
          .member-main { padding: 12px 10px 56px !important; }
          .member-stats-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
      <div style={{ backgroundColor: C.bg, minHeight: '100vh', backgroundImage: `radial-gradient(circle at top right, rgba(0, 243, 255, 0.05), transparent 40%), linear-gradient(rgba(255,255,255,0.01) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.01) 1px, transparent 1px)`, backgroundSize: '100% 100%, 30px 30px, 30px 30px', fontFamily: "var(--font, 'Inter', sans-serif)", color: C.text }}>

        {/* Top Navigation */}
        <header className="member-header" style={{
          height: '64px', borderBottom: `1px solid ${C.border}`, backgroundColor: C.card,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          position: 'sticky', top: 0, zIndex: 50, backdropFilter: 'blur(12px)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {/* Logo: clickable only for admin viewers */}
            {isAdmin ? (
              <Link href="/admin/dashboard" style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                <Logo width={100} />
              </Link>
            ) : (
              <Logo width={100} />
            )}
            <span className="member-name-text" style={{ backgroundColor: 'rgba(0,214,143,0.1)', color: C.green, fontSize: '11px', fontWeight: '700', padding: '2px 8px', borderRadius: '20px', marginLeft: '6px' }}>Member Portal</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            {/* Theme Toggle */}
            <ThemeToggle />
            
            {/* Notification Bell */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setShowNotifDrop(v => !v)}
                style={{ width: '38px', height: '38px', borderRadius: '50%', backgroundColor: C.card2, border: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', position: 'relative' }}
              >
                <Bell size={16} color={C.muted} />
                {unreadCount > 0 && (
                  <span style={{ position: 'absolute', top: '-2px', right: '-2px', backgroundColor: C.red, color: '#fff', fontSize: '9px', fontWeight: '800', borderRadius: '99px', padding: '1px 5px' }}>{unreadCount}</span>
                )}
              </button>

              {showNotifDrop && (
                <div className="member-notif-dropdown" style={{ position: 'absolute', top: '48px', backgroundColor: C.card, border: `1px solid ${C.border}`, borderRadius: '14px', boxShadow: '0 12px 36px rgba(0,0,0,0.5)', zIndex: 100, padding: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <p style={{ color: C.text, fontSize: '13px', fontWeight: '800', margin: 0 }}>Notifications</p>
                    <span style={{ color: C.muted, fontSize: '11px' }}>{unreadCount} unread</span>
                  </div>
                  {notifs.length === 0 ? (
                    <p style={{ color: C.muted, fontSize: '12px', textAlign: 'center', padding: '20px 0' }}>No notifications</p>
                  ) : notifs.slice(0, 5).map(n => (
                    <div key={n.id} onClick={() => markNotifRead(n.id)} style={{ padding: '8px', borderRadius: '8px', backgroundColor: n.read ? 'transparent' : C.card2, cursor: 'pointer', marginBottom: '6px' }}>
                      <p style={{ color: C.text, fontSize: '12px', fontWeight: '700', margin: '0 0 2px' }}>{n.title}</p>
                      <p style={{ color: C.muted, fontSize: '11px', margin: 0 }}>{n.message}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Profile badge */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: member?.avatar_color || C.green, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0A0A12', fontWeight: '800', fontSize: '14px' }}>
                {(member?.name || 'M')[0].toUpperCase()}
              </div>
              <div>
                <p className="member-name-text" style={{ color: C.text, fontSize: '13px', fontWeight: '700', margin: 0 }}>{member?.name || 'Member'}</p>
                <p className="member-name-text" style={{ color: C.muted, fontSize: '10.5px', margin: 0 }}>{member?.department || 'Team Member'}</p>
              </div>
            </div>

            <button
              onClick={() => router.push('/login')}
              style={{ background: 'none', border: `1px solid ${C.border}`, borderRadius: '10px', color: C.red, padding: '8px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12.5px', fontWeight: '600', fontFamily: 'inherit' }}
            >
              <LogOut size={14} /> Logout
            </button>
          </div>
        </header>

        {/* Main Content Container */}
        <main className="member-main fade-in">

          {/* Hero Banner */}
          <div className="member-hero-wrap" style={{
            borderRadius: '20px', padding: '26px 32px', marginBottom: '24px',
            background: `linear-gradient(135deg, rgba(79,70,229,0.08) 0%, rgba(139,92,246,0.1) 100%)`,
            border: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            boxShadow: '0 4px 20px rgba(0,243,255,0.1), inset 0 0 0 1px rgba(255,255,255,0.05)', backdropFilter: 'blur(12px)',
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <Sparkles size={16} color={C.green} />
                <span style={{ color: C.green, fontSize: '12px', fontWeight: '700' }}>WELCOME BACK</span>
              </div>
              <h2 style={{ color: C.text, fontSize: '22px', fontWeight: '800', margin: '0 0 6px' }}>
                Hello, {member?.name || 'Member'}! 👋
              </h2>
              <p style={{ color: C.muted, fontSize: '13.5px', margin: 0 }}>
                You have <span style={{ color: C.orange, fontWeight: '700' }}>{tasks.filter(t => t.status !== 'Completed').length} active tasks</span> assigned to you today.
              </p>
            </div>
            <div style={{ textAlign: 'right', backgroundColor: C.card2, padding: '16px 24px', borderRadius: '14px', border: `1px solid ${C.border}` }}>
              <p style={{ color: C.muted, fontSize: '11.5px', margin: '0 0 4px', fontWeight: '600' }}>YOUR COMPLETION RATE</p>
              <p style={{ color: C.green, fontSize: '28px', fontWeight: '900', margin: 0 }}>{taskPct}%</p>
            </div>
          </div>

          {/* Summary Stat Cards */}
          <div className="kpi-grid-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
            {[
              { label: 'Assigned Tasks', value: tasks.length, color: C.blue, icon: CheckSquare },
              { label: 'In Progress',    value: tasks.filter(t => t.status === 'In Progress').length, color: C.orange, icon: Clock },
              { label: 'Completed',      value: completedTasks, color: C.green, icon: CheckCircle2 },
              { label: 'Projects',       value: myProjects.length, color: C.purple, icon: FolderKanban },
            ].map(({ label, value, color, icon: Icon }) => (
              <div key={label} style={{ backgroundColor: C.card, border: `1px solid ${C.border}`, borderRadius: '16px', padding: '20px', display: 'flex', alignItems: 'center', gap: '14px', backdropFilter: 'blur(12px)', boxShadow: '0 4px 20px rgba(0,0,0,0.4), inset 0 0 0 1px rgba(255,255,255,0.02)' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '12px', backgroundColor: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={20} color={color} strokeWidth={2.2} />
                </div>
                <div>
                  <p style={{ color: C.text, fontSize: '24px', fontWeight: '900', margin: 0 }}>{value}</p>
                  <p style={{ color: C.muted, fontSize: '12px', fontWeight: '600', margin: 0 }}>{label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* ── ATTENDANCE WIDGET ─────────────────────── */}
          <div style={{ backgroundColor: C.card, border: `1px solid ${C.border}`, borderRadius: '18px', padding: '24px', backdropFilter: 'blur(12px)', boxShadow: '0 4px 20px rgba(0,0,0,0.4), inset 0 0 0 1px rgba(255,255,255,0.02)', marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '12px', backgroundColor: 'rgba(0,243,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Camera size={20} color={C.primary} />
                </div>
                <div>
                  <h3 style={{ color: C.text, fontSize: '16px', fontWeight: '800', margin: 0 }}>Today's Attendance</h3>
                  <p style={{ color: C.muted, fontSize: '11.5px', margin: 0 }}>{new Date().toDateString()}</p>
                </div>
              </div>
              {todayAttendance ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: 'rgba(0,255,157,0.1)', border: '1px solid rgba(0,255,157,0.2)', padding: '8px 16px', borderRadius: '20px' }}>
                    <CheckCircle size={16} color={C.green} />
                    <span style={{ color: C.green, fontWeight: '800', fontSize: '13px' }}>Present</span>
                    <span style={{ color: C.muted, fontSize: '11px' }}>
                      · {new Date(todayAttendance.check_in_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  {monthlyStats !== null && (
                    <span style={{ color: C.primaryLight, fontSize: '12px', fontWeight: '700' }}>This Month: {monthlyStats} Days Present</span>
                  )}
                </div>
              ) : (
                <button
                  onClick={startCamera}
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: C.primary, color: '#020B18', padding: '10px 22px', borderRadius: '12px', border: 'none', cursor: 'pointer', fontWeight: '800', fontSize: '13px', fontFamily: 'inherit', boxShadow: `0 0 20px rgba(0,243,255,0.3)`, transition: 'all 0.15s' }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = `0 0 30px rgba(0,243,255,0.5)`; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = `0 0 20px rgba(0,243,255,0.3)`; }}
                >
                  <Camera size={16} /> Mark Attendance
                </button>
              )}
            </div>

            {todayAttendance && todayAttendance.photo_path && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '14px', backgroundColor: C.card2, borderRadius: '12px', border: `1px solid rgba(0,255,157,0.15)` }}>
                <img src={`https://zeex-digital-production.up.railway.app${todayAttendance.photo_path}`} alt="Selfie" style={{ width: 56, height: 56, borderRadius: '50%', objectFit: 'cover', border: `2px solid ${C.green}` }} />
                <div>
                  <p style={{ color: C.green, fontSize: '13px', fontWeight: '800', margin: '0 0 3px' }}>✓ Checked in successfully</p>
                  <p style={{ color: C.muted, fontSize: '12px', margin: 0 }}>Your selfie was recorded. Admin can see your attendance.</p>
                </div>
              </div>
            )}

            {!todayAttendance && !showCamera && (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <div style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: 'rgba(255,42,95,0.1)', border: '2px dashed rgba(255,42,95,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                  <XCircle size={28} color={C.red} strokeWidth={1.5} />
                </div>
                <p style={{ color: C.red, fontSize: '14px', fontWeight: '700', margin: '0 0 4px' }}>Not Marked Yet</p>
                <p style={{ color: C.muted, fontSize: '12px', margin: '0 0 8px' }}>Click "Mark Attendance" to take a selfie and mark yourself present.</p>
                {monthlyStats !== null && (
                  <span style={{ color: C.primaryLight, fontSize: '12px', fontWeight: '700' }}>This Month: {monthlyStats} Days Present</span>
                )}
              </div>
            )}
          </div>

          {/* ── CAMERA MODAL ─────────────────────────── */}
          {showCamera && (
            <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.88)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', backdropFilter: 'blur(6px)' }}>
              <div style={{ backgroundColor: '#080F22', border: `1px solid ${C.border2}`, borderRadius: '20px', padding: '28px', width: '420px', maxWidth: '100%', boxShadow: `0 0 60px rgba(0,243,255,0.1)` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <div>
                    <h3 style={{ color: C.text, fontSize: '18px', fontWeight: '800', margin: '0 0 4px' }}>📸 Take Your Selfie</h3>
                    <p style={{ color: C.muted, fontSize: '12px', margin: 0 }}>Position your face in the frame and click Capture</p>
                  </div>
                  <button onClick={stopCamera} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.muted, padding: '4px' }}><X size={22} /></button>
                </div>

                {cameraError ? (
                  <div style={{ backgroundColor: 'rgba(255,42,95,0.1)', border: `1px solid rgba(255,42,95,0.3)`, borderRadius: '12px', padding: '20px', textAlign: 'center' }}>
                    <XCircle size={36} color={C.red} style={{ marginBottom: 10 }} />
                    <p style={{ color: C.red, fontSize: '13px', margin: 0 }}>{cameraError}</p>
                  </div>
                ) : (
                  <div style={{ position: 'relative', borderRadius: '14px', overflow: 'hidden', border: `2px solid ${C.border2}`, marginBottom: '18px', backgroundColor: '#000', aspectRatio: '4/3' }}>
                    <video
                      ref={videoRef} autoPlay playsInline muted
                      style={{ width: '100%', height: '100%', objectFit: 'cover', display: capturedPhoto ? 'none' : 'block' }}
                    />
                    {capturedPhoto && (
                      <img src={capturedPhoto} alt="Captured" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    )}
                    {/* Face overlay guide */}
                    {!capturedPhoto && (
                      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '160px', height: '200px', borderRadius: '50% 50% 50% 50% / 55% 55% 45% 45%', border: `2px dashed rgba(0,243,255,0.4)`, pointerEvents: 'none' }} />
                    )}
                  </div>
                )}

                <div style={{ display: 'flex', gap: '10px' }}>
                  {!capturedPhoto ? (
                    <button
                      onClick={takePhoto}
                      disabled={!!cameraError}
                      style={{ flex: 1, padding: '13px', borderRadius: '12px', border: 'none', background: `linear-gradient(135deg, ${C.primaryDark}, ${C.primary})`, color: '#020B18', fontWeight: '900', fontSize: '14px', cursor: cameraError ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontFamily: 'inherit' }}
                    >
                      <Camera size={18} /> Capture Photo
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={retakePhoto}
                        style={{ flex: 1, padding: '13px', borderRadius: '12px', border: `1px solid ${C.border}`, background: 'transparent', color: C.muted2, fontWeight: '700', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontFamily: 'inherit' }}
                      >
                        <RefreshCcw size={15} /> Retake
                      </button>
                      <button
                        onClick={submitAttendance}
                        disabled={markingAtt}
                        style={{ flex: 2, padding: '13px', borderRadius: '12px', border: 'none', background: `linear-gradient(135deg, ${C.greenDark}, ${C.green})`, color: '#020B18', fontWeight: '900', fontSize: '14px', cursor: markingAtt ? 'wait' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontFamily: 'inherit' }}
                      >
                        <CheckCircle size={18} /> {markingAtt ? 'Submitting...' : 'Submit Attendance'}
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="two-col-layout" style={{ display: 'grid', gridTemplateColumns: '1.8fr 1.2fr', gap: '20px' }}>

            {/* Task List Column */}
            <div style={{ backgroundColor: C.card, border: `1px solid ${C.border}`, borderRadius: '18px', padding: '24px', backdropFilter: 'blur(12px)', boxShadow: '0 4px 20px rgba(0,0,0,0.4), inset 0 0 0 1px rgba(255,255,255,0.02)' }}>
              <h3 style={{ color: C.text, fontSize: '16px', fontWeight: '800', margin: '0 0 18px 0' }}>Your Assigned Tasks</h3>

              {loading ? (
                [0,1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 70, borderRadius: 12, marginBottom: 12 }} />)
              ) : tasks.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                  <CheckSquare size={36} color={C.muted2} style={{ marginBottom: '10px' }} />
                  <p style={{ color: C.muted, fontSize: '13.5px' }}>No tasks assigned to you right now.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {tasks.map(task => {
                    const pColor = PRIORITY_COLORS[task.priority] || C.muted;
                    return (
                      <div key={task.id} style={{ backgroundColor: 'rgba(19, 31, 56, 0.4)', border: `1px solid ${C.border}`, borderRadius: '14px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <div>
                            <span style={{ backgroundColor: `${pColor}15`, color: pColor, fontSize: '10px', fontWeight: '800', padding: '2px 8px', borderRadius: '20px' }}>
                              {task.priority || 'Medium'} Priority
                            </span>
                            <h4 style={{ color: C.text, fontSize: '14px', fontWeight: '700', margin: '6px 0 2px' }}>{task.name}</h4>
                            {task.project_name && <p style={{ color: C.blue, fontSize: '11.5px', margin: 0, fontWeight: '600' }}>Project: {task.project_name}</p>}
                          </div>

                          <select
                            value={task.status}
                            onChange={e => updateTaskStatus(task.id, e.target.value)}
                            style={{ padding: '6px 10px', borderRadius: '8px', backgroundColor: C.card3, border: `1px solid ${C.border}`, color: C.text, fontSize: '12px', fontWeight: '700', outline: 'none', fontFamily: 'inherit', cursor: 'pointer' }}
                          >
                            {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* My Projects Column */}
            <div style={{ backgroundColor: C.card, border: `1px solid ${C.border}`, borderRadius: '18px', padding: '24px', backdropFilter: 'blur(12px)', boxShadow: '0 4px 20px rgba(0,0,0,0.4), inset 0 0 0 1px rgba(255,255,255,0.02)' }}>
              <h3 style={{ color: C.text, fontSize: '16px', fontWeight: '800', margin: '0 0 18px 0' }}>Your Active Projects</h3>

              {loading ? (
                [0,1].map(i => <div key={i} className="skeleton" style={{ height: 100, borderRadius: 12, marginBottom: 12 }} />)
              ) : myProjects.length === 0 ? (
                <p style={{ color: C.muted, fontSize: '13px', textAlign: 'center', padding: '30px 0' }}>No project assignments yet.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {myProjects.map(proj => (
                    <div key={proj.id} style={{ backgroundColor: 'rgba(19, 31, 56, 0.4)', border: `1px solid ${C.border}`, borderRadius: '14px', padding: '16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <h4 style={{ color: C.text, fontSize: '13.5px', fontWeight: '700', margin: 0 }}>{proj.name}</h4>
                        <span style={{ color: C.green, fontSize: '12px', fontWeight: '800' }}>{proj.progress}%</span>
                      </div>

                      <div style={{ height: '6px', borderRadius: '99px', backgroundColor: C.card3, overflow: 'hidden', marginBottom: '12px' }}>
                        <div style={{ height: '100%', width: `${proj.progress}%`, background: `linear-gradient(90deg, ${C.greenDark}, ${C.green})`, borderRadius: '99px', transition: 'width 0.3s' }} />
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ color: C.muted, fontSize: '11px', fontWeight: '600' }}>Update Progress:</span>
                        <input
                          type="range" min="0" max="100" value={proj.progress}
                          onChange={e => updateProjectProgress(proj.id, parseInt(e.target.value))}
                          style={{ flex: 1, accentColor: C.green, cursor: 'pointer' }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

        </main>
      </div>
    </>
  );
}