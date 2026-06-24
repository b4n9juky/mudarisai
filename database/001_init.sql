-- ============================================================
-- MIGRATION 001: INIT — tabel master, pipeline, auth
-- ============================================================

-- 1. MADRASAH / SEKOLAH
CREATE TABLE IF NOT EXISTS tbl_madrasah (
    id          SERIAL PRIMARY KEY,
    nama        VARCHAR(200) NOT NULL,
    alamat      TEXT,
    npsn        VARCHAR(20),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. GURU / PENYUSUN
CREATE TABLE IF NOT EXISTS tbl_guru (
    id          SERIAL PRIMARY KEY,
    madrasah_id INTEGER NOT NULL REFERENCES tbl_madrasah(id)
                ON DELETE CASCADE ON UPDATE CASCADE,
    nama        VARCHAR(150) NOT NULL,
    nip         VARCHAR(30),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_guru_madrasah ON tbl_guru(madrasah_id);

-- 3. USERS (auth)
CREATE TABLE IF NOT EXISTS tbl_users (
    id          SERIAL PRIMARY KEY,
    username    VARCHAR(50) UNIQUE NOT NULL,
    password    VARCHAR(255) NOT NULL,
    role        VARCHAR(10) NOT NULL DEFAULT 'guru'
                CHECK (role IN ('admin', 'guru')),
    guru_id     INTEGER REFERENCES tbl_guru(id)
                ON DELETE SET NULL ON UPDATE CASCADE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_username ON tbl_users(username);
CREATE INDEX IF NOT EXISTS idx_users_role ON tbl_users(role);

-- 4. PIPELINE — satu pipeline = satu sesi RPP lengkap
CREATE TABLE IF NOT EXISTS tbl_pipeline (
    id              SERIAL PRIMARY KEY,
    guru_id         INTEGER NOT NULL REFERENCES tbl_guru(id)
                    ON DELETE CASCADE ON UPDATE CASCADE,
    mapel           VARCHAR(100) NOT NULL,
    kelas_fase      VARCHAR(50) NOT NULL,
    semester        VARCHAR(20) NOT NULL,
    status          VARCHAR(20) NOT NULL DEFAULT 'draft'
                    CHECK (status IN ('draft','in_progress','completed','archived')),
    metadata        JSONB,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pipeline_guru     ON tbl_pipeline(guru_id);
CREATE INDEX IF NOT EXISTS idx_pipeline_mapel    ON tbl_pipeline(mapel);
CREATE INDEX IF NOT EXISTS idx_pipeline_status   ON tbl_pipeline(status);

-- 5. ANALISIS CP — 1:1 dengan pipeline
CREATE TABLE IF NOT EXISTS tbl_analisis_cp (
    id                      SERIAL PRIMARY KEY,
    pipeline_id             INTEGER NOT NULL UNIQUE
                            REFERENCES tbl_pipeline(id)
                            ON DELETE CASCADE ON UPDATE CASCADE,
    capaian_pembelajaran    TEXT NOT NULL,
    analisis_kompetensi     TEXT NOT NULL,
    karakteristik_mapel     TEXT NOT NULL,
    rekomendasi_pendekatan  TEXT,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. TUJUAN PEMBELAJARAN (TP) — 1:1 dengan pipeline
CREATE TABLE IF NOT EXISTS tbl_tp (
    id              SERIAL PRIMARY KEY,
    pipeline_id     INTEGER NOT NULL UNIQUE
                    REFERENCES tbl_pipeline(id)
                    ON DELETE CASCADE ON UPDATE CASCADE,
    tujuan_list     JSONB NOT NULL,
    rasional        TEXT NOT NULL,
    kata_kunci      JSONB,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. ATP (Alur Tujuan Pembelajaran) — 1:1 dengan pipeline
CREATE TABLE IF NOT EXISTS tbl_atp (
    id              SERIAL PRIMARY KEY,
    pipeline_id     INTEGER NOT NULL UNIQUE
                    REFERENCES tbl_pipeline(id)
                    ON DELETE CASCADE ON UPDATE CASCADE,
    alur            JSONB NOT NULL,
    total_jam       VARCHAR(20),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. PROTA + PROSEM — 1:1 dengan pipeline
CREATE TABLE IF NOT EXISTS tbl_prota_prosem (
    id                      SERIAL PRIMARY KEY,
    pipeline_id             INTEGER NOT NULL UNIQUE
                            REFERENCES tbl_pipeline(id)
                            ON DELETE CASCADE ON UPDATE CASCADE,
    prota                   JSONB NOT NULL,
    prosem_ganjil           JSONB NOT NULL,
    prosem_genap            JSONB NOT NULL,
    analisis_minggu_efektif JSONB NOT NULL,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. MODUL AJAR / RPP — 1:1 dengan pipeline
CREATE TABLE IF NOT EXISTS tbl_modul_ajar (
    id              SERIAL PRIMARY KEY,
    pipeline_id     INTEGER NOT NULL UNIQUE
                    REFERENCES tbl_pipeline(id)
                    ON DELETE CASCADE ON UPDATE CASCADE,
    header          JSONB NOT NULL,
    identifikasi    JSONB NOT NULL,
    desain          JSONB NOT NULL,
    pengalaman      JSONB NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. LKPD — 1:1 dengan pipeline
CREATE TABLE IF NOT EXISTS tbl_lkpd (
    id              SERIAL PRIMARY KEY,
    pipeline_id     INTEGER NOT NULL UNIQUE
                    REFERENCES tbl_pipeline(id)
                    ON DELETE CASCADE ON UPDATE CASCADE,
    header          JSONB NOT NULL,
    petunjuk_kerja  JSONB NOT NULL,
    stimulus        JSONB NOT NULL,
    aktivitas       JSONB NOT NULL,
    pertanyaan      JSONB NOT NULL,
    kesimpulan      TEXT NOT NULL,
    refleksi        JSONB NOT NULL,
    rubrik          JSONB NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 11. ASESMEN + RUBRIK — 1:1 dengan pipeline
CREATE TABLE IF NOT EXISTS tbl_asesmen_rubrik (
    id                  SERIAL PRIMARY KEY,
    pipeline_id         INTEGER NOT NULL UNIQUE
                        REFERENCES tbl_pipeline(id)
                        ON DELETE CASCADE ON UPDATE CASCADE,
    header              JSONB NOT NULL,
    asesmen_diagnostik  JSONB NOT NULL,
    asesmen_formatif    JSONB NOT NULL,
    asesmen_sumatif     JSONB NOT NULL,
    rubrik_penilaian    JSONB NOT NULL,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed default madrasah
INSERT INTO tbl_madrasah (nama) VALUES ('Madrasah Default') ON CONFLICT DO NOTHING;
