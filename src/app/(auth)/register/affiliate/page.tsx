"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Mail, Lock, User, School, Phone, Briefcase } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"

const schema = z.object({
  full_name: z.string().min(2, "กรุณากรอกชื่อ-นามสกุล"),
  email: z.string().email("กรุณากรอกอีเมลที่ถูกต้อง"),
  phone: z.string().min(9, "กรุณากรอกเบอร์โทร"),
  school: z.string().min(2, "กรุณากรอกชื่อโรงเรียน/มหาวิทยาลัย"),
  bio: z.string().optional(),
  password: z.string().min(8, "รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร"),
  confirm_password: z.string(),
  agree_terms: z.boolean().refine(v => v, "กรุณายอมรับข้อกำหนด"),
}).refine(d => d.password === d.confirm_password, {
  message: "รหัสผ่านไม่ตรงกัน",
  path: ["confirm_password"],
})

type FormData = z.infer<typeof schema>

export default function AffiliateRegisterPage() {
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { agree_terms: false },
  })

  const onSubmit = async (data: FormData) => {
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: data.email,
        password: data.password,
        role: "affiliate",
        full_name: data.full_name,
        phone: data.phone,
        school: data.school,
      }),
    })

    const json = await res.json()

    if (!res.ok) {
      toast({ variant: "destructive", title: "สมัครสมาชิกไม่สำเร็จ", description: json.error })
      return
    }

    toast({ variant: "success", title: "สมัครสำเร็จ!", description: "เข้าสู่ระบบได้เลย" })
    router.push("/login")
  }

  return (
    <div className="w-full max-w-lg">
      <Card className="shadow-lg border-0">
        <CardHeader className="text-center pb-2">
          <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Briefcase className="h-7 w-7 text-white" />
          </div>
          <CardTitle className="text-2xl">สมัคร — Affiliate</CardTitle>
          <CardDescription>แบ่งปัน portfolio ของคุณและรับรายได้</CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 mb-4">
            <p className="text-sm text-purple-700">
              <strong>หมายเหตุ:</strong> บัญชี Affiliate จะต้องผ่านการตรวจสอบจาก admin ก่อนเริ่มใช้งาน
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              {...register("full_name")}
              label="ชื่อ-นามสกุล"
              placeholder="ชื่อ นามสกุล"
              icon={<User className="h-4 w-4" />}
              error={errors.full_name?.message}
            />
            <Input
              {...register("email")}
              type="email"
              label="อีเมล"
              placeholder="your@email.com"
              icon={<Mail className="h-4 w-4" />}
              error={errors.email?.message}
            />
            <div className="grid grid-cols-2 gap-3">
              <Input
                {...register("phone")}
                type="tel"
                label="เบอร์โทรศัพท์"
                placeholder="08X-XXX-XXXX"
                icon={<Phone className="h-4 w-4" />}
                error={errors.phone?.message}
              />
              <Input
                {...register("school")}
                label="มหาวิทยาลัย/โรงเรียน"
                placeholder="ชื่อสถาบัน"
                icon={<School className="h-4 w-4" />}
                error={errors.school?.message}
              />
            </div>
            <Textarea
              {...register("bio")}
              label="แนะนำตัวสั้นๆ (ไม่บังคับ)"
              placeholder="เล่าให้ฟังว่าคุณเป็นใคร ทำ portfolio อะไร..."
              className="h-20"
            />
            <div className="grid grid-cols-2 gap-3">
              <Input
                {...register("password")}
                type={showPassword ? "text" : "password"}
                label="รหัสผ่าน"
                placeholder="อย่างน้อย 8 ตัว"
                icon={<Lock className="h-4 w-4" />}
                error={errors.password?.message}
              />
              <Input
                {...register("confirm_password")}
                type={showPassword ? "text" : "password"}
                label="ยืนยันรหัสผ่าน"
                placeholder="ยืนยันรหัสผ่าน"
                icon={<Lock className="h-4 w-4" />}
                error={errors.confirm_password?.message}
              />
            </div>

            <div className="flex items-start gap-2">
              <Checkbox
                id="terms"
                checked={watch("agree_terms")}
                onCheckedChange={(v) => setValue("agree_terms", !!v)}
                className="mt-0.5"
              />
              <label htmlFor="terms" className="text-sm text-slate-600 cursor-pointer">
                ฉันยอมรับ{" "}
                <Link href="/terms" className="text-indigo-600 hover:underline">ข้อกำหนดการใช้งาน</Link>
                {" "}และ{" "}
                <Link href="/affiliate-agreement" className="text-indigo-600 hover:underline">ข้อตกลง Affiliate</Link>
              </label>
            </div>
            {errors.agree_terms && <p className="text-xs text-red-500">{errors.agree_terms.message}</p>}

            <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700" size="lg" loading={isSubmitting}>
              สมัครเป็น Affiliate
            </Button>
          </form>

          <p className="mt-4 text-center text-sm text-slate-500">
            มีบัญชีอยู่แล้ว?{" "}
            <Link href="/login" className="text-indigo-600 hover:underline font-medium">เข้าสู่ระบบ</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
