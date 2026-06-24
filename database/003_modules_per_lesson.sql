-- ============================================================
-- MIGRATION 003: Tabel LKPD & Assessment Per Pertemuan
-- Relasi: lesson_id (FK ke tbl_lessons), bukan pipeline_id
-- ============================================================

-- 1. LKPD per pertemuan
CREATE TABLE IF NOT EXISTS tbl_lkpds (
    id SERIAL PRIMARY KEY,
    lesson_id INT NOT NULL UNIQUE REFERENCES tbl_lessons(id) ON DELETE CASCADE,
    instruksi_misi TEXT NOT NULL DEFAULT '',
    kalimat_rumpang JSONB DEFAULT '[]',
    tipe_input JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_lkpds_lesson ON tbl_lkpds(lesson_id);

-- 2. Assessment per pertemuan
CREATE TABLE IF NOT EXISTS tbl_assessments (
    id SERIAL PRIMARY KEY,
    lesson_id INT NOT NULL UNIQUE REFERENCES tbl_lessons(id) ON DELETE CASCADE,
    fokus_penilaian VARCHAR(100) NOT NULL DEFAULT '',
    rubrik_json JSONB DEFAULT '[]',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_assessments_lesson ON tbl_assessments(lesson_id);
