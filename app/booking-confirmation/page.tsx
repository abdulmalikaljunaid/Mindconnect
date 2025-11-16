"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, Calendar, Download, Loader2 } from "lucide-react"
import Link from "next/link"
import { supabaseClient } from "@/lib/supabase-client"
import { format } from "date-fns"
import { ar } from "date-fns/locale"
import { useAuth } from "@/contexts/auth-context"
import { Spinner } from "@/components/ui/spinner"

interface AppointmentData {
  id: string
  doctorName: string
  scheduledAt: string
  mode: "video" | "in_person" | "audio" | "messaging"
  durationMinutes: number
  consultationFee: number | null
}

function BookingConfirmationContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { user } = useAuth()
  const appointmentId = searchParams.get("appointmentId")
  
  const [appointment, setAppointment] = useState<AppointmentData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchAppointment = async () => {
      if (!appointmentId || !user) {
        setIsLoading(false)
        return
      }

      try {
        // جلب بيانات الموعد من قاعدة البيانات
        const { data: appointmentData, error: appointmentError } = await supabaseClient
          .from("appointments")
          .select("id, scheduled_at, mode, duration_minutes, consultation_fee, doctor_id")
          .eq("id", appointmentId)
          .eq("patient_id", user.id)
          .single()

        if (appointmentError) throw appointmentError

        if (!appointmentData) {
          setError("الموعد غير موجود")
          setIsLoading(false)
          return
        }

        // جلب اسم الدكتور
        const { data: doctorData, error: doctorError } = await supabaseClient
          .from("profiles")
          .select("name")
          .eq("id", appointmentData.doctor_id)
          .single()

        if (doctorError) throw doctorError

        setAppointment({
          id: appointmentData.id,
          doctorName: doctorData?.name || "دكتور",
          scheduledAt: appointmentData.scheduled_at,
          mode: appointmentData.mode,
          durationMinutes: appointmentData.duration_minutes,
          consultationFee: appointmentData.consultation_fee,
        })
      } catch (err: any) {
        console.error("Error fetching appointment:", err)
        setError(err.message || "حدث خطأ أثناء جلب بيانات الموعد")
      } finally {
        setIsLoading(false)
      }
    }

    fetchAppointment()
  }, [appointmentId, user])

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex min-h-[400px] items-center justify-center">
          <Spinner className="h-8 w-8" />
        </div>
      </DashboardLayout>
    )
  }

  if (error || !appointment) {
    return (
      <DashboardLayout>
        <div className="mx-auto max-w-2xl space-y-6">
          <Card className="text-center">
            <CardHeader>
              <CardTitle className="text-2xl text-destructive">خطأ</CardTitle>
              <CardDescription>{error || "الموعد غير موجود"}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild>
                <Link href="/appointments">العودة إلى المواعيد</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    )
  }

  const appointmentDate = new Date(appointment.scheduledAt)
  const getModeLabel = (mode: string) => {
    switch (mode) {
      case "video":
        return "مكالمة فيديو"
      case "audio":
        return "مكالمة صوتية"
      case "messaging":
        return "رسائل نصية"
      case "in_person":
        return "حضوري"
      default:
        return "غير محدد"
    }
  }
  const modeLabel = getModeLabel(appointment.mode)

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-2xl space-y-6">
        <Card className="text-center">
          <CardHeader>
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-accent/10">
              <CheckCircle className="h-8 w-8 text-accent" />
            </div>
            <CardTitle className="text-2xl">تم تأكيد الموعد!</CardTitle>
            <CardDescription>تم جدولة موعدك بنجاح</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="rounded-lg border border-border bg-muted p-6 text-left">
              <h3 className="mb-4 font-semibold">تفاصيل الموعد</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">الطبيب</span>
                  <span className="font-medium">د. {appointment.doctorName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">التاريخ</span>
                  <span className="font-medium">
                    {format(appointmentDate, "EEEE، d MMMM yyyy", { locale: ar })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">الوقت</span>
                  <span className="font-medium">
                    {format(appointmentDate, "hh:mm a", { locale: ar })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">النوع</span>
                  <span className="font-medium">{modeLabel}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">المدة</span>
                  <span className="font-medium">{appointment.durationMinutes} دقيقة</span>
                </div>
                {appointment.consultationFee && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">التكلفة</span>
                    <span className="font-medium text-green-600">
                      {appointment.consultationFee} ر.س
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-lg bg-secondary p-4 text-left text-sm">
              <p className="font-medium">ماذا بعد؟</p>
              <ul className="mt-2 space-y-1 text-muted-foreground">
                <li>• ستصلك رسالة تأكيد عبر البريد الإلكتروني قريباً</li>
                <li>• سيتم إرسال تذكير قبل 24 ساعة من موعدك</li>
                <li>• بالنسبة لمكالمات الفيديو، سيتم إرسال رابط الاجتماع قبل 15 دقيقة من الموعد</li>
              </ul>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <Button asChild className="flex-1">
                <Link href="/appointments">
                  <Calendar className="mr-2 h-4 w-4" />
                  عرض جميع المواعيد
                </Link>
              </Button>
              <Button asChild variant="outline" className="flex-1 bg-transparent">
                <Link href="/dashboard">الذهاب إلى لوحة التحكم</Link>
              </Button>
            </div>

            <Button variant="ghost" className="w-full">
              <Download className="mr-2 h-4 w-4" />
              تحميل حدث التقويم
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}

export default function BookingConfirmationPage() {
  return (
    <Suspense
      fallback={
        <DashboardLayout>
          <div className="flex min-h-[400px] items-center justify-center">
            <Spinner className="h-8 w-8" />
          </div>
        </DashboardLayout>
      }
    >
      <BookingConfirmationContent />
    </Suspense>
  )
}

