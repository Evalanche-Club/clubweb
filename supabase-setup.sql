-- ============================================================
-- EVALANCHE CLUB — SUPABASE DATABASE SETUP
-- Run this entire file in: Supabase → SQL Editor → New Query
-- ============================================================

-- ── MEMBERS TABLE ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS members (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at    TIMESTAMPTZ DEFAULT now(),
  first_name    TEXT NOT NULL,
  last_name     TEXT,
  email         TEXT UNIQUE NOT NULL,
  phone         TEXT,
  virtual_id    TEXT UNIQUE NOT NULL,
  year          TEXT,
  section       TEXT,
  interest      TEXT,
  role          TEXT DEFAULT 'member',   -- 'member' | 'admin' | 'core_team'
  status        TEXT DEFAULT 'pending',  -- 'pending' | 'active' | 'suspended'
  profile_pic   TEXT,                    -- public URL from storage
  bio           TEXT,
  joined_batch  TEXT
);

-- ── GALLERY TABLE ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS gallery (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at  TIMESTAMPTZ DEFAULT now(),
  title       TEXT NOT NULL,
  description TEXT,
  image_url   TEXT NOT NULL,             -- public URL from storage
  category    TEXT DEFAULT 'general',   -- hackathon|technical|cultural|workshop|team|general
  event_name  TEXT,
  year        TEXT,
  uploaded_by TEXT,
  visible     BOOLEAN DEFAULT true
);

-- ── EVENTS TABLE ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS events (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at   TIMESTAMPTZ DEFAULT now(),
  title        TEXT NOT NULL,
  description  TEXT,
  date         DATE,
  time         TEXT,
  venue        TEXT,
  category     TEXT DEFAULT 'technical', -- technical|cultural|soft-skills|workshop
  type         TEXT DEFAULT 'team',      -- team|individual|open
  duration     TEXT,
  status       TEXT DEFAULT 'upcoming',  -- upcoming|ongoing|completed
  cover_image  TEXT,
  registration_open BOOLEAN DEFAULT false,
  max_teams    INTEGER,
  team_size    TEXT,
  prize_pool   TEXT
);

-- ── ANNOUNCEMENTS TABLE ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS announcements (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at  TIMESTAMPTZ DEFAULT now(),
  title       TEXT NOT NULL,
  body        TEXT,
  type        TEXT DEFAULT 'info',  -- info|warning|success
  visible     BOOLEAN DEFAULT true,
  pinned      BOOLEAN DEFAULT false
);

-- ── SITE SETTINGS TABLE ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS site_settings (
  key   TEXT PRIMARY KEY,
  value TEXT
);

-- Default settings
INSERT INTO site_settings (key, value) VALUES
  ('stat_members',    '500'),
  ('stat_events',     '40'),
  ('stat_domains',    '12'),
  ('stat_years',      '5'),
  ('hero_tagline',    'For the students · By the students · Since 2020'),
  ('club_description','The Evalanche Club is the student-led technical and cultural hub of the Department of Electronics and Communication Engineering at Jain (Deemed-to-be) University.'),
  ('instagram',       '@evalanche_club'),
  ('linkedin',        'Evalanche Club'),
  ('contact_email',   'evalanche@jainuniversity.ac.in')
ON CONFLICT (key) DO NOTHING;

-- ── STORAGE BUCKETS ──────────────────────────────────────────
-- Gallery images (public read)
INSERT INTO storage.buckets (id, name, public)
VALUES ('gallery', 'gallery', true)
ON CONFLICT (id) DO NOTHING;

-- Member profile pictures (public read)
INSERT INTO storage.buckets (id, name, public)
VALUES ('members', 'members', true)
ON CONFLICT (id) DO NOTHING;

-- ── ROW LEVEL SECURITY ───────────────────────────────────────
-- Public can read everything
ALTER TABLE members       ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery       ENABLE ROW LEVEL SECURITY;
ALTER TABLE events        ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- Anyone can read
CREATE POLICY "public read members"       ON members       FOR SELECT USING (true);
CREATE POLICY "public read gallery"       ON gallery       FOR SELECT USING (true);
CREATE POLICY "public read events"        ON events        FOR SELECT USING (true);
CREATE POLICY "public read announcements" ON announcements FOR SELECT USING (true);
CREATE POLICY "public read settings"      ON site_settings FOR SELECT USING (true);

-- Only authenticated users (admin) can write
CREATE POLICY "auth write members"        ON members       FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "auth write gallery"        ON gallery       FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "auth write events"         ON events        FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "auth write announcements"  ON announcements FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "auth write settings"       ON site_settings FOR ALL USING (auth.role() = 'authenticated');

-- Storage policies
CREATE POLICY "public read gallery storage"  ON storage.objects FOR SELECT USING (bucket_id = 'gallery');
CREATE POLICY "public read members storage"  ON storage.objects FOR SELECT USING (bucket_id = 'members');
CREATE POLICY "auth upload gallery"          ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'gallery' AND auth.role() = 'authenticated');
CREATE POLICY "auth upload members"          ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'members' AND auth.role() = 'authenticated');
CREATE POLICY "auth delete gallery"          ON storage.objects FOR DELETE USING (bucket_id = 'gallery' AND auth.role() = 'authenticated');
CREATE POLICY "auth delete members"          ON storage.objects FOR DELETE USING (bucket_id = 'members' AND auth.role() = 'authenticated');
