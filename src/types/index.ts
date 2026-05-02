export type UserRole = "student" | "admin" | "affiliate"

export type PortfolioStatus = "pending" | "under_review" | "approved" | "rejected" | "revision_needed"

export type NotificationTarget = "all" | "students" | "affiliates" | "specific_user"

export type AdPosition = "top" | "bottom" | "sidebar" | "in_feed"

export interface Profile {
  id: string
  role: UserRole
  full_name: string
  email: string
  school?: string
  phone?: string
  avatar_url?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Portfolio {
  id: string
  affiliate_id: string
  title: string
  owner_name: string
  faculty: string
  university: string
  school: string
  tags: string[]
  cover_image_url?: string
  pdf_url?: string
  is_admitted: boolean
  status: PortfolioStatus
  review_notes?: string
  is_visible: boolean
  view_count: number
  like_count: number
  created_at: string
  updated_at: string
  affiliate?: Profile
  pages?: PortfolioPage[]
  pins?: PortfolioPin[]
}

export interface PortfolioPage {
  id: string
  portfolio_id: string
  page_number: number
  audio_url?: string
  created_at: string
}

export interface PortfolioPin {
  id: string
  portfolio_id: string
  page_number: number
  x_position: number
  y_position: number
  audio_url?: string
  note_text?: string
  note_link?: string
  pin_type: "audio" | "note" | "both"
  created_at: string
}

export interface BannerAd {
  id: string
  title: string
  image_url: string
  link_url?: string
  position: AdPosition
  is_visible: boolean
  order_index: number
  click_count: number
  view_count: number
  created_at: string
  updated_at: string
}

export interface Notification {
  id: string
  from_admin_id: string
  target_type: NotificationTarget
  target_user_id?: string
  title: string
  message: string
  is_read: boolean
  created_at: string
  from_admin?: Profile
}

export interface ReviewChecklist {
  id: string
  portfolio_id: string
  reviewer_id: string
  criteria: ReviewCriteria
  total_score: number
  decision: "approved" | "rejected" | "revision_needed"
  feedback: string
  created_at: string
}

export interface ReviewCriteria {
  relevance: number        // 0-25: ความเกี่ยวข้องกับสาขาวิชา
  originality: number      // 0-25: ความคิดริเริ่มสร้างสรรค์
  quality: number          // 0-25: คุณภาพและความสมบูรณ์ของ portfolio
  presentation: number     // 0-25: การนำเสนอและความชัดเจน
  notes: string
}

export interface KpiSettings {
  id: string
  view_rate: number        // บาท/view
  completion_rate: number  // bonus เมื่อ user ดูครบ
  like_rate: number        // บาท/like
  min_threshold: number    // ขั้นต่ำก่อนจ่าย
  is_active: boolean
  updated_at: string
}

export interface AffiliatePayment {
  id: string
  affiliate_id: string
  period_start: string
  period_end: string
  total_views: number
  total_completions: number
  total_likes: number
  amount: number
  status: "pending" | "paid"
  kpi_data: Record<string, unknown>
  created_at: string
  affiliate?: Profile
}

export interface PortfolioView {
  id: string
  portfolio_id: string
  user_id?: string
  session_id: string
  pages_viewed: number[]
  duration_seconds: number
  is_completed: boolean
  created_at: string
}

export interface SearchFilters {
  query?: string
  faculty?: string
  university?: string
  tags?: string[]
  is_admitted?: boolean
  sort_by?: "newest" | "most_viewed" | "recommended"
}
