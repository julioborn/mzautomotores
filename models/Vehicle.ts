import mongoose from "mongoose"

const VehicleSchema = new mongoose.Schema(
  {
    brand: {
      type: String,
      required: true,
    },
    model: {
      type: String,
      required: true,
    },
    year: {
      type: Number,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      required: true,
      enum: ["USD", "ARS"],
      default: "USD",
    },
    mileage: {
      type: Number,
      required: true,
    },
    fuelType: {
      type: String,
      required: true,
      enum: ["Nafta", "Diesel", "Híbrido", "Eléctrico", "GNC"],
    },
    transmission: {
      type: String,
      required: true,
      enum: ["Manual", "Automática"],
    },
    color: {
      type: String,
      required: true,
    },
    motor: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: false,
      default: "",
    },
    images: [
      {
        type: String,
      },
    ],
    contactName: {
      type: String,
      required: true,
    },
    contactPhone: {
      type: String,
      required: true,
    },
    contactEmail: {
      type: String,
      required: true,
    },
    isPublic: {
      type: Boolean,
      default: false,
    },
    showPrice: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
)

// al final del schema, antes de export
// models/Vehicle.ts
VehicleSchema.index({ createdAt: -1 });
VehicleSchema.index({ isPublic: 1, createdAt: -1 });
VehicleSchema.index({ brand: 1 });
VehicleSchema.index({ fuelType: 1 });
VehicleSchema.index({ transmission: 1 });

export default mongoose.models.Vehicle || mongoose.model("Vehicle", VehicleSchema)
