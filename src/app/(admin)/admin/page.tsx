export const dynamic = "force-dynamic"

"use client"

import { useState, useEffect } from "react"
import { Eye, FolderOpen, Users, TrendingUp, DollarSign, ClipboardCheck, Star, BarChart3 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { formatCurrency, formatDate } from "@/lib/utils"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts"
import type { Portfolio, Profile, AffiliatePayment } from "@/types"

interface DashboardStats {
  totalPortfolios: number
  pendingReview: number
  totalStudents: number
  totalAffiliates: number
  totalViews: number
  monthlyViews: number
  totalPayable: number
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [topPortfolios, setTopPortfolios] = useState<Portfolio[]>([])
  const [viewsData, setViewsData] = useState<{ date: string; views: number }[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchDashboard = async () => {
      const [
        { count: totalPortfolios },
        { count: pendingReview },
        { count: totalStudents },
        { count: totalAffiliates },
        { data: topPorts },
        { data: viewsAgg },
      ] = await Promise.all([
        supabase.from("portfolios").select("*", { count: "exact", head: true }).eq("status", "approved"),
        supabase.from("portfolios").select("*", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "student"),
        supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "affiliate"),
        supabase.from("portfolios").select("id, title, owner_name, faculty, view_count, cover_image_url, is_admitted").eq("status", "approved").eq("is_visible", true).order("view_count", { ascending: false }).limit(5),
        supabase.from("portfolio_views").select("created_at").gte("created_at", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()),
      ])

      // Aggregate views by day
      const viewsByDay: Record<string, number> = {}
      if (viewsAgg) {
        viewsAgg.forEach((v: { created_at: string }) => {
          const day = new Date(v.created_at).toLocaleDateString("th-TH", { month: "short", day: "numeric" })
          viewsByDay[day] = (viewsByDay[day] || 0) + 1
        })
      }

      setStats({
        totalPortfolios: totalPortfolios || 0,
        pendingReview: pendingReview || 0,
        totalStudents: totalStudents || 0,
        totalAffiliates: totalAffiliates || 0,
        totalViews: (viewsAgg || []).length,
        monthlyViews: (viewsAgg || []).length,
        totalPayable: ((viewsAgg || []).length * 0.5), // Example KPI rate
      })

      setTopPortfolios((topPorts as Portfolio[]) || [])
      setViewsData(
        Object.entries(viewsByDay)
          .slice(-14)
          .map(([date, views]) => ({ date, views }))
      )
      setLoading(false)
    }
    fetchDashboard()
  }, [])

  const statCards = [
    { label: "Portfolio ที่อนุมัติ", value: stats?.totalPortfolios, icon: FolderOpen, color: "text-indigo-600", bg: "bg-indigo-50" },
    { label: "รอพิจารณา", value: stats?.pendingReview, icon: ClipboardCheck, color: "text-amber-600", bg: "bg-amber-50", badge: stats?.pendingReview || 0 },
    { label: "นักเรียนทั้งหมด", value: stats?.totalStudents, icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Affiliate ทั้งหมด", value: stats?.totalAffiliates, icon: Star, color: "text-purple-600", bg: "bg-purple-50" },
    { label: "Views (30 วัน)", value: stats?.monthlyViews, icon: Eye, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "ยอดต้องจ่าย (เดือนนี้)", value: stats ? formatCurrency(stats.totalPayable) : "—", icon: DollarSign, color: "text-orange-600", bg: "bg-orange-50" },
  ]

  return (
    <div className="space-y-6 page-transition">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-500 mt-1">ภาพรวมระบบ Pastport</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon
          return (
            <Card key={card.label} className="relative">
              <CardContent className="p-4">
                <div className={`w-10 h-10 ${card.bg} rounded-xl flex items-center justify-center mb-3`}>
                  <Icon className={`h-5 w-5 ${card.color}`} />
                </div>
                {loading ? (
                  <Skeleton className="h-7 w-16 mb-1" />
                ) : (
                  <p className="text-2xl font-bold text-slate-900">{card.value ?? "—"}</p>
                )}
                <p className="text-xs text-slate-500 mt-0.5">{card.label}</p>
                {card.badge && card.badge > 0 && (
                  <Badge variant="warning" className="absolute top-3 right-3 text-xs">{card.badge}</Badge>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Views Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <BarChart3 className="h-4 w-4 text-indigo-600" />
              Views 14 วันล่าสุด
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-48 w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={viewsData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 12 }}
                  />
                  <Bar dataKey="views" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Top Portfolios */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="h-4 w-4 text-indigo-600" />
              Portfolio ยอดนิยม
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {loading ? (
              Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)
            ) : (
              topPortfolios.map((port, idx) => (
                <div key={port.id} className="flex items-center gap-3">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    idx === 0 ? "bg-yellow-100 text-yellow-700" :
                    idx === 1 ? "bg-slate-100 text-slate-700" :
                    idx === 2 ? "bg-orange-100 text-orange-700" :
                    "bg-slate-50 text-slate-500"
                  }`}>
                    {idx + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800 truncate">{port.title}</p>
                    <p className="text-xs text-slate-500">{port.faculty}</p>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-slate-500">
                    <Eye className="h-3 w-3" />
                    {port.view_count.toLocaleString()}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
