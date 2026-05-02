"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Mail, Lock, User, ShieldCheck } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"

const ADMIN_SECRET = process.env.NEXT_PUBLIC_ADMIN_REGISTER_SECRET || "pastport-admin-2024"

const schema = z.object({
  full_name: z.string().min(2, "กรุณากรอกชื่อ"),
  email: z.string().email("กรุณากรอกอีเมลที่ถูกต้อง"),
  password: z.string().min(8, "รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร"),
  confirm_password: z.string(),
  secret_key: z.string().min(1, "กรุณากรอก Secret Key"),
}).refine(d => d.password === d.confirm_password, {
  message: "รหัสผ่านไม่ตรงกัน",
  path: ["confirm_password"],
})

type FormData = z.infer<typeof schema>

export default function AdminRegisterPage() {
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    if (data.secret_key !== ADMIN_SECRET) {
      toast({ variant: "destructive", title: "Secret Key ไม่ถูกต้อง" })
      return
    }

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: data.email,
        password: data.password,
        role: "admin",
        full_name: data.full_name,
      }),
    })

    const json = await res.json()

    if (!res.ok) {
      toast({ variant: "destructive", title: "สมัครไม่สำเร็จ", description: json.error })
      return
    }

    toast({ variant: "success", title: "สร้างบัญชี Admin สำเร็จ! กรุณาเข้าสู่ระบบ" })
    router.push("/login")
  }

  return (
    <div className="w-full max-w-md">
      <Card className="shadow-lg border-0">
        <CardHeader className="text-center pb-2">
          <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center mx-auto mb-4">
            <ShieldCheck className="h-7 w-7 text-white" />
          </div>
          <CardTitle className="text-2xl">สมัคร — Admin</CardTitle>
          <CardDescription>สร้างบัญชีผู้ดูแลระบบ Pastport</CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
            <p className="text-sm text-amber-700">
              ต้องใช้ <strong>Secret Key</strong> จากทีมพัฒนาในการสมัคร Admin
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
              placeholder="admin@pastport.com"
              icon={<Mail className="h-4 w-4" />}
              error={errors.email?.message}
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
                placeholder="ยืนยัน"
                icon={<Lock className="h-4 w-4" />}
                error={errors.confirm_password?.message}
              />
            </div>
            <Input
              {...register("secret_key")}
              type="password"
              label="Secret Key"
              placeholder="กรอก Secret Key"
              icon={<ShieldCheck className="h-4 w-4" />}
              error={errors.secret_key?.message}
            />

            <Button type="submit" className="w-full bg-slate-800 hover:bg-slate-900" size="lg" loading={isSubmitting}>
              สร้างบัญชี Admin
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
