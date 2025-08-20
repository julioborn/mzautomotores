import type { User } from "@/types/vehicle"

export const authenticateUser = async (username: string, password: string): Promise<User | null> => {
  try {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    })

    if (!response.ok) {
      return null
    }

    const data = await response.json()
    return data.user
  } catch (error) {
    console.error("Authentication error:", error)
    return null
  }
}

export const getCurrentUser = async (): Promise<User | null> => {
  try {
    const response = await fetch("/api/auth/me")
    if (!response.ok) return null

    const data = await response.json()
    return data.user
  } catch (error) {
    console.error("Get current user error:", error)
    return null
  }
}

export const logout = async (): Promise<void> => {
  try {
    await fetch("/api/auth/logout", {
      method: "POST",
    })
  } catch (error) {
    console.error("Logout error:", error)
  }
}

// These functions are no longer needed with JWT authentication
export const setCurrentUser = (user: User | null): void => {
  // JWT handles user state via HTTP-only cookies
}
