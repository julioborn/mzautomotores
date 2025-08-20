import { MongoClient } from "mongodb"

const MONGODB_URI = process.env.MONGODB_URI

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable")
}

async function migrateGasolinaToNafta() {
  const client = new MongoClient(MONGODB_URI)

  try {
    await client.connect()
    console.log("[v0] Conectado a MongoDB")

    const db = client.db()
    const collection = db.collection("vehicles")

    // Buscar todos los vehículos que tengan fuelType: "Gasolina"
    const vehiclesWithGasolina = await collection.find({ fuelType: "Gasolina" }).toArray()
    console.log(`[v0] Encontrados ${vehiclesWithGasolina.length} vehículos con "Gasolina"`)

    if (vehiclesWithGasolina.length > 0) {
      // Actualizar todos los vehículos de "Gasolina" a "Nafta"
      const result = await collection.updateMany({ fuelType: "Gasolina" }, { $set: { fuelType: "Nafta" } })

      console.log(`[v0] Actualizados ${result.modifiedCount} vehículos de "Gasolina" a "Nafta"`)
    } else {
      console.log('[v0] No se encontraron vehículos con "Gasolina" para actualizar')
    }

    // Verificar la migración
    const vehiclesWithNafta = await collection.find({ fuelType: "Nafta" }).toArray()
    console.log(`[v0] Total de vehículos con "Nafta": ${vehiclesWithNafta.length}`)
  } catch (error) {
    console.error("[v0] Error durante la migración:", error)
  } finally {
    await client.close()
    console.log("[v0] Conexión cerrada")
  }
}

// Ejecutar la migración
migrateGasolinaToNafta()
