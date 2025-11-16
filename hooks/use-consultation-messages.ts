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
        .from("messages" as const)
        .select(
          `
          id,
          appointment_id,
          sender_id,
          body,
          created_at,
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
        message: msg.body,
        message_type: "text",
        is_read: false,
        created_at: msg.created_at,
        sender: msg.sender && msg.sender.role !== "admin"
          ? {
              id: msg.sender.id,
              name: msg.sender.name,
              avatar_url: msg.sender.avatar_url,
              role: msg.sender.role as "patient" | "doctor" | "companion",
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
        // جلب معلومات الموعد لتحديد المتلقي
        const { data: appointment, error: appointmentError } = await supabaseClient
          .from("appointments")
          .select("doctor_id, patient_id, companion_id")
          .eq("id", appointmentId)
          .single();

        if (appointmentError) throw appointmentError;

        // تحديد المتلقي بناءً على المرسل
        let recipientId: string | null = null;
        if (user.id === appointment.doctor_id) {
          // إذا كان المرسل هو الطبيب، المتلقي هو المريض
          recipientId = appointment.patient_id;
        } else if (user.id === appointment.patient_id) {
          // إذا كان المرسل هو المريض، المتلقي هو الطبيب
          recipientId = appointment.doctor_id;
        } else if (appointment.companion_id && user.id === appointment.companion_id) {
          // إذا كان المرسل هو المرافق، المتلقي هو الطبيب
          recipientId = appointment.doctor_id;
        }

        const newMessage: { 
          appointment_id: string; 
          sender_id: string; 
          recipient_id: string | null;
          body: string;
          metadata?: any;
        } = {
          appointment_id: appointmentId,
          sender_id: user.id,
          recipient_id: recipientId || null,
          body: message.trim(),
        };

        // إضافة message_type في metadata إذا لم يكن text
        if (messageType !== "text") {
          newMessage.metadata = {
            message_type: messageType
          };
        }

        const { data: insertedMessage, error: insertError } = await supabaseClient
          .from("messages" as const)
          .insert(newMessage)
          .select()
          .single();

        if (insertError) throw insertError;

        // إنشاء إشعار للمتلقي إذا كان موجوداً
        if (recipientId && insertedMessage) {
          try {
            // جلب معلومات المرسل للإشعار
            const { data: senderData } = await supabaseClient
              .from("profiles")
              .select("id, name, avatar_url")
              .eq("id", user.id)
              .single();

            // جلب معلومات الموعد للإشعار
            const { data: appointmentData } = await supabaseClient
              .from("appointments")
              .select("id, mode")
              .eq("id", appointmentId)
              .single();

            const notificationTitle = senderData?.name || "مستخدم";
            const notificationBody =
              message.trim().length > 50
                ? `${message.trim().substring(0, 50)}...`
                : message.trim();

            // إنشاء الإشعار
            await supabaseClient.from("notifications").insert({
              user_id: recipientId,
              type: "message",
              title: `رسالة جديدة من ${notificationTitle}`,
              body: notificationBody,
              related_id: appointmentId,
              sender_id: user.id,
              metadata: {
                message_id: insertedMessage.id,
                appointment_mode: appointmentData?.mode || "messaging",
              },
            });
          } catch (notifError) {
            // لا نوقف العملية إذا فشل إنشاء الإشعار
            console.error("Error creating notification:", notifError);
          }
        }

        // إضافة الرسالة فوراً للمحادثة (optimistic update)
        if (insertedMessage) {
          // جلب معلومات المرسل
          const { data: sender } = await supabaseClient
            .from("profiles")
            .select("id, name, avatar_url, role")
            .eq("id", insertedMessage.sender_id)
            .single();

          const formattedMessage: ConsultationMessage = {
            id: insertedMessage.id,
            appointment_id: insertedMessage.appointment_id || appointmentId,
            sender_id: insertedMessage.sender_id,
            message: insertedMessage.body,
            message_type: (insertedMessage.metadata as any)?.message_type || "text",
            is_read: false,
            created_at: insertedMessage.created_at || new Date().toISOString(),
            sender: sender && sender.role !== "admin"
              ? {
                  id: sender.id,
                  name: sender.name,
                  avatar_url: sender.avatar_url,
                  role: sender.role as "patient" | "doctor" | "companion",
                }
              : undefined,
          };

          setMessages((prev) => {
            // تجنب إضافة رسالة مكررة
            if (prev.some((msg) => msg.id === formattedMessage.id)) {
              return prev;
            }
            return [...prev, formattedMessage];
          });
        }

        // الرسالة ستُضاف تلقائياً عبر Realtime subscription أيضاً
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

      // مخطط الرسائل الحالي لا يحتوي على حقل is_read؛ لا توجد عملية مطلوبة
      return;
    },
    [user]
  );

  // الاشتراك في Realtime للتحديثات الفورية
  useEffect(() => {
    if (!appointmentId || !user) {
      return;
    }

    let mounted = true;
    let retryTimeout: NodeJS.Timeout | null = null;

    // إلغاء الاشتراك السابق إن وُجد
    if (channelRef.current) {
      supabaseClient.removeChannel(channelRef.current);
      channelRef.current = null;
    }

    // إنشاء قناة جديدة للاستشارة
    const channelName = `consultation:${appointmentId}:${user.id}`;
    
    const channel = supabaseClient
      .channel(channelName)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `appointment_id=eq.${appointmentId}`,
        },
        async (payload) => {
          if (!mounted) return;

          try {
            // جلب معلومات المرسل
            const { data: sender, error: senderError } = await supabaseClient
              .from("profiles")
              .select("id, name, avatar_url, role")
              .eq("id", payload.new.sender_id)
              .single();

            // استمر بدون معلومات المرسل إذا فشل الجلب
            if (senderError) {
              // Continue without sender info
            }

            const newMessage: ConsultationMessage = {
              id: payload.new.id,
              appointment_id: payload.new.appointment_id || appointmentId,
              sender_id: payload.new.sender_id,
              message: payload.new.body,
              message_type: (payload.new.metadata as any)?.message_type || "text",
              is_read: false,
              created_at: payload.new.created_at || new Date().toISOString(),
              sender: sender && sender.role !== "admin"
                ? {
                    id: sender.id,
                    name: sender.name,
                    avatar_url: sender.avatar_url,
                    role: sender.role as "patient" | "doctor" | "companion",
                  }
                : undefined,
            };

            setMessages((prev) => {
              // تجنب إضافة رسالة مكررة
              if (prev.some((msg) => msg.id === newMessage.id)) {
                return prev;
              }
              return [...prev, newMessage];
            });
          } catch (err) {
            // في حالة الخطأ، أعد تحميل الرسائل بعد تأخير قصير
            if (mounted) {
              setTimeout(() => fetchMessages(), 500);
            }
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "messages",
          filter: `appointment_id=eq.${appointmentId}`,
        },
        (payload) => {
          if (!mounted) return;
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === payload.new.id ? { ...msg, message: payload.new.body } : msg
            )
          );
        }
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "messages",
          filter: `appointment_id=eq.${appointmentId}`,
        },
        (payload) => {
          if (!mounted) return;
          setMessages((prev) => prev.filter((msg) => msg.id !== payload.old.id));
        }
      );

    // الاشتراك في القناة
    channel.subscribe((status, err) => {
      if (status === "SUBSCRIBED") {
        setRealtimeStatus({
          isConnected: true,
          isSubscribed: true,
          error: null,
        });
      } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
        setRealtimeStatus({
          isConnected: false,
          isSubscribed: false,
          error: err?.message || `خطأ في الاتصال: ${status}`,
        });
        
        // محاولة إعادة الاشتراك بعد 3 ثوانٍ (فقط مرة واحدة)
        if (mounted && !retryTimeout) {
          retryTimeout = setTimeout(() => {
            if (mounted && channelRef.current) {
              retryTimeout = null;
              channelRef.current.subscribe();
            }
          }, 3000);
        }
      } else if (status === "CLOSED") {
        // CLOSED هو حالة طبيعية عند cleanup، لا نعتبرها خطأ
        if (mounted) {
          setRealtimeStatus({
            isConnected: false,
            isSubscribed: false,
            error: null,
          });
        }
      }
    });

    channelRef.current = channel;

    return () => {
      mounted = false;
      if (retryTimeout) {
        clearTimeout(retryTimeout);
        retryTimeout = null;
      }
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
  }, [appointmentId, user?.id]);

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



