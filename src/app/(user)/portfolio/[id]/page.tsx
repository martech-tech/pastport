"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, CheckCircle, GraduationCap, Eye, Volume2, Share2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { PDFViewer } from "@/components/portfolio/pdf-viewer"
import { BannerAd } from "@/components/portfolio/banner-ad"
import { getInitials, formatDate } from "@/lib/utils"
import type { Portfolio, BannerAd as BannerAdType } from "@/types"

export default function PortfolioPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null)
  const [sidebarAds, setSidebarAds] = useState<BannerAdType[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const fetchData = async () => {
      const [{ data: portData }, { data: adsData }] = await Promise.all([
        supabase
          .from("portfolios")
          .select("*, affiliate:profiles(id, full_name, avatar_url, school), pages:portfolio_pages(*), pins:portfolio_pins(*)")
          .eq("id", id)
          .eq("status", "approved")
          .eq("is_visible", true)
          .single(),
        supabase
          .from("banner_ads")
          .select("*")
          .eq("is_visible", true)
          .eq("position", "sidebar")
          .order("order_index")
          .limit(3),
      ])

      if (portData) {
        setPortfolio(portData as Portfolio)
        // Track view
        await supabase.from("portfolios").update({ view_count: (portData as Portfolio).view_count + 1 }).eq("id", id)
        await supabase.from("portfolio_views").insert({
          portfolio_id: id,
          session_id: Math.random().toString(36).slice(2),
          pages_viewed: [],
          duration_seconds: 0,
          is_completed: false,
        })
      }

      setSidebarAds((adsData as BannerAdType[]) || [])
      setLoading(false)
    }

    fetchData()
  }, [id])

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({ title: portfolio?.title, url: window.location.href })
    } else {
      navigator.clipboard.writeText(window.location.href)
    }
  }

  if (loading) {
    return (
      <div className="space-y-4 page-transition">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-96 w-full rounded-2xl" />
      </div>
    )
  }

  if (!portfolio) {
    return (
      <div className="text-center py-20">
        <h2 className="text-xl font-semibold text-slate-600">ไม่พบ portfolio นี้</h2>
        <Button variant="outline" className="mt-4" onClick={() => router.push("/")}>
          กลับหน้าหลัก
        </Button>
      </div>
    )
  }

  return (
    <div className="page-transition">
      {/* Back Button */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-slate-500 hover:text-slate-800 mb-4 text-sm"
      >
        <ArrowLeft className="h-4 w-4" />
        กลับ
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-3 space-y-4">
          {/* Portfolio Header */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-2">
                  {portfolio.is_admitted && (
                    <Badge variant="success">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      ติดรอบพอร์ต
                    </Badge>
                  )}
                  {portfolio.pages && portfolio.pages.length > 0 && (
                    <Badge variant="info">
                      <Volume2 className="h-3 w-3 mr-1" />
                      มีเสียงประกอบ
                    </Badge>
                  )}
                </div>

                <h1 className="text-2xl font-bold text-slate-900 mb-1">{portfolio.title}</h1>

                <div className="flex items-center gap-4 text-sm text-slate-500 flex-wrap">
                  <div className="flex items-center gap-1">
                    <GraduationCap className="h-4 w-4 text-indigo-500" />
                    {portfolio.faculty}
                  </div>
                  <span>•</span>
                  <span>{portfolio.university}</span>
                  <span>•</span>
                  <div className="flex items-center gap-1">
                    <Eye className="h-4 w-4" />
                    {portfolio.view_count.toLocaleString()} ครั้ง
                  </div>
                </div>
              </div>

              <Button variant="ghost" size="icon" onClick={handleShare}>
                <Share2 className="h-4 w-4" />
              </Button>
            </div>

            {/* Tags */}
            {portfolio.tags && portfolio.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {portfolio.tags.map(tag => (
                  <Badge key={tag} variant="secondary">{tag}</Badge>
                ))}
              </div>
            )}

            {/* Affiliate Info */}
            {portfolio.affiliate && (
              <div className="flex items-center gap-3 mt-4 pt-4 border-t border-slate-100">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={portfolio.affiliate.avatar_url} />
                  <AvatarFallback>{getInitials(portfolio.affiliate.full_name)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium text-slate-800">{portfolio.affiliate.full_name}</p>
                  <p className="text-xs text-slate-500">{portfolio.affiliate.school}</p>
                </div>
                <div className="ml-auto text-xs text-slate-400">
                  {formatDate(portfolio.created_at)}
                </div>
              </div>
            )}
          </div>

          {/* PDF Viewer with Audio */}
          {portfolio.pdf_url ? (
            <PDFViewer
              pdfUrl={portfolio.pdf_url}
              pages={portfolio.pages || []}
              pins={portfolio.pins || []}
              portfolioId={portfolio.id}
            />
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
              <GraduationCap className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">ไม่มีไฟล์ PDF ในขณะนี้</p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Portfolio Info Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <h3 className="font-semibold text-slate-800 mb-3">ข้อมูล Portfolio</h3>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-slate-500">เจ้าของ</dt>
                <dd className="font-medium text-slate-800">{portfolio.owner_name}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">โรงเรียน</dt>
                <dd className="font-medium text-slate-800 text-right">{portfolio.school}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">คณะ</dt>
                <dd className="font-medium text-slate-800 text-right">{portfolio.faculty}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">มหาวิทยาลัย</dt>
                <dd className="font-medium text-slate-800 text-right">{portfolio.university}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">หน้า PDF</dt>
                <dd className="font-medium">{portfolio.pages?.length || 0} หน้า</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">Pin</dt>
                <dd className="font-medium">{portfolio.pins?.length || 0} จุด</dd>
              </div>
            </dl>
          </div>

          {/* Sidebar Ads */}
          {sidebarAds.map(ad => (
            <BannerAd key={ad.id} ads={[ad]} compact />
          ))}
        </div>
      </div>
    </div>
  )
}
