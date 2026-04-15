const bcrypt = require("bcrypt");
const dotenv = require("dotenv");
const pool = require("../src/config/db");

dotenv.config();

const SALT_ROUNDS = 10;

async function seed() {
  const adminUsername = process.env.ADMIN_SEED_USERNAME || "ecohome_admin";
  const adminEmail = process.env.ADMIN_SEED_EMAIL || "admin@ecohome.local";
  const adminPassword = process.env.ADMIN_SEED_PASSWORD;

  // Test users for chat functionality
  const testUsers = [
    { username: "testuser", email: "testuser@example.com", password: "password123", role: "client" },
    { username: "johndoe", email: "johndoe@example.com", password: "password123", role: "client" },
    { username: "janedoe", email: "janedoe@example.com", password: "password123", role: "client" }
  ];

  const sampleProducts = [
    { name: "Luz LED Inteligente", price: 25.9 },
    { name: "Termostato EcoHome", price: 79.99 },
    { name: "Sensor de Movimiento", price: 34.5 }
  ];

  try {
    // Create admin user
    const adminCheck = await pool.query("SELECT id FROM users WHERE email = $1 LIMIT 1", [adminEmail]);

    if (adminCheck.rowCount === 0) {
      const passwordHash = await bcrypt.hash(adminPassword, SALT_ROUNDS);
      const adminInsert = `
        INSERT INTO users (username, email, password_hash, role)
        VALUES ($1, $2, $3, 'admin')
        RETURNING id, email, role
      `;
      const adminResult = await pool.query(adminInsert, [adminUsername, adminEmail, passwordHash]);
      console.log(
        `[${new Date().toISOString()}] seed admin_created user_id=${adminResult.rows[0].id} email=${adminEmail}`
      );
    } else {
      console.log(`[${new Date().toISOString()}] seed admin_exists email=${adminEmail}`);
    }

    // Create test users
    for (const user of testUsers) {
      const userCheck = await pool.query("SELECT id FROM users WHERE email = $1 LIMIT 1", [user.email]);

      if (userCheck.rowCount === 0) {
        const passwordHash = await bcrypt.hash(user.password, SALT_ROUNDS);
        const userInsert = `
          INSERT INTO users (username, email, password_hash, role)
          VALUES ($1, $2, $3, $4)
          RETURNING id, email, role
        `;
        const userResult = await pool.query(userInsert, [user.username, user.email, passwordHash, user.role]);
        console.log(
          `[${new Date().toISOString()}] seed testuser_created user_id=${userResult.rows[0].id} email=${user.email} username=${user.username}`
        );
      } else {
        console.log(`[${new Date().toISOString()}] seed testuser_exists email=${user.email}`);
      }
    }

    // Create test messages for chat functionality
    const testMessages = [
      { user_id: 4, message: "¡Hola! Bienvenido al chat de EcoHome Store" },
      { user_id: 5, message: "Hola a todos, ¿qué productos recomiendan?" },
      { user_id: 6, message: "Los sensores de movimiento son geniales para ahorrar energía" },
      { user_id: 4, message: "¡Totalmente! También tenemos luces LED inteligentes" },
      { user_id: 5, message: "¿Cuánto cuestan los termostatos?" },
      { user_id: 6, message: "Los termostatos EcoHome cuestan $79.99" }
    ];

    // Insert test messages
    for (const msg of testMessages) {
      try {
        await pool.query(`
          INSERT INTO messages (user_id, message, created_at)
          VALUES ($1, $2, NOW() - INTERVAL '${Math.floor(Math.random() * 24)} hours')
        `, [msg.user_id, msg.message]);
        console.log(`[${new Date().toISOString()}] seed message_created user_id=${msg.user_id} message="${msg.message.substring(0, 30)}..."`);
      } catch (error) {
        // Ignore duplicate messages or other errors
        console.log(`[${new Date().toISOString()}] seed message_skipped user_id=${msg.user_id}`);
      }
    }

    console.log(`[${new Date().toISOString()}] Seed completed successfully`);
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Seed failed`, error);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

seed();
