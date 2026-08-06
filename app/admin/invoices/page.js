'use client';
import { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { FileText, Plus, Trash2, Eye, Edit2, X, Check, DollarSign, Clock, CheckCircle, AlertCircle, Send, Download } from 'lucide-react';

import { C } from '../../lib/colors';

const inp = {
  width: '100%', padding: '10px 14px', borderRadius: '10px',
  border: `1px solid ${C.border}`, backgroundColor: C.card2,
  color: C.text, fontSize: '13px', outline: 'none', boxSizing: 'border-box',
};

const STATUS_CONFIG = {
  Draft: { color: C.muted, bg: 'rgba(138,138,163,0.12)' },
  Sent: { color: C.blue, bg: 'rgba(78,155,255,0.12)' },
  Paid: { color: C.green, bg: 'rgba(0,214,143,0.12)' },
  Overdue: { color: C.red, bg: 'rgba(255,107,107,0.12)' },
  Cancelled: { color: C.muted2, bg: 'rgba(90,90,114,0.12)' },
};

const EMPTY_ITEM = { description: '', quantity: 1, unit_price: 0, total: 0 };

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [viewModal, setViewModal] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [editId, setEditId] = useState(null);

  const [form, setForm] = useState({
    client_name: '', project_id: '', due_date: '', notes: '', status: 'Draft',
    items: [{ ...EMPTY_ITEM }],
  });

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [inv, proj] = await Promise.all([
        fetch('https://zeex-digital-production.up.railway.app/api/invoices').then(r => r.json()),
        fetch('https://zeex-digital-production.up.railway.app/api/projects').then(r => r.json()),
      ]);
      setInvoices(Array.isArray(inv) ? inv : []);
      setProjects(Array.isArray(proj) ? proj : []);
    } catch { }
    setLoading(false);
  };

  const openCreate = () => {
    setEditId(null);
    setForm({ client_name: '', project_id: '', due_date: '', notes: '', status: 'Draft', items: [{ ...EMPTY_ITEM }] });
    setShowModal(true);
  };

  const openEdit = async (inv) => {
    try {
      const full = await fetch(`https://zeex-digital-production.up.railway.app/api/invoices/${inv.id}`).then(r => r.json());
      setEditId(inv.id);
      setForm({
        client_name: full.client_name || '',
        project_id: full.project_id || '',
        due_date: full.due_date ? full.due_date.split('T')[0] : '',
        notes: full.notes || '',
        status: full.status || 'Draft',
        items: full.items?.length ? full.items : [{ ...EMPTY_ITEM }],
      });
      setShowModal(true);
    } catch { }
  };

  const handleItemChange = (i, field, val) => {
    setForm(f => {
      const items = [...f.items];
      items[i] = { ...items[i], [field]: val };
      items[i].total = parseFloat(items[i].quantity || 0) * parseFloat(items[i].unit_price || 0);
      return { ...f, items };
    });
  };

  const addItem = () => setForm(f => ({ ...f, items: [...f.items, { ...EMPTY_ITEM }] }));
  const removeItem = (i) => setForm(f => ({ ...f, items: f.items.filter((_, idx) => idx !== i) }));

  const total = form.items.reduce((s, it) => s + parseFloat(it.quantity || 0) * parseFloat(it.unit_price || 0), 0);

  const handleSave = async () => {
    if (!form.client_name) return;
    const url = editId ? `https://zeex-digital-production.up.railway.app/api/invoices/${editId}` : 'https://zeex-digital-production.up.railway.app/api/invoices';
    const method = editId ? 'PUT' : 'POST';
    try {
      await fetch(url, {
        method, headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, project_id: form.project_id || null }),
      });
      setShowModal(false);
      fetchAll();
    } catch { }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this invoice?')) return;
    await fetch(`https://zeex-digital-production.up.railway.app/api/invoices/${id}`, { method: 'DELETE' });
    fetchAll();
  };

  const handleMarkPaid = async (inv) => {
    await fetch(`https://zeex-digital-production.up.railway.app/api/invoices/${inv.id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...inv, status: 'Paid', items: [] }),
    });
    fetchAll();
  };

  const filtered = invoices.filter(i => !statusFilter || i.status === statusFilter);

  const kpis = {
    total: invoices.reduce((s, i) => s + parseFloat(i.computed_amount || i.amount || 0), 0),
    paid: invoices.filter(i => i.status === 'Paid').reduce((s, i) => s + parseFloat(i.computed_amount || i.amount || 0), 0),
    pending: invoices.filter(i => ['Sent', 'Draft'].includes(i.status)).reduce((s, i) => s + parseFloat(i.computed_amount || i.amount || 0), 0),
    overdue: invoices.filter(i => i.status === 'Overdue').length,
  };

  return (
    <AdminLayout title="Invoices">
      <style>{`
        .inv-row:hover { background: rgba(255,255,255,0.03) !important; }
        .fade-in { animation: fadeIn 0.35s ease; }
        @keyframes fadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        input[type=number]::-webkit-inner-spin-button { opacity: 0.5; }
      `}</style>

      {/* KPI Cards */}
      <div className="kpi-grid-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '16px', marginBottom: '24px' }}>
        {[
          { label: 'Total Invoiced', value: `$${parseFloat(kpis.total).toLocaleString('en-US', { minimumFractionDigits: 0 })}`, icon: DollarSign, color: C.blue },
          { label: 'Paid', value: `$${parseFloat(kpis.paid).toLocaleString('en-US', { minimumFractionDigits: 0 })}`, icon: CheckCircle, color: C.green },
          { label: 'Pending', value: `$${parseFloat(kpis.pending).toLocaleString('en-US', { minimumFractionDigits: 0 })}`, icon: Clock, color: C.orange },
          { label: 'Overdue', value: kpis.overdue, icon: AlertCircle, color: C.red },
        ].map((k, i) => (
          <div key={i} style={{ backgroundColor: C.card, border: `1px solid ${C.border}`, borderRadius: '16px', padding: '20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: '46px', height: '46px', borderRadius: '12px', backgroundColor: `${k.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <k.icon size={20} color={k.color} />
            </div>
            <div>
              <p style={{ color: C.muted, fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 4px' }}>{k.label}</p>
              <p style={{ color: C.text, fontSize: '22px', fontWeight: '800', margin: 0 }}>{loading ? '…' : k.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div style={{ backgroundColor: C.card, border: `1px solid ${C.border}`, borderRadius: '16px', overflow: 'hidden' }}>
        <div style={{ padding: '18px 24px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <p style={{ color: C.text, fontSize: '15px', fontWeight: '700', margin: 0 }}>All Invoices</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {/* Status filter pills */}
            {['', 'Draft', 'Sent', 'Paid', 'Overdue', 'Cancelled'].map(s => (
              <button key={s} onClick={() => setStatusFilter(s)}
                style={{
                  padding: '6px 14px', borderRadius: '99px', fontSize: '12px', fontWeight: '600', cursor: 'pointer',
                  border: statusFilter === s ? 'none' : `1px solid ${C.border}`,
                  backgroundColor: statusFilter === s ? C.green : 'transparent',
                  color: statusFilter === s ? '#0A0A12' : C.muted,
                  transition: 'all 0.15s',
                }}>
                {s || 'All'}
              </button>
            ))}
            <button onClick={openCreate} style={{
              display: 'flex', alignItems: 'center', gap: '7px', padding: '9px 16px',
              backgroundColor: C.green, color: '#0A0A12', border: 'none',
              borderRadius: '10px', cursor: 'pointer', fontSize: '13px', fontWeight: '700',
            }}>
              <Plus size={15} /> New Invoice
            </button>
          </div>
        </div>

        <div className="table-responsive">
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                {['Invoice #', 'Client', 'Project', 'Amount', 'Status', 'Due Date', 'Actions'].map(h => (
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
                    <FileText size={36} color={C.muted2} style={{ marginBottom: '12px' }} />
                    <p style={{ color: C.muted, fontSize: '14px', margin: '0 0 16px' }}>No invoices yet.</p>
                    <button onClick={openCreate} style={{ padding: '10px 20px', backgroundColor: C.green, color: '#0A0A12', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '700', fontSize: '13px' }}>Create First Invoice</button>
                  </div>
                </td></tr>
              ) : filtered.map(inv => {
                const s = STATUS_CONFIG[inv.status] || STATUS_CONFIG.Draft;
                const isOverdue = inv.due_date && new Date(inv.due_date) < new Date() && inv.status !== 'Paid';
                return (
                  <tr key={inv.id} className="inv-row" style={{ borderBottom: `1px solid ${C.border}`, transition: 'background 0.15s' }}>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{ color: C.text, fontWeight: '700', fontSize: '13px', fontFamily: 'monospace' }}>{inv.invoice_number}</span>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{ color: C.text2, fontSize: '13px', fontWeight: '600' }}>{inv.client_name}</span>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{ color: C.muted, fontSize: '12px' }}>{inv.project_name || '—'}</span>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{ color: C.green, fontSize: '14px', fontWeight: '800' }}>
                        ${parseFloat(inv.computed_amount || inv.amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{ padding: '4px 10px', borderRadius: '99px', fontSize: '11px', fontWeight: '700', backgroundColor: s.bg, color: s.color }}>
                        {inv.status}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{ color: isOverdue ? C.red : C.muted, fontSize: '12px', fontWeight: isOverdue ? '700' : '400' }}>
                        {inv.due_date ? new Date(inv.due_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <button onClick={() => setViewModal(inv)} title="View & Print"
                          style={{ padding: '6px', backgroundColor: 'transparent', color: C.primary, border: 'none', cursor: 'pointer', borderRadius: '7px', display: 'flex' }}>
                          <Eye size={14} />
                        </button>
                        {inv.status !== 'Paid' && (
                          <button onClick={() => handleMarkPaid(inv)} title="Mark as Paid"
                            style={{ padding: '5px 10px', backgroundColor: `${C.green}18`, color: C.green, border: 'none', borderRadius: '7px', cursor: 'pointer', fontSize: '11px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Check size={12} /> Paid
                          </button>
                        )}
                        <button onClick={() => openEdit(inv)} title="Edit"
                          style={{ padding: '6px', backgroundColor: 'transparent', color: C.muted, border: 'none', cursor: 'pointer', borderRadius: '7px', display: 'flex' }}>
                          <Edit2 size={14} />
                        </button>
                        <button onClick={() => handleDelete(inv.id)} title="Delete"
                          style={{ padding: '6px', backgroundColor: 'transparent', color: C.muted, border: 'none', cursor: 'pointer', borderRadius: '7px', display: 'flex' }}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.75)', zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)', overflowY: 'auto', padding: '20px' }}>
          <div className="fade-in" style={{ backgroundColor: C.card, border: `1px solid ${C.border}`, borderRadius: '20px', padding: '28px', width: '600px', maxWidth: '100%', boxShadow: '0 24px 64px rgba(0,0,0,0.5)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: `${C.blue}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FileText size={18} color={C.blue} />
                </div>
                <p style={{ color: C.text, fontSize: '16px', fontWeight: '800', margin: 0 }}>{editId ? 'Edit Invoice' : 'New Invoice'}</p>
              </div>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.muted }}><X size={20} /></button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ color: C.muted, fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '6px' }}>Client Name *</label>
                  <input value={form.client_name} onChange={e => setForm(f => ({ ...f, client_name: e.target.value }))} placeholder="e.g. Acme Corp" style={inp} />
                </div>
                <div>
                  <label style={{ color: C.muted, fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '6px' }}>Project</label>
                  <select value={form.project_id} onChange={e => setForm(f => ({ ...f, project_id: e.target.value }))} style={inp}>
                    <option value="">No project</option>
                    {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ color: C.muted, fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '6px' }}>Due Date</label>
                  <input type="date" value={form.due_date} onChange={e => setForm(f => ({ ...f, due_date: e.target.value }))} style={inp} />
                </div>
                <div>
                  <label style={{ color: C.muted, fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '6px' }}>Status</label>
                  <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} style={inp}>
                    {Object.keys(STATUS_CONFIG).map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              {/* Line Items */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <label style={{ color: C.muted, fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Line Items</label>
                  <button onClick={addItem} style={{ padding: '4px 10px', backgroundColor: `${C.blue}18`, color: C.blue, border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '11px', fontWeight: '700' }}>+ Add Item</button>
                </div>
                <div style={{ backgroundColor: C.card2, borderRadius: '12px', overflow: 'hidden', border: `1px solid ${C.border}` }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                        {['Description', 'Qty', 'Unit Price', 'Total', ''].map(h => (
                          <th key={h} style={{ padding: '8px 10px', textAlign: 'left', color: C.muted, fontSize: '10px', fontWeight: '700', textTransform: 'uppercase' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {form.items.map((it, i) => (
                        <tr key={i} style={{ borderBottom: i < form.items.length - 1 ? `1px solid ${C.border}` : 'none' }}>
                          <td style={{ padding: '6px 8px' }}>
                            <input value={it.description} onChange={e => handleItemChange(i, 'description', e.target.value)}
                              placeholder="Service description" style={{ ...inp, padding: '7px 10px', fontSize: '12px', backgroundColor: 'transparent', border: 'none' }} />
                          </td>
                          <td style={{ padding: '6px 8px', width: '60px' }}>
                            <input type="number" min="0" step="0.5" value={it.quantity} onChange={e => handleItemChange(i, 'quantity', e.target.value)}
                              style={{ ...inp, padding: '7px 10px', fontSize: '12px', width: '60px', backgroundColor: 'transparent', border: 'none' }} />
                          </td>
                          <td style={{ padding: '6px 8px', width: '100px' }}>
                            <input type="number" min="0" step="1" value={it.unit_price} onChange={e => handleItemChange(i, 'unit_price', e.target.value)}
                              style={{ ...inp, padding: '7px 10px', fontSize: '12px', width: '100px', backgroundColor: 'transparent', border: 'none' }} />
                          </td>
                          <td style={{ padding: '6px 10px', width: '80px', color: C.green, fontWeight: '700', fontSize: '13px', whiteSpace: 'nowrap' }}>
                            ${(parseFloat(it.quantity || 0) * parseFloat(it.unit_price || 0)).toFixed(2)}
                          </td>
                          <td style={{ padding: '6px 8px', width: '30px' }}>
                            {form.items.length > 1 && (
                              <button onClick={() => removeItem(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.muted, padding: '2px' }}>
                                <X size={13} />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div style={{ padding: '10px 16px', borderTop: `1px solid ${C.border}`, display: 'flex', justifyContent: 'flex-end' }}>
                    <span style={{ color: C.text, fontWeight: '800', fontSize: '15px' }}>Total: <span style={{ color: C.green }}>${total.toFixed(2)}</span></span>
                  </div>
                </div>
              </div>

              <div>
                <label style={{ color: C.muted, fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '6px' }}>Notes</label>
                <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                  rows={2} placeholder="Payment terms, bank details, etc." style={{ ...inp, resize: 'vertical', fontFamily: 'inherit' }} />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
                <button onClick={() => setShowModal(false)} style={{ flex: 1, padding: '11px', backgroundColor: C.card2, color: C.muted, border: `1px solid ${C.border}`, borderRadius: '10px', cursor: 'pointer', fontSize: '13px', fontWeight: '700' }}>Cancel</button>
                <button onClick={handleSave} style={{ flex: 2, padding: '11px', backgroundColor: C.blue, color: '#fff', border: 'none', borderRadius: '10px', cursor: 'pointer', fontSize: '13px', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                  <Check size={15} /> {editId ? 'Save Changes' : 'Create Invoice'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Print-Ready Invoice Modal */}
      {viewModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', overflowY: 'auto' }}>
          <div style={{ backgroundColor: '#FFF', borderRadius: '8px', width: '800px', maxWidth: '100%', minHeight: '80vh', position: 'relative', display: 'flex', flexDirection: 'column' }}>
            {/* Modal Actions (No Print) */}
            <div style={{ padding: '16px 24px', backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTopLeftRadius: '8px', borderTopRightRadius: '8px' }}>
              <span style={{ fontWeight: 'bold', color: '#1E293B', fontSize: '16px' }}>Invoice Preview</span>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button onClick={() => {
                  const el = document.getElementById('printable-invoice');
                  import('html2pdf.js').then((module) => {
                    const html2pdf = module.default;
                    html2pdf().set({
                      margin: 0,
                      filename: `invoice_${viewModal.invoice_number}.pdf`,
                      image: { type: 'jpeg', quality: 0.98 },
                      html2canvas: { scale: 2, useCORS: true },
                      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
                    }).from(el).save();
                  });
                }} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', backgroundColor: '#10B981', color: '#FFF', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
                  <Download size={16} /> Download PDF
                </button>
                <button onClick={() => window.print()} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', backgroundColor: C.blue, color: '#FFF', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
                  <FileText size={16} /> Print Invoice
                </button>
                <button onClick={() => setViewModal(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}><X size={24} /></button>
              </div>
            </div>

            {/* Printable Area */}
            <div id="printable-invoice" style={{ padding: '40px 48px', color: '#0F172A', backgroundColor: '#FFF', flex: 1, fontFamily: "'Inter', sans-serif" }}>
              <style>{`
                @media print {
                  body * { visibility: hidden; }
                  #printable-invoice, #printable-invoice * { visibility: visible; }
                  #printable-invoice { position: absolute; left: 0; top: 0; width: 100%; height: 100%; padding: 20px; }
                  @page { margin: 0; }
                }
              `}</style>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '40px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: '#0F172A', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#00F0FF', fontWeight: '900', fontSize: '20px' }}>Z</div>
                    <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '900', letterSpacing: '-0.5px' }}>ZEEX DIGITAL</h1>
                  </div>
                  <p style={{ margin: '4px 0', fontSize: '14px', color: '#475569' }}>123 Tech Avenue</p>
                  <p style={{ margin: '4px 0', fontSize: '14px', color: '#475569' }}>Innovation City, TX 75001</p>
                  <p style={{ margin: '4px 0', fontSize: '14px', color: '#475569' }}>hello@zeexdigital.com</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <h2 style={{ margin: '0 0 8px', fontSize: '32px', fontWeight: '900', color: '#0F172A', textTransform: 'uppercase' }}>Invoice</h2>
                  <p style={{ margin: '4px 0', fontSize: '14px', fontWeight: 'bold' }}>#{viewModal.invoice_number}</p>
                  <p style={{ margin: '4px 0', fontSize: '14px', color: '#475569' }}>Date: {new Date(viewModal.created_at || Date.now()).toLocaleDateString()}</p>
                  <p style={{ margin: '4px 0', fontSize: '14px', color: '#475569' }}>Due: {viewModal.due_date ? new Date(viewModal.due_date).toLocaleDateString() : 'Upon receipt'}</p>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '40px', padding: '20px', backgroundColor: '#F8FAFC', borderRadius: '8px' }}>
                <div>
                  <p style={{ margin: '0 0 8px', fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', color: '#64748B' }}>Billed To</p>
                  <p style={{ margin: '0 0 4px', fontSize: '16px', fontWeight: 'bold' }}>{viewModal.client_name}</p>
                  {viewModal.project_name && <p style={{ margin: '0', fontSize: '14px', color: '#475569' }}>Project: {viewModal.project_name}</p>}
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ margin: '0 0 8px', fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', color: '#64748B' }}>Amount Due</p>
                  <p style={{ margin: '0', fontSize: '24px', fontWeight: '900', color: C.blue }}>
                    ${parseFloat(viewModal.computed_amount || viewModal.amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>
              </div>

              <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '40px' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #E2E8F0' }}>
                    <th style={{ padding: '12px 8px', textAlign: 'left', fontSize: '12px', textTransform: 'uppercase', color: '#64748B' }}>Description</th>
                    <th style={{ padding: '12px 8px', textAlign: 'center', fontSize: '12px', textTransform: 'uppercase', color: '#64748B' }}>Qty</th>
                    <th style={{ padding: '12px 8px', textAlign: 'right', fontSize: '12px', textTransform: 'uppercase', color: '#64748B' }}>Price</th>
                    <th style={{ padding: '12px 8px', textAlign: 'right', fontSize: '12px', textTransform: 'uppercase', color: '#64748B' }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {(viewModal.items || []).map((it, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <td style={{ padding: '16px 8px', fontSize: '14px', fontWeight: '500' }}>{it.description}</td>
                      <td style={{ padding: '16px 8px', textAlign: 'center', fontSize: '14px', color: '#475569' }}>{it.quantity}</td>
                      <td style={{ padding: '16px 8px', textAlign: 'right', fontSize: '14px', color: '#475569' }}>${parseFloat(it.unit_price).toFixed(2)}</td>
                      <td style={{ padding: '16px 8px', textAlign: 'right', fontSize: '14px', fontWeight: 'bold' }}>${(it.quantity * it.unit_price).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ width: '50%' }}>
                  {viewModal.notes && (
                    <>
                      <p style={{ margin: '0 0 8px', fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', color: '#64748B' }}>Notes / Terms</p>
                      <p style={{ margin: 0, fontSize: '13px', color: '#475569', lineHeight: '1.6' }}>{viewModal.notes}</p>
                    </>
                  )}
                </div>
                <div style={{ width: '300px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #E2E8F0' }}>
                    <span style={{ fontSize: '14px', color: '#475569' }}>Subtotal</span>
                    <span style={{ fontSize: '14px', fontWeight: 'bold' }}>${parseFloat(viewModal.computed_amount || viewModal.amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px 0', borderBottom: '2px solid #0F172A' }}>
                    <span style={{ fontSize: '16px', fontWeight: 'bold' }}>Total</span>
                    <span style={{ fontSize: '16px', fontWeight: 'bold' }}>${parseFloat(viewModal.computed_amount || viewModal.amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
