import { createServerClient } from "@supabase/ssr"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function proxy(req: NextRequest) {
  const res = NextResponse.next()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            req.cookies.set(name, value)
            res.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  const { data: { session } } = await supabase.auth.getSession()

  const { pathname } = req.nextUrl

  const publicPaths = ["/login", "/register", "/forgot-password", "/terms", "/privacy"]
  const isPublicPath = publicPaths.some(p => pathname.startsWith(p))

  // Not logged in → block admin/affiliate
  if (!session && (pathname.startsWith("/admin") || pathname.startsWith("/affiliate"))) {
    return NextResponse.redirect(new URL("/login", req.url))
  }

  const role = session?.user?.user_metadata?.role as string | undefined

  // Logged in + on public/auth page → redirect to portal
  if (session && isPublicPath) {
    if (role === "admin") return NextResponse.redirect(new URL("/admin", req.url))
    if (role === "affiliate") return NextResponse.redirect(new URL("/affiliate", req.url))
    return NextResponse.redirect(new URL("/home", req.url))
  }

  // Role protection
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
