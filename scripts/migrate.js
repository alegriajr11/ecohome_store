const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");
const pool = require("../src/config/db");

dotenv.config();

/**
 * Orden: init.sql primero; luego migraciones numeradas (010_, 011_, ...).
 */
function migrationSortKey(filename) {
  if (filename === "init.sql") {
    return [0, filename];
  }
  const m = filename.match(/^(\d+)_(.+)$/);
  if (m) {
    return [parseInt(m[1], 10), filename];
  }
  return [1000, filename];
}

async function runMigration() {
  try {
    const migrationsDir = path.join(__dirname, "..", "migrations");
    const files = fs
      .readdirSync(migrationsDir)
      .filter((f) => f.endsWith(".sql"))
      .sort((a, b) => {
        const [na, fa] = migrationSortKey(a);
        const [nb, fb] = migrationSortKey(b);
        if (na !== nb) return na - nb;
        return fa.localeCompare(fb);
      });

    for (const file of files) {
      const sqlPath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(sqlPath, "utf-8");
      await pool.query(sql);
      console.log(`[${new Date().toISOString()}] Applied migration: ${file}`);
    }

    console.log(`[${new Date().toISOString()}] All migrations executed successfully`);
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Migration failed`, error);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

runMigration();
