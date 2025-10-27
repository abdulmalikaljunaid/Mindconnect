"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Spinner } from "@/components/ui/spinner"
import { AlertCircle, Shield, Users } from "lucide-react"
import { createAdminAccount, promoteToAdmin, listAdmins } from "@/lib/admin-setup"

export default function AdminSetupPage() {
  const [secret, setSecret] = useState("")
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [userId, setUserId] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [admins, setAdmins] = useState<any[]>([])
  const [showAdmins, setShowAdmins] = useState(false)

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    if (!secret || !name || !email || !password) {
      setError("جميع الحقول مطلوبة")
      return
    }

    setIsLoading(true)

    try {
      await createAdminAccount(email, password, name, secret)
      setSuccess("تم إنشاء الحساب الإداري بنجاح")
      setName("")
      setEmail("")
      setPassword("")
    } catch (err: any) {
      setError(err?.message ?? "فشل إنشاء الحساب الإداري")
    } finally {
      setIsLoading(false)
    }
  }

  const handlePromoteUser = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    if (!secret || !userId) {
      setError("السر الإداري ومعرف المستخدم مطلوبان")
      return
    }

    setIsLoading(true)

    try {
      await promoteToAdmin(userId, secret)
      setSuccess("تم ترقية المستخدم إلى إداري بنجاح")
      setUserId("")
    } catch (err: any) {
      setError(err?.message ?? "فشل ترقية المستخدم")
    } finally {
      setIsLoading(false)
    }
  }

  const handleListAdmins = async () => {
    setError("")
    setSuccess("")

    if (!secret) {
      setError("السر الإداري مطلوب")
      return
    }

    setIsLoading(true)

    try {
      const adminList = await listAdmins(secret)
      setAdmins(adminList)
      setShowAdmins(true)
    } catch (err: any) {
      setError(err?.message ?? "فشل في جلب قائمة الإداريين")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto max-w-4xl py-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
          <Shield className="h-8 w-8" />
          إعداد الحسابات الإدارية
        </h1>
        <p className="text-muted-foreground mt-2">
          هذه الصفحة للمطورين فقط - إنشاء وإدارة الحسابات الإدارية
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* إنشاء حساب إداري جديد */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              إنشاء حساب إداري جديد
            </CardTitle>
            <CardDescription>
              إنشاء حساب إداري جديد من الصفر
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateAdmin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="secret">السر الإداري</Label>
                <Input
                  id="secret"
                  type="password"
                  placeholder="أدخل السر الإداري"
                  value={secret}
                  onChange={(e) => setSecret(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">الاسم الكامل</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="أحمد الإداري"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">البريد الإلكتروني</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">كلمة المرور</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Spinner className="ml-2 h-4 w-4" />
                    جاري الإنشاء...
                  </>
                ) : (
                  "إنشاء حساب إداري"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* ترقية مستخدم موجود */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              ترقية مستخدم موجود
            </CardTitle>
            <CardDescription>
              ترقية مستخدم موجود إلى إداري
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePromoteUser} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="secret2">السر الإداري</Label>
                <Input
                  id="secret2"
                  type="password"
                  placeholder="أدخل السر الإداري"
                  value={secret}
                  onChange={(e) => setSecret(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="userId">معرف المستخدم</Label>
                <Input
                  id="userId"
                  type="text"
                  placeholder="UUID للمستخدم"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Spinner className="ml-2 h-4 w-4" />
                    جاري الترقية...
                  </>
                ) : (
                  "ترقية إلى إداري"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* قائمة الإداريين */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            قائمة الإداريين
          </CardTitle>
          <CardDescription>
            عرض جميع الحسابات الإدارية في النظام
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Button onClick={handleListAdmins} disabled={isLoading || !secret}>
              {isLoading ? (
                <>
                  <Spinner className="ml-2 h-4 w-4" />
                  جاري التحميل...
                </>
              ) : (
                "عرض الإداريين"
              )}
            </Button>

            {showAdmins && (
              <div className="space-y-2">
                {admins.length === 0 ? (
                  <p className="text-muted-foreground">لا توجد حسابات إدارية</p>
                ) : (
                  admins.map((admin) => (
                    <div key={admin.id} className="flex items-center justify-between rounded-lg border p-3">
                      <div>
                        <p className="font-medium">{admin.name}</p>
                        <p className="text-sm text-muted-foreground">{admin.email}</p>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(admin.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* رسائل الخطأ والنجاح */}
      {error && (
        <Alert variant="destructive" className="mt-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="mt-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {/* تحذير أمني */}
      <Alert className="mt-6">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>تحذير أمني:</strong> هذه الصفحة للمطورين فقط. تأكد من حماية السر الإداري 
          ولا تشاركه مع أي شخص غير مصرح له.
        </AlertDescription>
      </Alert>
    </div>
  )
}

