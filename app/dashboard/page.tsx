"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { PatientDashboard } from "@/components/dashboards/patient-dashboard"
import { DoctorDashboard } from "@/components/dashboards/doctor-dashboard"
import { CompanionDashboard } from "@/components/dashboards/companion-dashboard"
import { AdminDashboard } from "@/components/dashboards/admin-dashboard"
import { Spinner } from "@/components/ui/spinner"

export default function DashboardPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login")
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    )
  }

  if (!user) {
    return null
  }

  // Render appropriate dashboard based on user role
  switch (user.role) {
    case "patient":
      return <PatientDashboard />
    case "doctor":
      return <DoctorDashboard />
    case "companion":
      return <CompanionDashboard />
    case "admin":
      return <AdminDashboard />
    default:
      return <PatientDashboard />
  }
}
