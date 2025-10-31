"use client";

import { useMemo } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { Video, Phone, MessageSquare, MapPin, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ConsultationSession } from "@/types/consultation";

interface ConsultationHeaderProps {
  session: ConsultationSession;
  currentUserId: string;
}

const getModeIcon = (mode: string) => {
  switch (mode) {
    case "video":
      return <Video className="h-5 w-5" />;
    case "audio":
      return <Phone className="h-5 w-5" />;
    case "messaging":
      return <MessageSquare className="h-5 w-5" />;
    case "in_person":
      return <MapPin className="h-5 w-5" />;
    default:
      return <MessageSquare className="h-5 w-5" />;
  }
};

const getModeLabel = (mode: string) => {
  switch (mode) {
    case "video":
      return "استشارة فيديو";
    case "audio":
      return "استشارة صوتية";
    case "messaging":
      return "استشارة كتابية";
    case "in_person":
      return "زيارة حضورية";
    default:
      return "استشارة";
  }
};

export function ConsultationHeader({ session, currentUserId }: ConsultationHeaderProps) {
  const appointmentDate = useMemo(() => new Date(session.scheduledAt), [session.scheduledAt]);
  const isDoctor = useMemo(() => currentUserId === session.doctorId, [currentUserId, session.doctorId]);

  // معلومات الطرف الآخر
  const otherParty = isDoctor
    ? { name: session.patientName, avatar: session.patientAvatar }
    : { name: session.doctorName, avatar: session.doctorAvatar };

  const otherPartyInitials = otherParty.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="border-b bg-card p-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        {/* User Info */}
        <div className="flex items-center gap-4">
          <Avatar className="h-12 w-12">
            <AvatarImage src={otherParty.avatar || undefined} alt={otherParty.name} />
            <AvatarFallback>{otherPartyInitials}</AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-xl font-semibold">
              {isDoctor ? "مريض" : "دكتور"}: {otherParty.name}
            </h2>
            <div className="flex items-center gap-2 mt-1">
              {getModeIcon(session.mode)}
              <span className="text-sm text-muted-foreground">
                {getModeLabel(session.mode)}
              </span>
            </div>
          </div>
        </div>

        {/* Appointment Info */}
        <div className="flex items-center gap-6 flex-wrap">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <div className="text-sm">
              <div className="font-medium">
                {format(appointmentDate, "EEEE، d MMMM yyyy", { locale: ar })}
              </div>
              <div className="text-muted-foreground">
                {format(appointmentDate, "HH:mm", { locale: ar })} ({session.duration} دقيقة)
              </div>
            </div>
          </div>

          <Badge
            variant={
              session.status === "confirmed"
                ? "default"
                : session.status === "completed"
                ? "secondary"
                : "outline"
            }
          >
            {session.status === "confirmed"
              ? "مؤكد"
              : session.status === "completed"
              ? "مكتمل"
              : session.status}
          </Badge>
        </div>
      </div>

      {/* Reason */}
      {session.reason && (
        <div className="mt-4 pt-4 border-t">
          <p className="text-sm text-muted-foreground">
            <span className="font-medium">سبب الاستشارة:</span> {session.reason}
          </p>
        </div>
      )}
    </div>
  );
}





