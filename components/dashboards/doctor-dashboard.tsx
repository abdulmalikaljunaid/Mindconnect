"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Users, Clock, TrendingUp, User, Video, MapPin } from "lucide-react"
import Link from "next/link"

export function DoctorDashboard() {
  const todayAppointments = [
    {
      id: 1,
      patient: "سارة جونسون",
      time: "10:00 صباحاً",
      duration: "50 دقيقة",
      type: "video",
      status: "قادم",
    },
    {
      id: 2,
      patient: "مايكل براون",
      time: "2:30 مساءً",
      duration: "30 دقيقة",
      type: "in-person",
      status: "قادم",
    },
    {
      id: 3,
      patient: "إيميلي ديفيس",
      time: "4:00 مساءً",
      duration: "50 دقيقة",
      type: "video",
      status: "قادم",
    },
  ]

  const recentPatients = [
    { id: 1, name: "سارة جونسون", lastVisit: "2025-01-10", status: "نشط" },
    { id: 2, name: "مايكل براون", lastVisit: "2025-01-08", status: "نشط" },
    { id: 3, name: "إيميلي ديفيس", lastVisit: "2025-01-05", status: "نشط" },
  ]

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
              <p className="text-xs text-muted-foreground">التالي في 10:00 صباحاً</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">المرضى النشطون</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">24</div>
              <p className="text-xs text-muted-foreground">3 جدد هذا الشهر</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">هذا الأسبوع</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">18</div>
              <p className="text-xs text-muted-foreground">جلسة مجدولة</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">رضا المرضى</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">4.9</div>
              <p className="text-xs text-accent">+0.2 من الشهر الماضي</p>
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
              {todayAppointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="flex items-center justify-between rounded-lg border border-border p-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{appointment.patient}</p>
                      <p className="text-sm text-muted-foreground">
                        {appointment.time} • {appointment.duration}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {appointment.type === "video" ? (
                      <Video className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                    )}
                    <Badge variant="secondary">{appointment.status}</Badge>
                  </div>
                </div>
              ))}
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
              {recentPatients.map((patient) => (
                <div key={patient.id} className="flex items-center justify-between rounded-lg border border-border p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{patient.name}</p>
                      <p className="text-sm text-muted-foreground">آخر زيارة: {patient.lastVisit}</p>
                    </div>
                  </div>
                  <Badge className="bg-accent text-accent-foreground">{patient.status}</Badge>
                </div>
              ))}
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
