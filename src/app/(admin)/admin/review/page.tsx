"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { CheckCircle, XCircle, AlertCircle, FileText, User, GraduationCap, Eye } from "lucide-react"
import { formatDate } from "@/lib/utils"
import type { Portfolio, ReviewCriteria } from "@/types"
import Link from "next/link"

const CRITERIA_LABELS = {
  relevance: "ความเกี่ยวข้องกับสาขาวิชา",
  originality: "ความคิดริเริ่มสร้างสรรค์",
  quality: "คุณภาพและความสมบูรณ์",
  presentation: "การนำเสนอและความชัดเจน",
}

const defaultCriteria: ReviewCriteria = {
  relevance: 0,
  originality: 0,
  quality: 0,
  presentation: 0,
  notes: "",
}

export default function AdminReviewPage() {
  const [pending, setPending] = useState<Portfolio[]>([])
  const [selected, setSelected] = useState<Portfolio | null>(null)
  const [criteria, setCriteria] = useState<ReviewCriteria>(defaultCriteria)
  const [feedback, setFeedback] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchPending()
  }, [])

  const fetchPending = async () => {
    setLoading(true)
    const { data } = await supabase
      .from("portfolios")
      .select("*, affiliate:profiles(id, full_name, email)")
      .in("status", ["pending", "under_review"])
      .order("created_at", { ascending: true })
    setPending((data as Portfolio[]) || [])
    setLoading(false)
  }

  const startReview = async (port: Portfolio) => {
    await supabase.from("portfolios").update({ status: "under_review" }).eq("id", port.id)
    setSelected(port)
    setCriteria(defaultCriteria)
    setFeedback("")
    setPending(prev => prev.map(p => p.id === port.id ? { ...p, status: "under_review" } : p))
  }

  const totalScore = criteria.relevance + criteria.originality + criteria.quality + criteria.presentation

  const submitReview = async (decision: "approved" | "rejected" | "revision_needed") => {
    if (!selected) return
    setSubmitting(true)

    const { data: { user } } = await supabase.auth.getUser()

    await Promise.all([
      supabase.from("portfolios").update({
        status: decision,
        review_notes: feedback,
        is_visible: decision === "approved",
      }).eq("id", selected.id),
      supabase.from("review_checklists").insert({
        portfolio_id: selected.id,
        reviewer_id: user?.id,
        criteria: JSON.stringify(criteria),
        total_score: totalScore,
        decision,
        feedback,
      }),
      // Notify affiliate
      supabase.from("notifications").insert({
        from_admin_id: user?.id,
        target_type: "specific_user",
        target_user_id: selected.affiliate_id,
        title: decision === "approved" ? "Portfolio ของคุณได้รับการอนุมัติ!" : "Portfolio ของคุณถูกปฏิเสธ",
        message: decision === "approved"
          ? `Portfolio "${selected.title}" ได้รับการอนุมัติและเผยแพร่แล้ว ขอบคุณที่ร่วมเป็นส่วนหนึ่งของ Pastport`
          : `Portfolio "${selected.title}" ไม่ผ่านการพิจารณา เหตุผล: ${feedback}`,
        is_read: false,
      }),
    ])

    setPending(prev => prev.filter(p => p.id !== selected.id))
    setSelected(null)
    setSubmitting(false)
  }

  return (
    <div className="space-y-6 page-transition">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">พิจารณา Portfolio</h1>
        <p className="text-slate-500 mt-1">ใช้มาตรฐาน Q1 Journal Review</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending List */}
        <div className="space-y-3">
          <h2 className="font-semibold text-slate-700 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-amber-500" />
            รอพิจารณา ({pending.length})
          </h2>

          {loading ? (
            Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)
          ) : pending.length === 0 ? (
            <Card className="p-8 text-center">
              <CheckCircle className="h-10 w-10 text-emerald-500 mx-auto mb-3" />
              <p className="text-slate-500">ไม่มี portfolio รอพิจารณา</p>
            </Card>
          ) : (
            pending.map(port => (
              <Card
                key={port.id}
                className={`p-4 cursor-pointer transition-all hover:border-indigo-300 ${selected?.id === port.id ? "border-indigo-500 bg-indigo-50" : ""}`}
                onClick={() => startReview(port)}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant={port.status === "under_review" ? "info" : "warning"}>
                        {port.status === "under_review" ? "กำลังพิจารณา" : "รอพิจารณา"}
                      </Badge>
                    </div>
                    <h3 className="font-medium text-slate-800 truncate">{port.title}</h3>
                    <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                      <span className="flex items-center gap-1"><User className="h-3 w-3" />{(port.affiliate as Portfolio["affiliate"])?.full_name}</span>
                      <span className="flex items-center gap-1"><GraduationCap className="h-3 w-3" />{port.faculty}</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">{formatDate(port.created_at)}</p>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    {port.pdf_url && (
                      <a href={port.pdf_url} target="_blank" rel="noopener noreferrer">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                      </a>
                    )}
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>

        {/* Review Panel */}
        {selected ? (
          <Card className="p-6 space-y-5">
            <div>
              <h2 className="font-semibold text-slate-800 mb-1">{selected.title}</h2>
              <p className="text-sm text-slate-500">{selected.faculty} — {selected.university}</p>
            </div>

            {/* Criteria Scoring */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <FileText className="h-4 w-4" />
                เกณฑ์การพิจารณา (Q1 Standard — 100 คะแนน)
              </h3>

              {(Object.keys(CRITERIA_LABELS) as Array<keyof typeof CRITERIA_LABELS>).map(key => (
                <div key={key} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">{CRITERIA_LABELS[key]}</span>
                    <span className="font-medium text-slate-800">{criteria[key]}/25</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={25}
                    value={criteria[key]}
                    onChange={e => setCriteria(prev => ({ ...prev, [key]: parseInt(e.target.value) }))}
                    className="w-full accent-indigo-600"
                  />
                  <Progress value={(criteria[key] / 25) * 100} />
                </div>
              ))}

              <div className="bg-slate-50 rounded-xl p-4 flex items-center justify-between">
                <span className="font-semibold text-slate-700">คะแนนรวม</span>
                <div className="text-right">
                  <span className={`text-2xl font-bold ${totalScore >= 70 ? "text-emerald-600" : totalScore >= 50 ? "text-amber-600" : "text-red-600"}`}>
                    {totalScore}
                  </span>
                  <span className="text-slate-500">/100</span>
                  <p className="text-xs text-slate-500">
                    {totalScore >= 70 ? "ผ่านเกณฑ์ ✓" : totalScore >= 50 ? "แก้ไขก่อน" : "ไม่ผ่านเกณฑ์"}
                  </p>
                </div>
              </div>
            </div>

            {/* Feedback */}
            <Textarea
              value={feedback}
              onChange={e => setFeedback(e.target.value)}
              label="ความคิดเห็นและเหตุผล"
              placeholder="กรอกความคิดเห็นโดยละเอียด..."
              className="h-24"
            />

            {/* Actions */}
            <div className="grid grid-cols-3 gap-2">
              <Button
                variant="destructive"
                size="sm"
                onClick={() => submitReview("rejected")}
                loading={submitting}
                className="gap-1"
              >
                <XCircle className="h-4 w-4" />
                ไม่ผ่าน
              </Button>
              <Button
                variant="warning"
                size="sm"
                onClick={() => submitReview("revision_needed")}
                loading={submitting}
                className="gap-1"
              >
                <AlertCircle className="h-4 w-4" />
                แก้ไขก่อน
              </Button>
              <Button
                variant="success"
                size="sm"
                onClick={() => submitReview("approved")}
                loading={submitting}
                disabled={totalScore < 50}
                className="gap-1"
              >
                <CheckCircle className="h-4 w-4" />
                อนุมัติ
              </Button>
            </div>

            <p className="text-xs text-slate-400 text-center">
              ต้องได้คะแนน ≥ 50 จึงจะอนุมัติได้ | ≥ 70 ผ่านมาตรฐาน Q1
            </p>
          </Card>
        ) : (
          <Card className="p-12 text-center">
            <FileText className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">เลือก portfolio จากรายการเพื่อเริ่มพิจารณา</p>
          </Card>
        )}
      </div>
    </div>
  )
}
