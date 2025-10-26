"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, UserCheck, Clock, TrendingUp, Shield, AlertCircle } from "lucide-react"
import Link from "next/link"

export function AdminDashboard() {
  const pendingDoctors = [
    {
      id: 1,
      name: "Dr. Robert Johnson",
      specialty: "Psychiatrist",
      email: "robert.j@email.com",
      submittedDate: "2025-01-10",
      experience: "8 years",
    },
    {
      id: 2,
      name: "Dr. Lisa Anderson",
      specialty: "Clinical Psychologist",
      email: "lisa.a@email.com",
      submittedDate: "2025-01-12",
      experience: "12 years",
    },
  ]

  const recentActivity = [
    { id: 1, action: "New doctor registration", user: "Dr. Robert Johnson", time: "2 hours ago" },
    { id: 2, action: "Doctor approved", user: "Dr. Sarah Williams", time: "5 hours ago" },
    { id: 3, action: "New patient signup", user: "John Doe", time: "1 day ago" },
  ]

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage users, approvals, and system settings</p>
        </div>

        {/* Quick Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,284</div>
              <p className="text-xs text-muted-foreground">+12% from last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Doctors</CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">48</div>
              <p className="text-xs text-muted-foreground">Verified professionals</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingDoctors.length}</div>
              <p className="text-xs text-accent">Requires attention</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Appointments</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3,421</div>
              <p className="text-xs text-muted-foreground">This month</p>
            </CardContent>
          </Card>
        </div>

        {/* Pending Doctor Approvals */}
        {pendingDoctors.length > 0 && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-accent" />
                    Pending Doctor Approvals
                  </CardTitle>
                  <CardDescription>Review and approve new doctor registrations</CardDescription>
                </div>
                <Button asChild>
                  <Link href="/doctor-approvals">View All</Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {pendingDoctors.map((doctor) => (
                <div key={doctor.id} className="flex items-center justify-between rounded-lg border border-border p-4">
                  <div>
                    <p className="font-semibold">{doctor.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {doctor.specialty} • {doctor.experience} experience
                    </p>
                    <p className="text-xs text-muted-foreground">Submitted: {doctor.submittedDate}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm">Review</Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest system events and actions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3 text-sm">
                  <div className="mt-0.5 flex h-2 w-2 rounded-full bg-primary" />
                  <div className="flex-1">
                    <p className="font-medium">{activity.action}</p>
                    <p className="text-muted-foreground">
                      {activity.user} • {activity.time}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common administrative tasks</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <Button asChild className="h-auto flex-col gap-2 py-4">
                <Link href="/doctor-approvals">
                  <Shield className="h-6 w-6" />
                  <span>Doctor Approvals</span>
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-auto flex-col gap-2 py-4 bg-transparent">
                <Link href="/users">
                  <Users className="h-6 w-6" />
                  <span>Manage Users</span>
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
