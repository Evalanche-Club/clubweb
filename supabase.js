/* ============================================================
   EVALANCHE CLUB — SUPABASE CONFIG
   ============================================================
   SETUP INSTRUCTIONS:
   1. Go to https://supabase.com → New Project
   2. Copy your Project URL and anon key from:
      Project Settings → API → Project URL + anon public key
   3. Replace the two values below
   4. Run the SQL in supabase-setup.sql in your Supabase SQL editor
   ============================================================ */

const SUPABASE_URL  = 'https://ymprftmrojvmuvklyjay.supabase.co';   // e.g. https://xyzabc.supabase.co
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InltcHJmdG1yb2p2bXV2a2x5amF5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM1MDQ1NTksImV4cCI6MjA4OTA4MDU1OX0.kR9gnlaoAqs1LcdRO3t5DtG5rWKbpA3AyHKOhkF3RsM';

// Storage bucket names (created by the SQL setup script)
const BUCKET_GALLERY = 'gallery';
const BUCKET_MEMBERS = 'members';

// Admin email — change this to your email
const ADMIN_EMAIL = 'qpoire02@gmail.com';
