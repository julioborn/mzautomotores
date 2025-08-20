import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import Vehicle from "@/models/Vehicle"
import { verifyToken } from "@/lib/jwt"

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase()

    const { searchParams } = new URL(request.url)
    const publicOnly = searchParams.get("public") === "true"

    let query = {}
    if (publicOnly) {
      query = { isPublic: true }
    }

    const vehicles = await Vehicle.find(query).sort({ createdAt: -1 })

    const transformedVehicles = vehicles.map((vehicle) => ({
      ...vehicle.toObject(),
      id: vehicle._id.toString(),
      _id: undefined,
    }))

    return NextResponse.json(transformedVehicles)
  } catch (error) {
    console.error("Get vehicles error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log("[v0] POST /api/vehicles - Starting request")

    const token = request.cookies.get("token")?.value
    if (!token) {
      console.log("[v0] No token found in cookies")
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      console.log("[v0] Invalid token")
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    console.log("[v0] User authenticated:", decoded.userId)

    await connectToDatabase()
    console.log("[v0] Connected to database")

    const vehicleData = await request.json()
    console.log("[v0] Vehicle data received:", vehicleData)

    if (!vehicleData.brand || !vehicleData.model || !vehicleData.year) {
      console.log("[v0] Missing required fields")
      return NextResponse.json({ error: "Missing required fields: brand, model, year" }, { status: 400 })
    }

    const vehicle = new Vehicle(vehicleData)
    console.log("[v0] Vehicle model created, attempting to save...")

    await vehicle.save()
    console.log("[v0] Vehicle saved successfully:", vehicle._id)

    const transformedVehicle = {
      ...vehicle.toObject(),
      id: vehicle._id.toString(),
      _id: undefined,
    }

    return NextResponse.json(transformedVehicle, { status: 201 })
  } catch (error) {
    console.error("[v0] Create vehicle error details:", {
      message: error.message,
      stack: error.stack,
      name: error.name,
    })

    if (error.name === "ValidationError") {
      return NextResponse.json(
        {
          error: "Validation error",
          details: error.message,
        },
        { status: 400 },
      )
    }

    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
