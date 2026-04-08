const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");
const pool = require("../src/config/db");

dotenv.config();

async function runMigration() {
  try {
    const sqlPath = path.join(__dirname, "..", "migrations", "init.sql");
    const sql = fs.readFileSync(sqlPath, "utf-8");
    await pool.query(sql);
    console.log(`[${new Date().toISOString()}] Migration executed successfully`);
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Migration failed`, error);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

runMigration();
