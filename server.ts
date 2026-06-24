import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import OpenAI from "openai";
import dotenv from "dotenv";
import pg from "pg";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

dotenv.config();

// ============================================================
// CONFIG
// ============================================================
const PORT = 3000;
const AI_MODEL = process.env.AI_MODEL || "deepseek/deepseek-chat";
const JWT_SECRET = process.env.JWT_SECRET || "mudarisai_default_secret";

const dbPool = new pg.Pool({
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME || "mudarisai",
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "postgres",
});

// ============================================================
// AI HELPER
// ============================================================
const apiKey = process.env.OPENROUTER_API_KEY;
const ai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: apiKey || "",
  defaultHeaders: {
    "HTTP-Referer": process.env.APP_URL || "http://localhost:3000",
    "X-Title": "MudarisAI",
  },
});

function extractJson(text: string): string {
  let cleaned = text
    .replace(/```json\s*/gi, "")
    .replace(/```\s*/gi, "")
    .trim();
  const jsonMatch = cleaned.match(/(\{[\s\S]*\})|(\[[\s\S]*\])/);
  return jsonMatch ? jsonMatch[0] : cleaned;
}

async function generateWithFallback(params: {
  messages: { role: "system" | "user" | "assistant"; content: string }[];
  preferredModel?: string;
}) {
  const model = params.preferredModel || AI_MODEL;
  let lastError: any = null;
  let useJsonFormat = true;

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const createParams: any = {
        model,
        messages: params.messages,
      };
      if (useJsonFormat) {
        createParams.response_format = { type: "json_object" };
      }
      const response = await ai.chat.completions.create(createParams);
      return response;
    } catch (error: any) {
      lastError = error;
      const errMsg = error.message || String(error);
      if (useJsonFormat && (errMsg.includes("response_format") || errMsg.includes("not supported"))) {
        useJsonFormat = false;
        attempt--;
        continue;
      }
      if (errMsg.includes("not a valid model")) {
        throw new Error(`Model "${model}" tidak valid.`);
      }
      if (attempt < 3) {
        await new Promise((r) => setTimeout(r, Math.pow(2, attempt) * 1000));
      }
    }
  }
  throw new Error(`API AI tidak merespon. ${lastError?.message || ""}`);
}

// ============================================================
// FALLBACK USERS (ketika PostgreSQL tidak tersedia)
// ============================================================
interface FallbackUser {
  id: number;
  username: string;
  passwordHash: string;
  role: string;
  guru_id: number | null;
  nama_guru: string;
  nama_madrasah: string;
}

let dbAvailable = false;
let fallbackUsers: FallbackUser[] = [];

async function initFallbackUsers() {
  const pw = await bcrypt.hash("guru123", 10);
  const adminPw = await bcrypt.hash("admin123", 10);
  fallbackUsers = [
    { id: 1, username: "admin", passwordHash: adminPw, role: "admin", guru_id: null, nama_guru: "Administrator", nama_madrasah: "Madrasah Default" },
    { id: 2, username: "guru", passwordHash: pw, role: "guru", guru_id: 1, nama_guru: "Guru Test", nama_madrasah: "Madrasah Default" },
    { id: 3, username: "indah", passwordHash: pw, role: "guru", guru_id: 2, nama_guru: "Indah Lestari, M.Si.", nama_madrasah: "MA Al-Khoiriyah" },
  ];
  console.log(`[Auth] Fallback mode: ${fallbackUsers.length} users loaded`);
}

// ============================================================
// DB HELPER — safe query that works in fallback mode
// ============================================================
async function dbQuery(text: string, params?: any[]) {
  if (!dbAvailable) return { rows: [], rowCount: 0 };
  try {
    return await dbPool.query(text, params);
  } catch (err: any) {
    if (err.code === '3D000') {
      dbAvailable = false;
      console.warn("[DB] Database tidak ditemukan, beralih ke fallback auth");
    }
    throw err;
  }
}

// ============================================================
// AUTH MIDDLEWARE
// ============================================================
interface JwtPayload {
  userId: number;
  username: string;
  role: string;
}

function authenticate(req: express.Request, res: express.Response, next: express.NextFunction) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  try {
    const token = header.slice(7);
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    (req as any).user = decoded;
    next();
  } catch {
    return res.status(401).json({ error: "Token tidak valid" });
  }
}

function authorize(...roles: string[]) {
  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const user = (req as any).user;
    if (!user || !roles.includes(user.role)) {
      return res.status(403).json({ error: "Forbidden" });
    }
    next();
  };
}

