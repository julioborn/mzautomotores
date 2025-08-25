// app/page.tsx
"use client"

import { VehicleExplorer } from "@/components/vehicle-explorer"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50/30 via-slate-50 to-slate-100">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        <VehicleExplorer />
      </main>
    </div>
  )
}
