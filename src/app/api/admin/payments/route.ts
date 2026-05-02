import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/server"

export async function POST(req: NextRequest) {
  const supabase = await createAdminClient()

  // Get active KPI settings
  const { data: kpi } = await supabase.from("kpi_settings").select("*").eq("is_active", true).single()
  if (!kpi) return NextResponse.json({ error: "No KPI settings" }, { status: 400 })

  const now = new Date()
  const periodStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0)

  // Get all affiliates
  const { data: affiliates } = await supabase.from("profiles").select("id").eq("role", "affiliate").eq("is_active", true)
  if (!affiliates) return NextResponse.json({ ok: true, processed: 0 })

  const results = []
  for (const affiliate of affiliates) {
    // Get views for their portfolios this period
    const { data: portfolios } = await supabase
      .from("portfolios")
      .select("id")
      .eq("affiliate_id", affiliate.id)
      .eq("status", "approved")

    if (!portfolios || portfolios.length === 0) continue

    const portfolioIds = portfolios.map(p => p.id)

    const { data: views } = await supabase
      .from("portfolio_views")
      .select("*")
      .in("portfolio_id", portfolioIds)
      .gte("created_at", periodStart.toISOString())
      .lte("created_at", periodEnd.toISOString())

    const totalViews = views?.length || 0
    const totalCompletions = views?.filter(v => v.is_completed).length || 0

    const amount = (totalViews * kpi.view_rate) + (totalCompletions * kpi.completion_rate)

    if (amount >= kpi.min_threshold) {
      const { data: payment } = await supabase.from("affiliate_payments").insert({
        affiliate_id: affiliate.id,
        period_start: periodStart.toISOString(),
        period_end: periodEnd.toISOString(),
        total_views: totalViews,
        total_completions: totalCompletions,
        total_likes: 0,
        amount,
        status: "pending",
        kpi_data: { kpi_view_rate: kpi.view_rate, kpi_completion_rate: kpi.completion_rate },
      }).select().single()

      if (payment) results.push(payment)
    }
  }

  return NextResponse.json({ ok: true, processed: results.length, payments: results })
}
