"use client"

import { useState, useEffect } from "react"
import { supabaseClient } from "@/lib/supabase-client"
import type { Session } from "@supabase/supabase-js"

export interface SessionInfo {
  session: Session | null
  expiresAt: number | null
  timeUntilExpiry: number | null // in seconds
  isExpiringSoon: boolean // expires within 5 minutes
  isExpired: boolean
  formattedTimeRemaining: string
}

/**
 * Hook to get current session information including expiry time
 */
export function useSessionInfo() {
  const [sessionInfo, setSessionInfo] = useState<SessionInfo>({
    session: null,
    expiresAt: null,
    timeUntilExpiry: null,
    isExpiringSoon: false,
    isExpired: false,
    formattedTimeRemaining: "",
  })

  useEffect(() => {
    const updateSessionInfo = async () => {
      try {
        const { data: { session }, error } = await supabaseClient.auth.getSession()
        
        if (error) {
          console.error("Error getting session:", error)
          setSessionInfo({
            session: null,
            expiresAt: null,
            timeUntilExpiry: null,
            isExpiringSoon: false,
            isExpired: true,
            formattedTimeRemaining: "",
          })
          return
        }

        if (!session) {
          setSessionInfo({
            session: null,
            expiresAt: null,
            timeUntilExpiry: null,
            isExpiringSoon: false,
            isExpired: true,
            formattedTimeRemaining: "",
          })
          return
        }

        const expiresAt = session.expires_at
        if (!expiresAt) {
          setSessionInfo({
            session,
            expiresAt: null,
            timeUntilExpiry: null,
            isExpiringSoon: false,
            isExpired: false,
            formattedTimeRemaining: "غير محدد",
          })
          return
        }

        const now = Math.floor(Date.now() / 1000)
        const timeUntilExpiry = expiresAt - now
        const isExpired = timeUntilExpiry <= 0
        const isExpiringSoon = timeUntilExpiry > 0 && timeUntilExpiry < 300 // 5 minutes

        // Format time remaining
        let formattedTimeRemaining = ""
        if (isExpired) {
          formattedTimeRemaining = "انتهت الجلسة"
        } else if (timeUntilExpiry < 60) {
          formattedTimeRemaining = `${timeUntilExpiry} ثانية`
        } else if (timeUntilExpiry < 3600) {
          const minutes = Math.floor(timeUntilExpiry / 60)
          const seconds = timeUntilExpiry % 60
          formattedTimeRemaining = `${minutes} دقيقة ${seconds > 0 ? seconds + " ثانية" : ""}`
        } else {
          const hours = Math.floor(timeUntilExpiry / 3600)
          const minutes = Math.floor((timeUntilExpiry % 3600) / 60)
          formattedTimeRemaining = `${hours} ساعة ${minutes > 0 ? minutes + " دقيقة" : ""}`
        }

        setSessionInfo({
          session,
          expiresAt,
          timeUntilExpiry,
          isExpiringSoon,
          isExpired,
          formattedTimeRemaining,
        })
      } catch (error) {
        console.error("Error updating session info:", error)
      }
    }

    // Update immediately
    updateSessionInfo()

    // Update every 10 seconds
    const interval = setInterval(updateSessionInfo, 10 * 1000)

    // Listen for auth state changes
    const { data: { subscription } } = supabaseClient.auth.onAuthStateChange(() => {
      updateSessionInfo()
    })

    return () => {
      clearInterval(interval)
      subscription.unsubscribe()
    }
  }, [])

  return sessionInfo
}

