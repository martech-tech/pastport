export const dynamic = "force-dynamic"

"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Upload, FileText, GraduationCap, School, User, Tag, CheckCircle, ArrowRight } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/components/providers"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"
import { FACULTIES, UNIVERSITIES } from "@/lib/utils"

const schema = z.object({
  title: z.string().min(1, "กรุณากรอกชื่อ portfolio"),
  owner_name: z.string().min(1, "กรุณากรอกชื่อเจ้าของ"),
  faculty: z.string().min(1, "กรุณาเลือกคณะ"),
  university: z.string().min(1, "กรุณาเลือกมหาวิทยาลัย"),
  school: z.string().min(1, "กรุณากรอกชื่อโรงเรียน"),
  is_admitted: z.boolean(),
  tags_input: z.string().optional(),
})

type FormData = z.infer<typeof schema>

const STEPS = ["ข้อมูลพื้นฐาน", "อัปโหลดไฟล์", "ยืนยันข้อมูล"]

export default function AffiliateSubmitPage() {
  const [step, setStep] = useState(0)
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState("")
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [submitted, setSubmitted] = useState(false)
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()

  const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting }, trigger } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { is_admitted: false },
  })

  const addTag = () => {
    const trimmed = tagInput.trim()
    if (trimmed && !tags.includes(trimmed) && tags.length < 10) {
      setTags([...tags, trimmed])
      setTagInput("")
    }
  }

  const removeTag = (tag: string) => setTags(tags.filter(t => t !== tag))

  const nextStep = async () => {
    if (step === 0) {
      const valid = await trigger(["title", "owner_name", "faculty", "university", "school"])
      if (!valid) return
    }
    setStep(s => Math.min(STEPS.length - 1, s + 1))
  }

  const onSubmit = async (data: FormData) => {
    if (!user) return
    if (!pdfFile) {
      toast({ variant: "destructive", title: "กรุณาอัปโหลดไฟล์ PDF" })
      return
    }

    setUploading(true)
    setUploadProgress(10)

    try {
      // Upload PDF
      const pdfPath = `portfolios/${user.id}/${Date.now()}_${pdfFile.name}`
      const { error: pdfError } = await supabase.storage.from("portfolio-files").upload(pdfPath, pdfFile)
      if (pdfError) throw pdfError
      setUploadProgress(50)

      const { data: { publicUrl: pdfUrl } } = supabase.storage.from("portfolio-files").getPublicUrl(pdfPath)

      // Upload cover image if provided
      let coverUrl: string | undefined
      if (coverFile) {
        const coverPath = `covers/${user.id}/${Date.now()}_${coverFile.name}`
        await supabase.storage.from("portfolio-files").upload(coverPath, coverFile)
        const { data: { publicUrl } } = supabase.storage.from("portfolio-files").getPublicUrl(coverPath)
        coverUrl = publicUrl
      }
      setUploadProgress(80)

      // Create portfolio record
      const { data: port, error: portError } = await supabase.from("portfolios").insert({
        affiliate_id: user.id,
        title: data.title,
        owner_name: data.owner_name,
        faculty: data.faculty,
        university: data.university,
        school: data.school,
        is_admitted: data.is_admitted,
        tags,
        pdf_url: pdfUrl,
        cover_image_url: coverUrl || null,
        status: "pending",
        is_visible: false,
        view_count: 0,
        like_count: 0,
      }).select().single()

      if (portError) throw portError
      setUploadProgress(100)
      setSubmitted(true)
    } catch (err) {
      toast({ variant: "destructive", title: "เกิดข้อผิดพลาด", description: "กรุณาลองใหม่อีกครั้ง" })
    } finally {
      setUploading(false)
    }
  }

  if (submitted) {
    return (
      <div className="max-w-lg mx-auto text-center py-12 page-transition">
        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="h-8 w-8 text-emerald-600" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">ส่ง Portfolio สำเร็จ!</h2>
        <p className="text-slate-500 mb-2">Portfolio ของคุณอยู่ระหว่างการพิจารณา</p>
        <p className="text-sm text-slate-400 mb-8">ทีมงานจะตรวจสอบและแจ้งผลภายใน 3-5 วันทำการ</p>

        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {["ส่งแบบฟอร์ม", "รอพิจารณา", "ผลการพิจารณา"].map((step, i) => (
            <div key={step} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                i === 0 ? "bg-emerald-500 text-white" : "bg-slate-200 text-slate-500"
              }`}>
                {i === 0 ? <CheckCircle className="h-4 w-4" /> : i + 1}
              </div>
              <span className="text-xs text-slate-500 hidden sm:block">{step}</span>
              {i < 2 && <ArrowRight className="h-3 w-3 text-slate-300" />}
            </div>
          ))}
        </div>

        <Button onClick={() => router.push("/affiliate")}>
          กลับหน้า Dashboard
        </Button>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 page-transition">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">ส่ง Portfolio เพื่อพิจารณา</h1>
        <p className="text-slate-500 mt-1">Portfolio จะได้รับการพิจารณาตามมาตรฐาน Q1</p>
      </div>

      {/* Step Indicator */}
      <div className="flex items-center gap-2">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center gap-2 flex-1">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 transition-all ${
              i < step ? "bg-emerald-500 text-white" :
              i === step ? "bg-indigo-600 text-white" :
              "bg-slate-200 text-slate-500"
            }`}>
              {i < step ? <CheckCircle className="h-4 w-4" /> : i + 1}
            </div>
            <span className="text-xs font-medium hidden sm:block">{s}</span>
            {i < STEPS.length - 1 && (
              <div className={`flex-1 h-0.5 ${i < step ? "bg-emerald-400" : "bg-slate-200"}`} />
            )}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Step 0: Basic Info */}
        {step === 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <User className="h-4 w-4 text-indigo-600" />
                ข้อมูลพื้นฐาน
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                {...register("title")}
                label="ชื่อ Portfolio"
                placeholder="เช่น Portfolio สาขาสถาปัตยกรรม จุฬา"
                error={errors.title?.message}
              />
              <Input
                {...register("owner_name")}
                label="ชื่อเจ้าของ Portfolio"
                placeholder="ชื่อ-นามสกุล"
                icon={<User className="h-4 w-4" />}
                error={errors.owner_name?.message}
              />
              <Input
                {...register("school")}
                label="โรงเรียน"
                placeholder="ชื่อโรงเรียนที่จบ"
                icon={<School className="h-4 w-4" />}
                error={errors.school?.message}
              />

              <div className="grid grid-cols-2 gap-3">
                <Select onValueChange={v => setValue("faculty", v)}>
                  <SelectTrigger label="คณะที่ยื่น">
                    <SelectValue placeholder="เลือกคณะ" />
                  </SelectTrigger>
                  <SelectContent>
                    {FACULTIES.map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}
                  </SelectContent>
                </Select>
                {errors.faculty && <p className="text-xs text-red-500 col-span-2">{errors.faculty.message}</p>}

                <Select onValueChange={v => setValue("university", v)}>
                  <SelectTrigger label="มหาวิทยาลัย">
                    <SelectValue placeholder="เลือกมหาวิทยาลัย" />
                  </SelectTrigger>
                  <SelectContent>
                    {UNIVERSITIES.map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}
                  </SelectContent>
                </Select>
                {errors.university && <p className="text-xs text-red-500 col-span-2">{errors.university.message}</p>}
              </div>

              {/* Is Admitted */}
              <div className="flex items-center gap-3 p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                <Checkbox
                  id="is_admitted"
                  checked={watch("is_admitted")}
                  onCheckedChange={v => setValue("is_admitted", !!v)}
                />
                <label htmlFor="is_admitted" className="text-sm font-medium text-emerald-800 cursor-pointer">
                  Portfolio นี้ทำให้ฉันติดรอบพอร์ต ✓
                </label>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  แท็ก (สูงสุด 10 แท็ก)
                </label>
                <div className="flex gap-2">
                  <input
                    value={tagInput}
                    onChange={e => setTagInput(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addTag() } }}
                    placeholder="พิมพ์แท็กแล้วกด Enter"
                    className="flex-1 h-10 px-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <Button type="button" variant="outline" onClick={addTag} size="sm">เพิ่ม</Button>
                </div>
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {tags.map(tag => (
                      <Badge key={tag} variant="secondary" className="cursor-pointer" onClick={() => removeTag(tag)}>
                        {tag} ×
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <Button type="button" className="w-full" onClick={nextStep}>
                ถัดไป <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Step 1: Upload Files */}
        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Upload className="h-4 w-4 text-indigo-600" />
                อัปโหลดไฟล์
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* PDF Upload */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  ไฟล์ Portfolio PDF <span className="text-red-500">*</span>
                </label>
                <label className={`flex flex-col items-center justify-center w-full h-32 rounded-xl border-2 border-dashed cursor-pointer transition-colors ${
                  pdfFile ? "border-emerald-400 bg-emerald-50" : "border-slate-300 hover:border-indigo-400 hover:bg-indigo-50"
                }`}>
                  <input
                    type="file"
                    accept=".pdf"
                    className="hidden"
                    onChange={e => setPdfFile(e.target.files?.[0] || null)}
                  />
                  <FileText className={`h-8 w-8 mb-2 ${pdfFile ? "text-emerald-500" : "text-slate-400"}`} />
                  {pdfFile ? (
                    <div className="text-center">
                      <p className="text-sm font-medium text-emerald-700">{pdfFile.name}</p>
                      <p className="text-xs text-emerald-600">{(pdfFile.size / 1024 / 1024).toFixed(1)} MB</p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <p className="text-sm text-slate-600">คลิกหรือลากไฟล์ PDF</p>
                      <p className="text-xs text-slate-400">สูงสุด 50 MB</p>
                    </div>
                  )}
                </label>
              </div>

              {/* Cover Image */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  รูปปก (ไม่บังคับ)
                </label>
                <label className={`flex flex-col items-center justify-center w-full h-24 rounded-xl border-2 border-dashed cursor-pointer transition-colors ${
                  coverFile ? "border-emerald-400 bg-emerald-50" : "border-slate-300 hover:border-indigo-400"
                }`}>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={e => setCoverFile(e.target.files?.[0] || null)}
                  />
                  {coverFile ? (
                    <p className="text-sm text-emerald-700">{coverFile.name}</p>
                  ) : (
                    <p className="text-sm text-slate-400">อัปโหลดรูปปก (JPG, PNG)</p>
                  )}
                </label>
              </div>

              <div className="flex gap-3">
                <Button type="button" variant="outline" onClick={() => setStep(0)} className="flex-1">
                  ย้อนกลับ
                </Button>
                <Button type="button" className="flex-1" onClick={nextStep} disabled={!pdfFile}>
                  ถัดไป <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Confirm */}
        {step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-indigo-600" />
                ยืนยันข้อมูล
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-slate-50 rounded-xl p-4 space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-slate-500">ชื่อ Portfolio</span><span className="font-medium">{watch("title")}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">เจ้าของ</span><span className="font-medium">{watch("owner_name")}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">คณะ</span><span className="font-medium">{watch("faculty")}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">มหาวิทยาลัย</span><span className="font-medium">{watch("university")}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">โรงเรียน</span><span className="font-medium">{watch("school")}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">ติดรอบพอร์ต</span><span>{watch("is_admitted") ? "✓ ใช่" : "ไม่ได้ระบุ"}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">ไฟล์ PDF</span><span className="text-emerald-600">{pdfFile?.name}</span></div>
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {tags.map(t => <Badge key={t} variant="secondary">{t}</Badge>)}
                  </div>
                )}
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-sm text-amber-700">
                Portfolio จะได้รับการพิจารณาตามมาตรฐาน Q1 Journal Review ทีมงานจะแจ้งผลภายใน 3-5 วันทำการ
              </div>

              {uploading && (
                <Progress value={uploadProgress} label="กำลังอัปโหลด..." />
              )}

              <div className="flex gap-3">
                <Button type="button" variant="outline" onClick={() => setStep(1)} className="flex-1" disabled={uploading}>
                  ย้อนกลับ
                </Button>
                <Button type="submit" className="flex-1" loading={isSubmitting || uploading}>
                  ส่ง Portfolio
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </form>
    </div>
  )
}
