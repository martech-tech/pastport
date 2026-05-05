/**
 * Pastport — Seed Script
 * รัน: npm run seed
 *
 * ไม่ต้องการ GRANT SQL พิเศษ — ใช้ login เป็น affiliate user จริงๆ
 */
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const anonKey    = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !serviceKey) {
  console.error("❌ กรุณาตั้งค่า env ใน .env.local")
  process.exit(1)
}

// Admin client (service role) — สำหรับ auth.admin และ non-RLS tables
const admin = createClient(supabaseUrl, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

// ============================================================
// Audio samples (free, public domain — SoundHelix)
// ============================================================
const AUDIO = [
  "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
  "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
  "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
  "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
  "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3",
  "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3",
]

// Demo PDF (mozilla/pdf.js test file — CORS-friendly, 14 pages)
const DEMO_PDF = "https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/web/compressed.tracemonkey-pldi-09.pdf"

// Cover images (Unsplash — free)
const COVERS = {
  med:   "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=600&h=400&fit=crop&q=80",
  eng:   "https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=600&h=400&fit=crop&q=80",
  arch:  "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&h=400&fit=crop&q=80",
  law:   "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=600&h=400&fit=crop&q=80",
  biz:   "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600&h=400&fit=crop&q=80",
  dent:  "https://images.unsplash.com/photo-1559757175-5700dde675bc?w=600&h=400&fit=crop&q=80",
  art:   "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=600&h=400&fit=crop&q=80",
  cs:    "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&h=400&fit=crop&q=80",
}

// ============================================================
// Affiliate users
// ============================================================
const AFFILIATES = [
  { email: "affiliate1@pastport.demo", password: "444444", full_name: "พรทิพย์ ใจดี",        school: "โรงเรียนเตรียมอุดมศึกษา",      phone: "081-234-5678" },
  { email: "affiliate2@pastport.demo", password: "444444", full_name: "ณัฐพล สมบูรณ์ทรัพย์", school: "โรงเรียนสวนกุหลาบวิทยาลัย",    phone: "082-345-6789" },
  { email: "affiliate3@pastport.demo", password: "444444", full_name: "สุภาวดี รักการเรียน", school: "โรงเรียนมหิดลวิทยานุสรณ์",     phone: "083-456-7890" },
]

// ============================================================
// Portfolio data — แต่ละรายการมี affiliateIndex และ pages/pins
// ============================================================
const PORTFOLIOS = [
  {
    title: "Portfolio แพทย์ จุฬาฯ รับตรง TCAS66",
    owner_name: "พรทิพย์ ใจดี", faculty: "แพทยศาสตร์",
    university: "จุฬาลงกรณ์มหาวิทยาลัย", school: "โรงเรียนเตรียมอุดมศึกษา",
    tags: ["แพทย์", "จุฬา", "TCAS", "รับตรง", "สอบสัมภาษณ์"],
    cover: COVERS.med, is_admitted: true, affiliateIndex: 0,
    pages: [
      { page: 1, audio: AUDIO[0] }, { page: 2, audio: AUDIO[1] },
      { page: 3, audio: AUDIO[2] }, { page: 4, audio: AUDIO[3] },
    ],
    pins: [
      { page: 1, x: 72, y: 28, pin_type: "note",  audio: null,    note_text: "GPAX 3.98 ตลอด 6 ภาค ✨", note_link: null },
      { page: 2, x: 45, y: 60, pin_type: "audio", audio: AUDIO[4], note_text: "อธิบายค่ายอาสาพัฒนาชุมชน", note_link: null },
      { page: 3, x: 20, y: 40, pin_type: "both",  audio: AUDIO[5], note_text: "คะแนน PAT2 เต็ม 300", note_link: null },
    ],
  },
  {
    title: "Port วิศวะคอม KMUTT ทุนเรียนดี",
    owner_name: "ณัฐพล สมบูรณ์ทรัพย์", faculty: "วิศวกรรมศาสตร์",
    university: "มหาวิทยาลัยเทคโนโลยีพระจอมเกล้าธนบุรี", school: "โรงเรียนสวนกุหลาบวิทยาลัย",
    tags: ["วิศวะ", "คอมพิวเตอร์", "KMUTT", "ทุน", "Coding"],
    cover: COVERS.eng, is_admitted: true, affiliateIndex: 1,
    pages: [
      { page: 1, audio: AUDIO[1] }, { page: 2, audio: AUDIO[2] }, { page: 3, audio: AUDIO[3] },
    ],
    pins: [
      { page: 2, x: 55, y: 35, pin_type: "note",  audio: null,    note_text: "App IoT ติดตามน้ำเสีย 🏆", note_link: "https://github.com" },
      { page: 3, x: 30, y: 70, pin_type: "audio", audio: AUDIO[0], note_text: "เล่าเรื่องแข่ง NSC ระดับชาติ", note_link: null },
    ],
  },
  {
    title: "Portfolio สถาปัตย์ ศิลปากร สาขาออกแบบภายใน",
    owner_name: "สุภาวดี รักการเรียน", faculty: "สถาปัตยกรรมศาสตร์",
    university: "มหาวิทยาลัยศิลปากร", school: "โรงเรียนมหิดลวิทยานุสรณ์",
    tags: ["สถาปัตย์", "ออกแบบ", "ศิลปากร", "Interior", "Drawing"],
    cover: COVERS.arch, is_admitted: true, affiliateIndex: 2,
    pages: [
      { page: 1, audio: AUDIO[2] }, { page: 2, audio: AUDIO[3] },
      { page: 3, audio: AUDIO[4] }, { page: 4, audio: AUDIO[5] },
    ],
    pins: [
      { page: 2, x: 60, y: 50, pin_type: "both",  audio: AUDIO[1], note_text: "Model บ้านพักระยะ 3 เดือน", note_link: null },
      { page: 3, x: 25, y: 30, pin_type: "note",  audio: null,    note_text: "Watercolor + Pencil มือทั้งหมด 🎨", note_link: null },
    ],
  },
  {
    title: "Port นิติศาสตร์ ธรรมศาสตร์ รับตรงแบบสัมภาษณ์",
    owner_name: "พรทิพย์ ใจดี", faculty: "นิติศาสตร์",
    university: "มหาวิทยาลัยธรรมศาสตร์", school: "โรงเรียนเตรียมอุดมศึกษา",
    tags: ["นิติ", "ธรรมศาสตร์", "กฎหมาย", "สัมภาษณ์", "TCAS"],
    cover: COVERS.law, is_admitted: true, affiliateIndex: 0,
    pages: [
      { page: 1, audio: AUDIO[3] }, { page: 2, audio: AUDIO[4] }, { page: 3, audio: AUDIO[5] },
    ],
    pins: [
      { page: 2, x: 40, y: 55, pin_type: "note", audio: null, note_text: "ชนะเลิศ Mock Trial ระดับประเทศ ⚖️", note_link: null },
    ],
  },
  {
    title: "Portfolio บริหารธุรกิจ NIDA เส้นทาง Startup",
    owner_name: "ณัฐพล สมบูรณ์ทรัพย์", faculty: "บริหารธุรกิจ",
    university: "สถาบันบัณฑิตพัฒนบริหารศาสตร์", school: "โรงเรียนสวนกุหลาบวิทยาลัย",
    tags: ["บริหาร", "ธุรกิจ", "NIDA", "Marketing", "Startup"],
    cover: COVERS.biz, is_admitted: false, affiliateIndex: 1,
    pages: [
      { page: 1, audio: AUDIO[0] }, { page: 2, audio: AUDIO[1] }, { page: 3, audio: AUDIO[2] },
    ],
    pins: [
      { page: 2, x: 65, y: 40, pin_type: "both",  audio: AUDIO[3], note_text: "Startup รายได้ 50,000/เดือน 📈", note_link: null },
      { page: 3, x: 35, y: 65, pin_type: "note",  audio: null,    note_text: "ประธานชมรมธุรกิจโรงเรียน", note_link: null },
    ],
  },
  {
    title: "Port ทันตแพทย์ มหิดล สุดยอด Portfolio ปี 66",
    owner_name: "สุภาวดี รักการเรียน", faculty: "ทันตแพทยศาสตร์",
    university: "มหาวิทยาลัยมหิดล", school: "โรงเรียนมหิดลวิทยานุสรณ์",
    tags: ["ทันตแพทย์", "มหิดล", "วิทยาศาสตร์", "TCAS", "สุขภาพ"],
    cover: COVERS.dent, is_admitted: true, affiliateIndex: 2,
    pages: [
      { page: 1, audio: AUDIO[4] }, { page: 2, audio: AUDIO[5] }, { page: 3, audio: AUDIO[0] },
    ],
    pins: [
      { page: 1, x: 50, y: 30, pin_type: "note", audio: null, note_text: "ทุนโอลิมปิกวิชาการ ชีววิทยา 🥇", note_link: null },
    ],
  },
  {
    title: "Portfolio วิจิตรศิลป์ มช. สาย Painting",
    owner_name: "พรทิพย์ ใจดี", faculty: "วิจิตรศิลป์",
    university: "มหาวิทยาลัยเชียงใหม่", school: "โรงเรียนเตรียมอุดมศึกษา",
    tags: ["ศิลปะ", "วาดรูป", "มช", "Fine Arts", "Painting"],
    cover: COVERS.art, is_admitted: true, affiliateIndex: 0,
    pages: [
      { page: 1, audio: AUDIO[1] }, { page: 2, audio: AUDIO[2] }, { page: 3, audio: AUDIO[3] },
    ],
    pins: [
      { page: 2, x: 45, y: 45, pin_type: "both", audio: AUDIO[4], note_text: "Oil painting ชิ้นนี้ใช้เวลา 3 สัปดาห์ 🎨", note_link: null },
    ],
  },
  {
    title: "Port วิทย์คอม จุฬา AI & Data Science Track",
    owner_name: "ณัฐพล สมบูรณ์ทรัพย์", faculty: "วิทยาศาสตร์",
    university: "จุฬาลงกรณ์มหาวิทยาลัย", school: "โรงเรียนสวนกุหลาบวิทยาลัย",
    tags: ["วิทย์คอม", "AI", "Data Science", "จุฬา", "Python"],
    cover: COVERS.cs, is_admitted: true, affiliateIndex: 1,
    pages: [
      { page: 1, audio: AUDIO[5] }, { page: 2, audio: AUDIO[0] },
      { page: 3, audio: AUDIO[1] }, { page: 4, audio: AUDIO[2] },
    ],
    pins: [
      { page: 2, x: 55, y: 25, pin_type: "note",  audio: null,    note_text: "AI ทำนายราคาหุ้น accuracy 78% 🤖", note_link: "https://github.com" },
      { page: 3, x: 70, y: 60, pin_type: "both",  audio: AUDIO[3], note_text: "รางวัลชนะเลิศ YSC ระดับชาติ", note_link: null },
    ],
  },
]

const BANNER_ADS = [
  { title: "คอร์สเตรียม TCAS Portfolio โดยผู้เชี่ยวชาญ",       image_url: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=1200&h=300&fit=crop&q=80", link_url: "https://pastport.app", position: "top",     is_visible: true, order_index: 1 },
  { title: "ติวเข้มแพทย์ วิศวะ สถาปัตย์ กับรุ่นพี่ 5 ดาว",   image_url: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1200&h=300&fit=crop&q=80", link_url: "https://pastport.app", position: "in_feed", is_visible: true, order_index: 2 },
  { title: "สอบถาม Portfolio ฟรี! Line: @pastport",             image_url: "https://images.unsplash.com/photo-1513258496099-48168024aec0?w=400&h=600&fit=crop&q=80",  link_url: "https://pastport.app", position: "sidebar", is_visible: true, order_index: 3 },
  { title: "Workshop เขียน Portfolio แบบมืออาชีพ รุ่นที่ 12", image_url: "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=1200&h=300&fit=crop&q=80", link_url: "https://pastport.app", position: "bottom",  is_visible: true, order_index: 4 },
]

// ============================================================
// Helpers
// ============================================================
async function upsertAffiliate(aff: typeof AFFILIATES[0]) {
  // หา user จาก auth โดยตรง (bypass table permissions)
  const { data: { users } } = await admin.auth.admin.listUsers({ perPage: 100 })
  const existingUser = users.find(u => u.email === aff.email)

  if (existingUser) {
    // Upsert profile (อาจยังไม่มี)
    await admin.from("profiles").upsert({
      id: existingUser.id, role: "affiliate", full_name: aff.full_name,
      email: aff.email, school: aff.school, phone: aff.phone, is_active: true,
    }, { onConflict: "id" })
    console.log(`  ✓ มีอยู่แล้ว: ${aff.full_name}`)
    return existingUser.id as string
  }

  // สร้างใหม่
  const { data, error } = await admin.auth.admin.createUser({
    email: aff.email, password: aff.password, email_confirm: true,
    user_metadata: { role: "affiliate", full_name: aff.full_name },
  })
  if (error) { console.error(`  ❌ ${aff.full_name}: ${error.message}`); return null }

  await admin.from("profiles").upsert({
    id: data.user.id, role: "affiliate", full_name: aff.full_name,
    email: aff.email, school: aff.school, phone: aff.phone, is_active: true,
  }, { onConflict: "id" })

  console.log(`  ✅ ${aff.full_name}`)
  return data.user.id as string
}

// ============================================================
// Main
// ============================================================
async function seed() {
  console.log("🌱 เริ่ม Seed ข้อมูล Pastport...\n")

  // 1. สร้าง Affiliates
  console.log("👥 สร้าง Affiliate users...")
  const affiliateIds: (string | null)[] = []
  for (const aff of AFFILIATES) {
    affiliateIds.push(await upsertAffiliate(aff))
  }

  // 2. Portfolios — login เป็น affiliate แต่ละคน แล้ว insert (ผ่าน RLS)
  console.log("\n📁 สร้าง Portfolios...")
  for (const p of PORTFOLIOS) {
    const affiliateId = affiliateIds[p.affiliateIndex]
    const aff = AFFILIATES[p.affiliateIndex]
    if (!affiliateId) continue

    // ตรวจว่ามีอยู่แล้ว
    const { data: existing } = await admin.from("portfolios").select("id").eq("title", p.title).single()
    if (existing) { console.log(`  ✓ มีอยู่แล้ว: ${p.title}`); continue }

    // Login เป็น affiliate user → ผ่าน RLS policy
    const userClient = createClient(supabaseUrl, anonKey)
    const { error: loginErr } = await userClient.auth.signInWithPassword({ email: aff.email, password: aff.password })
    if (loginErr) { console.error(`  ❌ login ไม่ได้: ${aff.email} — ${loginErr.message}`); continue }

    const { data: port, error: portErr } = await userClient.from("portfolios").insert({
      affiliate_id: affiliateId,
      title: p.title, owner_name: p.owner_name, faculty: p.faculty,
      university: p.university, school: p.school, tags: p.tags,
      cover_image_url: p.cover, pdf_url: DEMO_PDF, is_admitted: p.is_admitted,
      status: "approved", is_visible: true,
      view_count: Math.floor(Math.random() * 2000) + 100,
      like_count: Math.floor(Math.random() * 200) + 10,
    }).select("id").single()

    if (portErr || !port) { console.error(`  ❌ ${p.title}: ${portErr?.message}`); continue }

    // Pages
    await userClient.from("portfolio_pages").insert(
      p.pages.map(pg => ({ portfolio_id: port.id, page_number: pg.page, audio_url: pg.audio }))
    )

    // Pins
    await userClient.from("portfolio_pins").insert(
      p.pins.map(pin => ({
        portfolio_id: port.id, page_number: pin.page,
        x_position: pin.x, y_position: pin.y,
        pin_type: pin.pin_type, audio_url: pin.audio,
        note_text: pin.note_text, note_link: pin.note_link,
      }))
    )

    await userClient.auth.signOut()
    console.log(`  ✅ ${p.title}`)
  }

  // 3. Banner Ads (service role — ไม่ผ่าน affiliate RLS)
  console.log("\n📢 สร้าง Banner Ads...")
  const { data: existingAds } = await admin.from("banner_ads").select("id")
  if (!existingAds || existingAds.length === 0) {
    await admin.from("banner_ads").insert(BANNER_ADS)
    console.log(`  ✅ ${BANNER_ADS.length} Banner Ads`)
  } else {
    console.log(`  ✓ มีอยู่แล้ว ${existingAds.length} รายการ`)
  }

  // Summary
  console.log("\n" + "═".repeat(52))
  console.log("✅ Seed เสร็จสมบูรณ์!")
  console.log("═".repeat(52))
  console.log(`  📁 Portfolios : ${PORTFOLIOS.length} รายการ`)
  console.log(`  👥 Affiliates : ${AFFILIATES.length} คน`)
  console.log(`  📢 Banner Ads : ${BANNER_ADS.length} รายการ`)
  console.log(`  🎵 Audio      : SoundHelix public domain`)
  console.log("\n🔑 Demo Login:")
  AFFILIATES.forEach(a => console.log(`  ${a.full_name.padEnd(22)} ${a.email} / ${a.password}`))
  console.log("  Admin: /register/admin → Key: pastport-admin-2024")
  console.log("\n🌐 http://localhost:3000/home\n")
}

seed().catch(e => { console.error("❌", e); process.exit(1) })
