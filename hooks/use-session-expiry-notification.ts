"use client"

import { useEffect, useRef } from "react"
import { useSessionInfo } from "./use-session-info"
import { useNotifications } from "./use-notifications"
import { supabaseClient } from "@/lib/supabase-client"

/**
 * Hook to show notifications when session is about to expire
 */
export function useSessionExpiryNotification() {
  const sessionInfo = useSessionInfo()
  const { createNotification } = useNotifications()
  const notificationShownRef = useRef(false)

  useEffect(() => {
    if (!sessionInfo.session || sessionInfo.isExpired) {
      notificationShownRef.current = false
      return
    }

    // Show notification when session is expiring soon (within 5 minutes)
    if (sessionInfo.isExpiringSoon && !notificationShownRef.current) {
      const minutesRemaining = sessionInfo.timeUntilExpiry
        ? Math.floor(sessionInfo.timeUntilExpiry / 60)
        : 0

      // Only show notification once per expiry warning
      notificationShownRef.current = true

      // Create notification
      createNotification({
        type: "system",
        title: "تنبيه: الجلسة ستنتهي قريباً",
        message: `ستنتهي جلسة تسجيل الدخول خلال ${minutesRemaining} دقيقة. سيتم تحديثها تلقائياً.`,
        related_id: null,
      }).catch((error) => {
        // Silently fail - notification creation is not critical
        console.warn("Failed to create session expiry notification:", error)
      })
    }

    // Reset notification flag when session is refreshed
    if (!sessionInfo.isExpiringSoon && sessionInfo.timeUntilExpiry && sessionInfo.timeUntilExpiry > 300) {
      notificationShownRef.current = false
    }
  }, [sessionInfo, createNotification])

  // Show notification when session expires
  useEffect(() => {
    if (sessionInfo.isExpired && sessionInfo.session) {
      createNotification({
        type: "system",
        title: "انتهت الجلسة",
        message: "انتهت جلسة تسجيل الدخول. يرجى تسجيل الدخول مرة أخرى.",
        related_id: null,
      }).catch((error) => {
        console.error("Failed to create session expired notification:", error)
      })
    }
  }, [sessionInfo.isExpired, sessionInfo.session, createNotification])
}

