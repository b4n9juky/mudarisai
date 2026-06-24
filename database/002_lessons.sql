-- ============================================================
-- MIGRATION 002: Tabel Lessons (Per Pertemuan)
-- ============================================================
CREATE TABLE IF NOT EXISTS tbl_lessons (
    id SERIAL PRIMARY KEY,
    pipeline_id INT NOT NULL REFERENCES tbl_pipeline(id) ON DELETE CASCADE,
    pertemuan_ke INT NOT NULL,
    topik VARCHAR(255),
    durasi VARCHAR(100),
    pertanyaan_pemantik TEXT,
    kegiatan_awal TEXT,
    kegiatan_inti_menit JSONB DEFAULT '{}',
    opsi_kelompok TEXT,
    opsi_mandiri TEXT,
    kegiatan_penutup TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(pipeline_id, pertemuan_ke)
);

CREATE INDEX IF NOT EXISTS idx_lessons_pipeline ON tbl_lessons(pipeline_id);
