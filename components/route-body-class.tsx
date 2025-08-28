"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"

export default function RouteBodyClass({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()
    useEffect(() => {
        const cls = "route-login"
        const isLogin = pathname === "/login"
        if (isLogin) document.body.classList.add(cls)
        else document.body.classList.remove(cls)
        return () => document.body.classList.remove(cls)
    }, [pathname])
    return <>{children}</>
}
