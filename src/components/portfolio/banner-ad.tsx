"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { ExternalLink, X } from "lucide-react"
import type { BannerAd as BannerAdType } from "@/types"
import { createClient } from "@/lib/supabase/client"

interface BannerAdProps {
  ads: BannerAdType[]
  compact?: boolean
}

export function BannerAd({ ads, compact = false }: BannerAdProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [dismissed, setDismissed] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    if (ads.length <= 1) return
    const interval = setInterval(() => {
      setCurrentIndex(i => (i + 1) % ads.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [ads.length])

  useEffect(() => {
    if (ads[currentIndex]) {
      supabase.from("banner_ads").update({ view_count: ads[currentIndex].view_count + 1 }).eq("id", ads[currentIndex].id)
    }
  }, [currentIndex])

  if (dismissed || ads.length === 0) return null

  const ad = ads[currentIndex]

  const handleClick = async () => {
    await supabase.from("banner_ads").update({ click_count: ad.click_count + 1 }).eq("id", ad.id)
    if (ad.link_url) window.open(ad.link_url, "_blank")
  }

  if (compact) {
    return (
      <div
        className="relative rounded-xl overflow-hidden cursor-pointer border border-slate-200 h-24 flex items-center justify-center bg-gradient-to-r from-indigo-50 to-purple-50 hover:from-indigo-100 hover:to-purple-100 transition-colors"
        onClick={handleClick}
      >
        {ad.image_url ? (
          <Image src={ad.image_url} alt={ad.title} fill className="object-cover" />
        ) : (
          <div className="flex items-center gap-2 text-indigo-600">
            <ExternalLink className="h-4 w-4" />
            <span className="font-medium">{ad.title}</span>
          </div>
        )}
        <span className="absolute top-1 right-1 text-xs bg-black/30 text-white px-1.5 py-0.5 rounded">โฆษณา</span>
      </div>
    )
  }

  return (
    <div className="relative rounded-2xl overflow-hidden shadow-sm border border-slate-200 bg-gradient-to-r from-indigo-600 to-purple-600 cursor-pointer" onClick={handleClick}>
      <div className="relative h-32 sm:h-44">
        {ad.image_url ? (
          <Image src={ad.image_url} alt={ad.title} fill className="object-cover" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-white">
              <h3 className="text-xl font-bold">{ad.title}</h3>
              {ad.link_url && (
                <div className="flex items-center justify-center gap-1 mt-2 text-sm opacity-80">
                  <ExternalLink className="h-3 w-3" />
                  ดูเพิ่มเติม
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Indicators */}
      {ads.length > 1 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
          {ads.map((_, i) => (
            <button
              key={i}
              onClick={(e) => { e.stopPropagation(); setCurrentIndex(i) }}
              className={`w-2 h-2 rounded-full transition-all ${i === currentIndex ? "bg-white w-4" : "bg-white/50"}`}
            />
          ))}
        </div>
      )}

      {/* Ad Label & Close */}
      <div className="absolute top-2 right-2 flex items-center gap-2">
        <span className="text-xs bg-black/40 text-white px-2 py-0.5 rounded-full">โฆษณา</span>
        <button
          onClick={(e) => { e.stopPropagation(); setDismissed(true) }}
          className="w-6 h-6 bg-black/40 text-white rounded-full flex items-center justify-center hover:bg-black/60"
        >
          <X className="h-3 w-3" />
        </button>
      </div>
    </div>
  )
}
