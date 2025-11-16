"use client";

import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { Bot, User, CheckCircle, AlertCircle, Loader2 } from "lucide-react";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
  actionResult?: {
    type: "success" | "error" | "info";
    message: string;
    data?: any;
  };
}

interface ChatMessageProps {
  message: ChatMessage;
}

export function ChatMessageComponent({ message }: ChatMessageProps) {
  const isUser = message.role === "user";
  const isSystem = message.role === "system";

  if (isSystem) {
    return (
      <div className="flex justify-center my-4">
        <div className="text-xs text-muted-foreground bg-muted px-3 py-1 rounded-full">
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex gap-3 mb-4 group",
        isUser ? "flex-row-reverse" : "flex-row"
      )}
    >
      {/* Avatar */}
      <Avatar className="h-8 w-8 flex-shrink-0">
        {isUser ? (
          <>
            <AvatarFallback className="bg-primary text-primary-foreground">
              <User className="h-4 w-4" />
            </AvatarFallback>
          </>
        ) : (
          <>
            <AvatarFallback className="bg-gradient-to-br from-indigo-600 to-purple-600 text-white">
              <Bot className="h-4 w-4" />
            </AvatarFallback>
          </>
        )}
      </Avatar>

      {/* Message Content */}
      <div
        className={cn(
          "flex flex-col max-w-[75%]",
          isUser ? "items-end" : "items-start"
        )}
      >
        {/* Time */}
        <span className="text-xs text-muted-foreground mb-1">
          {format(message.timestamp, "HH:mm", { locale: ar })}
        </span>

        {/* Message Bubble */}
        <div
          className={cn(
            "rounded-2xl px-4 py-2 break-words",
            isUser
              ? "bg-primary text-primary-foreground rounded-tr-sm"
              : "bg-muted text-foreground rounded-tl-sm"
          )}
        >
          <p className="text-sm whitespace-pre-wrap">{message.content}</p>

          {/* Action Result */}
          {message.actionResult && (
            <div
              className={cn(
                "mt-2 pt-2 border-t flex items-start gap-2",
                isUser ? "border-primary-foreground/20" : "border-border"
              )}
            >
              {message.actionResult.type === "success" && (
                <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
              )}
              {message.actionResult.type === "error" && (
                <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
              )}
              {message.actionResult.type === "info" && (
                <Loader2 className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5 animate-spin" />
              )}
              <p
                className={cn(
                  "text-xs",
                  message.actionResult.type === "success" && "text-green-600",
                  message.actionResult.type === "error" && "text-red-600",
                  message.actionResult.type === "info" && "text-blue-600"
                )}
              >
                {message.actionResult.message}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}



