import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import Vehicle from "@/models/Vehicle"
import { verifyToken } from "@/lib/jwt"
import mongoose from "mongoose"
import { normalizeError } from "@/utils/errors"

// GET
export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const publicOnly = searchParams.get("public") === "true";
    const limit = Number(searchParams.get("limit") ?? 0); // 0 = sin límite

    const query = publicOnly ? { isPublic: true } : {};

    const projection =
      "brand model year price currency mileage fuelType transmission motor images isPublic showPrice createdAt";

    const q = Vehicle.find(query, projection)
      .sort({ createdAt: -1 })
      .lean(); // objetos plain (más rápido)

    if (limit > 0) q.limit(limit);

    const vehicles = await q;

    const transformed = vehicles.map((v: any) => ({
      ...v,
      id: v._id.toString(),
      _id: undefined,
    }));

    return NextResponse.json(transformed);
  } catch (err: unknown) {
    const e = normalizeError(err);
    console.error("Get vehicles error:", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST
export async function POST(request: NextRequest) {
  try {
    console.log("[v0] POST /api/vehicles - Starting request")

    const token = request.cookies.get("token")?.value
    if (!token) {
      console.log("[v0] No token found in cookies")
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    let decoded: unknown
    try {
      decoded = verifyToken(token)
    } catch (e) {
      console.log("[v0] Invalid token")
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

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

    const transformed = { ...vehicle.toObject(), id: vehicle._id.toString(), _id: undefined }
    return NextResponse.json(transformed, { status: 201 })
  } catch (err: unknown) {
    const e = normalizeError(err)
    console.error("[v0] Create vehicle error details:", e)

    // Validación de Mongoose
    if (err instanceof mongoose.Error.ValidationError) {
      return NextResponse.json(
        { error: "Validation error", details: err.message },
        { status: 400 },
      )
    }

    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
