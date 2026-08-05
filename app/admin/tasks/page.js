'use client';
import { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import {
  CheckSquare, Plus, Trash2, CalendarDays, X, MessageSquare, ListChecks,
  Search, AlertCircle, Clock, CheckCircle2, User, FolderKanban, Filter
} from 'lucide-react';
import AdminLayout from '../../components/AdminLayout';
import { toast } from '../../components/Toast';

const C = {
  bg: '#030712', bg2: '#080E1E', card: '#0C1327', card2: '#121C38', card3: '#18264B',
  border: '#1E2D56', border2: '#2A3F75',
  primary: '#00F0FF', primaryDark: '#0072FF', primaryLight: '#38BDF8',
  green: '#00E599', greenDark: '#00B377',
  blue: '#0072FF', orange: '#FF9900', red: '#FF4757', purple: '#9D4EDD',
  muted: '#64748B', muted2: '#334155', text: '#F1F5F9', text2: '#94A3B8',
};

const COLUMNS = [
  { key: 'Pending',      label: 'Pending',      color: C.muted,  bg: 'rgba(138,138,163,0.1)' },
  { key: 'In Progress',  label: 'In Progress',  color: C.blue,   bg: 'rgba(78,155,255,0.1)'  },
  { key: 'Under Review', label: 'Under Review', color: C.orange, bg: 'rgba(255,184,0,0.1)'   },
  { key: 'Completed',    label: 'Completed',    color: C.green,  bg: 'rgba(0,214,143,0.1)'   },
  { key: 'Blocked',      label: 'Blocked',      color: C.red,    bg: 'rgba(255,107,107,0.1)'  },
];

const PRIORITY_COLORS = {
  Urgent: C.red,
  High:   C.orange,
  Medium: C.blue,
  Low:    C.green,
};

const daysLeft = (d) => d ? Math.ceil((new Date(d) - Date.now()) / 86400000) : null;

export default function Tasks() {
  const [tasks,      setTasks]      = useState([]);
  const [members,    setMembers]    = useState([]);
  const [projects,   setProjects]   = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [showForm,   setShowForm]   = useState(false);
  const [newTask,    setNewTask]    = useState({ name: '', member_id: '', project_id: '', priority: 'Medium', due_date: '' });
  const [draggedTask,setDraggedTask]= useState(null);
  const [dragOverCol,setDragOverCol]= useState(null);
  const [search,     setSearch]     = useState('');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [assigneeFilter, setAssigneeFilter] = useState('All');

  // Task detail modal state
  const [openTask,   setOpenTask]   = useState(null);
  const [subtasks,   setSubtasks]   = useState([]);
  const [comments,   setComments]   = useState([]);
  const [newSubtask, setNewSubtask] = useState('');
  const [newComment, setNewComment] = useState('');

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    try {
      const [tR, mR, pR] = await Promise.all([
        fetch('https://zeex-digital-production.up.railway.app/api/tasks'),
        fetch('https://zeex-digital-production.up.railway.app/api/members'),
        fetch('https://zeex-digital-production.up.railway.app/api/projects'),
      ]);
      setTasks(await tR.json());
      setMembers(await mR.json());
      setProjects(await pR.json());
    } catch { toast.error('Failed to load task board'); }
    setLoading(false);
  };

  const createTask = async () => {
    if (!newTask.name || !newTask.member_id) {
      toast.error('Task Name and Assigned Member are required!');
      return;
    }
    try {
      const res = await fetch('https://zeex-digital-production.up.railway.app/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTask),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Task created successfully!');
        setNewTask({ name: '', member_id: '', project_id: '', priority: 'Medium', due_date: '' });
        setShowForm(false);
        fetchAll();
      } else {
        toast.error(data.error || 'Failed to create task');
      }
    } catch { toast.error('Network error'); }
  };

  const updateStatus = async (id, status) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status } : t));
    try {
      const res = await fetch(`https://zeex-digital-production.up.railway.app/api/tasks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const d = await res.json();
      if (d.success) toast.success(`Task moved to ${status}`);
    } catch { fetchAll(); }
  };

  const deleteTask = async (id, name) => {
    if (!confirm(`Delete task "${name}"?`)) return;
    try {
      await fetch(`https://zeex-digital-production.up.railway.app/api/tasks/${id}`, { method: 'DELETE' });
      setTasks(prev => prev.filter(t => t.id !== id));
      if (openTask?.id === id) closeModal();
      toast.success('Task deleted');
    } catch { toast.error('Could not delete task'); }
  };

  // Drag and Drop handlers
  const onDragEnd = async (result) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const taskId = parseInt(draggableId, 10);
    const newStatus = destination.droppableId;
    const task = tasks.find(t => t.id === taskId);
    
    if (task && task.status !== newStatus) {
      updateStatus(taskId, newStatus);
    }
  };

  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  // Detail Modal Handlers
  const openTaskDetail = async (task) => {
    setOpenTask(task);
    try {
      const [sR, cR] = await Promise.all([
        fetch(`https://zeex-digital-production.up.railway.app/api/tasks/${task.id}/subtasks`),
        fetch(`https://zeex-digital-production.up.railway.app/api/tasks/${task.id}/comments`),
      ]);
      setSubtasks(await sR.json());
      setComments(await cR.json());
    } catch { toast.error('Failed to load task details'); }
  };

  const closeModal = () => {
    setOpenTask(null);
    setSubtasks([]); setComments([]);
    setNewSubtask(''); setNewComment('');
  };

  const addSubtask = async () => {
    if (!newSubtask.trim()) return;
    try {
      const res = await fetch(`https://zeex-digital-production.up.railway.app/api/tasks/${openTask.id}/subtasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: newSubtask.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        setSubtasks([...subtasks, data.subtask]);
        setNewSubtask('');
        toast.success('Subtask added');
      }
    } catch { toast.error('Failed to add subtask'); }
  };

  const toggleSubtask = async (sub) => {
    setSubtasks(subtasks.map(s => s.id === sub.id ? { ...s, done: !s.done } : s));
    try {
      await fetch(`https://zeex-digital-production.up.railway.app/api/subtasks/${sub.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ done: !sub.done }),
      });
    } catch { fetchAll(); }
  };

  const deleteSubtask = async (id) => {
    try {
      await fetch(`https://zeex-digital-production.up.railway.app/api/subtasks/${id}`, { method: 'DELETE' });
      setSubtasks(subtasks.filter(s => s.id !== id));
      toast.success('Subtask deleted');
    } catch { toast.error('Could not delete subtask'); }
  };

  const addComment = async () => {
    if (!newComment.trim()) return;
    try {
      const res = await fetch(`https://zeex-digital-production.up.railway.app/api/tasks/${openTask.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: newComment.trim(), author: 'Admin' }),
      });
      const data = await res.json();
      if (data.success) {
        setComments([...comments, data.comment]);
        setNewComment('');
        toast.success('Comment added');
      }
    } catch { toast.error('Failed to post comment'); }
  };

  const filteredTasks = tasks.filter(t => {
    const matchSearch   = !search || t.name?.toLowerCase().includes(search.toLowerCase()) || t.member_name?.toLowerCase().includes(search.toLowerCase()) || t.project_name?.toLowerCase().includes(search.toLowerCase());
    const matchPriority = priorityFilter === 'All' || t.priority === priorityFilter;
    const matchAssignee = assigneeFilter === 'All' || t.member_id?.toString() === assigneeFilter;
    return matchSearch && matchPriority && matchAssignee;
  });

  return (
    <AdminLayout title="Tasks Board">

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <h2 style={{ color: C.text, fontSize: '20px', fontWeight: '800', margin: 0 }}>Kanban Task Board</h2>
          <p style={{ color: C.muted, fontSize: '13px', margin: '4px 0 0 0' }}>Drag & drop tasks between columns</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-glow" style={{
          backgroundColor: C.green, color: '#0A0A12', padding: '11px 20px',
          borderRadius: '12px', fontSize: '13.5px', fontWeight: '800', border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: '6px', fontFamily: 'inherit',
        }}>
          <Plus size={16} strokeWidth={2.8} /> New Task
        </button>
      </div>

      {/* Controls Bar */}
      <div style={{ display: 'flex', gap: '14px', marginBottom: '22px', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative' }}>
          <Search size={13} color={C.muted} style={{ position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
          <input
            placeholder="Search tasks..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ padding: '9px 14px 9px 32px', borderRadius: '10px', border: `1px solid ${search ? C.green : C.border}`, backgroundColor: C.card2, color: C.text, fontSize: '13px', width: '220px', outline: 'none', fontFamily: 'inherit' }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Filter size={13} color={C.muted} />
          <span style={{ color: C.muted, fontSize: '12.5px', fontWeight: '600' }}>Priority:</span>
          {['All', 'Urgent', 'High', 'Medium', 'Low'].map(p => (
            <button key={p} onClick={() => setPriorityFilter(p)} style={{
              padding: '6px 14px', borderRadius: '20px', border: 'none', cursor: 'pointer',
              backgroundColor: priorityFilter === p ? (PRIORITY_COLORS[p] || C.green) : C.card,
              color: priorityFilter === p ? '#0A0A12' : C.muted,
              fontSize: '12px', fontWeight: priorityFilter === p ? '800' : '500',
              outline: priorityFilter === p ? 'none' : `1px solid ${C.border}`, fontFamily: 'inherit',
            }}>{p}</button>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <User size={13} color={C.muted} />
          <span style={{ color: C.muted, fontSize: '12.5px', fontWeight: '600' }}>Assignee:</span>
          <select
            value={assigneeFilter}
            onChange={e => setAssigneeFilter(e.target.value)}
            style={{
              padding: '7px 14px', borderRadius: '10px', border: `1px solid ${assigneeFilter !== 'All' ? C.green : C.border}`,
              backgroundColor: C.card2, color: C.text, fontSize: '12.5px', outline: 'none',
              fontFamily: 'inherit', cursor: 'pointer',
            }}
          >
            <option value="All">All Members</option>
            {members.map(m => (
              <option key={m.id} value={m.id.toString()}>{m.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Kanban Grid */}
      {loading || !mounted ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '14px' }}>
          {[0,1,2,3,4].map(i => <div key={i} className="skeleton" style={{ height: 400, borderRadius: 16 }} />)}
        </div>
      ) : (
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="kanban-board-scroll" style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '14px', alignItems: 'flex-start' }}>
            {COLUMNS.map(col => {
              const colTasks = filteredTasks.filter(t => t.status === col.key);
              return (
                <Droppable key={col.key} droppableId={col.key}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      style={{
                        backgroundColor: C.card,
                        border: `1.5px solid ${snapshot.isDraggingOver ? col.color : C.border}`,
                        borderRadius: '16px', padding: '16px', minHeight: '520px',
                        display: 'flex', flexDirection: 'column', gap: '12px',
                        boxShadow: snapshot.isDraggingOver ? `0 0 20px ${col.bg}` : 'none',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      {/* Column Header */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: `1px solid ${C.border}` }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ width: '9px', height: '9px', borderRadius: '50%', backgroundColor: col.color }} />
                          <span style={{ color: C.text, fontSize: '13.5px', fontWeight: '700' }}>{col.label}</span>
                        </div>
                        <span style={{ backgroundColor: col.bg, color: col.color, fontSize: '11px', fontWeight: '800', borderRadius: '20px', padding: '2px 8px' }}>
                          {colTasks.length}
                        </span>
                      </div>

                      {/* Cards */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
                        {colTasks.length === 0 ? (
                          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '120px', border: `1px dashed ${C.border}`, borderRadius: '12px', margin: '4px 0' }}>
                            <p style={{ color: C.muted2, fontSize: '12px' }}>Drop tasks here</p>
                          </div>
                        ) : colTasks.map((task, index) => {
                          const pColor = PRIORITY_COLORS[task.priority] || C.muted;
                          const d      = daysLeft(task.due_date);
                          const dColor = d !== null && d < 0 ? C.red : d !== null && d <= 2 ? C.orange : C.muted;
                          return (
                            <Draggable key={task.id.toString()} draggableId={task.id.toString()} index={index}>
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  onClick={() => openTaskDetail(task)}
                                  className="hover-lift"
                                  style={{
                                    backgroundColor: C.card2,
                                    border: `1px solid ${C.border}`,
                                    borderRadius: '12px', padding: '14px', cursor: 'pointer',
                                    position: 'relative',
                                    boxShadow: snapshot.isDragging ? '0 10px 20px rgba(0,0,0,0.5)' : 'none',
                                    ...provided.draggableProps.style,
                                  }}
                                >
                                  {/* Priority pill */}
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                    <span style={{ backgroundColor: `${pColor}15`, color: pColor, fontSize: '10px', fontWeight: '800', padding: '2px 8px', borderRadius: '20px' }}>
                                      {task.priority || 'Medium'}
                                    </span>
                                    <button
                                      onClick={(e) => { e.stopPropagation(); deleteTask(task.id, task.name); }}
                                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.muted, padding: '2px' }}
                                      onMouseEnter={e => e.currentTarget.style.color = C.red}
                                      onMouseLeave={e => e.currentTarget.style.color = C.muted}
                                    >
                                      <Trash2 size={12} />
                                    </button>
                                  </div>

                                  {/* Title */}
                                  <h4 style={{ color: C.text, fontSize: '13px', fontWeight: '700', margin: '0 0 6px 0', lineHeight: 1.35 }}>
                                    {task.name}
                                  </h4>

                                  {/* Project Name */}
                                  {task.project_name && (
                                    <p style={{ color: C.blue, fontSize: '11px', margin: '0 0 10px 0', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                      <FolderKanban size={10} /> {task.project_name}
                                    </p>
                                  )}

                                  {/* Footer */}
                                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '8px', borderTop: `1px solid ${C.border}` }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                      <div style={{ width: '22px', height: '22px', borderRadius: '50%', backgroundColor: C.green, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0A0A12', fontWeight: '800', fontSize: '10px' }}>
                                        {(task.member_name || 'U')[0].toUpperCase()}
                                      </div>
                                      <span style={{ color: C.muted, fontSize: '11px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '80px' }}>
                                        {task.member_name || 'Unassigned'}
                                      </span>
                                    </div>

                                    {task.due_date && (
                                      <span style={{ color: dColor, fontSize: '10.5px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '3px' }}>
                                        <CalendarDays size={10} /> {d < 0 ? `${Math.abs(d)}d ago` : d === 0 ? 'Today' : `${d}d`}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              )}
                            </Draggable>
                          );
                        })}
                        {provided.placeholder}
                      </div>
                    </div>
                  )}
                </Droppable>
              );
            })}
          </div>
        </DragDropContext>
      )}

      {/* ── CREATE TASK MODAL ─────────────────────────── */}
      {showForm && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
          <div style={{ backgroundColor: C.card, border: `1px solid ${C.border}`, borderRadius: '18px', padding: '28px', maxWidth: '440px', width: '100%', boxShadow: '0 20px 50px rgba(0,0,0,0.6)' }} className="fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ color: C.text, fontSize: '17px', fontWeight: '800', margin: 0 }}>Create New Task</h3>
              <X size={18} color={C.muted} style={{ cursor: 'pointer' }} onClick={() => setShowForm(false)} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ color: C.muted, fontSize: '11.5px', fontWeight: '700', display: 'block', marginBottom: '6px' }}>TASK NAME *</label>
                <input
                  placeholder="e.g. Design Homepage Wireframe"
                  value={newTask.name}
                  onChange={e => setNewTask({ ...newTask, name: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', backgroundColor: C.card2, border: `1px solid ${C.border}`, borderRadius: '10px', color: C.text, fontSize: '13.5px', outline: 'none', fontFamily: 'inherit' }}
                />
              </div>

              <div>
                <label style={{ color: C.muted, fontSize: '11.5px', fontWeight: '700', display: 'block', marginBottom: '6px' }}>ASSIGN TO MEMBER *</label>
                <select
                  value={newTask.member_id}
                  onChange={e => setNewTask({ ...newTask, member_id: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', backgroundColor: C.card2, border: `1px solid ${C.border}`, borderRadius: '10px', color: C.text, fontSize: '13.5px', outline: 'none', fontFamily: 'inherit' }}
                >
                  <option value="">Select Member...</option>
                  {members.map(m => <option key={m.id} value={m.id}>{m.name} ({m.department || 'Member'})</option>)}
                </select>
              </div>

              <div>
                <label style={{ color: C.muted, fontSize: '11.5px', fontWeight: '700', display: 'block', marginBottom: '6px' }}>PROJECT (OPTIONAL)</label>
                <select
                  value={newTask.project_id}
                  onChange={e => setNewTask({ ...newTask, project_id: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', backgroundColor: C.card2, border: `1px solid ${C.border}`, borderRadius: '10px', color: C.text, fontSize: '13.5px', outline: 'none', fontFamily: 'inherit' }}
                >
                  <option value="">Select Project...</option>
                  {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ color: C.muted, fontSize: '11.5px', fontWeight: '700', display: 'block', marginBottom: '6px' }}>PRIORITY</label>
                  <select
                    value={newTask.priority}
                    onChange={e => setNewTask({ ...newTask, priority: e.target.value })}
                    style={{ width: '100%', padding: '10px 14px', backgroundColor: C.card2, border: `1px solid ${C.border}`, borderRadius: '10px', color: C.text, fontSize: '13.5px', outline: 'none', fontFamily: 'inherit' }}
                  >
                    <option value="Urgent">Urgent</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
                <div>
                  <label style={{ color: C.muted, fontSize: '11.5px', fontWeight: '700', display: 'block', marginBottom: '6px' }}>DUE DATE</label>
                  <input
                    type="date"
                    value={newTask.due_date}
                    onChange={e => setNewTask({ ...newTask, due_date: e.target.value })}
                    style={{ width: '100%', padding: '10px 14px', backgroundColor: C.card2, border: `1px solid ${C.border}`, borderRadius: '10px', color: C.text, fontSize: '13.5px', outline: 'none', fontFamily: 'inherit' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button onClick={createTask} className="btn-glow" style={{ flex: 1, padding: '12px', backgroundColor: C.green, color: '#0A0A12', border: 'none', borderRadius: '10px', fontSize: '13.5px', fontWeight: '800', cursor: 'pointer', fontFamily: 'inherit' }}>
                  Create Task
                </button>
                <button onClick={() => setShowForm(false)} style={{ padding: '12px 18px', backgroundColor: 'transparent', color: C.muted, border: `1px solid ${C.border}`, borderRadius: '10px', fontSize: '13.5px', cursor: 'pointer', fontFamily: 'inherit' }}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TASK DETAIL MODAL ─────────────────────────── */}
      {openTask && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.75)', zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
          <div style={{ backgroundColor: C.card, border: `1px solid ${C.border}`, borderRadius: '20px', padding: '28px', maxWidth: '640px', width: '100%', maxHeight: '85vh', overflowY: 'auto', boxShadow: '0 20px 50px rgba(0,0,0,0.7)' }} className="fade-in">

            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '18px' }}>
              <div>
                <span style={{ backgroundColor: `${PRIORITY_COLORS[openTask.priority] || C.muted}20`, color: PRIORITY_COLORS[openTask.priority] || C.muted, fontSize: '11px', fontWeight: '800', padding: '3px 10px', borderRadius: '20px' }}>
                  {openTask.priority || 'Medium'} Priority
                </span>
                <h3 style={{ color: C.text, fontSize: '18px', fontWeight: '800', margin: '8px 0 4px 0' }}>{openTask.name}</h3>
                <p style={{ color: C.muted, fontSize: '12.5px', margin: 0 }}>
                  Assigned to <span style={{ color: C.green, fontWeight: '700' }}>{openTask.member_name || 'Unassigned'}</span>
                  {openTask.project_name && <> in project <span style={{ color: C.blue, fontWeight: '700' }}>{openTask.project_name}</span></>}
                </p>
              </div>
              <X size={20} color={C.muted} style={{ cursor: 'pointer' }} onClick={closeModal} />
            </div>

            {/* Subtasks Section */}
            <div style={{ marginBottom: '24px', backgroundColor: C.card2, borderRadius: '14px', padding: '18px', border: `1px solid ${C.border}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                <ListChecks size={16} color={C.green} />
                <h4 style={{ color: C.text, fontSize: '14px', fontWeight: '700', margin: 0 }}>
                  Subtasks ({subtasks.filter(s => s.done).length}/{subtasks.length})
                </h4>
              </div>

              {/* Progress bar */}
              <div style={{ height: '5px', borderRadius: '99px', backgroundColor: C.card3, overflow: 'hidden', marginBottom: '14px' }}>
                <div style={{ height: '100%', width: subtasks.length > 0 ? `${(subtasks.filter(s=>s.done).length / subtasks.length)*100}%` : '0%', backgroundColor: C.green, borderRadius: '99px', transition: 'width 0.3s' }} />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
                {subtasks.map(sub => (
                  <div key={sub.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', backgroundColor: C.card3, borderRadius: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }} onClick={() => toggleSubtask(sub)}>
                      <span style={{ width: '18px', height: '18px', borderRadius: '5px', border: `2px solid ${sub.done ? C.green : C.muted}`, backgroundColor: sub.done ? C.green : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {sub.done && <CheckCircle2 size={12} color="#0A0A12" />}
                      </span>
                      <span style={{ color: sub.done ? C.muted : C.text, fontSize: '13px', textDecoration: sub.done ? 'line-through' : 'none' }}>{sub.text}</span>
                    </div>
                    <button onClick={() => deleteSubtask(sub.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.muted }}>
                      <X size={13} />
                    </button>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  placeholder="Add subtask..."
                  value={newSubtask}
                  onChange={e => setNewSubtask(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addSubtask()}
                  style={{ flex: 1, padding: '8px 12px', backgroundColor: C.card3, border: `1px solid ${C.border}`, borderRadius: '8px', color: C.text, fontSize: '13px', outline: 'none', fontFamily: 'inherit' }}
                />
                <button onClick={addSubtask} style={{ padding: '8px 14px', backgroundColor: C.green, color: '#0A0A12', border: 'none', borderRadius: '8px', fontSize: '12.5px', fontWeight: '800', cursor: 'pointer', fontFamily: 'inherit' }}>
                  Add
                </button>
              </div>
            </div>

            {/* Comments Section */}
            <div style={{ backgroundColor: C.card2, borderRadius: '14px', padding: '18px', border: `1px solid ${C.border}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                <MessageSquare size={16} color={C.blue} />
                <h4 style={{ color: C.text, fontSize: '14px', fontWeight: '700', margin: 0 }}>
                  Comments ({comments.length})
                </h4>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '14px', maxHeight: '180px', overflowY: 'auto' }}>
                {comments.length === 0 ? (
                  <p style={{ color: C.muted2, fontSize: '12.5px', margin: 0 }}>No comments yet.</p>
                ) : comments.map(c => (
                  <div key={c.id} style={{ backgroundColor: C.card3, borderRadius: '10px', padding: '10px 12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ color: C.green, fontSize: '11.5px', fontWeight: '700' }}>{c.author || 'Admin'}</span>
                      <span style={{ color: C.muted2, fontSize: '10px' }}>{new Date(c.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <p style={{ color: C.text2, fontSize: '12.5px', margin: 0, lineHeight: 1.4 }}>{c.text}</p>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  placeholder="Write a comment..."
                  value={newComment}
                  onChange={e => setNewComment(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addComment()}
                  style={{ flex: 1, padding: '9px 12px', backgroundColor: C.card3, border: `1px solid ${C.border}`, borderRadius: '8px', color: C.text, fontSize: '13px', outline: 'none', fontFamily: 'inherit' }}
                />
                <button onClick={addComment} style={{ padding: '9px 16px', backgroundColor: C.blue, color: '#FFFFFF', border: 'none', borderRadius: '8px', fontSize: '12.5px', fontWeight: '700', cursor: 'pointer', fontFamily: 'inherit' }}>
                  Post
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </AdminLayout>
  );
}