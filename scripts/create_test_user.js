const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../src/config/db');
const dotenv = require('dotenv');

dotenv.config();

async function createTestUser() {
  try {
    const passwordHash = await bcrypt.hash('test123', 10);
    const result = await pool.query(
      `INSERT INTO users (username, email, password_hash, role)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (email) DO NOTHING
       RETURNING id, username, email`,
      ['testuser', 'test@example.com', passwordHash, 'client']
    );

    if (result.rows.length > 0) {
      const token = jwt.sign(
        {
          id: result.rows[0].id,
          username: result.rows[0].username,
          email: result.rows[0].email,
          role: 'client'
        },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '24h' }
      );
      console.log('✅ Usuario de prueba creado exitosamente!');
      console.log('📧 Email: test@example.com');
      console.log('🔑 Password: test123');
      console.log('🎫 JWT Token:', token);
    } else {
      console.log('ℹ️  Usuario de prueba ya existe');
    }
  } catch (error) {
    console.error('❌ Error creando usuario de prueba:', error);
  } finally {
    await pool.end();
  }
}

createTestUser();