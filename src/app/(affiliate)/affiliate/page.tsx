"use client"

import { useState, useEffect } from "react"
import { Plus, Eye, TrendingUp, DollarSign, Clock, CheckCircle, XCircle, Edit2, EyeOff, AlertCircle } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/components/providers"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { Switch } from "@/components/ui/switch"
import { formatCurrency, formatDate } from "@/lib/utils"
import type { Portfolio, KpiSettings } from "@/types"

const statusMap = {
  pending: { label: "รอพิจารณา", variant: "warning" as const, icon: Clock },
  under_review: { label: "กำลังพิจารณา", variant: "info" as const, icon: AlertCircle },
  approved: { label: "อนุมัติแล้ว", variant: "success" as const, icon: CheckCircle },
  rejected: { label: "ไม่ผ่าน", variant: "destructive" as const, icon: XCircle },
  revision_needed: { label: "แก้ไขก่อน", variant: "warning" as const, icon: AlertCircle },
}

export default function AffiliateDashboard() {
  const { user, profile } = useAuth()
  const [portfolios, setPortfolios] = useState<Portfolio[]>([])
  const [kpi, setKpi] = useState<KpiSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    if (!user) return
    const fetchData = async () => {
      const [{ data: ports }, { data: kpiData }] = await Promise.all([
        supabase
          .from("portfolios")
          .select("*, pages:portfolio_pages(id), pins:portfolio_pins(id)")
          .eq("affiliate_id", user.id)
          .order("created_at", { ascending: false }),
        supabase.from("kpi_settings").select("*").eq("is_active", true).single(),
      ])
      setPortfolios((ports as Portfolio[]) || [])
      setKpi(kpiData as KpiSettings)
      setLoading(false)
    }
    fetchData()
  }, [user])

  const approved = portfolios.filter(p => p.status === "approved")
  const pending = portfolios.filter(p => ["pending", "under_review"].includes(p.status))
  const totalViews = approved.reduce((sum, p) => sum + p.view_count, 0)
  const estimatedEarnings = kpi ? totalViews * kpi.view_rate : 0

  const toggleVisibility = async (port: Portfolio) => {
    if (port.status !== "approved") return
    await supabase.from("portfolios").update({ is_visible: !port.is_visible }).eq("id", port.id)
    setPortfolios(prev => prev.map(p => p.id === port.id ? { ...p, is_visible: !p.is_visible } : p))
  }

  const statCards = [
    { label: "Portfolio อนุมัติ", value: approved.length, icon: CheckCircle, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "รอพิจารณา", value: pending.length, icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
    { label: "Views ทั้งหมด", value: totalViews.toLocaleString(), icon: Eye, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "รายได้คาดการณ์", value: formatCurrency(estimatedEarnings), icon: DollarSign, color: "text-purple-600", bg: "bg-purple-50" },
  ]

  return (
    <div className="space-y-6 page-transition">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">สวัสดี, {profile?.full_name}</h1>
          <p className="text-slate-500 mt-1">ภาพรวม Portfolio ของคุณ</p>
        </div>
        <Link href="/affiliate/submit">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            ส่ง Portfolio ใหม่
          </Button>
        </Link>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {statCards.map(card => {
          const Icon = card.icon
          return (
            <Card key={card.label}>
              <CardContent className="p-4">
                <div className={`w-10 h-10 ${card.bg} rounded-xl flex items-center justify-center mb-3`}>
                  <Icon className={`h-5 w-5 ${card.color}`} />
                </div>
                {loading ? <Skeleton className="h-7 w-16 mb-1" /> : (
                  <p className="text-2xl font-bold text-slate-900">{card.value}</p>
                )}
                <p className="text-xs text-slate-500 mt-0.5">{card.label}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* KPI Info */}
      {kpi && (
        <Card className="bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <h3 className="font-semibold text-purple-800">อัตรา KPI ปัจจุบัน</h3>
                <div className="flex gap-4 mt-1 text-sm text-purple-700">
                  <span>View: {formatCurrency(kpi.view_rate)}/ครั้ง</span>
                  <span>ดูครบ: {formatCurrency(kpi.completion_rate)}/ครั้ง</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-purple-600">ยอดขั้นต่ำก่อนจ่าย</p>
                <p className="font-bold text-purple-800">{formatCurrency(kpi.min_threshold)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Portfolio List */}
      <div>
        <h2 className="font-semibold text-slate-800 mb-4">Portfolio ทั้งหมด ({portfolios.length})</h2>

        {loading ? (
          <div className="space-y-3">
            {Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
          </div>
        ) : portfolios.length === 0 ? (
          <Card className="p-12 text-center">
            <Plus className="h-10 w-10 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 mb-4">ยังไม่มี portfolio</p>
            <Link href="/affiliate/submit">
              <Button>ส่ง Portfolio แรกของคุณ</Button>
            </Link>
          </Card>
        ) : (
          <div className="space-y-3">
            {portfolios.map(port => {
              const status = statusMap[port.status]
              const StatusIcon = status?.icon || Clock
              return (
                <Card key={port.id} className="p-4 hover:border-indigo-200 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <Badge variant={status?.variant || "outline"} className="flex items-center gap-1">
                          <StatusIcon className="h-3 w-3" />
                          {status?.label}
                        </Badge>
                        {port.is_admitted && (
                          <Badge variant="success">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            ติดรอบพอร์ต
                          </Badge>
                        )}
                      </div>
                      <h3 className="font-medium text-slate-800">{port.title}</h3>
                      <p className="text-sm text-slate-500 mt-0.5">{port.faculty} — {port.university}</p>

                      {port.status === "rejected" && port.review_notes && (
                        <div className="mt-2 text-xs bg-red-50 border border-red-200 rounded-lg p-2 text-red-700">
                          <strong>เหตุผล:</strong> {port.review_notes}
                        </div>
                      )}

                      {port.status === "revision_needed" && port.review_notes && (
                        <div className="mt-2 text-xs bg-amber-50 border border-amber-200 rounded-lg p-2 text-amber-700">
                          <strong>คำแนะนำ:</strong> {port.review_notes}
                        </div>
                      )}

                      <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
                        <span className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          {port.view_count.toLocaleString()} views
                        </span>
                        <span>{formatDate(port.created_at)}</span>
                      </div>

                      {port.status === "approved" && (
                        <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
                          <span>รายได้คาดการณ์:</span>
                          <span className="font-medium text-purple-600">
                            {kpi ? formatCurrency(port.view_count * kpi.view_rate) : "—"}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {port.status === "approved" && (
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={port.is_visible}
                            onCheckedChange={() => toggleVisibility(port)}
                            title={port.is_visible ? "ปิดการมองเห็น" : "เปิดการมองเห็น"}
                          />
                        </div>
                      )}
                      {(port.status === "approved" || port.status === "revision_needed") && (
                        <Link href={`/affiliate/portfolios/${port.id}/edit`}>
                          <Button variant="outline" size="sm">
                            <Edit2 className="h-3.5 w-3.5 mr-1" />
                            แก้ไข
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>

                  {/* Review Progress for pending */}
                  {(port.status === "pending" || port.status === "under_review") && (
                    <div className="mt-3 pt-3 border-t border-slate-100">
                      <div className="flex items-center gap-3 text-xs text-slate-500 mb-2">
                        {["ส่งแบบฟอร์ม", "รอพิจารณา", "กำลังพิจารณา", "ผลการพิจารณา"].map((step, i) => (
                          <div key={step} className="flex items-center gap-1">
                            <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                              i <= (port.status === "under_review" ? 2 : 1)
                                ? "bg-indigo-600 text-white"
                                : "bg-slate-200 text-slate-400"
                            }`}>
                              {i + 1}
                            </div>
                            <span className="hidden sm:block">{step}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
