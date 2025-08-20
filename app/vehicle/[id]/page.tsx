"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import {
  ArrowLeft,
  MessageCircle,
  Fuel,
  Gauge,
  Settings,
  Zap,
  Calendar,
  Palette,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getVehicleById } from "@/lib/vehicles"
import { DEALERSHIP_OWNER } from "@/lib/constants"
import type { Vehicle } from "@/types/vehicle"

export default function VehiclePage() {
  const params = useParams()
  const router = useRouter()
  const [vehicle, setVehicle] = useState<Vehicle | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  const loadVehicle = useCallback(async () => {
    try {
      const vehicleId = params.id as string
      const vehicleData = await getVehicleById(vehicleId)
      setVehicle(vehicleData)
    } catch (error) {
      console.error("Error loading vehicle:", error)
      setVehicle(null)
    } finally {
      setLoading(false)
    }
  }, [params.id])

  useEffect(() => {
    if (params.id) {
      loadVehicle()
    }
  }, [params.id, loadVehicle])

  const images = useMemo(() => {
    if (!vehicle) return []
    return vehicle.images.length > 0
      ? vehicle.images
      : [`/placeholder.svg?height=400&width=600&query=${vehicle.brand} ${vehicle.model}`]
  }, [vehicle])

  const goToPrevious = useCallback(() => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length)
  }, [images.length])

  const goToNext = useCallback(() => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length)
  }, [images.length])

  const handleWhatsAppContact = useCallback(() => {
    if (!vehicle) return

    const priceText = vehicle.showPrice ? ` por $${vehicle.price.toLocaleString()} ${vehicle.currency || "ARS"}` : ""
    const message = `Hola! Me interesa el ${vehicle.brand} ${vehicle.model} ${vehicle.year} que tienen publicado${priceText}. ¿Podrían darme más información?`
    const encodedMessage = encodeURIComponent(message)
    window.open(`https://wa.me/${DEALERSHIP_OWNER.whatsapp}?text=${encodedMessage}`, "_blank")
  }, [vehicle])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50/30 via-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando vehículo...</p>
        </div>
      </div>
    )
  }

  if (!vehicle) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50/30 via-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Vehículo no encontrado</h1>
          <Button
            onClick={() => router.push("/")}
            variant="outline"
            className="border-slate-200 text-slate-700 hover:bg-slate-50"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver al catálogo
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50/30 via-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <Button
              onClick={() => router.push("/")}
              variant="ghost"
              className="flex items-center gap-2 text-gray-700 hover:text-slate-800 hover:bg-slate-100"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Volver al catálogo</span>
              <span className="sm:hidden">Volver</span>
            </Button>
            <div className="flex items-center gap-2">
              <Image
                src="/images/mzlogo.png"
                alt="MZ Automotores"
                width={100}
                height={38}
                className="h-14 sm:h-20 w-auto"
                priority
              />
            </div>
            <div className="w-20"></div> {/* Spacer for centering */}
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 sm:py-8">
        <div className="max-w-4xl mx-auto">
          {/* Image Gallery */}
          <Card className="mb-6 sm:mb-8 overflow-hidden border-slate-200">
            <div className="relative">
              <div className="relative w-full h-64 sm:h-96">
                <Image
                  src={images[currentImageIndex] || "/placeholder.svg"}
                  alt={`${vehicle.brand} ${vehicle.model}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1024px"
                  priority={currentImageIndex === 0}
                  quality={90}
                  placeholder="blur"
                  blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
                />
              </div>

              {/* Price Badge */}
              {vehicle.showPrice && (
                <div className="absolute top-4 right-4">
                  <Badge className="bg-red-600 text-white text-lg sm:text-xl font-bold px-3 py-1">
                    ${vehicle.price.toLocaleString()} {vehicle.currency || "ARS"}
                  </Badge>
                </div>
              )}

              {!vehicle.showPrice && (
                <div className="absolute top-4 right-4">
                  <Badge className="bg-gray-600 text-white text-lg sm:text-xl font-bold px-3 py-1">
                    Consultar precio
                  </Badge>
                </div>
              )}

              {/* Navigation arrows */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={goToPrevious}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-colors"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    onClick={goToNext}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-colors"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </>
              )}

              {/* Image indicators */}
              {images.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                  {images.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`w-3 h-3 rounded-full transition-colors ${
                        index === currentImageIndex ? "bg-white" : "bg-white/50"
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
            {/* Vehicle Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Specifications */}
              <Card className="border-slate-200">
                <CardContent className="p-6">
                  <h2 className="text-2xl sm:text-3xl font-bold text-black mb-2">
                    {vehicle.brand} {vehicle.model}
                  </h2>
                  <h3 className="text-xl font-semibold text-black mb-4">Especificaciones</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                      <Gauge className="h-5 w-5 text-slate-600" />
                      <div>
                        <p className="text-sm text-gray-600">Kilometraje</p>
                        <p className="font-semibold">{vehicle.mileage.toLocaleString()} km</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                      <Fuel className="h-5 w-5 text-slate-600" />
                      <div>
                        <p className="text-sm text-gray-600">Combustible</p>
                        <p className="font-semibold">{vehicle.fuelType}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                      <Settings className="h-5 w-5 text-slate-600" />
                      <div>
                        <p className="text-sm text-gray-600">Transmisión</p>
                        <p className="font-semibold">{vehicle.transmission}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                      <Zap className="h-5 w-5 text-slate-600" />
                      <div>
                        <p className="text-sm text-gray-600">Motor</p>
                        <p className="font-semibold">{vehicle.motor}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                      <Calendar className="h-5 w-5 text-slate-600" />
                      <div>
                        <p className="text-sm text-gray-600">Año</p>
                        <p className="font-semibold">{vehicle.year}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                      <Palette className="h-5 w-5 text-slate-600" />
                      <div>
                        <p className="text-sm text-gray-600">Color</p>
                        <p className="font-semibold">{vehicle.color}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Info */}
              <Card className="border-slate-200">
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold text-black mb-4">Más Detalles</h3>
                  {vehicle.description && <p className="text-gray-700 leading-relaxed">{vehicle.description}</p>}
                </CardContent>
              </Card>
            </div>

            {/* Contact Section */}
            <div className="lg:col-span-1">
              <Card className="sticky top-24 border-slate-200">
                <CardContent className="p-6">
                  <div className="text-center text-sm text-gray-600 mt-2">
                    <p className="mb-2">
                      {vehicle.showPrice
                        ? "¿Tienes preguntas sobre este vehículo?"
                        : "¿Te interesa este vehículo? Consulta el precio y más detalles."}
                    </p>
                    <p>Contáctanos y te ayudaremos con toda la información que necesites.</p>
                  </div>
                  <Button
                    onClick={handleWhatsAppContact}
                    className="w-full bg-green-600 hover:bg-green-700 text-lg py-3 mt-2"
                  >
                    <MessageCircle className="h-5 w-5 mr-2" />
                    {vehicle.showPrice ? "WhatsApp" : "Consultar precio"}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
