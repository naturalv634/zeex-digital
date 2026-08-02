const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function createAdmin() {
  try {
    const hashedPassword = await bcrypt.hash('admin1234', 10);
    const result = await pool.query(
      `INSERT INTO users (name, email, password, role) 
       VALUES ($1, $2, $3, $4) 
       ON CONFLICT (email) DO UPDATE SET role='admin', password=$3
       RETURNING id, name, email, role`,
      ['Admin', 'admin@zeex.com', hashedPassword, 'admin']
    );
    console.log('✅ Admin created successfully!');
    console.log('📧 Email:    admin@zeex.com');
    console.log('🔑 Password: admin1234');
    console.log('👤 Role:     admin');
    console.log('User:', result.rows[0]);
  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    await pool.end();
  }
}

createAdmin();
