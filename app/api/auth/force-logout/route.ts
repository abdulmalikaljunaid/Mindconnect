import { NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const redirect = searchParams.get("redirect") || "/login"

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string

    // Create redirect URL with flag to prevent middleware loop
    const redirectUrl = new URL(redirect, req.url)
    redirectUrl.searchParams.set("logged_out", "true")
    
    // Prepare response to manipulate cookies
    let response = NextResponse.redirect(redirectUrl)

    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        get(name: string) {
          return (req as any).cookies?.get?.(name)?.value
        },
        set(name: string, value: string, options?: any) {
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options?: any) {
          response.cookies.set({ name, value: "", ...options })
        },
      },
    })

    // Sign out globally to clear all sessions for this origin
    await supabase.auth.signOut()

    // Set strict no-cache to avoid stale auth state
    response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate")
    response.headers.set("X-Auth-Status", "logged-out")
    return response
  } catch (err) {
    console.error("Force logout error:", err)
    // On any error, just send user to /login with flag
    const loginUrl = new URL("/login", req.url)
    loginUrl.searchParams.set("logged_out", "true")
    return NextResponse.redirect(loginUrl)
  }
}


