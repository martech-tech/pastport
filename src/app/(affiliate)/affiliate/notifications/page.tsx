export const dynamic = "force-dynamic"

"use client"

import { useState, useEffect } from "react"
import { Bell, CheckCheck, Clock } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/components/providers"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { formatDate } from "@/lib/utils"
import type { Notification } from "@/types"

export default function AffiliateNotificationsPage() {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    if (!user) return
    fetchNotifications()
  }, [user])

  const fetchNotifications = async () => {
    setLoading(true)
    const { data } = await supabase
      .from("notifications")
      .select("*")
      .or(`target_user_id.eq.${user?.id},target_type.in.(all,affiliates)`)
      .order("created_at", { ascending: false })
    setNotifications((data as Notification[]) || [])
    setLoading(false)
  }

  const markAllRead = async () => {
    await supabase
      .from("notifications")
      .update({ is_read: true })
      .or(`target_user_id.eq.${user?.id},target_type.in.(all,affiliates)`)
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
  }

  const markRead = async (id: string) => {
    await supabase.from("notifications").update({ is_read: true }).eq("id", id)
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n))
  }

  const unreadCount = notifications.filter(n => !n.is_read).length

  return (
    <div className="space-y-6 page-transition max-w-2xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-slate-900">การแจ้งเตือน</h1>
          {unreadCount > 0 && (
            <Badge variant="destructive">{unreadCount} ใหม่</Badge>
          )}
        </div>
        {unreadCount > 0 && (
          <Button variant="ghost" size="sm" onClick={markAllRead}>
            <CheckCheck className="h-4 w-4 mr-2" />
            อ่านทั้งหมด
          </Button>
        )}
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}
        </div>
      ) : notifications.length === 0 ? (
        <Card className="p-12 text-center">
          <Bell className="h-10 w-10 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500">ยังไม่มีการแจ้งเตือน</p>
        </Card>
      ) : (
        <div className="space-y-2">
          {notifications.map(notif => (
            <Card
              key={notif.id}
              className={`cursor-pointer transition-all ${!notif.is_read ? "border-indigo-200 bg-indigo-50/50" : ""}`}
              onClick={() => !notif.is_read && markRead(notif.id)}
            >
              <CardContent className="p-4 flex items-start gap-3">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                  !notif.is_read ? "bg-indigo-100" : "bg-slate-100"
                }`}>
                  <Bell className={`h-4 w-4 ${!notif.is_read ? "text-indigo-600" : "text-slate-400"}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className={`text-sm font-medium ${!notif.is_read ? "text-slate-900" : "text-slate-700"}`}>
                      {notif.title}
                    </h3>
                    {!notif.is_read && (
                      <div className="w-2 h-2 bg-indigo-600 rounded-full shrink-0 mt-1" />
                    )}
                  </div>
                  <p className="text-sm text-slate-500 mt-0.5 line-clamp-2">{notif.message}</p>
                  <div className="flex items-center gap-1 mt-1 text-xs text-slate-400">
                    <Clock className="h-3 w-3" />
                    {formatDate(notif.created_at)}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
