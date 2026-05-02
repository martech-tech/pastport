export const dynamic = "force-dynamic"

"use client"

import { useState, useEffect } from "react"
import { Send, Bell, Users, User, Briefcase } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { formatDate } from "@/lib/utils"
import type { Notification, NotificationTarget } from "@/types"

const schema = z.object({
  title: z.string().min(1, "กรุณากรอกหัวข้อ"),
  message: z.string().min(1, "กรุณากรอกข้อความ"),
  target_type: z.enum(["all", "students", "affiliates", "specific_user"]),
  target_email: z.string().optional(),
})

type FormData = z.infer<typeof schema>

const targetOptions = [
  { value: "all", label: "ทุกคน (นักเรียน + Affiliate)", icon: Users },
  { value: "students", label: "นักเรียนทั้งหมด", icon: User },
  { value: "affiliates", label: "Affiliate ทั้งหมด", icon: Briefcase },
  { value: "specific_user", label: "ระบุผู้ใช้เฉพาะ", icon: Bell },
]

export default function AdminNotificationsPage() {
  const [sent, setSent] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTarget, setSelectedTarget] = useState<NotificationTarget>("all")
  const supabase = createClient()

  const { register, handleSubmit, reset, setValue, watch, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { target_type: "all" },
  })

  useEffect(() => {
    fetchNotifications()
  }, [])

  const fetchNotifications = async () => {
    setLoading(true)
    const { data } = await supabase
      .from("notifications")
      .select("*, from_admin:profiles(full_name)")
      .order("created_at", { ascending: false })
      .limit(20)
    setSent((data as Notification[]) || [])
    setLoading(false)
  }

  const onSubmit = async (data: FormData) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    let targetUserId: string | undefined

    if (data.target_type === "specific_user" && data.target_email) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("id")
        .eq("email", data.target_email)
        .single()
      targetUserId = profile?.id
      if (!targetUserId) {
        alert("ไม่พบผู้ใช้ที่ระบุ")
        return
      }
    }

    const notifPayload = {
      from_admin_id: user.id,
      target_type: data.target_type,
      target_user_id: targetUserId || null,
      title: data.title,
      message: data.message,
      is_read: false,
    }

    // If targeting all students or affiliates, get their IDs and send individual notifs
    if (data.target_type === "students" || data.target_type === "affiliates") {
      const role = data.target_type === "students" ? "student" : "affiliate"
      const { data: users } = await supabase.from("profiles").select("id").eq("role", role).eq("is_active", true)

      if (users && users.length > 0) {
        const bulk = users.map((u: { id: string }) => ({ ...notifPayload, target_user_id: u.id }))
        await supabase.from("notifications").insert(bulk)
      }
    } else {
      await supabase.from("notifications").insert(notifPayload)
    }

    reset({ target_type: "all" })
    setSelectedTarget("all")
    fetchNotifications()
  }

  return (
    <div className="space-y-6 page-transition">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">ส่งการแจ้งเตือน</h1>
        <p className="text-slate-500 mt-1">ส่งข้อความแจ้งเตือนถึงผู้ใช้</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Compose */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Send className="h-4 w-4 text-indigo-600" />
              ส่งข้อความใหม่
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Target Selector */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">ส่งถึง</label>
                <div className="grid grid-cols-2 gap-2">
                  {targetOptions.map(({ value, label, icon: Icon }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => {
                        setSelectedTarget(value as NotificationTarget)
                        setValue("target_type", value as NotificationTarget)
                      }}
                      className={`flex items-center gap-2 p-3 rounded-xl border text-sm text-left transition-all ${
                        selectedTarget === value
                          ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                          : "border-slate-200 hover:border-indigo-200 text-slate-600"
                      }`}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      <span className="text-xs">{label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {selectedTarget === "specific_user" && (
                <Input
                  {...register("target_email")}
                  label="อีเมลผู้รับ"
                  placeholder="user@email.com"
                  error={errors.target_email?.message}
                />
              )}

              <Input
                {...register("title")}
                label="หัวข้อ"
                placeholder="หัวข้อการแจ้งเตือน"
                error={errors.title?.message}
              />

              <Textarea
                {...register("message")}
                label="ข้อความ"
                placeholder="เนื้อหาของการแจ้งเตือน..."
                className="h-28"
              />
              {errors.message && <p className="text-xs text-red-500">{errors.message.message}</p>}

              <Button type="submit" className="w-full" loading={isSubmitting}>
                <Send className="h-4 w-4 mr-2" />
                ส่งการแจ้งเตือน
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* History */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Bell className="h-4 w-4 text-indigo-600" />
              ประวัติการส่ง
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 max-h-[500px] overflow-y-auto">
            {loading ? (
              Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)
            ) : sent.length === 0 ? (
              <p className="text-center text-slate-400 py-8">ยังไม่มีประวัติการส่ง</p>
            ) : (
              sent.map(notif => (
                <div key={notif.id} className="bg-slate-50 rounded-xl p-4">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h4 className="text-sm font-medium text-slate-800">{notif.title}</h4>
                    <Badge variant={
                      notif.target_type === "all" ? "default" :
                      notif.target_type === "students" ? "info" :
                      notif.target_type === "affiliates" ? "secondary" :
                      "outline"
                    } className="text-xs shrink-0">
                      {targetOptions.find(t => t.value === notif.target_type)?.label}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-600 line-clamp-2">{notif.message}</p>
                  <p className="text-xs text-slate-400 mt-2">{formatDate(notif.created_at)}</p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
