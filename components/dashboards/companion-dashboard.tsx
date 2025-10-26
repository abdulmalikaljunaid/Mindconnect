"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Heart, Calendar, TrendingUp, User, Clock } from "lucide-react"
import Link from "next/link"

export function CompanionDashboard() {
  const patient = {
    name: "سارة أحمد",
    lastAppointment: "2025-01-10",
    nextAppointment: "2025-01-15",
    wellnessScore: 78,
  }

  const upcomingAppointments = [
    {
      id: 1,
      doctor: "د. سارة ويليامز",
      date: "2025-01-15",
      time: "10:00 صباحاً",
    },
  ]

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">لوحة المتابعة</h1>
          <p className="text-muted-foreground">دعم وتتبع رحلة المريض في الصحة النفسية</p>
        </div>

        {/* Quick Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">المريض</CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{patient.name}</div>
              <p className="text-xs text-muted-foreground">تحت رعايتك</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">الموعد القادم</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{patient.nextAppointment}</div>
              <p className="text-xs text-muted-foreground">الجلسة القادمة</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">مؤشر الصحة</CardTitle>
              <Heart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{patient.wellnessScore}%</div>
              <p className="text-xs text-accent">+5% من الأسبوع الماضي</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>الإجراءات السريعة</CardTitle>
              <CardDescription>دعم رعاية المريض</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button asChild className="w-full justify-start" variant="outline">
                <Link href="/patient-progress">
                  <Heart className="h-4 w-4 ml-2" />
                  عرض التقدم
                </Link>
              </Button>
              <Button asChild className="w-full justify-start" variant="outline">
                <Link href="/appointments">
                  <Calendar className="h-4 w-4 ml-2" />
                  عرض المواعيد
                </Link>
              </Button>
              <Button asChild className="w-full justify-start" variant="outline">
                <Link href="/profile">
                  <User className="h-4 w-4 ml-2" />
                  تعديل الملف الشخصي
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Upcoming Appointments */}
          <Card>
            <CardHeader>
              <CardTitle>المواعيد القادمة</CardTitle>
              <CardDescription>الجلسات المجدولة للمريض</CardDescription>
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
                    <Badge variant="secondary">مجدول</Badge>
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

        {/* Patient Info */}
        <Card>
          <CardHeader>
            <CardTitle>معلومات المريض</CardTitle>
            <CardDescription>التفاصيل الأساسية للمريض تحت رعايتك</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">الاسم</span>
              <span className="font-medium">{patient.name}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">آخر موعد</span>
              <span className="font-medium">{patient.lastAppointment}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">الموعد القادم</span>
              <span className="font-medium text-primary">{patient.nextAppointment}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
