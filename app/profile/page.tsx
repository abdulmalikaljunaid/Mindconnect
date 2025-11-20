"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { ProtectedRoute } from "@/components/protected-route"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useAuth } from "@/contexts/auth-context"
import { User, Mail } from "lucide-react"

export default function ProfilePage() {
  const { user } = useAuth()
  const [isEditing, setIsEditing] = useState(false)

  return (
    <ProtectedRoute>
      <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">إعدادات الملف الشخصي</h1>
          <p className="text-muted-foreground">إدارة معلوماتك الشخصية</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>المعلومات الشخصية</CardTitle>
              <CardDescription>تحديث تفاصيل ملفك الشخصي</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">الاسم الكامل</Label>
                  <Input id="name" defaultValue={user?.name} disabled={!isEditing} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">البريد الإلكتروني</Label>
                  <Input id="email" type="email" defaultValue={user?.email} disabled={!isEditing} />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="phone">رقم الهاتف</Label>
                  <Input id="phone" type="tel" placeholder="+966 5XX XXX XXX" disabled={!isEditing} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dob">تاريخ الميلاد</Label>
                  <Input id="dob" type="date" disabled={!isEditing} />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">العنوان</Label>
                <Input id="address" placeholder="المدينة، الحي، الشارع" disabled={!isEditing} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">نبذة عني</Label>
                <Textarea id="bio" placeholder="اكتب نبذة مختصرة عنك..." rows={4} disabled={!isEditing} />
              </div>

              <div className="flex gap-2">
                {isEditing ? (
                  <>
                    <Button onClick={() => setIsEditing(false)}>حفظ التغييرات</Button>
                    <Button variant="outline" onClick={() => setIsEditing(false)} className="bg-transparent">
                      إلغاء
                    </Button>
                  </>
                ) : (
                  <Button onClick={() => setIsEditing(true)}>تعديل الملف الشخصي</Button>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>نظرة عامة على الحساب</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">الدور</p>
                    <p className="text-sm text-muted-foreground">
                      {user?.role === "patient" ? "مريض" : user?.role === "doctor" ? "طبيب" : user?.role === "companion" ? "مرافق" : "إداري"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <Mail className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">البريد الإلكتروني</p>
                    <p className="text-sm text-muted-foreground">{user?.email}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>جهة الاتصال للطوارئ</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="emergency-name">الاسم</Label>
                  <Input id="emergency-name" placeholder="اسم جهة الاتصال" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="emergency-phone">رقم الهاتف</Label>
                  <Input id="emergency-phone" type="tel" placeholder="+966 5XX XXX XXX" />
                </div>
                <Button variant="outline" className="w-full bg-transparent">
                  حفظ جهة الاتصال
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
    </ProtectedRoute>
  )
}
