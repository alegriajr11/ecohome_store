const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");
const pool = require("../src/config/db");

dotenv.config();

async function runMessagesMigration() {
  try {
    const sqlPath = path.join(__dirname, "..", "migrations", "add_messages.sql");
    const sql = fs.readFileSync(sqlPath, "utf-8");
    await pool.query(sql);
    console.log(`[${new Date().toISOString()}] Messages migration executed successfully`);
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Messages migration failed`, error);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

runMessagesMigration();