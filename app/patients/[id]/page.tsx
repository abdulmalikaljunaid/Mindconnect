"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { User, Calendar, Mail, Phone, ArrowLeft, Loader2 } from "lucide-react"
import Link from "next/link"
import { supabaseClient } from "@/lib/supabase-client"
import { useAuth } from "@/contexts/auth-context"
import { Spinner } from "@/components/ui/spinner"

interface PatientData {
  id: string
  name: string
  email: string | null
  phone: string | null
  dateOfBirth: string | null
  address: string | null
  emergencyContact: string | null
  status: string
  totalSessions: number
  lastVisit: string | null
  nextAppointment: string | null
}

interface SessionNote {
  id: string
  date: string
  duration: string
  notes: string
  tags: string[]
}

interface AppointmentData {
  id: string
  date: string
  time: string
  type: string
  status: string
}

export default function PatientDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const patientId = params.id as string

  const [patient, setPatient] = useState<PatientData | null>(null)
  const [sessionNotes, setSessionNotes] = useState<SessionNote[]>([])
  const [appointments, setAppointments] = useState<AppointmentData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [newNote, setNewNote] = useState("")
  const [isSavingNote, setIsSavingNote] = useState(false)

  useEffect(() => {
    if (!user || user.role !== "doctor" || !patientId) return

    const fetchPatientData = async () => {
      setIsLoading(true)
      try {
        // جلب بيانات المريض
        const { data: profileData, error: profileError } = await supabaseClient
          .from("profiles")
          .select("id, name, email, phone")
          .eq("id", patientId)
          .single()

        if (profileError) throw profileError

        // جلب المواعيد للمريض مع هذا الطبيب
        const { data: appointmentsData, error: appointmentsError } = await supabaseClient
          .from("appointments")
          .select("id, scheduled_at, status, mode, duration_minutes")
          .eq("patient_id", patientId)
          .eq("doctor_id", user.id)
          .order("scheduled_at", { ascending: false })

        if (appointmentsError) throw appointmentsError

        // حساب الإحصائيات
        const completedAppointments = appointmentsData?.filter((apt) => apt.status === "completed") || []
        const upcomingAppointments = appointmentsData?.filter(
          (apt) => apt.status === "confirmed" || apt.status === "pending"
        ) || []

        const lastVisit =
          completedAppointments.length > 0
            ? new Date(completedAppointments[0].scheduled_at).toISOString().split("T")[0]
            : null

        const nextAppointment =
          upcomingAppointments.length > 0
            ? new Date(upcomingAppointments[0].scheduled_at).toISOString().split("T")[0]
            : null

        const status = completedAppointments.length > 0 || upcomingAppointments.length > 0 ? "نشط" : "غير نشط"

        setPatient({
          id: profileData.id,
          name: profileData.name || "غير محدد",
          email: profileData.email,
          phone: profileData.phone,
          dateOfBirth: null, // يمكن إضافته لاحقاً
          address: null, // يمكن إضافته لاحقاً
          emergencyContact: null, // يمكن إضافته لاحقاً
          status,
          totalSessions: completedAppointments.length,
          lastVisit,
          nextAppointment,
        })

        // تحويل المواعيد القادمة إلى الصيغة المطلوبة
        const formattedAppointments: AppointmentData[] = upcomingAppointments.map((apt) => {
          const date = new Date(apt.scheduled_at)
          const modeLabels: Record<string, string> = {
            video: "مكالمة فيديو",
            audio: "مكالمة صوتية",
            messaging: "رسائل",
            in_person: "حضوري",
          }
          const statusLabels: Record<string, string> = {
            pending: "قيد الانتظار",
            confirmed: "مؤكد",
            cancelled: "ملغي",
            completed: "مكتمل",
          }

          return {
            id: apt.id,
            date: date.toLocaleDateString("ar-SA"),
            time: date.toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" }),
            type: modeLabels[apt.mode] || apt.mode,
            status: statusLabels[apt.status] || apt.status,
          }
        })

        setAppointments(formattedAppointments)

        // ملاحظات الجلسات - يمكن إضافتها لاحقاً في جدول منفصل
        // حالياً سنستخدم ملاحظات من المواعيد المكتملة
        const notes: SessionNote[] = completedAppointments.slice(0, 5).map((apt, index) => {
          const date = new Date(apt.scheduled_at)
          return {
            id: apt.id,
            date: date.toLocaleDateString("ar-SA"),
            duration: `${apt.duration_minutes || 50} دقيقة`,
            notes: apt.notes || "لا توجد ملاحظات مسجلة",
            tags: [apt.status === "completed" ? "مكتمل" : apt.status],
          }
        })

        setSessionNotes(notes)
      } catch (error) {
        console.error("Error fetching patient data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchPatientData()
  }, [user, patientId])

  const handleSaveNote = async () => {
    if (!newNote.trim() || !patient) return

    setIsSavingNote(true)
    try {
      // يمكن إضافة منطق لحفظ الملاحظات في جدول منفصل لاحقاً
      // حالياً سنعرض رسالة نجاح
      setNewNote("")
      // إعادة تحميل البيانات
      window.location.reload()
    } catch (error) {
      console.error("Error saving note:", error)
    } finally {
      setIsSavingNote(false)
    }
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex min-h-[400px] items-center justify-center">
          <Spinner className="h-8 w-8" />
        </div>
      </DashboardLayout>
    )
  }

  if (!patient) {
    return (
      <DashboardLayout>
        <div className="flex min-h-[400px] items-center justify-center">
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">لم يتم العثور على بيانات المريض</p>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button asChild variant="ghost" size="icon">
            <Link href="/patients">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">تفاصيل المريض</h1>
            <p className="text-muted-foreground">عرض وإدارة معلومات المريض</p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* معلومات المريض */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                    <User className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <CardTitle>{patient.name}</CardTitle>
                    <Badge className="mt-1 bg-accent text-accent-foreground">{patient.status}</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {patient.email && (
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{patient.email}</span>
                  </div>
                )}
                {patient.phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{patient.phone}</span>
                  </div>
                )}
                {patient.dateOfBirth && (
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>تاريخ الميلاد: {patient.dateOfBirth}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">إحصائيات سريعة</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">إجمالي الجلسات</p>
                  <p className="text-2xl font-bold">{patient.totalSessions}</p>
                </div>
                {patient.lastVisit && (
                  <div>
                    <p className="text-sm text-muted-foreground">آخر زيارة</p>
                    <p className="font-medium">{patient.lastVisit}</p>
                  </div>
                )}
                {patient.nextAppointment && (
                  <div>
                    <p className="text-sm text-muted-foreground">الموعد القادم</p>
                    <p className="font-medium">{patient.nextAppointment}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {patient.emergencyContact && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">جهة الاتصال للطوارئ</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{patient.emergencyContact}</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* المحتوى الرئيسي */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="notes" className="space-y-4">
              <TabsList>
                <TabsTrigger value="notes">ملاحظات الجلسات</TabsTrigger>
                <TabsTrigger value="appointments">المواعيد</TabsTrigger>
              </TabsList>

              <TabsContent value="notes" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>إضافة ملاحظة جديدة</CardTitle>
                    <CardDescription>توثيق جلسة اليوم</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Textarea
                      placeholder="اكتب ملاحظات الجلسة هنا..."
                      rows={4}
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                    />
                    <Button onClick={handleSaveNote} disabled={isSavingNote || !newNote.trim()}>
                      {isSavingNote ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          جاري الحفظ...
                        </>
                      ) : (
                        "حفظ الملاحظة"
                      )}
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>الجلسات السابقة</CardTitle>
                    <CardDescription>سجل ملاحظات الجلسات</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {sessionNotes.length === 0 ? (
                      <p className="text-center text-muted-foreground">لا توجد ملاحظات مسجلة</p>
                    ) : (
                      sessionNotes.map((note) => (
                        <div key={note.id} className="rounded-lg border border-border p-4">
                          <div className="mb-2 flex items-start justify-between">
                            <div>
                              <p className="font-medium">{note.date}</p>
                              <p className="text-sm text-muted-foreground">{note.duration}</p>
                            </div>
                            <div className="flex gap-2">
                              {note.tags.map((tag) => (
                                <Badge key={tag} variant="secondary">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <p className="text-sm leading-relaxed">{note.notes}</p>
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="appointments" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>المواعيد القادمة</CardTitle>
                    <CardDescription>الجلسات المجدولة مع هذا المريض</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {appointments.length === 0 ? (
                      <p className="text-center text-muted-foreground">لا توجد مواعيد قادمة</p>
                    ) : (
                      <>
                        {appointments.map((appointment) => (
                          <div
                            key={appointment.id}
                            className="flex items-center justify-between rounded-lg border border-border p-4"
                          >
                            <div>
                              <p className="font-medium">{appointment.date}</p>
                              <p className="text-sm text-muted-foreground">
                                {appointment.time} • {appointment.type}
                              </p>
                            </div>
                            <Badge variant="secondary">{appointment.status}</Badge>
                          </div>
                        ))}
                        <Button asChild variant="outline" className="w-full bg-transparent">
                          <Link href={`/book-appointment?patient=${patient.id}`}>جدولة موعد جديد</Link>
                        </Button>
                      </>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
