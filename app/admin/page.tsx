// app/admin/page.tsx
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { verifyToken } from "@/lib/jwt"
import { AdminExplorer } from "@/components/admin-explorer"
import { connectToDatabase } from "@/lib/mongodb"
import Vehicle from "@/models/Vehicle"

export default async function AdminPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get("token")?.value
  try {
    if (!token || !verifyToken(token)) redirect("/login")
  } catch {
    redirect("/login")
  }

  await connectToDatabase()

  // ⚡ Trae SOLO lo necesario para la grilla inicial
  const projection = [
    "brand", "model", "year", "price", "currency",
    "mileage", "fuelType", "transmission",
    "motor", "color",                 // 👈 traer motor
    "contactName", "contactPhone", "contactEmail", // 👈 traer contacto
    "images", "isPublic", "createdAt"
  ].join(" ")

  // ⚠️ Paginemos en SSR (p. ej. 24 ítems)
  const PAGE_SIZE = 24
  const docs = await Vehicle.find({}, projection)
    .sort({ createdAt: -1 })
    .limit(PAGE_SIZE)
    .lean()

  // id plano y primera imagen para reducir payload
  const initialVehicles = docs.map((v: any) => ({
    ...v,
    id: String(v._id),
    _id: undefined,
    images: Array.isArray(v.images) ? [v.images[0]].filter(Boolean) : [],
  }))

  return <AdminExplorer initialVehicles={initialVehicles} />
}
