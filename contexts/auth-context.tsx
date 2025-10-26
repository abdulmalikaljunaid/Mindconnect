"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { authService, type User, type AuthState } from "@/lib/auth"

interface AuthContextType extends AuthState {
  signIn: (email: string, password: string, userType: "user" | "doctor") => Promise<void>
  signUp: (email: string, password: string, name: string, role: "patient" | "doctor" | "companion") => Promise<void>
  signOut: () => Promise<void>
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check for existing user on mount
    const currentUser = authService.getCurrentUser()
    setUser(currentUser)
    setIsLoading(false)
  }, [])

  const signIn = async (email: string, password: string, userType: "user" | "doctor") => {
    const user = await authService.signIn(email, password, userType)
    setUser(user)
  }

  const signUp = async (email: string, password: string, name: string, role: "patient" | "doctor" | "companion") => {
    const user = await authService.signUp(email, password, name, role)
    setUser(user)
  }

  const signOut = async () => {
    await authService.signOut()
    setUser(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        signIn,
        signUp,
        signOut,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
