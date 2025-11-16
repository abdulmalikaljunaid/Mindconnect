"use client"

import { createContext, useContext, useEffect, useState, useRef, type ReactNode } from "react"
import { authService, type UserProfile, type UserRole } from "@/lib/auth"
import { useSessionRefresh } from "@/hooks/use-session-refresh"

interface AuthContextType {
  user: UserProfile | null
  isAuthenticated: boolean
  isLoading: boolean
  signIn: (email: string, password: string) => Promise<UserProfile>
  signUp: (email: string, password: string, name: string, role: UserProfile["role"]) => Promise<UserProfile>
  signInWithGoogle: (role: UserRole) => Promise<void>
  signOut: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const initCompleteRef = useRef(false)
  
  // Enable automatic session refresh to prevent session expiry
  useSessionRefresh()

  useEffect(() => {
    const init = async () => {
      // Prevent multiple initializations
      if (initCompleteRef.current) return
      
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

    // Listen for auth state changes
    const { data: listener } = authService.supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, session ? "Session exists" : "No session")
      
      if (event === "SIGNED_OUT" || !session) {
        setUser(null)
        return
      }

      // Handle token refresh - ensure session is still valid
      if (event === "TOKEN_REFRESHED") {
        try {
          // Verify the refreshed session is still valid
          const currentUser = await authService.getCurrentUser()
          if (currentUser) {
            // Session is valid, keep user state
            setUser(currentUser)
          } else {
            // Session refresh failed, clear user
            setUser(null)
          }
        } catch (error) {
          console.error("Failed to verify user after token refresh:", error)
          // Don't clear user on refresh error - might be temporary network issue
        }
        return
      }

      // Handle sign in/up events
      if (event === "SIGNED_IN" || event === "USER_UPDATED") {
        try {
          const currentUser = await authService.getCurrentUser()
          setUser(currentUser)
        } catch (error) {
          console.error("Failed to fetch user after auth state change:", error)
        }
      }
    })

    return () => {
      listener.subscription.unsubscribe()
    }
  }, [])

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

  const signInWithGoogle = async (role: UserRole) => {
    await authService.signInWithGoogle(role)
    // OAuth redirect will handle the rest
  }

  const signOut = async () => {
    console.log("Signing out...")
    try {
      // مسح بيانات localStorage المتعلقة بالمستخدم
      if (typeof window !== "undefined") {
        localStorage.removeItem("selectedDoctor")
        localStorage.removeItem("assessmentResult")
      }
      
      await authService.signOut()
      setUser(null)
      
      // التأكد من مسح حالة المصادقة بالكامل
      if (typeof window !== "undefined") {
        window.location.href = "/"
      }
      
      console.log("Sign out successful")
    } catch (error) {
      console.error("Sign out error:", error)
      // Clear user state even if signOut fails
      setUser(null)
      
      // التوجيه للصفحة الرئيسية حتى لو فشل signOut
      if (typeof window !== "undefined") {
        window.location.href = "/"
      }
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
