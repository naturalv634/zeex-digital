const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);
app.use('/uploads', express.static(uploadsDir));

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

pool.connect((err) => {
  if (err) {
    console.error('Database connection error:', err);
  } else {
    console.log('Database connected successfully!');
  }
});

const createTables = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(100) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      role VARCHAR(20) NOT NULL DEFAULT 'member',
      department VARCHAR(100),
      phone VARCHAR(20),
      avatar_color VARCHAR(20) DEFAULT '#00D4FF',
      status VARCHAR(20) DEFAULT 'Active',
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS projects (
      id SERIAL PRIMARY KEY,
      name VARCHAR(200) NOT NULL,
      client_name VARCHAR(100),
      client_id INTEGER,
      service_type VARCHAR(100),
      start_date DATE,
      end_date DATE,
      progress INTEGER DEFAULT 0,
      status VARCHAR(50) DEFAULT 'Not Started',
      description TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS tasks (
      id SERIAL PRIMARY KEY,
      name VARCHAR(200) NOT NULL,
      description TEXT,
      member_id INTEGER REFERENCES users(id),
      project_id INTEGER REFERENCES projects(id),
      priority VARCHAR(20) DEFAULT 'Medium',
      status VARCHAR(50) DEFAULT 'Pending',
      due_date DATE,
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id),
      title VARCHAR(200),
      message TEXT,
      type VARCHAR(50),
      read BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS project_members (
      id SERIAL PRIMARY KEY,
      project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
      member_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      created_at TIMESTAMP DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS activity_logs (
      id SERIAL PRIMARY KEY,
      type VARCHAR(50) NOT NULL,
      message TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS subtasks (
      id SERIAL PRIMARY KEY,
      task_id INTEGER REFERENCES tasks(id) ON DELETE CASCADE,
      text VARCHAR(255) NOT NULL,
      done BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS task_comments (
      id SERIAL PRIMARY KEY,
      task_id INTEGER REFERENCES tasks(id) ON DELETE CASCADE,
      author VARCHAR(100) DEFAULT 'Admin',
      text TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS settings (
      id INTEGER PRIMARY KEY DEFAULT 1,
      company_name VARCHAR(200) DEFAULT 'ZEEX-Digital',
      company_email VARCHAR(150) DEFAULT 'admin@zeex.com',
      company_phone VARCHAR(50) DEFAULT '',
      company_website VARCHAR(200) DEFAULT '',
      notify_task_assigned BOOLEAN DEFAULT TRUE,
      notify_deadline_alert BOOLEAN DEFAULT TRUE,
      notify_project_update BOOLEAN DEFAULT TRUE,
      notify_client_view BOOLEAN DEFAULT FALSE,
      notify_daily_report BOOLEAN DEFAULT TRUE,
      updated_at TIMESTAMP DEFAULT NOW(),
      CONSTRAINT single_row CHECK (id = 1)
    );
    INSERT INTO settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

    CREATE TABLE IF NOT EXISTS time_logs (
      id SERIAL PRIMARY KEY,
      task_id INTEGER REFERENCES tasks(id) ON DELETE SET NULL,
      project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
      member_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      hours DECIMAL(5,2) NOT NULL,
      description TEXT,
      log_date DATE DEFAULT CURRENT_DATE,
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS milestones (
      id SERIAL PRIMARY KEY,
      project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
      title VARCHAR(200) NOT NULL,
      description TEXT,
      due_date DATE,
      status VARCHAR(50) DEFAULT 'Pending',
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS invoices (
      id SERIAL PRIMARY KEY,
      invoice_number VARCHAR(50) UNIQUE NOT NULL,
      client_id INTEGER,
      project_id INTEGER REFERENCES projects(id) ON DELETE SET NULL,
      client_name VARCHAR(100),
      status VARCHAR(50) DEFAULT 'Draft',
      amount DECIMAL(10,2) DEFAULT 0,
      due_date DATE,
      issued_date DATE DEFAULT CURRENT_DATE,
      notes TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS invoice_items (
      id SERIAL PRIMARY KEY,
      invoice_id INTEGER REFERENCES invoices(id) ON DELETE CASCADE,
      description VARCHAR(300),
      quantity DECIMAL(10,2) DEFAULT 1,
      unit_price DECIMAL(10,2) DEFAULT 0,
      total DECIMAL(10,2) DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS project_files (
      id SERIAL PRIMARY KEY,
      project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
      uploader_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
      file_name VARCHAR(255) NOT NULL,
      file_path VARCHAR(500) NOT NULL,
      file_size INTEGER NOT NULL,
      file_type VARCHAR(100),
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS attendance (
      id SERIAL PRIMARY KEY,
      member_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      date DATE NOT NULL DEFAULT CURRENT_DATE,
      status VARCHAR(20) NOT NULL DEFAULT 'Present',
      check_in_time TIMESTAMP DEFAULT NOW(),
      photo_path VARCHAR(500),
      note TEXT,
      UNIQUE(member_id, date)
    );
  `);
  console.log('Tables created successfully!');
};

createTables();

const logActivity = async (type, message) => {
  try {
    await pool.query('INSERT INTO activity_logs (type, message) VALUES ($1, $2)', [type, message]);
  } catch (err) {
    console.error('Activity log error:', err.message);
  }
};

// AUTH ROUTES

app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, email, hashedPassword, role || 'member']
    );
    res.json({ success: true, user: result.rows[0] });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) return res.status(400).json({ error: 'User not found' });

    const user = result.rows[0];
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(400).json({ error: 'Invalid password' });

    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ success: true, token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/auth/change-password', async (req, res) => {
  try {
    const { userId, oldPassword, newPassword } = req.body;
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'User not found' });

    const user = result.rows[0];
    const valid = await bcrypt.compare(oldPassword, user.password);
    if (!valid) return res.status(400).json({ error: 'Incorrect current password' });

    const hashed = await bcrypt.hash(newPassword, 10);
    await pool.query('UPDATE users SET password = $1 WHERE id = $2', [hashed, userId]);
    res.json({ success: true, message: 'Password updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// MEMBERS ROUTES

app.get('/api/members', async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM users WHERE role IN ('member', 'editor') ORDER BY created_at DESC");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/members', async (req, res) => {
  try {
    const { name, email, password, department, phone, role, avatar_color } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO users (name, email, password, role, department, phone, avatar_color) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [name, email, hashedPassword, role || 'member', department, phone, avatar_color || '#00D4FF']
    );
    await logActivity('member_added', `${name} joined as a new team member`);
    res.json({ success: true, member: result.rows[0] });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/api/members/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM notifications WHERE user_id = $1', [req.params.id]);
    await pool.query('DELETE FROM project_members WHERE member_id = $1', [req.params.id]);
    await pool.query('DELETE FROM tasks WHERE member_id = $1', [req.params.id]);
    await pool.query('DELETE FROM users WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PROJECTS ROUTES

app.get('/api/projects', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM projects ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/projects', async (req, res) => {
  try {
    const { name, client_name, service_type, start_date, end_date, progress, status, description } = req.body;
    const result = await pool.query(
      'INSERT INTO projects (name, client_name, service_type, start_date, end_date, progress, status, description) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
      [name, client_name, service_type, start_date, end_date, progress || 0, status || 'Not Started', description]
    );
    await logActivity('project_created', `New project "${name}" was created`);
    res.json({ success: true, project: result.rows[0] });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.put('/api/projects/:id', async (req, res) => {
  try {
    const { progress, status, name, client_name, service_type, start_date, end_date, description } = req.body;
    const result = await pool.query(
      'UPDATE projects SET progress = COALESCE($1, progress), status = COALESCE($2, status), name = COALESCE($3, name), client_name = COALESCE($4, client_name), service_type = COALESCE($5, service_type), start_date = COALESCE($6, start_date), end_date = COALESCE($7, end_date), description = COALESCE($8, description) WHERE id = $9 RETURNING *',
      [progress, status, name, client_name, service_type, start_date, end_date, description, req.params.id]
    );
    await logActivity('project_updated', `Project "${name}" was updated to ${status}`);
    res.json({ success: true, project: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/projects/bulk/status', async (req, res) => {
  try {
    const { projectIds, status } = req.body;
    if (!projectIds || !projectIds.length || !status) {
      return res.status(400).json({ error: 'projectIds array and status are required' });
    }
    await pool.query('UPDATE projects SET status = $1 WHERE id = ANY($2::int[])', [status, projectIds]);
    await logActivity('project_bulk_update', `${projectIds.length} projects updated to ${status}`);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/projects/:id/progress', async (req, res) => {
  try {
    const { progress } = req.body;
    const result = await pool.query(
      'UPDATE projects SET progress = $1 WHERE id = $2 RETURNING *',
      [progress, req.params.id]
    );
    if (result.rows[0]) {
      await logActivity('progress_updated', `Progress for "${result.rows[0].name}" updated to ${progress}%`);
    }
    res.json({ success: true, project: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/projects/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM project_members WHERE project_id = $1', [req.params.id]);
    await pool.query('DELETE FROM tasks WHERE project_id = $1', [req.params.id]);
    await pool.query('DELETE FROM projects WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// TASKS ROUTES

app.get('/api/tasks', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT t.*, u.name as member_name, p.name as project_name
      FROM tasks t
      LEFT JOIN users u ON t.member_id = u.id
      LEFT JOIN projects p ON t.project_id = p.id
      ORDER BY t.created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/tasks', async (req, res) => {
  try {
    const { name, description, member_id, project_id, priority, due_date } = req.body;
    const result = await pool.query(
      'INSERT INTO tasks (name, description, member_id, project_id, priority, due_date) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [name, description, member_id, project_id, priority || 'Medium', due_date]
    );
    const memberResult = await pool.query('SELECT name FROM users WHERE id = $1', [member_id]);
    const memberName = memberResult.rows[0]?.name || 'a team member';
    await logActivity('task_assigned', `Task "${name}" was assigned to ${memberName}`);
    res.json({ success: true, task: result.rows[0] });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.put('/api/tasks/:id', async (req, res) => {
  try {
    const { status } = req.body;
    const result = await pool.query(
      'UPDATE tasks SET status = $1 WHERE id = $2 RETURNING *',
      [status, req.params.id]
    );
    if (result.rows[0] && status === 'Completed') {
      await logActivity('task_completed', `Task "${result.rows[0].name}" was marked as completed`);
    }
    res.json({ success: true, task: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/tasks/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM subtasks WHERE task_id = $1', [req.params.id]);
    await pool.query('DELETE FROM task_comments WHERE task_id = $1', [req.params.id]);
    await pool.query('DELETE FROM tasks WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// SUBTASKS ROUTES

app.get('/api/tasks/:id/subtasks', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM subtasks WHERE task_id = $1 ORDER BY created_at ASC',
      [req.params.id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/tasks/:id/subtasks', async (req, res) => {
  try {
    const { text } = req.body;
    const result = await pool.query(
      'INSERT INTO subtasks (task_id, text) VALUES ($1, $2) RETURNING *',
      [req.params.id, text]
    );
    res.json({ success: true, subtask: result.rows[0] });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.put('/api/subtasks/:id', async (req, res) => {
  try {
    const { done } = req.body;
    const result = await pool.query(
      'UPDATE subtasks SET done = $1 WHERE id = $2 RETURNING *',
      [done, req.params.id]
    );
    res.json({ success: true, subtask: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/subtasks/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM subtasks WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// TASK COMMENTS ROUTES

app.get('/api/tasks/:id/comments', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM task_comments WHERE task_id = $1 ORDER BY created_at ASC',
      [req.params.id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/tasks/:id/comments', async (req, res) => {
  try {
    const { author, text } = req.body;
    const result = await pool.query(
      'INSERT INTO task_comments (task_id, author, text) VALUES ($1, $2, $3) RETURNING *',
      [req.params.id, author || 'Admin', text]
    );
    res.json({ success: true, comment: result.rows[0] });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});
// Assign/change client on a project
app.put('/api/projects/:id/client', async (req, res) => {
  try {
    const { client_id } = req.body;
    const clientResult = await pool.query('SELECT name FROM users WHERE id = $1', [client_id]);
    const clientName = clientResult.rows[0]?.name || null;

    const result = await pool.query(
      'UPDATE projects SET client_id = $1, client_name = $2 WHERE id = $3 RETURNING *',
      [client_id || null, clientName, req.params.id]
    );
    res.json({ success: true, project: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PROJECT MEMBERS ROUTES

app.get('/api/projects/:id/members', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT u.* FROM users u JOIN project_members pm ON u.id = pm.member_id WHERE pm.project_id = $1',
      [req.params.id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/projects/:id/members', async (req, res) => {
  try {
    const { member_id } = req.body;
    await pool.query(
      'INSERT INTO project_members (project_id, member_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
      [req.params.id, member_id]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/projects/:id/members/:memberId', async (req, res) => {
  try {
    await pool.query(
      'DELETE FROM project_members WHERE project_id = $1 AND member_id = $2',
      [req.params.id, req.params.memberId]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/members/:id/projects', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT p.* FROM projects p JOIN project_members pm ON p.id = pm.project_id WHERE pm.member_id = $1',
      [req.params.id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CLIENTS ROUTES

app.get('/api/clients', async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM users WHERE role = 'client' ORDER BY created_at DESC");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/clients', async (req, res) => {
  try {
    const { name, company, email, phone, projectIds } = req.body;
    const tempPassword = Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    const result = await pool.query(
      'INSERT INTO users (name, email, password, role, department, phone) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [name, email, hashedPassword, 'client', company, phone]
    );
    const client = result.rows[0];

    if (projectIds && projectIds.length > 0) {
      for (const projectId of projectIds) {
        await pool.query('UPDATE projects SET client_id = $1 WHERE id = $2', [client.id, projectId]);
      }
    }

    await logActivity('client_added', `New client "${name}" was added`);
    res.json({ success: true, client, tempPassword });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/api/clients/:id/projects', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM projects WHERE client_id = $1', [req.params.id]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/clients/:id', async (req, res) => {
  try {
    await pool.query('UPDATE projects SET client_id = NULL WHERE client_id = $1', [req.params.id]);
    await pool.query('DELETE FROM notifications WHERE user_id = $1', [req.params.id]);
    await pool.query('DELETE FROM users WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// NOTIFICATIONS ROUTES

app.get('/api/notifications/:userId', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC',
      [req.params.userId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/notifications', async (req, res) => {
  try {
    const { user_id, title, message, type } = req.body;
    const result = await pool.query(
      'INSERT INTO notifications (user_id, title, message, type) VALUES ($1, $2, $3, $4) RETURNING *',
      [user_id, title, message, type || 'general']
    );
    res.json({ success: true, notification: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/notifications/:id/read', async (req, res) => {
  try {
    await pool.query('UPDATE notifications SET read = true WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/notifications/user/:userId/read-all', async (req, res) => {
  try {
    await pool.query('UPDATE notifications SET read = true WHERE user_id = $1', [req.params.userId]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/notifications/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM notifications WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ACTIVITY LOG ROUTE

app.get('/api/activity', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const result = await pool.query(
      'SELECT * FROM activity_logs ORDER BY created_at DESC LIMIT $1',
      [limit]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// SETTINGS ROUTES

app.get('/api/settings', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM settings WHERE id = 1');
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/settings', async (req, res) => {
  try {
    const {
      company_name, company_email, company_phone, company_website,
      notify_task_assigned, notify_deadline_alert, notify_project_update,
      notify_client_view, notify_daily_report
    } = req.body;

    const result = await pool.query(
      `UPDATE settings SET
        company_name = $1, company_email = $2, company_phone = $3, company_website = $4,
        notify_task_assigned = $5, notify_deadline_alert = $6, notify_project_update = $7,
        notify_client_view = $8, notify_daily_report = $9, updated_at = NOW()
      WHERE id = 1 RETURNING *`,
      [
        company_name, company_email, company_phone, company_website,
        notify_task_assigned, notify_deadline_alert, notify_project_update,
        notify_client_view, notify_daily_report
      ]
    );
    res.json({ success: true, settings: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// STATS ROUTE

app.get('/api/stats', async (req, res) => {
  try {
    const projects = await pool.query('SELECT COUNT(*) FROM projects');
    const members = await pool.query("SELECT COUNT(*) FROM users WHERE role = 'member'");
    const tasks = await pool.query('SELECT COUNT(*) FROM tasks');
    const completedTasks = await pool.query("SELECT COUNT(*) FROM tasks WHERE status = 'Completed'");
    const overdueTasks = await pool.query("SELECT COUNT(*) FROM tasks WHERE due_date < CURRENT_DATE AND status != 'Completed'");
    const totalHours = await pool.query('SELECT COALESCE(SUM(hours),0) AS total FROM time_logs');
    const totalInvoiced = await pool.query("SELECT COALESCE(SUM(amount),0) AS total FROM invoices WHERE status != 'Cancelled'");

    res.json({
      totalProjects: projects.rows[0].count,
      totalMembers: members.rows[0].count,
      totalTasks: tasks.rows[0].count,
      completedTasks: completedTasks.rows[0].count,
      overdueTasks: overdueTasks.rows[0].count,
      totalHours: totalHours.rows[0].total,
      totalInvoiced: totalInvoiced.rows[0].total,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── TIME TRACKING ROUTES ─────────────────────────────────

app.get('/api/time-logs', async (req, res) => {
  try {
    const { project_id, member_id } = req.query;
    let query = `
      SELECT tl.*, u.name AS member_name, u.avatar_color,
             t.name AS task_name, p.name AS project_name
      FROM time_logs tl
      LEFT JOIN users u ON tl.member_id = u.id
      LEFT JOIN tasks t ON tl.task_id = t.id
      LEFT JOIN projects p ON tl.project_id = p.id
      WHERE 1=1
    `;
    const params = [];
    if (project_id) { params.push(project_id); query += ` AND tl.project_id = $${params.length}`; }
    if (member_id)  { params.push(member_id);  query += ` AND tl.member_id = $${params.length}`; }
    query += ' ORDER BY tl.log_date DESC, tl.created_at DESC LIMIT 200';
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/time-logs', async (req, res) => {
  try {
    const { task_id, project_id, member_id, hours, description, log_date } = req.body;
    const result = await pool.query(
      'INSERT INTO time_logs (task_id, project_id, member_id, hours, description, log_date) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *',
      [task_id || null, project_id, member_id, hours, description, log_date || new Date().toISOString().split('T')[0]]
    );
    await logActivity('time_logged', `${hours}h logged on project`);
    res.json({ success: true, log: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/time-logs/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM time_logs WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── MILESTONES ROUTES ────────────────────────────────────

app.get('/api/milestones', async (req, res) => {
  try {
    const { project_id } = req.query;
    let query = 'SELECT m.*, p.name AS project_name FROM milestones m LEFT JOIN projects p ON m.project_id = p.id';
    const params = [];
    if (project_id) { params.push(project_id); query += ` WHERE m.project_id = $1`; }
    query += ' ORDER BY m.due_date ASC NULLS LAST';
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/milestones', async (req, res) => {
  try {
    const { project_id, title, description, due_date, status } = req.body;
    const result = await pool.query(
      'INSERT INTO milestones (project_id, title, description, due_date, status) VALUES ($1,$2,$3,$4,$5) RETURNING *',
      [project_id, title, description, due_date || null, status || 'Pending']
    );
    await logActivity('milestone_added', `Milestone "${title}" added`);
    res.json({ success: true, milestone: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/milestones/:id', async (req, res) => {
  try {
    const { title, description, due_date, status } = req.body;
    const result = await pool.query(
      'UPDATE milestones SET title=$1, description=$2, due_date=$3, status=$4 WHERE id=$5 RETURNING *',
      [title, description, due_date || null, status, req.params.id]
    );
    res.json({ success: true, milestone: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/milestones/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM milestones WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── INVOICES ROUTES ──────────────────────────────────────

app.get('/api/invoices', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT i.*, p.name AS project_name,
              (SELECT COALESCE(SUM(total),0) FROM invoice_items WHERE invoice_id = i.id) AS computed_amount
       FROM invoices i LEFT JOIN projects p ON i.project_id = p.id
       ORDER BY i.created_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/invoices/:id', async (req, res) => {
  try {
    const inv = await pool.query('SELECT * FROM invoices WHERE id = $1', [req.params.id]);
    if (inv.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    const items = await pool.query('SELECT * FROM invoice_items WHERE invoice_id = $1', [req.params.id]);
    res.json({ ...inv.rows[0], items: items.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/invoices', async (req, res) => {
  try {
    const { client_name, client_id, project_id, due_date, notes, items } = req.body;
    const countRes = await pool.query('SELECT COUNT(*) FROM invoices');
    const num = String(parseInt(countRes.rows[0].count) + 1).padStart(4, '0');
    const invoice_number = `INV-${new Date().getFullYear()}-${num}`;
    const amount = (items || []).reduce((s, it) => s + (it.quantity * it.unit_price), 0);

    const inv = await pool.query(
      'INSERT INTO invoices (invoice_number, client_name, client_id, project_id, due_date, notes, amount) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *',
      [invoice_number, client_name, client_id || null, project_id || null, due_date || null, notes, amount]
    );
    const invId = inv.rows[0].id;

    for (const it of (items || [])) {
      const total = it.quantity * it.unit_price;
      await pool.query(
        'INSERT INTO invoice_items (invoice_id, description, quantity, unit_price, total) VALUES ($1,$2,$3,$4,$5)',
        [invId, it.description, it.quantity, it.unit_price, total]
      );
    }
    await logActivity('invoice_created', `Invoice ${invoice_number} created for ${client_name}`);
    res.json({ success: true, invoice: inv.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/invoices/:id', async (req, res) => {
  try {
    const { client_name, project_id, due_date, notes, status, items } = req.body;
    const amount = (items || []).reduce((s, it) => s + (it.quantity * it.unit_price), 0);
    const result = await pool.query(
      'UPDATE invoices SET client_name=$1, project_id=$2, due_date=$3, notes=$4, status=$5, amount=$6 WHERE id=$7 RETURNING *',
      [client_name, project_id || null, due_date || null, notes, status, amount, req.params.id]
    );
    await pool.query('DELETE FROM invoice_items WHERE invoice_id = $1', [req.params.id]);
    for (const it of (items || [])) {
      const total = it.quantity * it.unit_price;
      await pool.query(
        'INSERT INTO invoice_items (invoice_id, description, quantity, unit_price, total) VALUES ($1,$2,$3,$4,$5)',
        [req.params.id, it.description, it.quantity, it.unit_price, total]
      );
    }
    res.json({ success: true, invoice: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/invoices/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM invoices WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── REPORTS ROUTES ───────────────────────────────────────

app.get('/api/reports/overview', async (req, res) => {
  try {
    const hoursPerProject = await pool.query(`
      SELECT p.name AS project_name, COALESCE(SUM(tl.hours),0) AS hours
      FROM projects p LEFT JOIN time_logs tl ON tl.project_id = p.id
      GROUP BY p.id, p.name ORDER BY hours DESC LIMIT 10
    `);
    const hoursPerMember = await pool.query(`
      SELECT u.name AS member_name, u.avatar_color, COALESCE(SUM(tl.hours),0) AS hours
      FROM users u LEFT JOIN time_logs tl ON tl.member_id = u.id
      WHERE u.role = 'member'
      GROUP BY u.id, u.name, u.avatar_color ORDER BY hours DESC LIMIT 10
    `);
    const tasksByStatus = await pool.query(`
      SELECT status, COUNT(*) AS count FROM tasks GROUP BY status
    `);
    const invoicesByStatus = await pool.query(`
      SELECT status, COUNT(*) AS count, COALESCE(SUM(amount),0) AS total FROM invoices GROUP BY status
    `);
    const weeklyHours = await pool.query(`
      SELECT DATE_TRUNC('week', log_date) AS week, COALESCE(SUM(hours),0) AS hours
      FROM time_logs WHERE log_date >= NOW() - INTERVAL '8 weeks'
      GROUP BY week ORDER BY week ASC
    `);
    const milestoneSummary = await pool.query(`
      SELECT status, COUNT(*) AS count FROM milestones GROUP BY status
    `);

    res.json({
      hoursPerProject: hoursPerProject.rows,
      hoursPerMember: hoursPerMember.rows,
      tasksByStatus: tasksByStatus.rows,
      invoicesByStatus: invoicesByStatus.rows,
      weeklyHours: weeklyHours.rows,
      milestoneSummary: milestoneSummary.rows,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── NOTIFICATIONS ROUTES ──────────────────────────────────

app.get('/api/notifications', async (req, res) => {
  try {
    const userId = req.query.user_id || 1; // Default to admin for now if not provided
    const result = await pool.query('SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT 20', [userId]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/notifications/:id/read', async (req, res) => {
  try {
    await pool.query('UPDATE notifications SET read = TRUE WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

/* ── FILES API ────────────────────────────────────── */
app.get('/api/projects/:id/files', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT pf.*, u.name as uploader_name, u.avatar_color 
       FROM project_files pf 
       LEFT JOIN users u ON pf.uploader_id = u.id 
       WHERE pf.project_id = $1 ORDER BY pf.created_at DESC`,
      [req.params.id]
    );
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/projects/:id/files', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const { uploader_id } = req.body;
    const { rows } = await pool.query(
      `INSERT INTO project_files (project_id, uploader_id, file_name, file_path, file_size, file_type) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [req.params.id, uploader_id || null, req.file.originalname, `/uploads/${req.file.filename}`, req.file.size, req.file.mimetype]
    );
    res.status(201).json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/files/:id', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT file_path FROM project_files WHERE id = $1', [req.params.id]);
    if (rows.length > 0) {
      const filePath = path.join(__dirname, rows[0].file_path);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      await pool.query('DELETE FROM project_files WHERE id = $1', [req.params.id]);
    }
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

/* ── ATTENDANCE API ───────────────────────────────────── */

// Check today's attendance for a specific member  ← MUST be before generic /api/attendance
app.get('/api/attendance/member/:id/today', async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const { rows } = await pool.query(
      `SELECT * FROM attendance WHERE member_id = $1 AND date = $2`,
      [parseInt(req.params.id), today]
    );
    res.json(rows[0] || null);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Get attendance for today (admin)  ← MUST be before generic /api/attendance
app.get('/api/attendance/today', async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const { rows } = await pool.query(
      `SELECT a.*, u.name as member_name, u.avatar_color, u.department, u.email
       FROM attendance a
       JOIN users u ON a.member_id = u.id
       WHERE a.date = $1
       ORDER BY a.check_in_time DESC`,
      [today]
    );
    // Also get all members to show absentees
    const allMembers = await pool.query(`SELECT id, name, avatar_color, department, email FROM users WHERE role = 'member'`);
    const presentIds = new Set(rows.map(r => parseInt(r.member_id)));
    const absent = allMembers.rows.filter(m => !presentIds.has(m.id)).map(m => ({
      ...m, status: 'Absent', date: today, check_in_time: null, photo_path: null
    }));
    res.json({ present: rows, absent, total: allMembers.rows.length, presentCount: rows.length });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Mark attendance (with selfie upload)
app.post('/api/attendance', upload.single('photo'), async (req, res) => {
  try {
    const { member_id, status, note } = req.body;
    if (!member_id) return res.status(400).json({ error: 'member_id required' });
    const photo_path = req.file ? `/uploads/${req.file.filename}` : null;
    const today = new Date().toISOString().split('T')[0];
    const { rows } = await pool.query(
      `INSERT INTO attendance (member_id, date, status, check_in_time, photo_path, note)
       VALUES ($1, $2, $3, NOW(), $4, $5)
       ON CONFLICT (member_id, date)
       DO UPDATE SET status = $3, check_in_time = NOW(), photo_path = COALESCE($4, attendance.photo_path), note = $5
       RETURNING *`,
      [parseInt(member_id), today, status || 'Present', photo_path, note || null]
    );
    await logActivity('attendance_marked', `Member checked in as ${status || 'Present'}`);
    res.status(201).json({ success: true, attendance: rows[0] });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Get attendance by date (admin)
app.get('/api/attendance', async (req, res) => {
  try {
    const { member_id, from, to, date } = req.query;
    let q = `SELECT a.*, u.name as member_name, u.avatar_color, u.department FROM attendance a JOIN users u ON a.member_id = u.id WHERE 1=1`;
    const params = [];
    if (member_id) { params.push(parseInt(member_id)); q += ` AND a.member_id = $${params.length}`; }
    if (date) { params.push(date); q += ` AND a.date = $${params.length}`; }
    if (from) { params.push(from); q += ` AND a.date >= $${params.length}`; }
    if (to)   { params.push(to);   q += ` AND a.date <= $${params.length}`; }
    q += ' ORDER BY a.date DESC, a.check_in_time DESC';
    const { rows } = await pool.query(q, params);
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Get monthly attendance summary
app.get('/api/attendance/monthly', async (req, res) => {
  try {
    const { month, member_id } = req.query; // month format: 'YYYY-MM'
    if (!month) return res.status(400).json({ error: 'Month (YYYY-MM) is required' });
    
    const startDate = `${month}-01`;
    // Get last day of the month
    const [y, m] = month.split('-');
    const endDate = new Date(y, m, 0).toISOString().split('T')[0];

    const params = [startDate, endDate];
    let q = `
      SELECT a.*, u.name as member_name, u.avatar_color, u.department 
      FROM attendance a 
      JOIN users u ON a.member_id = u.id 
      WHERE a.date >= $1 AND a.date <= $2
    `;
    
    if (member_id) {
      params.push(parseInt(member_id));
      q += ` AND a.member_id = $3`;
    }
    
    q += ' ORDER BY a.date DESC';
    
    const { rows } = await pool.query(q, params);
    
    // Group by member if no specific member requested
    if (!member_id) {
      const allMembers = await pool.query(`SELECT id, name, avatar_color, department FROM users WHERE role = 'member'`);
      const summary = allMembers.rows.map(user => {
        const userRecords = rows.filter(r => r.member_id === user.id);
        const presentCount = userRecords.filter(r => r.status === 'Present').length;
        return {
          ...user,
          present_count: presentCount,
          records: userRecords
        };
      });
      return res.json(summary);
    }

    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`ZEEX-Digital Backend running on port ${PORT}`);
});