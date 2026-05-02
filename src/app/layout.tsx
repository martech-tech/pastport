import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import { Providers } from "@/components/providers"

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] })
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Pastport — Portfolio มีเสียงสำหรับนักเรียน TCAS",
  description: "ค้นหาและเรียนรู้จาก portfolio จริงของรุ่นพี่ พร้อมเสียงอธิบายจากเจ้าของ portfolio",
  keywords: ["portfolio", "TCAS", "มหาวิทยาลัย", "นักเรียน", "สอบเข้า"],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
