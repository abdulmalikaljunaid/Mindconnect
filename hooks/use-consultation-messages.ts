import { useEffect, useState, useRef, useCallback } from "react";
import { supabaseClient } from "@/lib/supabase-client";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/hooks/use-toast";
import type {
  ConsultationMessage,
  ConsultationMessageInsert,
  RealtimeStatus,
} from "@/types/consultation";

interface UseConsultationMessagesResult {
  messages: ConsultationMessage[];
  isLoading: boolean;
  error: string | null;
  sendMessage: (message: string, messageType?: "text" | "system" | "video_link" | "voice_link") => Promise<boolean>;
  markAsRead: (messageIds: string[]) => Promise<void>;
  realtimeStatus: RealtimeStatus;
  refresh: () => Promise<void>;
}

export function useConsultationMessages(appointmentId: string | null): UseConsultationMessagesResult {
  const [messages, setMessages] = useState<ConsultationMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [realtimeStatus, setRealtimeStatus] = useState<RealtimeStatus>({
    isConnected: false,
    isSubscribed: false,
    error: null,
  });
  const { user } = useAuth();
  const { toast } = useToast();
  const channelRef = useRef<any>(null);

  // جلب الرسائل من قاعدة البيانات
  const fetchMessages = useCallback(async () => {
    if (!appointmentId) {
      setMessages([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // جلب الرسائل مع معلومات المرسل
      const { data, error: fetchError } = await supabaseClient
        .from("consultation_messages")
        .select(
          `
          *,
          sender:profiles!sender_id (
            id,
            name,
            avatar_url,
            role
          )
        `
        )
        .eq("appointment_id", appointmentId)
        .order("created_at", { ascending: true });

      if (fetchError) throw fetchError;

      // تحويل البيانات إلى النوع المطلوب
      const formattedMessages: ConsultationMessage[] = (data || []).map((msg: any) => ({
        id: msg.id,
        appointment_id: msg.appointment_id,
        sender_id: msg.sender_id,
        message: msg.message,
        message_type: msg.message_type,
        is_read: msg.is_read,
        created_at: msg.created_at,
        sender: msg.sender
          ? {
              id: msg.sender.id,
              name: msg.sender.name,
              avatar_url: msg.sender.avatar_url,
              role: msg.sender.role,
            }
          : undefined,
      }));

      setMessages(formattedMessages);
    } catch (err: any) {
      console.error("Error fetching messages:", err);
      setError(err.message || "فشل في جلب الرسائل");
      setMessages([]);
    } finally {
      setIsLoading(false);
    }
  }, [appointmentId]);

  // إرسال رسالة جديدة
  const sendMessage = useCallback(
    async (
      message: string,
      messageType: "text" | "system" | "video_link" | "voice_link" = "text"
    ): Promise<boolean> => {
      if (!appointmentId || !user || !message.trim()) {
        return false;
      }

      try {
        const newMessage: ConsultationMessageInsert = {
          appointment_id: appointmentId,
          sender_id: user.id,
          message: message.trim(),
          message_type: messageType,
          is_read: false,
        };

        const { error: insertError } = await supabaseClient
          .from("consultation_messages")
          .insert(newMessage);

        if (insertError) throw insertError;

        // الرسالة ستُضاف تلقائياً عبر Realtime subscription
        return true;
      } catch (err: any) {
        console.error("Error sending message:", err);
        toast({
          title: "خطأ",
          description: err.message || "فشل في إرسال الرسالة",
          variant: "destructive",
        });
        return false;
      }
    },
    [appointmentId, user, toast]
  );

  // تحديث حالة القراءة
  const markAsRead = useCallback(
    async (messageIds: string[]) => {
      if (!messageIds.length || !user) return;

      try {
        const { error } = await supabaseClient
          .from("consultation_messages")
          .update({ is_read: true })
          .in("id", messageIds)
          .neq("sender_id", user.id); // لا نحدّث حالة القراءة للرسائل التي أرسلناها

        if (error) throw error;
      } catch (err: any) {
        console.error("Error marking messages as read:", err);
      }
    },
    [user]
  );

  // الاشتراك في Realtime للتحديثات الفورية
  useEffect(() => {
    if (!appointmentId) {
      return;
    }

    // إلغاء الاشتراك السابق إن وُجد
    if (channelRef.current) {
      supabaseClient.removeChannel(channelRef.current);
      channelRef.current = null;
      setRealtimeStatus({
        isConnected: false,
        isSubscribed: false,
        error: null,
      });
    }

    // إنشاء قناة جديدة للاستشارة
    const channel = supabaseClient
      .channel(`consultation:${appointmentId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "consultation_messages",
          filter: `appointment_id=eq.${appointmentId}`,
        },
        async (payload) => {
          console.log("Realtime update received:", payload);

          // إذا كانت رسالة جديدة، نجلبها مع معلومات المرسل
          if (payload.eventType === "INSERT") {
            const { data: sender } = await supabaseClient
              .from("profiles")
              .select("id, name, avatar_url, role")
              .eq("id", payload.new.sender_id)
              .single();

            const newMessage: ConsultationMessage = {
              id: payload.new.id,
              appointment_id: payload.new.appointment_id,
              sender_id: payload.new.sender_id,
              message: payload.new.message,
              message_type: payload.new.message_type,
              is_read: payload.new.is_read,
              created_at: payload.new.created_at,
              sender: sender
                ? {
                    id: sender.id,
                    name: sender.name,
                    avatar_url: sender.avatar_url,
                    role: sender.role,
                  }
                : undefined,
            };

            setMessages((prev) => [...prev, newMessage]);

            // إذا كانت الرسالة ليست من المستخدم الحالي، نحدّث حالة القراءة
            if (payload.new.sender_id !== user?.id) {
              markAsRead([payload.new.id]);
            }
          } else if (payload.eventType === "UPDATE") {
            // تحديث رسالة موجودة (مثل تحديث حالة القراءة)
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === payload.new.id
                  ? { ...msg, is_read: payload.new.is_read, message: payload.new.message }
                  : msg
              )
            );
          } else if (payload.eventType === "DELETE") {
            setMessages((prev) => prev.filter((msg) => msg.id !== payload.old.id));
          }
        }
      )
      .subscribe((status) => {
        console.log("Realtime subscription status:", status);
        if (status === "SUBSCRIBED") {
          setRealtimeStatus({
            isConnected: true,
            isSubscribed: true,
            error: null,
          });
        } else if (status === "CHANNEL_ERROR") {
          setRealtimeStatus({
            isConnected: false,
            isSubscribed: false,
            error: "خطأ في الاتصال",
          });
        }
      });

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabaseClient.removeChannel(channelRef.current);
        channelRef.current = null;
      }
      setRealtimeStatus({
        isConnected: false,
        isSubscribed: false,
        error: null,
      });
    };
  }, [appointmentId, user, markAsRead]);

  // جلب الرسائل عند تغيير appointmentId
  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  // تحديث حالة القراءة للرسائل غير المقروءة عند فتح المحادثة
  useEffect(() => {
    if (!user || !messages.length) return;

    const unreadMessageIds = messages
      .filter((msg) => !msg.is_read && msg.sender_id !== user.id)
      .map((msg) => msg.id);

    if (unreadMessageIds.length > 0) {
      markAsRead(unreadMessageIds);
    }
  }, [messages, user, markAsRead]);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    markAsRead,
    realtimeStatus,
    refresh: fetchMessages,
  };
}



