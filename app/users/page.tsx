"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { User, Search, Mail, MoreVertical } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export default function UsersPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")

  const users = [
    {
      id: 1,
      name: "Sarah Johnson",
      email: "sarah.j@email.com",
      role: "patient",
      status: "active",
      joinedDate: "2024-12-15",
    },
    {
      id: 2,
      name: "Dr. Sarah Williams",
      email: "sarah.w@email.com",
      role: "doctor",
      status: "active",
      joinedDate: "2024-11-20",
    },
    {
      id: 3,
      name: "Michael Brown",
      email: "michael.b@email.com",
      role: "patient",
      status: "active",
      joinedDate: "2024-12-28",
    },
    {
      id: 4,
      name: "Dr. Michael Chen",
      email: "michael.c@email.com",
      role: "doctor",
      status: "active",
      joinedDate: "2024-11-15",
    },
    {
      id: 5,
      name: "Emily Davis",
      email: "emily.d@email.com",
      role: "companion",
      status: "active",
      joinedDate: "2025-01-05",
    },
  ]

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesRole = roleFilter === "all" || user.role === roleFilter
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

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-muted-foreground">View and manage all platform users</p>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{users.length}</div>
              <p className="text-sm text-muted-foreground">Total Users</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{users.filter((u) => u.role === "patient").length}</div>
              <p className="text-sm text-muted-foreground">Patients</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{users.filter((u) => u.role === "doctor").length}</div>
              <p className="text-sm text-muted-foreground">Doctors</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{users.filter((u) => u.role === "companion").length}</div>
              <p className="text-sm text-muted-foreground">Companions</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-4 md:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Filter by role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="patient">Patients</SelectItem>
              <SelectItem value="doctor">Doctors</SelectItem>
              <SelectItem value="companion">Companions</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* User List */}
        <div className="space-y-4">
          {filteredUsers.map((user) => (
            <Card key={user.id}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                      <User className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <div className="mb-1 flex items-center gap-2">
                        <h3 className="font-semibold">{user.name}</h3>
                        <Badge className={getRoleBadgeColor(user.role)}>{user.role}</Badge>
                        <Badge variant="secondary">{user.status}</Badge>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {user.email}
                        </div>
                        <span>•</span>
                        <span>Joined {user.joinedDate}</span>
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
                      <DropdownMenuItem>View Profile</DropdownMenuItem>
                      <DropdownMenuItem>Send Message</DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">Suspend Account</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  )
}
