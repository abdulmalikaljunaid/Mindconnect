"use client"

import { supabaseClient } from "@/lib/supabase-client"
import type { PostgrestError } from "@supabase/supabase-js"

/**
 * Check if an error is due to an expired or invalid session
 */
export function isSessionError(error: any): boolean {
  if (!error) return false
  
  const errorMessage = error.message?.toLowerCase() || ""
  const errorCode = error.code || ""
  
  // Check for common session expiry error patterns
  return (
    errorMessage.includes("jwt") ||
    errorMessage.includes("token") ||
    errorMessage.includes("session") ||
    errorMessage.includes("unauthorized") ||
    errorMessage.includes("expired") ||
    errorCode === "PGRST301" || // PostgREST unauthorized
    errorCode === "PGRST116" || // PostgREST JWT error
    error?.status === 401 ||
    error?.statusCode === 401
  )
}

/**
 * Retry a Supabase query with automatic session refresh on auth errors
 */
export async function retryWithSessionRefresh<T>(
  queryFn: () => Promise<{ data: T | null; error: PostgrestError | null }>,
  maxRetries: number = 2
): Promise<{ data: T | null; error: PostgrestError | null }> {
  let lastError: PostgrestError | null = null

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const result = await queryFn()

      // If successful, return result
      if (!result.error) {
        return result
      }

      // If error is not a session error, return immediately
      if (!isSessionError(result.error)) {
        return result
      }

      lastError = result.error

      // If it's a session error and we have retries left, try to refresh session
      if (attempt < maxRetries) {
        console.log(`Session error detected, refreshing session (attempt ${attempt + 1}/${maxRetries})...`)
        
        try {
          // Try to refresh the session
          const { data: refreshData, error: refreshError } = await supabaseClient.auth.refreshSession()
          
          if (refreshError) {
            console.error("Failed to refresh session:", refreshError)
            // Try to get current session as fallback
            await supabaseClient.auth.getSession()
          } else if (refreshData.session) {
            console.log("Session refreshed, retrying query...")
            // Wait a bit before retrying
            await new Promise(resolve => setTimeout(resolve, 500))
            continue
          }
        } catch (refreshErr) {
          console.error("Error during session refresh:", refreshErr)
        }
      }
    } catch (error) {
      lastError = error as PostgrestError
      
      // If it's a session error and we have retries left, try to refresh
      if (isSessionError(error) && attempt < maxRetries) {
        console.log(`Session error in query, refreshing session (attempt ${attempt + 1}/${maxRetries})...`)
        
        try {
          await supabaseClient.auth.refreshSession()
          await new Promise(resolve => setTimeout(resolve, 500))
          continue
        } catch (refreshErr) {
          console.error("Error during session refresh:", refreshErr)
        }
      }
    }
  }

  // All retries exhausted
  return { data: null, error: lastError }
}

