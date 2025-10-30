"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard-layout";
import { ProtectedRoute } from "@/components/protected-route";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  User,
  Calendar,
  Award,
  BookOpen,
  ArrowLeft,
  Languages,
  Briefcase,
  MapPin,
  Video,
  Phone,
  MessageSquare,
  Loader2,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { supabaseClient } from "@/lib/supabase-client";
import type { DoctorWithProfile } from "@/hooks/use-doctors";

export default function DoctorProfilePage() {
  const params = useParams();
  const router = useRouter();
  const doctorId = params.id as string;

  const [doctor, setDoctor] = useState<DoctorWithProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDoctorDetails = async () => {
      setIsLoading(true);
      try {
        // Fetch profile first
        const { data: profileData, error: profileError } = await supabaseClient
          .from("profiles")
          .select("id, name, email, bio, phone, is_approved, role")
          .eq("id", doctorId)
          .single();

        if (profileError) throw profileError;
        if (!profileData || !profileData.is_approved || profileData.role !== "doctor") {
          throw new Error("Doctor profile not found or not approved");
        }

        // Fetch doctor profile separately
        const { data: doctorProfileData, error: doctorProfileError } = await supabaseClient
          .from("doctor_profiles")
          .select("*")
          .eq("profile_id", doctorId)
          .single();

        if (doctorProfileError) {
          console.error("Doctor profile error:", doctorProfileError);
          // Continue even if doctor profile is missing, use defaults
        }

        // Fetch specialties
        const { data: specialtiesData } = await supabaseClient
          .from("doctor_specialties")
          .select("specialties(name)")
          .eq("doctor_id", doctorId);

        const specialties =
          specialtiesData?.map((item: any) => item.specialties?.name).filter(Boolean) ?? [];

        setDoctor({
          id: profileData.id,
          name: profileData.name || "غير محدد",
          email: profileData.email || "",
          isApproved: true,
          status: "approved",
          role: "doctor",
          phone: profileData.phone || null,
          licenseNumber: doctorProfileData?.license_number || null,
          experienceYears: doctorProfileData?.experience_years || null,
          education: doctorProfileData?.education || null,
          clinicAddress: doctorProfileData?.clinic_address || null,
          videoConsultationFee: doctorProfileData?.video_consultation_fee ?? 200,
          audioConsultationFee: doctorProfileData?.audio_consultation_fee ?? 150,
          messagingConsultationFee: doctorProfileData?.messaging_consultation_fee ?? 100,
          inPersonConsultationFee: doctorProfileData?.in_person_consultation_fee ?? 250,
          offersVideo: doctorProfileData?.offers_video ?? true,
          offersAudio: doctorProfileData?.offers_audio ?? true,
          offersMessaging: doctorProfileData?.offers_messaging ?? true,
          offersInPerson: doctorProfileData?.offers_in_person ?? true,
          languages: doctorProfileData?.languages || [],
          specialties,
        });
      } catch (error: any) {
        console.error("Error fetching doctor:", error);
        setError(error.message || "فشل في تحميل معلومات الدكتور");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDoctorDetails();
  }, [doctorId]);

  const getModeDetails = (mode: "video" | "audio" | "messaging" | "in_person") => {
    const details = {
      video: {
        icon: Video,
        label: "استشارة فيديو",
        fee: doctor?.videoConsultationFee,
        available: doctor?.offersVideo,
      },
      audio: {
        icon: Phone,
        label: "استشارة صوتية",
        fee: doctor?.audioConsultationFee,
        available: doctor?.offersAudio,
      },
      messaging: {
        icon: MessageSquare,
        label: "استشارة كتابية",
        fee: doctor?.messagingConsultationFee,
        available: doctor?.offersMessaging,
      },
      in_person: {
        icon: MapPin,
        label: "زيارة حضورية",
        fee: doctor?.inPersonConsultationFee,
        available: doctor?.offersInPerson,
      },
    };
    return details[mode];
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (error || !doctor) {
    return (
      <DashboardLayout>
        <div className="max-w-2xl mx-auto py-12">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error || "لم يتم العثور على معلومات الدكتور"}
            </AlertDescription>
          </Alert>
          <Button onClick={() => router.back()} className="mt-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            العودة
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <ProtectedRoute allowedRoles={["patient", "companion"]}>
      <DashboardLayout>
        <div className="mx-auto max-w-5xl space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <Button variant="outline" onClick={() => router.back()}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              العودة
            </Button>
            <Button asChild size="lg">
              <Link href={`/book-appointment?doctorId=${doctor.id}`}>
                <Calendar className="mr-2 h-4 w-4" />
                حجز موعد
              </Link>
            </Button>
          </div>

          {/* بطاقة المعلومات الأساسية */}
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary/10">
                  <User className="h-12 w-12 text-primary" />
                </div>
                <div className="flex-1 space-y-2">
                  <CardTitle className="text-3xl">{doctor.name}</CardTitle>
                  <div className="flex flex-wrap gap-2">
                    {doctor.specialties.map((spec, i) => (
                      <Badge key={i} variant="secondary">
                        {spec}
                      </Badge>
                    ))}
                  </div>
                  {doctor.experienceYears && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Briefcase className="h-4 w-4" />
                      <span>{doctor.experienceYears} سنوات خبرة</span>
                    </div>
                  )}
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* أنواع الاستشارات والأسعار */}
          <Card>
            <CardHeader>
              <CardTitle>أنواع الاستشارات المتاحة</CardTitle>
              <CardDescription>اختر الطريقة التي تفضل التواصل بها</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(["video", "audio", "messaging", "in_person"] as const).map((mode) => {
                  const details = getModeDetails(mode);
                  const Icon = details.icon;

                  if (!details.available) return null;

                  return (
                    <Card key={mode} className="border-2">
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-primary/10">
                              <Icon className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <p className="font-medium">{details.label}</p>
                              {details.fee && (
                                <p className="text-sm text-green-600 font-bold">
                                  {details.fee} ر.س
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* التعليم */}
          {doctor.education && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  التعليم
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{doctor.education}</p>
              </CardContent>
            </Card>
          )}

          {/* اللغات */}
          {doctor.languages && doctor.languages.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Languages className="h-5 w-5" />
                  اللغات
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {doctor.languages.map((lang, i) => (
                    <Badge key={i} variant="outline">
                      {lang}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* عنوان العيادة */}
          {doctor.clinicAddress && doctor.offersInPerson && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  عنوان العيادة
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{doctor.clinicAddress}</p>
              </CardContent>
            </Card>
          )}

          {/* زر الحجز */}
          <Card className="bg-primary/5 border-primary">
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                  <h3 className="font-semibold text-lg">جاهز لحجز موعد؟</h3>
                  <p className="text-sm text-muted-foreground">
                    احجز موعدك الآن واختر الوقت والطريقة المناسبين لك
                  </p>
                </div>
                <Button asChild size="lg">
                  <Link href={`/book-appointment?doctorId=${doctor.id}`}>
                    <Calendar className="mr-2 h-5 w-5" />
                    حجز موعد
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
