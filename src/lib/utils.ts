import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date) {
  return new Date(date).toLocaleDateString("th-TH", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency: "THB",
  }).format(amount)
}

export function truncate(str: string, length: number) {
  if (str.length <= length) return str
  return str.slice(0, length) + "..."
}

export function generateSlug(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9฀-๿]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

export function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

export function formatDuration(seconds: number) {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, "0")}`
}

export const FACULTIES = [
  "วิศวกรรมศาสตร์",
  "วิทยาศาสตร์",
  "แพทยศาสตร์",
  "ทันตแพทยศาสตร์",
  "เภสัชศาสตร์",
  "พยาบาลศาสตร์",
  "สถาปัตยกรรมศาสตร์",
  "ครุศาสตร์ / ศึกษาศาสตร์",
  "นิติศาสตร์",
  "รัฐศาสตร์",
  "เศรษฐศาสตร์",
  "บริหารธุรกิจ",
  "บัญชี",
  "นิเทศศาสตร์",
  "อักษรศาสตร์ / มนุษยศาสตร์",
  "สังคมศาสตร์",
  "จิตวิทยา",
  "ศิลปกรรมศาสตร์",
  "ดนตรี",
  "เทคโนโลยีสารสนเทศ",
  "วิทยาการคอมพิวเตอร์",
  "อุตสาหกรรมเกษตร",
  "สิ่งแวดล้อม",
  "อื่นๆ",
] as const

export const UNIVERSITIES = [
  "จุฬาลงกรณ์มหาวิทยาลัย",
  "มหาวิทยาลัยธรรมศาสตร์",
  "มหาวิทยาลัยมหิดล",
  "มหาวิทยาลัยเกษตรศาสตร์",
  "มหาวิทยาลัยศิลปากร",
  "มหาวิทยาลัยศรีนครินทรวิโรฒ",
  "สถาบันเทคโนโลยีพระจอมเกล้าเจ้าคุณทหารลาดกระบัง",
  "มหาวิทยาลัยเทคโนโลยีพระจอมเกล้าธนบุรี",
  "มหาวิทยาลัยเทคโนโลยีพระจอมเกล้าพระนครเหนือ",
  "มหาวิทยาลัยเชียงใหม่",
  "มหาวิทยาลัยขอนแก่น",
  "มหาวิทยาลัยสงขลานครินทร์",
  "มหาวิทยาลัยนเรศวร",
  "มหาวิทยาลัยบูรพา",
  "มหาวิทยาลัยแม่โจ้",
  "มหาวิทยาลัยอื่นๆ",
] as const
