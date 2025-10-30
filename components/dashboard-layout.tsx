"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import {
  LayoutDashboard,
  Calendar,
  Search,
  FileText,
  User,
  Settings,
  LogOut,
  Menu,
  X,
  Heart,
  Users,
  Shield,
  Brain,
} from "lucide-react"

interface DashboardLayoutProps {
  children: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const { user, signOut } = useAuth()
  const pathname = usePathname()
  const router = useRouter()
  const { toast } = useToast()

  const handleSignOut = async () => {
    if (isLoggingOut) return // منع النقرات المتعددة
    
    try {
      setIsLoggingOut(true)
      
      // تسجيل الخروج
      await signOut()
      
      // Show success message briefly
      toast({
        title: "تم تسجيل الخروج بنجاح",
        description: "جاري تحويلك إلى الصفحة الرئيسية...",
        duration: 1000,
      })
      
      // الانتقال إلى الصفحة الرئيسية
      // Use window.location for complete state reset
      window.location.href = "/"
    } catch (error: any) {
      console.error("Error signing out:", error)
      
      // Even on error, try to redirect and clear state
      toast({
        title: "تم تسجيل الخروج",
        description: "جاري تحويلك...",
        duration: 1000,
      })
      
      // Force redirect to clear state
      setTimeout(() => {
        window.location.href = "/"
      }, 500)
    }
  }

  const getNavigationItems = () => {
    switch (user?.role) {
      case "patient":
        return [
          { href: "/dashboard", label: "لوحة التحكم", icon: LayoutDashboard },
          { href: "/find-doctors", label: "ابحث عن طبيب", icon: Search },
          { href: "/appointments", label: "المواعيد", icon: Calendar },
          { href: "/medical-history", label: "السجل الطبي", icon: FileText },
          { href: "/profile", label: "الملف الشخصي", icon: User },
        ]
      case "doctor":
        return [
          { href: "/dashboard", label: "لوحة التحكم", icon: LayoutDashboard },
          { href: "/patients", label: "مرضاي", icon: Users },
          { href: "/appointments", label: "المواعيد", icon: Calendar },
          { href: "/availability", label: "الأوقات المتاحة", icon: Calendar },
          { href: "/profile", label: "الملف الشخصي", icon: User },
        ]
      case "companion":
        return [
          { href: "/dashboard", label: "لوحة التحكم", icon: LayoutDashboard },
          { href: "/patient-progress", label: "تقدم المريض", icon: Heart },
          { href: "/appointments", label: "المواعيد", icon: Calendar },
          { href: "/profile", label: "الملف الشخصي", icon: User },
        ]
      case "admin":
        return [
          { href: "/dashboard", label: "لوحة التحكم", icon: LayoutDashboard },
          { href: "/doctor-approvals", label: "موافقات الأطباء", icon: Shield },
          { href: "/users", label: "المستخدمون", icon: Users },
          { href: "/settings", label: "الإعدادات", icon: Settings },
        ]
      default:
        return []
    }
  }

  const navigationItems = getNavigationItems()

  return (
    <div className="flex min-h-screen bg-background">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 right-0 z-50 w-64 transform border-l border-border bg-card transition-transform duration-200 ease-in-out lg:static lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "translate-x-full",
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center justify-between border-b border-border px-6">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 shadow-md">
                <Brain className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Mindconnect</span>
            </Link>
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setSidebarOpen(false)}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* User Info */}
          <div className="border-b border-border p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="truncate font-medium">{user?.name}</p>
                <p className="truncate text-xs text-muted-foreground capitalize">
                  {user?.role === "patient" && "مريض"}
                  {user?.role === "doctor" && "طبيب"}
                  {user?.role === "companion" && "مرافق"}
                  {user?.role === "admin" && "مدير"}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 p-4">
            {navigationItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md"
                      : "text-muted-foreground hover:bg-indigo-50 hover:text-indigo-700",
                  )}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                </Link>
              )
            })}
          </nav>

          {/* Sign Out */}
          <div className="border-t border-border p-4">
            <Button 
              variant="ghost" 
              className="w-full justify-start hover:bg-destructive/10 hover:text-destructive transition-colors" 
              onClick={handleSignOut}
              disabled={isLoggingOut}
            >
              <LogOut className={cn("ml-3 h-5 w-5", isLoggingOut && "animate-spin")} />
              {isLoggingOut ? "جاري تسجيل الخروج..." : "تسجيل الخروج"}
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex flex-1 flex-col">
        {/* Mobile Header */}
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border bg-background px-4 lg:hidden">
          <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-5 w-5" />
          </Button>
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 shadow-md">
              <Brain className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Mindconnect</span>
          </Link>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 lg:p-8">{children}</main>
      </div>
    </div>
  )
}
