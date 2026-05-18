import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let cached: SupabaseClient | null = null;

// Lazy: only resolved at first call so `next build` succeeds without env vars
// set (Vercel evaluates module top-level during route analysis).
export function getSupabase(): SupabaseClient {
  if (cached) return cached;

  const url = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      "Mangler SUPABASE_URL eller SUPABASE_SERVICE_ROLE_KEY. Sett miljøvariablene i .env.local eller i Vercel-prosjektet.",
    );
  }

  cached = createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return cached;
}

export const ENGAGEMENTS_TABLE = "engagements";
export const SERVICE_TEMPLATES_TABLE = "service_templates";
export const HOUR_ENTRIES_TABLE = "hour_entries";
