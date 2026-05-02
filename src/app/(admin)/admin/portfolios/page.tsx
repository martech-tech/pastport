export const dynamic = "force-dynamic"

"use client"

import { useState, useEffect, useCallback } from "react"
import { Search, Plus, Eye, EyeOff, Trash2, Edit, Filter, MoreVertical, CheckCircle } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Skeleton } from "@/components/ui/skeleton"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { formatDate } from "@/lib/utils"
import type { Portfolio } from "@/types"
import Image from "next/image"
import Link from "next/link"

const statusMap = {
  pending: { label: "รอพิจารณา", variant: "warning" as const },
  under_review: { label: "กำลังพิจารณา", variant: "info" as const },
  approved: { label: "อนุมัติ", variant: "success" as const },
  rejected: { label: "ไม่ผ่าน", variant: "destructive" as const },
  revision_needed: { label: "แก้ไขก่อน", variant: "warning" as const },
}

export default function AdminPortfoliosPage() {
  const [portfolios, setPortfolios] = useState<Portfolio[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [deleteTarget, setDeleteTarget] = useState<Portfolio | null>(null)
  const supabase = createClient()

  const fetchPortfolios = useCallback(async () => {
    setLoading(true)
    let q = supabase
      .from("portfolios")
      .select("*, affiliate:profiles(id, full_name)")
      .order("created_at", { ascending: false })

    if (query) q = q.ilike("title", `%${query}%`)
    if (statusFilter !== "all") q = q.eq("status", statusFilter)

    const { data } = await q
    setPortfolios((data as Portfolio[]) || [])
    setLoading(false)
  }, [query, statusFilter])

  useEffect(() => { fetchPortfolios() }, [fetchPortfolios])

  const toggleVisibility = async (port: Portfolio) => {
    await supabase.from("portfolios").update({ is_visible: !port.is_visible }).eq("id", port.id)
    setPortfolios(prev => prev.map(p => p.id === port.id ? { ...p, is_visible: !p.is_visible } : p))
  }

  const deletePortfolio = async () => {
    if (!deleteTarget) return
    await supabase.from("portfolios").delete().eq("id", deleteTarget.id)
    setPortfolios(prev => prev.filter(p => p.id !== deleteTarget.id))
    setDeleteTarget(null)
  }

  return (
    <div className="space-y-6 page-transition">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">จัดการ Portfolio</h1>
          <p className="text-slate-500 mt-1">{portfolios.length} รายการ</p>
        </div>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="ค้นหาชื่อ portfolio..."
              className="w-full h-10 pl-10 pr-4 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {["all", "pending", "approved", "rejected"].map(s => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  statusFilter === s
                    ? "bg-indigo-600 text-white"
                    : "bg-white border border-slate-200 text-slate-600 hover:border-indigo-300"
                }`}
              >
                {s === "all" ? "ทั้งหมด" : statusMap[s as keyof typeof statusMap]?.label}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="text-left text-xs font-semibold text-slate-500 px-4 py-3">Portfolio</th>
                <th className="text-left text-xs font-semibold text-slate-500 px-4 py-3">คณะ / มหาวิทยาลัย</th>
                <th className="text-left text-xs font-semibold text-slate-500 px-4 py-3">Affiliate</th>
                <th className="text-left text-xs font-semibold text-slate-500 px-4 py-3">สถานะ</th>
                <th className="text-left text-xs font-semibold text-slate-500 px-4 py-3">Views</th>
                <th className="text-left text-xs font-semibold text-slate-500 px-4 py-3">มองเห็น</th>
                <th className="text-left text-xs font-semibold text-slate-500 px-4 py-3">วันที่</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                Array(5).fill(0).map((_, i) => (
                  <tr key={i}>
                    {Array(8).fill(0).map((_, j) => (
                      <td key={j} className="px-4 py-3"><Skeleton className="h-4 w-full" /></td>
                    ))}
                  </tr>
                ))
              ) : portfolios.map(port => (
                <tr key={port.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-indigo-100 overflow-hidden shrink-0">
                        {port.cover_image_url && (
                          <Image src={port.cover_image_url} alt="" width={40} height={40} className="object-cover w-full h-full" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-800 line-clamp-1">{port.title}</p>
                        <p className="text-xs text-slate-500">{port.owner_name}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm text-slate-700">{port.faculty}</p>
                    <p className="text-xs text-slate-500">{port.university}</p>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600">
                    {(port.affiliate as Portfolio["affiliate"])?.full_name || "—"}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={statusMap[port.status]?.variant || "outline"}>
                      {statusMap[port.status]?.label}
                    </Badge>
                    {port.is_admitted && <CheckCircle className="h-3.5 w-3.5 text-emerald-500 inline ml-1" />}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600">{port.view_count.toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <Switch
                      checked={port.is_visible}
                      onCheckedChange={() => toggleVisibility(port)}
                    />
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-500">{formatDate(port.created_at)}</td>
                  <td className="px-4 py-3">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/portfolio/${port.id}`} target="_blank">
                            <Eye className="h-4 w-4 mr-2" /> ดู Portfolio
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/admin/portfolios/${port.id}/edit`}>
                            <Edit className="h-4 w-4 mr-2" /> แก้ไข
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => setDeleteTarget(port)}
                          className="text-red-600 focus:text-red-600 focus:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4 mr-2" /> ลบ
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {!loading && portfolios.length === 0 && (
            <div className="text-center py-12 text-slate-400">
              ไม่พบข้อมูล
            </div>
          )}
        </div>
      </Card>

      {/* Delete Confirm Dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>ยืนยันการลบ</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-slate-600">
            คุณต้องการลบ <strong>{deleteTarget?.title}</strong> ใช่หรือไม่? การกระทำนี้ไม่สามารถย้อนกลับได้
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>ยกเลิก</Button>
            <Button variant="destructive" onClick={deletePortfolio}>ลบ</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
