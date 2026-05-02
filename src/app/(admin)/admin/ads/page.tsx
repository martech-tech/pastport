export const dynamic = "force-dynamic"

"use client"

import { useState, useEffect } from "react"
import { Plus, Trash2, Edit, Image as ImageIcon, MoreVertical, Eye, BarChart2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu"
import { Skeleton } from "@/components/ui/skeleton"
import { formatDate } from "@/lib/utils"
import type { BannerAd, AdPosition } from "@/types"

const MAX_ADS = 40

const schema = z.object({
  title: z.string().min(1, "กรุณากรอกชื่อ"),
  image_url: z.string().url("กรุณากรอก URL รูปภาพ").or(z.literal("")),
  link_url: z.string().url("กรุณากรอก URL").or(z.literal("")),
  position: z.enum(["top", "bottom", "sidebar", "in_feed"]),
  order_index: z.coerce.number().min(1).max(40),
})

type FormData = z.infer<typeof schema>

export default function AdminAdsPage() {
  const [ads, setAds] = useState<BannerAd[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<BannerAd | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<BannerAd | null>(null)
  const supabase = createClient()

  const { register, handleSubmit, reset, setValue, watch, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema) as any,
    defaultValues: { position: "top", order_index: 1 },
  })

  useEffect(() => { fetchAds() }, [])

  const fetchAds = async () => {
    setLoading(true)
    const { data } = await supabase.from("banner_ads").select("*").order("order_index")
    setAds((data as BannerAd[]) || [])
    setLoading(false)
  }

  const openCreate = () => {
    if (ads.length >= MAX_ADS) return alert(`ไม่สามารถเพิ่มได้เกิน ${MAX_ADS} รายการ`)
    setEditTarget(null)
    reset({ position: "top", order_index: ads.length + 1 })
    setModalOpen(true)
  }

  const openEdit = (ad: BannerAd) => {
    setEditTarget(ad)
    reset({ title: ad.title, image_url: ad.image_url, link_url: ad.link_url || "", position: ad.position, order_index: ad.order_index })
    setModalOpen(true)
  }

  const onSubmit = async (data: FormData) => {
    if (editTarget) {
      const { data: updated } = await supabase
        .from("banner_ads").update(data).eq("id", editTarget.id).select().single()
      setAds(prev => prev.map(a => a.id === editTarget.id ? updated as BannerAd : a))
    } else {
      const { data: created } = await supabase
        .from("banner_ads").insert({ ...data, is_visible: true, click_count: 0, view_count: 0 }).select().single()
      setAds(prev => [...prev, created as BannerAd])
    }
    setModalOpen(false)
    reset()
  }

  const toggleVisibility = async (ad: BannerAd) => {
    await supabase.from("banner_ads").update({ is_visible: !ad.is_visible }).eq("id", ad.id)
    setAds(prev => prev.map(a => a.id === ad.id ? { ...a, is_visible: !a.is_visible } : a))
  }

  const deleteAd = async () => {
    if (!deleteTarget) return
    await supabase.from("banner_ads").delete().eq("id", deleteTarget.id)
    setAds(prev => prev.filter(a => a.id !== deleteTarget.id))
    setDeleteTarget(null)
  }

  const positionLabels: Record<AdPosition, string> = {
    top: "ด้านบน", bottom: "ด้านล่าง", sidebar: "Sidebar", in_feed: "In-Feed"
  }

  return (
    <div className="space-y-6 page-transition">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Banner Ads</h1>
          <p className="text-slate-500 mt-1">{ads.length}/{MAX_ADS} รายการ</p>
        </div>
        <Button onClick={openCreate} disabled={ads.length >= MAX_ADS}>
          <Plus className="h-4 w-4 mr-2" />
          เพิ่ม Banner Ad
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {["top", "bottom", "sidebar", "in_feed"].map(pos => (
          <Card key={pos}>
            <CardContent className="p-4">
              <p className="text-xs text-slate-500 mb-1">{positionLabels[pos as AdPosition]}</p>
              <p className="text-2xl font-bold text-slate-800">
                {ads.filter(a => a.position === pos).length}
              </p>
              <p className="text-xs text-slate-400">รายการ</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Ads Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array(6).fill(0).map((_, i) => <Skeleton key={i} className="h-48 rounded-xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {ads.map(ad => (
            <Card key={ad.id} className={`overflow-hidden ${!ad.is_visible ? "opacity-60" : ""}`}>
              {/* Image Preview */}
              <div className="relative h-32 bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                {ad.image_url ? (
                  <img src={ad.image_url} alt={ad.title} className="w-full h-full object-cover" />
                ) : (
                  <ImageIcon className="h-8 w-8 text-slate-300" />
                )}
                <div className="absolute top-2 left-2 flex gap-1">
                  <Badge variant={ad.is_visible ? "success" : "secondary"}>
                    {ad.is_visible ? "เปิด" : "ปิด"}
                  </Badge>
                  <Badge variant="outline">{positionLabels[ad.position]}</Badge>
                </div>
              </div>

              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-slate-800 truncate">{ad.title}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">ลำดับที่ {ad.order_index}</p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => openEdit(ad)}>
                        <Edit className="h-4 w-4 mr-2" /> แก้ไข
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => toggleVisibility(ad)}>
                        {ad.is_visible ? <><Eye className="h-4 w-4 mr-2" />ปิดการมองเห็น</> : <><Eye className="h-4 w-4 mr-2" />เปิดการมองเห็น</>}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => setDeleteTarget(ad)} className="text-red-600">
                        <Trash2 className="h-4 w-4 mr-2" /> ลบ
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="flex items-center gap-4 mt-3 text-xs text-slate-500">
                  <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{ad.view_count} views</span>
                  <span className="flex items-center gap-1"><BarChart2 className="h-3 w-3" />{ad.click_count} clicks</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editTarget ? "แก้ไข Banner Ad" : "เพิ่ม Banner Ad"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input {...register("title")} label="ชื่อ Banner" placeholder="ชื่อ Banner Ad" error={errors.title?.message} />
            <Input {...register("image_url")} label="URL รูปภาพ" placeholder="https://..." error={errors.image_url?.message} />
            <Input {...register("link_url")} label="URL ปลายทาง" placeholder="https://..." error={errors.link_url?.message} />
            <div className="grid grid-cols-2 gap-3">
              <Select value={watch("position")} onValueChange={v => setValue("position", v as AdPosition)}>
                <SelectTrigger label="ตำแหน่ง">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(positionLabels).map(([v, l]) => (
                    <SelectItem key={v} value={v}>{l}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input {...register("order_index")} type="number" label="ลำดับ (1-40)" min={1} max={40} error={errors.order_index?.message} />
            </div>
            <DialogFooter>
              <Button variant="outline" type="button" onClick={() => setModalOpen(false)}>ยกเลิก</Button>
              <Button type="submit" loading={isSubmitting}>{editTarget ? "บันทึก" : "เพิ่ม"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>ยืนยันการลบ</DialogTitle></DialogHeader>
          <p className="text-sm text-slate-600">ต้องการลบ <strong>{deleteTarget?.title}</strong>?</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>ยกเลิก</Button>
            <Button variant="destructive" onClick={deleteAd}>ลบ</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
