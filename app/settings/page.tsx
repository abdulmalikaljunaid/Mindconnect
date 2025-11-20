"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SessionInfo } from "@/components/session-info"

export default function SettingsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">الإعدادات</h1>
          <p className="text-muted-foreground">إدارة إعدادات النظام والتكوينات</p>
        </div>

        <Tabs defaultValue="general" className="space-y-4">
          <TabsList>
            <TabsTrigger value="general">عام</TabsTrigger>
            <TabsTrigger value="notifications">الإشعارات</TabsTrigger>
            <TabsTrigger value="security">الأمان</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>إعدادات المنصة</CardTitle>
                <CardDescription>تكوين الإعدادات العامة للمنصة</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="platform-name">اسم المنصة</Label>
                  <Input id="platform-name" defaultValue="Mindconnect" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="support-email">البريد الإلكتروني للدعم</Label>
                  <Input id="support-email" type="email" defaultValue="support@mindconnect.com" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="max-appointments">الحد الأقصى للمواعيد في اليوم</Label>
                  <Input id="max-appointments" type="number" defaultValue="10" />
                </div>
                <Button>حفظ التغييرات</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>ميزات المنصة</CardTitle>
                <CardDescription>تفعيل أو تعطيل ميزات المنصة</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">تسجيل الأطباء</p>
                    <p className="text-sm text-muted-foreground">السماح للأطباء الجدد بالتسجيل</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">تسجيل المرضى</p>
                    <p className="text-sm text-muted-foreground">السماح للمرضى الجدد بالتسجيل</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">مواعيد الفيديو</p>
                    <p className="text-sm text-muted-foreground">تفعيل مواعيد المكالمات المرئية</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>إشعارات البريد الإلكتروني</CardTitle>
                <CardDescription>تكوين إعدادات إشعارات البريد الإلكتروني</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">تسجيل طبيب جديد</p>
                    <p className="text-sm text-muted-foreground">إشعار المديرين بطلبات الأطباء الجدد</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">تذكيرات المواعيد</p>
                    <p className="text-sm text-muted-foreground">إرسال تذكيرات قبل 24 ساعة من المواعيد</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">تحديثات النظام</p>
                    <p className="text-sm text-muted-foreground">إشعار المستخدمين بتحديثات المنصة</p>
                  </div>
                  <Switch />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-4">
            <SessionInfo />
            
            <Card>
              <CardHeader>
                <CardTitle>إعدادات الأمان</CardTitle>
                <CardDescription>إدارة الأمان وضوابط الوصول</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">المصادقة الثنائية</p>
                    <p className="text-sm text-muted-foreground">تطلب المصادقة الثنائية لحسابات المديرين</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">انتهاء الجلسة</p>
                    <p className="text-sm text-muted-foreground">تسجيل الخروج التلقائي بعد ساعة واحدة من آخر نشاط</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password-policy">الحد الأدنى لطول كلمة المرور</Label>
                  <Input id="password-policy" type="number" defaultValue="8" />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
