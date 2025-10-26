"use client"

import type React from "react"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Spinner } from "@/components/ui/spinner"
import type { UserRole } from "@/lib/auth"

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles?: UserRole[]
  requireApproval?: boolean
}

export function ProtectedRoute({ children, allowedRoles, requireApproval = false }: ProtectedRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push("/login")
        return
      }

      if (allowedRoles && user && !allowedRoles.includes(user.role)) {
        router.push("/unauthorized")
        return
      }

      if (requireApproval && user && !user.approved) {
        router.push("/pending-approval")
        return
      }
    }
  }, [isAuthenticated, isLoading, user, allowedRoles, requireApproval, router])

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return null
  }

  if (requireApproval && user && !user.approved) {
    return null
  }

  return <>{children}</>
}
