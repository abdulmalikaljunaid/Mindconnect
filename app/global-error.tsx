"use client"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="ar" dir="rtl">
      <body>
        <div className="flex min-h-screen items-center justify-center bg-muted px-4">
          <div className="w-full max-w-md text-center space-y-4">
            <h1 className="text-2xl font-bold">حدث خطأ حرج</h1>
            <p className="text-muted-foreground">
              عذراً، حدث خطأ في التطبيق. يرجى تحديث الصفحة.
            </p>
            <button
              onClick={reset}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            >
              تحديث الصفحة
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}








