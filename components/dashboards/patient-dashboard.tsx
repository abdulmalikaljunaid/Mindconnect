"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, User, FileText } from "lucide-react"
import Link from "next/link"

export function PatientDashboard() {
  const upcomingAppointments = [
    {
      id: 1,
      doctor: "د. سارة ويليامز",
      specialty: "أخصائية نفسية إكلينيكية",
      date: "2025-01-15",
      time: "10:00 صباحاً",
      type: "مكالمة فيديو",
    },
    {
      id: 2,
      doctor: "د. مايكل تشين",
      specialty: "طبيب نفسي",
      date: "2025-01-20",
      time: "2:30 مساءً",
      type: "حضوري",
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">مرحباً بعودتك</h1>
        <p className="text-muted-foreground">لوحة المريض - إدارة مواعيدك وصحتك النفسية</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>الإجراءات السريعة</CardTitle>
          <CardDescription>المهام الشائعة لإدارة رعايتك</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <Button asChild className="h-auto flex-col gap-2 py-4">
            <Link href="/find-doctors">
              <User className="h-6 w-6" />
              <span>ابحث عن طبيب</span>
            </Link>
          </Button>
          <Button asChild variant="outline" className="h-auto flex-col gap-2 py-4 bg-transparent">
            <Link href="/book-appointment">
              <Calendar className="h-6 w-6" />
              <span>احجز موعد</span>
            </Link>
          </Button>
          <Button asChild variant="outline" className="h-auto flex-col gap-2 py-4 bg-transparent">
            <Link href="/medical-history">
              <FileText className="h-6 w-6" />
              <span>السجل الطبي</span>
            </Link>
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>المواعيد القادمة</CardTitle>
          <CardDescription>جلساتك المجدولة مع المتخصصين في الصحة النفسية</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {upcomingAppointments.map((appointment) => (
            <div key={appointment.id} className="flex items-center justify-between rounded-lg border border-border p-4">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <User className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="font-semibold">{appointment.doctor}</p>
                  <p className="text-sm text-muted-foreground">{appointment.specialty}</p>
                </div>
              </div>
              <div className="text-left">
                <p className="font-medium">{appointment.date}</p>
                <p className="text-sm text-muted-foreground">
                  {appointment.time} • {appointment.type}
                </p>
              </div>
            </div>
          ))}
          <Button asChild variant="outline" className="w-full bg-transparent">
            <Link href="/appointments">عرض جميع المواعيد</Link>
          </Button>
        </CardContent>
      </Card>

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
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">رقم الهاتف</span>
            <span className="font-medium">+966 50 123 4567</span>
          </div>
          <Button asChild variant="outline" className="w-full bg-transparent">
            <Link href="/profile">تعديل الملف الشخصي</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
