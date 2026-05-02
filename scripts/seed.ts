/**
 * Pastport — Seed Script
 * รัน: npm run seed
 */
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !serviceRoleKey) {
  console.error("❌ กรุณาตั้งค่า NEXT_PUBLIC_SUPABASE_URL และ SUPABASE_SERVICE_ROLE_KEY")
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
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

// ============================================================
// Cover images (Unsplash — free, stable)
// ============================================================
const COVERS = {
  med:   "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=600&h=400&fit=crop&q=80",
  eng:   "https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=600&h=400&fit=crop&q=80",
  arch:  "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&h=400&fit=crop&q=80",
  law:   "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=600&h=400&fit=crop&q=80",
  biz:   "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600&h=400&fit=crop&q=80",
  dent:  "https://images.unsplash.com/photo-1559757175-5700dde675bc?w=600&h=400&fit=crop&q=80",
  art:   "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=600&h=400&fit=crop&q=80",
  sci:   "https://images.unsplash.com/photo-1532094349884-543559c5590d?w=600&h=400&fit=crop&q=80",
  cs:    "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&h=400&fit=crop&q=80",
  pharm: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&h=400&fit=crop&q=80",
}

// ============================================================
// Affiliate users
// ============================================================
const AFFILIATES = [
  {
    email: "affiliate1@pastport.demo",
    password: "Demo1234!",
    full_name: "พรทิพย์ ใจดี",
    school: "โรงเรียนเตรียมอุดมศึกษา",
    phone: "081-234-5678",
  },
  {
    email: "affiliate2@pastport.demo",
    password: "Demo1234!",
    full_name: "ณัฐพล สมบูรณ์ทรัพย์",
    school: "โรงเรียนสวนกุหลาบวิทยาลัย",
    phone: "082-345-6789",
  },
  {
    email: "affiliate3@pastport.demo",
    password: "Demo1234!",
    full_name: "สุภาวดี รักการเรียน",
    school: "โรงเรียนมหิดลวิทยานุสรณ์",
    phone: "083-456-7890",
  },
]

// ============================================================
// Portfolio data
// ============================================================
const PORTFOLIOS = [
  {
    title: "Portfolio แพทย์ จุฬาฯ รับตรง TCAS66",
    owner_name: "พรทิพย์ ใจดี",
    faculty: "แพทยศาสตร์",
    university: "จุฬาลงกรณ์มหาวิทยาลัย",
    school: "โรงเรียนเตรียมอุดมศึกษา",
    tags: ["แพทย์", "จุฬา", "TCAS", "รับตรง", "สอบสัมภาษณ์"],
    cover: COVERS.med,
    is_admitted: true,
    affiliateIndex: 0,
    pages: [
      { page: 1, audio: AUDIO[0], desc: "แนะนำตัวเองและเส้นทางการเตรียมตัว" },
      { page: 2, audio: AUDIO[1], desc: "กิจกรรมค่ายอาสาและชมรมวิทยาศาสตร์" },
      { page: 3, audio: AUDIO[2], desc: "ผลการเรียนและ GPAX ตลอด 6 ภาค" },
      { page: 4, audio: AUDIO[3], desc: "รางวัลและความสำเร็จ" },
    ],
    pins: [
      { page: 1, x: 72, y: 28, pin_type: "note", note_text: "GPAX 3.98 ตลอด 6 ภาค ✨", note_link: null },
      { page: 2, x: 45, y: 60, pin_type: "audio", audio: AUDIO[4], note_text: "อธิบายค่ายอาสาพัฒนาชุมชน", note_link: null },
      { page: 3, x: 20, y: 40, pin_type: "both", audio: AUDIO[5], note_text: "คะแนน PAT2 เต็ม 300", note_link: "https://www.cu-teched.chula.ac.th" },
    ],
  },
  {
    title: "Port วิศวะคอม KMUTT ทุนเรียนดี",
    owner_name: "ณัฐพล สมบูรณ์ทรัพย์",
    faculty: "วิศวกรรมศาสตร์",
    university: "มหาวิทยาลัยเทคโนโลยีพระจอมเกล้าธนบุรี",
    school: "โรงเรียนสวนกุหลาบวิทยาลัย",
    tags: ["วิศวะ", "คอมพิวเตอร์", "KMUTT", "ทุน", "Coding"],
    cover: COVERS.eng,
    is_admitted: true,
    affiliateIndex: 1,
    pages: [
      { page: 1, audio: AUDIO[1], desc: "แนะนำตัวและ passion ด้าน Coding" },
      { page: 2, audio: AUDIO[2], desc: "โปรเจกต์ App และ Website ที่ทำ" },
      { page: 3, audio: AUDIO[3], desc: "การแข่งขัน Hackathon และรางวัลที่ได้" },
    ],
    pins: [
      { page: 2, x: 55, y: 35, pin_type: "note", note_text: "App ที่สร้าง: ระบบติดตามน้ำเสีย IoT 🏆", note_link: "https://github.com" },
      { page: 3, x: 30, y: 70, pin_type: "audio", audio: AUDIO[0], note_text: "เล่าเรื่องการแข่ง NSC ระดับประเทศ", note_link: null },
    ],
  },
  {
    title: "Portfolio สถาปัตย์ ศิลปากร สาขาออกแบบภายใน",
    owner_name: "สุภาวดี รักการเรียน",
    faculty: "สถาปัตยกรรมศาสตร์",
    university: "มหาวิทยาลัยศิลปากร",
    school: "โรงเรียนมหิดลวิทยานุสรณ์",
    tags: ["สถาปัตย์", "ออกแบบ", "ศิลปากร", "Interior", "Drawing"],
    cover: COVERS.arch,
    is_admitted: true,
    affiliateIndex: 2,
    pages: [
      { page: 1, audio: AUDIO[2], desc: "แนะนำตัวและความหลงใหลในการออกแบบ" },
      { page: 2, audio: AUDIO[3], desc: "ผลงาน Sketch และ Model" },
      { page: 3, audio: AUDIO[4], desc: "Portfolio Drawing ที่ใช้สมัคร" },
      { page: 4, audio: AUDIO[5], desc: "กิจกรรมและแรงบันดาลใจ" },
    ],
    pins: [
      { page: 2, x: 60, y: 50, pin_type: "both", audio: AUDIO[1], note_text: "Model บ้านพักอาศัยระยะ 3 เดือน", note_link: null },
      { page: 3, x: 25, y: 30, pin_type: "note", note_text: "ใช้ Watercolor + Pencil sketch มือทั้งหมด 🎨", note_link: null },
    ],
  },
  {
    title: "Port นิติศาสตร์ ธรรมศาสตร์ รับตรงแบบสัมภาษณ์",
    owner_name: "พรทิพย์ ใจดี",
    faculty: "นิติศาสตร์",
    university: "มหาวิทยาลัยธรรมศาสตร์",
    school: "โรงเรียนเตรียมอุดมศึกษา",
    tags: ["นิติ", "ธรรมศาสตร์", "กฎหมาย", "สัมภาษณ์", "TCAS"],
    cover: COVERS.law,
    is_admitted: true,
    affiliateIndex: 0,
    pages: [
      { page: 1, audio: AUDIO[3], desc: "แรงบันดาลใจที่อยากเรียนกฎหมาย" },
      { page: 2, audio: AUDIO[4], desc: "กิจกรรม Mock Trial และการโต้วาที" },
      { page: 3, audio: AUDIO[5], desc: "เรียงความและผลงานการเขียน" },
    ],
    pins: [
      { page: 2, x: 40, y: 55, pin_type: "note", note_text: "ชนะเลิศ Mock Trial ระดับประเทศ ⚖️", note_link: null },
    ],
  },
  {
    title: "Portfolio บริหารธุรกิจ NIDA เส้นทาง Business",
    owner_name: "ณัฐพล สมบูรณ์ทรัพย์",
    faculty: "บริหารธุรกิจ",
    university: "สถาบันบัณฑิตพัฒนบริหารศาสตร์",
    school: "โรงเรียนสวนกุหลาบวิทยาลัย",
    tags: ["บริหาร", "ธุรกิจ", "NIDA", "Marketing", "Startup"],
    cover: COVERS.biz,
    is_admitted: false,
    affiliateIndex: 1,
    pages: [
      { page: 1, audio: AUDIO[0], desc: "ทำไมถึงเลือกเรียน Business" },
      { page: 2, audio: AUDIO[1], desc: "โปรเจกต์ Startup ที่โรงเรียน" },
      { page: 3, audio: AUDIO[2], desc: "ประสบการณ์ฝึกงานและ Leadership" },
    ],
    pins: [
      { page: 2, x: 65, y: 40, pin_type: "both", audio: AUDIO[3], note_text: "Startup ขายออนไลน์รายได้ 50,000/เดือน 📈", note_link: null },
      { page: 3, x: 35, y: 65, pin_type: "note", note_text: "ประธานชมรมธุรกิจโรงเรียน", note_link: null },
    ],
  },
  {
    title: "Port ทันตแพทย์ มหิดล สุดยอด Portfolio ปี 66",
    owner_name: "สุภาวดี รักการเรียน",
    faculty: "ทันตแพทยศาสตร์",
    university: "มหาวิทยาลัยมหิดล",
    school: "โรงเรียนมหิดลวิทยานุสรณ์",
    tags: ["ทันตแพทย์", "มหิดล", "วิทยาศาสตร์", "TCAS", "สุขภาพ"],
    cover: COVERS.dent,
    is_admitted: true,
    affiliateIndex: 2,
    pages: [
      { page: 1, audio: AUDIO[4], desc: "แรงบันดาลใจอยากเป็นทันตแพทย์" },
      { page: 2, audio: AUDIO[5], desc: "การเข้าค่ายวิทยาศาสตร์และ สสวท" },
      { page: 3, audio: AUDIO[0], desc: "ผลการเรียนและ GPAX" },
    ],
    pins: [
      { page: 1, x: 50, y: 30, pin_type: "note", note_text: "ทุนโอลิมปิกวิชาการ ชีววิทยา 🥇", note_link: null },
    ],
  },
  {
    title: "Portfolio วิจิตรศิลป์ มช. สาย Painting",
    owner_name: "พรทิพย์ ใจดี",
    faculty: "วิจิตรศิลป์",
    university: "มหาวิทยาลัยเชียงใหม่",
    school: "โรงเรียนเตรียมอุดมศึกษา",
    tags: ["ศิลปะ", "วาดรูป", "มช", "Fine Arts", "Painting"],
    cover: COVERS.art,
    is_admitted: true,
    affiliateIndex: 0,
    pages: [
      { page: 1, audio: AUDIO[1], desc: "เส้นทางศิลปินตั้งแต่เด็ก" },
      { page: 2, audio: AUDIO[2], desc: "ผลงาน Portfolio ที่ใช้สมัคร" },
      { page: 3, audio: AUDIO[3], desc: "นิทรรศการและรางวัลด้านศิลปะ" },
    ],
    pins: [
      { page: 2, x: 45, y: 45, pin_type: "both", audio: AUDIO[4], note_text: "Oil painting ชิ้นนี้ใช้เวลา 3 สัปดาห์ 🎨", note_link: null },
    ],
  },
  {
    title: "Port วิทย์คอม จุฬา AI & Data Science Track",
    owner_name: "ณัฐพล สมบูรณ์ทรัพย์",
    faculty: "วิทยาศาสตร์",
    university: "จุฬาลงกรณ์มหาวิทยาลัย",
    school: "โรงเรียนสวนกุหลาบวิทยาลัย",
    tags: ["วิทย์คอม", "AI", "Data Science", "จุฬา", "Python"],
    cover: COVERS.cs,
    is_admitted: true,
    affiliateIndex: 1,
    pages: [
      { page: 1, audio: AUDIO[5], desc: "ความสนใจด้าน AI และ Machine Learning" },
      { page: 2, audio: AUDIO[0], desc: "โปรเจกต์ AI ที่ทำในช่วง ม.ปลาย" },
      { page: 3, audio: AUDIO[1], desc: "การแข่งขันและรางวัลด้าน Data" },
      { page: 4, audio: AUDIO[2], desc: "แผนอนาคตหลังจบการศึกษา" },
    ],
    pins: [
      { page: 2, x: 55, y: 25, pin_type: "note", note_text: "AI ทำนายราคาหุ้น accuracy 78% 🤖", note_link: "https://github.com" },
      { page: 3, x: 70, y: 60, pin_type: "both", audio: AUDIO[3], note_text: "รางวัลชนะเลิศ YSC ระดับชาติ", note_link: null },
    ],
  },
]

// ============================================================
// Banner ads
// ============================================================
const BANNER_ADS = [
  {
    title: "คอร์สเตรียม TCAS Portfolio โดยผู้เชี่ยวชาญ",
    image_url: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=1200&h=300&fit=crop&q=80",
    link_url: "https://pastport.app",
    position: "top",
    is_visible: true,
    order_index: 1,
  },
  {
    title: "ติวเข้มแพทย์ - วิศวะ - สถาปัตย์ กับทีมรุ่นพี่ 5 ดาว",
    image_url: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1200&h=300&fit=crop&q=80",
    link_url: "https://pastport.app",
    position: "in_feed",
    is_visible: true,
    order_index: 2,
  },
  {
    title: "สอบถาม Portfolio ฟรี! Line: @pastport",
    image_url: "https://images.unsplash.com/photo-1513258496099-48168024aec0?w=400&h=600&fit=crop&q=80",
    link_url: "https://pastport.app",
    position: "sidebar",
    is_visible: true,
    order_index: 3,
  },
  {
    title: "Workshop เขียน Portfolio แบบมืออาชีพ รุ่นที่ 12",
    image_url: "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=1200&h=300&fit=crop&q=80",
    link_url: "https://pastport.app",
    position: "bottom",
    is_visible: true,
    order_index: 4,
  },
]

// ============================================================
// Main seed function
// ============================================================
async function seed() {
  console.log("🌱 เริ่ม Seed ข้อมูล Pastport...\n")

  // 1. สร้าง Affiliate users
  console.log("👥 สร้าง Affiliate users...")
  const affiliateIds: string[] = []

  for (const aff of AFFILIATES) {
    // ลองหา user เดิมก่อน
    const { data: existing } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", aff.email)
      .single()

    if (existing) {
      affiliateIds.push(existing.id)
      console.log(`  ✓ มีอยู่แล้ว: ${aff.full_name}`)
      continue
    }

    const { data: authData, error: authErr } = await supabase.auth.admin.createUser({
      email: aff.email,
      password: aff.password,
      email_confirm: true,
      user_metadata: { role: "affiliate", full_name: aff.full_name },
    })

    if (authErr) {
      console.error(`  ❌ สร้าง user ไม่ได้: ${aff.full_name} — ${authErr.message}`)
      continue
    }

    const userId = authData.user.id
    affiliateIds.push(userId)

    await supabase.from("profiles").insert({
      id: userId,
      role: "affiliate",
      full_name: aff.full_name,
      email: aff.email,
      school: aff.school,
      phone: aff.phone,
      is_active: true,
    })

    console.log(`  ✅ ${aff.full_name} (${aff.email})`)
  }

  // 2. สร้าง Portfolios
  console.log("\n📁 สร้าง Portfolios...")
  const portfolioIds: string[] = []

  for (const p of PORTFOLIOS) {
    const affiliateId = affiliateIds[p.affiliateIndex]
    if (!affiliateId) continue

    // ตรวจสอบว่ามีอยู่แล้วหรือไม่
    const { data: existingPort } = await supabase
      .from("portfolios")
      .select("id")
      .eq("title", p.title)
      .single()

    let portfolioId: string

    if (existingPort) {
      portfolioId = existingPort.id
      portfolioIds.push(portfolioId)
      console.log(`  ✓ มีอยู่แล้ว: ${p.title}`)
    } else {
      const { data: port, error: portErr } = await supabase
        .from("portfolios")
        .insert({
          affiliate_id: affiliateId,
          title: p.title,
          owner_name: p.owner_name,
          faculty: p.faculty,
          university: p.university,
          school: p.school,
          tags: p.tags,
          cover_image_url: p.cover,
          is_admitted: p.is_admitted,
          status: "approved",
          is_visible: true,
          view_count: Math.floor(Math.random() * 2000) + 100,
          like_count: Math.floor(Math.random() * 200) + 10,
        })
        .select("id")
        .single()

      if (portErr || !port) {
        console.error(`  ❌ ${p.title}: ${portErr?.message}`)
        continue
      }

      portfolioId = port.id
      portfolioIds.push(portfolioId)
      console.log(`  ✅ ${p.title}`)

      // 3. สร้าง Portfolio Pages (audio per page)
      const pageInserts = p.pages.map((pg) => ({
        portfolio_id: portfolioId,
        page_number: pg.page,
        audio_url: pg.audio,
      }))
      await supabase.from("portfolio_pages").insert(pageInserts)

      // 4. สร้าง Portfolio Pins
      const pinInserts = p.pins.map((pin) => ({
        portfolio_id: portfolioId,
        page_number: pin.page,
        x_position: pin.x,
        y_position: pin.y,
        pin_type: pin.pin_type,
        audio_url: pin.pin_type !== "note" ? pin.audio : null,
        note_text: pin.note_text,
        note_link: pin.note_link,
      }))
      await supabase.from("portfolio_pins").insert(pinInserts)
    }
  }

  // 5. สร้าง Banner Ads
  console.log("\n📢 สร้าง Banner Ads...")
  const { data: existingAds } = await supabase.from("banner_ads").select("id")

  if (!existingAds || existingAds.length === 0) {
    await supabase.from("banner_ads").insert(BANNER_ADS)
    console.log(`  ✅ สร้าง ${BANNER_ADS.length} Banner Ads`)
  } else {
    console.log(`  ✓ มี Banner Ads อยู่แล้ว ${existingAds.length} รายการ`)
  }

  // 6. สร้าง Review checklists สำหรับ portfolios ที่ approved
  console.log("\n📋 สร้าง Review records...")

  if (affiliateIds.length > 0) {
    // ต้องมี admin user ก่อน — หาจาก profiles
    const { data: adminProfile } = await supabase
      .from("profiles")
      .select("id")
      .eq("role", "admin")
      .single()

    if (adminProfile && portfolioIds.length > 0) {
      for (const pid of portfolioIds.slice(0, 4)) {
        const { data: existing } = await supabase
          .from("review_checklists")
          .select("id")
          .eq("portfolio_id", pid)
          .single()

        if (!existing) {
          const score = Math.floor(Math.random() * 20) + 75 // 75-95
          await supabase.from("review_checklists").insert({
            portfolio_id: pid,
            reviewer_id: adminProfile.id,
            criteria: {
              relevance: Math.floor(score / 4),
              originality: Math.floor(score / 4),
              quality: Math.ceil(score / 4),
              presentation: score - Math.floor(score / 4) * 3,
            },
            total_score: score,
            decision: "approved",
            feedback: "Portfolio มีคุณภาพดี นำเสนอชัดเจน เนื้อหาครบถ้วน",
          })
        }
      }
      console.log("  ✅ Review records สร้างแล้ว")
    } else {
      console.log("  ⚠️  ไม่พบ Admin user — ข้าม Review records (สร้าง admin ก่อนแล้วรัน seed ใหม่)")
    }
  }

  // Summary
  console.log("\n" + "═".repeat(50))
  console.log("✅ Seed เสร็จสมบูรณ์!")
  console.log("═".repeat(50))
  console.log(`📁 Portfolios : ${PORTFOLIOS.length} รายการ`)
  console.log(`👥 Affiliates : ${AFFILIATES.length} คน`)
  console.log(`📢 Banner Ads : ${BANNER_ADS.length} รายการ`)
  console.log("\n🔑 Demo Login:")
  console.log("  Affiliate 1 : affiliate1@pastport.demo / Demo1234!")
  console.log("  Affiliate 2 : affiliate2@pastport.demo / Demo1234!")
  console.log("  Affiliate 3 : affiliate3@pastport.demo / Demo1234!")
  console.log("  Admin       : /register/admin → Secret Key: pastport-admin-2024")
  console.log("\n🌐 เปิด http://localhost:3000/home เพื่อดูข้อมูล\n")
}

seed().catch((err) => {
  console.error("❌ Seed ล้มเหลว:", err)
  process.exit(1)
})
