import { NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import Vehicle from "@/models/Vehicle"

export async function POST() {
  try {
    await connectDB()

    // Buscar todos los vehículos con fuelType "Gasolina"
    const vehiclesWithGasolina = await Vehicle.find({ fuelType: "Gasolina" })

    if (vehiclesWithGasolina.length === 0) {
      return NextResponse.json({
        message: "No se encontraron vehículos con 'Gasolina' para migrar",
        migrated: 0,
      })
    }

    // Actualizar todos los vehículos de "Gasolina" a "Nafta"
    const result = await Vehicle.updateMany({ fuelType: "Gasolina" }, { $set: { fuelType: "Nafta" } })

    // Verificar la migración
    const remainingGasolina = await Vehicle.countDocuments({ fuelType: "Gasolina" })
    const naftaCount = await Vehicle.countDocuments({ fuelType: "Nafta" })

    return NextResponse.json({
      message: "Migración completada exitosamente",
      migrated: result.modifiedCount,
      remainingGasolina,
      totalNafta: naftaCount,
    })
  } catch (error) {
    console.error("Error en migración:", error)
    return NextResponse.json({ error: "Error al ejecutar la migración" }, { status: 500 })
  }
}
