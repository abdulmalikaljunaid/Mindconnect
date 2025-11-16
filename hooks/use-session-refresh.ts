"use client"

import { useEffect, useRef } from "react"
import { supabaseClient } from "@/lib/supabase-client"

/**
 * Hook to monitor and automatically refresh Supabase session
 * This prevents session expiry issues by proactively refreshing tokens
 */
export function useSessionRefresh() {
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const isRefreshingRef = useRef(false)

  useEffect(() => {
    const checkAndRefreshSession = async () => {
      // Prevent multiple simultaneous refresh attempts
      if (isRefreshingRef.current) return
      
      try {
        isRefreshingRef.current = true
        
        // Get current session
        const { data: { session }, error: sessionError } = await supabaseClient.auth.getSession()
        
        if (sessionError) {
          console.error("Session check error:", sessionError)
          return
        }

        if (!session) {
          // No session, nothing to refresh
          return
        }

        // Check if token is close to expiring (within 5 minutes)
        const expiresAt = session.expires_at
        if (!expiresAt) return

        const now = Math.floor(Date.now() / 1000)
        const timeUntilExpiry = expiresAt - now

        // If token expires within 5 minutes, refresh it proactively
        if (timeUntilExpiry < 300) {
          console.log("Token expiring soon, refreshing...")
          
          const { data: refreshData, error: refreshError } = await supabaseClient.auth.refreshSession()
          
          if (refreshError) {
            console.error("Session refresh error:", refreshError)
            // If refresh fails, try to get a new session
            await supabaseClient.auth.getSession()
          } else if (refreshData.session) {
            console.log("Session refreshed successfully")
          }
        }
      } catch (error) {
        console.error("Error in session refresh check:", error)
      } finally {
        isRefreshingRef.current = false
      }
    }

    // Check session every 2 minutes
    refreshIntervalRef.current = setInterval(checkAndRefreshSession, 2 * 60 * 1000)

    // Initial check
    checkAndRefreshSession()

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current)
      }
    }
  }, [])

  return null
}

