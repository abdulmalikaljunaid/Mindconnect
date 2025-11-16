"use client";

import { memo } from "react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import type { ConsultationMessage } from "@/types/consultation";
import { Check, CheckCheck } from "lucide-react";

interface MessageItemProps {
  message: ConsultationMessage;
  isOwnMessage: boolean;
}

function MessageItemComponent({ message, isOwnMessage }: MessageItemProps) {
  const senderName = message.sender?.name || "مستخدم";
  const senderInitials = senderName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const messageDate = new Date(message.created_at);

  // إذا كانت رسالة نظامية
  if (message.message_type === "system") {
    return (
      <div className="flex justify-center my-4">
        <div className="text-xs text-muted-foreground bg-muted px-3 py-1 rounded-full">
          {message.message}
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex gap-3 mb-4 group",
        isOwnMessage ? "flex-row-reverse" : "flex-row"
      )}
    >
      {/* Avatar */}
      <Avatar className="h-8 w-8 flex-shrink-0">
        <AvatarImage src={message.sender?.avatar_url || undefined} alt={senderName} />
        <AvatarFallback className="text-xs">
          {senderInitials}
        </AvatarFallback>
      </Avatar>

      {/* Message Content */}
      <div
        className={cn(
          "flex flex-col max-w-[70%]",
          isOwnMessage ? "items-end" : "items-start"
        )}
      >
        {/* Sender Name & Time */}
        <div
          className={cn(
            "flex items-center gap-2 mb-1",
            isOwnMessage && "flex-row-reverse"
          )}
        >
          <span className="text-xs font-medium text-foreground">
            {isOwnMessage ? "أنت" : senderName}
          </span>
          <span className="text-xs text-muted-foreground">
            {format(messageDate, "HH:mm", { locale: ar })}
          </span>
        </div>

        {/* Message Bubble */}
        <div
          className={cn(
            "rounded-2xl px-4 py-2 break-words",
            isOwnMessage
              ? "bg-primary text-primary-foreground rounded-tr-sm"
              : "bg-muted text-foreground rounded-tl-sm",
            message.message_type === "video_link" || message.message_type === "voice_link"
              ? "border border-dashed"
              : ""
          )}
        >
          <p className="text-sm whitespace-pre-wrap">{message.message}</p>

          {/* Read Status */}
          {isOwnMessage && (
            <div className="flex justify-end mt-1">
              {message.is_read ? (
                <CheckCheck className="h-3 w-3 opacity-70" />
              ) : (
                <Check className="h-3 w-3 opacity-50" />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export const MessageItem = memo(MessageItemComponent);








