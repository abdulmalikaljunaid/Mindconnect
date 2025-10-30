"use client";

import { memo } from "react";

import { Calendar, Clock, Video, Phone, MessageSquare, MapPin, User, MessageCircle } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AppointmentMode, AppointmentStatus } from "@/types/appointments";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { useRouter } from "next/navigation";

interface AppointmentCardProps {
  id: string;
  scheduledAt: string;
  duration: number;
  status: AppointmentStatus;
  mode: AppointmentMode;
  reason: string | null;
  consultationFee: number | null;
  doctorName?: string | null;
  patientName?: string | null;
  rejectionReason?: string | null;
  onConfirm?: (id: string) => void;
  onReject?: (id: string) => void;
  onCancel?: (id: string) => void;
  onViewDetails?: (id: string) => void;
  showActions?: boolean;
  userRole: "patient" | "doctor" | "companion";
}

const getModeIcon = (mode: AppointmentMode) => {
  switch (mode) {
    case "video":
      return <Video className="h-4 w-4" />;
    case "audio":
      return <Phone className="h-4 w-4" />;
    case "messaging":
      return <MessageSquare className="h-4 w-4" />;
    case "in_person":
      return <MapPin className="h-4 w-4" />;
  }
};

const getModeLabel = (mode: AppointmentMode) => {
  switch (mode) {
    case "video":
      return "استشارة فيديو";
    case "audio":
      return "استشارة صوتية";
    case "messaging":
      return "استشارة كتابية";
    case "in_person":
      return "زيارة حضورية";
  }
};

const getStatusBadge = (status: AppointmentStatus) => {
  switch (status) {
    case "pending":
      return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300">قيد الانتظار</Badge>;
    case "confirmed":
      return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">مؤكد</Badge>;
    case "completed":
      return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300">مكتمل</Badge>;
    case "cancelled":
      return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-300">ملغي</Badge>;
    case "no_show":
      return <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-300">لم يحضر</Badge>;
    case "rescheduled":
      return <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-300">معاد جدولته</Badge>;
  }
};

function AppointmentCardComponent({
  id,
  scheduledAt,
  duration,
  status,
  mode,
  reason,
  consultationFee,
  doctorName,
  patientName,
  rejectionReason,
  onConfirm,
  onReject,
  onCancel,
  onViewDetails,
  showActions = false,
  userRole,
}: AppointmentCardProps) {
  const router = useRouter();
  const appointmentDate = new Date(scheduledAt);
  const isPast = appointmentDate < new Date();
  
  // حساب إذا كان يمكن بدء الاستشارة
  const canStartConsultation = () => status === "confirmed" || status === "completed";

  const handleStartConsultation = () => {
    router.push(`/consultation/${id}`);
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            {getModeIcon(mode)}
            <span className="font-medium text-sm">{getModeLabel(mode)}</span>
          </div>
          {getStatusBadge(status)}
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* معلومات الطرف الآخر */}
        {userRole === "doctor" && patientName && (
          <div className="flex items-center gap-2 text-sm">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">المريض:</span>
            <span className="font-medium">{patientName}</span>
          </div>
        )}
        
        {(userRole === "patient" || userRole === "companion") && doctorName && (
          <div className="flex items-center gap-2 text-sm">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">الدكتور:</span>
            <span className="font-medium">{doctorName}</span>
          </div>
        )}

        {/* التاريخ والوقت */}
        <div className="flex items-center gap-2 text-sm">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span>{format(appointmentDate, "EEEE، d MMMM yyyy", { locale: ar })}</span>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span>{format(appointmentDate, "hh:mm a", { locale: ar })} ({duration} دقيقة)</span>
        </div>

        {/* السبب */}
        {reason && (
          <div className="text-sm">
            <span className="text-muted-foreground">السبب:</span>
            <p className="mt-1 text-sm">{reason}</p>
          </div>
        )}

        {/* السعر */}
        {consultationFee && (
          <div className="text-sm font-medium text-green-600">
            {consultationFee} ر.س
          </div>
        )}

        {/* سبب الرفض */}
        {status === "cancelled" && rejectionReason && (
          <div className="text-sm text-red-600 bg-red-50 p-2 rounded-md">
            <span className="font-medium">سبب الإلغاء:</span>
            <p className="mt-1">{rejectionReason}</p>
          </div>
        )}
      </CardContent>

      {showActions && (
        <CardFooter className="flex gap-2 pt-3 border-t">
          {/* أزرار للدكتور */}
          {userRole === "doctor" && status === "pending" && (
            <>
              <Button
                size="sm"
                onClick={() => onConfirm?.(id)}
                className="flex-1"
              >
                قبول
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onReject?.(id)}
                className="flex-1"
              >
                رفض
              </Button>
            </>
          )}

          {/* زر بدء الاستشارة للمواعيد المؤكدة */}
          {(status === "confirmed" || status === "completed") && canStartConsultation() && (
            <Button
              size="sm"
              onClick={handleStartConsultation}
              className="flex-1"
            >
              <MessageCircle className="mr-2 h-4 w-4" />
              بدء الاستشارة
            </Button>
          )}

          {/* أزرار للمريض */}
          {(userRole === "patient" || userRole === "companion") && (status === "pending" || status === "confirmed") && !isPast && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onCancel?.(id)}
              className="flex-1"
            >
              إلغاء
            </Button>
          )}

          {/* عرض التفاصيل */}
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onViewDetails?.(id)}
          >
            التفاصيل
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}

// Memoize the component to prevent unnecessary re-renders
export const AppointmentCard = memo(AppointmentCardComponent)

