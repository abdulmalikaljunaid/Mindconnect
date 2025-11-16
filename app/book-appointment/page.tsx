"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard-layout";
import { ProtectedRoute } from "@/components/protected-route";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { ConsultationModeSelector } from "@/components/appointments/consultation-mode-selector";
import { TimeSlotPicker } from "@/components/appointments/time-slot-picker";
import { User, ArrowLeft, AlertCircle, CheckCircle } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { supabaseClient } from "@/lib/supabase-client";
import { usePatientAppointments } from "@/hooks/use-appointments";
import type { AppointmentMode, TimeSlot } from "@/types/appointments";
import type { DoctorWithProfile } from "@/hooks/use-doctors";

export default function BookAppointmentPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const doctorId = searchParams.get("doctorId");

  const [doctor, setDoctor] = useState<DoctorWithProfile | null>(null);
  const [isLoadingDoctor, setIsLoadingDoctor] = useState(true);
  const [selectedMode, setSelectedMode] = useState<AppointmentMode | undefined>(undefined);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | undefined>(undefined);
  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { createAppointment } = usePatientAppointments();

  // جلب بيانات الدكتور
  useEffect(() => {
    // تحديد doctorId من URL أو localStorage (من صفحة التقييم)
    let actualDoctorId = doctorId;
    
    if (!actualDoctorId) {
      try {
        const selectedDoctor = localStorage.getItem('selectedDoctor');
        if (selectedDoctor) {
          const doctor = JSON.parse(selectedDoctor);
          actualDoctorId = doctor.id;
          // تحديث URL بدون إعادة تحميل الصفحة
          if (actualDoctorId) {
            router.replace(`/book-appointment?doctorId=${actualDoctorId}`, { scroll: false });
          }
        }
      } catch (error) {
        console.error('Error reading selectedDoctor from localStorage:', error);
      }
    }
    
    if (!actualDoctorId) {
      router.push("/find-doctors");
      return;
    }

    const fetchDoctor = async () => {
      setIsLoadingDoctor(true);
      try {
        // Fetch profile first
        const { data: profileData, error: profileError } = await supabaseClient
          .from("profiles")
          .select("id, name, email, bio, is_approved, role")
          .eq("id", actualDoctorId!)
          .single();

        if (profileError) throw profileError;
        if (!profileData || !profileData.is_approved || profileData.role !== "doctor") {
          throw new Error("Doctor not found or not approved");
        }

        // Fetch doctor profile and specialties in parallel
        const [doctorProfileResult, specialtiesResult] = await Promise.all([
          supabaseClient
            .from("doctor_profiles")
            .select("*")
            .eq("profile_id", actualDoctorId!)
            .single(),
          supabaseClient
            .from("doctor_specialties")
            .select("specialties(name)")
            .eq("doctor_id", actualDoctorId!)
        ]);

        const { data: doctorProfileData, error: doctorProfileError } = doctorProfileResult;
        const { data: specialtiesData } = specialtiesResult;

        if (doctorProfileError) {
          console.error("Doctor profile error:", doctorProfileError);
          // Continue with defaults
        }

        const specialties =
          specialtiesData?.map((item: any) => item.specialties?.name).filter(Boolean) ?? [];

        setDoctor({
          id: profileData.id,
          name: profileData.name || "غير محدد",
          email: profileData.email || "",
          isApproved: true,
          status: "approved",
          role: "doctor",
          videoConsultationFee: doctorProfileData?.video_consultation_fee ?? 200,
          audioConsultationFee: doctorProfileData?.audio_consultation_fee ?? 150,
          messagingConsultationFee: doctorProfileData?.messaging_consultation_fee ?? 100,
          inPersonConsultationFee: doctorProfileData?.in_person_consultation_fee ?? 250,
          offersVideo: doctorProfileData?.offers_video ?? true,
          offersAudio: doctorProfileData?.offers_audio ?? true,
          offersMessaging: doctorProfileData?.offers_messaging ?? true,
          offersInPerson: doctorProfileData?.offers_in_person ?? true,
          languages: doctorProfileData?.languages || [],
          education: doctorProfileData?.education || null,
          experienceYears: doctorProfileData?.experience_years || null,
          specialties,
        });
      } catch (error) {
        console.error("Error fetching doctor:", error);
        router.push("/find-doctors");
      } finally {
        setIsLoadingDoctor(false);
      }
    };

    fetchDoctor();
  }, [doctorId, router]);
  
  // تنظيف localStorage بعد تحميل الدكتور بنجاح
  useEffect(() => {
    if (doctor && localStorage.getItem('selectedDoctor')) {
      localStorage.removeItem('selectedDoctor');
      localStorage.removeItem('assessmentResult');
    }
  }, [doctor]);

  const handleTimeSlotSelect = (date: Date, slot: TimeSlot) => {
    setSelectedDate(date);
    setSelectedSlot(slot);
  };

  const handleSubmit = async () => {
    if (!user || !doctor || !selectedMode || !selectedDate || !selectedSlot || !reason.trim()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // إنشاء ISO timestamp للموعد
      const appointmentTime = new Date(selectedDate);
      const [hours, minutes] = selectedSlot.start.split(":");
      appointmentTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

      // حساب السعر حسب نوع الاستشارة
      const fee =
        selectedMode === "video"
          ? doctor.videoConsultationFee
          : selectedMode === "audio"
          ? doctor.audioConsultationFee
          : selectedMode === "messaging"
          ? doctor.messagingConsultationFee
          : doctor.inPersonConsultationFee;

      const success = await createAppointment({
        doctorId: doctor.id,
        patientId: user.id,
        scheduledAt: appointmentTime.toISOString(),
        duration: 50, // مدة افتراضية
        mode: selectedMode,
        reason: reason.trim(),
        notes: notes.trim() || undefined,
        consultationFee: fee || 0,
      });

      if (success) {
        router.push("/booking-confirmation");
      }
    } catch (error) {
      console.error("Error booking appointment:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const canSubmit =
    selectedMode && selectedDate && selectedSlot && reason.trim().length > 0 && !isSubmitting;

  if (!user) return null;

  return (
    <ProtectedRoute allowedRoles={["patient", "companion"]}>
      <DashboardLayout>
        <div className="mx-auto max-w-5xl space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">حجز موعد</h1>
              <p className="text-muted-foreground">اختر الوقت ونوع الاستشارة المناسبين</p>
            </div>
            <Button variant="outline" onClick={() => router.back()}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              العودة
            </Button>
          </div>

          {isLoadingDoctor ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
            </div>
          ) : !doctor ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>لم يتم العثور على معلومات الدكتور</AlertDescription>
            </Alert>
          ) : (
            <>
              {/* بيانات الدكتور */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                      <User className="h-8 w-8 text-primary" />
                    </div>
                    <div>
                      <CardTitle>{doctor.name}</CardTitle>
                      <CardDescription>
                        {doctor.specialties.join(" • ")}
                        {doctor.experienceYears && ` • ${doctor.experienceYears} سنوات خبرة`}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>

              {/* نوع الاستشارة */}
              <Card>
                <CardHeader>
                  <CardTitle>اختر نوع الاستشارة</CardTitle>
                  <CardDescription>حدد الطريقة التي تفضل التواصل بها مع الدكتور</CardDescription>
                </CardHeader>
                <CardContent>
                  <ConsultationModeSelector
                    availableModes={{
                      video: doctor.offersVideo ?? false,
                      audio: doctor.offersAudio ?? false,
                      messaging: doctor.offersMessaging ?? false,
                      in_person: doctor.offersInPerson ?? false,
                    }}
                    fees={{
                      video: doctor.videoConsultationFee ?? null,
                      audio: doctor.audioConsultationFee ?? null,
                      messaging: doctor.messagingConsultationFee ?? null,
                      in_person: doctor.inPersonConsultationFee ?? null,
                    }}
                    selectedMode={selectedMode}
                    onSelectMode={setSelectedMode}
                  />
                </CardContent>
              </Card>

              {/* اختيار التاريخ والوقت */}
              {selectedMode && (
                <Card>
                  <CardHeader>
                    <CardTitle>اختر التاريخ والوقت</CardTitle>
                    <CardDescription>حدد اليوم والوقت المناسبين لموعدك</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <TimeSlotPicker
                      doctorId={doctor.id}
                      onSelectSlot={handleTimeSlotSelect}
                      selectedDate={selectedDate}
                      selectedSlot={selectedSlot}
                    />
                  </CardContent>
                </Card>
              )}

              {/* سبب الزيارة */}
              {selectedDate && selectedSlot && (
                <Card>
                  <CardHeader>
                    <CardTitle>تفاصيل الموعد</CardTitle>
                    <CardDescription>أخبرنا عن سبب زيارتك</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="reason">سبب الزيارة *</Label>
                      <Textarea
                        id="reason"
                        placeholder="صف الأعراض أو المشكلة التي تعاني منها..."
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        rows={4}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="notes">ملاحظات إضافية (اختياري)</Label>
                      <Textarea
                        id="notes"
                        placeholder="أي معلومات إضافية تود مشاركتها مع الدكتور..."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        rows={3}
                      />
                    </div>

                    <Separator />

                    {/* ملخص الحجز */}
                    <div className="space-y-2">
                      <h4 className="font-medium">ملخص الحجز</h4>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <p>
                          <span className="font-medium">الموعد:</span>{" "}
                          {selectedDate.toLocaleDateString("ar-SA", {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}{" "}
                          في {selectedSlot.start}
                        </p>
                        <p>
                          <span className="font-medium">نوع الاستشارة:</span>{" "}
                          {selectedMode === "video"
                            ? "استشارة فيديو"
                            : selectedMode === "audio"
                            ? "استشارة صوتية"
                            : selectedMode === "messaging"
                            ? "استشارة كتابية"
                            : "زيارة حضورية"}
                        </p>
                        {selectedMode && (
                          <p>
                            <span className="font-medium">التكلفة:</span>{" "}
                            <span className="text-green-600 font-bold">
                              {selectedMode === "video"
                                ? doctor.videoConsultationFee
                                : selectedMode === "audio"
                                ? doctor.audioConsultationFee
                                : selectedMode === "messaging"
                                ? doctor.messagingConsultationFee
                                : doctor.inPersonConsultationFee}{" "}
                              ر.س
                            </span>
                          </p>
                        )}
                      </div>
                    </div>

                    <Alert>
                      <CheckCircle className="h-4 w-4" />
                      <AlertDescription>
                        سيتم إرسال طلبك إلى الدكتور للموافقة. ستتلقى إشعاراً عند قبول أو رفض الموعد.
                      </AlertDescription>
                    </Alert>

                    <Button
                      onClick={handleSubmit}
                      disabled={!canSubmit}
                      className="w-full"
                      size="lg"
                    >
                      {isSubmitting ? "جارٍ الحجز..." : "تأكيد الحجز"}
                    </Button>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
