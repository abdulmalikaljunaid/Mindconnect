import { useEffect, useState, useRef, useCallback } from "react";
import { supabaseClient } from "@/lib/supabase-client";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/hooks/use-toast";
import type {
  ConsultationMessage,
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
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const realtimeChannelRef = useRef<ReturnType<typeof supabaseClient.channel> | null>(null);

  // جلب الرسائل من قاعدة البيانات - بسيط ومباشر
  const fetchMessages = useCallback(async () => {
    if (!appointmentId) {
      setMessages([]);
      setIsLoading(false);
      return;
    }

    try {
      // جلب الرسائل من جدول consultation_messages
      const { data: messagesData, error: fetchError } = await supabaseClient
        .from("consultation_messages")
        .select("id, appointment_id, sender_id, message, message_type, is_read, created_at")
        .eq("appointment_id", appointmentId)
        .order("created_at", { ascending: true });

      if (fetchError) {
        console.error("❌ Fetch error:", fetchError);
        throw fetchError;
      }

      if (!messagesData || messagesData.length === 0) {
        setMessages([]);
        setIsLoading(false);
        return;
      }

      // جلب معلومات المرسلين بشكل منفصل لكل رسالة
      const formattedMessages: ConsultationMessage[] = await Promise.all(
        messagesData.map(async (msg: any) => {
          try {
            const { data: sender } = await supabaseClient
              .from("profiles")
              .select("id, name, avatar_url, role")
              .eq("id", msg.sender_id)
              .single();

            return {
              id: msg.id,
              appointment_id: msg.appointment_id,
              sender_id: msg.sender_id,
              message: msg.message,
              message_type: (msg.message_type || "text") as "text" | "system" | "video_link" | "voice_link",
              is_read: msg.is_read || false,
              created_at: msg.created_at,
              sender: sender && sender.role !== "admin"
                ? {
                    id: sender.id,
                    name: sender.name,
                    avatar_url: sender.avatar_url,
                    role: sender.role as "patient" | "doctor" | "companion",
                  }
                : undefined,
            };
          } catch (err) {
            // إذا فشل جلب معلومات المرسل، نعيد رسالة بدون معلومات المرسل
            console.warn("Failed to fetch sender for message:", msg.id);
            return {
              id: msg.id,
              appointment_id: msg.appointment_id,
              sender_id: msg.sender_id,
              message: msg.message,
              message_type: (msg.message_type || "text") as "text" | "system" | "video_link" | "voice_link",
              is_read: msg.is_read || false,
              created_at: msg.created_at,
              sender: undefined,
            };
          }
        })
      );

      // تحديث الرسائل دائماً
      setMessages(formattedMessages);
      setIsLoading(false);
      
      console.log(`✅ Loaded ${formattedMessages.length} messages for appointment: ${appointmentId}`);
      if (formattedMessages.length > 0) {
        console.log("📨 Message IDs:", formattedMessages.map(m => ({
          id: m.id.substring(0, 8),
          sender: m.sender?.name || m.sender_id.substring(0, 8),
          preview: m.message.substring(0, 30)
        })));
      }
    } catch (err: any) {
      console.error("❌ Error fetching messages:", err);
      setError(err.message || "فشل في جلب الرسائل");
      setMessages([]);
      setIsLoading(false);
    }
  }, [appointmentId]);

  // إرسال رسالة - بسيط ومباشر
  const sendMessage = useCallback(
    async (
      message: string,
      messageType: "text" | "system" | "video_link" | "voice_link" = "text"
    ): Promise<boolean> => {
      if (!appointmentId || !user || !message.trim()) {
        return false;
      }

      try {
        const { data, error: insertError } = await supabaseClient
          .from("consultation_messages")
          .insert({
            appointment_id: appointmentId,
            sender_id: user.id,
            message: message.trim(),
            message_type: messageType,
          })
          .select()
          .single();

        if (insertError) {
          console.error("❌ Insert error:", insertError);
          throw insertError;
        }

        console.log("✅ Message saved to DB:", data.id);

        // لا حاجة لـ fetchMessages هنا - Realtime سيتولى ذلك تلقائياً
        
        return true;
      } catch (err: any) {
        console.error("❌ Error sending message:", err);
        toast({
          title: "خطأ",
          description: err.message || "فشل في إرسال الرسالة",
          variant: "destructive",
        });
        return false;
      }
    },
    [appointmentId, user, toast, fetchMessages]
  );

  const markAsRead = useCallback(async (messageIds: string[]) => {
    if (!appointmentId || !user || messageIds.length === 0) {
      return;
    }

    try {
      const { error: updateError } = await supabaseClient
        .from("consultation_messages")
        .update({ is_read: true })
        .in("id", messageIds)
        .eq("appointment_id", appointmentId);

      if (updateError) {
        console.error("❌ Error marking messages as read:", updateError);
      }
    } catch (err: any) {
      console.error("❌ Error marking messages as read:", err);
    }
  }, [appointmentId, user]);

  // جلب معلومات المرسل لرسالة واحدة
  const fetchSenderInfo = useCallback(async (senderId: string) => {
    try {
      const { data: sender } = await supabaseClient
        .from("profiles")
        .select("id, name, avatar_url, role")
        .eq("id", senderId)
        .single();

      return sender && sender.role !== "admin"
        ? {
            id: sender.id,
            name: sender.name,
            avatar_url: sender.avatar_url,
            role: sender.role as "patient" | "doctor" | "companion",
          }
        : undefined;
    } catch (err) {
      console.warn("Failed to fetch sender info:", senderId);
      return undefined;
    }
  }, []);

  // إضافة رسالة جديدة من Realtime
  const addNewMessage = useCallback(async (msg: any) => {
    const sender = await fetchSenderInfo(msg.sender_id);
    const newMessage: ConsultationMessage = {
      id: msg.id,
      appointment_id: msg.appointment_id,
      sender_id: msg.sender_id,
      message: msg.message,
      message_type: (msg.message_type || "text") as "text" | "system" | "video_link" | "voice_link",
      is_read: msg.is_read || false,
      created_at: msg.created_at,
      sender,
    };

    setMessages((prev) => {
      // تجنب إضافة الرسالة إذا كانت موجودة بالفعل
      if (prev.some((m) => m.id === msg.id)) {
        return prev;
      }
      return [...prev, newMessage].sort(
        (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
    });
  }, [fetchSenderInfo]);

  // إعداد Realtime subscription و Polling
  useEffect(() => {
    if (!appointmentId) {
      setMessages([]);
      setIsLoading(false);
      return;
    }

    // جلب الرسائل فوراً
    fetchMessages();

    // إعداد Realtime subscription
    console.log("🔌 Setting up Realtime subscription for appointment:", appointmentId);
    const channel = supabaseClient
      .channel(`consultation_messages:${appointmentId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "consultation_messages",
          filter: `appointment_id=eq.${appointmentId}`,
        },
        async (payload) => {
          console.log("📨 New message via Realtime:", payload.new);
          await addNewMessage(payload.new);
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "consultation_messages",
          filter: `appointment_id=eq.${appointmentId}`,
        },
        async (payload) => {
          console.log("📝 Message updated via Realtime:", payload.new);
          // تحديث الرسالة في القائمة
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === payload.new.id
                ? {
                    ...msg,
                    message: payload.new.message,
                    message_type: payload.new.message_type || msg.message_type,
                    is_read: payload.new.is_read || msg.is_read,
                  }
                : msg
            )
          );
        }
      )
      .subscribe((status) => {
        console.log("🔌 Realtime subscription status:", status);
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
            error: "خطأ في الاتصال بالبث المباشر",
          });
        } else if (status === "TIMED_OUT") {
          setRealtimeStatus({
            isConnected: false,
            isSubscribed: false,
            error: "انتهت مهلة الاتصال",
          });
        } else {
          setRealtimeStatus({
            isConnected: false,
            isSubscribed: false,
            error: null,
          });
        }
      });

    realtimeChannelRef.current = channel;

    // Polling كنسخة احتياطية (كل 5 ثوان بدلاً من كل ثانية لتقليل الحمل)
    console.log("🔄 Starting backup polling for appointment:", appointmentId);
    pollingIntervalRef.current = setInterval(() => {
      fetchMessages();
    }, 5000);

    return () => {
      // إلغاء Realtime subscription
      if (realtimeChannelRef.current) {
        console.log("🔌 Unsubscribing from Realtime");
        supabaseClient.removeChannel(realtimeChannelRef.current);
        realtimeChannelRef.current = null;
      }
      // إلغاء Polling
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
      setRealtimeStatus({
        isConnected: false,
        isSubscribed: false,
        error: null,
      });
    };
  }, [appointmentId, fetchMessages, addNewMessage]);

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
