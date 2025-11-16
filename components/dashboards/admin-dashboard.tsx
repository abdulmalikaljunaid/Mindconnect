"use client"

import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, UserCheck, Clock, TrendingUp, Shield, AlertCircle } from "lucide-react"
import Link from "next/link"
import { supabaseClient } from "@/lib/supabase-client"
import { useAuth } from "@/contexts/auth-context"
import { Spinner } from "@/components/ui/spinner"
import { useAdminDoctors } from "@/hooks/use-doctors"

interface PendingDoctor {
  id: string
  name: string
  specialty: string
  email: string
  submittedDate: string
  experience: string
}

interface RecentActivity {
  id: string
  action: string
  user: string
  time: string
}

export function AdminDashboard() {
  const { user } = useAuth()
  const { pending } = useAdminDoctors()
  const [pendingDoctors, setPendingDoctors] = useState<PendingDoctor[]>([])
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeDoctors: 0,
    pendingApprovals: 0,
    totalAppointments: 0,
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!user) return

    const fetchDashboardData = async () => {
      setIsLoading(true)
      try {
        // جلب إحصائيات المستخدمين
        const { count: totalUsersCount } = await supabaseClient
          .from("profiles")
          .select("*", { count: "exact", head: true })

        // جلب عدد الأطباء المعتمدين
        const { count: activeDoctorsCount } = await supabaseClient
          .from("profiles")
          .select("*", { count: "exact", head: true })
          .eq("role", "doctor")
          .eq("is_approved", true)

        // جلب عدد المواعيد
        const { count: appointmentsCount } = await supabaseClient
          .from("appointments")
          .select("*", { count: "exact", head: true })

        setStats({
          totalUsers: totalUsersCount || 0,
          activeDoctors: activeDoctorsCount || 0,
          pendingApprovals: pending.length,
          totalAppointments: appointmentsCount || 0,
        })

        // تحويل الأطباء المعلقة إلى الصيغة المطلوبة
        const formattedPending: PendingDoctor[] = pending.slice(0, 5).map((doctor) => {
          const specialties = doctor.specialties?.join(", ") || "غير محدد"
          const experience = doctor.experienceYears
            ? `${doctor.experienceYears} سنوات`
            : "غير محدد"
          const submittedDate = doctor.submittedAt
            ? new Date(doctor.submittedAt).toISOString().split("T")[0]
            : "غير محدد"

          return {
            id: doctor.id,
            name: doctor.name,
            specialty: specialties,
            email: doctor.email || "",
            submittedDate,
            experience,
          }
        })

        setPendingDoctors(formattedPending)

        // جلب النشاطات الأخيرة (التسجيلات الجديدة)
        const { data: recentProfiles } = await supabaseClient
          .from("profiles")
          .select("id, name, role, created_at")
          .order("created_at", { ascending: false })
          .limit(10)

        const activities: RecentActivity[] = []
        if (recentProfiles) {
          recentProfiles.forEach((profile, index) => {
            const timeAgo = getTimeAgo(profile.created_at)
            let action = ""
            if (profile.role === "doctor") {
              action = "تسجيل طبيب جديد"
            } else if (profile.role === "patient") {
              action = "تسجيل مريض جديد"
            } else if (profile.role === "companion") {
              action = "تسجيل مرافق جديد"
            } else {
              action = "تسجيل مستخدم جديد"
            }

            activities.push({
              id: profile.id,
              action,
              user: profile.name,
              time: timeAgo,
            })
          })
        }

        setRecentActivity(activities.slice(0, 5))
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchDashboardData()
  }, [user, pending])

  const getTimeAgo = (date: string | null): string => {
    if (!date) return "غير محدد"
    const now = new Date()
    const past = new Date(date)
    const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000)

    if (diffInSeconds < 60) return "منذ لحظات"
    if (diffInSeconds < 3600) return `منذ ${Math.floor(diffInSeconds / 60)} دقيقة`
    if (diffInSeconds < 86400) return `منذ ${Math.floor(diffInSeconds / 3600)} ساعة`
    if (diffInSeconds < 604800) return `منذ ${Math.floor(diffInSeconds / 86400)} يوم`
    return `منذ ${Math.floor(diffInSeconds / 604800)} أسبوع`
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

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">لوحة تحكم الأدمن</h1>
          <p className="text-muted-foreground">إدارة المستخدمين والموافقات وإعدادات النظام</p>
        </div>

        {/* Quick Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">إجمالي المستخدمين</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
              <p className="text-xs text-muted-foreground">مستخدم مسجل</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">الأطباء النشطون</CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeDoctors}</div>
              <p className="text-xs text-muted-foreground">أطباء معتمدون</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">الموافقات المعلقة</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingApprovals}</div>
              <p className="text-xs text-accent">تتطلب الاهتمام</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">إجمالي المواعيد</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalAppointments}</div>
              <p className="text-xs text-muted-foreground">موعد محجوز</p>
            </CardContent>
          </Card>
        </div>

        {/* Pending Doctor Approvals */}
        {pendingDoctors.length > 0 && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-accent" />
                    موافقات الأطباء المعلقة
                  </CardTitle>
                  <CardDescription>مراجعة والموافقة على تسجيلات الأطباء الجدد</CardDescription>
                </div>
                <Button asChild>
                  <Link href="/doctor-approvals">عرض الكل</Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {pendingDoctors.map((doctor) => (
                <div key={doctor.id} className="flex items-center justify-between rounded-lg border border-border p-4">
                  <div>
                    <p className="font-semibold">{doctor.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {doctor.specialty} • {doctor.experience} خبرة
                    </p>
                    <p className="text-xs text-muted-foreground">تاريخ التقديم: {doctor.submittedDate}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button asChild size="sm">
                      <Link href={`/doctor-approvals?doctor=${doctor.id}`}>مراجعة</Link>
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>النشاطات الأخيرة</CardTitle>
              <CardDescription>أحدث الأحداث والإجراءات في النظام</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentActivity.length === 0 ? (
                <p className="py-4 text-center text-sm text-muted-foreground">لا توجد نشاطات حديثة</p>
              ) : (
                recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3 text-sm">
                    <div className="mt-0.5 flex h-2 w-2 rounded-full bg-primary" />
                    <div className="flex-1">
                      <p className="font-medium">{activity.action}</p>
                      <p className="text-muted-foreground">
                        {activity.user} • {activity.time}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>إجراءات سريعة</CardTitle>
              <CardDescription>المهام الإدارية الشائعة</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <Button asChild className="h-auto flex-col gap-2 py-4">
                <Link href="/doctor-approvals">
                  <Shield className="h-6 w-6" />
                  <span>موافقات الأطباء</span>
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-auto flex-col gap-2 py-4 bg-transparent">
                <Link href="/users">
                  <Users className="h-6 w-6" />
                  <span>إدارة المستخدمين</span>
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
