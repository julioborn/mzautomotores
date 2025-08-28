"use client"

import { useMemo, useState, useCallback } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight, Gauge, Fuel, Settings, Zap, Calendar, Palette, MessageCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { Vehicle } from "@/types/vehicle"
import { DEALERSHIP_OWNER } from "@/lib/constants"

export default function VehicleClient({ vehicle }: { vehicle: Vehicle }) {
    const [currentImageIndex, setCurrentImageIndex] = useState(0)

    const images = useMemo(() => {
        const arr = Array.isArray(vehicle.images) ? vehicle.images.filter(Boolean) : []
        if (arr.length) return arr
        return [`/placeholder.svg?height=400&width=600&query=${vehicle.brand} ${vehicle.model}`]
    }, [vehicle])

    const goToPrevious = useCallback(() => {
        setCurrentImageIndex((p) => (p - 1 + images.length) % images.length)
    }, [images.length])

    const goToNext = useCallback(() => {
        setCurrentImageIndex((p) => (p + 1) % images.length)
    }, [images.length])

    const handleWhatsAppContact = useCallback(() => {
        const priceText = vehicle.showPrice ? ` por $${vehicle.price.toLocaleString()} ${vehicle.currency || "ARS"}` : ""
        const msg = `Hola! Me interesa el ${vehicle.brand} ${vehicle.model} ${vehicle.year}${priceText}. ¿Podrían darme más información?`
        const encoded = encodeURIComponent(msg)
        window.open(`https://wa.me/${DEALERSHIP_OWNER.whatsapp}?text=${encoded}`, "_blank")
    }, [vehicle])

    return (
        <div className="space-y-6 sm:space-y-8">
            {/* Galería */}
            <Card className="overflow-hidden border-slate-200">
                <div className="relative">
                    <div className="relative w-full aspect-[16/9] bg-black"> {/* evita layout shift */}
                        <Image
                            src={images[currentImageIndex]}
                            alt={`${vehicle.brand} ${vehicle.model}`}
                            fill
                            className="object-contain"
                            sizes="(max-width: 768px) 100vw, 1024px"
                            priority={currentImageIndex === 0}
                            quality={85}
                        />
                    </div>

                    {vehicle.showPrice ? (
                        <div className="absolute top-4 right-4">
                            <Badge className="bg-red-600 text-white text-lg sm:text-xl font-bold px-3 py-1 shadow">
                                ${vehicle.price.toLocaleString()} {vehicle.currency || "ARS"}
                            </Badge>
                        </div>
                    ) : (
                        <div className="absolute top-4 right-4">
                            <Badge className="bg-gray-700 text-white text-lg sm:text-xl font-bold px-3 py-1 shadow">
                                Consultar precio
                            </Badge>
                        </div>
                    )}

                    {images.length > 1 && (
                        <>
                            <button
                                onClick={goToPrevious}
                                className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2"
                                aria-label="Anterior"
                            >
                                <ChevronLeft className="h-5 w-5" />
                            </button>
                            <button
                                onClick={goToNext}
                                className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2"
                                aria-label="Siguiente"
                            >
                                <ChevronRight className="h-5 w-5" />
                            </button>
                        </>
                    )}
                </div>

                {/* Thumbnails */}
                {images.length > 1 && (
                    <div className="px-3 pb-4 pt-3">
                        <div className="flex gap-2 overflow-x-auto scrollbar-none">
                            {images.map((src, idx) => (
                                <button
                                    key={src + idx}
                                    onClick={() => setCurrentImageIndex(idx)}
                                    className={`relative h-16 sm:h-20 w-24 sm:w-28 rounded border ${idx === currentImageIndex ? "border-slate-900" : "border-slate-200"} bg-white flex-shrink-0`}
                                    aria-label={`Ver imagen ${idx + 1}`}
                                >
                                    <Image
                                        src={src}
                                        alt={`Imagen ${idx + 1}`}
                                        fill
                                        className="object-cover rounded"
                                        sizes="112px"
                                        loading="lazy"
                                    />
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <Card className="border-slate-200">
                        <CardContent className="p-6">
                            <h2 className="text-2xl sm:text-3xl font-bold text-black mb-2">
                                {vehicle.brand} {vehicle.model}
                            </h2>
                            <h3 className="text-xl font-semibold text-black mb-4">Especificaciones</h3>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <Spec icon={<Gauge className="h-5 w-5 text-slate-600" />} label="Kilometraje" value={`${vehicle.mileage.toLocaleString()} km`} />
                                <Spec icon={<Fuel className="h-5 w-5 text-slate-600" />} label="Combustible" value={vehicle.fuelType} />
                                <Spec icon={<Settings className="h-5 w-5 text-slate-600" />} label="Transmisión" value={vehicle.transmission} />
                                <Spec icon={<Zap className="h-5 w-5 text-slate-600" />} label="Motor" value={vehicle.motor || "—"} />
                                <Spec icon={<Calendar className="h-5 w-5 text-slate-600" />} label="Año" value={String(vehicle.year)} />
                                <Spec icon={<Palette className="h-5 w-5 text-slate-600" />} label="Color" value={vehicle.color || "—"} />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-slate-200">
                        <CardContent className="p-6">
                            <h3 className="text-xl font-semibold text-black mb-4">Más detalles</h3>
                            {vehicle.description?.trim()
                                ? <p className="text-gray-700 leading-relaxed whitespace-pre-line">{vehicle.description}</p>
                                : <p className="text-gray-500">No hay detalles adicionales para este vehículo.</p>}
                        </CardContent>
                    </Card>
                </div>

                <div className="lg:col-span-1">
                    <Card className="sticky top-24 border-slate-200">
                        <CardContent className="p-6">
                            <div className="text-center text-sm text-gray-600 mt-2">
                                <p className="mb-2">
                                    {vehicle.showPrice ? "¿Tienes preguntas sobre este vehículo?" : "¿Te interesa este vehículo? Consulta el precio y más detalles."}
                                </p>
                                <p>Contáctanos y te ayudaremos con toda la información que necesites.</p>
                            </div>
                            <Button onClick={handleWhatsAppContact} className="w-full bg-green-600 hover:bg-green-700 text-lg py-3 mt-2">
                                <MessageCircle className="h-5 w-5 mr-2" />
                                {vehicle.showPrice ? "WhatsApp" : "Consultar precio"}
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}

function Spec({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
    return (
        <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
            {icon}
            <div>
                <p className="text-sm text-gray-600">{label}</p>
                <p className="font-semibold">{value}</p>
            </div>
        </div>
    )
}
