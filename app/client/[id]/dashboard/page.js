'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Handshake, CheckCircle2, Clock, CalendarDays, ExternalLink,
  Printer, MessageSquare, Download, Sparkles, Building2
} from 'lucide-react';
import ToastContainer, { toast } from '../../../components/Toast';
import Logo from '../../../components/Logo';

const C = {
  bg: '#030712', bg2: '#080E1E', card: '#0C1327', card2: '#121C38', card3: '#18264B',
  border: '#1E2D56', border2: '#2A3F75',
  primary: '#00F0FF', primaryDark: '#0072FF', primaryLight: '#38BDF8',
  green: '#00E599', greenDark: '#00B377',
  blue: '#0072FF', orange: '#FF9900', red: '#FF4757', purple: '#9D4EDD',
  muted: '#64748B', muted2: '#334155', text: '#F1F5F9', text2: '#94A3B8',
};

export default function ClientPortal() {
  const params   = useParams();
  const router   = useRouter();
  const clientId = params.id;

  const [client,   setClient]   = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    if (clientId) fetchData();
  }, [clientId]);

  const fetchData = async () => {
    try {
      const [cR, pR] = await Promise.all([
        fetch('https://zeex-digital-production.up.railway.app/api/clients'),
        fetch(`https://zeex-digital-production.up.railway.app/api/clients/${clientId}/projects`),
      ]);
      const cData = await cR.json();
      const pData = await pR.json();

      const found = cData.find(c => String(c.id) === String(clientId));
      setClient(found || { name: 'Valued Client', department: 'Client Agency' });
      setProjects(Array.isArray(pData) ? pData : []);
    } catch { toast.error('Failed to load client portal'); }
    setLoading(false);
  };

  const handleSendFeedback = () => {
    if (!feedback.trim()) return;
    toast.success('Feedback sent to project manager!');
    setFeedback('');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      <ToastContainer />
      <div style={{ backgroundColor: C.bg, minHeight: '100vh', fontFamily: "var(--font, 'Inter', sans-serif)", color: C.text }}>

        {/* Top Header */}
        <header style={{
          height: '64px', borderBottom: `1px solid ${C.border}`, backgroundColor: C.card,
          padding: '0 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          position: 'sticky', top: 0, zIndex: 50, backdropFilter: 'blur(12px)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Logo width={100} />
            <span style={{ backgroundColor: 'rgba(78,155,255,0.1)', color: C.blue, fontSize: '11px', fontWeight: '700', padding: '2px 8px', borderRadius: '20px', marginLeft: '6px' }}>Client Portal</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button onClick={handlePrint} style={{
              padding: '8px 14px', backgroundColor: C.card2, border: `1px solid ${C.border}`,
              borderRadius: '10px', color: C.text, fontSize: '12.5px', fontWeight: '600',
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontFamily: 'inherit',
            }}>
              <Printer size={14} /> Print Summary Report
            </button>
          </div>
        </header>

        {/* Content Container */}
        <main style={{ padding: '32px', maxWidth: '1000px', margin: '0 auto' }} className="fade-in">

          {/* Client Hero Banner */}
          <div className="two-col-layout" style={{
            backgroundColor: C.card, border: `1px solid ${C.border}`, borderRadius: '20px',
            padding: '28px 32px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
              <div style={{ width: '60px', height: '60px', borderRadius: '16px', background: `linear-gradient(135deg, ${C.primaryDark}, ${C.primary})`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFFFFF', fontWeight: '900', fontSize: '24px', boxShadow: '0 4px 14px rgba(79,70,229,0.3)' }}>
                {(client?.department || client?.name || 'C')[0].toUpperCase()}
              </div>
              <div>
                <h2 style={{ color: C.text, fontSize: '20px', fontWeight: '800', margin: '0 0 4px' }}>
                  {client?.department || client?.name || 'Client Workspace'}
                </h2>
                <p style={{ color: C.muted, fontSize: '13px', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Building2 size={13} color={C.blue} /> Account Manager: ZEEX Agency Team
                </p>
              </div>
            </div>

            <span style={{ backgroundColor: 'rgba(0,214,143,0.1)', color: C.green, fontSize: '12px', padding: '6px 14px', borderRadius: '20px', fontWeight: '800' }}>
              Active Account
            </span>
          </div>

          {/* Project List & Milestones */}
          <h3 style={{ color: C.text, fontSize: '17px', fontWeight: '800', marginBottom: '16px' }}>Your Active Projects ({projects.length})</h3>

          {loading ? (
            [0,1].map(i => <div key={i} className="skeleton" style={{ height: 220, borderRadius: 20, marginBottom: 16 }} />)
          ) : projects.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0', backgroundColor: C.card, border: `1px solid ${C.border}`, borderRadius: '20px' }}>
              <Handshake size={48} color={C.muted2} style={{ marginBottom: '12px' }} />
              <p style={{ color: C.text, fontSize: '16px', fontWeight: '700', margin: '0 0 4px' }}>No linked projects yet</p>
              <p style={{ color: C.muted, fontSize: '13px' }}>Your account manager will attach your projects shortly.</p>
            </div>
          ) : projects.map(proj => {
            const milestones = [
              { name: 'Planning & Strategy', done: proj.progress >= 20 },
              { name: 'UI/UX & Wireframes',  done: proj.progress >= 40 },
              { name: 'Development Phase',   done: proj.progress >= 70 },
              { name: 'Testing & QA',        done: proj.progress >= 90 },
              { name: 'Final Launch',        done: proj.progress >= 100 },
            ];

            return (
              <div key={proj.id} style={{ backgroundColor: C.card, border: `1px solid ${C.border}`, borderRadius: '20px', padding: '28px', marginBottom: '24px' }}>

                {/* Project Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                  <div>
                    <span style={{ backgroundColor: 'rgba(78,155,255,0.1)', color: C.blue, fontSize: '11px', fontWeight: '800', padding: '3px 10px', borderRadius: '20px' }}>
                      {proj.service_type || 'Custom Service'}
                    </span>
                    <h3 style={{ color: C.text, fontSize: '18px', fontWeight: '800', margin: '8px 0 4px' }}>{proj.name}</h3>
                    <p style={{ color: C.muted, fontSize: '12.5px', margin: 0 }}>{proj.description || 'Live development track'}</p>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <span style={{ backgroundColor: proj.status === 'Completed' ? 'rgba(0,214,143,0.1)' : 'rgba(255,184,0,0.1)', color: proj.status === 'Completed' ? C.green : C.orange, fontSize: '11.5px', fontWeight: '800', padding: '4px 12px', borderRadius: '20px' }}>
                      {proj.status}
                    </span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div style={{ marginBottom: '24px', backgroundColor: C.card2, padding: '20px', borderRadius: '16px', border: `1px solid ${C.border}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ color: C.muted, fontSize: '12px', fontWeight: '700' }}>Overall Progress</span>
                    <span style={{ color: C.green, fontSize: '16px', fontWeight: '900' }}>{proj.progress}%</span>
                  </div>
                  <div style={{ height: '10px', borderRadius: '99px', backgroundColor: C.card3, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${proj.progress}%`, background: `linear-gradient(90deg, ${C.greenDark}, ${C.green})`, borderRadius: '99px', transition: 'width 0.6s' }} />
                  </div>
                </div>

                {/* Milestones Tracker */}
                <div style={{ marginBottom: '20px' }}>
                  <h4 style={{ color: C.text, fontSize: '13.5px', fontWeight: '700', marginBottom: '12px' }}>Project Milestones</h4>
                  <div className="kpi-grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px' }}>
                    {milestones.map((m, idx) => (
                      <div key={m.name} style={{ backgroundColor: m.done ? 'rgba(0,214,143,0.08)' : C.card2, border: `1px solid ${m.done ? C.green : C.border}`, borderRadius: '10px', padding: '10px', textAlign: 'center' }}>
                        <CheckCircle2 size={16} color={m.done ? C.green : C.muted2} style={{ marginBottom: '4px' }} />
                        <p style={{ color: m.done ? C.text : C.muted, fontSize: '11px', fontWeight: '700', margin: 0, lineHeight: 1.2 }}>{m.name}</p>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            );
          })}

          {/* Feedback & Manager Contact Box */}
          <div style={{ backgroundColor: C.card, border: `1px solid ${C.border}`, borderRadius: '20px', padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
              <MessageSquare size={18} color={C.green} />
              <h3 style={{ color: C.text, fontSize: '15px', fontWeight: '800', margin: 0 }}>Send Direct Feedback</h3>
            </div>
            <p style={{ color: C.muted, fontSize: '12.5px', margin: '0 0 14px' }}>Need revisions or have questions? Send a direct message to your assigned agency manager.</p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <input
                placeholder="Type your message or request..."
                value={feedback}
                onChange={e => setFeedback(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSendFeedback()}
                style={{ flex: 1, padding: '11px 14px', backgroundColor: C.card2, border: `1px solid ${C.border}`, borderRadius: '10px', color: C.text, fontSize: '13px', outline: 'none', fontFamily: 'inherit' }}
              />
              <button onClick={handleSendFeedback} className="btn-glow" style={{ padding: '11px 20px', backgroundColor: C.green, color: '#0A0A12', border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: '800', cursor: 'pointer', fontFamily: 'inherit' }}>
                Send Feedback
              </button>
            </div>
          </div>

        </main>
      </div>
    </>
  );
}