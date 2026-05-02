import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { email, password, role, full_name, school, phone } = body

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  // Create auth user with auto-confirm + store role in JWT metadata
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { role, full_name },
  })

  if (authError) {
    return NextResponse.json({ error: authError.message }, { status: 400 })
  }

  // Insert profile using service role (bypasses RLS)
  const profileData: Record<string, unknown> = {
    id: authData.user.id,
    role,
    full_name,
    email,
    is_active: true,
  }

  if (school) profileData.school = school
  if (phone) profileData.phone = phone

  const { error: profileError } = await supabase.from("profiles").insert(profileData)

  if (profileError) {
    await supabase.auth.admin.deleteUser(authData.user.id)
    return NextResponse.json({ error: profileError.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
