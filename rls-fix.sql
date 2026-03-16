-- ============================================================
-- EVALANCHE CLUB — RLS FIX
-- Run this in Supabase SQL Editor BEFORE deploying
-- This fixes the "stuck on pending approval" bug
-- ============================================================

-- ── STEP 1: Drop old conflicting policies ─────────────────────
DROP POLICY IF EXISTS "auth write members"       ON members;
DROP POLICY IF EXISTS "user self insert member"  ON members;
DROP POLICY IF EXISTS "user self update member"  ON members;
DROP POLICY IF EXISTS "auth full access members" ON members;

-- ── STEP 2: Admin can do everything (write/update/delete) ──────
CREATE POLICY "admin full access"
  ON members FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- ── STEP 3: Any authenticated user can INSERT their OWN row ────
-- This is needed when the user is verified via OTP and we insert
-- their member profile row while they are still authenticated.
CREATE POLICY "self insert member"
  ON members FOR INSERT
  WITH CHECK (
    auth.role() = 'authenticated'
    AND auth.email() = email
  );

-- ── STEP 4: Allow anon INSERT for signUp flow ──────────────────
-- When OTP is verified, Supabase creates an authenticated session
-- so the above policy handles it. But if anything is still anon:
CREATE POLICY "anon insert own member"
  ON members FOR INSERT
  WITH CHECK (
    auth.email() = email
  );

-- ── VERIFY: Check existing policies ────────────────────────────
SELECT policyname, cmd, roles, qual, with_check
FROM pg_policies
WHERE tablename = 'members'
ORDER BY policyname;
