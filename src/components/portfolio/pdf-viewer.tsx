"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Document, Page, pdfjs } from "react-pdf"
import "react-pdf/dist/Page/AnnotationLayer.css"
import "react-pdf/dist/Page/TextLayer.css"
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Volume2, VolumeX, Maximize2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { PinMarker } from "./pin-marker"
import { AudioBar } from "./audio-bar"
import type { PortfolioPage, PortfolioPin } from "@/types"

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`

interface PDFViewerProps {
  pdfUrl: string
  pages: PortfolioPage[]
  pins: PortfolioPin[]
  portfolioId: string
}

export function PDFViewer({ pdfUrl, pages, pins, portfolioId }: PDFViewerProps) {
  const [numPages, setNumPages] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [scale, setScale] = useState(1.0)
  const [audioEnabled, setAudioEnabled] = useState(true)
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [containerWidth, setContainerWidth] = useState(800)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const pageRefs = useRef<(HTMLDivElement | null)[]>([])
  const observerRef = useRef<IntersectionObserver | null>(null)

  // Measure container width for responsive PDF
  useEffect(() => {
    const measure = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.clientWidth - 32)
      }
    }
    measure()
    window.addEventListener("resize", measure)
    return () => window.removeEventListener("resize", measure)
  }, [])

  // Setup IntersectionObserver to detect which page is visible
  useEffect(() => {
    if (observerRef.current) observerRef.current.disconnect()

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter(e => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)
        if (visible.length > 0) {
          const pageNum = parseInt(visible[0].target.getAttribute("data-page") || "1")
          setCurrentPage(pageNum)
        }
      },
      { threshold: 0.5 }
    )

    pageRefs.current.forEach(ref => {
      if (ref) observerRef.current?.observe(ref)
    })

    return () => observerRef.current?.disconnect()
  }, [numPages])

  // Play audio when page changes
  useEffect(() => {
    const pageAudio = pages.find(p => p.page_number === currentPage)

    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current = null
      setIsPlaying(false)
    }

    if (pageAudio?.audio_url && audioEnabled) {
      const audio = new Audio(pageAudio.audio_url)
      audioRef.current = audio

      audio.addEventListener("play", () => setIsPlaying(true))
      audio.addEventListener("pause", () => setIsPlaying(false))
      audio.addEventListener("ended", () => { setIsPlaying(false); setProgress(0) })
      audio.addEventListener("timeupdate", () => {
        if (audio.duration) setProgress((audio.currentTime / audio.duration) * 100)
      })

      setTimeout(() => audio.play().catch(() => {}), 500)
    }

    // Update read progress
    setProgress(0)

    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
    }
  }, [currentPage, audioEnabled, pages])

  const scrollToPage = useCallback((page: number) => {
    pageRefs.current[page - 1]?.scrollIntoView({ behavior: "smooth", block: "start" })
  }, [])

  const toggleAudio = () => {
    setAudioEnabled(prev => {
      if (prev && audioRef.current) {
        audioRef.current.pause()
      }
      return !prev
    })
  }

  const pinsOnCurrentPage = pins.filter(p => p.page_number === currentPage)
  const currentPageAudio = pages.find(p => p.page_number === currentPage)

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50 sticky top-0 z-20">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => scrollToPage(Math.max(1, currentPage - 1))}
            disabled={currentPage <= 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <span className="text-sm font-medium text-slate-700 min-w-[80px] text-center">
            {currentPage} / {numPages}
          </span>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => scrollToPage(Math.min(numPages, currentPage + 1))}
            disabled={currentPage >= numPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Progress bar */}
        <div className="flex-1 mx-4 hidden sm:block">
          <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-600 transition-all duration-300"
              style={{ width: `${(currentPage / numPages) * 100}%` }}
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Audio status */}
          {currentPageAudio && (
            <div className="flex items-center gap-2 mr-2">
              {isPlaying && <AudioBar />}
              <span className="text-xs text-slate-500 hidden sm:block">
                {isPlaying ? "กำลังเล่นเสียง" : "มีเสียงในหน้านี้"}
              </span>
            </div>
          )}

          <Button
            variant="ghost"
            size="icon"
            onClick={toggleAudio}
            title={audioEnabled ? "ปิดเสียง" : "เปิดเสียง"}
          >
            {audioEnabled ? (
              <Volume2 className="h-4 w-4 text-indigo-600" />
            ) : (
              <VolumeX className="h-4 w-4 text-slate-400" />
            )}
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setScale(s => Math.min(2, s + 0.1))}>
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setScale(s => Math.max(0.5, s - 0.1))}>
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="text-xs text-slate-500 hidden sm:block">{Math.round(scale * 100)}%</span>
        </div>
      </div>

      {/* PDF Content */}
      <div ref={containerRef} className="overflow-y-auto max-h-[calc(100vh-200px)] bg-slate-100 p-4">
        <Document
          file={pdfUrl}
          onLoadSuccess={({ numPages }) => {
            setNumPages(numPages)
            pageRefs.current = new Array(numPages).fill(null)
          }}
          loading={
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-sm text-slate-500">กำลังโหลด PDF...</p>
              </div>
            </div>
          }
          error={
            <div className="text-center py-20 text-red-500">
              <p>ไม่สามารถโหลด PDF ได้</p>
            </div>
          }
        >
          {Array.from({ length: numPages }, (_, i) => i + 1).map(pageNum => (
            <div
              key={pageNum}
              data-page={pageNum}
              ref={el => { pageRefs.current[pageNum - 1] = el }}
              className="pdf-page-container relative mb-4 mx-auto"
              style={{ width: "fit-content" }}
            >
              <Page
                pageNumber={pageNum}
                width={containerWidth * scale}
                renderAnnotationLayer={false}
                renderTextLayer={false}
              />

              {/* Pin Markers */}
              {pins
                .filter(p => p.page_number === pageNum)
                .map(pin => (
                  <PinMarker
                    key={pin.id}
                    pin={pin}
                    containerWidth={containerWidth * scale}
                  />
                ))}

              {/* Current Page Indicator */}
              {currentPage === pageNum && (
                <div className="absolute top-2 left-2 bg-indigo-600 text-white text-xs px-2 py-0.5 rounded-full">
                  หน้า {pageNum}
                </div>
              )}
            </div>
          ))}
        </Document>
      </div>

      {/* Audio Progress */}
      {currentPageAudio && isPlaying && (
        <div className="px-4 py-2 border-t border-slate-100 bg-indigo-50">
          <div className="flex items-center gap-2">
            <AudioBar />
            <div className="flex-1">
              <Progress value={progress} />
            </div>
            <span className="text-xs text-indigo-600">กำลังเล่นเสียง</span>
          </div>
        </div>
      )}
    </div>
  )
}
