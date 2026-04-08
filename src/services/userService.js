const pool = require("../config/db");

async function findUserByEmail(email) {
  const query = `
    SELECT id, username, email, password_hash, role, created_at
    FROM users
    WHERE email = $1
    LIMIT 1
  `;
  const { rows } = await pool.query(query, [email]);
  return rows[0] || null;
}

async function createUser({ username, email, passwordHash, role = "client" }) {
  const query = `
    INSERT INTO users (username, email, password_hash, role)
    VALUES ($1, $2, $3, $4)
    RETURNING id, username, email, role, created_at
  `;
  const values = [username, email, passwordHash, role];
  const { rows } = await pool.query(query, values);
  return rows[0];
}

module.exports = {
  findUserByEmail,
  createUser
};
