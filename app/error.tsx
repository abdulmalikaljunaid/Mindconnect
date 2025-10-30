"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, RefreshCw, Home } from "lucide-react"
import Link from "next/link"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log error to console or error reporting service
    console.error("Application error:", error)
  }, [error])

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
            <AlertCircle className="h-8 w-8 text-destructive" />
          </div>
          <CardTitle className="text-2xl">حدث خطأ</CardTitle>
          <CardDescription>
            عذراً، حدث خطأ غير متوقع في التطبيق
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {process.env.NODE_ENV === "development" && (
            <div className="rounded-lg bg-muted p-4">
              <p className="text-sm font-medium mb-2">تفاصيل الخطأ (للتطوير فقط):</p>
              <p className="text-xs text-muted-foreground font-mono break-all">
                {error.message}
              </p>
            </div>
          )}

          <div className="flex flex-col gap-2">
            <Button onClick={reset} variant="default" className="w-full">
              <RefreshCw className="ml-2 h-4 w-4" />
              المحاولة مرة أخرى
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href="/">
                <Home className="ml-2 h-4 w-4" />
                العودة للصفحة الرئيسية
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}




