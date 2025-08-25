import type { Vehicle } from "@/types/vehicle"
import { addVehicle } from "./vehicles"

export const sampleVehicles: Omit<Vehicle, "id" | "createdAt" | "updatedAt">[] = [
  {
    brand: "Toyota",
    model: "Corolla",
    year: 2020,
    price: 18500,
    mileage: 45000,
    fuelType: "Gasolina",
    transmission: "Automática",
    color: "Blanco",
    description: "Excelente estado, un solo dueño, mantenimientos al día. Perfecto para uso diario.",
    images: [],
    contactName: "Carlos Mendoza",
    contactPhone: "+3483529702",
    contactEmail: "carlos@automax.com",
    isPublic: true,
  },
  {
    brand: "Honda",
    model: "Civic",
    year: 2019,
    price: 17200,
    mileage: 52000,
    fuelType: "Gasolina",
    transmission: "Manual",
    color: "Azul",
    description: "Vehículo deportivo en excelentes condiciones, ideal para jóvenes conductores.",
    images: [],
    contactName: "Ana García",
    contactPhone: "+1234567891",
    contactEmail: "ana@automax.com",
    isPublic: true,
  },
  {
    brand: "Ford",
    model: "Focus",
    year: 2021,
    price: 19800,
    mileage: 28000,
    fuelType: "Gasolina",
    transmission: "Automática",
    color: "Rojo",
    description: "Como nuevo, bajo kilometraje, todas las revisiones realizadas en concesionario oficial.",
    images: [],
    contactName: "Miguel Torres",
    contactPhone: "+1234567892",
    contactEmail: "miguel@automax.com",
    isPublic: true,
  },
  {
    brand: "Nissan",
    model: "Sentra",
    year: 2018,
    price: 15500,
    mileage: 68000,
    fuelType: "Gasolina",
    transmission: "Automática",
    color: "Gris",
    description: "Muy económico, perfecto para trabajo o uso familiar. Llantas nuevas.",
    images: [],
    contactName: "Laura Jiménez",
    contactPhone: "+1234567893",
    contactEmail: "laura@automax.com",
    isPublic: false,
  },
  {
    brand: "Hyundai",
    model: "Elantra",
    year: 2022,
    price: 22000,
    mileage: 15000,
    fuelType: "Híbrido",
    transmission: "Automática",
    color: "Negro",
    description: "Tecnología híbrida, muy bajo consumo, garantía vigente hasta 2027.",
    images: [],
    contactName: "Roberto Silva",
    contactPhone: "+1234567894",
    contactEmail: "roberto@automax.com",
    isPublic: true,
  },
]

export function loadSampleData() {
  if (typeof window === "undefined") return

  // Check if sample data already exists
  const existingVehicles = localStorage.getItem("dealership_vehicles")
  if (existingVehicles && JSON.parse(existingVehicles).length > 0) {
    return // Don't load sample data if vehicles already exist
  }

  // Add sample vehicles
  sampleVehicles.forEach((vehicle) => {
    addVehicle(vehicle)
  })
}
