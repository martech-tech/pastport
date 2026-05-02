"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, Mail, Lock, BookOpen } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"

const schema = z.object({
  email: z.string().email("กรุณากรอกอีเมลที่ถูกต้อง"),
  password: z.string().min(6, "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร"),
})

type FormData = z.infer<typeof schema>

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    const { error, data: authData } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    })

    if (error) {
      toast({ variant: "destructive", title: "เข้าสู่ระบบไม่สำเร็จ", description: "อีเมลหรือรหัสผ่านไม่ถูกต้อง" })
      return
    }

    if (authData.user) {
      // Try metadata first (fast), fallback to DB query
      let role = authData.user.user_metadata?.role as string | undefined

      if (!role) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", authData.user.id)
          .single()
        role = profile?.role
      }

      if (role === "admin") router.push("/admin")
      else if (role === "affiliate") router.push("/affiliate")
      else router.push("/home")
    }
  }

  return (
    <div className="w-full max-w-md">
      <Card className="shadow-lg border-0">
        <CardHeader className="text-center pb-2">
          <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-4">
            <BookOpen className="h-7 w-7 text-white" />
          </div>
          <CardTitle className="text-2xl">เข้าสู่ระบบ</CardTitle>
          <CardDescription>ยินดีต้อนรับกลับสู่ Pastport</CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              {...register("email")}
              type="email"
              label="อีเมล"
              placeholder="your@email.com"
              icon={<Mail className="h-4 w-4" />}
              error={errors.email?.message}
            />
            <div className="relative">
              <Input
                {...register("password")}
                type={showPassword ? "text" : "password"}
                label="รหัสผ่าน"
                placeholder="••••••••"
                icon={<Lock className="h-4 w-4" />}
                error={errors.password?.message}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-9 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            <div className="flex justify-end">
              <Link href="/forgot-password" className="text-sm text-indigo-600 hover:underline">
                ลืมรหัสผ่าน?
              </Link>
            </div>

            <Button type="submit" className="w-full" size="lg" loading={isSubmitting}>
              เข้าสู่ระบบ
            </Button>
          </form>

          <div className="mt-6 text-center space-y-3">
            <p className="text-sm text-slate-500">ยังไม่มีบัญชี?</p>
            <div className="grid grid-cols-2 gap-2">
              <Link href="/register/student">
                <Button variant="outline" size="sm" className="w-full text-xs">
                  สมัครเป็นนักเรียน
                </Button>
              </Link>
              <Link href="/register/affiliate">
                <Button variant="outline" size="sm" className="w-full text-xs">
                  สมัครเป็น Affiliate
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
