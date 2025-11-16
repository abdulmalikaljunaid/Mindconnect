"use client";

import { Button } from "@/components/ui/button";
import { useChatSuggestions } from "@/hooks/use-chat-suggestions";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface SuggestionChipsProps {
  onSuggestionClick: (suggestion: string) => void;
}

export function SuggestionChips({ onSuggestionClick }: SuggestionChipsProps) {
  const { suggestions, isLoading } = useChatSuggestions();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center gap-2">
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        <span className="text-sm text-muted-foreground">جاري تحميل الاقتراحات...</span>
      </div>
    );
  }

  if (suggestions.length === 0) {
    return (
      <div className="text-sm text-muted-foreground text-center">
        لا توجد اقتراحات متاحة
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-muted-foreground mb-2">
        اقتراحات سريعة:
      </p>
      <div className="flex flex-wrap gap-2">
        {suggestions.map((suggestion) => (
          <Button
            key={suggestion.id}
            variant="outline"
            size="sm"
            onClick={() => onSuggestionClick(suggestion.text)}
            className={cn(
              "text-xs",
              suggestion.type === "appointment" && "border-blue-200 text-blue-700 hover:bg-blue-50",
              suggestion.type === "doctor" && "border-green-200 text-green-700 hover:bg-green-50",
              suggestion.type === "medical_history" && "border-purple-200 text-purple-700 hover:bg-purple-50"
            )}
          >
            {suggestion.text}
          </Button>
        ))}
      </div>
    </div>
  );
}



