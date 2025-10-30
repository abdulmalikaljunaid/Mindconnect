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
import { GoogleButton } from "@/components/ui/google-button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Spinner } from "@/components/ui/spinner"
import { AlertCircle, User, Users, Brain, X } from "lucide-react"
import { useEmailSuggestions } from "@/hooks/use-email-suggestions"
import type { UserRole } from "@/lib/auth"

export default function UserLoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState<UserRole>("patient")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([])
  const { signIn, signInWithGoogle } = useAuth()
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
      await signIn(email, password)
      // Save email on successful login
      saveEmail(email)
      // Redirect immediately without delay
      router.replace("/dashboard")
    } catch (err) {
      setError("البريد الإلكتروني أو كلمة المرور غير صحيحة. يرجى المحاولة مرة أخرى.")
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

  const handleGoogleSignIn = async () => {
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
          <CardTitle className="text-center text-2xl flex items-center gap-2">
            <User className="h-6 w-6" />
            تسجيل دخول المريض / المرافق
          </CardTitle>
          <CardDescription className="text-center">سجل الدخول إلى حسابك للمتابعة</CardDescription>
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
                  <RadioGroupItem value="patient" id="login-patient" />
                  <Label htmlFor="login-patient" className="flex flex-1 cursor-pointer items-center gap-2">
                    <User className="h-4 w-4" />
                    <div>
                      <div className="font-medium">مريض</div>
                      <div className="text-xs text-muted-foreground">أبحث عن دعم الصحة النفسية</div>
                    </div>
                  </Label>
                </div>

                <div className="flex items-center space-x-2 space-x-reverse rounded-lg border border-border p-3 hover:bg-accent">
                  <RadioGroupItem value="companion" id="login-companion" />
                  <Label htmlFor="login-companion" className="flex flex-1 cursor-pointer items-center gap-2">
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
              onClick={handleGoogleSignIn}
              disabled={isLoading || isGoogleLoading}
            >
              {isGoogleLoading ? (
                <>
                  <Spinner className="ml-2 h-4 w-4" />
                  جاري التوجيه...
                </>
              ) : (
                "تسجيل الدخول بواسطة Google"
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

            <div className="space-y-2 relative">
              <Label htmlFor="email">البريد الإلكتروني</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
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
              <Link href="/signup/user" className="font-medium text-primary hover:underline">
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
