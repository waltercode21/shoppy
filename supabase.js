// Supabase configuration
const SUPABASE_URL = 'https://dmxxwjjuozyvtjnbrltt.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_itqhRodMWgZJXlyJ-tOoEg_AEfXfriU';

// Initialize the client
// 'supabase' is the global object from the CDN
const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Export for use in app.js
window.supabase = _supabase;
