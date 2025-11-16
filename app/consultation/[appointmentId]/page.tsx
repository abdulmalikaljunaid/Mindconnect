"use client";

import { useEffect, useState, useMemo, lazy, Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard-layout";
import { ProtectedRoute } from "@/components/protected-route";
import { ConsultationHeader } from "@/components/consultation/consultation-header";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, ArrowRight, Video, Phone, MapPin, AlertCircle } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { supabaseClient } from "@/lib/supabase-client";
import type { ConsultationSession } from "@/types/consultation";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

// Lazy load ChatWindow for better performance
const ChatWindow = lazy(() => import("@/components/consultation/chat-window").then(mod => ({ default: mod.ChatWindow })));

export default function ConsultationPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const appointmentId = params?.appointmentId as string;
  
  const [session, setSession] = useState<ConsultationSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // جلب معلومات الموعد
  useEffect(() => {
    if (!appointmentId || !user) return;

    const fetchSession = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // جلب معلومات الموعد
        const { data: appointment, error: appointmentError } = await supabaseClient
          .from("appointments")
          .select(
            `
            *,
            doctor:profiles!appointments_doctor_id_fkey (
              id,
              name,
              avatar_url
            ),
            patient:profiles!appointments_patient_id_fkey (
              id,
              name,
              avatar_url
            ),
            companion:profiles!appointments_companion_id_fkey (
              id,
              name,
              avatar_url
            )
          `
          )
          .eq("id", appointmentId)
          .single();

        if (appointmentError) throw appointmentError;

        // التحقق من أن المستخدم لديه صلاحية للوصول لهذا الموعد
        const hasAccess =
          appointment.doctor_id === user.id ||
          appointment.patient_id === user.id ||
          (appointment.companion_id && appointment.companion_id === user.id);

        if (!hasAccess) {
          throw new Error("ليس لديك صلاحية للوصول لهذه الاستشارة");
        }

        // التحقق من حالة الموعد
        if (appointment.status !== "confirmed" && appointment.status !== "completed") {
          setError("هذا الموعد غير مؤكد بعد. يرجى الانتظار حتى يتم تأكيد الموعد من قبل الدكتور.");
          setIsLoading(false);
          return;
        }

        const appointmentDate = new Date(appointment.scheduled_at);
        const now = new Date();
        const timeDiff = appointmentDate.getTime() - now.getTime();
        const minutesUntilAppointment = timeDiff / (1000 * 60);

        // حساب ما إذا كان يمكن بدء الاستشارة (للفيديو/الصوت: قبل 10 دقائق)
        const canStartVideoCall =
          (appointment.mode === "video" || appointment.mode === "audio") &&
          minutesUntilAppointment <= 10 &&
          minutesUntilAppointment >= -appointment.duration_minutes;

        const doctorRel = Array.isArray(appointment.doctor)
          ? appointment.doctor[0]
          : appointment.doctor;
        const patientRel = Array.isArray(appointment.patient)
          ? appointment.patient[0]
          : appointment.patient;
        const companionRel = Array.isArray(appointment.companion)
          ? appointment.companion[0]
          : appointment.companion;

        const sessionData: ConsultationSession = {
          appointmentId: appointment.id,
          doctorId: appointment.doctor_id,
          doctorName: doctorRel?.name || "دكتور",
          doctorAvatar: doctorRel?.avatar_url || null,
          patientId: appointment.patient_id,
          patientName: patientRel?.name || "مريض",
          patientAvatar: patientRel?.avatar_url || null,
          companionId: companionRel?.id ?? appointment.companion_id ?? null,
          mode: appointment.mode,
          status: appointment.status,
          scheduledAt: appointment.scheduled_at,
          duration: appointment.duration_minutes,
          reason: appointment.reason,
          canStartVideoCall,
        };

        setSession(sessionData);
      } catch (err: any) {
        console.error("Error fetching session:", err);
        setError(err.message || "فشل في جلب معلومات الاستشارة");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSession();
  }, [appointmentId, user]);

  // إرسال رسالة ترحيب تلقائية عند أول فتح للمحادثة (تم إزالتها لتجنب التكرار)
  // الرسائل الترحيبية يجب أن تُرسل من قبل النظام، ليس من هنا

  if (!user) return null;

  if (isLoading) {
    return (
      <ProtectedRoute allowedRoles={["patient", "doctor", "companion"]}>
        <DashboardLayout>
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  if (error || !session) {
    return (
      <ProtectedRoute allowedRoles={["patient", "doctor", "companion"]}>
        <DashboardLayout>
          <div className="space-y-6">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error || "حدث خطأ"}</AlertDescription>
            </Alert>
            <Button onClick={() => router.push("/appointments")}>
              <ArrowRight className="mr-2 h-4 w-4" />
              العودة إلى المواعيد
            </Button>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  const appointmentDate = new Date(session.scheduledAt);
  const now = new Date();
  const timeDiff = appointmentDate.getTime() - now.getTime();
  const minutesUntilAppointment = timeDiff / (1000 * 60);
  const canStartVideoCall =
    (session.mode === "video" || session.mode === "audio") &&
    minutesUntilAppointment <= 10 &&
    minutesUntilAppointment >= -session.duration;

  return (
    <ProtectedRoute allowedRoles={["patient", "doctor", "companion"]}>
      <DashboardLayout>
        <div className="flex flex-col h-[calc(100vh-8rem)] space-y-6">
          {/* Header */}
          <ConsultationHeader session={session} currentUserId={user.id} />

          {/* Video/Audio Call Button (if applicable) */}
          {(session.mode === "video" || session.mode === "audio") && (
            <Alert>
              {canStartVideoCall ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {session.mode === "video" ? (
                      <Video className="h-5 w-5" />
                    ) : (
                      <Phone className="h-5 w-5" />
                    )}
                    <span>يمكنك الآن بدء الاستشارة</span>
                  </div>
                  <Button>
                    {session.mode === "video" ? "بدء مكالمة الفيديو" : "بدء المكالمة الصوتية"}
                  </Button>
                </div>
              ) : minutesUntilAppointment > 10 ? (
                <AlertDescription>
                  يمكنك بدء الاستشارة قبل 10 دقائق من الموعد المحدد.
                  المتبقي: {Math.ceil(minutesUntilAppointment)} دقيقة
                </AlertDescription>
              ) : (
                <AlertDescription>
                  انتهى وقت الاستشارة المحدد.
                </AlertDescription>
              )}
            </Alert>
          )}

          {/* In-Person Clinic Address */}
          {session.mode === "in_person" && (
            <Alert>
              <MapPin className="h-4 w-4" />
              <AlertDescription>
                عنوان العيادة سيظهر هنا بعد إضافة هذه المعلومة من قبل الدكتور
              </AlertDescription>
            </Alert>
          )}

          {/* Chat Window */}
          <div className="flex-1 min-h-0">
            <Suspense fallback={
              <div className="flex items-center justify-center h-full">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            }>
              <ChatWindow appointmentId={appointmentId} />
            </Suspense>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}



