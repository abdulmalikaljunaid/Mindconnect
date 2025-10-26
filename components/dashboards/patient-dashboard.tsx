"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, User, FileText, Heart, Clock } from "lucide-react"
import Link from "next/link"

export function PatientDashboard() {
  const upcomingAppointments = [
    {
      id: 1,
      doctor: "د. سارة ويليامز",
      date: "2025-01-15",
      time: "10:00 صباحاً",
      type: "مكالمة فيديو",
    },
    {
      id: 2,
      doctor: "د. مايكل تشين",
      date: "2025-01-20",
      time: "2:30 مساءً",
      type: "حضوري",
    },
  ]

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
              <div className="text-2xl font-bold">{upcomingAppointments.length}</div>
              <p className="text-xs text-muted-foreground">موعد مجدول</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">الموعد القادم</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2025-01-15</div>
              <p className="text-xs text-muted-foreground">10:00 صباحاً</p>
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
              {upcomingAppointments.length > 0 ? (
                upcomingAppointments.map((appointment) => (
                  <div key={appointment.id} className="flex items-center justify-between rounded-lg border border-border p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                        <User className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{appointment.doctor}</p>
                        <p className="text-sm text-muted-foreground">
                          {appointment.date} • {appointment.time}
                        </p>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {appointment.type}
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
              <span className="font-medium">محمد أحمد</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">البريد الإلكتروني</span>
              <span className="font-medium">mohamed@example.com</span>
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
