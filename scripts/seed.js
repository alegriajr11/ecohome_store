const bcrypt = require("bcrypt");
const dotenv = require("dotenv");
const pool = require("../src/config/db");

dotenv.config();

const SALT_ROUNDS = 10;

async function seed() {
  const adminUsername = process.env.ADMIN_SEED_USERNAME || "ecohome_admin";
  const adminEmail = process.env.ADMIN_SEED_EMAIL || "admin@ecohome.local";
  const adminPassword = process.env.ADMIN_SEED_PASSWORD;

  const sampleProducts = [
    { name: "Luz LED Inteligente", price: 25.9 },
    { name: "Termostato EcoHome", price: 79.99 },
    { name: "Sensor de Movimiento", price: 34.5 }
  ];

  try {
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

    for (const product of sampleProducts) {
      const exists = await pool.query("SELECT id FROM products WHERE name = $1 LIMIT 1", [product.name]);
      if (exists.rowCount === 0) {
        await pool.query("INSERT INTO products (name, price) VALUES ($1, $2)", [product.name, product.price]);
        console.log(`[${new Date().toISOString()}] seed product_created name="${product.name}"`);
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
