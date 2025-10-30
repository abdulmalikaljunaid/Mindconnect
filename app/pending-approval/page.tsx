"use client"

import Link from "next/link"
import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Clock, Mail, CheckCircle, FileText, AlertCircle } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"

export default function PendingApprovalPage() {
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // إذا كان المستخدم موافق عليه بالفعل، وجهه للوحة التحكم
    if (user && user.isApproved) {
      router.push("/dashboard")
    }
  }, [user, router])

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted px-4 py-8">
      <Card className="w-full max-w-lg text-center">
        <CardHeader>
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 animate-pulse">
            <Clock className="h-10 w-10 text-primary" />
          </div>
          <CardTitle className="text-2xl md:text-3xl">حسابك قيد المراجعة</CardTitle>
          <CardDescription className="text-base">
            جاري مراجعة طلبك من قبل فريق الإدارة
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert className="bg-green-50 border-green-200">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <AlertDescription className="text-green-800">
              <strong>تم إرسال طلبك بنجاح!</strong> شكراً لتسجيلك كمتخصص في الصحة النفسية.
            </AlertDescription>
          </Alert>

          <p className="text-sm text-muted-foreground leading-relaxed">
            نحن نقدر اهتمامك بالانضمام إلى منصتنا. فريقنا يقوم حالياً بمراجعة بياناتك ومستنداتك للتأكد من 
            تقديم أعلى مستوى من الرعاية لمرضانا.
          </p>

          <div className="rounded-lg border border-border bg-card p-5 text-right space-y-4">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <FileText className="h-5 w-5 text-primary" />
              <span>ماذا يحدث الآن؟</span>
            </div>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-start gap-3">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 flex-shrink-0 mt-0.5">
                  <span className="text-xs font-semibold text-primary">1</span>
                </div>
                <span>مراجعة شاملة لبياناتك ومؤهلاتك المهنية</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 flex-shrink-0 mt-0.5">
                  <span className="text-xs font-semibold text-primary">2</span>
                </div>
                <span>التحقق من صحة المستندات المرفقة</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 flex-shrink-0 mt-0.5">
                  <span className="text-xs font-semibold text-primary">3</span>
                </div>
                <span>ستصلك رسالة بريد إلكتروني خلال 24-48 ساعة</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 flex-shrink-0 mt-0.5">
                  <span className="text-xs font-semibold text-primary">4</span>
                </div>
                <span>بعد الموافقة، يمكنك الوصول إلى لوحة التحكم الخاصة بك</span>
              </li>
            </ul>
          </div>

          <Alert>
            <Mail className="h-4 w-4" />
            <AlertDescription>
              تحقق من بريدك الإلكتروني <strong>{user?.email}</strong> بشكل دوري لمعرفة حالة طلبك.
            </AlertDescription>
          </Alert>

          <div className="flex flex-col gap-2 pt-2">
            <Button asChild className="w-full">
              <Link href="/">العودة للصفحة الرئيسية</Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href="/login/doctor">تسجيل الدخول</Link>
            </Button>
          </div>

          <p className="text-xs text-muted-foreground">
            <AlertCircle className="h-3 w-3 inline-block ml-1" />
            إذا كان لديك أي استفسار، يرجى التواصل معنا عبر البريد الإلكتروني
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
