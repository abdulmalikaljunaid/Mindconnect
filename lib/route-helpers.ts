import type { UserRole } from "@/lib/auth"

/**
 * Get the default redirect path based on user role
 */
export function getRoleRedirectPath(role: UserRole): string {
  switch (role) {
    case "patient":
      return "/dashboard"
    case "doctor":
      return "/dashboard"
    case "companion":
      return "/dashboard"
    case "admin":
      return "/dashboard"
    default:
      return "/dashboard"
  }
}

/**
 * Check if a route requires authentication
 */
export function isProtectedRoute(pathname: string): boolean {
  const protectedPaths = [
    "/dashboard",
    "/profile",
    "/appointments",
    "/medical-history",
    "/book-appointment",
    "/consultation",
    "/availability",
    "/patients",
    "/doctors",
    "/users",
    "/settings",
    "/symptoms-matcher",
    // "/assessment" - removed - assessment should be public, only booking requires auth
  ]
  
  return protectedPaths.some(path => pathname.startsWith(path))
}

/**
 * Check if a route is public and should redirect authenticated users
 */
export function isPublicRoute(pathname: string): boolean {
  const publicPaths = [
    "/",
    "/login",
    "/signup",
    "/about",
    "/contact",
    "/assessment", // assessment is public - users can take assessment without signing in
  ]
  
  return publicPaths.some(path => pathname === path || pathname.startsWith(path))
}

/**
 * Check if a route is an auth callback
 */
export function isAuthCallbackRoute(pathname: string): boolean {
  return pathname === "/auth/callback"
}

