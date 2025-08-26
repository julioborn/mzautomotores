"use client"

import { Car } from "lucide-react"
import clsx from "clsx"

type LoaderProps = {
    text?: string
    /** Ocupa toda la pantalla */
    fullPage?: boolean
    /** Tamaño del ícono */
    size?: "sm" | "md" | "lg"
    /** Texto más tenue */
    muted?: boolean
    /** Altura mínima del contenedor (por defecto 40vh si no es fullPage) */
    minH?: string
}

const sizeMap: Record<NonNullable<LoaderProps["size"]>, string> = {
    sm: "h-6 w-6",
    md: "h-10 w-10",
    lg: "h-12 w-12",
}

export function Loader({
    text = "Cargando…",
    fullPage,
    size = "lg",
    muted,
    minH,
}: LoaderProps) {
    return (
        <div
            className={clsx(
                "w-full flex items-center justify-center",
                fullPage ? "min-h-screen" : (minH ?? "min-h-[40vh]"),
            )}
            role="status"
            aria-live="polite"
            aria-busy="true"
        >
            <div className="text-center">
                <Car className={clsx(sizeMap[size], "mx-auto mb-4 text-red-800 animate-spin")} />
                <p className={clsx("text-sm", muted ? "text-black" : "text-black")}>
                    {text}
                </p>
            </div>
        </div>
    )
}
export default Loader