// ============================================================
// SERVER APP
// ============================================================
async function startServer() {
  const app = express();
  app.use(express.json({ limit: "10mb" }));

  // Test DB connection — use dbPool directly (dbQuery checks dbAvailable which is still false)
  try {
    await dbPool.query("SELECT 1");
    dbAvailable = true;
    console.log("[DB] PostgreSQL connected");
  } catch (err) {
    dbAvailable = false;
    console.warn(`[DB] PostgreSQL not available: ${(err as any)?.code || (err as any)?.message || 'unknown'}`);
    console.log("[Auth] Using fallback users for login");
    await initFallbackUsers();
  }

  // ============================================================
  // AUTH ROUTES
  // ============================================================
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      if (!username || !password) {
        return res.status(400).json({ error: "Username dan password wajib diisi." });
      }

      // Fallback mode
      if (!dbAvailable) {
        const fbUser = fallbackUsers.find(u => u.username === username);
        if (!fbUser) {
          return res.status(401).json({ error: "Username atau password salah." });
        }
        const valid = await bcrypt.compare(password, fbUser.passwordHash);
        if (!valid) {
          return res.status(401).json({ error: "Username atau password salah." });
        }
        const token = jwt.sign(
          { userId: fbUser.id, username: fbUser.username, role: fbUser.role },
          JWT_SECRET,
          { expiresIn: "24h" }
        );
        return res.json({
          user: {
            id: fbUser.id,
            username: fbUser.username,
            role: fbUser.role,
            guru_id: fbUser.guru_id,
            nama_guru: fbUser.nama_guru,
            nama_madrasah: fbUser.nama_madrasah,
          },
          token,
        });
      }

      // DB mode
      const result = await dbQuery(
        `SELECT u.id, u.username, u.password, u.role, u.guru_id,
                g.nama AS nama_guru, m.nama AS nama_madrasah
         FROM tbl_users u
         LEFT JOIN tbl_guru g ON u.guru_id = g.id
         LEFT JOIN tbl_madrasah m ON g.madrasah_id = m.id
         WHERE u.username = $1`,
        [username]
      );

      if (result.rows.length === 0) {
        return res.status(401).json({ error: "Username atau password salah." });
      }

      const user = result.rows[0];
      const valid = await bcrypt.compare(password, user.password);
      if (!valid) {
        return res.status(401).json({ error: "Username atau password salah." });
      }

      const token = jwt.sign(
        { userId: user.id, username: user.username, role: user.role },
        JWT_SECRET,
        { expiresIn: "24h" }
      );

      res.json({
        user: {
          id: user.id,
          username: user.username,
          role: user.role,
          guru_id: user.guru_id,
          nama_guru: user.nama_guru,
          nama_madrasah: user.nama_madrasah,
        },
        token,
      });
    } catch (err: any) {
      console.error("[LOGIN]", err);
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/auth/me", authenticate, async (req, res) => {
    try {
      const tokenUser = (req as any).user;

      if (!dbAvailable) {
        const fbUser = fallbackUsers.find(u => u.id === tokenUser.userId);
        if (!fbUser) return res.status(404).json({ error: "User tidak ditemukan" });
        return res.json({
          user: {
            id: fbUser.id,
            username: fbUser.username,
            role: fbUser.role,
            guru_id: fbUser.guru_id,
            nama_guru: fbUser.nama_guru,
            nama_madrasah: fbUser.nama_madrasah,
          }
        });
      }

      const result = await dbQuery(
        `SELECT u.id, u.username, u.role, u.guru_id,
                g.nama AS nama_guru, m.nama AS nama_madrasah
         FROM tbl_users u
         LEFT JOIN tbl_guru g ON u.guru_id = g.id
         LEFT JOIN tbl_madrasah m ON g.madrasah_id = m.id
         WHERE u.id = $1`,
        [tokenUser.userId]
      );
      if (result.rows.length === 0) {
        return res.status(404).json({ error: "User tidak ditemukan" });
      }
      res.json({ user: result.rows[0] });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // ============================================================
  // USER MANAGEMENT (admin only — requires DB)
  // ============================================================
  app.get("/api/users", authenticate, authorize("admin"), async (req, res) => {
    if (!dbAvailable) return res.status(503).json({ error: "Database tidak tersedia. Gunakan fallback auth." });
    try {
      const result = await dbQuery(
        `SELECT u.id, u.username, u.role, u.guru_id, u.created_at,
                g.nama AS nama_guru, m.nama AS nama_madrasah
         FROM tbl_users u
         LEFT JOIN tbl_guru g ON u.guru_id = g.id
         LEFT JOIN tbl_madrasah m ON g.madrasah_id = m.id
         ORDER BY u.id`
      );
      res.json({ users: result.rows });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/users", authenticate, authorize("admin"), async (req, res) => {
    if (!dbAvailable) return res.status(503).json({ error: "Database tidak tersedia." });
    try {
      const { username, password, role, guruId } = req.body;
      if (!username || !password) {
        return res.status(400).json({ error: "Username dan password wajib." });
      }
      const hashed = await bcrypt.hash(password, 10);
      const result = await dbQuery(
        `INSERT INTO tbl_users (username, password, role, guru_id)
         VALUES ($1, $2, $3, $4) RETURNING id, username, role, guru_id`,
        [username, hashed, role || "guru", guruId ? Number(guruId) : null]
      );
      res.json({ user: result.rows[0] });
    } catch (err: any) {
      if (err.code === "23505") {
        return res.status(400).json({ error: "Username sudah digunakan." });
      }
      res.status(500).json({ error: err.message });
    }
  });

  app.put("/api/users/:id", authenticate, authorize("admin"), async (req, res) => {
    if (!dbAvailable) return res.status(503).json({ error: "Database tidak tersedia." });
    try {
      const { id } = req.params;
      const { username, password, role, guruId } = req.body;
      if (password) {
        const hashed = await bcrypt.hash(password, 10);
        await dbQuery(
          `UPDATE tbl_users SET username=$1, password=$2, role=$3, guru_id=$4, updated_at=NOW()
           WHERE id=$5`,
          [username, hashed, role, guruId ? Number(guruId) : null, id]
        );
      } else {
        await dbQuery(
          `UPDATE tbl_users SET username=$1, role=$2, guru_id=$3, updated_at=NOW()
           WHERE id=$4`,
          [username, role, guruId ? Number(guruId) : null, id]
        );
      }
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.delete("/api/users/:id", authenticate, authorize("admin"), async (req, res) => {
    if (!dbAvailable) return res.status(503).json({ error: "Database tidak tersedia." });
    try {
      await dbQuery("DELETE FROM tbl_users WHERE id=$1", [req.params.id]);
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // ============================================================
  // PIPELINE ROUTES
  // ============================================================
  app.post("/api/pipeline/create", authenticate, async (req, res) => {
    try {
      const user = (req as any).user;
      const { namaMadrasah, namaGuru, mapel, kelasFase, semester } = req.body;

      if (!dbAvailable) {
        const mockId = Date.now();
        return res.json({ pipeline: { id: mockId, mapel, kelas_fase: kelasFase, semester, status: 'in_progress', created_at: new Date().toISOString() } });
      }

      // Find or create madrasah
      let madrasahResult = await dbQuery(
        "SELECT id FROM tbl_madrasah WHERE nama = $1", [namaMadrasah]
      );
      let madrasahId: number;
      if (madrasahResult.rows.length === 0) {
        const insert = await dbQuery(
          "INSERT INTO tbl_madrasah (nama) VALUES ($1) RETURNING id", [namaMadrasah]
        );
        madrasahId = insert.rows[0].id;
      } else {
        madrasahId = madrasahResult.rows[0].id;
      }

      // Ensure guru record exists for this madrasah
      let guruResult = await dbQuery(
        "SELECT id FROM tbl_guru WHERE nama = $1 AND madrasah_id = $2",
        [namaGuru, madrasahId]
      );
      if (guruResult.rows.length === 0) {
        await dbQuery(
          "INSERT INTO tbl_guru (nama, madrasah_id) VALUES ($1, $2)",
          [namaGuru, madrasahId]
        );
      }

      // Use logged-in user's guru_id for pipeline ownership
      const userResult = await dbQuery(
        "SELECT guru_id FROM tbl_users WHERE id = $1", [user.userId]
      );
      const userGuruId = userResult.rows[0]?.guru_id;
      if (!userGuruId) {
        return res.status(400).json({ error: "Akun guru tidak memiliki relasi guru_id. Hubungi admin." });
      }

      // Create pipeline
      const pipelineResult = await dbQuery(
        `INSERT INTO tbl_pipeline (guru_id, mapel, kelas_fase, semester, status)
         VALUES ($1, $2, $3, $4, 'in_progress') RETURNING id, mapel, kelas_fase, semester, status, created_at`,
        [userGuruId, mapel, kelasFase, semester]
      );

      res.json({ pipeline: pipelineResult.rows[0] });
    } catch (err: any) {
      console.error("[PIPELINE CREATE]", err);
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/pipeline", authenticate, async (req, res) => {
    try {
      const user = (req as any).user;
      let query = `
        SELECT p.id, p.mapel, p.kelas_fase, p.semester, p.status, p.created_at,
               g.nama AS nama_guru, m.nama AS nama_madrasah
        FROM tbl_pipeline p
        JOIN tbl_guru g ON p.guru_id = g.id
        JOIN tbl_madrasah m ON g.madrasah_id = m.id
      `;
      const params: any[] = [];
      if (user.role === "guru") {
        query += ` WHERE p.guru_id IN (SELECT guru_id FROM tbl_users WHERE id = $1)`;
        params.push(user.userId);
      }
      query += ` ORDER BY p.created_at DESC`;
      const result = await dbQuery(query, params);
      res.json({ pipelines: result.rows });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/pipeline/:id", authenticate, async (req, res) => {
    try {
      const { id } = req.params;
      const user = (req as any).user;
      const result = await dbQuery(
        `SELECT p.*, g.nama AS nama_guru, m.nama AS nama_madrasah
         FROM tbl_pipeline p
         JOIN tbl_guru g ON p.guru_id = g.id
         JOIN tbl_madrasah m ON g.madrasah_id = m.id
         WHERE p.id = $1`, [id]
      );
      if (result.rows.length === 0) {
        return res.status(404).json({ error: "Pipeline tidak ditemukan" });
      }
      const pipeline = result.rows[0];

      if (user.role === "guru") {
        const guruCheck = await dbQuery(
          "SELECT id FROM tbl_guru WHERE id IN (SELECT guru_id FROM tbl_users WHERE id = $1)", [user.userId]
        );
        if (guruCheck.rows.length > 0 && pipeline.guru_id !== guruCheck.rows[0].id) {
          return res.status(403).json({ error: "Akses ditolak" });
        }
      }

      // Fetch all related data
      const [analisisCP, tp, atp, protaProsem, modulAjar, lkpd, asesmenRubrik, lessons] = await Promise.all([
        dbQuery("SELECT * FROM tbl_analisis_cp WHERE pipeline_id = $1", [id]),
        dbQuery("SELECT * FROM tbl_tp WHERE pipeline_id = $1", [id]),
        dbQuery("SELECT * FROM tbl_atp WHERE pipeline_id = $1", [id]),
        dbQuery("SELECT * FROM tbl_prota_prosem WHERE pipeline_id = $1", [id]),
        dbQuery("SELECT * FROM tbl_modul_ajar WHERE pipeline_id = $1", [id]),
        dbQuery("SELECT * FROM tbl_lkpd WHERE pipeline_id = $1", [id]),
        dbQuery("SELECT * FROM tbl_asesmen_rubrik WHERE pipeline_id = $1", [id]),
        dbQuery("SELECT * FROM tbl_lessons WHERE pipeline_id = $1 ORDER BY pertemuan_ke", [id]),
      ]);

      const mapAnalisisCP = (r: any) => r ? {
        capaianPembelajaran: r.capaian_pembelajaran,
        analisisKompetensi: r.analisis_kompetensi,
        karakteristikMapel: r.karakteristik_mapel,
        rekomendasiPendekatan: r.rekomendasi_pendekatan,
      } : null;

      const mapTP = (r: any) => r ? {
        tujuanList: r.tujuan_list || [],
        rasional: r.rasional || '',
        kataKunci: r.kata_kunci || [],
      } : null;

      const mapATP = (r: any) => r ? {
        alur: r.alur || [],
        totalJam: r.total_jam || '',
      } : null;

      const mapProtaProsem = (r: any) => r ? {
        header: {
          namaMadrasah: pipeline.nama_madrasah || '',
          namaGuru: pipeline.nama_guru || '',
          mapel: pipeline.mapel || '',
          faseKelasSmt: pipeline.kelas_fase || '',
          kalenderInfo: pipeline.semester || '',
        },
        prota: r.prota || { semesterGanjil: [], semesterGenap: [], totalAlokasiWaktu: '' },
        prosemGanjil: r.prosem_ganjil || { bulan: [], materiRows: [] },
        prosemGenap: r.prosem_genap || { bulan: [], materiRows: [] },
        analisisMingguEfektif: r.analisis_minggu_efektif || { totalMingguEfektifGanjil: '', totalMingguEfektifGenap: '', keteranganEfektifitas: '' },
      } : null;

      const mapModulAjar = (r: any, lessonsRows: any[]) => {
        if (!r) return null;
        const pengalaman = r.pengalaman || {};
        if (lessonsRows.length > 0) {
          pengalaman.pertemuan = lessonsRows.map((l: any) => ({
            pertemuan: l.pertemuan_ke,
            topik: l.topik,
            durasi: l.durasi,
            pertanyaanPemantik: l.pertanyaan_pemantik,
            kegiatanAwal: l.kegiatan_awal,
            kegiatanIntiMenit: l.kegiatan_inti_menit || {},
            opsiKelompok: l.opsi_kelompok,
            opsiMandiri: l.opsi_mandiri,
            kegiatanPenutup: l.kegiatan_penutup,
          }));
        }
        return { header: r.header || {}, identifikasi: r.identifikasi || {}, desain: r.desain || {}, pengalaman };
      };

      const mapLKPD = (r: any) => r ? {
        header: r.header || {},
        petunjukKerja: r.petunjuk_kerja || [],
        stimulusKontekstual: r.stimulus || {},
        aktivitas: r.aktivitas || {},
        pertanyaanC1C6: r.pertanyaan || [],
        kesimpulan: r.kesimpulan || '',
        refleksi: r.refleksi || {},
        rubrikPenilaian: r.rubrik || [],
      } : null;

      const mapAsesmenRubrik = (r: any) => r ? {
        header: r.header || {},
        asesmenDiagnostik: r.asesmen_diagnostik || {},
        asesmenFormatif: r.asesmen_formatif || {},
        asesmenSumatif: r.asesmen_sumatif || {},
        rubrikPenilaian: r.rubrik_penilaian || [],
      } : null;

      res.json({
        pipeline: {
          id: pipeline.id,
          mapel: pipeline.mapel,
          kelasFase: pipeline.kelas_fase,
          semester: pipeline.semester,
          status: pipeline.status,
          namaGuru: pipeline.nama_guru,
          namaMadrasah: pipeline.nama_madrasah,
          createdAt: pipeline.created_at,
        },
        analisisCP: mapAnalisisCP(analisisCP.rows[0]),
        tp: mapTP(tp.rows[0]),
        atp: mapATP(atp.rows[0]),
        protaProsem: mapProtaProsem(protaProsem.rows[0]),
        modulAjar: mapModulAjar(modulAjar.rows[0], lessons.rows),
        lkpd: mapLKPD(lkpd.rows[0]),
        asesmenRubrik: mapAsesmenRubrik(asesmenRubrik.rows[0]),
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // ============================================================
  // AI GENERATION ENDPOINTS
  // ============================================================

  // 1. Analisis CP
  app.post("/api/pipeline/generate-analisis-cp", authenticate, async (req, res) => {
    try {
      const { pipelineId, namaMadrasah, namaGuru, mapel, kelasFase, semester } = req.body;
      if (!apiKey) throw new Error("OPENROUTER_API_KEY belum dikonfigurasi.");

      const prompt = `Anda adalah seorang ahli kurikulum pendidikan Indonesia, khususnya Kurikulum Merdeka.
Buatkan Analisis Capaian Pembelajaran (CP) yang mendalam untuk mata pelajaran berikut:

IDENTITAS:
- Madrasah: ${namaMadrasah || "-"}
- Guru: ${namaGuru || "-"}
- Mata Pelajaran: ${mapel}
- Fase/Kelas: ${kelasFase}
- Semester: ${semester}

Buat analisis yang mencakup:
1. Capaian Pembelajaran (CP): Rumusan CP yang sesuai dengan fase dan mapel tersebut berdasarkan Kurikulum Merdeka.
2. Analisis Kompetensi: Uraian kompetensi yang harus dikuasai siswa di akhir fase.
3. Karakteristik Mata Pelajaran: Ciri khas, pendekatan, dan nilai-nilai yang melekat pada mapel ini.
4. Rekomendasi Pendekatan: Pendekatan pembelajaran yang paling efektif untuk mapel dan fase ini.

WAJIB keluarkan JSON dengan struktur:
{
  "analisisCP": {
    "capaianPembelajaran": "...",
    "analisisKompetensi": "...",
    "karakteristikMapel": "...",
    "rekomendasiPendekatan": "..."
  }
}`;

      const response = await generateWithFallback({
        messages: [{ role: "user", content: prompt }],
      });

      const resultText = response.choices?.[0]?.message?.content;
      if (!resultText) throw new Error("AI mengembalikan teks kosong.");

      const data = JSON.parse(extractJson(resultText));
      const acp = data.analisisCP || data;

      await dbQuery(
        `INSERT INTO tbl_analisis_cp (pipeline_id, capaian_pembelajaran, analisis_kompetensi, karakteristik_mapel, rekomendasi_pendekatan)
         VALUES ($1,$2,$3,$4,$5)
         ON CONFLICT (pipeline_id) DO UPDATE SET capaian_pembelajaran=$2, analisis_kompetensi=$3, karakteristik_mapel=$4, rekomendasi_pendekatan=$5, updated_at=NOW()`,
        [pipelineId, acp.capaianPembelajaran, acp.analisisKompetensi, acp.karakteristikMapel, acp.rekomendasiPendekatan]
      );

      res.json({ analisisCP: acp });
    } catch (err: any) {
      console.error("[ANALISIS CP]", err);
      res.status(500).json({ error: err.message });
    }
  });

  // 2. TP (Tujuan Pembelajaran)
  app.post("/api/pipeline/generate-tp", authenticate, async (req, res) => {
    try {
      const { pipelineId, mapel, kelasFase, analisisCP } = req.body;
      if (!apiKey) throw new Error("OPENROUTER_API_KEY belum dikonfigurasi.");

      const prompt = `Anda adalah seorang ahli kurikulum Indonesia. Berdasarkan Analisis CP berikut, buatkan Tujuan Pembelajaran (TP):

ANALISIS CP:
- Capaian Pembelajaran: ${analisisCP?.capaianPembelajaran || "-"}
- Analisis Kompetensi: ${analisisCP?.analisisKompetensi || "-"}
- Karakteristik Mapel: ${analisisCP?.karakteristikMapel || "-"}
- Mapel: ${mapel}
- Fase/Kelas: ${kelasFase}

Buat minimal 3 Tujuan Pembelajaran yang spesifik, terukur, dan operasional.
Sertakan rasional dan kata kunci operasional.

WAJIB keluarkan JSON dengan struktur:
{
  "tp": {
    "tujuanList": ["...", "...", "..."],
    "rasional": "...",
    "kataKunci": ["...", "..."]
  }
}`;

      const response = await generateWithFallback({
        messages: [{ role: "user", content: prompt }],
      });

      const resultText = response.choices?.[0]?.message?.content;
      if (!resultText) throw new Error("AI mengembalikan teks kosong.");

      const data = JSON.parse(extractJson(resultText));
      const tp = data.tp || data;

      await dbQuery(
        `INSERT INTO tbl_tp (pipeline_id, tujuan_list, rasional, kata_kunci)
         VALUES ($1,$2,$3,$4)
         ON CONFLICT (pipeline_id) DO UPDATE SET tujuan_list=$2, rasional=$3, kata_kunci=$4, updated_at=NOW()`,
        [pipelineId, JSON.stringify(tp.tujuanList), tp.rasional, JSON.stringify(tp.kataKunci || [])]
      );

      res.json({ tp });
    } catch (err: any) {
      console.error("[TP]", err);
      res.status(500).json({ error: err.message });
    }
  });

  // 3. ATP (Alur Tujuan Pembelajaran)
  app.post("/api/pipeline/generate-atp", authenticate, async (req, res) => {
    try {
      const { pipelineId, mapel, kelasFase, semester, tp } = req.body;
      if (!apiKey) throw new Error("OPENROUTER_API_KEY belum dikonfigurasi.");

      const prompt = `Anda adalah seorang ahli kurikulum Indonesia. Berdasarkan Tujuan Pembelajaran (TP) berikut, buatkan Alur Tujuan Pembelajaran (ATP):

TP:
${(tp?.tujuanList || []).map((t: string, i: number) => `${i + 1}. ${t}`).join("\n")}
Rasional: ${tp?.rasional || "-"}
Kata Kunci: ${(tp?.kataKunci || []).join(", ")}

Mapel: ${mapel}
Fase/Kelas: ${kelasFase}
Semester: ${semester}

Buat alur pembelajaran yang logis dan berurutan dalam bentuk bab-bab, masing-masing dengan TP terkait, estimasi minggu, dan alokasi waktu.

WAJIB keluarkan JSON dengan struktur:
{
  "atp": {
    "alur": [
      { "bab": "Bab 1: ...", "tp": ["...", "..."], "minggu": "Minggu 1-4", "alokasiWaktu": "16 JP" }
    ],
    "totalJam": "..."
  }
}`;

      const response = await generateWithFallback({
        messages: [{ role: "user", content: prompt }],
      });

      const resultText = response.choices?.[0]?.message?.content;
      if (!resultText) throw new Error("AI mengembalikan teks kosong.");

      const data = JSON.parse(extractJson(resultText));
      const atp = data.atp || data;

      await dbQuery(
        `INSERT INTO tbl_atp (pipeline_id, alur, total_jam)
         VALUES ($1,$2,$3)
         ON CONFLICT (pipeline_id) DO UPDATE SET alur=$2, total_jam=$3, updated_at=NOW()`,
        [pipelineId, JSON.stringify(atp.alur), atp.totalJam]
      );

      res.json({ atp });
    } catch (err: any) {
      console.error("[ATP]", err);
      res.status(500).json({ error: err.message });
    }
  });

  // 4. Prota + Prosem
  app.post("/api/pipeline/generate-prota-prosem", authenticate, async (req, res) => {
    try {
      const { pipelineId, mapel, kelasFase, semester, atp, kalender } = req.body;
      if (!apiKey) throw new Error("OPENROUTER_API_KEY belum dikonfigurasi.");

      const mgGanjil = kalender?.mingguEfektifGanjil || 18;
      const mgGenap = kalender?.mingguEfektifGenap || 16;
      const catKalender = kalender?.catatanKalender || "-";

      const prompt = `Bertindaklah sebagai ahli kurikulum ${mapel}. Pecah CP yang diberikan ke dalam alokasi waktu mingguan. Kamu wajib mengalokasikan minimal 20% waktu dari setiap proyek untuk kegiatan Gallery Walk/Pameran Mini dan sesi refleksi penulisan Artist Statement.

IDENTITAS:
- Mapel: ${mapel}
- Fase/Kelas: ${kelasFase}
- Semester: ${semester}

KALENDER PENDIDIKAN:
- Minggu Efektif Semester Ganjil: ${mgGanjil} minggu
- Minggu Efektif Semester Genap: ${mgGenap} minggu
- Catatan Libur/Hari Besar: ${catKalender}
- Total minggu per semester (PROSEM): 24 minggu (4 minggu x 6 bulan), isi alokasi JP hanya pada minggu efektif, biarkan kosong ("") pada minggu libur/UTS/UAS.

ATP yang sudah disusun:
${JSON.stringify(atp?.alur || [])}

Buat PROTA (semester ganjil & genap) dan PROSEM (ganjil & genap) yang detail dengan mengacu pada jumlah minggu efektif di atas. Alokasikan minimal 20% waktu setiap proyek untuk Gallery Walk/Pameran Mini dan refleksi Artist Statement.

WAJIB keluarkan JSON dengan struktur persis seperti ini:
{
  "protaProsem": {
    "header": { "namaMadrasah": "", "namaGuru": "", "mapel": "", "faseKelasSmt": "", "kalenderInfo": "" },
    "prota": {
      "semesterGanjil": [{ "no": "1", "babMateri": "", "tujuanDanAlurPembelajaran": "", "alokasiWaktu": "12 JP" }],
      "semesterGenap": [{ "no": "1", "babMateri": "", "tujuanDanAlurPembelajaran": "", "alokasiWaktu": "12 JP" }],
      "totalAlokasiWaktu": "120 JP"
    },
    "prosemGanjil": {
      "bulan": ["Juli","Agustus","September","Oktober","November","Desember"],
      "materiRows": [{ "no": "1", "babMateri": "", "alokasiWaktu": "12 JP", "mingguMaping": ["","","","","","","","","","","","","","","","","","","","","","","",""] }]
    },
    "prosemGenap": {
      "bulan": ["Januari","Februari","Maret","April","Mei","Juni"],
      "materiRows": [{ "no": "1", "babMateri": "", "alokasiWaktu": "12 JP", "mingguMaping": ["","","","","","","","","","","","","","","","","","","","","","","",""] }]
    },
    "analisisMingguEfektif": { "totalMingguEfektifGanjil": "", "totalMingguEfektifGenap": "", "keteranganEfektifitas": "" }
  }
}`;

      const response = await generateWithFallback({
        messages: [{ role: "user", content: prompt }],
      });

      const resultText = response.choices?.[0]?.message?.content;
      if (!resultText) throw new Error("AI mengembalikan teks kosong.");

      const data = JSON.parse(extractJson(resultText));
      const protaProsem = data.protaProsem || data;

      await dbQuery(
        `INSERT INTO tbl_prota_prosem (pipeline_id, prota, prosem_ganjil, prosem_genap, analisis_minggu_efektif)
         VALUES ($1,$2,$3,$4,$5)
         ON CONFLICT (pipeline_id) DO UPDATE SET prota=$2, prosem_ganjil=$3, prosem_genap=$4, analisis_minggu_efektif=$5, updated_at=NOW()`,
        [pipelineId, JSON.stringify(protaProsem.prota || protaProsem), 
         JSON.stringify(protaProsem.prosemGanjil || {}), 
         JSON.stringify(protaProsem.prosemGenap || {}),
         JSON.stringify(protaProsem.analisisMingguEfektif || {})]
      );

      res.json({ protaProsem });
    } catch (err: any) {
      console.error("[PROTA]", err);
      res.status(500).json({ error: err.message });
    }
  });

  // 5. Modul Ajar — Per Pertemuan (Point 5)
  app.post("/api/pipeline/generate-modul-ajar", authenticate, async (req, res) => {
    try {
      const { pipelineId, input, analisisCP, tp, atp } = req.body;
      if (!apiKey) throw new Error("OPENROUTER_API_KEY belum dikonfigurasi.");

      const totalJP = tp?.tujuanList?.length ? tp.tujuanList.length * 2 : 4;
      const alokasiTotal = `${totalJP} JP`;
      const jumlahPertemuan = Math.ceil(totalJP / 2) || 2;

      const prompt = `Kamu adalah kurikulum desainer yang praktis. Berdasarkan topik dari Prosem dan alokasi waktu yang tersedia (${alokasiTotal}), breakdown RPP menjadi rencana aktivitas per tatap muka (${jumlahPertemuan} Pertemuan).

IDENTITAS:
- Nama Madrasah: ${input?.namaMadrasah || "-"}
- Nama Guru: ${input?.namaGuru || "-"}
- Mapel: ${input?.mapel}
- Fase/Kelas/Semester: ${input?.kelasFase} / ${input?.semester}

CAPAIAN PEMBELAJARAN:
${analisisCP?.capaianPembelajaran || "-"}

TUJUAN PEMBELAJARAN:
${(tp?.tujuanList || []).map((t: string, i: number) => `${i + 1}. ${t}`).join("\n")}

Untuk setiap pertemuan, wajib memiliki struktur kronologis berikut:
1. Identitas Pertemuan: (Pertemuan Ke-X, Alokasi Waktu: X menit).
2. Pertanyaan Pemantik Kontekstual: 1 Pertanyaan yang mengaitkan materi pertemuan itu dengan kehidupan nyata siswa kelas ${input?.kelasFase}.
3. Kegiatan Awal (10-15 Menit): Langkah konkret guru membuka kelas dan melakukan apersepsi.
4. Kegiatan Inti (Durasi Menyesuaikan): Wajib menyertakan Misi Eksplorasi berdurasi 15 menit dengan rincian waktu menit-demi-menit yang jelas.
5. Opsi Tindak Lanjut Dinamis: Sediakan panduan spesifik untuk [Opsi Kelompok] dan [Opsi Mandiri] setelah eksplorasi selesai.
6. Kegiatan Penutup (10-15 Menit): Langkah guru membuat kesimpulan dan refleksi.

WAJIB keluarkan JSON dengan struktur:
{
  "modulAjar": {
    "header": { "namaMadrasah": "", "namaGuru": "", "mapel": "", "faseKelasSmt": "", "materi": "Materi Pokok", "alokasiWaktu": "${alokasiTotal}" },
    "identifikasi": { "pesertaDidikDetail": "", "materiPelajaranCP": "", "dimensiProfil": [""], "kurikulumPancaCinta": [""] },
    "desain": {
      "capaianPembelajaran": "",
      "lintasDisiplinIlmu": "",
      "tujuanPembelajaran": [""],
      "topikPembelajaran": "",
      "praktikPedagogis": "",
      "kemitraanPembelajaran": "",
      "lingkunganPembelajaran": "",
      "pemanfaatanDigital": ""
    },
    "pengalaman": {
      "prinsipPembelajaran": "",
      "pertemuan": [
        {
          "pertemuan": 1,
          "topik": "Komponen Biotik dan Abiotik",
          "durasi": "2 JP (2 x 45 Menit)",
          "pertanyaanPemantik": "Pertanyaan kontekstual...",
          "kegiatanAwal": "Langkah apersepsi...",
          "kegiatanIntiMenit": { "namaMisi": "Eksplorasi...", "menit_1_3": "...", "menit_4_12": "...", "menit_13_15": "..." },
          "opsiKelompok": "Panduan kerja kelompok...",
          "opsiMandiri": "Panduan kerja mandiri...",
          "kegiatanPenutup": "Kesimpulan dan refleksi..."
        }
      ],
      "asesmenPembelajaran": { "awal": "", "proses": "", "akhir": "" },
      "rubrikPenilaian": [{ "aspek": "", "kriteriaSangatBaik": "", "kriteriaBaik": "", "kriteriaCukup": "", "kriteriaPerluBimbingan": "" }],
      "refleksiSiswa": [""],
      "refleksiGuru": [""]
    }
  }
}`;

      const response = await generateWithFallback({
        messages: [{ role: "user", content: prompt }],
      });

      const resultText = response.choices?.[0]?.message?.content;
      if (!resultText) throw new Error("AI mengembalikan teks kosong.");

      const data = JSON.parse(extractJson(resultText));
      const modulAjar = data.modulAjar || data;

      await dbQuery(
        `INSERT INTO tbl_modul_ajar (pipeline_id, header, identifikasi, desain, pengalaman)
         VALUES ($1,$2,$3,$4,$5)
         ON CONFLICT (pipeline_id) DO UPDATE SET header=$2, identifikasi=$3, desain=$4, pengalaman=$5, updated_at=NOW()`,
        [pipelineId,
         JSON.stringify(modulAjar.header || {}),
         JSON.stringify(modulAjar.identifikasi || {}),
         JSON.stringify(modulAjar.desain || {}),
         JSON.stringify(modulAjar.pengalaman || {})]
      );

      // Save per-meeting lessons
      const lessons = modulAjar.pengalaman?.pertemuan || [];
      if (lessons.length > 0) {
        await dbQuery("DELETE FROM tbl_lessons WHERE pipeline_id = $1", [pipelineId]);
        for (const l of lessons) {
          await dbQuery(
            `INSERT INTO tbl_lessons (pipeline_id, pertemuan_ke, topik, durasi, pertanyaan_pemantik, kegiatan_awal, kegiatan_inti_menit, opsi_kelompok, opsi_mandiri, kegiatan_penutup)
             VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
            [pipelineId, l.pertemuan, l.topik, l.durasi, l.pertanyaanPemantik, l.kegiatanAwal,
             JSON.stringify(l.kegiatanIntiMenit || {}), l.opsiKelompok, l.opsiMandiri, l.kegiatanPenutup]
          );
        }
      }

      res.json({ modulAjar });
    } catch (err: any) {
      console.error("[MODUL AJAR]", err);
      res.status(500).json({ error: err.message });
    }
  });

  // 6. LKPD
  app.post("/api/pipeline/generate-lkpd", authenticate, async (req, res) => {
    try {
      const { pipelineId, input, modulAjar } = req.body;
      if (!apiKey) throw new Error("OPENROUTER_API_KEY belum dikonfigurasi.");

      const prompt = `Rancang format LKPD yang terdiri dari 3 bagian utama:

1) Ruang Karya: sediakan grid untuk sketsa manual, area kosong untuk foto cetak, dan kolom input teks khusus untuk tautan Canva/YouTube.

2) Panduan Refleksi: gunakan 2-3 format kalimat rumpang untuk membantu siswa menulis Artist Statement.

3) Ceklis observasi mandiri.

IDENTITAS:
- Madrasah: ${input?.namaMadrasah || "-"}
- Guru: ${input?.namaGuru || "-"}
- Mapel: ${input?.mapel}
- Fase/Kelas/Smt: ${input?.kelasFase} / ${input?.semester}
- Tujuan Pembelajaran: ${(modulAjar?.desain?.tujuanPembelajaran || []).join("; ")}
- Materi: ${modulAjar?.header?.materi || "-"}

Buat LKPD sesuai 3 bagian utama di atas, dengan stimulus kontekstual, aktivitas (kelompok/individu), 8 soal C1-C6, kesimpulan, refleksi, rubrik.

WAJIB keluarkan JSON dengan struktur:
{
  "lkpd": {
    "header": { "namaMadrasah": "", "namaGuru": "", "mapel": "", "faseKelasSmt": "", "materi": "", "alokasiWaktu": "2 x 45 Menit", "tujuanPembelajaran": "" },
    "petunjukKerja": [""],
    "stimulusKontekstual": { "judul": "", "narasi": "" },
    "aktivitas": { "jenis": "Kelompok", "namaAktivitas": "", "panduanLangkah": [""] },
    "pertanyaanC1C6": [{ "level": "C1 - Mengingat", "pertanyaan": "", "petunjukJawaban": "" }],
    "kesimpulan": "",
    "refleksi": { "instruksi": "", "pertanyaan": [""] },
    "rubrikPenilaian": [{ "kriteria": "", "skor4": "", "skor3": "", "skor2": "", "skor1": "" }]
  }
}`;

      const response = await generateWithFallback({
        messages: [{ role: "user", content: prompt }],
      });

      const resultText = response.choices?.[0]?.message?.content;
      if (!resultText) throw new Error("AI mengembalikan teks kosong.");

      const data = JSON.parse(extractJson(resultText));
      const lkpd = data.lkpd || data;

      await dbQuery(
        `INSERT INTO tbl_lkpd (pipeline_id, header, petunjuk_kerja, stimulus, aktivitas, pertanyaan, kesimpulan, refleksi, rubrik)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
         ON CONFLICT (pipeline_id) DO UPDATE SET header=$2, petunjuk_kerja=$3, stimulus=$4, aktivitas=$5, pertanyaan=$6, kesimpulan=$7, refleksi=$8, rubrik=$9, updated_at=NOW()`,
        [pipelineId,
         JSON.stringify(lkpd.header || {}),
         JSON.stringify(lkpd.petunjukKerja || []),
         JSON.stringify(lkpd.stimulusKontekstual || {}),
         JSON.stringify(lkpd.aktivitas || {}),
         JSON.stringify(lkpd.pertanyaanC1C6 || []),
         lkpd.kesimpulan || "",
         JSON.stringify(lkpd.refleksi || {}),
         JSON.stringify(lkpd.rubrikPenilaian || [])]
      );

      res.json({ lkpd });
    } catch (err: any) {
      console.error("[LKPD]", err);
      res.status(500).json({ error: err.message });
    }
  });

  // 7. Assessment + Rubrik
  app.post("/api/pipeline/generate-assessment-rubrik", authenticate, async (req, res) => {
    try {
      const { pipelineId, input, tp, modulAjar, fokusPenilaian } = req.body;
      if (!apiKey) throw new Error("OPENROUTER_API_KEY belum dikonfigurasi.");

      const fokus = fokusPenilaian || 'Proses & Eksplorasi';

      const fokusPrompt = fokus === 'Proses & Eksplorasi'
        ? `Titik beratkan penilaian (60%) pada keberanian mencoba, kelengkapan catatan/langkah kerja, proses penyelidikan, dan variasi ide/hipotesis. Sisanya (40%) pada hasil akhir.`
        : fokus === 'Kedalaman Pemahaman & Analisis'
        ? `Titik beratkan penilaian (60%) pada kedalaman argumen, kemampuan refleksi, pemahaman konsep teoritis, dan kemampuan mengaitkan materi dengan kehidupan nyata. Sisanya (40%) pada ketepatan penyajian.`
        : fokus === 'Keterampilan Teknis & Akurasi'
        ? `Titik beratkan penilaian (60%) pada akurasi data/perhitungan, ketepatan tata bahasa, penguasaan rumus/teknik, atau kerapian penyajian sesuai karakteristik mata pelajaran ini. Sisanya (40%) pada ide dasar.`
        : '';

      const prompt = `Kamu adalah ahli evaluasi pendidikan untuk mata pelajaran ${input?.mapel || '-'}. Susunlah rubrik penilaian analitik dengan skala 1-4 untuk siswa kelas ${input?.kelasFase || '-'}. Sesuaikan kriteria dan bobot penilaian secara spesifik berdasarkan pilihan [INPUT FOKUS GURU] berikut:

FOKUS GURU: ${fokus}

${fokusPrompt}

Buat Paket Instrumen Asesmen dan Rubrik Penilaian lengkap.

IDENTITAS:
- Madrasah: ${input?.namaMadrasah || "-"}
- Guru: ${input?.namaGuru || "-"}
- Mapel: ${input?.mapel}
- Fase/Kelas/Smt: ${input?.kelasFase} / ${input?.semester}
- TP: ${(tp?.tujuanList || []).join("; ")}
- Materi: ${modulAjar?.header?.materi || "-"}

Buat Asesmen Diagnostik (kognitif + non-kognitif), Formatif (observasi sikap + penilaian diri), Sumatif (PG + esai + rubrik), dan Rubrik Penilaian terpisah.

WAJIB keluarkan JSON dengan struktur:
{
  "asesmenRubrik": {
    "header": { "namaMadrasah": "", "namaGuru": "", "mapel": "", "faseKelasSmt": "", "materi": "", "alokasiWaktu": "", "tujuanPembelajaran": "" },
    "asesmenDiagnostik": {
      "kognitif": { "tujuan": "", "pertanyaan": [{ "no": "1", "soal": "", "tindakLanjut": "" }] },
      "nonKognitif": { "tujuan": "", "aspek": [{ "pertanyaan": "", "indikator": "" }] }
    },
    "asesmenFormatif": {
      "observasiSikap": { "instruksi": "", "kriteria": [""], "rubrik": [{ "skor4": "", "skor3": "", "skor2": "", "skor1": "" }] },
      "penilaianDiri": { "instruksi": "", "pernyataan": [""] }
    },
    "asesmenSumatif": {
      "kisiKisi": "",
      "soalPgDanEsai": [{ "no": "1", "tipe": "Pilihan Ganda", "tingkatKognitif": "C4", "pertanyaan": "", "opsi": [""], "kunciJawaban": "", "penjelasan": "" }],
      "rubrikPenilaianSumatif": [{ "kriteria": "", "deskripsiSkor": [""] }]
    },
    "rubrikPenilaian": [{ "aspek": "", "kriteria": [""], "skorMaks": 4, "deskriptor": "" }]
  }
}`;

      const response = await generateWithFallback({
        messages: [{ role: "user", content: prompt }],
      });

      const resultText = response.choices?.[0]?.message?.content;
      if (!resultText) throw new Error("AI mengembalikan teks kosong.");

      const data = JSON.parse(extractJson(resultText));
      const ar = data.asesmenRubrik || data;

      await dbQuery(
        `INSERT INTO tbl_asesmen_rubrik (pipeline_id, header, asesmen_diagnostik, asesmen_formatif, asesmen_sumatif, rubrik_penilaian)
         VALUES ($1,$2,$3,$4,$5,$6)
         ON CONFLICT (pipeline_id) DO UPDATE SET header=$2, asesmen_diagnostik=$3, asesmen_formatif=$4, asesmen_sumatif=$5, rubrik_penilaian=$6, updated_at=NOW()`,
        [pipelineId,
         JSON.stringify(ar.header || {}),
         JSON.stringify(ar.asesmenDiagnostik || {}),
         JSON.stringify(ar.asesmenFormatif || {}),
         JSON.stringify(ar.asesmenSumatif || {}),
         JSON.stringify(ar.rubrikPenilaian || [])]
      );

      res.json({ asesmenRubrik: ar });
    } catch (err: any) {
      console.error("[ASSESSMENT]", err);
      res.status(500).json({ error: err.message });
    }
  });

  // Pipeline delete
  app.delete("/api/pipeline/:id", authenticate, async (req, res) => {
    try {
      const { id } = req.params;
      await dbQuery("DELETE FROM tbl_pipeline WHERE id=$1", [id]);
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // ============================================================
  // VITE / STATIC SERVING
  // ============================================================
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Server] Running on port ${PORT}`);
  });
}

startServer();
