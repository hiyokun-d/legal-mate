-- Legal Mate — Supabase Schema
-- Run this in Supabase Dashboard → SQL Editor → New Query

-- ============================================================
-- TABLE: reports (blacklist penipu)
-- ============================================================
CREATE TABLE IF NOT EXISTS reports (
  id         BIGSERIAL PRIMARY KEY,
  nama       TEXT        NOT NULL,
  jenis      TEXT        NOT NULL,
  modus      TEXT        NOT NULL,
  lokasi     TEXT        NOT NULL DEFAULT '',
  kontak     TEXT        NOT NULL DEFAULT '',
  scam_score INTEGER     NOT NULL DEFAULT 0,
  upvotes    INTEGER     NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLE: comments (komentar pada laporan)
-- ============================================================
CREATE TABLE IF NOT EXISTS comments (
  id         BIGSERIAL PRIMARY KEY,
  report_id  BIGINT      NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
  isi        TEXT        NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS comments_report_id_idx ON comments(report_id);

-- ============================================================
-- TABLE: ledger_books (buku catatan penjualan)
-- ============================================================
CREATE TABLE IF NOT EXISTS ledger_books (
  id          TEXT        PRIMARY KEY,
  nama_usaha  TEXT        NOT NULL DEFAULT 'Usaha Saya',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLE: transactions (catatan transaksi)
-- ============================================================
CREATE TABLE IF NOT EXISTS transactions (
  id          BIGSERIAL PRIMARY KEY,
  book_id     TEXT        NOT NULL REFERENCES ledger_books(id) ON DELETE CASCADE,
  tanggal     DATE        NOT NULL,
  keterangan  TEXT        NOT NULL,
  kategori    TEXT        NOT NULL,
  jenis       TEXT        NOT NULL CHECK (jenis IN ('pemasukan', 'pengeluaran')),
  nominal     BIGINT      NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS transactions_book_id_idx ON transactions(book_id);
CREATE INDEX IF NOT EXISTS transactions_tanggal_idx ON transactions(tanggal DESC);

-- ============================================================
-- ROW LEVEL SECURITY
-- Supabase anon key = public read + write (no auth)
-- Tables are public by design (ID-based access, no user auth)
-- ============================================================
ALTER TABLE reports      ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments     ENABLE ROW LEVEL SECURITY;
ALTER TABLE ledger_books ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Allow anon to read/write everything (app uses ID as access control)
CREATE POLICY "public_all" ON reports      FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "public_all" ON comments     FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "public_all" ON ledger_books FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "public_all" ON transactions FOR ALL USING (true) WITH CHECK (true);
