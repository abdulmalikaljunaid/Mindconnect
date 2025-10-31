"use client"

import { createContext, useContext, useEffect, useState, useRef, type ReactNode } from "react"
import { authService, type UserProfile, type UserRole } from "@/lib/auth"

interface AuthContextType {
  user: UserProfile | null
  isAuthenticated: boolean
  isLoading: boolean
  signIn: (email: string, password: string) => Promise<UserProfile>
  signUp: (email: string, password: string, name: string, role: UserProfile["role"]) => Promise<UserProfile>
  signInWithGoogle: (role: UserRole, redirectUrl?: string) => Promise<void>
  signOut: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const initCompleteRef = useRef(false)

  useEffect(() => {
    if (initCompleteRef.current) return

    const init = async () => {
      try {
        const currentUser = await authService.getCurrentUser()
        setUser(currentUser)
      } catch (error) {
        console.error("Failed to initialize auth:", error)
        setUser(null)
      } finally {
        setIsLoading(false)
        initCompleteRef.current = true
      }
    }

    init()

    // Listen for auth state changes - handle all important events including token refresh
    const { data: { subscription } } = authService.supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, { hasSession: !!session })

      if (event === "SIGNED_OUT" || !session) {
        setUser(null)
        return
      }

      // Handle sign in
      if (event === "SIGNED_IN" && session?.user) {
        try {
          const currentUser = await authService.getCurrentUser()
          setUser(currentUser)
        } catch (error) {
          console.error("Failed to fetch user after sign in:", error)
          setUser(null)
        }
        return
      }

      // Handle token refresh - critical for maintaining session after ~1 minute
      if (event === "TOKEN_REFRESHED" && session?.user) {
        try {
          // Token was refreshed successfully, ensure user state is up to date
          const currentUser = await authService.getCurrentUser()
          if (currentUser) {
            setUser(currentUser)
          }
        } catch (error) {
          console.error("Failed to refresh user after token refresh:", error)
          // Don't clear user on token refresh error, token was refreshed successfully
        }
        return
      }

      // Handle initial session - update user if we have a session but no user state
      if (event === "INITIAL_SESSION" && session?.user) {
        try {
          const currentUser = await authService.getCurrentUser()
          setUser(currentUser)
        } catch (error) {
          console.error("Failed to fetch user on initial session:", error)
          setUser(null)
        }
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, []) // Empty deps - only run once on mount

  const signIn = async (email: string, password: string): Promise<UserProfile> => {
    try {
      const signedInUser = await authService.signIn(email, password)
      
      if (!signedInUser) {
        throw new Error("فشل تسجيل الدخول")
      }

      // Update user state immediately
      setUser(signedInUser)
      
      return signedInUser
    } catch (error) {
      console.error("Sign in error:", error)
      throw error
    }
  }

  const signUp = async (email: string, password: string, name: string, role: UserProfile["role"]): Promise<UserProfile> => {
    try {
      const newUser = await authService.signUp(email, password, name, role)
      
      if (!newUser) {
        throw new Error("فشل إنشاء الحساب")
      }

      // Update user state immediately
      setUser(newUser)
      
      return newUser
    } catch (error) {
      console.error("Sign up error:", error)
      throw error
    }
  }

  const signInWithGoogle = async (role: UserRole, redirectUrl?: string) => {
    await authService.signInWithGoogle(role, redirectUrl)
    // OAuth redirect will handle the rest
  }

  const signOut = async () => {
    try {
      await authService.signOut()
      setUser(null)
    } catch (error) {
      console.error("Sign out error:", error)
      setUser(null)
    }
  }

  const refreshUser = async () => {
    try {
      const currentUser = await authService.getCurrentUser()
      setUser(currentUser)
    } catch (error) {
      console.error("Failed to refresh user:", error)
      setUser(null)
    }
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
