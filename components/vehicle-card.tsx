"use client"

import type React from "react"
import Image from "next/image"
import type { Vehicle } from "@/types/vehicle"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, Gauge, Settings, Fuel, MessageCircle } from "lucide-react"
import { useState } from "react"
import { DEALERSHIP_OWNER } from "@/lib/constants"
import { Engine } from "@phosphor-icons/react"

export type VehicleCardProps = { vehicle: Vehicle }

export default function VehicleCard({ vehicle }: VehicleCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [imageError, setImageError] = useState<boolean[]>([])

  const images =
    vehicle.images.length > 0
      ? vehicle.images
      : [`/placeholder.svg?height=600&width=600&query=${vehicle.brand} ${vehicle.model}`]

  const handleWhatsAppContact = () => {
    const currencySymbol = vehicle.currency === "USD" ? "USD" : "ARS"
    const priceText = vehicle.showPrice ? ` por ${currencySymbol} ${vehicle.price.toLocaleString()}` : ""
    const message = `Hola! Me interesa el ${vehicle.brand} ${vehicle.model} ${vehicle.year} que tienen publicado${priceText}. ¿Podrían darme más información?`
    const encodedMessage = encodeURIComponent(message)
    window.open(`https://wa.me/${DEALERSHIP_OWNER.whatsapp}?text=${encodedMessage}`, "_blank")
  }

  const goToPrevious = (e: React.MouseEvent) => {
    e.stopPropagation()
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  const goToNext = (e: React.MouseEvent) => {
    e.stopPropagation()
    setCurrentImageIndex((prev) => (prev + 1) % images.length)
  }

  const handleImageError = (index: number) => {
    setImageError((prev) => {
      const newErrors = [...prev]
      newErrors[index] = true
      return newErrors
    })
  }

  const currentImage = images[currentImageIndex]

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300 h-full">
      <div className="relative group">
        <div className="relative w-full aspect-square sm:aspect-[4/3] lg:aspect-[5/4] bg-black/5">
          <Image
            src={currentImage || "/placeholder.svg"}
            alt={`${vehicle.brand} ${vehicle.model}`}
            fill
            className="object-cover md:object-cover transition-opacity duration-300"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            loading="lazy"
            quality={85}
            onError={() => handleImageError(currentImageIndex)}
          />
        </div>

        {images.length > 1 && (
          <>
            <button
              onClick={goToPrevious}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/70 hover:bg-white text-black rounded-full p-1 shadow"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={goToNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/70 hover:bg-white text-black rounded-full p-1 shadow"
            >
              <ChevronRight className="h-5 w-5" />
            </button>

            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
              {images.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-colors duration-200 ${index === currentImageIndex ? "bg-black" : "bg-black/40"
                    }`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      <CardContent className="p-4 sm:p-6 flex flex-col h-full">
        {/* ✅ Precio ahora está aquí, verde y fuera de la foto */}
        {vehicle.showPrice ? (
          <p className="text-green-600 font-bold text-md sm:text-md mb-2">
            {vehicle.currency} {vehicle.price.toLocaleString()}
          </p>
        ) : (
          <p className="text-green-600 font-semibold text-md sm:text-md mb-2">Consultar precio</p>
        )}

        {/* Title */}
        <div className="mb-3 sm:mb-4">
          <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1 line-clamp-1">
            {vehicle.brand} {vehicle.model}
          </h3>
          <p className="text-gray-600 text-sm sm:text-base">{vehicle.year}</p>
        </div>

        {/* Specs */}
        <div className="grid grid-cols-2 gap-2 mb-4 text-xs sm:text-sm">
          <div className="flex items-center gap-1 text-gray-600">
            <Gauge className="h-3 w-3 sm:h-4 sm:w-4" />
            <span>{vehicle.mileage.toLocaleString()} km</span>
          </div>
          <div className="flex items-center gap-1 text-gray-600">
            <Settings className="h-3 w-3 sm:h-4 sm:w-4" />
            <span>{vehicle.transmission}</span>
          </div>
          <div className="flex items-center gap-1 text-gray-600">
            <Fuel className="h-3 w-3 sm:h-4 sm:w-4" />
            <span>{vehicle.fuelType}</span>
          </div>
          <div className="flex items-center gap-1 text-gray-600">
            <Engine className="h-3 w-3 sm:h-4 sm:w-4" weight="bold" />
            <span>{vehicle.motor}</span>
          </div>
        </div>

        {/* Buttons */}
        <Button
          onClick={() => (window.location.href = `/vehicle/${vehicle.id}`)}
          variant="outline"
          className="w-full mb-2 mt-2 text-md sm:text-base py-2 sm:py-2.5 cursor-pointer"
        >
          Ver más detalles
        </Button>

        <Button
          onClick={handleWhatsAppContact}
          className="w-full bg-green-600 hover:bg-green-700 text-sm sm:text-base py-2 sm:py-2.5 mt-auto flex items-center justify-center gap-1 cursor-pointer"
        >
          <span className="text-base">Consultar</span>
          <MessageCircle className="h-5 w-5" />
        </Button>
      </CardContent>
    </Card>
  )
}
