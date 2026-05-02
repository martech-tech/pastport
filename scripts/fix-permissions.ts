/**
 * fix-permissions.ts
 * รัน GRANT SQL ผ่าน Supabase Management API โดยไม่ต้องใช้ SQL Editor
 *
 * ขั้นตอน:
 * 1. ไปที่ https://supabase.com/dashboard/account/tokens
 * 2. กด "Generate new token" → copy token
 * 3. เพิ่ม SUPABASE_ACCESS_TOKEN=your_token ใน .env.local
 * 4. รัน: npm run fix-permissions
 */

const PROJECT_REF = "xlidzjgvbjorfdflxfep"
const accessToken = process.env.SUPABASE_ACCESS_TOKEN

if (!accessToken) {
  console.error(`
❌ ไม่พบ SUPABASE_ACCESS_TOKEN

ขั้นตอน:
1. ไปที่ https://supabase.com/dashboard/account/tokens
2. กด "Generate new token" → ตั้งชื่อ เช่น "pastport-setup"
3. Copy token ที่ได้
4. เพิ่มใน .env.local:
   SUPABASE_ACCESS_TOKEN=your_token_here
5. รัน npm run fix-permissions อีกครั้ง
`)
  process.exit(1)
}

async function runSQL(query: string, label: string) {
  const res = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query }),
  })

  if (!res.ok) {
    const err = await res.text()
    console.error(`  ❌ ${label}: ${err}`)
    return false
  }
  console.log(`  ✅ ${label}`)
  return true
}

async function main() {
  console.log("🔧 กำลังตั้งค่า Database Permissions...\n")

  const grants = [
    ["GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role",              "GRANT USAGE on schema"],
    ["GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, service_role",                       "GRANT ALL to service_role"],
    ["GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, service_role",                    "GRANT SEQUENCES to service_role"],
    ["GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon",                                      "GRANT SELECT to anon"],
    ["GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated",     "GRANT CRUD to authenticated"],
    ["GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated",                   "GRANT SEQUENCES to authenticated"],
  ] as const

  let allOk = true
  for (const [sql, label] of grants) {
    const ok = await runSQL(sql, label)
    if (!ok) allOk = false
  }

  if (allOk) {
    console.log("\n✅ Permissions ตั้งค่าเสร็จแล้ว!")
    console.log("▶  รัน seed ต่อ: npm run seed\n")
  } else {
    console.log("\n⚠️  บาง grant ล้มเหลว — ตรวจสอบ token และลองใหม่\n")
    process.exit(1)
  }
}

main().catch(e => { console.error("❌", e); process.exit(1) })
