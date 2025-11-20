"use client"

import { useSessionInfo } from "@/hooks/use-session-info"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Clock, AlertCircle, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { supabaseClient } from "@/lib/supabase-client"
import { useState } from "react"

export function SessionInfo() {
  const sessionInfo = useSessionInfo()
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefreshSession = async () => {
    setIsRefreshing(true)
    try {
      // Check if session exists and has refresh token
      const { data: { session }, error: sessionError } = await supabaseClient.auth.getSession()
      
      if (sessionError || !session) {
        alert("لا توجد جلسة نشطة. يرجى تسجيل الدخول مرة أخرى.")
        setIsRefreshing(false)
        return
      }

      if (!session.refresh_token) {
        alert("لا يمكن تحديث الجلسة. يرجى تسجيل الدخول مرة أخرى.")
        setIsRefreshing(false)
        return
      }

      const { error } = await supabaseClient.auth.refreshSession()
      if (error) {
        console.error("Failed to refresh session:", error)
        if (error.message?.includes("Refresh Token") || error.message?.includes("refresh_token")) {
          alert("انتهت صلاحية الجلسة. يرجى تسجيل الدخول مرة أخرى.")
          await supabaseClient.auth.signOut()
        } else {
          alert("فشل تحديث الجلسة. يرجى تسجيل الدخول مرة أخرى.")
        }
      } else {
        alert("تم تحديث الجلسة بنجاح!")
      }
    } catch (error) {
      console.error("Error refreshing session:", error)
      alert("حدث خطأ أثناء تحديث الجلسة.")
    } finally {
      setIsRefreshing(false)
    }
  }

  if (!sessionInfo.session) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-destructive" />
            حالة الجلسة
          </CardTitle>
          <CardDescription>لا توجد جلسة نشطة</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>يجب تسجيل الدخول للوصول إلى هذه الصفحة</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  const expiryDate = sessionInfo.expiresAt
    ? new Date(sessionInfo.expiresAt * 1000).toLocaleString("ar-SA", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "غير محدد"

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {sessionInfo.isExpired ? (
            <AlertCircle className="h-5 w-5 text-destructive" />
          ) : sessionInfo.isExpiringSoon ? (
            <AlertCircle className="h-5 w-5 text-yellow-500" />
          ) : (
            <CheckCircle2 className="h-5 w-5 text-green-500" />
          )}
          معلومات الجلسة
        </CardTitle>
        <CardDescription>حالة جلسة تسجيل الدخول الحالية</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">الوقت المتبقي:</span>
            <span
              className={`text-sm font-bold ${
                sessionInfo.isExpired
                  ? "text-destructive"
                  : sessionInfo.isExpiringSoon
                    ? "text-yellow-600"
                    : "text-green-600"
              }`}
            >
              {sessionInfo.formattedTimeRemaining}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">ينتهي في:</span>
            <span className="text-sm text-muted-foreground">{expiryDate}</span>
          </div>
        </div>

        {sessionInfo.isExpired && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              انتهت الجلسة. يرجى تسجيل الدخول مرة أخرى.
            </AlertDescription>
          </Alert>
        )}

        {sessionInfo.isExpiringSoon && !sessionInfo.isExpired && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              الجلسة ستنتهي قريباً. سيتم تحديثها تلقائياً، أو يمكنك تحديثها يدوياً.
            </AlertDescription>
          </Alert>
        )}

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefreshSession}
            disabled={isRefreshing}
            className="w-full"
          >
            <Clock className="mr-2 h-4 w-4" />
            {isRefreshing ? "جاري التحديث..." : "تحديث الجلسة الآن"}
          </Button>
        </div>

        <div className="pt-2 border-t">
          <p className="text-xs text-muted-foreground">
            <strong>ملاحظة:</strong> الجلسة يتم تحديثها تلقائياً قبل انتهائها بـ 5 دقائق.
            مدة الجلسة الافتراضية: ساعة واحدة من آخر نشاط.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

