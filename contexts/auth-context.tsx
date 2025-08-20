"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState, useCallback, useRef } from "react"
import type { User } from "@/types/vehicle"
import { getCurrentUser, logout as logoutUser } from "@/lib/auth"

interface AuthContextType {
  user: User | null
  login: (user: User) => void
  logout: () => Promise<void>
  isLoading: boolean
  refreshAuth: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const userRef = useRef<User | null>(null)

  useEffect(() => {
    userRef.current = user
  }, [user])

  const checkAuth = useCallback(async () => {
    try {
      const currentUser = await getCurrentUser()
      setUser(currentUser)
    } catch (error) {
      console.error("Auth check error:", error)
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const refreshAuth = useCallback(async () => {
    await checkAuth()
  }, [checkAuth])

  useEffect(() => {
    try {
      localStorage.removeItem("auth_user")
      localStorage.removeItem("auth_cache_time")
    } catch (e) {
      // Ignore localStorage errors
    }

    checkAuth()

    const authRefreshInterval = setInterval(
      () => {
        if (userRef.current) {
          checkAuth()
        }
      },
      15 * 60 * 1000, // 15 minutes instead of 10
    )

    return () => clearInterval(authRefreshInterval)
  }, [checkAuth])

  const login = useCallback((user: User) => {
    setUser(user)
  }, [])

  const logout = useCallback(async () => {
    try {
      await logoutUser()
    } catch (error) {
      console.error("Logout error:", error)
    } finally {
      setUser(null)
      try {
        localStorage.removeItem("auth_user")
        localStorage.removeItem("auth_cache_time")
      } catch (e) {
        // Ignore localStorage errors
      }
    }
  }, [])

  return <AuthContext.Provider value={{ user, login, logout, isLoading, refreshAuth }}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
