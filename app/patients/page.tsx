"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { User, Search, FileText, Calendar } from "lucide-react"
import Link from "next/link"
import { supabaseClient } from "@/lib/supabase-client"
import { useAuth } from "@/contexts/auth-context"
import { Spinner } from "@/components/ui/spinner"

interface PatientData {
  id: string
  name: string
  email: string | null
  phone: string | null
  lastVisit: string | null
  nextAppointment: string | null
  status: string
  totalSessions: number
}

export default function PatientsPage() {
  const { user } = useAuth()
  const [searchQuery, setSearchQuery] = useState("")
  const [patients, setPatients] = useState<PatientData[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!user || user.role !== "doctor") return

    const fetchPatients = async () => {
      setIsLoading(true)
      try {
        // جلب جميع المواعيد للطبيب
        const { data: appointments, error: appointmentsError } = await supabaseClient
          .from("appointments")
          .select(`
            id,
            patient_id,
            scheduled_at,
            status,
            patient:profiles!appointments_patient_id_fkey (
              id,
              name,
              email
            )
          `)
          .eq("doctor_id", user.id)
          .order("scheduled_at", { ascending: false })

        if (appointmentsError) throw appointmentsError

        // تجميع المرضى مع حساب الجلسات
        const patientMap = new Map<string, {
          id: string
          name: string
          email: string | null
          appointments: Array<{ scheduled_at: string; status: string }>
        }>()

        appointments?.forEach((apt) => {
          const patient = apt.patient as any
          if (!patient) return

          if (!patientMap.has(patient.id)) {
            patientMap.set(patient.id, {
              id: patient.id,
              name: patient.name,
              email: patient.email,
              appointments: [],
            })
          }

          const patientData = patientMap.get(patient.id)!
          patientData.appointments.push({
            scheduled_at: apt.scheduled_at,
            status: apt.status,
          })
        })

        // تحويل البيانات إلى الصيغة المطلوبة
        const formattedPatients: PatientData[] = Array.from(patientMap.values()).map((patientData) => {
          const completedAppointments = patientData.appointments.filter(
            (apt) => apt.status === "completed"
          )
          const upcomingAppointments = patientData.appointments.filter(
            (apt) => apt.status === "confirmed" || apt.status === "pending"
          )

          const lastVisit = completedAppointments.length > 0
            ? new Date(completedAppointments[0].scheduled_at).toISOString().split("T")[0]
            : null

          const nextAppointment = upcomingAppointments.length > 0
            ? new Date(upcomingAppointments[0].scheduled_at).toISOString().split("T")[0]
            : null

          const status = completedAppointments.length > 0 || upcomingAppointments.length > 0
            ? "نشط"
            : "غير نشط"

          return {
            id: patientData.id,
            name: patientData.name,
            email: patientData.email,
            phone: null, // يمكن إضافة رقم الهاتف لاحقاً من جدول profiles
            lastVisit,
            nextAppointment,
            status,
            totalSessions: completedAppointments.length,
          }
        })

        // ترتيب حسب آخر زيارة
        formattedPatients.sort((a, b) => {
          if (!a.lastVisit && !b.lastVisit) return 0
          if (!a.lastVisit) return 1
          if (!b.lastVisit) return -1
          return new Date(b.lastVisit).getTime() - new Date(a.lastVisit).getTime()
        })

        setPatients(formattedPatients)
      } catch (error) {
        console.error("Error fetching patients:", error)
        setPatients([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchPatients()
  }, [user])

  const filteredPatients = patients.filter((patient) =>
    patient.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">مرضاي</h1>
            <p className="text-muted-foreground">إدارة قائمة المرضى وسجلاتهم</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="البحث عن المرضى بالاسم..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{patients.filter((p) => p.status === "نشط").length}</div>
              <p className="text-sm text-muted-foreground">المرضى النشطون</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{patients.length}</div>
              <p className="text-sm text-muted-foreground">إجمالي المرضى</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{patients.reduce((sum, p) => sum + p.totalSessions, 0)}</div>
              <p className="text-sm text-muted-foreground">إجمالي الجلسات</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{patients.filter((p) => p.nextAppointment).length}</div>
              <p className="text-sm text-muted-foreground">المواعيد القادمة</p>
            </CardContent>
          </Card>
        </div>

        {/* Patient List */}
        <div className="space-y-4">
          {filteredPatients.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">لا توجد مرضى</p>
              </CardContent>
            </Card>
          ) : (
            filteredPatients.map((patient) => (
              <Card key={patient.id}>
                <CardContent className="pt-6">
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="flex gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                        <User className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="mb-1 flex items-center gap-2">
                          <h3 className="font-semibold">{patient.name}</h3>
                          <Badge
                            className={
                              patient.status === "نشط"
                                ? "bg-accent text-accent-foreground"
                                : "bg-muted text-muted-foreground"
                            }
                          >
                            {patient.status}
                          </Badge>
                        </div>
                        {patient.email && <p className="text-sm text-muted-foreground">{patient.email}</p>}
                        <div className="mt-2 flex flex-wrap gap-4 text-sm text-muted-foreground">
                          {patient.lastVisit && (
                            <>
                              <span>آخر زيارة: {patient.lastVisit}</span>
                              <span>•</span>
                            </>
                          )}
                          <span>{patient.totalSessions} جلسة</span>
                          {patient.nextAppointment && (
                            <>
                              <span>•</span>
                              <span>التالي: {patient.nextAppointment}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button asChild variant="outline" size="sm" className="bg-transparent">
                        <Link href={`/patients/${patient.id}`}>
                          <FileText className="mr-2 h-4 w-4" />
                          عرض الملاحظات
                        </Link>
                      </Button>
                      <Button asChild variant="outline" size="sm" className="bg-transparent">
                        <Link href={`/book-appointment?patient=${patient.id}`}>
                          <Calendar className="mr-2 h-4 w-4" />
                          جدولة
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
