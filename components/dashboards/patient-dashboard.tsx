"use client"

import { useMemo } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { SkeletonStatsCard, SkeletonCard } from "@/components/ui/skeleton-loader"
import { Calendar, User, FileText, Heart, Clock } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { usePatientAppointments } from "@/hooks/use-appointments"
import { format } from "date-fns"
import { ar } from "date-fns/locale"

export function PatientDashboard() {
  const { user } = useAuth()
  const { appointments, upcoming, confirmed, isLoading } = usePatientAppointments()

  // Get next appointment
  const nextAppointment = useMemo(() => {
    return upcoming.length > 0 ? upcoming[0] : null
  }, [upcoming])

  // Get appointment mode label
  const getModeLabel = (mode: string) => {
    switch (mode) {
      case "video":
        return "مكالمة فيديو"
      case "audio":
        return "استشارة صوتية"
      case "messaging":
        return "استشارة كتابية"
      case "in_person":
        return "زيارة حضورية"
      default:
        return mode
    }
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">مرحباً بعودتك</h1>
            <p className="text-muted-foreground">لوحة المتابعة - إدارة مواعيدك وصحتك النفسية</p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
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
          <h1 className="text-3xl font-bold">مرحباً بعودتك</h1>
          <p className="text-muted-foreground">لوحة المتابعة - إدارة مواعيدك وصحتك النفسية</p>
        </div>

        {/* Quick Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">المواعيد القادمة</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcoming.length}</div>
            <p className="text-xs text-muted-foreground">موعد مجدول</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">الموعد القادم</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {nextAppointment ? (
              <>
                <div className="text-2xl font-bold">
                  {format(new Date(nextAppointment.scheduledAt), "dd/MM", { locale: ar })}
                </div>
                <p className="text-xs text-muted-foreground">
                  {format(new Date(nextAppointment.scheduledAt), "HH:mm", { locale: ar })}
                </p>
              </>
            ) : (
              <>
                <div className="text-2xl font-bold">-</div>
                <p className="text-xs text-muted-foreground">لا توجد مواعيد</p>
              </>
            )}
          </CardContent>
        </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">صحتك النفسية</CardTitle>
              <Heart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">جيد</div>
              <p className="text-xs text-muted-foreground">استمر في المتابعة</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>الإجراءات السريعة</CardTitle>
              <CardDescription>المهام الشائعة لإدارة رعايتك</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button asChild className="w-full justify-start" variant="outline">
                <Link href="/find-doctors">
                  <User className="h-4 w-4 ml-2" />
                  ابحث عن طبيب
                </Link>
              </Button>
              <Button asChild className="w-full justify-start" variant="outline">
                <Link href="/book-appointment">
                  <Calendar className="h-4 w-4 ml-2" />
                  احجز موعد
                </Link>
              </Button>
              <Button asChild className="w-full justify-start" variant="outline">
                <Link href="/medical-history">
                  <FileText className="h-4 w-4 ml-2" />
                  السجل الطبي
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Upcoming Appointments */}
          <Card>
            <CardHeader>
              <CardTitle>المواعيد القادمة</CardTitle>
              <CardDescription>جلساتك المجدولة مع المتخصصين</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {upcoming.length > 0 ? (
                upcoming.slice(0, 3).map((appointment) => (
                  <div key={appointment.id} className="flex items-center justify-between rounded-lg border border-border p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                        <User className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{appointment.doctorName || "طبيب"}</p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(appointment.scheduledAt), "d MMMM yyyy", { locale: ar })}{" "}
                          • {format(new Date(appointment.scheduledAt), "HH:mm", { locale: ar })}
                        </p>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {getModeLabel(appointment.mode)}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-muted-foreground text-sm">
                  لا توجد مواعيد قادمة
                </div>
              )}
              <Button asChild variant="outline" className="w-full bg-transparent">
                <Link href="/appointments">عرض جميع المواعيد</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Profile Summary */}
        <Card>
          <CardHeader>
            <CardTitle>ملفك الشخصي</CardTitle>
            <CardDescription>معلوماتك الأساسية</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">الاسم</span>
              <span className="font-medium">{user?.name || "-"}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">البريد الإلكتروني</span>
              <span className="font-medium text-sm">{user?.email || "-"}</span>
            </div>
            <Button asChild variant="outline" className="w-full bg-transparent">
              <Link href="/profile">تعديل الملف الشخصي</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
