/**
 * Pastport — Add Demo PDF URLs
 * รัน: npm run add-demo-pdf
 *
 * อัพเดท portfolios ที่ยังไม่มี pdf_url ให้ใช้ PDF ตัวอย่าง
 */
import { createClient } from "@supabase/supabase-js"

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

// PDF สาธารณะที่มี CORS header (Access-Control-Allow-Origin: *)
// ใช้ PDF ที่หลากหลายเพื่อให้ demo สมจริง
const DEMO_PDFS = [
  // tracemonkey — 14 หน้า (PDF.js official test file)
  "https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/web/compressed.tracemonkey-pldi-09.pdf",
  // ใช้ซ้ำได้ — PDF เดียวกันแสดง audio ต่างกัน
  "https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/web/compressed.tracemonkey-pldi-09.pdf",
  "https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/web/compressed.tracemonkey-pldi-09.pdf",
  "https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/web/compressed.tracemonkey-pldi-09.pdf",
  "https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/web/compressed.tracemonkey-pldi-09.pdf",
  "https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/web/compressed.tracemonkey-pldi-09.pdf",
  "https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/web/compressed.tracemonkey-pldi-09.pdf",
  "https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/web/compressed.tracemonkey-pldi-09.pdf",
]

async function main() {
  console.log("📄 เพิ่ม Demo PDF URLs...\n")

  // ดึง portfolios ทั้งหมดที่ยังไม่มี pdf_url
  const { data: portfolios, error } = await admin
    .from("portfolios")
    .select("id, title")
    .is("pdf_url", null)
    .order("created_at")

  if (error) { console.error("❌", error.message); process.exit(1) }
  if (!portfolios || portfolios.length === 0) {
    console.log("✅ ทุก portfolio มี pdf_url อยู่แล้ว")
    return
  }

  console.log(`พบ ${portfolios.length} portfolios ที่ยังไม่มี PDF\n`)

  for (let i = 0; i < portfolios.length; i++) {
    const port = portfolios[i]
    const pdfUrl = DEMO_PDFS[i % DEMO_PDFS.length]

    const { error: updateErr } = await admin
      .from("portfolios")
      .update({ pdf_url: pdfUrl })
      .eq("id", port.id)

    if (updateErr) {
      console.error(`  ❌ ${port.title}: ${updateErr.message}`)
    } else {
      console.log(`  ✅ ${port.title}`)
    }
  }

  console.log("\n✅ เสร็จแล้ว! ทุก portfolio มี PDF สำหรับ demo แล้ว\n")
}

main().catch(e => { console.error(e); process.exit(1) })
