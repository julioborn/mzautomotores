"use client"

import type { Vehicle } from "@/types/vehicle"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { X, MessageCircle, Fuel, Gauge, Settings, Zap } from "lucide-react"
import { useState } from "react"
import { DEALERSHIP_OWNER } from "@/lib/constants"

interface VehicleDetailModalProps {
  vehicle: Vehicle
  onClose: () => void
}

export function VehicleDetailModal({ vehicle, onClose }: VehicleDetailModalProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  const handleWhatsAppContact = () => {
    const message = `Hola! Me interesa el ${vehicle.brand} ${vehicle.model} ${vehicle.year} que tienen publicado por $${vehicle.price.toLocaleString()}. 

Detalles del vehículo:
- Kilometraje: ${vehicle.mileage.toLocaleString()} km
- Combustible: ${vehicle.fuelType}
- Transmisión: ${vehicle.transmission}
- Motor: ${vehicle.motor}

¿Podrían darme más información y coordinar una visita?`
    const encodedMessage = encodeURIComponent(message)
    window.open(`https://wa.me/${DEALERSHIP_OWNER.whatsapp}?text=${encodedMessage}`, "_blank")
  }

  const images =
    vehicle.images.length > 0
      ? vehicle.images
      : [`/placeholder.svg?height=400&width=600&query=${vehicle.brand} ${vehicle.model}`]

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl">
                {vehicle.brand} {vehicle.model} {vehicle.year}
              </CardTitle>
              <div className="flex items-center gap-2 mt-2">
                <Badge className="bg-blue-600 text-white text-lg px-3 py-1">${vehicle.price.toLocaleString()}</Badge>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Image Gallery */}
          <div className="space-y-4">
            <img
              src={images[currentImageIndex] || "/placeholder.svg"}
              alt={`${vehicle.brand} ${vehicle.model} - Imagen ${currentImageIndex + 1}`}
              className="w-full h-64 md:h-80 object-cover rounded-lg"
            />
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`flex-shrink-0 w-20 h-16 rounded border-2 overflow-hidden ${
                      currentImageIndex === index ? "border-blue-500" : "border-gray-200"
                    }`}
                  >
                    <img
                      src={image || "/placeholder.svg"}
                      alt={`Thumbnail ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Specifications */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
              <Gauge className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Kilometraje</p>
                <p className="font-semibold">{vehicle.mileage.toLocaleString()} km</p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
              <Fuel className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Combustible</p>
                <p className="font-semibold">{vehicle.fuelType}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
              <Settings className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Transmisión</p>
                <p className="font-semibold">{vehicle.transmission}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
              <Zap className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm text-gray-600">Motor</p>
                <p className="font-semibold">{vehicle.motor}</p>
              </div>
            </div>
          </div>

          {/* Description */}
          {vehicle.description && (
            <div>
              <h3 className="text-lg font-semibold mb-2">Descripción</h3>
              <p className="text-gray-600 leading-relaxed">{vehicle.description}</p>
            </div>
          )}

          <div className="bg-blue-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">¿Te interesa este vehículo?</h3>
            <p className="text-gray-600 mb-4">
              Contacta con {DEALERSHIP_OWNER.name} para más información y coordinar una visita.
            </p>
            <div className="flex justify-center">
              <Button onClick={handleWhatsAppContact} className="bg-green-600 hover:bg-green-700 px-8">
                <MessageCircle className="h-4 w-4 mr-2" />
                Consultar por WhatsApp
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
