// app/api/vehicle/[id]/route.ts
import { type NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Vehicle from "@/models/Vehicle";
import { verifyToken } from "@/lib/jwt";
import mongoose from "mongoose";
import { revalidateTag } from "next/cache";

type VehicleLean = {
  _id: mongoose.Types.ObjectId;
  // 🔽 incluí los campos que devolvés
  brand: string; model: string; year: number; price: number;
  currency?: "ARS" | "USD";
  mileage: number; fuelType: string; transmission: string;
  motor?: string; color?: string; images: string[];
  showPrice?: boolean; description?: string;
  contactName?: string; contactPhone?: string; contactEmail?: string;
  isPublic?: boolean;
  createdAt?: Date; updatedAt?: Date;
};

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectToDatabase();
    const v = await Vehicle.findById(params.id).lean<VehicleLean | null>();
    if (!v || !v.isPublic) return NextResponse.json({ error: "Vehicle not found" }, { status: 404 });
    const { _id, ...rest } = v;
    return NextResponse.json({ ...rest, id: String(_id) });
  } catch (e) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = req.cookies.get("token")?.value;
    if (!token || !verifyToken(token)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectToDatabase();
    const updates = await req.json();

    const v = await Vehicle
      .findByIdAndUpdate(params.id, updates, { new: true, runValidators: true })
      .lean<VehicleLean | null>();                 // ✅ tipado correcto

    if (!v) return NextResponse.json({ error: "Vehicle not found" }, { status: 404 });

    const { _id, ...rest } = v;                   // ✅ ahora _id existe
    revalidateTag("vehicles");
    return NextResponse.json({ ...rest, id: String(_id) });
  } catch (e) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = req.cookies.get("token")?.value;
    if (!token || !verifyToken(token)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectToDatabase();
    const v = await Vehicle.findByIdAndDelete(params.id);
    if (!v) return NextResponse.json({ error: "Vehicle not found" }, { status: 404 });

    revalidateTag("vehicles");
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
