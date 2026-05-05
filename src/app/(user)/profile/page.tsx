"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { User, Mail, Phone, School, LogOut, Edit2, Save, X, BookOpen } from "lucide-react"
import { useAuth } from "@/components/providers"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { getInitials, formatDate } from "@/lib/utils"

const roleLabel: Record<string, { label: string; variant: "default" | "success" | "info" }> = {
  student:   { label: "นักเรียน",  variant: "default" },
  affiliate: { label: "Affiliate", variant: "success" },
  admin:     { label: "Admin",     variant: "info" },
}

export default function ProfilePage() {
  const { user, profile, signOut, refreshProfile } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()

  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    full_name: profile?.full_name ?? "",
    phone: profile?.phone ?? "",
    school: profile?.school ?? "",
  })

  if (!user || !profile) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <BookOpen className="h-12 w-12 text-slate-300" />
        <p className="text-slate-500">กรุณาเข้าสู่ระบบก่อน</p>
        <Button asChild>
          <a href="/login">เข้าสู่ระบบ</a>
        </Button>
      </div>
    )
  }

  const handleEdit = () => {
    setForm({
      full_name: profile.full_name,
      phone: profile.phone ?? "",
      school: profile.school ?? "",
    })
    setEditing(true)
  }

  const handleSave = async () => {
    setSaving(true)
    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: form.full_name,
        phone: form.phone || null,
        school: form.school || null,
      })
      .eq("id", user.id)

    if (error) {
      toast({ variant: "destructive", title: "บันทึกไม่สำเร็จ", description: error.message })
    } else {
      await refreshProfile()
      toast({ variant: "success", title: "บันทึกสำเร็จ" })
      setEditing(false)
    }
    setSaving(false)
  }

  const handleSignOut = async () => {
    await signOut()
    router.push("/login")
  }

  const roleMeta = roleLabel[profile.role] ?? { label: profile.role, variant: "default" as const }

  return (
    <div className="max-w-2xl mx-auto space-y-6 page-transition">
      {/* Header Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start gap-4 flex-wrap">
            <Avatar className="h-20 w-20 text-2xl">
              <AvatarImage src={profile.avatar_url ?? ""} />
              <AvatarFallback className="bg-indigo-100 text-indigo-700 text-xl font-bold">
                {getInitials(profile.full_name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <h1 className="text-2xl font-bold text-slate-900">{profile.full_name}</h1>
                <Badge variant={roleMeta.variant}>{roleMeta.label}</Badge>
              </div>
              <p className="text-slate-500 text-sm">{profile.email}</p>
              <p className="text-xs text-slate-400 mt-1">สมาชิกตั้งแต่ {formatDate(profile.created_at)}</p>
            </div>
            <div className="flex gap-2">
              {!editing && (
                <Button variant="outline" size="sm" onClick={handleEdit}>
                  <Edit2 className="h-3.5 w-3.5 mr-1.5" />
                  แก้ไข
                </Button>
              )}
              <Button variant="ghost" size="sm" onClick={handleSignOut} className="text-red-500 hover:text-red-600 hover:bg-red-50">
                <LogOut className="h-3.5 w-3.5 mr-1.5" />
                ออกจากระบบ
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <User className="h-4 w-4 text-indigo-600" />
            ข้อมูลส่วนตัว
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {editing ? (
            <>
              <Input
                label="ชื่อ-นามสกุล"
                icon={<User className="h-4 w-4" />}
                value={form.full_name}
                onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))}
              />
              <Input
                label="โรงเรียน / สถาบัน"
                icon={<School className="h-4 w-4" />}
                value={form.school}
                onChange={e => setForm(f => ({ ...f, school: e.target.value }))}
                placeholder="ชื่อโรงเรียน (ไม่บังคับ)"
              />
              <Input
                label="เบอร์โทรศัพท์"
                icon={<Phone className="h-4 w-4" />}
                value={form.phone}
                onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                placeholder="08X-XXX-XXXX (ไม่บังคับ)"
              />
              <div className="flex gap-2 pt-2">
                <Button onClick={handleSave} loading={saving}>
                  <Save className="h-4 w-4 mr-1.5" />
                  บันทึก
                </Button>
                <Button variant="outline" onClick={() => setEditing(false)} disabled={saving}>
                  <X className="h-4 w-4 mr-1.5" />
                  ยกเลิก
                </Button>
              </div>
            </>
          ) : (
            <dl className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <Mail className="h-4 w-4 text-slate-400 shrink-0" />
                <div>
                  <dt className="text-xs text-slate-400">อีเมล</dt>
                  <dd className="text-slate-800 font-medium">{profile.email}</dd>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <School className="h-4 w-4 text-slate-400 shrink-0" />
                <div>
                  <dt className="text-xs text-slate-400">โรงเรียน / สถาบัน</dt>
                  <dd className="text-slate-800 font-medium">{profile.school || <span className="text-slate-400 italic">ไม่ได้ระบุ</span>}</dd>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Phone className="h-4 w-4 text-slate-400 shrink-0" />
                <div>
                  <dt className="text-xs text-slate-400">เบอร์โทรศัพท์</dt>
                  <dd className="text-slate-800 font-medium">{profile.phone || <span className="text-slate-400 italic">ไม่ได้ระบุ</span>}</dd>
                </div>
              </div>
            </dl>
          )}
        </CardContent>
      </Card>

      {/* Portal shortcut */}
      {profile.role === "affiliate" && (
        <Card className="bg-indigo-50 border-indigo-200">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-indigo-900">Affiliate Dashboard</p>
                <p className="text-sm text-indigo-600">จัดการ portfolio และดูรายได้</p>
              </div>
              <Button asChild variant="default" size="sm">
                <a href="/affiliate">ไปที่ Dashboard</a>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      {profile.role === "admin" && (
        <Card className="bg-slate-50 border-slate-200">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-slate-900">Admin Dashboard</p>
                <p className="text-sm text-slate-600">จัดการระบบทั้งหมด</p>
              </div>
              <Button asChild variant="default" size="sm">
                <a href="/admin">ไปที่ Admin</a>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
