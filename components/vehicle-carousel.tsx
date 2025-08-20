"use client"

import { useState, useRef, useEffect } from "react"
import type { Vehicle } from "@/types/vehicle"
import { VehicleCard } from "@/components/vehicle-card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface VehicleCarouselProps {
  vehicles: Vehicle[]
}

export function VehicleCarousel({ vehicles }: VehicleCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const carouselRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex === vehicles.length - 1 ? 0 : prevIndex + 1))
  }

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? vehicles.length - 1 : prevIndex - 1))
  }

  const goToSlide = (index: number) => {
    setCurrentIndex(index)
  }

  if (vehicles.length === 0) return null

  return (
    <div className="relative">
      {/* Carousel Container */}
      <div className="relative overflow-hidden rounded-lg">
        <div
          ref={carouselRef}
          className={`flex transition-transform duration-300 ease-in-out ${isVisible ? "opacity-100" : "opacity-0"}`}
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {vehicles.map((vehicle, index) => (
            <div key={vehicle.id} className="w-full flex-shrink-0 px-2">
              <VehicleCard vehicle={vehicle} />
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Arrows */}
      {vehicles.length > 1 && (
        <>
          <Button
            variant="outline"
            size="icon"
            className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white shadow-lg z-10"
            onClick={prevSlide}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white shadow-lg z-10"
            onClick={nextSlide}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </>
      )}

      {/* Dots Indicator */}
      {vehicles.length > 1 && (
        <div className="flex justify-center mt-4 gap-2">
          {vehicles.map((_, index) => (
            <button
              key={index}
              className={`w-2 h-2 rounded-full transition-colors duration-200 ${
                index === currentIndex ? "bg-blue-600" : "bg-gray-300"
              }`}
              onClick={() => goToSlide(index)}
            />
          ))}
        </div>
      )}

      {/* Vehicle Counter */}
      <div className="text-center mt-2 text-sm text-gray-600">
        {currentIndex + 1} de {vehicles.length}
      </div>
    </div>
  )
}
