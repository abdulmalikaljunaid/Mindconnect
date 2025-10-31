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
  const {
    data: { user },
  } = await supabase.auth.getUser()

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

  // Handle public auth routes - redirect if already authenticated
  if (pathname.startsWith("/login") || pathname.startsWith("/signup")) {
    if (user) {
      // Already authenticated, redirect to dashboard
      const redirectUrl = new URL("/dashboard", request.url)
      response.headers.set("Cache-Control", "no-store, must-revalidate")
      return NextResponse.redirect(redirectUrl)
    }

    // Set cache headers for login/signup pages
    response.headers.set("Cache-Control", "public, max-age=3600, must-revalidate")
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

