"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { User, Stethoscope } from "lucide-react"

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted px-4">
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
          <CardTitle className="text-center text-2xl">إنشاء حساب جديد</CardTitle>
          <CardDescription className="text-center">اختر نوع حسابك للبدء</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <Button asChild className="w-full h-auto flex-col gap-3 py-6">
              <Link href="/signup/user">
                <User className="h-8 w-8" />
                <div className="text-center">
                  <div className="font-semibold text-lg">مريض / مرافق</div>
                  <div className="text-sm text-muted-foreground">إنشاء حساب للمرضى والمرافقين</div>
                </div>
              </Link>
            </Button>

            <Button asChild variant="outline" className="w-full h-auto flex-col gap-3 py-6 bg-transparent">
              <Link href="/signup/doctor">
                <Stethoscope className="h-8 w-8" />
                <div className="text-center">
                  <div className="font-semibold text-lg">طبيب / إداري</div>
                  <div className="text-sm text-muted-foreground">إنشاء حساب للأطباء والإداريين</div>
                </div>
              </Link>
            </Button>
          </div>

          <div className="mt-6 text-center text-sm">
            <span className="text-muted-foreground">لديك حساب بالفعل؟ </span>
            <Link href="/login" className="font-medium text-primary hover:underline">
              سجل الدخول
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
