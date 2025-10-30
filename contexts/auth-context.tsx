"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { authService, type UserProfile, type UserRole } from "@/lib/auth"

interface AuthContextType {
  user: UserProfile | null
  isAuthenticated: boolean
  isLoading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, name: string, role: UserProfile["role"]) => Promise<void>
  signInWithGoogle: (role: UserRole) => Promise<void>
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
    const user = await authService.signIn(email, password)
    // Update user immediately for faster response
    if (user) {
      setUser(user)
    }
    // onAuthStateChange listener will also handle user update
  }

  const signUp = async (email: string, password: string, name: string, role: UserProfile["role"]) => {
    const newUser = await authService.signUp(email, password, name, role)
    // Update user immediately if returned
    if (newUser) {
      setUser(newUser)
    }
    // onAuthStateChange listener will also handle user update
  }

  const signInWithGoogle = async (role: UserRole) => {
    await authService.signInWithGoogle(role)
    // OAuth redirect will handle the rest
  }

  const signOut = async () => {
    console.log("Signing out...")
    try {
      await authService.signOut()
      setUser(null)
      console.log("Sign out successful")
    } catch (error) {
      console.error("Sign out error:", error)
      // Clear user state even if signOut fails
      setUser(null)
      throw error
    }
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
        signInWithGoogle,
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
