"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  LayoutDashboard, FolderOpen, Users, Megaphone, ClipboardCheck,
  Bell, Settings, LogOut, BookOpen, ChevronLeft, ChevronRight,
  DollarSign
} from "lucide-react"
import { useState } from "react"
import { useAuth } from "@/components/providers"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getInitials } from "@/lib/utils"

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/portfolios", label: "จัดการ Portfolio", icon: FolderOpen },
  { href: "/admin/review", label: "พิจารณา Portfolio", icon: ClipboardCheck },
  { href: "/admin/users", label: "จัดการผู้ใช้", icon: Users },
  { href: "/admin/ads", label: "Banner Ads", icon: Megaphone },
  { href: "/admin/payments", label: "การจ่ายเงิน", icon: DollarSign },
  { href: "/admin/notifications", label: "แจ้งเตือน", icon: Bell },
  { href: "/admin/settings", label: "ตั้งค่า KPI", icon: Settings },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { profile, signOut } = useAuth()
  const [collapsed, setCollapsed] = useState(false)

  const handleSignOut = async () => {
    await signOut()
    router.push("/login")
  }

  return (
    <aside className={cn(
      "fixed left-0 top-0 z-30 h-screen border-r border-slate-200 bg-white flex flex-col transition-all duration-300",
      collapsed ? "w-16" : "w-64"
    )}>
      {/* Logo */}
      <div className="flex h-16 items-center justify-between px-4 border-b border-slate-200">
        {!collapsed && (
          <Link href="/admin" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center">
              <BookOpen className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-indigo-600">Admin</span>
          </Link>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 ml-auto"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 overflow-y-auto py-4 px-2">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href))
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                    isActive
                      ? "bg-indigo-50 text-indigo-700"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
                    collapsed && "justify-center px-2"
                  )}
                  title={collapsed ? item.label : undefined}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  {!collapsed && <span>{item.label}</span>}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Profile */}
      <div className="border-t border-slate-200 p-3">
        {!collapsed && profile && (
          <div className="flex items-center gap-3 mb-3 px-1">
            <Avatar className="h-8 w-8 shrink-0">
              <AvatarImage src={profile.avatar_url} />
              <AvatarFallback className="text-xs">{getInitials(profile.full_name)}</AvatarFallback>
            </Avatar>
            <div className="overflow-hidden">
              <p className="text-sm font-medium text-slate-800 truncate">{profile.full_name}</p>
              <p className="text-xs text-slate-500">ผู้ดูแลระบบ</p>
            </div>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleSignOut}
          className={cn("w-full text-red-500 hover:text-red-600 hover:bg-red-50", collapsed && "px-2")}
        >
          <LogOut className="h-4 w-4" />
          {!collapsed && <span className="ml-2">ออกจากระบบ</span>}
        </Button>
      </div>
    </aside>
  )
}
