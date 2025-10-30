"use client"

import { useMemo } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { SkeletonStatsCard, SkeletonCard } from "@/components/ui/skeleton-loader"
import { Calendar, Users, Clock, TrendingUp, User, Video, MapPin } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { useDoctorAppointments } from "@/hooks/use-appointments"
import { format, isToday, startOfDay, endOfDay } from "date-fns"
import { ar } from "date-fns/locale"
import { supabaseClient } from "@/lib/supabase-client"
import { useEffect, useState } from "react"

export function DoctorDashboard() {
  const { user } = useAuth()
  const { appointments, upcoming, confirmed, isLoading } = useDoctorAppointments()
  const [patientCount, setPatientCount] = useState(0)

  // Get today's appointments
  const todayAppointments = useMemo(() => {
    const today = new Date()
    return upcoming.filter((apt) => {
      const aptDate = new Date(apt.scheduledAt)
      return isToday(aptDate)
    })
  }, [upcoming])

  // Get unique patients count
  useEffect(() => {
    const fetchPatientCount = async () => {
      if (!user) return
      try {
        const { data } = await supabaseClient
          .from("appointments")
          .select("patient_id")
          .eq("doctor_id", user.id)
          .in("status", ["pending", "confirmed", "completed"])
        
        const uniquePatients = new Set(data?.map((apt) => apt.patient_id) || [])
        setPatientCount(uniquePatients.size)
      } catch (error) {
        console.error("Error fetching patient count:", error)
      }
    }
    fetchPatientCount()
  }, [user])

  const getModeIcon = (mode: string) => {
    switch (mode) {
      case "video":
        return <Video className="h-4 w-4 text-muted-foreground" />
      case "in_person":
        return <MapPin className="h-4 w-4 text-muted-foreground" />
      default:
        return <User className="h-4 w-4 text-muted-foreground" />
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "pending":
        return "قيد الانتظار"
      case "confirmed":
        return "مؤكد"
      case "completed":
        return "مكتمل"
      default:
        return status
    }
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">لوحة تحكم الطبيب</h1>
            <p className="text-muted-foreground">إدارة عيادتك ومرضاك</p>
          </div>
          <div className="grid gap-4 md:grid-cols-4">
            <SkeletonStatsCard />
            <SkeletonStatsCard />
            <SkeletonStatsCard />
            <SkeletonStatsCard />
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            <SkeletonCard />
            <SkeletonCard />
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">لوحة تحكم الطبيب</h1>
          <p className="text-muted-foreground">إدارة عيادتك ومرضاك</p>
        </div>

        {/* Quick Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">مواعيد اليوم</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{todayAppointments.length}</div>
              <p className="text-xs text-muted-foreground">
                {todayAppointments.length > 0
                  ? `التالي في ${format(new Date(todayAppointments[0].scheduledAt), "HH:mm", { locale: ar })}`
                  : "لا توجد مواعيد اليوم"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">المرضى النشطون</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{patientCount}</div>
              <p className="text-xs text-muted-foreground">مرضى نشطون</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">المواعيد المؤكدة</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{confirmed.length}</div>
              <p className="text-xs text-muted-foreground">جلسة مؤكدة</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">رضا المرضى</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{appointments.length}</div>
              <p className="text-xs text-muted-foreground">إجمالي المواعيد</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Today's Schedule */}
          <Card>
            <CardHeader>
              <CardTitle>جدول اليوم</CardTitle>
              <CardDescription>مواعيدك لهذا اليوم</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {todayAppointments.length > 0 ? (
                todayAppointments.slice(0, 5).map((appointment) => (
                  <div
                    key={appointment.id}
                    className="flex items-center justify-between rounded-lg border border-border p-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                        <User className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{appointment.patientName || "مريض"}</p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(appointment.scheduledAt), "HH:mm", { locale: ar })}{" "}
                          • {appointment.durationMinutes} دقيقة
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getModeIcon(appointment.mode)}
                      <Badge variant="secondary">{getStatusLabel(appointment.status)}</Badge>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-muted-foreground text-sm">
                  لا توجد مواعيد لهذا اليوم
                </div>
              )}
              <Button asChild variant="outline" className="w-full bg-transparent">
                <Link href="/appointments">عرض جميع المواعيد</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Recent Patients */}
          <Card>
            <CardHeader>
              <CardTitle>المرضى الأخيرون</CardTitle>
              <CardDescription>المرضى الذين قابلتهم مؤخراً</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {confirmed.length > 0 ? (
                confirmed.slice(0, 5).map((appointment) => (
                  <div key={appointment.id} className="flex items-center justify-between rounded-lg border border-border p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                        <User className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{appointment.patientName || "مريض"}</p>
                        <p className="text-sm text-muted-foreground">
                          آخر زيارة: {format(new Date(appointment.scheduledAt), "d MMMM yyyy", { locale: ar })}
                        </p>
                      </div>
                    </div>
                    <Badge className="bg-accent text-accent-foreground">نشط</Badge>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-muted-foreground text-sm">
                  لا توجد مواعيد مؤكدة
                </div>
              )}
              <Button asChild variant="outline" className="w-full bg-transparent">
                <Link href="/patients">عرض جميع المرضى</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>الإجراءات السريعة</CardTitle>
            <CardDescription>المهام الشائعة لإدارة عيادتك</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-3">
            <Button asChild className="h-auto flex-col gap-2 py-4">
              <Link href="/availability">
                <Calendar className="h-6 w-6" />
                <span>إدارة الأوقات المتاحة</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-auto flex-col gap-2 py-4 bg-transparent">
              <Link href="/patients">
                <Users className="h-6 w-6" />
                <span>عرض المرضى</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-auto flex-col gap-2 py-4 bg-transparent">
              <Link href="/profile">
                <User className="h-6 w-6" />
                <span>تعديل الملف الشخصي</span>
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
