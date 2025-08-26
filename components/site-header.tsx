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
                            <SheetContent side="right" className="w-80">
                                <SheetHeader>
                                    <SheetTitle className="flex items-center gap-3">
                                        <Image src="/images/mzlogo.png" alt="MZ Automotores" width={36} height={36} />
                                        MZ Automotores
                                    </SheetTitle>
                                </SheetHeader>

                                <div className="mt-6 flex flex-col gap-2">
                                    {visibleItems.map((item) => (
                                        <Link key={item.href} href={item.href} onClick={() => setOpen(false)} prefetch={true}>
                                            <Button
                                                variant={isActive(item) ? "default" : "ghost"}
                                                className="w-full justify-start"
                                            >
                                                {item.icon && <span className="mr-2">{item.icon}</span>}
                                                {item.label}
                                            </Button>
                                        </Link>
                                    ))}

                                    <Separator className="my-2" />

                                    <Button onClick={handleWhatsApp} className="w-full justify-start bg-green-600 hover:bg-green-700">
                                        <MessageCircle className="h-4 w-4 mr-2" />
                                        WhatsApp
                                    </Button>
                                    {user ? (
                                        <Button
                                            variant="outline"
                                            size="lg"
                                            onClick={handleLogout}
                                            className="justify-start border-slate-300 bg-red-700 text-white hover:bg-red-800 hover:text-white"
                                        >
                                            <LogOut className="h-4 w-4" />
                                            Cerrar Sesión
                                        </Button>
                                    ) : (
                                        <Link href="/login" onClick={() => setOpen(false)} prefetch={true}>
                                            <Button className="w-full justify-start bg-black hover:bg-black text-white">
                                                <User className="h-4 w-4 mr-2" />
                                                Iniciar Sesión
                                            </Button>
                                        </Link>
                                    )}

                                </div>
                            </SheetContent>
                        </Sheet>
                    </div>
                </div>
            </div>
        </header>
    )
}
