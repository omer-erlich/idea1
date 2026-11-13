// Site configuration. The Supabase anon key is PUBLIC by design (row-level security protects the data).
// Leave SUPABASE_URL empty to run the site with the static data only (no tips, no votes).
export const CONFIG = {
  SUPABASE_URL: '',          // e.g. 'https://abcdefgh.supabase.co'
  SUPABASE_ANON_KEY: '',     // the "anon public" key from Supabase → Project settings → API
  // Where "report a correction" goes when the backend is not configured. Empty = copy/share text only.
  REPORT_EMAIL: '',
  // Auto-flag thresholds for crowd tips
  FLAG_MIN_DOWNVOTES: 3,
  STALE_MONTHS: 6,
};
export const backendEnabled = () => !!(CONFIG.SUPABASE_URL && CONFIG.SUPABASE_ANON_KEY);
