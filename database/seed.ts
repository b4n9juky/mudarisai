// ============================================================
// SEED — create default admin user
// Usage: npx tsx database/seed.ts
// ============================================================
import pg from "pg";
import bcrypt from "bcrypt";
import dotenv from "dotenv";

dotenv.config();

const pool = new pg.Pool({
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME || "mudarisai",
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "postgres",
});

async function seed() {
  console.log("Seeding database...");

  // Ensure tables exist
  const fs = await import("fs");
  const migrationSql = fs.readFileSync(
    new URL("./001_init.sql", import.meta.url),
    "utf-8"
  );
  await pool.query(migrationSql);
  console.log("  ✓ Migration applied");

  // Seed users: always reset password to ensure they work
  async function upsertUser(username: string, passwordPlain: string, role: string) {
    const hash = await bcrypt.hash(passwordPlain, 10);
    const existing = await pool.query("SELECT id FROM tbl_users WHERE username = $1", [username]);
    if (existing.rows.length > 0) {
      await pool.query("UPDATE tbl_users SET password = $1, role = $2, updated_at = NOW() WHERE username = $3", [hash, role, username]);
      console.log(`  ✓ User "${username}" password reset`);
    } else {
      await pool.query("INSERT INTO tbl_users (username, password, role) VALUES ($1, $2, $3)", [username, hash, role]);
      console.log(`  ✓ User "${username}" created`);
    }
  }

  await upsertUser("admin", "admin123", "admin");
  await upsertUser("guru", "guru123", "guru");
  await upsertUser("indah", "guru123", "guru");

  console.log("  ✓ Username/password: admin/admin123, guru/guru123, indah/guru123");
  await pool.end();
  console.log("Done!");
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
