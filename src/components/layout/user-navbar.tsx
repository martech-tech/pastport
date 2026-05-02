"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { Search, Bell, User, LogOut, BookOpen, Menu, X } from "lucide-react"
import { useState } from "react"
import { useAuth } from "@/components/providers"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { getInitials } from "@/lib/utils"

export function UserNavbar() {
  const { user, profile, signOut } = useAuth()
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleSignOut = async () => {
    await signOut()
    router.push("/login")
  }

  return (
    <nav className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <BookOpen className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-indigo-600">Pastport</span>
          </Link>

          {/* Search Bar - Desktop */}
          <div className="hidden md:flex flex-1 max-w-xl mx-8">
            <Link href="/" className="w-full">
              <div className="flex items-center gap-2 w-full h-10 px-4 rounded-lg border border-slate-200 bg-slate-50 text-slate-400 hover:border-indigo-300 transition-colors cursor-pointer">
                <Search className="h-4 w-4" />
                <span className="text-sm">ค้นหา portfolio, คณะ, มหาวิทยาลัย...</span>
              </div>
            </Link>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            {user && profile ? (
              <>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5 text-slate-600" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="gap-2 px-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={profile.avatar_url} />
                        <AvatarFallback>{getInitials(profile.full_name)}</AvatarFallback>
                      </Avatar>
                      <span className="hidden sm:block text-sm font-medium">{profile.full_name}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem onClick={() => router.push("/profile")}>
                      <User className="h-4 w-4 mr-2" /> โปรไฟล์
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut} className="text-red-600">
                      <LogOut className="h-4 w-4 mr-2" /> ออกจากระบบ
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login">
                  <Button variant="ghost" size="sm">เข้าสู่ระบบ</Button>
                </Link>
                <Link href="/register/student">
                  <Button size="sm">สมัครสมาชิก</Button>
                </Link>
              </div>
            )}
            <button className="md:hidden p-2" onClick={() => setMobileOpen(!mobileOpen)}>
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Search */}
        {mobileOpen && (
          <div className="md:hidden pb-4">
            <Link href="/" className="w-full">
              <div className="flex items-center gap-2 w-full h-10 px-4 rounded-lg border border-slate-200 bg-slate-50 text-slate-400">
                <Search className="h-4 w-4" />
                <span className="text-sm">ค้นหา portfolio...</span>
              </div>
            </Link>
          </div>
        )}
      </div>
    </nav>
  )
}
