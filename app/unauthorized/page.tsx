import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ShieldAlert } from "lucide-react"

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted px-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
            <ShieldAlert className="h-8 w-8 text-destructive" />
          </div>
          <CardTitle className="text-2xl">تم رفض الوصول</CardTitle>
          <CardDescription>ليس لديك صلاحية للوصول إلى هذه الصفحة</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            هذه الصفحة مقتصرة على أدوار مستخدمين محددة. يرجى الاتصال بالدعم إذا كنت تعتقد أن هذا خطأ.
          </p>

          <div className="flex gap-2">
            <Button asChild variant="outline" className="flex-1 bg-transparent">
              <Link href="/">العودة للصفحة الرئيسية</Link>
            </Button>
            <Button asChild className="flex-1">
              <Link href="/dashboard">الذهاب إلى لوحة التحكم</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
