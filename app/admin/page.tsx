// app/admin/page.tsx
import { cookies, headers } from "next/headers"
import { redirect } from "next/navigation"
import { verifyToken } from "@/lib/jwt"
import { AdminExplorer } from "@/components/admin-explorer"

async function getRequestBaseUrl() {
  const h = await headers(); // 👈 ahora sí
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? (process.env.NODE_ENV === "production" ? "https" : "http");
  if (!host) return "http://localhost:3000";
  return `${proto}://${host}`;
}

export default async function AdminPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  try {
    if (!token || !verifyToken(token)) redirect("/login");
  } catch {
    redirect("/login");
  }

  // 👇 usar await acá también
  const baseUrl = await getRequestBaseUrl();

  const cookieHeader = cookieStore
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");

  try {
    const url = new URL("/api/vehicles", baseUrl).toString();
    const res = await fetch(url, {
      cache: "no-store",
      headers: { cookie: cookieHeader, "x-internal-ssr": "1" },
    });

    if (!res.ok) {
      return <AdminExplorer initialVehicles={[]} initialError={`Error al cargar los vehículos (HTTP ${res.status})`} />;
    }

    const initialVehicles = await res.json();
    return <AdminExplorer initialVehicles={initialVehicles} />;
  } catch (err) {
    console.error("[/admin] fetch /api/vehicles error:", err);
    return <AdminExplorer initialVehicles={[]} initialError="Error al cargar los vehículos (fetch falló)" />;
  }
}
