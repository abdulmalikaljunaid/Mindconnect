"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Spinner } from "@/components/ui/spinner"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { AlertCircle, Stethoscope, Shield } from "lucide-react"
import type { UserRole } from "@/lib/auth"

export default function DoctorSignUpPage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [role, setRole] = useState<UserRole>("doctor")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { signUp } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (password !== confirmPassword) {
      setError("كلمات المرور غير متطابقة")
      return
    }

    if (password.length < 8) {
      setError("يجب أن تكون كلمة المرور 8 أحرف على الأقل")
      return
    }

    setIsLoading(true)

    try {
      await signUp(email, password, name, role)

      if (role === "doctor") {
        router.push("/pending-approval")
      } else {
        router.push("/dashboard")
      }
    } catch (err) {
      setError("فشل إنشاء الحساب. يرجى المحاولة مرة أخرى.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted px-4 py-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="mb-4 flex justify-center">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                <span className="text-xl font-bold text-primary-foreground">ع</span>
              </div>
              <span className="text-2xl font-semibold">عناية العقل</span>
            </Link>
          </div>
          <CardTitle className="text-center text-2xl flex items-center gap-2">
            <Stethoscope className="h-6 w-6" />
            إنشاء حساب طبيب / إداري
          </CardTitle>
          <CardDescription className="text-center">انضم إلى فريقنا المتخصص في الصحة النفسية</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-3">
              <Label>أنا...</Label>
              <RadioGroup value={role} onValueChange={(value) => setRole(value as UserRole)}>
                <div className="flex items-center space-x-2 space-x-reverse rounded-lg border border-border p-3 hover:bg-accent">
                  <RadioGroupItem value="doctor" id="doctor" />
                  <Label htmlFor="doctor" className="flex flex-1 cursor-pointer items-center gap-2">
                    <Stethoscope className="h-4 w-4" />
                    <div>
                      <div className="font-medium">طبيب</div>
                      <div className="text-xs text-muted-foreground">متخصص في الصحة النفسية</div>
                    </div>
                  </Label>
                </div>

                <div className="flex items-center space-x-2 space-x-reverse rounded-lg border border-border p-3 hover:bg-accent">
                  <RadioGroupItem value="admin" id="admin" />
                  <Label htmlFor="admin" className="flex flex-1 cursor-pointer items-center gap-2">
                    <Shield className="h-4 w-4" />
                    <div>
                      <div className="font-medium">إداري</div>
                      <div className="text-xs text-muted-foreground">إدارة النظام والموافقات</div>
                    </div>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">الاسم الكامل</Label>
              <Input
                id="name"
                type="text"
                placeholder="د. محمد أحمد"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">البريد الإلكتروني</Label>
              <Input
                id="email"
                type="email"
                placeholder="doctor@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
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
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">تأكيد كلمة المرور</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            {role === "doctor" && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  حسابات الأطباء تتطلب موافقة المدير قبل أن تتمكن من البدء في قبول المرضى.
                </AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Spinner className="ml-2 h-4 w-4" />
                  جاري إنشاء الحساب...
                </>
              ) : (
                "إنشاء حساب"
              )}
            </Button>
          </form>

          <div className="mt-6 space-y-3">
            <div className="text-center text-sm">
              <span className="text-muted-foreground">لديك حساب بالفعل؟ </span>
              <Link href="/login/doctor" className="font-medium text-primary hover:underline">
                سجل الدخول
              </Link>
            </div>
            <div className="text-center text-sm">
              <Link href="/signup" className="text-muted-foreground hover:underline">
                ← العودة لاختيار نوع الحساب
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
