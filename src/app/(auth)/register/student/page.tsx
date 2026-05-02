"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, Mail, Lock, User, School, Phone } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"

const schema = z.object({
  full_name: z.string().min(2, "กรุณากรอกชื่อ-นามสกุล"),
  email: z.string().email("กรุณากรอกอีเมลที่ถูกต้อง"),
  phone: z.string().optional(),
  school: z.string().min(2, "กรุณากรอกชื่อโรงเรียน"),
  password: z.string().min(8, "รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร"),
  confirm_password: z.string(),
  agree_terms: z.boolean().refine(v => v, "กรุณายอมรับข้อกำหนด"),
}).refine(d => d.password === d.confirm_password, {
  message: "รหัสผ่านไม่ตรงกัน",
  path: ["confirm_password"],
})

type FormData = z.infer<typeof schema>

export default function StudentRegisterPage() {
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
        role: "student",
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

    toast({ variant: "success", title: "สมัครสมาชิกสำเร็จ!", description: "เข้าสู่ระบบได้เลย" })
    router.push("/login")
  }

  return (
    <div className="w-full max-w-lg">
      <Card className="shadow-lg border-0">
        <CardHeader className="text-center pb-2">
          <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-4">
            <User className="h-7 w-7 text-white" />
          </div>
          <CardTitle className="text-2xl">สมัครสมาชิก — นักเรียน</CardTitle>
          <CardDescription>เข้าถึง portfolio จากรุ่นพี่มหาวิทยาลัยชั้นนำ</CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <Input
                  {...register("full_name")}
                  label="ชื่อ-นามสกุล"
                  placeholder="ชื่อ นามสกุล"
                  icon={<User className="h-4 w-4" />}
                  error={errors.full_name?.message}
                />
              </div>
              <div className="col-span-2">
                <Input
                  {...register("email")}
                  type="email"
                  label="อีเมล"
                  placeholder="your@email.com"
                  icon={<Mail className="h-4 w-4" />}
                  error={errors.email?.message}
                />
              </div>
              <div className="col-span-2">
                <Input
                  {...register("school")}
                  label="โรงเรียน"
                  placeholder="ชื่อโรงเรียน"
                  icon={<School className="h-4 w-4" />}
                  error={errors.school?.message}
                />
              </div>
              <div className="col-span-2">
                <Input
                  {...register("phone")}
                  type="tel"
                  label="เบอร์โทรศัพท์ (ไม่บังคับ)"
                  placeholder="08X-XXX-XXXX"
                  icon={<Phone className="h-4 w-4" />}
                />
              </div>
              <div className="relative">
                <Input
                  {...register("password")}
                  type={showPassword ? "text" : "password"}
                  label="รหัสผ่าน"
                  placeholder="อย่างน้อย 8 ตัว"
                  icon={<Lock className="h-4 w-4" />}
                  error={errors.password?.message}
                />
              </div>
              <div className="relative">
                <Input
                  {...register("confirm_password")}
                  type={showPassword ? "text" : "password"}
                  label="ยืนยันรหัสผ่าน"
                  placeholder="ยืนยันรหัสผ่าน"
                  icon={<Lock className="h-4 w-4" />}
                  error={errors.confirm_password?.message}
                />
              </div>
            </div>

            <div className="flex items-start gap-2 mt-2">
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
                <Link href="/privacy" className="text-indigo-600 hover:underline">นโยบายความเป็นส่วนตัว</Link>
              </label>
            </div>
            {errors.agree_terms && <p className="text-xs text-red-500">{errors.agree_terms.message}</p>}

            <Button type="submit" className="w-full" size="lg" loading={isSubmitting}>
              สมัครสมาชิก
            </Button>
          </form>

          <p className="mt-4 text-center text-sm text-slate-500">
            มีบัญชีอยู่แล้ว?{" "}
            <Link href="/login" className="text-indigo-600 hover:underline font-medium">เข้าสู่ระบบ</Link>
          </p>
        </CardContent>
      </Card>

      <button
        className="mt-4 text-sm text-slate-400"
        onClick={() => setShowPassword(!showPassword)}
      >
        {showPassword ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}
      </button>
    </div>
  )
}
