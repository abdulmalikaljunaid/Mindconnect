import { NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase-server"
import type { Database } from "@/lib/database.types"
import { cookies } from "next/headers"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")
  const roleParam = requestUrl.searchParams.get("role")
  const next = requestUrl.searchParams.get("next") || "/dashboard"

  if (!code) {
    console.error("No code parameter in OAuth callback")
    return NextResponse.redirect(new URL("/login/user?error=missing_code", requestUrl.origin))
  }

  try {
    const cookieStore = await cookies()
    const supabase = createSupabaseServerClient(cookieStore)

    // Exchange code for session
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      console.error("Error exchanging code for session:", error)
      return NextResponse.redirect(
        new URL(
          `/login/user?error=${encodeURIComponent(error.message || "فشل تسجيل الدخول")}`,
          requestUrl.origin
        )
      )
    }

    if (!data?.user) {
      console.error("No user data returned from OAuth")
      return NextResponse.redirect(
        new URL(
          `/login/user?error=${encodeURIComponent("لم يتم الحصول على بيانات المستخدم")}`,
          requestUrl.origin
        )
      )
    }

    // Check if profile exists
    const { data: profile, error: profileError } = await supabase
      .from("profiles" as const)
      .select("*")
      .match({ id: data.user.id })
      .maybeSingle()

    if (profileError && profileError.code !== "PGRST116") {
      // PGRST116 is "no rows returned" which is expected for new users
      console.error("Error checking profile:", profileError)
    }

    // Create profile if it doesn't exist (new user from OAuth)
    if (!profile) {
      // Get role from URL parameter (passed during OAuth redirect)
      // Or from user_metadata if it exists (for existing users)
      // Default to patient if neither is available
      let role: string = roleParam || data.user.user_metadata?.role || "patient"
      
      // Validate role is either patient or companion
      if (role !== "patient" && role !== "companion") {
        role = "patient"
      }

      const name =
        data.user.user_metadata?.full_name ||
        data.user.user_metadata?.name ||
        data.user.email?.split("@")[0] ||
        "User"

      const newProfile: Database['public']['Tables']['profiles']['Insert'] = {
        id: data.user.id,
        email: data.user.email || "",
        name: name,
        role: role as Database['public']['Enums']['role_type'],
        is_approved: true,
        avatar_url: (data.user.user_metadata?.avatar_url as string | null) ?? null,
      }

      const { error: insertError } = await supabase
        .from("profiles" as const)
        .insert([newProfile] as Database['public']['Tables']['profiles']['Insert'][])

      if (insertError) {
        console.error("Error creating profile:", insertError)
        // Don't fail if profile already exists (duplicate key error)
        if (insertError.code !== "23505") {
          return NextResponse.redirect(
            new URL(
              `/login/user?error=${encodeURIComponent(insertError.message || "فشل إنشاء الملف الشخصي")}`,
              requestUrl.origin
            )
          )
        }
      }
    }

    // Redirect to dashboard or specified next URL
    return NextResponse.redirect(new URL(next, requestUrl.origin))
  } catch (err: any) {
    console.error("Unexpected error in OAuth callback:", err)
    const errorMessage = err?.message || err?.toString() || "حدث خطأ غير متوقع"
    return NextResponse.redirect(
      new URL(
        `/login/user?error=${encodeURIComponent(errorMessage)}`,
        requestUrl.origin
      )
    )
  }
}

