"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useCallback, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"
import { MessageCircle, Menu, LogOut, User, Shield, Home, Phone } from "lucide-react"
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
    // { href: "/contact", label: "Contacto", icon: <Phone className="h-4 w-4" />, auth: "any" },
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
            if (i.auth === "public") return !user
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

    function MobileNavItem({
        href,
        icon,
        active,
        onSelect,
        children,
    }: {
        href: string
        icon?: React.ReactNode
        active?: boolean
        onSelect?: () => void
        children: React.ReactNode
    }) {
        return (
            <Link href={href} prefetch onClick={onSelect} aria-current={active ? "page" : undefined}>
                <div
                    className={[
                        "relative w-full flex items-center gap-3 px-4 py-3 rounded transition-all shadow-sm mb-2", // 👈 AQUI EL CAMBIO
                        active
                            ? "bg-black text-white hover:bg-black"
                            : "bg-white text-slate-900 border border-slate-200 hover:border-slate-300 hover:shadow-md",
                    ].join(" ")}
                >
                    <span
                        className={[
                            "inline-flex h-8 w-8 items-center justify-center rounded-lg transition-colors",
                            active ? "bg-black/20" : "bg-slate-900/5",
                        ].join(" ")}
                    >
                        <span className={active ? "text-white" : "text-slate-700"}>
                            {icon}
                        </span>
                    </span>
                    <span className={`font-medium ${active ? "text-white" : "text-slate-900"}`}>
                        {children}
                    </span>
                </div>
            </Link>
        )
    }

    return (
        <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="h-20 sm:h-24 flex items-center justify-between">
                    {/* Brand */}
                    <Link href="/" className="flex items-center gap-3">
                        <Image
                            src="/images/mzlogo.png"
                            alt="MZ Automotores"
                            width={290}  // aumentamos el ancho base
                            height={72} // aumentamos el alto base
                            className="h-16 sm:h-22 w-auto transition-all duration-300"
                            priority
                        />
                        <span className="sr-only">Ir a inicio</span>
                    </Link>

                    {/* Desktop nav */}
                    <nav className="hidden md:flex items-center gap-2">
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

                        {user ? (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleLogout}
                                className="border-slate-300 bg-red-700 text-white hover:bg-red-800 hover:text-white cursor-pointer"
                            >
                                <LogOut className="h-4 w-4" />
                                Cerrar Sesión
                            </Button>
                        ) : (
                            <Link href="/login" prefetch={true}>
                                <Button size="sm" className="bg-black text-white hover:bg-black cursor-pointer">
                                    <User className="h-4 w-4" />
                                    Iniciar Sesión
                                </Button>
                            </Link>
                        )}

                        <Button onClick={handleWhatsApp} size="sm" className="bg-green-600 hover:bg-green-700 cursor-pointer">
                            <MessageCircle className="h-4 w-4" />
                            WhatsApp
                        </Button>
                    </nav>

                    {/* Mobile menu */}
                    <div className="md:hidden">
                        <Sheet open={open} onOpenChange={setOpen}>
                            <SheetTrigger asChild>
                                <Button variant="ghost" size="icon" aria-label="Abrir menú">
                                    <Menu className="h-6 w-6" />
                                </Button>
                            </SheetTrigger>

                            <SheetContent
                                side="right"
                                className="
    w-[88vw] max-w-sm p-0 overflow-hidden
    bg-gradient-to-b from-white to-slate-50
    border-l border-slate-200
    pb-[env(safe-area-inset-bottom)]
    "
                            >
                                {/* ✅ Header con Title accesible */}
                                <SheetHeader className="sr-only">
                                    <SheetTitle>Menú de navegación</SheetTitle>
                                </SheetHeader>

                                {/* Header del sheet */}
                                <div className="flex items-center gap-3 px-4 pt-4 pb-3 border-b border-slate-200/70 bg-white/80 backdrop-blur">
                                    <Image src="/images/mzlogo.png" alt="MZ Automotores" width={32} height={32} />
                                    <div className="font-semibold">MZ Automotores</div>
                                </div>

                                {/* Navegación */}
                                <nav className="px-4 py-4 space-y-2">
                                    {visibleItems.map((item) => (
                                        <MobileNavItem
                                            key={item.href}
                                            href={item.href}
                                            icon={item.icon}
                                            active={isActive(item)}
                                            onSelect={() => setOpen(false)}
                                        >
                                            {item.label}
                                        </MobileNavItem>
                                    ))}

                                    {/* CTA WhatsApp */}
                                    <button
                                        onClick={() => { handleWhatsApp(); setOpen(false); }}
                                        className="
            w-full flex items-center gap-3 px-4 py-3
            rounded border border-emerald-200 bg-white
            shadow-sm hover:shadow-md
            outline-none ring-0 hover:border-emerald-300
            transition-all
            "
                                    >
                                        <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600/10">
                                            <MessageCircle className="h-4 w-4 text-emerald-700" />
                                        </span>
                                        <span className="font-medium text-slate-900">WhatsApp</span>
                                    </button>

                                    {/* Login / Logout */}
                                    {user ? (
                                        <button
                                            onClick={() => { handleLogout(); setOpen(false); }}
                                            className="
            w-full flex items-center gap-3 px-4 py-3
            rounded border border-red-200 bg-white
            shadow-sm hover:shadow-md
            outline-none ring-0 hover:border-red-300
            transition-all
            "
                                        >
                                            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-red-600/10">
                                                <LogOut className="h-4 w-4 text-red-700" />
                                            </span>
                                            <span className="font-medium text-red-700">Cerrar Sesión</span>
                                        </button>
                                    ) : (
                                        <Link href="/login" prefetch onClick={() => setOpen(false)}>
                                            <div
                                                className="
                w-full flex items-center gap-3 px-4 py-3
                rounded border border-slate-200 bg-white
                shadow-sm hover:shadow-md
                outline-none ring-0 hover:border-slate-300
                transition-all
              "
                                            >
                                                <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900/10">
                                                    <User className="h-4 w-4 text-slate-900" />
                                                </span>
                                                <span className="font-medium text-slate-900">Iniciar Sesión</span>
                                            </div>
                                        </Link>
                                    )}
                                </nav>

                                {/* Footer mini */}
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
