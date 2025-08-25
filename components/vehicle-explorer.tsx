"use client"

import { useState, useEffect, useMemo, useCallback, useDeferredValue, ComponentType } from "react"
import dynamic from "next/dynamic"
import { getPublicVehicles } from "@/lib/vehicles"
import type { Vehicle } from "@/types/vehicle"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Car, Search, MessageCircle, Menu, X, ChevronLeft, ChevronRight, Phone } from "lucide-react"
import { VehicleCardProps } from "./vehicle-card"

type SortKey = "newest" | "oldest" | "price-low" | "price-high" | "mileage-low"

const VehicleCard = dynamic<VehicleCardProps>(
    () => import("@/components/vehicle-card").then((m) => m.default),
    { loading: () => <div className="h-64 rounded-lg bg-slate-100 animate-pulse" /> }
)

type Props = {
    /** Opcional: pasar vehículos pre-renderizados desde el servidor para evitar el fetch en el cliente */
    initialVehicles?: Vehicle[]
}

export function VehicleExplorer({ initialVehicles }: Props) {
    // ---------------- data ----------------
    const [vehicles, setVehicles] = useState<Vehicle[]>(initialVehicles ?? [])
    const [loading, setLoading] = useState(!initialVehicles)
    const [error, setError] = useState<string | null>(null)

    // ---------------- ui state ----------------
    const [searchTerm, setSearchTerm] = useState("")
    const [brandFilter, setBrandFilter] = useState("all")
    const [sortBy, setSortBy] = useState<SortKey>("newest")
    const [showFilters, setShowFilters] = useState(true)
    const [currentPage, setCurrentPage] = useState(1)
    const [vehiclesPerPage, setVehiclesPerPage] = useState(6)

    // Debounce de búsqueda (200 ms) + defer para pintar antes y filtrar después
    const [debouncedSearch, setDebouncedSearch] = useState("")
    useEffect(() => {
        const t = setTimeout(() => setDebouncedSearch(searchTerm), 200)
        return () => clearTimeout(t)
    }, [searchTerm])
    const deferredSearch = useDeferredValue(debouncedSearch)

    // ---------------- fetch ----------------
    const fetchVehicles = useCallback(async () => {
        try {
            setLoading(true)
            setError(null)
            const data = await getPublicVehicles()
            setVehicles(Array.isArray(data) ? data : [])
        } catch (err) {
            console.error(err)
            setError("Error al cargar los vehículos")
            setVehicles([])
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        if (!initialVehicles) fetchVehicles()
    }, [fetchVehicles, initialVehicles])

    // ---------------- normalización (una sola vez por cambio de data) ----------------
    const normalized = useMemo(() => {
        return vehicles.map((v) => ({
            ...v,
            _brandLC: (v.brand || "").toLowerCase(),
            _modelLC: (v.model || "").toLowerCase(),
            _yearStr: String(v.year ?? ""),
        }))
    }, [vehicles])

    // ---------------- brands únicas ----------------
    const brands = useMemo(() => {
        const set = new Set<string>()
        for (const v of normalized) if (v.brand) set.add(v.brand)
        return Array.from(set).sort()
    }, [normalized])

    // ---------------- filtro + orden ----------------
    const filteredSorted = useMemo(() => {
        const s = (deferredSearch || "").trim().toLowerCase()
        let arr = normalized

        if (s !== "" || brandFilter !== "all") {
            arr = arr.filter((v) => {
                const matchesSearch =
                    s === "" || v._brandLC.includes(s) || v._modelLC.includes(s) || v._yearStr.includes(s)
                const matchesBrand = brandFilter === "all" || v.brand === brandFilter
                return matchesSearch && matchesBrand
            })
        }

        // Orden
        if (arr.length > 1) {
            const copy = arr.slice()
            switch (sortBy) {
                case "newest":
                    copy.sort((a, b) => (b.year ?? 0) - (a.year ?? 0))
                    break
                case "oldest":
                    copy.sort((a, b) => (a.year ?? 0) - (b.year ?? 0))
                    break
                case "price-low":
                    copy.sort((a, b) => (a.price ?? 0) - (b.price ?? 0))
                    break
                case "price-high":
                    copy.sort((a, b) => (b.price ?? 0) - (a.price ?? 0))
                    break
                case "mileage-low":
                    copy.sort((a, b) => (a.mileage ?? 0) - (b.mileage ?? 0))
                    break
            }
            return copy
        }
        return arr
    }, [normalized, deferredSearch, brandFilter, sortBy])

    // ---------------- paginación ----------------
    const { totalPages, startIndex, endIndex, current } = useMemo(() => {
        const totalPages = Math.max(1, Math.ceil(filteredSorted.length / vehiclesPerPage))
        const safePage = Math.min(Math.max(1, currentPage), totalPages)
        const startIndex = (safePage - 1) * vehiclesPerPage
        const endIndex = startIndex + vehiclesPerPage
        return { totalPages, startIndex, endIndex, current: filteredSorted.slice(startIndex, endIndex) }
    }, [filteredSorted, vehiclesPerPage, currentPage])

    // reset page ante cambios de filtros / lote
    useEffect(() => {
        setCurrentPage(1)
    }, [deferredSearch, brandFilter, sortBy, vehiclesPerPage])

    // ---------------- helpers ----------------
    const hasActiveFilters =
        deferredSearch.trim() !== "" || brandFilter !== "all" || sortBy !== "newest"

    const clearFilters = useCallback(() => {
        setSearchTerm("")
        setBrandFilter("all")
        setSortBy("newest")
    }, [])

    // ---------------- render ----------------
    if (loading) {
        return (
            <div className="flex items-center justify-center py-16">
                <div className="text-center">
                    <Car className="h-12 w-12 text-slate-600 mx-auto mb-4 animate-spin" />
                    <p className="text-gray-600">Cargando vehículos...</p>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <Card className="max-w-md mx-auto bg-white/80 backdrop-blur-sm border-slate-200 shadow-sm">
                <CardContent className="text-center py-8">
                    <Car className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Error al cargar</h3>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <Button onClick={fetchVehicles} className="bg-slate-600 hover:bg-slate-700">
                        Reintentar
                    </Button>
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="space-y-6">
            {/* Resumen */}
            {/* <div className="text-center">
                <Badge variant="secondary" className="text-sm bg-slate-100 text-slate-800 border-slate-200">
                    {vehicles.length} vehículos publicados
                </Badge>
            </div> */}

            {/* Filtros + búsqueda */}
            <Card className="bg-white/80 backdrop-blur-sm border-slate-200 shadow-sm">
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-lg text-black">Buscar</CardTitle>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="sm:hidden text-slate-600 hover:text-slate-800 hover:bg-slate-100"
                            onClick={() => setShowFilters((v) => !v)}
                            aria-expanded={showFilters}
                            aria-controls="filters-panel"
                        >
                            {showFilters ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
                        </Button>
                    </div>
                </CardHeader>

                <CardContent id="filters-panel" className={`${showFilters ? "block" : "hidden"} sm:block`}>
                    <div className="flex flex-col gap-3">
                        {/* Search */}
                        <div className="relative">
                            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
                            <Input
                                placeholder="Buscar marca, modelo o año..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="h-11 pl-10 pr-9 rounded-full border-slate-200 focus:border-slate-400 focus:ring-slate-400"
                                aria-label="Buscar"
                            />
                            {searchTerm && (
                                <button
                                    type="button"
                                    aria-label="Limpiar búsqueda"
                                    onClick={() => setSearchTerm("")}
                                    className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-full p-1 hover:bg-slate-100"
                                >
                                    <X className="h-4 w-4 text-slate-500" />
                                </button>
                            )}
                        </div>

                        {/* Selectores */}
                        <div className="flex flex-col sm:flex-row gap-3">
                            <Select value={brandFilter} onValueChange={setBrandFilter}>
                                <SelectTrigger className="h-11 rounded-full border-slate-200 sm:w-56">
                                    <SelectValue placeholder="Marca" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Todas las marcas</SelectItem>
                                    {brands.map((b) => (
                                        <SelectItem key={b} value={b}>
                                            {b}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <Select value={sortBy} onValueChange={(v: SortKey) => setSortBy(v)}>
                                <SelectTrigger className="h-11 rounded-full border-slate-200 sm:w-56">
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

                            {/* Acciones */}
                            <div className="sm:ml-auto flex items-center gap-2">
                                {hasActiveFilters && (
                                    <Button variant="ghost" size="sm" onClick={clearFilters} className="text-slate-600">
                                        Limpiar filtros
                                    </Button>
                                )}
                                <div className="hidden sm:flex items-center gap-2">
                                    <span className="text-sm text-slate-600">Mostrar:</span>
                                    <Select value={vehiclesPerPage.toString()} onValueChange={(v) => setVehiclesPerPage(Number(v))}>
                                        <SelectTrigger className="w-20 h-10 rounded-full">
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
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Grid / resultados */}
            {current.length === 0 ? (
                <Card className="bg-white/80 backdrop-blur-sm border-slate-200">
                    <CardContent className="text-center py-10">
                        <Car className="h-10 w-10 text-slate-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-slate-800 mb-2">No se encontraron vehículos</h3>
                        <p className="text-slate-600 mb-4 px-4">
                            Ajustá los filtros o contactanos para consultar por vehículos específicos.
                        </p>
                        <Button
                            onClick={() => window.open("https://wa.me/3483529702", "_blank")}
                            className="bg-green-600 hover:bg-green-700"
                        >
                            <MessageCircle className="h-5 w-5 mr-2" />
                            WhatsApp
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {current.map((v) => (
                            <VehicleCard key={v.id} vehicle={v} />
                        ))}
                    </div>

                    {/* Paginación */}
                    {totalPages > 1 && (
                        <div className="flex flex-col sm:flex-row items-center justify-between mt-6 gap-4">
                            <div className="text-sm text-slate-600">
                                Mostrando {startIndex + 1} – {Math.min(endIndex, filteredSorted.length)} de {filteredSorted.length}
                            </div>

                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className="border-slate-300"
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                    Anterior
                                </Button>

                                <div className="flex items-center gap-1">
                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                        <Button
                                            key={page}
                                            variant={currentPage === page ? "default" : "outline"}
                                            size="sm"
                                            onClick={() => setCurrentPage(page)}
                                            className={`w-10 ${currentPage === page ? "bg-slate-800 text-white" : "border-slate-300 hover:bg-slate-50"
                                                }`}
                                        >
                                            {page}
                                        </Button>
                                    ))}
                                </div>

                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                    className="border-slate-300"
                                >
                                    Siguiente
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* “Mostrar” selector en mobile */}
                    <div className="sm:hidden flex items-center justify-center gap-2 mt-4">
                        <span className="text-sm text-slate-600">Mostrar:</span>
                        <Select value={vehiclesPerPage.toString()} onValueChange={(v) => setVehiclesPerPage(Number(v))}>
                            <SelectTrigger className="w-20 h-10 rounded-full">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="3">3</SelectItem>
                                <SelectItem value="6">6</SelectItem>
                                <SelectItem value="9">9</SelectItem>
                                <SelectItem value="12">12</SelectItem>
                            </SelectContent>
                        </Select>
                        <span className="text-sm text-slate-600">/ pág.</span>
                    </div>
                </>
            )}

            {/* CTA (ahora dentro del explorer, solo aparece cuando no loading/error) */}
            <div className="mt-12 sm:mt-16 text-center">
                <Card className="bg-gradient-to-br from-slate-50 to-blue-50 border-slate-200 shadow-sm">
                    <CardContent className="py-6 sm:py-8 px-4 sm:px-6">
                        <h3 className="text-xl sm:text-2xl font-bold text-black mb-3 sm:mb-4">
                            ¿No encontraste lo que buscás?
                        </h3>
                        <p className="text-slate-600 mb-4 sm:mb-6 text-sm sm:text-base">
                            Contactanos y te ayudamos a encontrar el vehículo perfecto.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                            <Button
                                size="lg"
                                onClick={() => window.open("https://wa.me/3483529702", "_blank")}
                                className="bg-green-600 hover:bg-green-700"
                            >
                                <MessageCircle className="h-5 w-5 mr-2" />
                                WhatsApp
                            </Button>
                            <Button
                                size="lg"
                                variant="outline"
                                onClick={() => window.open("tel:+3483529702", "_blank")}
                                className="border-slate-300 text-slate-700 hover:bg-slate-50"
                            >
                                <Phone className="h-5 w-5 mr-2" />
                                Llamar
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
