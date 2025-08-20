export interface Vehicle {
  id: string
  brand: string
  model: string
  year: number
  price: number
  currency: "USD" | "ARS"
  mileage: number
  fuelType: "Nafta" | "Diesel" | "Híbrido" | "Eléctrico"
  transmission: "Manual" | "Automática"
  color: string
  motor: string
  description: string
  images: string[]
  contactName: string
  contactPhone: string
  contactEmail: string
  isPublic: boolean
  showPrice: boolean
  createdAt: string
  updatedAt: string
}

export interface User {
  id: string
  username: string
  password: string
  role: "admin"
}
