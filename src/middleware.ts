import { createServerClient, type CookieOptions } from "@supabase/auth-helpers-nextjs"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return req.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          req.cookies.set({ name, value, ...options })
          res.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          req.cookies.set({ name, value: "", ...options })
          res.cookies.set({ name, value: "", ...options })
        },
      },
    }
  )

  const { data: { session } } = await supabase.auth.getSession()

  const { pathname } = req.nextUrl

  const publicPaths = ["/login", "/register", "/forgot-password", "/terms", "/privacy", "/affiliate-agreement"]
  const isPublicPath = publicPaths.some(p => pathname.startsWith(p))
  const isPortfolioPath = pathname === "/home" || pathname.startsWith("/portfolio") || pathname.startsWith("/api")

  // Not logged in + trying to access admin or affiliate portal
  if (!session && (pathname.startsWith("/admin") || pathname.startsWith("/affiliate"))) {
    return NextResponse.redirect(new URL("/login", req.url))
  }

  const role = session?.user?.user_metadata?.role as string | undefined

  // Logged in + on public page → redirect to portal
  if (session && isPublicPath) {
    if (role === "admin") return NextResponse.redirect(new URL("/admin", req.url))
    if (role === "affiliate") return NextResponse.redirect(new URL("/affiliate", req.url))
    return NextResponse.redirect(new URL("/home", req.url))
  }

  // Role protection for admin/affiliate portals
  if (session && pathname.startsWith("/admin") && role !== "admin") {
    return NextResponse.redirect(new URL("/home", req.url))
  }

  if (session && pathname.startsWith("/affiliate") && role !== "affiliate") {
    return NextResponse.redirect(new URL("/home", req.url))
  }

  return res
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|mp3|mp4|pdf)$).*)",
  ],
}
