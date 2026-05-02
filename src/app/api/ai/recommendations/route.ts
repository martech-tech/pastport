import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { limit = 12 } = await req.json().catch(() => ({}))

  if (!user) {
    // Guest: return popular portfolios
    const { data } = await supabase
      .from("portfolios")
      .select("id, title, owner_name, faculty, university, tags, cover_image_url, is_admitted, view_count, like_count")
      .eq("status", "approved")
      .eq("is_visible", true)
      .order("view_count", { ascending: false })
      .limit(limit)
    return NextResponse.json({ portfolios: data || [], strategy: "popular" })
  }

  // Authenticated: collaborative filtering based on view history
  const { data: userViews } = await supabase
    .from("portfolio_views")
    .select("portfolio_id, portfolios(faculty, university, tags)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(20)

  if (!userViews || userViews.length === 0) {
    // No history: return popular
    const { data } = await supabase
      .from("portfolios")
      .select("id, title, owner_name, faculty, university, tags, cover_image_url, is_admitted, view_count, like_count")
      .eq("status", "approved")
      .eq("is_visible", true)
      .order("view_count", { ascending: false })
      .limit(limit)
    return NextResponse.json({ portfolios: data || [], strategy: "popular" })
  }

  // Extract preferences from viewing history
  const facultyCount: Record<string, number> = {}
  const tagCount: Record<string, number> = {}
  const viewedIds: string[] = []

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  userViews.forEach((v: any) => {
    viewedIds.push(v.portfolio_id)
    if (v.portfolios) {
      facultyCount[v.portfolios.faculty] = (facultyCount[v.portfolios.faculty] || 0) + 1
      v.portfolios.tags?.forEach((tag: string) => {
        tagCount[tag] = (tagCount[tag] || 0) + 1
      })
    }
  })

  // Get top 3 faculties and tags
  const topFaculties = Object.entries(facultyCount).sort((a, b) => b[1] - a[1]).slice(0, 3).map(e => e[0])
  const topTags = Object.entries(tagCount).sort((a, b) => b[1] - a[1]).slice(0, 5).map(e => e[0])

  // Query portfolios matching preferences, excluding already-viewed
  let query = supabase
    .from("portfolios")
    .select("id, title, owner_name, faculty, university, tags, cover_image_url, is_admitted, view_count, like_count")
    .eq("status", "approved")
    .eq("is_visible", true)
    .not("id", "in", `(${viewedIds.join(",")})`)

  if (topFaculties.length > 0) {
    query = query.in("faculty", topFaculties)
  }

  const { data: recommended } = await query.order("view_count", { ascending: false }).limit(limit)

  // If not enough, fill with popular
  let result = recommended || []
  if (result.length < limit) {
    const { data: popular } = await supabase
      .from("portfolios")
      .select("id, title, owner_name, faculty, university, tags, cover_image_url, is_admitted, view_count, like_count")
      .eq("status", "approved")
      .eq("is_visible", true)
      .not("id", "in", `(${[...viewedIds, ...result.map((r: { id: string }) => r.id)].join(",")})`)
      .order("view_count", { ascending: false })
      .limit(limit - result.length)

    result = [...result, ...(popular || [])]
  }

  return NextResponse.json({ portfolios: result, strategy: "collaborative" })
}
