import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Usernames are turned into a synthetic email because Supabase Auth
// is email/password based under the hood. This keeps the UI feeling
// like a plain "username + password" system.
export function usernameToEmail(username) {
  return `${username.trim().toLowerCase()}@espolyaryum.local`;
}

