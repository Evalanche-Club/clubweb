/* ============================================================
   EVALANCHE CLUB — SUPABASE CONFIG
   ============================================================
   ⚠️  IMPORTANT: Replace the placeholders below with your
   real Supabase credentials before deploying.
   
   WHERE TO FIND THEM:
   1. Go to https://supabase.com/dashboard/project/[your-project]
   2. Left sidebar → Project Settings → API
   3. Copy "Project URL" → SUPABASE_URL
   4. Copy "anon public" key → SUPABASE_ANON
   ============================================================ */

const SUPABASE_URL  = 'https://ymprftmrojvmuvklyjay.supabase.co';
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InltcHJmdG1yb2p2bXV2a2x5amF5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM1MDQ1NTksImV4cCI6MjA4OTA4MDU1OX0.kR9gnlaoAqs1LcdRO3t5DtG5rWKbpA3AyHKOhkF3RsM';  // ← paste your anon key

// Storage bucket names (must match what you created in Supabase)
const BUCKET_GALLERY = 'gallery';
const BUCKET_MEMBERS = 'members';

// Admin email — used to identify the admin user in the UI
const ADMIN_EMAIL = 'qpoire02@gmail.com';
