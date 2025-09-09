import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import Vehicle from "@/models/Vehicle"
import { verifyToken } from "@/lib/jwt"
import mongoose from "mongoose"
import { normalizeError } from "@/utils/errors"

// GET (con paginado + payload chico opcional)
export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);

    const publicOnly = searchParams.get("public") === "true";

    // 🔢 paginado
    const rawOffset = Number(searchParams.get("offset") ?? 0);
    const rawLimit = Number(searchParams.get("limit") ?? 24);
    const offset = Number.isFinite(rawOffset) && rawOffset >= 0 ? rawOffset : 0;
    const limitCap = 100;
    const limit = Number.isFinite(rawLimit) && rawLimit > 0 ? Math.min(rawLimit, limitCap) : 24;

    // 🪶 modo liviano (solo primera imagen)
    const lightweight = searchParams.get("light") === "1" || searchParams.get("lightweight") === "1";

    const query = publicOnly ? { isPublic: true } : {};

    // 🧾 proyección
    const projection = [
      "brand",
      "model",
      "year",
      "price",
      "currency",
      "mileage",
      "fuelType",
      "transmission",
      "motor",
      "images",
      "isPublic",
      "showPrice",
      "color",
      "description",
      "contactName",
      "contactPhone",
      "contactEmail",
      "createdAt",
      "updatedAt",
    ].join(" ");

    // 🏃 consulta principal
    const vehicles = await Vehicle.find(query, projection)
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit)
      .lean();

    // 🔢 hasMore
    const nextOne = await Vehicle.find(query, "_id")
      .sort({ createdAt: -1 })
      .skip(offset + limit)
      .limit(1)
      .lean();
    const hasMore = nextOne.length > 0;
    const nextOffset = hasMore ? offset + limit : null;

    // 🧼 transformación (id plano + light images)
    const items = vehicles.map((v: any) => {
      const { _id, images, ...rest } = v;
      return {
        ...rest,
        id: String(_id),
        images: lightweight
          ? (Array.isArray(images) ? [images[0]].filter(Boolean) : [])
          : (images ?? []),
      };
    });

    return NextResponse.json(
      { items, hasMore, nextOffset },
      {
        headers: {
          // 🚫 sin caché en ningún lado
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
          Pragma: "no-cache",
          Expires: "0",
          "Surrogate-Control": "no-store",
        },
      }
    );
  } catch (err: unknown) {
    const e = normalizeError(err);
    console.error("Get vehicles error:", e);
    return NextResponse.json(
      { error: "Internal server error" },
      {
        status: 500,
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
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
