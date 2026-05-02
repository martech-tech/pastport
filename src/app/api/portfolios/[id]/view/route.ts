import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { session_id, pages_viewed, duration_seconds, is_completed } = await req.json()

  await supabase.from("portfolio_views").upsert({
    portfolio_id: id,
    user_id: user?.id || null,
    session_id,
    pages_viewed: pages_viewed || [],
    duration_seconds: duration_seconds || 0,
    is_completed: is_completed || false,
  }, { onConflict: "session_id" })

  if (is_completed) {
    await supabase.rpc("increment_portfolio_stat", { portfolio_id: id, stat: "view_count" })
  }

  return NextResponse.json({ ok: true })
}
