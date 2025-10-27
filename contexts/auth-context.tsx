"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { authService, type UserProfile } from "@/lib/auth"

interface AuthContextType {
  user: UserProfile | null
  isAuthenticated: boolean
  isLoading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, name: string, role: UserProfile["role"]) => Promise<void>
  signOut: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const init = async () => {
      try {
        const currentUser = await authService.getCurrentUser()
        setUser(currentUser)
      } finally {
        setIsLoading(false)
      }
    }
    init()

    const { data: listener } = authService.supabase.auth.onAuthStateChange(async () => {
      const currentUser = await authService.getCurrentUser()
      setUser(currentUser)
    })

    return () => {
      listener.subscription.unsubscribe()
    }
  }, [])

  const signIn = async (email: string, password: string) => {
    await authService.signIn(email, password)
    const currentUser = await authService.getCurrentUser()
    setUser(currentUser)
  }

  const signUp = async (email: string, password: string, name: string, role: UserProfile["role"]) => {
    await authService.signUp(email, password, name, role)
    const currentUser = await authService.getCurrentUser()
    setUser(currentUser)
  }

  const signOut = async () => {
    await authService.signOut()
    setUser(null)
  }

  const refreshUser = async () => {
    const currentUser = await authService.getCurrentUser()
    setUser(currentUser)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        signIn,
        signUp,
        signOut,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
