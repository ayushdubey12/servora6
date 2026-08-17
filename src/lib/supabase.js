import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('[Supabase] Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Helper: get the current authenticated user's profile from the profiles table.
 * Returns { id, name, email, role, restaurant_id, … } or null.
 */
export async function getProfile(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  if (error) {
    console.error('[getProfile] Error:', error.message);
    return null;
  }
  return data;
}

/**
 * Helper: upsert a profile row (used after signup when the trigger doesn't fire
 * or when we need to set additional fields like restaurant_id).
 */
export async function upsertProfile(userId, fields) {
  const { data, error } = await supabase
    .from('profiles')
    .upsert({ id: userId, ...fields }, { onConflict: 'id' })
    .select()
    .single();
  if (error) {
    console.error('[upsertProfile] Error:', error.message);
    return null;
  }
  return data;
}
