// app/page.tsx
"use client"

import { VehicleExplorer } from "@/components/vehicle-explorer"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-100">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        <VehicleExplorer />
      </main>
    </div>
  )
}
