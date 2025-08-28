"use client"

import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useState, useCallback, useMemo } from "react"
import { getVehicles, updateVehicle, deleteVehicle } from "@/lib/vehicles"
import type { Vehicle } from "@/types/vehicle"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
    Car, Plus, Eye, EyeOff, Edit, Trash2, Search, Menu, X, ChevronLeft, ChevronRight,
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import dynamic from "next/dynamic"
import Loader from "@/components/ui/loader"

type SortKey = "newest" | "oldest" | "price-low" | "price-high" | "mileage-low"

const VehicleForm = dynamic(
    () => import("@/components/vehicle-form").then(m => m.VehicleForm),
    { ssr: false, loading: () => <Loader text="Abriendo editor..." /> }
)

export function AdminExplorer({
    initialVehicles,
    initialError,
}: {
    initialVehicles: Vehicle[]
    initialError?: string
}) {
    const { user, logout } = useAuth()
    const router = useRouter()

    // Estado de datos con render inmediato
    const [vehicles, setVehicles] = useState<Vehicle[]>(initialVehicles ?? [])
    const [loading, setLoading] = useState(!initialVehicles?.length && !initialError)
    const [error, setError] = useState<string | null>(initialError ?? null)

    // UI
    const [showForm, setShowForm] = useState(false)
    const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null)
    const [searchTerm, setSearchTerm] = useState("")
    const [brandFilter, setBrandFilter] = useState("all")
    const [sortBy, setSortBy] = useState<SortKey>("newest")
    const [showFilters, setShowFilters] = useState(true)
    const [currentPage, setCurrentPage] = useState(1)
    const [vehiclesPerPage, setVehiclesPerPage] = useState(3)

    // Si por algún motivo se llegó sin usuario (p. ej. logout desde otra pestaña)
    useEffect(() => {
        if (!user) router.replace("/login")
    }, [user, router])

    const loadVehicles = useCallback(async () => {
        try {
            setLoading(true)
            setError(null)
            const data = await getVehicles()
            setVehicles(Array.isArray(data) ? data : [])
        } catch (err) {
            console.error("Error loading vehicles:", err)
            setError("Error al cargar los vehículos")
            setVehicles([])
        } finally {
            setLoading(false)
        }
    }, [])

    // Si SSR nos trajo data, no hace falta refetch en el mount.
    // Pero si vino vacío por error temporal, permitimos reintentar manualmente desde la UI.

    const handleTogglePublic = useCallback(
        async (vehicle: Vehicle) => {
            try {
                // optimista: actualizo local primero
                setVehicles(prev =>
                    prev.map(v => (v.id === vehicle.id ? { ...v, isPublic: !v.isPublic } : v))
                )
                await updateVehicle(vehicle.id, { isPublic: !vehicle.isPublic })
            } catch (err) {
                console.error("Error toggling vehicle visibility:", err)
                setError("Error al cambiar la visibilidad del vehículo")
                // rollback si falla
                setVehicles(prev =>
                    prev.map(v => (v.id === vehicle.id ? { ...v, isPublic: vehicle.isPublic } : v))
                )
            }
        },
        []
    )

    const handleDelete = useCallback(
        async (vehicleId: string) => {
            if (!confirm("¿Estás seguro de que quieres eliminar este vehículo?")) return
            // optimista: quito de la lista
            const prev = vehicles
            setVehicles(prev.filter(v => v.id !== vehicleId))
            try {
                await deleteVehicle(vehicleId)
            } catch (err) {
                console.error("Error deleting vehicle:", err)
                setError("Error al eliminar el vehículo")
                // rollback
                setVehicles(prev)
            }
        },
        [vehicles]
    )

    const handleEdit = useCallback((vehicle: Vehicle) => {
        setEditingVehicle(vehicle)
        setShowForm(true)
    }, [])

    const handleFormClose = useCallback(
        (hasChanges?: boolean) => {
            setShowForm(false)
            setEditingVehicle(null)
            if (hasChanges) loadVehicles()
        },
        [loadVehicles]
    )

    const stats = useMemo(() => {
        const total = vehicles.length
        const publicCount = vehicles.filter((v) => v.isPublic).length
        const privateCount = total - publicCount
        return { total, publicCount, privateCount }
    }, [vehicles])

    const brands = useMemo(() => {
        const set = new Set(vehicles.map((v) => v.brand).filter(Boolean))
        return Array.from(set).sort()
    }, [vehicles])

    const filteredVehicles = useMemo(() => {
        const low = searchTerm.trim().toLowerCase()
        const filtered = vehicles.filter((v) => {
            const matchesSearch =
                !low ||
                v.brand.toLowerCase().includes(low) ||
                v.model.toLowerCase().includes(low) ||
                String(v.year).includes(low)

            const matchesBrand = brandFilter === "all" || v.brand === brandFilter
            return matchesSearch && matchesBrand
        })

        const sorted = [...filtered]
        switch (sortBy) {
            case "newest":
                sorted.sort((a, b) => b.year - a.year)
                break
            case "oldest":
                sorted.sort((a, b) => a.year - b.year)
                break
            case "price-low":
                sorted.sort((a, b) => a.price - b.price)
                break
            case "price-high":
                sorted.sort((a, b) => b.price - a.price)
                break
            case "mileage-low":
                sorted.sort((a, b) => a.mileage - b.mileage)
                break
        }
        return sorted
    }, [vehicles, searchTerm, brandFilter, sortBy])

    const paginationData = useMemo(() => {
        const totalPages = Math.max(1, Math.ceil(filteredVehicles.length / vehiclesPerPage))
        const safePage = Math.min(currentPage, totalPages)
        const startIndex = (safePage - 1) * vehiclesPerPage
        const endIndex = startIndex + vehiclesPerPage
        const current = filteredVehicles.slice(startIndex, endIndex)
        return { totalPages, startIndex, endIndex, current }
    }, [filteredVehicles, currentPage, vehiclesPerPage])

    useEffect(() => {
        setCurrentPage(1)
    }, [searchTerm, brandFilter, sortBy, vehiclesPerPage])

    if (loading) return <Loader text="Cargando vehículos..." fullPage />
    if (!user) return null

    return (
        <div className="min-h-screen bg-gradient-to-br from-red-50/30 via-slate-50 to-slate-100">
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {error && (
                    <div className="mb-6 p-4 bg-red-50/80 backdrop-blur-sm border border-red-200 rounded-lg shadow-sm">
                        <p className="text-red-600">{error}</p>
                        <div className="flex gap-2 mt-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setError(null)}
                                className="border-red-200 text-red-700 hover:bg-red-50"
                            >
                                Cerrar
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={loadVehicles}
                                className="border-slate-200 text-slate-700 hover:bg-slate-50"
                            >
                                Reintentar
                            </Button>
                        </div>
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

                {/* Buscador + filtros */}
                <Card className="mb-6 sm:mb-8 bg-white/80 backdrop-blur-sm border-slate-200 shadow-sm">
                    <CardHeader className="pb-3 sm:pb-4">
                        <div className="flex items-center justify-between">
                            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl text-black">
                                Buscar
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
                        <div className="flex flex-col gap-3">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
                                <Input
                                    placeholder="Buscar marca, modelo o año..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10 border-slate-200 focus:border-slate-400 focus:ring-slate-400"
                                />
                            </div>

                            <div className="flex flex-col sm:flex-row gap-3">
                                <Select value={brandFilter} onValueChange={setBrandFilter}>
                                    <SelectTrigger className="sm:w-48 border-slate-200">
                                        <SelectValue placeholder="Marca" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Todas las marcas</SelectItem>
                                        {brands.map((b) => (
                                            <SelectItem key={b} value={b}>{b}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                <Select value={sortBy} onValueChange={(v: SortKey) => setSortBy(v)}>
                                    <SelectTrigger className="sm:w-56 border-slate-200">
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

                                <div className="sm:ml-auto">
                                    <Button
                                        onClick={() => setShowForm(true)}
                                        className="w-full sm:w-auto bg-red-700 hover:bg-red-800 cursor-pointer"
                                    >
                                        <Plus className="h-4 w-4 mr-2" />
                                        Agregar Vehículo
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {filteredVehicles.length > 0 && (
                    <div className="flex items-center gap-2 mb-6">
                        <span className="text-sm text-slate-600">Mostrar:</span>
                        <Select value={vehiclesPerPage.toString()} onValueChange={(v) => setVehiclesPerPage(Number(v))}>
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

                {/* Lista */}
                <div className="grid gap-6">
                    {filteredVehicles.length === 0 ? (
                        <Card className="bg-white/80 backdrop-blur-sm border-slate-200 shadow-sm">
                            <CardContent className="text-center py-12">
                                <Car className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                                <h3 className="text-lg sm:text-xl font-medium text-slate-900 mb-2">No hay vehículos</h3>
                                <p className="text-slate-600 mb-4">Agregá tu primer vehículo al inventario.</p>
                                <Button
                                    onClick={() => setShowForm(true)}
                                    className="bg-red-700 hover:bg-red-800 cursor-pointer"
                                >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Agregar Vehículo
                                </Button>
                            </CardContent>
                        </Card>
                    ) : (
                        paginationData.current.map((vehicle) => (
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

                                        <div className="flex-1">
                                            <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4">
                                                <div>
                                                    <h3 className="text-lg sm:text-xl font-bold text-black">
                                                        {vehicle.brand} {vehicle.model} {vehicle.year}
                                                    </h3>
                                                    <p className="text-xl sm:text-2xl font-bold text-black">
                                                        {vehicle.currency} {vehicle.price.toLocaleString()}
                                                    </p>
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
                                                    <p className="text-sm text-slate-600">Motor</p>
                                                    <p className="font-medium text-slate-800">{vehicle.motor}</p>
                                                </div>
                                            </div>

                                            <div className="mb-4">
                                                <p className="text-sm text-slate-600 mb-1">Contacto</p>
                                                <p className="font-medium text-slate-800">
                                                    {vehicle.contactName}
                                                </p>
                                                <p className="font-medium text-slate-800">
                                                    {vehicle.contactPhone}
                                                </p>
                                            </div>

                                            <div className="flex flex-col sm:flex-row gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleTogglePublic(vehicle)}
                                                    className="w-full sm:w-auto border-slate-200 text-slate-700 hover:bg-slate-50 cursor-pointer"
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
                                                    className="w-full sm:w-auto border-slate-200 text-slate-700 hover:bg-slate-50 cursor-pointer"
                                                >
                                                    <Edit className="h-4 w-4 mr-2" />
                                                    Editar
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleDelete(vehicle.id)}
                                                    className="w-full sm:w-auto text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 cursor-pointer"
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

                {/* Paginación */}
                {filteredVehicles.length > 0 && paginationData.totalPages > 1 && (
                    <div className="flex flex-col sm:flex-row items-center justify-between mt-8 gap-4">
                        <div className="text-sm text-slate-600">
                            Mostrando {paginationData.startIndex + 1} -{" "}
                            {Math.min(paginationData.endIndex, filteredVehicles.length)} de {filteredVehicles.length} vehículos
                        </div>

                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                disabled={Math.min(currentPage, paginationData.totalPages) === 1}
                                className="border-slate-300"
                            >
                                <ChevronLeft className="h-4 w-4" />
                                Anterior
                            </Button>

                            <div className="flex items-center gap-1">
                                {Array.from({ length: paginationData.totalPages }, (_, i) => i + 1).map((page) => (
                                    <Button
                                        key={page}
                                        variant={Math.min(currentPage, paginationData.totalPages) === page ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => setCurrentPage(page)}
                                        className={`w-10 ${Math.min(currentPage, paginationData.totalPages) === page ? "bg-slate-800 text-white" : "border-slate-300 hover:bg-slate-50"}`}
                                    >
                                        {page}
                                    </Button>
                                ))}
                            </div>

                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage((p) => Math.min(paginationData.totalPages, p + 1))}
                                disabled={Math.min(currentPage, paginationData.totalPages) === paginationData.totalPages}
                                className="border-slate-300"
                            >
                                Siguiente
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                )}
            </main>

            {/* Modal (carga perezosa) */}
            {showForm && <VehicleForm vehicle={editingVehicle} onClose={handleFormClose} />}
        </div>
    )
}
