"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { getPublicVehicles } from "@/lib/vehicles"
import type { Vehicle } from "@/types/vehicle"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Car, Search, MessageCircle, Phone, Filter, Menu, X, ChevronLeft, ChevronRight, LogOut } from "lucide-react"
import Link from "next/link"
import { VehicleCard } from "@/components/vehicle-card"
import { WhatsAppFloat } from "@/components/whatsapp-float"
import { useAuth } from "@/contexts/auth-context"
import Image from "next/image"

export default function HomePage() {
  const { user, logout } = useAuth()
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [brandFilter, setBrandFilter] = useState("all")
  const [sortBy, setSortBy] = useState("newest")
  const [showFilters, setShowFilters] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [vehiclesPerPage, setVehiclesPerPage] = useState(6)

  const fetchVehicles = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const publicVehicles = await getPublicVehicles()
      setVehicles(publicVehicles)
    } catch (err) {
      console.error("Error loading vehicles:", err)
      setError("Error al cargar los vehículos")
      setVehicles([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchVehicles()
  }, [fetchVehicles])

  const brands = useMemo(() => {
    if (!Array.isArray(vehicles)) return []
    const uniqueBrands = [...new Set(vehicles.map((v) => v.brand))]
    return uniqueBrands.sort()
  }, [vehicles])

  const filteredVehicles = useMemo(() => {
    if (!Array.isArray(vehicles)) return []

    const filtered = vehicles.filter((vehicle) => {
      const matchesSearch =
        vehicle.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vehicle.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vehicle.year.toString().includes(searchTerm)

      const matchesBrand = brandFilter === "all" || vehicle.brand === brandFilter

      return matchesSearch && matchesBrand
    })

    const sortedFiltered = [...filtered]
    switch (sortBy) {
      case "newest":
        sortedFiltered.sort((a, b) => b.year - a.year)
        break
      case "oldest":
        sortedFiltered.sort((a, b) => a.year - b.year)
        break
      case "price-low":
        sortedFiltered.sort((a, b) => a.price - b.price)
        break
      case "price-high":
        sortedFiltered.sort((a, b) => b.price - a.price)
        break
      case "mileage-low":
        sortedFiltered.sort((a, b) => a.mileage - b.mileage)
        break
    }

    return sortedFiltered
  }, [vehicles, searchTerm, brandFilter, sortBy])

  const paginationData = useMemo(() => {
    const totalPages = Math.ceil(filteredVehicles.length / vehiclesPerPage)
    const startIndex = (currentPage - 1) * vehiclesPerPage
    const endIndex = startIndex + vehiclesPerPage
    const currentVehicles = filteredVehicles.slice(startIndex, endIndex)

    return { totalPages, startIndex, endIndex, currentVehicles }
  }, [filteredVehicles, currentPage, vehiclesPerPage])

  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, brandFilter, sortBy])

  const handleLogout = useCallback(async () => {
    try {
      await logout()
    } catch (error) {
      console.error("Error al cerrar sesión:", error)
    }
  }, [logout])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50/30 via-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <Car className="h-12 w-12 text-slate-600 mx-auto mb-4 animate-spin" />
          <p className="text-gray-600">Cargando vehículos...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50/30 via-slate-50 to-slate-100 flex items-center justify-center">
        <Card className="max-w-md bg-white/80 backdrop-blur-sm border-slate-200 shadow-sm">
          <CardContent className="text-center py-8">
            <Car className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Error al cargar</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()} className="bg-slate-600 hover:bg-slate-700">
              Reintentar
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50/30 via-slate-50 to-slate-100">

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Hero Section */}
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-black mb-4">Encuentra tu vehículo ideal</h1>
          <div className="flex justify-center">
            <Badge variant="secondary" className="text-sm bg-slate-100 text-slate-800 border-slate-200">
              {vehicles.length} vehículos disponibles
            </Badge>
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-6 sm:mb-8 bg-white/80 backdrop-blur-sm border-slate-200 shadow-sm">
          <CardHeader className="pb-3 sm:pb-6">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl text-black">
                <Filter className="h-4 w-4 sm:h-5 sm:w-5 text-slate-600" />
                Filtros y Búsqueda
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                className="sm:hidden text-slate-600 hover:text-slate-800 hover:bg-slate-100"
                onClick={() => setShowFilters(!showFilters)}
              >
                {showFilters ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
              </Button>
            </div>
          </CardHeader>
          <CardContent className={`${showFilters ? "block" : "hidden"} sm:block`}>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                  <Input
                    placeholder="Buscar marca, modelo o año..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 border-slate-200 focus:border-slate-400 focus:ring-slate-400"
                  />
                </div>
              </div>

              <div>
                <Select value={brandFilter} onValueChange={setBrandFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Marca" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas las marcas</SelectItem>
                    {brands.map((brand) => (
                      <SelectItem key={brand} value={brand}>
                        {brand}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger>
                    <SelectValue placeholder="Ordenar" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Más nuevos</SelectItem>
                    <SelectItem value="oldest">Más antiguos</SelectItem>
                    <SelectItem value="price-low">Precio: menor a mayor</SelectItem>
                    <SelectItem value="price-high">Precio: mayor a menor</SelectItem>
                    <SelectItem value="mileage-low">Menor kilometraje</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pagination selector */}
        {filteredVehicles.length > 0 && (
          <div className="flex items-center gap-2 mb-6">
            <span className="text-sm text-slate-600">Mostrar:</span>
            <Select value={vehiclesPerPage.toString()} onValueChange={(value) => setVehiclesPerPage(Number(value))}>
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3">3</SelectItem>
                <SelectItem value="6">6</SelectItem>
                <SelectItem value="9">9</SelectItem>
                <SelectItem value="12">12</SelectItem>
              </SelectContent>
            </Select>
            <span className="text-sm text-slate-600">por página</span>
          </div>
        )}

        {/* Vehicle Display */}
        {paginationData.currentVehicles.length === 0 ? (
          <Card className="bg-white/80 backdrop-blur-sm border-slate-200">
            <CardContent className="text-center py-8 sm:py-12">
              <Car className="h-10 w-10 sm:h-12 sm:w-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-800 mb-2">No se encontraron vehículos</h3>
              <p className="text-slate-600 mb-4 sm:mb-6 px-4">
                Intenta ajustar los filtros o contactanos directamente para consultar por vehículos específicos.
              </p>
              <Button
                onClick={() => window.open("https://wa.me/1234567890", "_blank")}
                className="bg-green-600 hover:bg-green-700"
              >
                <MessageCircle className="h-5 w-5 mr-2" />
                Contactar por WhatsApp
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginationData.currentVehicles.map((vehicle) => (
                <VehicleCard key={vehicle.id} vehicle={vehicle} />
              ))}
            </div>

            {paginationData.totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between mt-8 gap-4">
                <div className="text-sm text-slate-600">
                  Mostrando {paginationData.startIndex + 1} -{" "}
                  {Math.min(paginationData.endIndex, filteredVehicles.length)} de {filteredVehicles.length} vehículos
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="border-slate-300"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Anterior
                  </Button>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: paginationData.totalPages }, (_, i) => i + 1).map((page) => (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(page)}
                        className={`w-10 ${
                          currentPage === page ? "bg-slate-800 text-white" : "border-slate-300 hover:bg-slate-50"
                        }`}
                      >
                        {page}
                      </Button>
                    ))}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === paginationData.totalPages}
                    className="border-slate-300"
                  >
                    Siguiente
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}

        {/* Contact CTA */}
        <div className="mt-12 sm:mt-16 text-center">
          <Card className="bg-gradient-to-br from-slate-50 to-blue-50 border-slate-200 shadow-sm">
            <CardContent className="py-6 sm:py-8 px-4 sm:px-6">
              <h3 className="text-xl sm:text-2xl font-bold text-black mb-3 sm:mb-4">¿No encontraste lo que buscas?</h3>
              <p className="text-slate-600 mb-4 sm:mb-6 text-sm sm:text-base">
                Contáctanos directamente y te ayudaremos a encontrar el vehículo perfecto para ti.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                <Button
                  size="lg"
                  onClick={() => window.open("https://wa.me/1234567890", "_blank")}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <MessageCircle className="h-5 w-5 mr-2" />
                  WhatsApp
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => window.open("tel:+1234567890", "_blank")}
                  className="border-slate-300 text-slate-700 hover:bg-slate-50"
                >
                  <Phone className="h-5 w-5 mr-2" />
                  Llamar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* WhatsApp float component */}
      <WhatsAppFloat />
    </div>
  )
}
