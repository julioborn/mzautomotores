"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { X, Plus, Upload, ImageIcon, GripVertical } from "lucide-react"
import { addVehicle, updateVehicle } from "@/lib/vehicles"
import type { Vehicle } from "@/types/vehicle"

interface VehicleFormProps {
  vehicle?: Vehicle | null
  onClose: (hasChanges?: boolean) => void // Updated type to accept hasChanges parameter
}

const formatNumber = (value: string): string => {
  const number = value.replace(/\D/g, "")
  return number.replace(/\B(?=(\d{3})+(?!\d))/g, ".")
}

const parseNumber = (value: string): number => {
  return Number.parseInt(value.replace(/\./g, "")) || 0
}

export function VehicleForm({ vehicle, onClose }: VehicleFormProps) {
  const [formData, setFormData] = useState(() => {
    if (vehicle) {
      return {
        brand: vehicle.brand,
        model: vehicle.model,
        year: vehicle.year,
        price: vehicle.price,
        currency: vehicle.currency || ("USD" as const),
        mileage: vehicle.mileage,
        fuelType: vehicle.fuelType,
        transmission: vehicle.transmission,
        color: vehicle.color,
        motor: vehicle.motor,
        description: vehicle.description,
        images: vehicle.images.length > 0 ? vehicle.images : [""],
        contactName: vehicle.contactName,
        contactPhone: vehicle.contactPhone,
        contactEmail: vehicle.contactEmail,
        isPublic: vehicle.isPublic,
        showPrice: vehicle.showPrice,
      }
    }
    return {
      brand: "",
      model: "",
      year: new Date().getFullYear(),
      price: 0,
      currency: "USD" as const,
      mileage: 0,
      fuelType: "Nafta" as const,
      transmission: "Manual" as const,
      color: "",
      motor: "",
      description: "",
      images: [""],
      contactName: "",
      contactPhone: "",
      contactEmail: "",
      isPublic: false,
      showPrice: false,
    }
  })

  const [isLoading, setIsLoading] = useState(false)
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [hasChanges, setHasChanges] = useState(false)
  const [priceDisplay, setPriceDisplay] = useState(formatNumber(formData.price.toString()))
  const [mileageDisplay, setMileageDisplay] = useState(formatNumber(formData.mileage.toString()))
  const initialDataRef = useRef(formData)

  useEffect(() => {
    if (vehicle) {
      const newData = {
        brand: vehicle.brand,
        model: vehicle.model,
        year: vehicle.year,
        price: vehicle.price,
        currency: vehicle.currency || ("USD" as const),
        mileage: vehicle.mileage,
        fuelType: vehicle.fuelType,
        transmission: vehicle.transmission,
        color: vehicle.color,
        motor: vehicle.motor,
        description: vehicle.description,
        images: vehicle.images.length > 0 ? vehicle.images : [""],
        contactName: vehicle.contactName,
        contactPhone: vehicle.contactPhone,
        contactEmail: vehicle.contactEmail,
        isPublic: vehicle.isPublic,
        showPrice: vehicle.showPrice,
      }
      setFormData(newData)
      setPriceDisplay(formatNumber(newData.price.toString()))
      setMileageDisplay(formatNumber(newData.mileage.toString()))
      initialDataRef.current = newData
    }
  }, [vehicle])

  useEffect(() => {
    const currentData = JSON.stringify(formData)
    const initialData = JSON.stringify(initialDataRef.current)
    setHasChanges(currentData !== initialData)
  }, [formData])

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    Array.from(files).forEach((file) => {
      if (file.type.startsWith("image/")) {
        const canvas = document.createElement("canvas")
        const ctx = canvas.getContext("2d")
        const img = new Image()

        img.onload = () => {
          // Redimensionar imagen si es muy grande
          const maxWidth = 800
          const maxHeight = 600
          let { width, height } = img

          if (width > maxWidth || height > maxHeight) {
            const ratio = Math.min(maxWidth / width, maxHeight / height)
            width *= ratio
            height *= ratio
          }

          canvas.width = width
          canvas.height = height
          ctx?.drawImage(img, 0, 0, width, height)

          const optimizedDataUrl = canvas.toDataURL("image/jpeg", 0.8)
          setFormData((prev) => ({
            ...prev,
            images: [...prev.images.filter((img) => img.trim() !== ""), optimizedDataUrl],
          }))
        }

        img.src = URL.createObjectURL(file)
      }
    })

    e.target.value = ""
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!hasChanges && vehicle) {
      onClose(false) // Pass false when no changes were made
      return
    }

    setIsLoading(true)

    try {
      const vehicleData = {
        ...formData,
        images: formData.images.filter((img) => img.trim() !== ""),
      }

      if (vehicle) {
        await updateVehicle(vehicle.id, vehicleData)
      } else {
        await addVehicle(vehicleData)
      }

      onClose(true) // Pass true when changes were successfully saved
    } catch (error) {
      console.error("Error saving vehicle:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const addImageField = () => {
    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, ""],
    }))
  }

  const removeImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }))
  }

  const updateImageField = (index: number, value: string) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.map((img, i) => (i === index ? value : img)),
    }))
  }

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index)
    e.dataTransfer.effectAllowed = "move"
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
  }

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault()

    if (draggedIndex === null || draggedIndex === dropIndex) return

    setFormData((prev) => {
      const newImages = [...prev.images]
      const draggedImage = newImages[draggedIndex]
      newImages.splice(draggedIndex, 1)
      newImages.splice(dropIndex, 0, draggedImage)
      return { ...prev, images: newImages }
    })

    setDraggedIndex(null)
  }

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>, index: number) => {
    setDraggedIndex(index)

    const target = e.currentTarget as HTMLElement
    target.style.opacity = "0.7"
    target.style.transform = "scale(1.02)"
    target.style.zIndex = "10"
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault()
    const touch = e.touches[0]
    const elementBelow = document.elementFromPoint(touch.clientX, touch.clientY)
    const dropZone = elementBelow?.closest("[data-drop-index]")

    document.querySelectorAll("[data-drop-index]").forEach((el) => {
      el.classList.remove("bg-blue-100", "border-blue-300")
    })
    if (dropZone && dropZone !== e.currentTarget) {
      dropZone.classList.add("bg-blue-100", "border-blue-300")
    }
  }

  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    const target = e.currentTarget as HTMLElement
    target.style.opacity = "1"
    target.style.transform = "scale(1)"
    target.style.zIndex = "auto"

    if (draggedIndex === null) return

    const touch = e.changedTouches[0]
    const elementBelow = document.elementFromPoint(touch.clientX, touch.clientY)
    const dropZone = elementBelow?.closest("[data-drop-index]")

    // Remove all highlights
    document.querySelectorAll("[data-drop-index]").forEach((el) => {
      el.classList.remove("bg-blue-100", "border-blue-300")
    })

    if (dropZone && dropZone !== e.currentTarget) {
      const dropIndex = Number.parseInt(dropZone.getAttribute("data-drop-index") || "0")

      if (draggedIndex !== dropIndex) {
        setFormData((prev) => {
          const newImages = [...prev.images]
          const draggedImage = newImages[draggedIndex]
          newImages.splice(draggedIndex, 1)
          newImages.splice(dropIndex, 0, draggedImage)
          return { ...prev, images: newImages }
        })
      }
    }

    setDraggedIndex(null)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>{vehicle ? "Editar Vehículo" : "Agregar Nuevo Vehículo"}</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => onClose(false)}>
              {" "}
              {/* Pass false when closing with X button */}
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="brand">Marca *</Label>
                <Input
                  id="brand"
                  value={formData.brand}
                  onChange={(e) => setFormData((prev) => ({ ...prev, brand: e.target.value }))}
                  placeholder="Toyota, Ford, etc."
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="model">Modelo *</Label>
                <Input
                  id="model"
                  value={formData.model}
                  onChange={(e) => setFormData((prev) => ({ ...prev, model: e.target.value }))}
                  placeholder="Corolla, Focus, etc."
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="year">Año *</Label>
                <Input
                  id="year"
                  type="number"
                  min="1990"
                  max={new Date().getFullYear() + 1}
                  value={formData.year}
                  onChange={(e) => setFormData((prev) => ({ ...prev, year: Number.parseInt(e.target.value) }))}
                  required
                />
              </div>
            </div>

            {/* Price and Mileage */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="currency">Moneda *</Label>
                <Select
                  value={formData.currency}
                  onValueChange={(value: any) => setFormData((prev) => ({ ...prev, currency: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD (Dólares)</SelectItem>
                    <SelectItem value="ARS">ARS (Pesos Argentinos)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Precio ({formData.currency}) *</Label>
                <Input
                  id="price"
                  value={priceDisplay}
                  onChange={(e) => {
                    const formatted = formatNumber(e.target.value)
                    setPriceDisplay(formatted)
                    setFormData((prev) => ({ ...prev, price: parseNumber(formatted) }))
                  }}
                  placeholder="15.000"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="mileage">Kilometraje *</Label>
                <Input
                  id="mileage"
                  value={mileageDisplay}
                  onChange={(e) => {
                    const formatted = formatNumber(e.target.value)
                    setMileageDisplay(formatted)
                    setFormData((prev) => ({ ...prev, mileage: parseNumber(formatted) }))
                  }}
                  placeholder="50.000"
                  required
                />
              </div>
            </div>

            {/* Vehicle Details */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fuelType">Tipo de Combustible</Label>
                <Select
                  value={formData.fuelType}
                  onValueChange={(value: any) => setFormData((prev) => ({ ...prev, fuelType: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Nafta">Nafta</SelectItem>
                    <SelectItem value="Diesel">Diesel</SelectItem>
                    <SelectItem value="Híbrido">Híbrido</SelectItem>
                    <SelectItem value="Eléctrico">Eléctrico</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="transmission">Transmisión</Label>
                <Select
                  value={formData.transmission}
                  onValueChange={(value: any) => setFormData((prev) => ({ ...prev, transmission: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar transmisión" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Manual">Manual</SelectItem>
                    <SelectItem value="Automática">Automática</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="color">Color *</Label>
                <Input
                  id="color"
                  value={formData.color}
                  onChange={(e) => setFormData((prev) => ({ ...prev, color: e.target.value }))}
                  placeholder="Blanco, Negro, etc."
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="motor">Motor *</Label>
                <Input
                  id="motor"
                  value={formData.motor}
                  onChange={(e) => setFormData((prev) => ({ ...prev, motor: e.target.value }))}
                  placeholder="1.6L, 2.0L, V6, etc."
                  required
                />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Descripción detallada del vehículo..."
                rows={3}
              />
            </div>

            {/* Images */}
            <div className="space-y-4">
              <Label>Imágenes del Vehículo</Label>

              {/* Botón para subir archivos */}
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    id="file-upload"
                  />
                  <Button type="button" variant="outline" className="w-full sm:w-auto bg-transparent">
                    <Upload className="h-4 w-4 mr-2" />
                    Subir desde Galería
                  </Button>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addImageField}
                  className="w-full sm:w-auto bg-transparent"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar URL
                </Button>
              </div>

              <div className="space-y-3">
                {formData.images.map((image, index) => (
                  <div
                    key={index}
                    className="border border-gray-200 rounded-lg p-4 bg-gray-50 transition-all duration-200 touch-manipulation"
                    data-drop-index={index}
                    draggable
                    onDragStart={(e) => handleDragStart(e, index)}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, index)}
                    onTouchStart={(e) => handleTouchStart(e, index)}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={(e) => handleTouchEnd(e)}
                    style={{ touchAction: "none" }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <GripVertical className="h-5 w-5 text-gray-500 cursor-move touch-manipulation" />
                        <span className="text-sm font-medium text-gray-600">
                          Imagen #{index + 1} {index === 0 && "(Principal)"}
                        </span>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeImage(index)}
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="flex gap-2 mb-2">
                      <Input
                        value={image}
                        onChange={(e) => updateImageField(index, e.target.value)}
                        placeholder="https://ejemplo.com/imagen.jpg o imagen cargada"
                        className="flex-1"
                      />
                    </div>

                    {image && image.trim() !== "" && (
                      <div className="relative w-full h-32 sm:h-40 bg-gray-100 rounded-lg overflow-hidden">
                        <img
                          src={image || "/placeholder.svg"}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-full object-cover"
                          loading="lazy"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement
                            target.style.display = "none"
                            target.nextElementSibling?.classList.remove("hidden")
                          }}
                        />
                        <div className="hidden absolute inset-0 flex items-center justify-center bg-gray-200">
                          <div className="text-center text-gray-500">
                            <ImageIcon className="h-8 w-8 mx-auto mb-2" />
                            <p className="text-sm">Error al cargar imagen</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Contact Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contactName">Nombre del Contacto *</Label>
                <Input
                  id="contactName"
                  value={formData.contactName}
                  onChange={(e) => setFormData((prev) => ({ ...prev, contactName: e.target.value }))}
                  placeholder="Juan Pérez"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactPhone">Teléfono *</Label>
                <Input
                  id="contactPhone"
                  value={formData.contactPhone}
                  onChange={(e) => setFormData((prev) => ({ ...prev, contactPhone: e.target.value }))}
                  placeholder="+3483529702"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactEmail">Email</Label>
                <Input
                  id="contactEmail"
                  type="email"
                  value={formData.contactEmail}
                  onChange={(e) => setFormData((prev) => ({ ...prev, contactEmail: e.target.value }))}
                  placeholder="contacto@ejemplo.com"
                />
              </div>
            </div>

            {/* Public Toggle */}
            <div className="flex items-center space-x-2">
              <Switch
                id="isPublic"
                checked={formData.isPublic}
                onCheckedChange={(checked: boolean) =>
                  setFormData((prev) => ({ ...prev, isPublic: checked }))
                }
              />
              <Label htmlFor="isPublic">Mostrar públicamente</Label>
            </div>

            {/* Show Price Toggle */}
            <div className="flex items-center space-x-2">
              <Switch
                id="showPrice"
                checked={formData.showPrice}
                onCheckedChange={(checked: boolean) =>
                  setFormData((prev) => ({ ...prev, showPrice: checked }))
                }
              />
              <Label htmlFor="showPrice">Mostrar precio al público</Label>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => onClose(false)}>
                {" "}
                {/* Pass false when canceling */}
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Guardando..." : vehicle ? (hasChanges ? "Actualizar" : "Sin cambios") : "Agregar"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
