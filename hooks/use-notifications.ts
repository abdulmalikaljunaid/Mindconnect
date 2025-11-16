"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { supabaseClient } from "@/lib/supabase-client"
import { useAuth } from "@/contexts/auth-context"

export interface Notification {
  id: string
  user_id: string
  type: "message" | "appointment" | "system"
  title: string
  body: string
  related_id: string | null
  sender_id: string | null
  is_read: boolean
  read_at: string | null
  created_at: string
  metadata: any
  sender?: {
    id: string
    name: string
    avatar_url: string | null
  }
}

export interface UseNotificationsResult {
  notifications: Notification[]
  unreadCount: number
  isLoading: boolean
  error: string | null
  markAsRead: (notificationId: string) => Promise<void>
  markAllAsRead: () => Promise<void>
  deleteNotification: (notificationId: string) => Promise<void>
  refresh: () => Promise<void>
}

export function useNotifications(): UseNotificationsResult {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const channelRef = useRef<any>(null)

  // جلب الإشعارات
  const fetchNotifications = useCallback(async () => {
    if (!user) {
      setNotifications([])
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      setError(null)

      // جلب الإشعارات مع معلومات المرسل
      const { data, error: fetchError } = await supabaseClient
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(50)

      if (fetchError) throw fetchError

      // جلب معلومات المرسلين للإشعارات التي تحتوي على sender_id
      const senderIds = [
        ...new Set(
          data?.filter((notif: any) => notif.sender_id).map((notif: any) => notif.sender_id) || []
        ),
      ]

      let sendersMap: Record<string, { id: string; name: string; avatar_url: string | null }> = {}
      if (senderIds.length > 0) {
        const { data: sendersData } = await supabaseClient
          .from("profiles")
          .select("id, name, avatar_url")
          .in("id", senderIds)

        if (sendersData) {
          sendersMap = sendersData.reduce(
            (acc, sender) => {
              acc[sender.id] = sender
              return acc
            },
            {} as Record<string, { id: string; name: string; avatar_url: string | null }>
          )
        }
      }

      const formattedNotifications: Notification[] =
        data?.map((notif: any) => ({
          id: notif.id,
          user_id: notif.user_id,
          type: notif.type as "message" | "appointment" | "system",
          title: notif.title,
          body: notif.body,
          related_id: notif.related_id,
          sender_id: notif.sender_id,
          is_read: notif.is_read ?? false,
          read_at: notif.read_at,
          created_at: notif.created_at,
          metadata: notif.metadata || {},
          sender: notif.sender_id && sendersMap[notif.sender_id]
            ? {
                id: sendersMap[notif.sender_id].id,
                name: sendersMap[notif.sender_id].name,
                avatar_url: sendersMap[notif.sender_id].avatar_url,
              }
            : undefined,
        })) || []

      setNotifications(formattedNotifications)
    } catch (err: any) {
      console.error("Error fetching notifications:", err)
      setError(err.message || "فشل في جلب الإشعارات")
    } finally {
      setIsLoading(false)
    }
  }, [user])

  // تمييز إشعار كمقروء
  const markAsRead = useCallback(
    async (notificationId: string) => {
      if (!user) return

      try {
        const { error: updateError } = await supabaseClient
          .from("notifications")
          .update({
            is_read: true,
            read_at: new Date().toISOString(),
          })
          .eq("id", notificationId)
          .eq("user_id", user.id)

        if (updateError) throw updateError

        // تحديث الحالة المحلية
        setNotifications((prev) =>
          prev.map((notif) =>
            notif.id === notificationId
              ? { ...notif, is_read: true, read_at: new Date().toISOString() }
              : notif
          )
        )
      } catch (err: any) {
        console.error("Error marking notification as read:", err)
      }
    },
    [user]
  )

  // تمييز جميع الإشعارات كمقروءة
  const markAllAsRead = useCallback(async () => {
    if (!user) return

    try {
      const { error: updateError } = await supabaseClient
        .from("notifications")
        .update({
          is_read: true,
          read_at: new Date().toISOString(),
        })
        .eq("user_id", user.id)
        .eq("is_read", false)

      if (updateError) throw updateError

      // تحديث الحالة المحلية
      const now = new Date().toISOString()
      setNotifications((prev) =>
        prev.map((notif) => ({
          ...notif,
          is_read: true,
          read_at: notif.is_read ? notif.read_at : now,
        }))
      )
    } catch (err: any) {
      console.error("Error marking all notifications as read:", err)
    }
  }, [user])

  // حذف إشعار
  const deleteNotification = useCallback(
    async (notificationId: string) => {
      if (!user) return

      try {
        const { error: deleteError } = await supabaseClient
          .from("notifications")
          .delete()
          .eq("id", notificationId)
          .eq("user_id", user.id)

        if (deleteError) throw deleteError

        // تحديث الحالة المحلية
        setNotifications((prev) => prev.filter((notif) => notif.id !== notificationId))
      } catch (err: any) {
        console.error("Error deleting notification:", err)
      }
    },
    [user]
  )

  // حساب عدد الإشعارات غير المقروءة
  const unreadCount = notifications.filter((notif) => !notif.is_read).length

  // الاشتراك في Realtime للإشعارات
  useEffect(() => {
    if (!user) {
      return
    }

    let mounted = true

    // إلغاء الاشتراك السابق إن وُجد
    if (channelRef.current) {
      supabaseClient.removeChannel(channelRef.current)
      channelRef.current = null
    }

    // إنشاء قناة جديدة للإشعارات مع اسم فريد
    const channelName = `notifications:${user.id}:${Date.now()}`
    console.log(`🔔 Setting up notifications channel: ${channelName}`)

    const channel = supabaseClient.channel(channelName)

    // إضافة listener للرسائل الجديدة
    const insertListener = channel.on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "notifications",
        filter: `user_id=eq.${user.id}`,
      },
      async (payload) => {
        if (!mounted) return

        console.log("🔔 New notification received:", payload)

        try {
          // جلب معلومات المرسل إذا كان موجوداً
          let sender = null
          if (payload.new.sender_id) {
            const { data: senderData } = await supabaseClient
              .from("profiles")
              .select("id, name, avatar_url")
              .eq("id", payload.new.sender_id)
              .single()

            if (senderData) {
              sender = {
                id: senderData.id,
                name: senderData.name,
                avatar_url: senderData.avatar_url,
              }
            }
          }

          const newNotification: Notification = {
            id: payload.new.id,
            user_id: payload.new.user_id,
            type: payload.new.type as "message" | "appointment" | "system",
            title: payload.new.title,
            body: payload.new.body,
            related_id: payload.new.related_id,
            sender_id: payload.new.sender_id,
            is_read: payload.new.is_read || false,
            read_at: payload.new.read_at,
            created_at: payload.new.created_at || new Date().toISOString(),
            metadata: payload.new.metadata || {},
            sender: sender || undefined,
          }

          setNotifications((prev) => {
            // تجنب إضافة إشعار مكرر
            if (prev.some((notif) => notif.id === newNotification.id)) {
              return prev
            }
            // إضافة الإشعار في البداية
            return [newNotification, ...prev]
          })
        } catch (err) {
          console.error("❌ Error processing notification:", err)
          // إعادة جلب الإشعارات في حالة الخطأ
          if (mounted) {
            setTimeout(() => fetchNotifications(), 500)
          }
        }
      }
    )

    // إضافة listener للتحديثات
    const updateListener = channel.on(
      "postgres_changes",
      {
        event: "UPDATE",
        schema: "public",
        table: "notifications",
        filter: `user_id=eq.${user.id}`,
      },
      (payload) => {
        if (!mounted) return
        console.log("🔄 Notification updated:", payload)

        setNotifications((prev) =>
          prev.map((notif) =>
            notif.id === payload.new.id
              ? {
                  ...notif,
                  is_read: payload.new.is_read,
                  read_at: payload.new.read_at,
                }
              : notif
          )
        )
      }
    )

    // إضافة listener للحذف
    const deleteListener = channel.on(
      "postgres_changes",
      {
        event: "DELETE",
        schema: "public",
        table: "notifications",
        filter: `user_id=eq.${user.id}`,
      },
      (payload) => {
        if (!mounted) return
        console.log("🗑️ Notification deleted:", payload)

        setNotifications((prev) => prev.filter((notif) => notif.id !== payload.old.id))
      }
    )

    // الاشتراك في القناة
    channel.subscribe((status, err) => {
      console.log(`📡 Notifications subscription status:`, status, err)

      if (status === "SUBSCRIBED") {
        console.log("✅ Successfully subscribed to notifications channel")
      } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
        console.error("❌ Notifications subscription error:", status, err)
      } else if (status === "CLOSED") {
        console.log("ℹ️ Notifications channel closed (normal during cleanup)")
      }
    })

    channelRef.current = channel

    return () => {
      mounted = false
      if (channelRef.current) {
        console.log("🧹 Cleaning up notifications channel:", channelName)
        supabaseClient.removeChannel(channelRef.current)
        channelRef.current = null
      }
    }
  }, [user?.id]) // استخدام user?.id فقط لتجنب إعادة إنشاء القناة

  // جلب الإشعارات عند تغيير المستخدم
  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refresh: fetchNotifications,
  }
}

