"use client"

import { useState, useRef } from "react"
import { MapPin, Volume2, StickyNote, ExternalLink, X } from "lucide-react"
import type { PortfolioPin } from "@/types"

interface PinMarkerProps {
  pin: PortfolioPin
  containerWidth: number
}

export function PinMarker({ pin, containerWidth }: PinMarkerProps) {
  const [open, setOpen] = useState(false)
  const [playing, setPlaying] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const left = (pin.x_position / 100) * containerWidth
  const top = `${pin.y_position}%`

  const toggleAudio = () => {
    if (!pin.audio_url) return
    if (playing) {
      audioRef.current?.pause()
      setPlaying(false)
    } else {
      if (!audioRef.current) {
        audioRef.current = new Audio(pin.audio_url)
        audioRef.current.onended = () => setPlaying(false)
      }
      audioRef.current.play()
      setPlaying(true)
    }
  }

  const pinColor =
    pin.pin_type === "audio" ? "bg-indigo-600" :
    pin.pin_type === "note" ? "bg-amber-500" :
    "bg-purple-600"

  return (
    <div
      className="absolute z-10"
      style={{ left, top, transform: "translate(-50%, -50%)" }}
    >
      {/* Pin Button */}
      <button
        onClick={() => setOpen(!open)}
        className={`pin-marker w-8 h-8 rounded-full ${pinColor} text-white flex items-center justify-center shadow-lg hover:scale-110 transition-transform relative`}
        title="คลิกเพื่อดูข้อมูล"
      >
        {pin.pin_type === "audio" ? (
          <Volume2 className="h-4 w-4" />
        ) : pin.pin_type === "note" ? (
          <StickyNote className="h-4 w-4" />
        ) : (
          <MapPin className="h-4 w-4" />
        )}
        {/* Ripple effect */}
        <span className={`absolute inset-0 rounded-full ${pinColor} opacity-30 animate-ping`} />
      </button>

      {/* Popup */}
      {open && (
        <div className="absolute z-20 bg-white rounded-xl shadow-xl border border-slate-200 p-4 w-72"
          style={{
            bottom: "120%",
            left: "50%",
            transform: "translateX(-50%)",
          }}
        >
          {/* Close */}
          <button
            onClick={() => setOpen(false)}
            className="absolute top-2 right-2 text-slate-400 hover:text-slate-600"
          >
            <X className="h-4 w-4" />
          </button>

          {/* Audio Section */}
          {pin.audio_url && (
            <div className="mb-3">
              <button
                onClick={toggleAudio}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors w-full ${
                  playing
                    ? "bg-indigo-100 text-indigo-700"
                    : "bg-indigo-600 text-white hover:bg-indigo-700"
                }`}
              >
                <Volume2 className="h-4 w-4" />
                {playing ? "หยุดเสียง" : "เล่นเสียงอธิบาย"}
              </button>
            </div>
          )}

          {/* Note Text */}
          {pin.note_text && (
            <div className="mb-3">
              <p className="text-sm text-slate-700 leading-relaxed">{pin.note_text}</p>
            </div>
          )}

          {/* Note Link */}
          {pin.note_link && (
            <a
              href={pin.note_link}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-sm text-indigo-600 hover:underline"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              ดูข้อมูลเพิ่มเติม
            </a>
          )}

          {/* Arrow */}
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-r border-b border-slate-200 rotate-45" />
        </div>
      )}
    </div>
  )
}
