import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import Vehicle from "@/models/Vehicle"
import { verifyToken } from "@/lib/jwt"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectToDatabase()

    const { id } = await params
    const vehicle = await Vehicle.findById(id)

    if (!vehicle) {
      return NextResponse.json({ error: "Vehicle not found" }, { status: 404 })
    }

    // Only return public vehicles
    if (!vehicle.isPublic) {
      return NextResponse.json({ error: "Vehicle not found" }, { status: 404 })
    }

    const transformedVehicle = {
      ...vehicle.toObject(),
      id: vehicle._id.toString(),
      _id: undefined,
    }

    return NextResponse.json(transformedVehicle)
  } catch (error) {
    console.error("Get vehicle error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const token = request.cookies.get("token")?.value
    if (!token) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    await connectToDatabase()

    const updates = await request.json()
    const { id } = await params
    const vehicle = await Vehicle.findByIdAndUpdate(id, updates, { new: true, runValidators: true })

    if (!vehicle) {
      return NextResponse.json({ error: "Vehicle not found" }, { status: 404 })
    }

    const transformedVehicle = {
      ...vehicle.toObject(),
      id: vehicle._id.toString(),
      _id: undefined,
    }

    return NextResponse.json(transformedVehicle)
  } catch (error) {
    console.error("Update vehicle error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const token = request.cookies.get("token")?.value
    if (!token) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    await connectToDatabase()

    const { id } = await params
    const vehicle = await Vehicle.findByIdAndDelete(id)

    if (!vehicle) {
      return NextResponse.json({ error: "Vehicle not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Vehicle deleted successfully" })
  } catch (error) {
    console.error("Delete vehicle error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
