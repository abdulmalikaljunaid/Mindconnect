"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Calendar, Clock, DollarSign, User, FileText, MessageCircle } from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { AppointmentMode, AppointmentStatus } from "@/types/appointments";
import { useRouter } from "next/navigation";

interface AppointmentDetailsDialogProps {
  open: boolean;
  onClose: () => void;
  appointment: {
    id: string;
    scheduledAt: string;
    durationMinutes: number;
    status: AppointmentStatus;
    mode: AppointmentMode;
    reason: string | null;
    notes: string | null;
    consultationFee: number | null;
    rejectionReason: string | null;
    doctorName?: string | null;
    patientName?: string | null;
  } | null;
  userRole: "patient" | "doctor" | "companion";
  onConfirm?: (notes?: string) => Promise<void> | void;
  onReject?: (reason: string) => Promise<void> | void;
  onCancel?: (notes?: string) => Promise<void> | void;
  isLoading?: boolean;
}

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

const getStatusLabel = (status: AppointmentStatus) => {
  switch (status) {
    case "pending":
      return "قيد الانتظار";
    case "confirmed":
      return "مؤكد";
    case "completed":
      return "مكتمل";
    case "cancelled":
      return "ملغي";
    case "no_show":
      return "لم يحضر";
    case "rescheduled":
      return "معاد جدولته";
  }
};

