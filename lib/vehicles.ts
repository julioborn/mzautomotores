import type { Vehicle } from "@/types/vehicle"

export const getVehicles = async (): Promise<Vehicle[]> => {
  try {
    const response = await fetch("/api/vehicles")
    if (!response.ok) throw new Error("Failed to fetch vehicles")
    return await response.json()
  } catch (error) {
    console.error("Error fetching vehicles:", error)
    return []
  }
}

export const addVehicle = async (vehicle: Omit<Vehicle, "id" | "createdAt" | "updatedAt">): Promise<Vehicle | null> => {
  try {
    console.log("[v0] Attempting to add vehicle:", vehicle)

    const response = await fetch("/api/vehicles", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(vehicle),
    })

    console.log("[v0] Response status:", response.status)
    console.log("[v0] Response ok:", response.ok)

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: "Unknown error" }))
      console.error("[v0] API Error details:", errorData)
      throw new Error(`Failed to add vehicle: ${errorData.error || response.statusText}`)
    }

    const result = await response.json()
    console.log("[v0] Vehicle added successfully:", result)
    return result
  } catch (error) {
    console.error("Error adding vehicle:", error)
    return null
  }
}

export const updateVehicle = async (id: string, updates: Partial<Vehicle>): Promise<Vehicle | null> => {
  try {
    console.log("[v0] Updating vehicle with ID:", id)
    console.log("[v0] ID type:", typeof id)
    console.log("[v0] Updates:", updates)

    const response = await fetch(`/api/vehicles/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updates),
    })

    if (!response.ok) throw new Error("Failed to update vehicle")
    return await response.json()
  } catch (error) {
    console.error("Error updating vehicle:", error)
    return null
  }
}

export const deleteVehicle = async (id: string): Promise<boolean> => {
  try {
    const response = await fetch(`/api/vehicles/${id}`, {
      method: "DELETE",
    })

    return response.ok
  } catch (error) {
    console.error("Error deleting vehicle:", error)
    return false
  }
}

export const getPublicVehicles = async (): Promise<Vehicle[]> => {
  try {
    const response = await fetch("/api/vehicles?public=true")
    if (!response.ok) throw new Error("Failed to fetch public vehicles")
    return await response.json()
  } catch (error) {
    console.error("Error fetching public vehicles:", error)
    return []
  }
}

export const getVehicleById = async (id: string): Promise<Vehicle | null> => {
  try {
    const response = await fetch(`/api/vehicles/${id}`)
    if (!response.ok) {
      if (response.status === 404) {
        return null
      }
      throw new Error("Failed to fetch vehicle")
    }
    return await response.json()
  } catch (error) {
    console.error("Error fetching vehicle by ID:", error)
    return null
  }
}
