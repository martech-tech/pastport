export const dynamic = "force-dynamic"

"use client"

import { useState, useEffect, useCallback } from "react"
import { Search, SlidersHorizontal, Sparkles, TrendingUp, BookOpen, X } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { PortfolioCard } from "@/components/portfolio/portfolio-card"
import { BannerAd } from "@/components/portfolio/banner-ad"
import { FACULTIES, UNIVERSITIES } from "@/lib/utils"
import type { Portfolio, BannerAd as BannerAdType } from "@/types"

const POPULAR_TAGS = ["วิศวะ", "แพทย์", "สถาปัตย์", "นิเทศ", "บัญชี", "โปรแกรมเมอร์", "ออกแบบ", "เภสัช", "ทันตแพทย์", "นิติ"]

export default function HomePage() {
  const [portfolios, setPortfolios] = useState<Portfolio[]>([])
  const [ads, setAds] = useState<BannerAdType[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState("")
  const [faculty, setFaculty] = useState("")
  const [university, setUniversity] = useState("")
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [sortBy, setSortBy] = useState("newest")
  const [isAdmittedOnly, setIsAdmittedOnly] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const supabase = createClient()

  const fetchPortfolios = useCallback(async () => {
    setLoading(true)

    if (sortBy === "recommended") {
      try {
        const res = await fetch("/api/ai/recommendations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ limit: 24 }),
        })
        const { portfolios } = await res.json()
        setPortfolios(portfolios || [])
        setLoading(false)
        return
      } catch {}
    }

    let q = supabase
      .from("portfolios")
      .select("*, affiliate:profiles(id, full_name, avatar_url)")
      .eq("status", "approved")
      .eq("is_visible", true)

    if (query) q = q.or(`title.ilike.%${query}%,owner_name.ilike.%${query}%,faculty.ilike.%${query}%`)
    if (faculty) q = q.eq("faculty", faculty)
    if (university) q = q.eq("university", university)
    if (isAdmittedOnly) q = q.eq("is_admitted", true)
    if (selectedTags.length > 0) q = q.overlaps("tags", selectedTags)

    if (sortBy === "newest") q = q.order("created_at", { ascending: false })
    else q = q.order("view_count", { ascending: false })

    const { data } = await q.limit(24)
    setPortfolios((data as Portfolio[]) || [])
    setLoading(false)
  }, [query, faculty, university, selectedTags, sortBy, isAdmittedOnly])

  const fetchAds = useCallback(async () => {
    const { data } = await supabase
      .from("banner_ads")
      .select("*")
      .eq("is_visible", true)
      .order("order_index")
      .limit(10)
    setAds((data as BannerAdType[]) || [])
  }, [])

  useEffect(() => {
    fetchPortfolios()
    fetchAds()
  }, [fetchPortfolios, fetchAds])

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag])
  }

  const clearFilters = () => {
    setQuery(""); setFaculty(""); setUniversity("")
    setSelectedTags([]); setIsAdmittedOnly(false); setSortBy("newest")
  }

  const hasFilters = query || faculty || university || selectedTags.length > 0 || isAdmittedOnly

  return (
    <div className="space-y-6 page-transition">
      {/* Hero Banner */}
      {ads.filter(a => a.position === "top").length > 0 && (
        <BannerAd ads={ads.filter(a => a.position === "top")} />
      )}

      {/* Search */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
            <BookOpen className="h-5 w-5 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900">ค้นหา Portfolio</h1>
            <p className="text-sm text-slate-500">เรียนรู้จาก portfolio จริงของรุ่นพี่ พร้อมเสียงอธิบาย</p>
          </div>
        </div>

        <div className="flex gap-2 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="ค้นหาชื่อ, คณะ, มหาวิทยาลัย..."
              className="w-full h-10 pl-10 pr-4 rounded-lg border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          <Button variant={showFilters ? "default" : "outline"} size="icon" onClick={() => setShowFilters(!showFilters)}>
            <SlidersHorizontal className="h-4 w-4" />
          </Button>
          {hasFilters && (
            <Button variant="ghost" size="icon" onClick={clearFilters}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4 pt-4 border-t border-slate-100">
            <Select value={faculty} onValueChange={setFaculty}>
              <SelectTrigger label="คณะ">
                <SelectValue placeholder="ทุกคณะ" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">ทุกคณะ</SelectItem>
                {FACULTIES.map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={university} onValueChange={setUniversity}>
              <SelectTrigger label="มหาวิทยาลัย">
                <SelectValue placeholder="ทุกมหาวิทยาลัย" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">ทุกมหาวิทยาลัย</SelectItem>
                {UNIVERSITIES.map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger label="เรียงตาม">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">ใหม่ล่าสุด</SelectItem>
                <SelectItem value="most_viewed">ยอดนิยม</SelectItem>
                <SelectItem value="recommended">แนะนำสำหรับคุณ ✨</SelectItem>
              </SelectContent>
            </Select>
            <div className="col-span-full flex items-center gap-2">
              <input type="checkbox" id="admitted" checked={isAdmittedOnly} onChange={e => setIsAdmittedOnly(e.target.checked)} className="rounded" />
              <label htmlFor="admitted" className="text-sm text-slate-600 cursor-pointer">แสดงเฉพาะ portfolio ที่ติดรอบพอร์ต</label>
            </div>
          </div>
        )}

        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-slate-500 font-medium">แท็กยอดนิยม:</span>
          {POPULAR_TAGS.map(tag => (
            <button
              key={tag}
              onClick={() => toggleTag(tag)}
              className={`text-xs px-2.5 py-1 rounded-full border transition-all ${
                selectedTags.includes(tag) ? "bg-indigo-600 text-white border-indigo-600" : "bg-white text-slate-600 border-slate-200 hover:border-indigo-300 hover:text-indigo-600"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {sortBy === "recommended" ? <><Sparkles className="h-5 w-5 text-indigo-500" /><h2 className="font-semibold text-slate-800">แนะนำสำหรับคุณ</h2></> :
           sortBy === "most_viewed" ? <><TrendingUp className="h-5 w-5 text-indigo-500" /><h2 className="font-semibold text-slate-800">Portfolio ยอดนิยม</h2></> :
           <><BookOpen className="h-5 w-5 text-indigo-500" /><h2 className="font-semibold text-slate-800">Portfolio ล่าสุด</h2></>}
          {!loading && <Badge variant="secondary">{portfolios.length} รายการ</Badge>}
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array(8).fill(0).map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="h-48 w-full rounded-xl" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      ) : portfolios.length === 0 ? (
        <div className="text-center py-20">
          <BookOpen className="h-12 w-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-500">ไม่พบ portfolio</h3>
          {hasFilters && <Button variant="outline" size="sm" className="mt-4" onClick={clearFilters}>ล้างตัวกรอง</Button>}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {portfolios.map(portfolio => <PortfolioCard key={portfolio.id} portfolio={portfolio} />)}
        </div>
      )}

      {ads.filter(a => a.position === "bottom").length > 0 && (
        <BannerAd ads={ads.filter(a => a.position === "bottom")} />
      )}
    </div>
  )
}
