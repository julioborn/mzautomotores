// app/admin/layout.tsx
import type React from "react"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  // La protección ahora es SSR en app/admin/page.tsx → no duplicamos guardas en cliente
  return children
}
