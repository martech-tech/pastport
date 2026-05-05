"use client"

import { useState, useRef, useEffect } from "react"
import { Volume2, StickyNote, MapPin, ExternalLink, X, Play, Pause } from "lucide-react"
import { AudioBar } from "./audio-bar"
import type { PortfolioPin } from "@/types"

interface PinMarkerProps {
  pin: PortfolioPin
  containerWidth: number
}

export function PinMarker({ pin, containerWidth }: PinMarkerProps) {
  const [open, setOpen]       = useState(false)
  const [playing, setPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const popupRef = useRef<HTMLDivElement>(null)

  // Position
  const leftPx = (pin.x_position / 100) * containerWidth
  const topPct  = `${pin.y_position}%`

  // Close on outside click
  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [open])

  // Stop audio when closed
  useEffect(() => {
    if (!open && audioRef.current) {
      audioRef.current.pause()
      setPlaying(false)
    }
  }, [open])

  const toggleAudio = () => {
    if (!pin.audio_url) return
    if (!audioRef.current) {
      const a = new Audio(pin.audio_url)
      audioRef.current = a
      a.addEventListener("loadedmetadata", () => setDuration(a.duration))
      a.addEventListener("timeupdate",     () => setProgress(a.currentTime / (a.duration || 1) * 100))
      a.addEventListener("ended",          () => { setPlaying(false); setProgress(0) })
    }
    if (playing) {
      audioRef.current.pause()
      setPlaying(false)
    } else {
      audioRef.current.play()
      setPlaying(true)
    }
  }

  const pinStyle = {
    audio: { bg: "bg-indigo-600 hover:bg-indigo-700", ring: "ring-indigo-300" },
    note:  { bg: "bg-amber-500  hover:bg-amber-600",  ring: "ring-amber-200"  },
    both:  { bg: "bg-purple-600 hover:bg-purple-700", ring: "ring-purple-300" },
  }[pin.pin_type]

  const PinIcon =
    pin.pin_type === "audio" ? Volume2 :
    pin.pin_type === "note"  ? StickyNote : MapPin

  const fmt = (s: number) =>
    `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`

  return (
    <div
      className="absolute z-10"
      style={{ left: leftPx, top: topPct, transform: "translate(-50%, -50%)" }}
    >
      {/* Pin Button */}
      <button
        onClick={() => setOpen(!open)}
        className={`pin-marker relative w-9 h-9 rounded-full ${pinStyle.bg} text-white flex items-center justify-center shadow-lg transition-transform hover:scale-110 ring-4 ${pinStyle.ring}`}
      >
        <PinIcon className="h-4 w-4" />
        {/* Ripple */}
        <span className={`absolute inset-0 rounded-full ${pinStyle.bg} opacity-40 animate-ping`} />
      </button>

      {/* Popup */}
      {open && (
        <div
          ref={popupRef}
          className="absolute z-30 bg-white rounded-2xl shadow-2xl border border-slate-200 w-72 overflow-hidden"
          style={{
            bottom: "120%",
            left: "50%",
            transform: "translateX(-50%)",
          }}
        >
          {/* Header */}
          <div className={`flex items-center gap-2 px-4 py-3 ${
            pin.pin_type === "audio" ? "bg-indigo-600" :
            pin.pin_type === "note"  ? "bg-amber-500"  : "bg-purple-600"
          } text-white`}>
            <PinIcon className="h-4 w-4 shrink-0" />
            <span className="text-sm font-semibold flex-1">
              {pin.pin_type === "audio" ? "เสียงอธิบาย" :
               pin.pin_type === "note"  ? "บันทึก" : "เสียง + บันทึก"}
            </span>
            <button onClick={() => setOpen(false)} className="hover:opacity-70 transition-opacity">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="p-4 space-y-3">
            {/* Audio Player */}
            {pin.audio_url && (
              <div className="bg-slate-50 rounded-xl p-3 space-y-2">
                <div className="flex items-center gap-2">
                  {playing
                    ? <AudioBar />
                    : <Volume2 className="h-4 w-4 text-slate-400" />}
                  <span className="text-xs text-slate-500 flex-1">
                    {playing ? "กำลังเล่นเสียงอธิบาย..." : "เสียงอธิบาย"}
                  </span>
                  <button
                    onClick={toggleAudio}
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                      playing
                        ? "bg-red-100 text-red-600 hover:bg-red-200"
                        : "bg-indigo-600 text-white hover:bg-indigo-700"
                    }`}
                  >
                    {playing ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                  </button>
                </div>

                {/* Progress */}
                <div
                  className="h-1.5 bg-slate-200 rounded-full overflow-hidden cursor-pointer"
                  onClick={e => {
                    if (!audioRef.current || !duration) return
                    const rect = e.currentTarget.getBoundingClientRect()
                    audioRef.current.currentTime = ((e.clientX - rect.left) / rect.width) * duration
                  }}
                >
                  <div
                    className="h-full bg-indigo-500 rounded-full transition-all duration-100"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                {duration > 0 && (
                  <p className="text-xs text-slate-400 text-right font-mono">
                    {fmt(duration * progress / 100)} / {fmt(duration)}
                  </p>
                )}
              </div>
            )}

            {/* Note Text */}
            {pin.note_text && (
              <div className="bg-amber-50 border border-amber-100 rounded-xl p-3">
                <p className="text-sm text-slate-700 leading-relaxed">{pin.note_text}</p>
              </div>
            )}

            {/* Link */}
            {pin.note_link && (
              <a
                href={pin.note_link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-800 bg-indigo-50 rounded-xl px-3 py-2 transition-colors"
              >
                <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">ดูข้อมูลเพิ่มเติม</span>
              </a>
            )}
          </div>

          {/* Arrow */}
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-r border-b border-slate-200 rotate-45" />
        </div>
      )}
    </div>
  )
}
