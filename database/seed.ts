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

  // Ensure default madrasah exists
  const madrasahResult = await pool.query("SELECT id FROM tbl_madrasah WHERE nama = 'Madrasah Default'");
  const madrasahId = madrasahResult.rows[0]?.id;
  if (!madrasahId) throw new Error("Madrasah Default tidak ditemukan. Jalankan migrasi 001_init.sql terlebih dahulu.");

  // Helper: create/update guru record and return its id
  async function upsertGuru(nama: string): Promise<number> {
    const existing = await pool.query("SELECT id FROM tbl_guru WHERE nama = $1 AND madrasah_id = $2", [nama, madrasahId]);
    if (existing.rows.length > 0) return existing.rows[0].id;
    const result = await pool.query(
      "INSERT INTO tbl_guru (nama, madrasah_id) VALUES ($1, $2) RETURNING id",
      [nama, madrasahId]
    );
    return result.rows[0].id;
  }

  // Seed users with proper guru_id linkage
  async function upsertUser(username: string, passwordPlain: string, role: string, guruNama?: string) {
    const hash = await bcrypt.hash(passwordPlain, 10);
    let guruId: number | null = null;
    if (guruNama) {
      guruId = await upsertGuru(guruNama);
    }

    const existing = await pool.query("SELECT id FROM tbl_users WHERE username = $1", [username]);
    if (existing.rows.length > 0) {
      await pool.query(
        "UPDATE tbl_users SET password = $1, role = $2, guru_id = $3, updated_at = NOW() WHERE username = $4",
        [hash, role, guruId, username]
      );
      console.log(`  ✓ User "${username}" password reset (guru_id=${guruId})`);
    } else {
      await pool.query(
        "INSERT INTO tbl_users (username, password, role, guru_id) VALUES ($1, $2, $3, $4)",
        [username, hash, role, guruId]
      );
      console.log(`  ✓ User "${username}" created (guru_id=${guruId})`);
    }
  }

  await upsertUser("admin", "admin123", "admin");
  await upsertUser("guru", "guru123", "guru", "Guru Test");
  await upsertUser("indah", "guru123", "guru", "Indah Lestari, M.Si.");

  console.log("  ✓ Username/password: admin/admin123, guru/guru123, indah/guru123");
  await pool.end();
  console.log("Done!");
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
