"use client"

import Link from "next/link"
import Image from "next/image"
import { CheckCircle, Eye, Volume2, BookOpen, GraduationCap } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import type { Portfolio } from "@/types"

interface PortfolioCardProps {
  portfolio: Portfolio
}

export function PortfolioCard({ portfolio }: PortfolioCardProps) {
  return (
    <Link href={`/portfolio/${portfolio.id}`}>
      <div className="portfolio-card bg-white rounded-xl border border-slate-200 overflow-hidden group cursor-pointer">
        {/* Cover Image */}
        <div className="relative h-48 bg-gradient-to-br from-indigo-100 to-purple-100 overflow-hidden">
          {portfolio.cover_image_url ? (
            <Image
              src={portfolio.cover_image_url}
              alt={portfolio.title}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <BookOpen className="h-12 w-12 text-indigo-300" />
            </div>
          )}

          {/* Badges overlay */}
          <div className="absolute top-2 left-2 flex gap-1 flex-wrap">
            {portfolio.is_admitted && (
              <div className="flex items-center gap-1 bg-emerald-500 text-white text-xs px-2 py-0.5 rounded-full font-medium">
                <CheckCircle className="h-3 w-3" />
                ติดรอบพอร์ต
              </div>
            )}
            {portfolio.pages && portfolio.pages.length > 0 && (
              <div className="flex items-center gap-1 bg-indigo-600 text-white text-xs px-2 py-0.5 rounded-full">
                <Volume2 className="h-3 w-3" />
                มีเสียง
              </div>
            )}
          </div>

          {/* View count */}
          <div className="absolute bottom-2 right-2 flex items-center gap-1 bg-black/50 text-white text-xs px-2 py-0.5 rounded-full">
            <Eye className="h-3 w-3" />
            {portfolio.view_count.toLocaleString()}
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="font-semibold text-slate-900 line-clamp-1 mb-1">{portfolio.title}</h3>
          <p className="text-sm text-slate-500 mb-2">{portfolio.owner_name}</p>

          <div className="flex items-center gap-1 mb-3">
            <GraduationCap className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
            <span className="text-xs text-slate-600 line-clamp-1">{portfolio.faculty}</span>
          </div>

          <div className="text-xs text-slate-400 mb-3">{portfolio.university}</div>

          {/* Tags */}
          {portfolio.tags && portfolio.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {portfolio.tags.slice(0, 3).map(tag => (
                <Badge key={tag} variant="secondary" className="text-xs px-2 py-0">
                  {tag}
                </Badge>
              ))}
              {portfolio.tags.length > 3 && (
                <Badge variant="outline" className="text-xs px-2 py-0">
                  +{portfolio.tags.length - 3}
                </Badge>
              )}
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}
