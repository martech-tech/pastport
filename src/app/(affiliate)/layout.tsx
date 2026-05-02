import { AffiliateSidebar } from "@/components/layout/affiliate-sidebar"

export default function AffiliateLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 flex">
      <AffiliateSidebar />
      <main className="flex-1 pl-64 min-h-screen">
        <div className="p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  )
}
