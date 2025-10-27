import { supabaseClient } from "@/lib/supabase-client"
import type { Session, User as SupabaseUser } from "@supabase/supabase-js"
import type { Enums, Tables } from "@/lib/database.types"

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const waitForProfile = async (userId: string, attempts = 5): Promise<Tables<"profiles"> | null> => {
  for (let i = 0; i < attempts; i++) {
    const { data, error } = await supabaseClient
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle()

    if (error) throw error
    if (data) return data

    await delay(200 * (i + 1))
  }

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
      },
    })

    if (error || !data.user) {
      throw error ?? new Error("فشل إنشاء الحساب")
    }

    await waitForProfile(data.user.id)

    return this.getCurrentUser()
  },

  async signIn(email: string, password: string) {
    const { data, error } = await supabaseClient.auth.signInWithPassword({
      email,
      password,
    })

    if (error || !data.user) {
      throw error ?? new Error("فشل تسجيل الدخول")
    }

    return this.getCurrentUser()
  },

  async signOut() {
    const { error } = await supabaseClient.auth.signOut()
    if (error) throw error
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
}
