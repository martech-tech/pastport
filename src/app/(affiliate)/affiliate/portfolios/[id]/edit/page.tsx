"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import { Save, Plus, Trash2, Volume2, StickyNote, MapPin, Upload, ArrowLeft, Link as LinkIcon } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import type { Portfolio, PortfolioPage, PortfolioPin } from "@/types"

export default function EditPortfolioPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null)
  const [pages, setPages] = useState<PortfolioPage[]>([])
  const [pins, setPins] = useState<PortfolioPin[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [pinModal, setPinModal] = useState<{ open: boolean; pin?: PortfolioPin | null }>({ open: false })
  const [pinForm, setPinForm] = useState({ page_number: 1, x_position: 50, y_position: 50, note_text: "", note_link: "", pin_type: "note" as "audio" | "note" | "both" })
  const [audioFile, setAudioFile] = useState<File | null>(null)
  const [pinAudioFile, setPinAudioFile] = useState<File | null>(null)
  const [selectedPageForAudio, setSelectedPageForAudio] = useState<number>(1)
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()

  useEffect(() => {
    fetchPortfolio()
  }, [id])

  const fetchPortfolio = async () => {
    setLoading(true)
    const { data } = await supabase
      .from("portfolios")
      .select("*, pages:portfolio_pages(*), pins:portfolio_pins(*)")
      .eq("id", id)
      .single()
    if (data) {
      setPortfolio(data as Portfolio)
      setPages((data as Portfolio).pages || [])
      setPins((data as Portfolio).pins || [])
    }
    setLoading(false)
  }

  // Upload audio for a page
  const uploadPageAudio = async (pageNum: number) => {
    if (!audioFile || !portfolio) return
    setSaving(true)
    const path = `audio/${portfolio.affiliate_id}/${id}/page_${pageNum}_${Date.now()}.mp3`
    await supabase.storage.from("portfolio-files").upload(path, audioFile)
    const { data: { publicUrl } } = supabase.storage.from("portfolio-files").getPublicUrl(path)

    const existing = pages.find(p => p.page_number === pageNum)
    if (existing) {
      await supabase.from("portfolio_pages").update({ audio_url: publicUrl }).eq("id", existing.id)
      setPages(prev => prev.map(p => p.page_number === pageNum ? { ...p, audio_url: publicUrl } : p))
    } else {
      const { data: newPage } = await supabase.from("portfolio_pages").insert({
        portfolio_id: id,
        page_number: pageNum,
        audio_url: publicUrl,
      }).select().single()
      if (newPage) setPages(prev => [...prev, newPage as PortfolioPage])
    }

    setAudioFile(null)
    setSaving(false)
    toast({ variant: "success", title: "บันทึกเสียงหน้า " + pageNum + " สำเร็จ" })
  }

  const deletePageAudio = async (page: PortfolioPage) => {
    await supabase.from("portfolio_pages").delete().eq("id", page.id)
    setPages(prev => prev.filter(p => p.id !== page.id))
  }

  // Pin management
  const savePin = async () => {
    if (!portfolio) return
    setSaving(true)

    let audioUrl: string | undefined
    if (pinAudioFile) {
      const path = `audio/${portfolio.affiliate_id}/${id}/pin_${Date.now()}.mp3`
      await supabase.storage.from("portfolio-files").upload(path, pinAudioFile)
      const { data: { publicUrl } } = supabase.storage.from("portfolio-files").getPublicUrl(path)
      audioUrl = publicUrl
    }

    const payload = {
      portfolio_id: id,
      page_number: pinForm.page_number,
      x_position: pinForm.x_position,
      y_position: pinForm.y_position,
      note_text: pinForm.note_text || null,
      note_link: pinForm.note_link || null,
      pin_type: pinForm.pin_type,
      audio_url: audioUrl || (pinModal.pin?.audio_url) || null,
    }

    if (pinModal.pin) {
      await supabase.from("portfolio_pins").update(payload).eq("id", pinModal.pin.id)
      setPins(prev => prev.map(p => p.id === pinModal.pin!.id ? { ...p, ...payload } as PortfolioPin : p))
    } else {
      const { data: newPin } = await supabase.from("portfolio_pins").insert(payload).select().single()
      if (newPin) setPins(prev => [...prev, newPin as PortfolioPin])
    }

    setPinModal({ open: false })
    setPinAudioFile(null)
    setSaving(false)
    toast({ variant: "success", title: "บันทึก Pin สำเร็จ" })
  }

  const deletePin = async (pin: PortfolioPin) => {
    await supabase.from("portfolio_pins").delete().eq("id", pin.id)
    setPins(prev => prev.filter(p => p.id !== pin.id))
  }

  const openAddPin = () => {
    setPinForm({ page_number: 1, x_position: 50, y_position: 50, note_text: "", note_link: "", pin_type: "note" })
    setPinAudioFile(null)
    setPinModal({ open: true, pin: null })
  }

  const openEditPin = (pin: PortfolioPin) => {
    setPinForm({
      page_number: pin.page_number,
      x_position: pin.x_position,
      y_position: pin.y_position,
      note_text: pin.note_text || "",
      note_link: pin.note_link || "",
      pin_type: pin.pin_type,
    })
    setPinAudioFile(null)
    setPinModal({ open: true, pin })
  }

  if (loading) return <div className="space-y-4"><Skeleton className="h-8 w-48" /><Skeleton className="h-96 w-full rounded-xl" /></div>
  if (!portfolio) return <div className="text-center py-20"><p className="text-slate-500">ไม่พบ portfolio</p></div>

  const maxPage = portfolio.pages?.length || 20

  return (
    <div className="space-y-6 page-transition">
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="p-2 rounded-lg hover:bg-slate-100">
          <ArrowLeft className="h-5 w-5 text-slate-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">แก้ไข Portfolio</h1>
          <p className="text-slate-500 text-sm mt-0.5">{portfolio.title}</p>
        </div>
      </div>

      <Tabs defaultValue="audio">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="audio">
            <Volume2 className="h-4 w-4 mr-2" />
            เสียงแต่ละหน้า
          </TabsTrigger>
          <TabsTrigger value="pins">
            <MapPin className="h-4 w-4 mr-2" />
            Pin / จุดอธิบาย ({pins.length})
          </TabsTrigger>
        </TabsList>

        {/* Audio per page */}
        <TabsContent value="audio" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Volume2 className="h-4 w-4 text-indigo-600" />
                เพิ่มเสียงประกอบแต่ละหน้า
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-sm text-blue-700">
                อัปโหลดไฟล์เสียง MP3/AAC สำหรับแต่ละหน้า PDF เสียงจะเล่นอัตโนมัติเมื่อผู้ดูเลื่อนมาถึงหน้านั้น
              </div>

              {/* Upload Section */}
              <div className="p-4 bg-slate-50 rounded-xl space-y-3">
                <div className="flex items-center gap-3">
                  <Select value={selectedPageForAudio.toString()} onValueChange={v => setSelectedPageForAudio(parseInt(v))}>
                    <SelectTrigger label="หน้าที่ต้องการเพิ่มเสียง" className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: Math.max(maxPage, 20) }, (_, i) => i + 1).map(n => (
                        <SelectItem key={n} value={n.toString()}>หน้า {n}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <label className={`flex-1 flex items-center justify-center gap-2 h-10 rounded-lg border-2 border-dashed cursor-pointer transition-colors ${
                    audioFile ? "border-emerald-400 bg-emerald-50 text-emerald-700" : "border-slate-300 hover:border-indigo-400 text-slate-500"
                  }`}>
                    <input type="file" accept="audio/*" className="hidden" onChange={e => setAudioFile(e.target.files?.[0] || null)} />
                    <Upload className="h-4 w-4" />
                    <span className="text-sm">{audioFile ? audioFile.name : "เลือกไฟล์เสียง"}</span>
                  </label>

                  <Button
                    onClick={() => uploadPageAudio(selectedPageForAudio)}
                    disabled={!audioFile || saving}
                    loading={saving}
                    size="sm"
                  >
                    บันทึก
                  </Button>
                </div>
              </div>

              {/* Existing Audio List */}
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-slate-700">เสียงที่มีอยู่ ({pages.filter(p => p.audio_url).length} หน้า)</h3>
                {pages.filter(p => p.audio_url).length === 0 ? (
                  <p className="text-sm text-slate-400">ยังไม่มีเสียงประกอบ</p>
                ) : (
                  pages.filter(p => p.audio_url).sort((a, b) => a.page_number - b.page_number).map(page => (
                    <div key={page.id} className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-xl">
                      <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center shrink-0">
                        <Volume2 className="h-4 w-4 text-indigo-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">หน้า {page.page_number}</p>
                        <audio src={page.audio_url} controls className="w-full h-6 mt-1" />
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-400 hover:text-red-600 hover:bg-red-50 shrink-0"
                        onClick={() => deletePageAudio(page)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pins */}
        <TabsContent value="pins" className="mt-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-indigo-600" />
                  จัดการ Pin / จุดอธิบาย
                </CardTitle>
                <Button size="sm" onClick={openAddPin}>
                  <Plus className="h-4 w-4 mr-2" />
                  เพิ่ม Pin
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-sm text-blue-700 mb-4">
                Pin คือจุดที่กำหนดบนหน้า PDF เมื่อผู้ดูกดที่จุด จะมีเสียงอธิบายหรือข้อความ note ปรากฏขึ้น
              </div>

              {pins.length === 0 ? (
                <div className="text-center py-8">
                  <MapPin className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500">ยังไม่มี Pin</p>
                  <Button variant="outline" size="sm" className="mt-3" onClick={openAddPin}>
                    <Plus className="h-4 w-4 mr-2" />
                    เพิ่ม Pin แรก
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  {pins.sort((a, b) => a.page_number - b.page_number).map(pin => (
                    <div key={pin.id} className="flex items-start gap-3 p-4 bg-white border border-slate-200 rounded-xl hover:border-indigo-200 transition-colors">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                        pin.pin_type === "audio" ? "bg-indigo-100" :
                        pin.pin_type === "note" ? "bg-amber-100" :
                        "bg-purple-100"
                      }`}>
                        {pin.pin_type === "audio" ? <Volume2 className="h-4 w-4 text-indigo-600" /> :
                         pin.pin_type === "note" ? <StickyNote className="h-4 w-4 text-amber-600" /> :
                         <MapPin className="h-4 w-4 text-purple-600" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="text-xs">หน้า {pin.page_number}</Badge>
                          <Badge variant={
                            pin.pin_type === "audio" ? "info" :
                            pin.pin_type === "note" ? "warning" :
                            "default"
                          } className="text-xs">
                            {pin.pin_type === "audio" ? "เสียง" : pin.pin_type === "note" ? "Note" : "เสียง + Note"}
                          </Badge>
                          <span className="text-xs text-slate-400">({pin.x_position}%, {pin.y_position}%)</span>
                        </div>
                        {pin.note_text && <p className="text-sm text-slate-600 line-clamp-2">{pin.note_text}</p>}
                        {pin.note_link && (
                          <a href={pin.note_link} target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-600 flex items-center gap-1 mt-1">
                            <LinkIcon className="h-3 w-3" />
                            {pin.note_link}
                          </a>
                        )}
                        {pin.audio_url && (
                          <audio src={pin.audio_url} controls className="w-full h-6 mt-2" />
                        )}
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditPin(pin)}>
                          <Save className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-400 hover:text-red-600 hover:bg-red-50" onClick={() => deletePin(pin)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Pin Modal */}
      <Dialog open={pinModal.open} onOpenChange={(o) => setPinModal({ open: o })}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{pinModal.pin ? "แก้ไข Pin" : "เพิ่ม Pin ใหม่"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <Select value={pinForm.page_number.toString()} onValueChange={v => setPinForm(f => ({ ...f, page_number: parseInt(v) }))}>
                <SelectTrigger label="หน้า">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: Math.max(maxPage, 20) }, (_, i) => i + 1).map(n => (
                    <SelectItem key={n} value={n.toString()}>หน้า {n}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                label="ตำแหน่ง X (%)"
                type="number" min={0} max={100}
                value={pinForm.x_position}
                onChange={e => setPinForm(f => ({ ...f, x_position: parseFloat(e.target.value) }))}
              />
              <Input
                label="ตำแหน่ง Y (%)"
                type="number" min={0} max={100}
                value={pinForm.y_position}
                onChange={e => setPinForm(f => ({ ...f, y_position: parseFloat(e.target.value) }))}
              />
            </div>

            <div className="grid grid-cols-3 gap-2">
              {(["audio", "note", "both"] as const).map(type => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setPinForm(f => ({ ...f, pin_type: type }))}
                  className={`p-3 rounded-xl border text-sm font-medium transition-all ${
                    pinForm.pin_type === type ? "border-indigo-500 bg-indigo-50 text-indigo-700" : "border-slate-200 text-slate-600"
                  }`}
                >
                  {type === "audio" ? "🔊 เสียง" : type === "note" ? "📝 Note" : "🔊+📝 ทั้งคู่"}
                </button>
              ))}
            </div>

            {(pinForm.pin_type === "audio" || pinForm.pin_type === "both") && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">ไฟล์เสียง</label>
                <label className={`flex items-center justify-center gap-2 h-10 rounded-lg border-2 border-dashed cursor-pointer ${
                  pinAudioFile ? "border-emerald-400 bg-emerald-50 text-emerald-700" : "border-slate-300 text-slate-500"
                }`}>
                  <input type="file" accept="audio/*" className="hidden" onChange={e => setPinAudioFile(e.target.files?.[0] || null)} />
                  <Upload className="h-4 w-4" />
                  <span className="text-sm">{pinAudioFile ? pinAudioFile.name : "เลือกไฟล์เสียง"}</span>
                </label>
                {pinModal.pin?.audio_url && !pinAudioFile && (
                  <audio src={pinModal.pin.audio_url} controls className="w-full h-7 mt-1" />
                )}
              </div>
            )}

            {(pinForm.pin_type === "note" || pinForm.pin_type === "both") && (
              <>
                <Textarea
                  label="ข้อความ Note"
                  value={pinForm.note_text}
                  onChange={e => setPinForm(f => ({ ...f, note_text: e.target.value }))}
                  placeholder="อธิบายเนื้อหาในจุดนี้..."
                  className="h-20"
                />
                <Input
                  label="ลิงก์อ้างอิง (ไม่บังคับ)"
                  value={pinForm.note_link}
                  onChange={e => setPinForm(f => ({ ...f, note_link: e.target.value }))}
                  placeholder="https://..."
                  icon={<LinkIcon className="h-4 w-4" />}
                />
              </>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setPinModal({ open: false })}>ยกเลิก</Button>
            <Button onClick={savePin} loading={saving}>บันทึก Pin</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
