"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { GoogleButton } from "@/components/ui/google-button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Spinner } from "@/components/ui/spinner"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { AlertCircle, User, Users, Brain } from "lucide-react"
import type { UserRole } from "@/lib/auth"

export default function UserSignUpPage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [role, setRole] = useState<UserRole>("patient")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const { signUp, signInWithGoogle } = useAuth()
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
      
      // Small delay to ensure auth state and profile are fully synced
      await new Promise(resolve => setTimeout(resolve, 100))
      
      // التحقق من localStorage للطبيب المختار من التقييم
      const selectedDoctor = localStorage.getItem('selectedDoctor')
      
      if (selectedDoctor) {
        try {
          const doctor = JSON.parse(selectedDoctor)
          // التوجيه إلى صفحة حجز الموعد مع doctorId
          router.replace(`/book-appointment?doctorId=${doctor.id}`)
          // حذف البيانات من localStorage بعد الاستخدام
          localStorage.removeItem('selectedDoctor')
          localStorage.removeItem('assessmentResult')
          return
        } catch (parseError) {
          console.error('Error parsing selectedDoctor:', parseError)
        }
      }
      
      // Redirect to dashboard
      router.replace("/dashboard")
    } catch (err: any) {
      setError(err?.message ?? "فشل إنشاء الحساب. يرجى المحاولة مرة أخرى.")
      setIsLoading(false)
    }
  }

  const handleGoogleSignUp = async () => {
    setError("")
    setIsGoogleLoading(true)

    try {
      await signInWithGoogle(role)
      // OAuth redirect will handle the rest
    } catch (err: any) {
      setError(err?.message ?? "فشل تسجيل الدخول بواسطة Google. يرجى المحاولة مرة أخرى.")
      setIsGoogleLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted px-4 py-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="mb-4 flex justify-center">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 shadow-md">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Mindconnect
              </span>
            </Link>
          </div>
          <CardTitle className="text-center text-2xl flex items-center gap-2">
            <User className="h-6 w-6" />
            إنشاء حساب مريض / مرافق
          </CardTitle>
          <CardDescription className="text-center">اختر دورك وابدأ رحلتك معنا</CardDescription>
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
                  <RadioGroupItem value="patient" id="patient" />
                  <Label htmlFor="patient" className="flex flex-1 cursor-pointer items-center gap-2">
                    <User className="h-4 w-4" />
                    <div>
                      <div className="font-medium">مريض</div>
                      <div className="text-xs text-muted-foreground">أبحث عن دعم الصحة النفسية</div>
                    </div>
                  </Label>
                </div>

                <div className="flex items-center space-x-2 space-x-reverse rounded-lg border border-border p-3 hover:bg-accent">
                  <RadioGroupItem value="companion" id="companion" />
                  <Label htmlFor="companion" className="flex flex-1 cursor-pointer items-center gap-2">
                    <Users className="h-4 w-4" />
                    <div>
                      <div className="font-medium">مرافق</div>
                      <div className="text-xs text-muted-foreground">أدعم مريضاً</div>
                    </div>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <GoogleButton
              onClick={handleGoogleSignUp}
              disabled={isLoading || isGoogleLoading}
            >
              {isGoogleLoading ? (
                <>
                  <Spinner className="ml-2 h-4 w-4" />
                  جاري التوجيه...
                </>
              ) : (
                "إنشاء حساب بواسطة Google"
              )}
            </GoogleButton>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">أو</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">الاسم الكامل</Label>
              <Input
                id="name"
                type="text"
                placeholder="محمد أحمد"
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
                placeholder="you@example.com"
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
              <Link href="/login/user" className="font-medium text-primary hover:underline">
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
