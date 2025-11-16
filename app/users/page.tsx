"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { User, Search, Mail, MoreVertical } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { supabaseClient } from "@/lib/supabase-client"
import { useAuth } from "@/contexts/auth-context"
import { Spinner } from "@/components/ui/spinner"

interface UserData {
  id: string
  name: string
  email: string | null
  role: string
  status: string
  joinedDate: string
}

export default function UsersPage() {
  const { user } = useAuth()
  const [searchQuery, setSearchQuery] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [users, setUsers] = useState<UserData[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!user) return

    const fetchUsers = async () => {
      setIsLoading(true)
      try {
        const { data, error } = await supabaseClient
          .from("profiles")
          .select("id, name, email, role, is_approved, created_at")
          .order("created_at", { ascending: false })

        if (error) throw error

        const formattedUsers: UserData[] = (data || []).map((profile) => ({
          id: profile.id,
          name: profile.name,
          email: profile.email,
          role: profile.role || "patient",
          status: profile.is_approved ? "active" : "pending",
          joinedDate: profile.created_at
            ? new Date(profile.created_at).toISOString().split("T")[0]
            : "غير محدد",
        }))

        setUsers(formattedUsers)
      } catch (error) {
        console.error("Error fetching users:", error)
        setUsers([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchUsers()
  }, [user])

  const filteredUsers = users.filter((userItem) => {
    const matchesSearch =
      userItem.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (userItem.email && userItem.email.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesRole = roleFilter === "all" || userItem.role === roleFilter
    return matchesSearch && matchesRole
  })

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "doctor":
        return "bg-primary text-primary-foreground"
      case "patient":
        return "bg-accent text-accent-foreground"
      case "companion":
        return "bg-secondary text-secondary-foreground"
      default:
        return ""
    }
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex min-h-[400px] items-center justify-center">
          <Spinner className="h-8 w-8" />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">إدارة المستخدمين</h1>
          <p className="text-muted-foreground">عرض وإدارة جميع مستخدمي المنصة</p>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{users.length}</div>
              <p className="text-sm text-muted-foreground">إجمالي المستخدمين</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{users.filter((u) => u.role === "patient").length}</div>
              <p className="text-sm text-muted-foreground">المرضى</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{users.filter((u) => u.role === "doctor").length}</div>
              <p className="text-sm text-muted-foreground">الأطباء</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{users.filter((u) => u.role === "companion").length}</div>
              <p className="text-sm text-muted-foreground">المرافقون</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-4 md:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="البحث بالاسم أو البريد الإلكتروني..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="تصفية حسب الدور" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع الأدوار</SelectItem>
              <SelectItem value="patient">المرضى</SelectItem>
              <SelectItem value="doctor">الأطباء</SelectItem>
              <SelectItem value="companion">المرافقون</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* User List */}
        <div className="space-y-4">
          {filteredUsers.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">لا توجد مستخدمين</p>
              </CardContent>
            </Card>
          ) : (
            filteredUsers.map((userItem) => (
              <Card key={userItem.id}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                        <User className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <div className="mb-1 flex items-center gap-2">
                          <h3 className="font-semibold">{userItem.name}</h3>
                          <Badge className={getRoleBadgeColor(userItem.role)}>
                            {userItem.role === "doctor" ? "طبيب" : userItem.role === "patient" ? "مريض" : userItem.role === "companion" ? "مرافق" : userItem.role}
                          </Badge>
                          <Badge variant="secondary">
                            {userItem.status === "active" ? "نشط" : "معلق"}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                          {userItem.email && (
                            <>
                              <div className="flex items-center gap-1">
                                <Mail className="h-3 w-3" />
                                {userItem.email}
                              </div>
                              <span>•</span>
                            </>
                          )}
                          <span>انضم في {userItem.joinedDate}</span>
                        </div>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>عرض الملف الشخصي</DropdownMenuItem>
                        <DropdownMenuItem>إرسال رسالة</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">تعليق الحساب</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
