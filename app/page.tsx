// app/page.tsx  (⚠️ quita "use client")
import { connectToDatabase } from "@/lib/mongodb";
import Vehicle from "@/models/Vehicle";
import { VehicleExplorer } from "@/components/vehicle-explorer";

export default async function HomePage() {
  await connectToDatabase();

  const projection =
    "brand model year price currency mileage fuelType transmission motor images isPublic showPrice createdAt";
  const raw = await Vehicle.find({ isPublic: true }, projection)
    .sort({ createdAt: -1 })
    .limit(12)       // pinta rápido (puedes subir o bajar)
    .lean();

  const initialVehicles = raw.map((v: any) => ({
    ...v,
    id: v._id.toString(),
    _id: undefined,
  }));

  return (
    <div className="min-h-screen bg-gray-100">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        <VehicleExplorer initialVehicles={initialVehicles} />
      </main>
    </div>
  );
}
