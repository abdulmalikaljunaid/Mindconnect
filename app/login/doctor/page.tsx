"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PasswordInput } from "@/components/ui/password-input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Spinner } from "@/components/ui/spinner"
import { AlertCircle, Stethoscope, Brain, X } from "lucide-react"
import { useEmailSuggestions } from "@/hooks/use-email-suggestions"

export default function DoctorLoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([])
  const { signIn } = useAuth()
  const router = useRouter()
  const { savedEmails, saveEmail, removeEmail } = useEmailSuggestions()

  // Filter suggestions based on input
  useEffect(() => {
    if (email && savedEmails.length > 0) {
      const filtered = savedEmails.filter((saved) =>
        saved.toLowerCase().includes(email.toLowerCase())
      )
      setFilteredSuggestions(filtered)
      setShowSuggestions(filtered.length > 0)
    } else {
      setFilteredSuggestions([])
      setShowSuggestions(false)
    }
  }, [email, savedEmails])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      await signIn(email.trim(), password)
      saveEmail(email.trim())
      router.replace("/dashboard")
    } catch (err: any) {
      setError(err?.message || "البريد الإلكتروني أو كلمة المرور غير صحيحة. يرجى المحاولة مرة أخرى.")
      setIsLoading(false)
    }
  }

  const handleEmailSelect = (selectedEmail: string) => {
    setEmail(selectedEmail)
    setShowSuggestions(false)
  }

  const handleSuggestionRemove = (e: React.MouseEvent, emailToRemove: string) => {
    e.stopPropagation()
    removeEmail(emailToRemove)
  }

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
          <CardTitle className="text-center text-2xl flex items-center gap-2">
            <Stethoscope className="h-6 w-6" />
            تسجيل دخول الطبيب / الإداري
          </CardTitle>
          <CardDescription className="text-center">سجل الدخول إلى لوحة التحكم المتقدمة</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2 relative">
              <Label htmlFor="email">البريد الإلكتروني</Label>
              <Input
                id="email"
                type="email"
                placeholder="doctor@mindconnect.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => {
                  if (filteredSuggestions.length > 0) setShowSuggestions(true)
                }}
                onBlur={() => {
                  // Delay to allow suggestion click
                  setTimeout(() => setShowSuggestions(false), 200)
                }}
                required
                disabled={isLoading}
              />
              {showSuggestions && filteredSuggestions.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-popover border border-border rounded-md shadow-md max-h-48 overflow-auto">
                  {filteredSuggestions.map((suggestion) => (
                    <div
                      key={suggestion}
                      className="flex items-center justify-between px-3 py-2 hover:bg-accent cursor-pointer"
                      onMouseDown={(e) => {
                        e.preventDefault()
                        handleEmailSelect(suggestion)
                      }}
                    >
                      <span className="text-sm">{suggestion}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onMouseDown={(e) => handleSuggestionRemove(e, suggestion)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">كلمة المرور</Label>
                <Link href="/forgot-password" className="text-sm text-primary hover:underline">
                  نسيت كلمة المرور؟
                </Link>
              </div>
              <PasswordInput
                id="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Spinner className="ml-2 h-4 w-4" />
                  جاري تسجيل الدخول...
                </>
              ) : (
                "تسجيل الدخول"
              )}
            </Button>
          </form>

          <div className="mt-6 space-y-3">
            <div className="text-center text-sm">
              <span className="text-muted-foreground">ليس لديك حساب؟ </span>
              <Link href="/signup/doctor" className="font-medium text-primary hover:underline">
                سجل الآن
              </Link>
            </div>
            <div className="text-center text-sm">
              <Link href="/login" className="text-muted-foreground hover:underline">
                ← العودة لاختيار نوع الحساب
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
