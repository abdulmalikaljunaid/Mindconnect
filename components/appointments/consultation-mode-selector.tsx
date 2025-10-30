"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Video, Phone, MessageSquare, MapPin, Check } from "lucide-react";
import { AppointmentMode } from "@/types/appointments";
import { cn } from "@/lib/utils";

interface ConsultationModeSelectorProps {
  availableModes: {
    video: boolean;
    audio: boolean;
    messaging: boolean;
    in_person: boolean;
  };
  fees: {
    video: number | null;
    audio: number | null;
    messaging: number | null;
    in_person: number | null;
  };
  selectedMode?: AppointmentMode;
  onSelectMode: (mode: AppointmentMode) => void;
}

const MODES = [
  {
    value: "video" as AppointmentMode,
    label: "استشارة فيديو",
    description: "تواصل مباشر بالصوت والصورة",
    icon: Video,
  },
  {
    value: "audio" as AppointmentMode,
    label: "استشارة صوتية",
    description: "تواصل صوتي فقط",
    icon: Phone,
  },
  {
    value: "messaging" as AppointmentMode,
    label: "استشارة كتابية",
    description: "رسائل نصية مع الدكتور",
    icon: MessageSquare,
  },
  {
    value: "in_person" as AppointmentMode,
    label: "زيارة حضورية",
    description: "موعد في العيادة",
    icon: MapPin,
  },
];

export function ConsultationModeSelector({
  availableModes,
  fees,
  selectedMode,
  onSelectMode,
}: ConsultationModeSelectorProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {MODES.map((mode) => {
        const isAvailable =
          availableModes[mode.value as keyof typeof availableModes];
        const fee = fees[mode.value as keyof typeof fees];
        const isSelected = selectedMode === mode.value;
        const Icon = mode.icon;

        return (
          <Card
            key={mode.value}
            className={cn(
              "cursor-pointer transition-all hover:shadow-md",
              isSelected && "ring-2 ring-primary",
              !isAvailable && "opacity-50 cursor-not-allowed"
            )}
            onClick={() => isAvailable && onSelectMode(mode.value)}
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  <div
                    className={cn(
                      "p-3 rounded-lg",
                      isSelected
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary"
                    )}
                  >
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1 flex items-center gap-2">
                      {mode.label}
                      {isSelected && (
                        <Check className="h-4 w-4 text-primary" />
                      )}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {mode.description}
                    </p>
                    {fee && (
                      <Badge variant="outline" className="mt-2">
                        {fee} ر.س
                      </Badge>
                    )}
                    {!isAvailable && (
                      <Badge variant="secondary" className="mt-2">
                        غير متوفر
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

