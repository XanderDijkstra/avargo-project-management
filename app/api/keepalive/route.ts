import { NextResponse } from "next/server";

import { ENGAGEMENTS_TABLE, getSupabase } from "@/lib/supabase";

// Touched daily by Vercel Cron to keep the Supabase free-tier project
// from auto-pausing after 7 days of inactivity. A single HEAD count is
// enough activity to reset that timer.
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  // If CRON_SECRET is set on Vercel, only Vercel Cron's signed requests pass.
  // If unset, the endpoint is open — fine because it only does a SELECT.
  const expected = process.env.CRON_SECRET;
  if (expected) {
    const auth = request.headers.get("authorization");
    if (auth !== `Bearer ${expected}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  try {
    const { count, error } = await getSupabase()
      .from(ENGAGEMENTS_TABLE)
      .select("slug", { count: "exact", head: true });
    if (error) throw error;
    return NextResponse.json({
      ok: true,
      clients: count ?? 0,
      at: new Date().toISOString(),
    });
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        error: err instanceof Error ? err.message : String(err),
      },
      { status: 500 },
    );
  }
}