export function AppointmentDetailsDialog({
  open,
  onClose,
  appointment,
  userRole,
  onConfirm,
  onReject,
  onCancel,
  isLoading = false,
}: AppointmentDetailsDialogProps) {
  const router = useRouter();
  const [actionNotes, setActionNotes] = useState("");
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [showCancelForm, setShowCancelForm] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  if (!appointment) return null;

  const appointmentDate = new Date(appointment.scheduledAt);
  const isPast = appointmentDate < new Date();

  // حساب إذا كان يمكن بدء الاستشارة
  const canStartConsultation = () => appointment.status === "confirmed" || appointment.status === "completed";

  const handleStartConsultation = () => {
    onClose();
    router.push(`/consultation/${appointment.id}`);
  };

  const handleConfirm = async () => {
    setIsProcessing(true);
    try {
      await onConfirm?.(actionNotes || undefined);
      setActionNotes("");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!actionNotes.trim()) {
      alert("الرجاء إدخال سبب الرفض");
      return;
    }
    setIsProcessing(true);
    try {
      await onReject?.(actionNotes);
      setActionNotes("");
      setShowRejectForm(false);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancel = async () => {
    setIsProcessing(true);
    try {
      await onCancel?.(actionNotes || undefined);
      setActionNotes("");
      setShowCancelForm(false);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>تفاصيل الموعد</DialogTitle>
          <DialogDescription>
            معلومات كاملة عن هذا الموعد
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* الحالة */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">الحالة:</span>
            <Badge>{getStatusLabel(appointment.status)}</Badge>
          </div>

          <Separator />

          {/* معلومات الأطراف */}
          {appointment.doctorName && (
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">الدكتور:</span>
              <span className="font-medium">{appointment.doctorName}</span>
            </div>
          )}

          {appointment.patientName && (
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">المريض:</span>
              <span className="font-medium">{appointment.patientName}</span>
            </div>
          )}

          <Separator />

          {/* التاريخ والوقت */}
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">التاريخ:</span>
            <span className="font-medium">
              {format(appointmentDate, "EEEE، d MMMM yyyy", { locale: ar })}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">الوقت:</span>
            <span className="font-medium">
              {format(appointmentDate, "hh:mm a", { locale: ar })} ({appointment.durationMinutes} دقيقة)
            </span>
          </div>

          {/* نوع الاستشارة */}
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">نوع الاستشارة:</span>
            <span className="font-medium">{getModeLabel(appointment.mode)}</span>
          </div>

          {/* السعر */}
          {appointment.consultationFee && (
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">التكلفة:</span>
              <span className="font-medium text-green-600">
                {appointment.consultationFee} ر.س
              </span>
            </div>
          )}

          <Separator />

          {/* السبب */}
          {appointment.reason && (
            <div className="space-y-2">
              <Label>سبب الزيارة:</Label>
              <p className="text-sm text-muted-foreground p-3 bg-secondary/50 rounded-lg">
                {appointment.reason}
              </p>
            </div>
          )}

          {/* الملاحظات */}
          {appointment.notes && (
            <div className="space-y-2">
              <Label>ملاحظات:</Label>
              <p className="text-sm text-muted-foreground p-3 bg-secondary/50 rounded-lg">
                {appointment.notes}
              </p>
            </div>
          )}

          {/* سبب الرفض/الإلغاء */}
          {appointment.status === "cancelled" && appointment.rejectionReason && (
            <div className="space-y-2">
              <Label className="text-destructive">سبب الإلغاء:</Label>
              <p className="text-sm p-3 bg-destructive/10 text-destructive rounded-lg">
                {appointment.rejectionReason}
              </p>
            </div>
          )}

          {/* نموذج الرفض */}
          {showRejectForm && (
            <div className="space-y-2 p-4 border rounded-lg">
              <Label>سبب الرفض *</Label>
              <Textarea
                value={actionNotes}
                onChange={(e) => setActionNotes(e.target.value)}
                placeholder="اكتب سبب رفض هذا الموعد..."
                rows={3}
              />
            </div>
          )}

          {/* نموذج الإلغاء */}
          {showCancelForm && (
            <div className="space-y-2 p-4 border rounded-lg">
              <Label>ملاحظات الإلغاء (اختياري)</Label>
              <Textarea
                value={actionNotes}
                onChange={(e) => setActionNotes(e.target.value)}
                placeholder="أضف أي ملاحظات حول الإلغاء..."
                rows={3}
              />
            </div>
          )}
        </div>

        <DialogFooter className="flex gap-2">
          {/* زر بدء الاستشارة للمواعيد المؤكدة */}
          {(appointment.status === "confirmed" || appointment.status === "completed") && canStartConsultation() && (
            <Button onClick={handleStartConsultation} className="flex-1">
              <MessageCircle className="mr-2 h-4 w-4" />
              بدء الاستشارة
            </Button>
          )}

          {/* أزرار للدكتور */}
          {userRole === "doctor" && appointment.status === "pending" && !showRejectForm && (
            <>
              <Button onClick={handleConfirm} disabled={isProcessing || isLoading}>
                {isProcessing ? "جاري التأكيد..." : "قبول الموعد"}
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowRejectForm(true)}
                disabled={isProcessing || isLoading}
              >
                رفض الموعد
              </Button>
            </>
          )}

          {/* زر تأكيد الرفض */}
          {showRejectForm && (
            <>
              <Button onClick={handleReject} variant="destructive" disabled={isProcessing || isLoading}>
                {isProcessing ? "جاري الرفض..." : "تأكيد الرفض"}
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  setShowRejectForm(false);
                  setActionNotes("");
                }}
                disabled={isProcessing}
              >
                إلغاء
              </Button>
            </>
          )}

          {/* أزرار للمريض */}
          {(userRole === "patient" || userRole === "companion") &&
            (appointment.status === "pending" || appointment.status === "confirmed") &&
            !isPast &&
            !showCancelForm && (
              <Button
                variant="outline"
                onClick={() => setShowCancelForm(true)}
                disabled={isProcessing || isLoading}
              >
                إلغاء الموعد
              </Button>
            )}

          {/* زر تأكيد الإلغاء */}
          {showCancelForm && (
            <>
              <Button onClick={handleCancel} variant="destructive" disabled={isProcessing || isLoading}>
                {isProcessing ? "جاري الإلغاء..." : "تأكيد الإلغاء"}
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  setShowCancelForm(false);
                  setActionNotes("");
                }}
              >
                إلغاء
              </Button>
            </>
          )}

          {/* زر الإغلاق */}
          {!showRejectForm && !showCancelForm && (
            <Button variant="ghost" onClick={onClose}>
              إغلاق
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

