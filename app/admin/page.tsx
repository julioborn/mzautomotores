"use client"

import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useState, useCallback, useMemo } from "react"
import { getVehicles } from "@/lib/vehicles"
import type { Vehicle } from "@/types/vehicle"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Car, Plus, LogOut, Eye, EyeOff, Edit, Trash2 } from "lucide-react"
import Link from "next/link"
import { VehicleForm } from "@/components/vehicle-form"
import { deleteVehicle, updateVehicle } from "@/lib/vehicles"
import Image from "next/image"

export default function AdminPage() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadVehicles = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const vehiclesData = await getVehicles()
      const vehicleArray = Array.isArray(vehiclesData) ? vehiclesData : []
      setVehicles(vehicleArray)
    } catch (err) {
      console.error("Error loading vehicles:", err)
      setError("Error al cargar los vehículos")
      setVehicles([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!user) {
      router.push("/login")
      return
    }

    loadVehicles()
  }, [user, router, loadVehicles])

  const handleLogout = useCallback(() => {
    logout()
    router.push("/")
  }, [logout, router])

  const handleTogglePublic = useCallback(
    async (vehicle: Vehicle) => {
      try {
        await updateVehicle(vehicle.id, { isPublic: !vehicle.isPublic })
        await loadVehicles()
      } catch (err) {
        console.error("Error toggling vehicle visibility:", err)
        setError("Error al cambiar la visibilidad del vehículo")
      }
    },
    [loadVehicles],
  )

  const handleDelete = useCallback(
    async (vehicleId: string) => {
      if (confirm("¿Estás seguro de que quieres eliminar este vehículo?")) {
        try {
          await deleteVehicle(vehicleId)
          await loadVehicles()
        } catch (err) {
          console.error("Error deleting vehicle:", err)
          setError("Error al eliminar el vehículo")
        }
      }
    },
    [loadVehicles],
  )

  const handleEdit = useCallback((vehicle: Vehicle) => {
    setEditingVehicle(vehicle)
    setShowForm(true)
  }, [])

  const handleFormClose = useCallback(
    (hasChanges?: boolean) => {
      setShowForm(false)
      setEditingVehicle(null)
      if (hasChanges) {
        loadVehicles()
      }
    },
    [loadVehicles],
  )

  const stats = useMemo(() => {
    const total = Array.isArray(vehicles) ? vehicles.length : 0
    const publicCount = Array.isArray(vehicles) ? vehicles.filter((v) => v.isPublic).length : 0
    const privateCount = total - publicCount

    return { total, publicCount, privateCount }
  }, [vehicles])

  if (!user) {
    return <div>Cargando...</div>
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50/30 via-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <Car className="h-12 w-12 text-slate-600 mx-auto mb-4 animate-pulse" />
          <p className="text-slate-600">Cargando vehículos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50/30 via-slate-50 to-slate-100">

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50/80 backdrop-blur-sm border border-red-200 rounded-lg shadow-sm">
            <p className="text-red-600">{error}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setError(null)}
              className="mt-2 border-red-200 text-red-700 hover:bg-red-50"
            >
              Cerrar
            </Button>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4 md:gap-6 mb-8">
          <Card className="bg-white/80 backdrop-blur-sm border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-slate-600">Vehículos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg sm:text-2xl font-bold text-black">{stats.total}</div>
            </CardContent>
          </Card>
          <Card className="bg-white/80 backdrop-blur-sm border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-slate-600">Públicos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg sm:text-2xl font-bold text-emerald-600">{stats.publicCount}</div>
            </CardContent>
          </Card>
          <Card className="bg-white/80 backdrop-blur-sm border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-slate-600">Privados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg sm:text-2xl font-bold text-red-700">{stats.privateCount}</div>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h2 className="text-xl font-semibold text-black">Gestión de Vehículos</h2>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Button
              onClick={() => setShowForm(true)}
              className="w-full sm:w-auto bg-gradient-to-r from-slate-800 to-slate-700 hover:from-slate-700 hover:to-slate-600"
            >
              <Plus className="h-4 w-4 mr-2" />
              Agregar Vehículo
            </Button>
          </div>
        </div>

        {/* Vehicle List */}
        <div className="grid gap-6">
          {!Array.isArray(vehicles) || vehicles.length === 0 ? (
            <Card className="bg-white/80 backdrop-blur-sm border-slate-200 shadow-sm">
              <CardContent className="text-center py-12">
                <Car className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg sm:text-xl font-medium text-slate-900 mb-2">No hay vehículos</h3>
                <p className="text-slate-600 mb-4">Comienza agregando tu primer vehículo al inventario.</p>
                <Button
                  onClick={() => setShowForm(true)}
                  className="bg-gradient-to-r from-slate-800 to-slate-700 hover:from-slate-700 hover:to-slate-600"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Primer Vehículo
                </Button>
              </CardContent>
            </Card>
          ) : (
            vehicles.map((vehicle) => (
              <Card
                key={vehicle.id}
                className="bg-white/80 backdrop-blur-sm border-slate-200 shadow-sm hover:shadow-md transition-shadow"
              >
                <CardContent className="p-4 sm:p-6">
                  <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
                    <div className="lg:w-64 flex-shrink-0">
                      <div className="relative w-full h-48 rounded-lg overflow-hidden">
                        <Image
                          src={
                            vehicle.images[0] ||
                            `/placeholder.svg?height=200&width=300&query=${vehicle.brand || "vehicle"} ${vehicle.model}`
                          }
                          alt={`${vehicle.brand} ${vehicle.model}`}
                          fill
                          className="object-cover"
                          sizes="(max-width: 1024px) 100vw, 256px"
                          loading="lazy"
                          quality={85}
                        />
                      </div>
                    </div>

                    {/* Details */}
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4">
                        <div>
                          <h3 className="text-lg sm:text-xl font-bold text-black">
                            {vehicle.brand} {vehicle.model} {vehicle.year}
                          </h3>
                          <p className="text-xl sm:text-2xl font-bold text-black">${vehicle.price.toLocaleString()}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={vehicle.isPublic ? "default" : "secondary"}
                            className="text-xs bg-slate-100 text-slate-800 border-slate-200"
                          >
                            {vehicle.isPublic ? "Público" : "Privado"}
                          </Badge>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4">
                        <div>
                          <p className="text-sm text-slate-600">Kilometraje</p>
                          <p className="font-medium text-slate-800">{vehicle.mileage.toLocaleString()} km</p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-600">Combustible</p>
                          <p className="font-medium text-slate-800">{vehicle.fuelType}</p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-600">Transmisión</p>
                          <p className="font-medium text-slate-800">{vehicle.transmission}</p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-600">Color</p>
                          <p className="font-medium text-slate-800">{vehicle.color}</p>
                        </div>
                      </div>

                      <div className="mb-4">
                        <p className="text-sm text-slate-600 mb-1">Contacto</p>
                        <p className="font-medium text-slate-800">
                          {vehicle.contactName} - {vehicle.contactPhone}
                        </p>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleTogglePublic(vehicle)}
                          className="w-full sm:w-auto border-slate-200 text-slate-700 hover:bg-slate-50"
                        >
                          {vehicle.isPublic ? (
                            <>
                              <EyeOff className="h-4 w-4 mr-2" />
                              Ocultar
                            </>
                          ) : (
                            <>
                              <Eye className="h-4 w-4 mr-2" />
                              Publicar
                            </>
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(vehicle)}
                          className="w-full sm:w-auto border-slate-200 text-slate-700 hover:bg-slate-50"
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Editar
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(vehicle.id)}
                          className="w-full sm:w-auto text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Eliminar
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </main>

      {/* Vehicle Form Modal */}
      {showForm && <VehicleForm vehicle={editingVehicle} onClose={handleFormClose} />}
    </div>
  )
}
