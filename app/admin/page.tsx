// app/admin/page.tsx
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { verifyToken } from "@/lib/jwt"
import { AdminExplorer } from "@/components/admin-explorer"
import { getBaseUrl } from "@/lib/base-url"

export default async function AdminPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get("token")?.value

  try {
    if (!token || !verifyToken(token)) redirect("/login")
  } catch {
    redirect("/login")
  }

  const baseUrl = getBaseUrl()
  const cookieHeader = cookieStore
    .getAll()
    .map(c => `${c.name}=${c.value}`)
    .join("; ");

  const res = await fetch(new URL("/api/vehicles", baseUrl).toString(), {
    cache: "no-store",
    headers: { cookie: cookieHeader },
  })

  if (!res.ok) {
    return <AdminExplorer initialVehicles={[]} initialError="Error al cargar los vehículos" />
  }

  const initialVehicles = await res.json()
  return <AdminExplorer initialVehicles={initialVehicles} />
}
