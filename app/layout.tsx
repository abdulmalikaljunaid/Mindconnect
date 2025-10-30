import type React from "react"
import type { Metadata } from "next"
import { AuthProvider } from "@/contexts/auth-context"
import { Toaster } from "@/components/ui/toaster"
import "./globals.css"

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  console.warn("Warning: NEXT_PUBLIC_SUPABASE_URL is not set")
}

if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  console.warn("Warning: NEXT_PUBLIC_SUPABASE_ANON_KEY is not set")
}

export const metadata: Metadata = {
  title: "Mindconnect - دعم الصحة النفسية المهني",
  description: "تواصل مع متخصصين مؤهلين في الصحة النفسية واحصل على الدعم الذي تحتاجه",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cairo:wght@200;300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans">
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  )
}
