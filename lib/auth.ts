import { supabaseClient } from "@/lib/supabase-client"
import type { Session, User as SupabaseUser } from "@supabase/supabase-js"
import type { Enums } from "@/lib/database.types"

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
      await fetch("/api/auth/confirm-signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: data.user.id, email, name, role }),
      })
    } catch (err) {
      // Silent fail - account is created regardless
    }

    const { error: signInError } = await supabaseClient.auth.signInWithPassword({
      email,
      password,
    })

    if (signInError) {
      throw signInError
    }

    return this.getCurrentUser()
  },

  async signIn(email: string, password: string) {
    const { data, error } = await supabaseClient.auth.signInWithPassword({
      email: email.trim(),
      password,
    })

    if (error) {
      // Provide better error messages
      if (error.message.includes("Invalid login credentials")) {
        throw new Error("البريد الإلكتروني أو كلمة المرور غير صحيحة")
      }
      throw error
    }

    if (!data.user) {
      throw new Error("فشل تسجيل الدخول")
    }

    return this.getCurrentUser()
  },

  async signOut() {
    const { error } = await supabaseClient.auth.signOut()
    if (error) {
      throw error
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

  async signInWithGoogle(role: UserRole, redirectUrl?: string) {
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

    // بناء redirectTo URL مع role و redirect إذا كان متوفراً
    let callbackUrl = `${window.location.origin}/auth/callback?role=${role}`
    if (redirectUrl && redirectUrl.startsWith("/") && !redirectUrl.startsWith("//")) {
      callbackUrl += `&next=${encodeURIComponent(redirectUrl)}`
    }

    const { data, error } = await supabaseClient.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: callbackUrl,
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
