"use client"

import { Suspense } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { User, Stethoscope, Users, Brain } from "lucide-react"

function LoginForm() {
  const searchParams = useSearchParams()
  const redirect = searchParams.get("redirect") || ""
  
  // حفظ redirect في sessionStorage للاحتياط
  if (typeof window !== "undefined" && redirect) {
    sessionStorage.setItem("redirect_after_login", redirect)
  }
  
  const userLoginUrl = redirect ? `/login/user?redirect=${encodeURIComponent(redirect)}` : "/login/user"
  const doctorLoginUrl = redirect ? `/login/doctor?redirect=${encodeURIComponent(redirect)}` : "/login/doctor"
  
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted px-4">
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
          <CardTitle className="text-center text-2xl">مرحباً بعودتك</CardTitle>
          <CardDescription className="text-center">اختر نوع حسابك للمتابعة</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <Button asChild className="w-full h-auto flex-col gap-3 py-6">
              <Link href={userLoginUrl}>
                <User className="h-8 w-8" />
                <div className="text-center">
                  <div className="font-semibold text-lg">مريض / مرافق</div>
                  <div className="text-sm text-muted-foreground">تسجيل دخول للمرضى والمرافقين</div>
                </div>
              </Link>
            </Button>

            <Button asChild variant="outline" className="w-full h-auto flex-col gap-3 py-6 bg-transparent">
              <Link href={doctorLoginUrl}>
                <Stethoscope className="h-8 w-8" />
                <div className="text-center">
                  <div className="font-semibold text-lg">طبيب / إداري</div>
                  <div className="text-sm text-muted-foreground">تسجيل دخول للأطباء والإداريين</div>
                </div>
              </Link>
            </Button>
          </div>

          <div className="mt-6 text-center text-sm">
            <span className="text-muted-foreground">ليس لديك حساب؟ </span>
            <Link href="/signup" className="font-medium text-primary hover:underline">
              سجل الآن
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-muted px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <div className="mb-4 flex justify-center">
              <Link href="/" className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                  <Brain className="h-6 w-6 text-primary-foreground" />
                </div>
                <span className="text-2xl font-semibold">Mindconnect</span>
              </Link>
            </div>
            <CardTitle className="text-center text-2xl">مرحباً بعودتك</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}
