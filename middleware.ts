import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { isProtectedRoute, isPublicRoute, isAuthCallbackRoute } from "@/lib/route-helpers"

export async function middleware(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("Missing Supabase environment variables")
    return NextResponse.next()
  }

  // Create Supabase client with cookie handling
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return request.cookies.get(name)?.value
      },
      set(name: string, value: string, options?: any) {
        request.cookies.set({
          name,
          value,
          ...options,
        })
        response = NextResponse.next({
          request: {
            headers: request.headers,
          },
        })
        response.cookies.set({
          name,
          value,
          ...options,
        })
      },
      remove(name: string, options?: any) {
        request.cookies.set({
          name,
          value: "",
          ...options,
        })
        response = NextResponse.next({
          request: {
            headers: request.headers,
          },
        })
        response.cookies.set({
          name,
          value: "",
          ...options,
        })
      },
    },
  })

  // Refresh session if expired - this is crucial for maintaining auth state
  // getSession() will automatically refresh the token if needed
  // Also explicitly refresh if session is close to expiring
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession()
  
  // If session exists but is close to expiring, refresh it proactively
  if (session && !sessionError) {
    const expiresAt = session.expires_at
    if (expiresAt && session.refresh_token) {
      const now = Math.floor(Date.now() / 1000)
      const timeUntilExpiry = expiresAt - now
      
      // If token expires within 5 minutes, refresh it
      if (timeUntilExpiry < 300) {
        try {
          const { error: refreshError } = await supabase.auth.refreshSession()
          if (refreshError) {
            // Check if it's a refresh token error
            if (refreshError.message?.includes("Refresh Token") || refreshError.message?.includes("refresh_token")) {
              // Don't log as error, just silently handle - user will need to re-authenticate
              console.warn("Refresh token not available in middleware")
            } else {
              console.warn("Failed to refresh session in middleware:", refreshError)
            }
          }
        } catch (refreshError) {
          // Silently fail - session might still be valid
          console.warn("Failed to refresh session in middleware:", refreshError)
        }
      }
    }
  }
  
  // Get user from the refreshed session
  const user = session?.user ?? null

  const { pathname } = request.nextUrl

  // Handle auth callback routes - allow them to proceed
  if (isAuthCallbackRoute(pathname)) {
    response.headers.set("Cache-Control", "no-store, must-revalidate")
    return response
  }

  // Handle protected routes
  if (isProtectedRoute(pathname)) {
    if (!user) {
      // Redirect to login if not authenticated
      const redirectUrl = new URL("/login", request.url)
      redirectUrl.searchParams.set("redirect", pathname)
      return NextResponse.redirect(redirectUrl)
    }

    // Set cache headers for authenticated pages
    response.headers.set("Cache-Control", "private, no-cache, no-store, must-revalidate")
    return response
  }

  // Handle public auth routes
  if (pathname.startsWith("/login") || pathname.startsWith("/signup")) {
    // Check if user is coming from force-logout (has logged_out flag)
    const loggedOut = request.nextUrl.searchParams.get("logged_out") === "true"
    
    // If user has session but no logged_out flag, force logout
    if (user && !loggedOut) {
      // If a session exists and user is trying to visit a login/signup page,
      // force a clean logout first to avoid cross-tab session confusion.
      const forceLogout = new URL("/api/auth/force-logout", request.url)
      forceLogout.searchParams.set("redirect", pathname)
      response.headers.set("Cache-Control", "no-store, must-revalidate")
      return NextResponse.redirect(forceLogout)
    }

    // Set cache headers for login/signup pages
    response.headers.set("Cache-Control", "no-store, must-revalidate")
  }

  // Set default cache headers for other public routes
  if (isPublicRoute(pathname) && !pathname.startsWith("/login") && !pathname.startsWith("/signup")) {
    response.headers.set("Cache-Control", "public, max-age=3600, must-revalidate")
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
}

