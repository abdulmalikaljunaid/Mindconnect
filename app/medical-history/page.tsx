"use client"

import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FileText, Calendar } from "lucide-react"
import { supabaseClient } from "@/lib/supabase-client"
import { useAuth } from "@/contexts/auth-context"
import { Spinner } from "@/components/ui/spinner"

interface MedicalRecord {
  id: string
  date: string
  doctor: string
  type: string
  summary: string
  tags: string[]
}

export default function MedicalHistoryPage() {
  const { user } = useAuth()
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [totalSessions, setTotalSessions] = useState(0)
  const [lastSessionDate, setLastSessionDate] = useState<string | null>(null)
  const [activeTreatments, setActiveTreatments] = useState(0)

  useEffect(() => {
    if (!user) return

    const fetchMedicalRecords = async () => {
      setIsLoading(true)
      try {
        // جلب المواعيد المكتملة للمريض
        const { data: appointments, error: appointmentsError } = await supabaseClient
          .from("appointments")
          .select(`
            id,
            scheduled_at,
            status,
            notes,
            reason,
            doctor:profiles!appointments_doctor_id_fkey (
              id,
              name
            )
          `)
          .eq("patient_id", user.id)
          .eq("status", "completed")
          .order("scheduled_at", { ascending: false })

        if (appointmentsError) throw appointmentsError

        // جلب ملاحظات المواعيد
        const appointmentIds = appointments?.map(apt => apt.id) || []
        let appointmentNotes: Array<{
          appointment_id: string
          note: string
          created_at: string | null
          author: { name: string } | null
        }> = []

        if (appointmentIds.length > 0) {
          const { data: notes, error: notesError } = await supabaseClient
            .from("appointment_notes")
            .select(`
              appointment_id,
              note,
              created_at,
              author:profiles!appointment_notes_author_id_fkey (
                name
              )
            `)
            .in("appointment_id", appointmentIds)
            .eq("is_private", false)
            .order("created_at", { ascending: false })

          if (!notesError && notes) {
            appointmentNotes = notes.map(note => ({
              appointment_id: note.appointment_id,
              note: note.note,
              created_at: note.created_at,
              author: note.author as { name: string } | null,
            }))
          }
        }

        // دمج البيانات وإنشاء السجلات الطبية
        const records: MedicalRecord[] = []

        appointments?.forEach((appointment) => {
          const doctorName = (appointment.doctor as any)?.name || "طبيب غير معروف"
          const appointmentDate = new Date(appointment.scheduled_at)
          const formattedDate = appointmentDate.toISOString().split("T")[0]

          // إضافة السجل من الموعد نفسه إذا كان يحتوي على ملاحظات
          if (appointment.notes) {
            records.push({
              id: `appointment-${appointment.id}`,
              date: formattedDate,
              doctor: doctorName,
              type: "ملاحظات الجلسة",
              summary: appointment.notes,
              tags: appointment.reason ? [appointment.reason] : ["جلسة"],
            })
          }

          // إضافة ملاحظات الموعد
          const notesForAppointment = appointmentNotes.filter(
            note => note.appointment_id === appointment.id
          )

          notesForAppointment.forEach((note, index) => {
            records.push({
              id: `note-${appointment.id}-${index}`,
              date: note.created_at ? new Date(note.created_at).toISOString().split("T")[0] : formattedDate,
              doctor: note.author?.name || doctorName,
              type: "ملاحظات طبية",
              summary: note.note,
              tags: ["ملاحظات"],
            })
          })
        })

        // ترتيب السجلات حسب التاريخ (الأحدث أولاً)
        records.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

        setMedicalRecords(records)
        setTotalSessions(appointments?.length || 0)

        // آخر جلسة
        if (appointments && appointments.length > 0) {
          const lastSession = new Date(appointments[0].scheduled_at)
          setLastSessionDate(lastSession.toLocaleDateString("ar-SA", {
            month: "short",
            day: "numeric",
            year: "numeric"
          }))
        }

        // عدد العلاجات النشطة (المواعيد المؤكدة)
        const { count: activeCount } = await supabaseClient
          .from("appointments")
          .select("*", { count: "exact", head: true })
          .eq("patient_id", user.id)
          .eq("status", "confirmed")

        setActiveTreatments(activeCount || 0)
      } catch (error) {
        console.error("Error fetching medical records:", error)
        setMedicalRecords([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchMedicalRecords()
  }, [user])

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex min-h-[400px] items-center justify-center">
          <Spinner className="h-8 w-8" />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">السجل الطبي</h1>
          <p className="text-muted-foreground">رحلة صحتك النفسية الكاملة وسجلاتك الطبية</p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">إجمالي الجلسات</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalSessions}</div>
              <p className="text-xs text-muted-foreground">منذ الانضمام</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">آخر جلسة</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{lastSessionDate || "لا توجد"}</div>
              <p className="text-xs text-muted-foreground">
                {lastSessionDate ? new Date().getFullYear().toString() : ""}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">العلاجات النشطة</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeTreatments}</div>
              <p className="text-xs text-muted-foreground">جارية</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>السجلات الطبية</CardTitle>
            <CardDescription>التاريخ الكرونولوجي لجلساتك وعلاجاتك</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {medicalRecords.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                <p>لا توجد سجلات طبية متاحة حالياً</p>
              </div>
            ) : (
              medicalRecords.map((record) => (
                <div key={record.id} className="rounded-lg border border-border p-4">
                  <div className="mb-2 flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold">{record.type}</h3>
                      <p className="text-sm text-muted-foreground">
                        {record.doctor} • {record.date}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {record.tags.map((tag) => (
                        <Badge key={tag} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <p className="text-sm leading-relaxed">{record.summary}</p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
