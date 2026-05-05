import { createClient } from "@supabase/supabase-js"

const PROJECT_REF   = "xlidzjgvbjorfdflxfep"
const accessToken   = process.env.SUPABASE_ACCESS_TOKEN!
const NEW_PASSWORD  = "444444"

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

const EMAILS = [
  "affiliate1@pastport.demo",
  "affiliate2@pastport.demo",
  "affiliate3@pastport.demo",
]

async function main() {
  console.log(`🔑 อัพเดท password เป็น "${NEW_PASSWORD}"...\n`)

  // ลด minimum password length เป็น 4 ผ่าน Management API
  const policyRes = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}/config/auth`, {
    method: "PATCH",
    headers: {
      "Authorization": `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ password_min_length: 4 }),
  })

  if (policyRes.ok) {
    console.log("  ✅ ตั้งค่า minimum password length = 4\n")
  } else {
    console.log("  ⚠️  ไม่สามารถเปลี่ยน password policy (อาจไม่กระทบ)\n")
  }

  // อัพเดท password ของ affiliate users
  const { data: { users } } = await admin.auth.admin.listUsers({ perPage: 100 })

  for (const email of EMAILS) {
    const user = users.find(u => u.email === email)
    if (!user) { console.log(`  ⚠️  ไม่พบ: ${email}`); continue }

    const { error } = await admin.auth.admin.updateUserById(user.id, { password: NEW_PASSWORD })
    if (error) console.error(`  ❌ ${email}: ${error.message}`)
    else        console.log(`  ✅ ${email}`)
  }

  console.log(`\n✅ เสร็จแล้ว! Login ด้วย password: ${NEW_PASSWORD}\n`)
}

main().catch(e => { console.error(e); process.exit(1) })
