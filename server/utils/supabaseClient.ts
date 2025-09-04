import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE;
const anonKey = process.env.SUPABASE_ANON_KEY;

export const getSupabaseAdmin = (): SupabaseClient => {
  if (!supabaseUrl) {
    throw new Error("SUPABASE_URL is not set");
  }
  const key = serviceRoleKey || anonKey;
  if (!key) {
    throw new Error("SUPABASE keys are not set (need SERVICE_ROLE or ANON)");
  }
  if (!serviceRoleKey) {
    console.warn("Using Supabase anon key in getSupabaseAdmin fallback. Set SUPABASE_SERVICE_ROLE_KEY for full access.");
  }
  return createClient(supabaseUrl, key);
};
