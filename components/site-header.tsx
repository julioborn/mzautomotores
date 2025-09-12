"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useCallback, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { MessageCircle, Menu, LogOut, Shield, Home, ArrowLeft } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { DEALERSHIP_OWNER } from "@/lib/constants"

type NavItem = {
    href: string
    label: string
    icon?: React.ReactNode
    auth?: "public" | "private" | "any"
    exact?: boolean
}

const NAV_ITEMS: NavItem[] = [
    { href: "/", label: "Inicio", icon: <Home className="h-4 w-4" />, auth: "any", exact: true },
    { href: "/admin", label: "Administración", icon: <Shield className="h-4 w-4" />, auth: "private" },
]

export default function SiteHeader() {
    const pathname = usePathname()
    const router = useRouter()
    const { user, logout } = useAuth()
    const [open, setOpen] = useState(false)

    const isActive = useCallback(
        (item: NavItem) => {
            if (item.exact) return pathname === item.href
            return pathname.startsWith(item.href)
        },
        [pathname]
    )

    const visibleItems = useMemo(() => {
        return NAV_ITEMS.filter((i) => {
            if (i.auth === "private") return !!user
            return true
        })
    }, [user])

    const handleLogout = useCallback(async () => {
        try {
            await logout()
            router.push("/")
        } catch (e) {
            console.error(e)
        }
    }, [logout, router])

    const handleWhatsApp = useCallback(() => {
        const phone = DEALERSHIP_OWNER?.whatsapp ?? "3483529702"
        window.open(`https://wa.me/${phone}`, "_blank")
    }, [])

    return (
        <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="h-20 sm:h-24 flex items-center justify-between relative">
                    {/* Botón Back */}
                    <div className="absolute left-0 flex items-center">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => router.back()}
                            aria-label="Volver"
                            className="cursor-pointer"
                        >
                            <ArrowLeft className="h-8 w-8 text-black" />
                        </Button>
                    </div>

                    {/* Logo centrado */}
                    <div className="flex-1 flex justify-center">
                        <Link href="/" className="flex items-center gap-3">
                            <Image
                                src="/images/mzlogo.png"
                                alt="MZ Automotores"
                                width={290}
                                height={72}
                                className="h-16 sm:h-22 w-auto transition-all duration-300"
                                priority
                            />
                            <span className="sr-only">Ir a inicio</span>
                        </Link>
                    </div>

                    {/* Desktop nav */}
                    <nav className="hidden md:flex items-center gap-2 absolute right-0">
                        {visibleItems.map((item) => (
                            <Link key={item.href} href={item.href} prefetch={true}>
                                <Button
                                    className="bg-black text-white hover:bg-black cursor-pointer"
                                    size="sm"
                                >
                                    {item.icon && <span className="">{item.icon}</span>}
                                    {item.label}
                                </Button>
                            </Link>
                        ))}

                        {/* Solo aparece Cerrar Sesión si hay user */}
                        {user && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleLogout}
                                className="border-slate-300 bg-red-700 text-white hover:bg-red-800 hover:text-white cursor-pointer"
                            >
                                <LogOut className="h-4 w-4" />
                                Cerrar Sesión
                            </Button>
                        )}

                        <Button
                            onClick={handleWhatsApp}
                            size="sm"
                            className="bg-green-600 hover:bg-green-700 cursor-pointer"
                        >
                            <MessageCircle className="h-4 w-4" />
                            WhatsApp
                        </Button>
                    </nav>

                    {/* Mobile menu */}
                    <div className="md:hidden absolute right-0">
                        <Sheet open={open} onOpenChange={setOpen}>
                            <SheetTrigger asChild>
                                <Button variant="ghost" size="icon" aria-label="Abrir menú">
                                    <Menu className="h-6 w-6" />
                                </Button>
                            </SheetTrigger>

                            <SheetContent side="right" className="w-[88vw] max-w-sm p-0 overflow-hidden bg-gradient-to-b from-white to-slate-50 border-l border-slate-200 pb-[env(safe-area-inset-bottom)]">
                                <SheetHeader className="sr-only">
                                    <SheetTitle>Menú de navegación</SheetTitle>
                                </SheetHeader>

                                <div className="flex items-center gap-3 px-4 pt-4 pb-3 border-b border-slate-200/70 bg-white/80 backdrop-blur">
                                    <Image src="/images/mzlogo.png" alt="MZ Automotores" width={32} height={32} />
                                    <div className="font-semibold">MZ Automotores</div>
                                </div>

                                <nav className="px-4 py-4 space-y-2">
                                    {visibleItems.map((item) => (
                                        <Link key={item.href} href={item.href} prefetch onClick={() => setOpen(false)}>
                                            <div className="w-full flex items-center gap-3 px-4 py-3 rounded border border-slate-200 bg-white shadow-sm hover:shadow-md transition-all">
                                                {item.icon && <span>{item.icon}</span>}
                                                <span className="font-medium text-slate-900">{item.label}</span>
                                            </div>
                                        </Link>
                                    ))}

                                    {/* WhatsApp */}
                                    <button
                                        onClick={() => { handleWhatsApp(); setOpen(false); }}
                                        className="w-full flex items-center gap-3 px-4 py-3 rounded border border-emerald-200 bg-white shadow-sm hover:shadow-md transition-all"
                                    >
                                        <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600/10">
                                            <MessageCircle className="h-4 w-4 text-emerald-700" />
                                        </span>
                                        <span className="font-medium text-slate-900">WhatsApp</span>
                                    </button>

                                    {/* Cerrar Sesión solo si hay user */}
                                    {user && (
                                        <button
                                            onClick={() => { handleLogout(); setOpen(false); }}
                                            className="w-full flex items-center gap-3 px-4 py-3 rounded border border-red-200 bg-white shadow-sm hover:shadow-md transition-all"
                                        >
                                            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-red-600/10">
                                                <LogOut className="h-4 w-4 text-red-700" />
                                            </span>
                                            <span className="font-medium text-red-700">Cerrar Sesión</span>
                                        </button>
                                    )}
                                </nav>

                                <div className="mt-2 px-4 pb-4 text-xs text-slate-500">
                                    © {new Date().getFullYear()} MZ Automotores
                                </div>
                            </SheetContent>
                        </Sheet>
                    </div>
                </div>
            </div>
        </header>
    )
}
