"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { LayoutDashboard, PlusCircle, FolderOpen, Bell, LogOut, BookOpen } from "lucide-react"
import { useAuth } from "@/components/providers"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getInitials } from "@/lib/utils"

const navItems = [
  { href: "/affiliate", label: "Dashboard", icon: LayoutDashboard },
  { href: "/affiliate/submit", label: "ส่ง Portfolio", icon: PlusCircle },
  { href: "/affiliate/portfolios", label: "Portfolio ของฉัน", icon: FolderOpen },
  { href: "/affiliate/notifications", label: "แจ้งเตือน", icon: Bell },
]

export function AffiliateSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { profile, signOut } = useAuth()

  const handleSignOut = async () => {
    await signOut()
    router.push("/login")
  }

  return (
    <aside className="fixed left-0 top-0 z-30 h-screen w-64 border-r border-slate-200 bg-white flex flex-col">
      {/* Logo */}
      <div className="flex h-16 items-center px-6 border-b border-slate-200">
        <Link href="/affiliate" className="flex items-center gap-2">
          <div className="w-7 h-7 bg-purple-600 rounded-lg flex items-center justify-center">
            <BookOpen className="h-4 w-4 text-white" />
          </div>
          <span className="font-bold text-purple-700">Affiliate</span>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-2">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href || (item.href !== "/affiliate" && pathname.startsWith(item.href))
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                    isActive
                      ? "bg-purple-50 text-purple-700"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  )}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Profile */}
      <div className="border-t border-slate-200 p-4">
        {profile && (
          <div className="flex items-center gap-3 mb-3">
            <Avatar className="h-8 w-8 shrink-0">
              <AvatarImage src={profile.avatar_url} />
              <AvatarFallback className="text-xs bg-purple-100 text-purple-700">
                {getInitials(profile.full_name)}
              </AvatarFallback>
            </Avatar>
            <div className="overflow-hidden">
              <p className="text-sm font-medium text-slate-800 truncate">{profile.full_name}</p>
              <p className="text-xs text-slate-500">Affiliate</p>
            </div>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleSignOut}
          className="w-full text-red-500 hover:text-red-600 hover:bg-red-50"
        >
          <LogOut className="h-4 w-4 mr-2" />
          ออกจากระบบ
        </Button>
      </div>
    </aside>
  )
}
