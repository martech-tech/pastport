"use client"

import { useState, useEffect } from "react"
import { Save, DollarSign, TrendingUp, Eye, Heart, Calculator } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { formatCurrency } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"

const schema = z.object({
  view_rate: z.coerce.number().min(0, "ต้องไม่ติดลบ"),
  completion_rate: z.coerce.number().min(0),
  like_rate: z.coerce.number().min(0),
  min_threshold: z.coerce.number().min(0),
})

type FormData = z.infer<typeof schema>

export default function AdminSettingsPage() {
  const [preview, setPreview] = useState({ views: 100, completions: 50, likes: 20 })
  const { toast } = useToast()
  const supabase = createClient()

  const { register, handleSubmit, watch, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema) as any,
    defaultValues: { view_rate: 0.5, completion_rate: 2, like_rate: 1, min_threshold: 100 },
  })

  useEffect(() => {
    supabase.from("kpi_settings").select("*").eq("is_active", true).single().then(({ data }) => {
      if (data) reset(data)
    })
  }, [])

  const values = watch()
  const estimatedPay =
    (preview.views * (values.view_rate || 0)) +
    (preview.completions * (values.completion_rate || 0)) +
    (preview.likes * (values.like_rate || 0))

  const onSubmit = async (data: FormData) => {
    const { error } = await supabase.from("kpi_settings").upsert({
      ...data,
      is_active: true,
      updated_at: new Date().toISOString(),
    })
    if (error) {
      toast({ variant: "destructive", title: "บันทึกไม่สำเร็จ" })
    } else {
      toast({ variant: "success", title: "บันทึกการตั้งค่า KPI สำเร็จ" })
    }
  }

  return (
    <div className="space-y-6 page-transition max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">ตั้งค่า KPI & การจ่ายเงิน</h1>
        <p className="text-slate-500 mt-1">กำหนดอัตราการจ่ายให้กับ Affiliate</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* KPI Rates */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <DollarSign className="h-4 w-4 text-indigo-600" />
              อัตราการจ่ายเงิน (บาท)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input
                {...register("view_rate")}
                type="number"
                step="0.01"
                label="บาท / 1 View"
                placeholder="0.50"
                icon={<Eye className="h-4 w-4" />}
                error={errors.view_rate?.message}
              />
              <Input
                {...register("completion_rate")}
                type="number"
                step="0.01"
                label="บาท / ดูครบ 100%"
                placeholder="2.00"
                icon={<TrendingUp className="h-4 w-4" />}
                error={errors.completion_rate?.message}
              />
              <Input
                {...register("like_rate")}
                type="number"
                step="0.01"
                label="บาท / 1 Like"
                placeholder="1.00"
                icon={<Heart className="h-4 w-4" />}
                error={errors.like_rate?.message}
              />
            </div>
            <Input
              {...register("min_threshold")}
              type="number"
              label="ยอดขั้นต่ำก่อนจ่าย (บาท)"
              placeholder="100"
              error={errors.min_threshold?.message}
            />
          </CardContent>
        </Card>

        {/* Preview Calculator */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Calculator className="h-4 w-4 text-indigo-600" />
              คำนวณตัวอย่าง
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-xs text-slate-500 block mb-1">Views ตัวอย่าง</label>
                <input
                  type="number"
                  value={preview.views}
                  onChange={e => setPreview(p => ({ ...p, views: parseInt(e.target.value) || 0 }))}
                  className="w-full h-9 px-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="text-xs text-slate-500 block mb-1">ดูครบตัวอย่าง</label>
                <input
                  type="number"
                  value={preview.completions}
                  onChange={e => setPreview(p => ({ ...p, completions: parseInt(e.target.value) || 0 }))}
                  className="w-full h-9 px-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="text-xs text-slate-500 block mb-1">Likes ตัวอย่าง</label>
                <input
                  type="number"
                  value={preview.likes}
                  onChange={e => setPreview(p => ({ ...p, likes: parseInt(e.target.value) || 0 }))}
                  className="w-full h-9 px-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <Separator />

            <div className="bg-indigo-50 rounded-xl p-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600">{preview.views} views × {values.view_rate} บาท</span>
                  <span className="font-medium">{formatCurrency(preview.views * (values.view_rate || 0))}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">{preview.completions} ครบ × {values.completion_rate} บาท</span>
                  <span className="font-medium">{formatCurrency(preview.completions * (values.completion_rate || 0))}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">{preview.likes} likes × {values.like_rate} บาท</span>
                  <span className="font-medium">{formatCurrency(preview.likes * (values.like_rate || 0))}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold text-base">
                  <span className="text-slate-800">รวมที่ต้องจ่าย</span>
                  <span className={`${estimatedPay >= (values.min_threshold || 0) ? "text-emerald-600" : "text-amber-600"}`}>
                    {formatCurrency(estimatedPay)}
                  </span>
                </div>
                {estimatedPay < (values.min_threshold || 0) && (
                  <p className="text-xs text-amber-600">ยังไม่ถึงยอดขั้นต่ำ {formatCurrency(values.min_threshold || 0)}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Button type="submit" size="lg" loading={isSubmitting}>
          <Save className="h-4 w-4 mr-2" />
          บันทึกการตั้งค่า
        </Button>
      </form>
    </div>
  )
}
