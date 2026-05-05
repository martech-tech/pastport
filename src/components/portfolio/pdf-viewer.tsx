"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Document, Page, pdfjs } from "react-pdf"
import "react-pdf/dist/Page/AnnotationLayer.css"
import "react-pdf/dist/Page/TextLayer.css"
import {
  ChevronLeft, ChevronRight, ZoomIn, ZoomOut,
  Volume2, VolumeX, Play, Pause, SkipBack,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { PinMarker } from "./pin-marker"
import { AudioBar } from "./audio-bar"
import type { PortfolioPage, PortfolioPin } from "@/types"

pdfjs.GlobalWorkerOptions.workerSrc =
  `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`

interface PDFViewerProps {
  pdfUrl: string
  pages: PortfolioPage[]
  pins: PortfolioPin[]
  portfolioId: string
}

export function PDFViewer({ pdfUrl, pages, pins, portfolioId }: PDFViewerProps) {
  const [numPages, setNumPages]           = useState(0)
  const [currentPage, setCurrentPage]     = useState(1)
  const [scale, setScale]                 = useState(1.0)
  const [audioEnabled, setAudioEnabled]   = useState(true)
  const [isPlaying, setIsPlaying]         = useState(false)
  const [audioDuration, setAudioDuration] = useState(0)
  const [audioTime, setAudioTime]         = useState(0)
  const [containerWidth, setContainerWidth] = useState(780)
  const [pdfError, setPdfError]           = useState(false)

  const audioRef     = useRef<HTMLAudioElement | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const pageRefs     = useRef<(HTMLDivElement | null)[]>([])
  const observerRef  = useRef<IntersectionObserver | null>(null)

  // ───── Responsive width ─────
  useEffect(() => {
    const measure = () => {
      if (containerRef.current)
        setContainerWidth(containerRef.current.clientWidth - 40)
    }
    measure()
    const ro = new ResizeObserver(measure)
    if (containerRef.current) ro.observe(containerRef.current)
    return () => ro.disconnect()
  }, [])

  // ───── IntersectionObserver → track visible page ─────
  useEffect(() => {
    observerRef.current?.disconnect()
    observerRef.current = new IntersectionObserver(
      (entries) => {
        const top = entries
          .filter(e => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
        if (top) {
          const n = parseInt(top.target.getAttribute("data-page") || "1")
          setCurrentPage(n)
        }
      },
      { threshold: [0.3, 0.6] }
    )
    pageRefs.current.forEach(r => r && observerRef.current?.observe(r))
    return () => observerRef.current?.disconnect()
  }, [numPages])

  // ───── Audio per page ─────
  useEffect(() => {
    const stopCurrent = () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.src = ""
        audioRef.current = null
      }
      setIsPlaying(false)
      setAudioTime(0)
      setAudioDuration(0)
    }

    stopCurrent()

    const pageAudio = pages.find(p => p.page_number === currentPage)
    if (!pageAudio?.audio_url || !audioEnabled) return

    const audio = new Audio(pageAudio.audio_url)
    audioRef.current = audio

    audio.addEventListener("loadedmetadata", () => setAudioDuration(audio.duration))
    audio.addEventListener("play",      () => setIsPlaying(true))
    audio.addEventListener("pause",     () => setIsPlaying(false))
    audio.addEventListener("ended",     () => { setIsPlaying(false); setAudioTime(0) })
    audio.addEventListener("timeupdate",() => setAudioTime(audio.currentTime))

    // Auto-play after short delay
    const t = setTimeout(() => audio.play().catch(() => {}), 600)
    return () => {
      clearTimeout(t)
      stopCurrent()
    }
  }, [currentPage, audioEnabled, pages])

  // ───── Helpers ─────
  const scrollToPage = useCallback((page: number) => {
    pageRefs.current[page - 1]?.scrollIntoView({ behavior: "smooth", block: "start" })
  }, [])

  const togglePlayPause = () => {
    if (!audioRef.current) return
    if (isPlaying) audioRef.current.pause()
    else audioRef.current.play().catch(() => {})
  }

  const restartAudio = () => {
    if (!audioRef.current) return
    audioRef.current.currentTime = 0
    audioRef.current.play().catch(() => {})
  }

  const toggleAudio = () => {
    if (audioEnabled && audioRef.current) audioRef.current.pause()
    setAudioEnabled(e => !e)
  }

  const fmt = (s: number) =>
    `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`

  const currentPageData   = pages.find(p => p.page_number === currentPage)
  const hasPageAudio      = !!currentPageData?.audio_url
  const pinsOnPage        = pins.filter(p => p.page_number === currentPage)
  const audioProgress     = audioDuration > 0 ? (audioTime / audioDuration) * 100 : 0
  const pageProgress      = numPages > 0 ? (currentPage / numPages) * 100 : 0

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">

      {/* ── Top Toolbar ── */}
      <div className="sticky top-0 z-20 bg-white border-b border-slate-100">
        {/* Navigation row */}
        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-slate-50">
          <Button variant="ghost" size="icon" className="h-8 w-8"
            onClick={() => scrollToPage(Math.max(1, currentPage - 1))}
            disabled={currentPage <= 1}>
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <span className="text-sm font-semibold text-slate-700 min-w-[72px] text-center">
            {currentPage} <span className="text-slate-400 font-normal">/ {numPages || "…"}</span>
          </span>

          <Button variant="ghost" size="icon" className="h-8 w-8"
            onClick={() => scrollToPage(Math.min(numPages, currentPage + 1))}
            disabled={currentPage >= numPages}>
            <ChevronRight className="h-4 w-4" />
          </Button>

          {/* Page progress */}
          <div className="flex-1 mx-2 hidden sm:block">
            <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-indigo-500 rounded-full transition-all duration-300"
                style={{ width: `${pageProgress}%` }} />
            </div>
          </div>

          {/* Zoom */}
          <Button variant="ghost" size="icon" className="h-8 w-8"
            onClick={() => setScale(s => Math.max(0.5, +(s - 0.15).toFixed(2))}>
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="text-xs text-slate-500 w-10 text-center hidden sm:block">
            {Math.round(scale * 100)}%
          </span>
          <Button variant="ghost" size="icon" className="h-8 w-8"
            onClick={() => setScale(s => Math.min(2.5, +(s + 0.15).toFixed(2))}>
            <ZoomIn className="h-4 w-4" />
          </Button>

          {/* Mute toggle */}
          <Button variant="ghost" size="icon" className="h-8 w-8 ml-1"
            onClick={toggleAudio}
            title={audioEnabled ? "ปิดเสียง" : "เปิดเสียง"}>
            {audioEnabled
              ? <Volume2 className="h-4 w-4 text-indigo-600" />
              : <VolumeX className="h-4 w-4 text-slate-400" />}
          </Button>
        </div>

        {/* Audio player row — shows only when current page has audio */}
        {hasPageAudio && audioEnabled && (
          <div className="flex items-center gap-3 px-4 py-2 bg-indigo-50 border-b border-indigo-100">
            {/* Waveform */}
            <div className="flex items-center gap-1.5">
              {isPlaying
                ? <AudioBar />
                : <Volume2 className="h-4 w-4 text-indigo-400" />}
            </div>

            <span className="text-xs font-medium text-indigo-700 hidden sm:block">
              เสียงประกอบหน้า {currentPage}
            </span>

            {/* Controls */}
            <div className="flex items-center gap-1">
              <button onClick={restartAudio}
                className="p-1 rounded-lg hover:bg-indigo-100 text-indigo-500 transition-colors"
                title="เริ่มใหม่">
                <SkipBack className="h-3.5 w-3.5" />
              </button>
              <button onClick={togglePlayPause}
                className="p-1.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
                title={isPlaying ? "หยุด" : "เล่น"}>
                {isPlaying
                  ? <Pause className="h-3.5 w-3.5" />
                  : <Play className="h-3.5 w-3.5" />}
              </button>
            </div>

            {/* Progress bar */}
            <div className="flex-1 flex items-center gap-2">
              <div className="flex-1 h-1.5 bg-indigo-200 rounded-full overflow-hidden cursor-pointer"
                onClick={e => {
                  if (!audioRef.current || !audioDuration) return
                  const rect = e.currentTarget.getBoundingClientRect()
                  const ratio = (e.clientX - rect.left) / rect.width
                  audioRef.current.currentTime = ratio * audioDuration
                }}>
                <div className="h-full bg-indigo-600 rounded-full transition-all duration-100"
                  style={{ width: `${audioProgress}%` }} />
              </div>
              <span className="text-xs text-indigo-600 font-mono tabular-nums shrink-0">
                {fmt(audioTime)}{audioDuration > 0 ? ` / ${fmt(audioDuration)}` : ""}
              </span>
            </div>

            {/* Pin count */}
            {pinsOnPage.length > 0 && (
              <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-medium shrink-0">
                {pinsOnPage.length} pin
              </span>
            )}
          </div>
        )}
      </div>

      {/* ── PDF Pages ── */}
      <div ref={containerRef}
        className="overflow-y-auto bg-slate-100 p-5"
        style={{ maxHeight: "calc(100vh - 240px)" }}>
        <Document
          file={pdfUrl}
          onLoadSuccess={({ numPages: n }) => {
            setNumPages(n)
            pageRefs.current = new Array(n).fill(null)
            setPdfError(false)
          }}
          onLoadError={() => setPdfError(true)}
          loading={
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-slate-500">กำลังโหลด PDF...</p>
            </div>
          }
          error={
            <div className="text-center py-20 text-red-400">
              <p className="text-lg font-medium">ไม่สามารถโหลด PDF ได้</p>
              <p className="text-sm mt-1">กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ต</p>
            </div>
          }
        >
          {Array.from({ length: numPages }, (_, i) => i + 1).map(pageNum => {
            const hasAudio  = pages.some(p => p.page_number === pageNum)
            const pagePins  = pins.filter(p => p.page_number === pageNum)
            const isActive  = currentPage === pageNum

            return (
              <div
                key={pageNum}
                data-page={pageNum}
                ref={el => { pageRefs.current[pageNum - 1] = el }}
                className={`pdf-page-container relative mx-auto mb-5 transition-all duration-200 ${
                  isActive ? "ring-2 ring-indigo-400 ring-offset-2" : ""
                }`}
                style={{ width: "fit-content" }}
              >
                <Page
                  pageNumber={pageNum}
                  width={containerWidth * scale}
                  renderAnnotationLayer={false}
                  renderTextLayer={false}
                />

                {/* Page badge */}
                <div className={`absolute top-2 left-2 flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-semibold shadow-sm ${
                  isActive
                    ? "bg-indigo-600 text-white"
                    : "bg-black/40 text-white"
                }`}>
                  {isActive && isPlaying && <AudioBar />}
                  หน้า {pageNum}
                  {hasAudio && <Volume2 className="h-3 w-3" />}
                </div>

                {/* Pin count badge */}
                {pagePins.length > 0 && (
                  <div className="absolute top-2 right-2 bg-purple-600 text-white text-xs px-2 py-0.5 rounded-full font-semibold shadow-sm">
                    {pagePins.length} pin
                  </div>
                )}

                {/* Pin Markers */}
                {pagePins.map(pin => (
                  <PinMarker
                    key={pin.id}
                    pin={pin}
                    containerWidth={containerWidth * scale}
                  />
                ))}
              </div>
            )
          })}
        </Document>
      </div>

      {/* ── Page Thumbnail Strip (when 4+ pages) ── */}
      {numPages >= 4 && (
        <div className="flex gap-2 px-4 py-3 overflow-x-auto bg-slate-50 border-t border-slate-100">
          {Array.from({ length: numPages }, (_, i) => i + 1).map(n => {
            const hasAudio = pages.some(p => p.page_number === n)
            const hasPins  = pins.some(p => p.page_number === n)
            return (
              <button
                key={n}
                onClick={() => scrollToPage(n)}
                className={`shrink-0 w-10 h-12 rounded-lg border-2 flex flex-col items-center justify-center gap-0.5 text-xs font-bold transition-all ${
                  currentPage === n
                    ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                    : "border-slate-200 bg-white text-slate-500 hover:border-indigo-300"
                }`}
              >
                {n}
                <div className="flex gap-0.5">
                  {hasAudio && <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full" />}
                  {hasPins  && <span className="w-1.5 h-1.5 bg-purple-500 rounded-full" />}
                </div>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
