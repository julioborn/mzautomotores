// app/vehicle/[id]/page.tsx
import { notFound } from "next/navigation";
import { unstable_cache } from "next/cache";
import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/mongodb";
import Vehicle from "@/models/Vehicle";
import VehicleClient from "./vehicle-client";

type VehicleLean = {
  _id: mongoose.Types.ObjectId;
  brand: string; model: string; year: number; price: number;
  currency?: "ARS" | "USD";
  mileage: number; fuelType: string; transmission: string;
  motor?: string; color?: string; images: string[];
  showPrice?: boolean; description?: string;
  contactName?: string; contactPhone?: string; contactEmail?: string;
  createdAt?: Date;
};

type VehiclePlain = {
  id: string;
  brand: string; model: string; year: number; price: number;
  currency?: "ARS" | "USD";
  mileage: number; fuelType: string; transmission: string;
  motor?: string | null; color?: string | null; images: string[];
  showPrice?: boolean; description?: string | null;
  contactName?: string | null; contactPhone?: string | null; contactEmail?: string | null;
  createdAt?: string | null;
};

function serialize(doc: VehicleLean): VehiclePlain {
  return {
    id: String(doc._id),
    brand: doc.brand,
    model: doc.model,
    year: doc.year,
    price: doc.price,
    currency: doc.currency,
    mileage: doc.mileage,
    fuelType: doc.fuelType,
    transmission: doc.transmission,
    motor: doc.motor ?? null,
    color: doc.color ?? null,
    images: Array.isArray(doc.images) ? doc.images.filter(Boolean) : [],
    showPrice: doc.showPrice,
    description: doc.description ?? null,
    contactName: doc.contactName ?? null,
    contactPhone: doc.contactPhone ?? null,
    contactEmail: doc.contactEmail ?? null,
    createdAt: doc.createdAt ? doc.createdAt.toISOString() : null,
  };
}

// 👇 keyParts debe ser un array *estático*.
// Los argumentos (id) van a la función devuelta.
const getVehicleCached = unstable_cache(
  async (id: string) => {
    await connectToDatabase();
    const projection = [
      "brand", "model", "year", "price", "currency",
      "mileage", "fuelType", "transmission", "motor", "color",
      "images", "showPrice", "description",
      "contactName", "contactPhone", "contactEmail", "createdAt",
    ].join(" ");

    const doc = await Vehicle.findById(id, projection).lean<VehicleLean | null>();
    return doc ? serialize(doc) : null;
  },
  ["vehicle-by-id"],                  // ✅ keyParts fijas
  { revalidate: 60, tags: ["vehicles"] }
);

export default async function VehiclePage({ params }: { params: { id: string } }) {
  const vehicle = await getVehicleCached(params.id);
  if (!vehicle) return notFound();

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50/30 via-slate-50 to-slate-100">
      <div className="container mx-auto px-4 py-6 sm:py-8 max-w-4xl">
        <VehicleClient vehicle={vehicle as any} />
      </div>
    </div>
  );
}
