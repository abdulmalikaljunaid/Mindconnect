"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Loader2, Wifi, WifiOff } from "lucide-react";
import { MessageItem } from "./message-item";
import { useConsultationMessages } from "@/hooks/use-consultation-messages";
import { useAuth } from "@/contexts/auth-context";
import { cn } from "@/lib/utils";

interface ChatWindowProps {
  appointmentId: string;
}

export function ChatWindow({ appointmentId }: ChatWindowProps) {
  const [messageText, setMessageText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const { messages, isLoading, error, sendMessage, realtimeStatus } =
    useConsultationMessages(appointmentId);

  // Auto-scroll إلى الرسالة الأخيرة عند إضافة رسائل جديدة
  useEffect(() => {
    if (messages.length > 0 && messagesEndRef.current) {
      // استخدام setTimeout لضمان أن DOM تم تحديثه
      const timeoutId = setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ 
          behavior: "smooth",
          block: "end"
        });
      }, 200);
      
      return () => clearTimeout(timeoutId);
    }
  }, [messages.length, messages]);

  const handleSend = async () => {
    if (!messageText.trim() || isSending) return;

    setIsSending(true);
    const success = await sendMessage(messageText.trim());
    if (success) {
      setMessageText("");
    }
    setIsSending(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-destructive">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-background border rounded-lg overflow-hidden">
      {/* Connection Status Bar */}
      {!realtimeStatus.isConnected && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 px-4 py-2 flex items-center gap-2 text-sm">
          <WifiOff className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
          <span className="text-yellow-700 dark:text-yellow-300">
            محاولة الاتصال...
          </span>
        </div>
      )}

      {realtimeStatus.isConnected && (
        <div className="bg-green-50 dark:bg-green-900/20 px-4 py-2 flex items-center gap-2 text-sm">
          <Wifi className="h-4 w-4 text-green-600 dark:text-green-400" />
          <span className="text-green-700 dark:text-green-300">
            متصل
          </span>
        </div>
      )}

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4" ref={scrollAreaRef}>
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center text-muted-foreground">
              <p className="text-lg mb-2">لا توجد رسائل بعد</p>
              <p className="text-sm">ابدأ المحادثة بإرسال رسالة</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4 pb-4">
            {messages.map((message) => (
              <MessageItem
                key={message.id}
                message={message}
                isOwnMessage={message.sender_id === user?.id}
              />
            ))}
            <div ref={messagesEndRef} className="h-1" />
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="border-t p-4 bg-background">
        <div className="flex gap-2 items-end">
          <Textarea
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="اكتب رسالة..."
            className="min-h-[60px] max-h-[120px] resize-none"
            disabled={isSending || !realtimeStatus.isConnected}
            rows={2}
          />
          <Button
            onClick={handleSend}
            disabled={!messageText.trim() || isSending || !realtimeStatus.isConnected}
            size="icon"
            className="h-[60px] w-[60px] flex-shrink-0"
          >
            {isSending ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2 text-center">
          اضغط Enter للإرسال، Shift+Enter للسطر الجديد
        </p>
      </div>
    </div>
  );
}

