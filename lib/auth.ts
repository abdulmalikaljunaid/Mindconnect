import { supabaseClient } from "@/lib/supabase-client"
import type { Session, User as SupabaseUser } from "@supabase/supabase-js"
import type { Enums, Tables } from "@/lib/database.types"

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const waitForProfile = async (userId: string, attempts = 10): Promise<Tables<"profiles"> | null> => {
  console.log(`Starting waitForProfile for user: ${userId}, max attempts: ${attempts}`)
  
  for (let i = 0; i < attempts; i++) {
    try {
      console.log(`Profile fetch attempt ${i + 1}/${attempts}`)
      const { data, error } = await supabaseClient
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle()

      if (error) {
        console.warn(`Profile fetch attempt ${i + 1} failed:`, error)
        // Continue to next attempt instead of throwing
      } else if (data) {
        console.log(`Profile found on attempt ${i + 1}`)
        return data
      } else {
        console.log(`Profile not found yet on attempt ${i + 1}`)
      }

      // Reduced delay for faster response
      // First attempts are faster, then exponential backoff
      const delayMs = Math.min(100 * (i + 1), 1000)
      if (i < attempts - 1) {
        console.log(`Waiting ${delayMs}ms before next attempt...`)
        await delay(delayMs)
      }
    } catch (err) {
      console.warn(`Profile fetch attempt ${i + 1} error:`, err)
      // Continue to next attempt
      const delayMs = 100 * (i + 1)
      if (i < attempts - 1) {
        await delay(delayMs)
      }
    }
  }

  console.warn(`Profile not found after ${attempts} attempts for user: ${userId}`)
  return null
}

export type UserRole = Enums<"role_type">

export interface UserProfile {
  id: string
  email: string
  name: string
  role: UserRole
  phone?: string | null
  avatarUrl?: string | null
  bio?: string | null
  isApproved: boolean
  createdAt: string
}

export interface AuthState {
  user: UserProfile | null
  session: Session | null
  isAuthenticated: boolean
}

const mapProfile = (authUser: SupabaseUser, profile: any): UserProfile => ({
  id: authUser.id,
  email: authUser.email ?? "",
  name: profile?.name ?? authUser.user_metadata?.name ?? "",
  role: profile?.role ?? authUser.user_metadata?.role ?? "patient",
  phone: profile?.phone ?? authUser.user_metadata?.phone,
  avatarUrl: profile?.avatar_url ?? authUser.user_metadata?.avatar_url,
  bio: profile?.bio ?? null,
  isApproved: profile?.is_approved ?? false,
  createdAt: profile?.created_at ?? authUser.created_at ?? new Date().toISOString(),
})

export const authService = {
  supabase: supabaseClient,
  async signUp(email: string, password: string, name: string, role: UserRole) {
    // منع إنشاء حسابات إدارية من خلال الواجهة العامة
    if (role === "admin") {
      throw new Error("Admin accounts cannot be created through public registration")
    }

    const { data, error } = await supabaseClient.auth.signUp({
      email,
      password,
      options: {
        data: { name, role },
        emailRedirectTo:
          typeof window !== "undefined" ? `${window.location.origin}/auth/callback` : undefined,
        // Disable email confirmation for better UX
        // Supabase will still try to send email, but we auto-confirm via API
      },
    })

    if (error) {
      // Handle rate limit error with better message
      if (error.message?.toLowerCase().includes("rate limit") || error.message?.toLowerCase().includes("email")) {
        throw new Error("تم تجاوز الحد المسموح من محاولات إرسال البريد الإلكتروني. يرجى المحاولة بعد قليل أو استخدام بريد إلكتروني آخر.")
      }
      throw error
    }

    if (!data.user) {
      throw new Error("فشل إنشاء الحساب")
    }

    try {
      console.log("Attempting to auto-confirm signup...", data.user.id)
      const response = await fetch("/api/auth/confirm-signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: data.user.id, email, name, role }),
      })

      if (!response.ok) {
        const result = await response.json().catch(() => ({}))
        console.warn("Failed to auto-confirm signup", result)
      } else {
        console.log("Auto-confirm signup successful")
      }
    } catch (err) {
      console.warn("Auto-confirm signup request failed", err)
    }

    const { error: signInError } = await supabaseClient.auth.signInWithPassword({
      email,
      password,
    })

    if (signInError) {
      throw signInError
    }

    // Wait for profile with reduced attempts for faster response
    console.log("Waiting for profile...", data.user.id)
    const profile = await waitForProfile(data.user.id)
    console.log("Profile result:", profile ? "found" : "not found")

    // Return current user immediately
    try {
      const currentUser = await this.getCurrentUser()
      console.log("Got current user:", currentUser?.email)
      return currentUser
    } catch (err) {
      console.warn("Failed to get current user immediately, but account is created", err)
      // Return a basic user object if getCurrentUser fails
      return {
        id: data.user.id,
        email: data.user.email || email,
        name: name,
        role: role,
        isApproved: false,
        avatarUrl: null,
        createdAt: new Date().toISOString(),
      } as any
    }
  },

  async signIn(email: string, password: string) {
    const { data, error } = await supabaseClient.auth.signInWithPassword({
      email,
      password,
    })

    if (error || !data.user) {
      throw error ?? new Error("فشل تسجيل الدخول")
    }

    // Wait for profile (optimized)
    await waitForProfile(data.user.id)

    // Return current user immediately
    return this.getCurrentUser()
  },

  async signOut() {
    console.log("AuthService: Signing out...")
    try {
      const { error } = await supabaseClient.auth.signOut()
      if (error) {
        console.error("AuthService: Sign out error:", error)
        throw error
      }
      console.log("AuthService: Sign out successful")
    } catch (err) {
      console.error("AuthService: Sign out exception:", err)
      throw err
    }
  },

  async getCurrentUser(): Promise<AuthState["user"]> {
    const {
      data: { user },
    } = await supabaseClient.auth.getUser()

    if (!user) return null

    const { data: profile } = await supabaseClient
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle()

    return mapProfile(user, profile)
  },

  async getSession(): Promise<Session | null> {
    const {
      data: { session },
    } = await supabaseClient.auth.getSession()
    return session
  },

  async updateProfile(updates: Partial<UserProfile>) {
    if (!updates.id) throw new Error("User ID required")
    const { error } = await supabaseClient
      .from("profiles")
      .update({
        name: updates.name,
        phone: updates.phone,
        avatar_url: updates.avatarUrl,
        bio: updates.bio,
      })
      .eq("id", updates.id)

    if (error) throw error
    return this.getCurrentUser()
  },

  async signInWithGoogle(role: UserRole) {
    // منع استخدام Google OAuth للأطباء والإداريين
    if (role === "admin" || role === "doctor") {
      throw new Error("Google sign-in is only available for patients and companions")
    }

    if (typeof window === "undefined") {
      throw new Error("signInWithGoogle must be called from client side")
    }

    // Store role in sessionStorage to retrieve after OAuth redirect
    if (typeof window !== "undefined") {
      sessionStorage.setItem("oauth_role", role)
    }

    const { data, error } = await supabaseClient.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?role=${role}`,
        queryParams: {
          access_type: "offline",
          prompt: "consent",
        },
      },
    })

    if (error) throw error
    return data
  },
}
