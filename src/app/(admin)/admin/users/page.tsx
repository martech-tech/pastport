"use client"

import { useState, useEffect, useCallback } from "react"
import { Search, UserCheck, UserX, Trash2, MoreVertical } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { getInitials, formatDate } from "@/lib/utils"
import type { Profile } from "@/types"

export default function AdminUsersPage() {
  const [users, setUsers] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState("")
  const [activeTab, setActiveTab] = useState("student")
  const [deleteTarget, setDeleteTarget] = useState<Profile | null>(null)
  const supabase = createClient()

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    let q = supabase.from("profiles").select("*").eq("role", activeTab).order("created_at", { ascending: false })
    if (query) q = q.ilike("full_name", `%${query}%`)
    const { data } = await q
    setUsers((data as Profile[]) || [])
    setLoading(false)
  }, [activeTab, query])

  useEffect(() => { fetchUsers() }, [fetchUsers])

  const toggleActive = async (user: Profile) => {
    await supabase.from("profiles").update({ is_active: !user.is_active }).eq("id", user.id)
    setUsers(prev => prev.map(u => u.id === user.id ? { ...u, is_active: !u.is_active } : u))
  }

  const deleteUser = async () => {
    if (!deleteTarget) return
    await supabase.from("profiles").delete().eq("id", deleteTarget.id)
    setUsers(prev => prev.filter(u => u.id !== deleteTarget.id))
    setDeleteTarget(null)
  }

  return (
    <div className="space-y-6 page-transition">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">จัดการผู้ใช้</h1>
        <p className="text-slate-500 mt-1">{users.length} รายการ</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="student">นักเรียน</TabsTrigger>
          <TabsTrigger value="affiliate">Affiliate</TabsTrigger>
          <TabsTrigger value="admin">Admin</TabsTrigger>
        </TabsList>

        <div className="mt-4">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="ค้นหาชื่อ..."
              className="w-full h-10 pl-10 pr-4 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {["student", "affiliate", "admin"].map(tab => (
            <TabsContent key={tab} value={tab}>
              <Card className="overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50">
                      <th className="text-left text-xs font-semibold text-slate-500 px-4 py-3">ผู้ใช้</th>
                      <th className="text-left text-xs font-semibold text-slate-500 px-4 py-3 hidden sm:table-cell">โรงเรียน/มหาวิทยาลัย</th>
                      <th className="text-left text-xs font-semibold text-slate-500 px-4 py-3 hidden md:table-cell">เบอร์โทร</th>
                      <th className="text-left text-xs font-semibold text-slate-500 px-4 py-3">สถานะ</th>
                      <th className="text-left text-xs font-semibold text-slate-500 px-4 py-3 hidden lg:table-cell">วันที่สมัคร</th>
                      <th className="px-4 py-3" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {loading ? (
                      Array(5).fill(0).map((_, i) => (
                        <tr key={i}>
                          {Array(6).fill(0).map((_, j) => (
                            <td key={j} className="px-4 py-3"><Skeleton className="h-4 w-full" /></td>
                          ))}
                        </tr>
                      ))
                    ) : users.map(user => (
                      <tr key={user.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8 shrink-0">
                              <AvatarImage src={user.avatar_url} />
                              <AvatarFallback className="text-xs">{getInitials(user.full_name)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-sm font-medium text-slate-800">{user.full_name}</p>
                              <p className="text-xs text-slate-500">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-600 hidden sm:table-cell">{user.school || "—"}</td>
                        <td className="px-4 py-3 text-sm text-slate-600 hidden md:table-cell">{user.phone || "—"}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <Switch checked={user.is_active} onCheckedChange={() => toggleActive(user)} />
                            <span className="text-xs text-slate-500">{user.is_active ? "เปิด" : "ปิด"}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-500 hidden lg:table-cell">{formatDate(user.created_at)}</td>
                        <td className="px-4 py-3">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-red-400 hover:text-red-600 hover:bg-red-50"
                            onClick={() => setDeleteTarget(user)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {!loading && users.length === 0 && (
                  <div className="text-center py-12 text-slate-400">ไม่พบผู้ใช้</div>
                )}
              </Card>
            </TabsContent>
          ))}
        </div>
      </Tabs>

      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>ยืนยันการลบผู้ใช้</DialogTitle></DialogHeader>
          <p className="text-sm text-slate-600">ต้องการลบ <strong>{deleteTarget?.full_name}</strong>?</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>ยกเลิก</Button>
            <Button variant="destructive" onClick={deleteUser}>ลบ</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
