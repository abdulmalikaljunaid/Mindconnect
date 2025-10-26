"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { User, Search, FileText, Calendar } from "lucide-react"
import Link from "next/link"

export default function PatientsPage() {
  const [searchQuery, setSearchQuery] = useState("")

  const patients = [
    {
      id: 1,
      name: "Sarah Johnson",
      email: "sarah.j@email.com",
      phone: "+1 (555) 123-4567",
      lastVisit: "2025-01-10",
      nextAppointment: "2025-01-15",
      status: "Active",
      totalSessions: 8,
    },
    {
      id: 2,
      name: "Michael Brown",
      email: "michael.b@email.com",
      phone: "+1 (555) 234-5678",
      lastVisit: "2025-01-08",
      nextAppointment: "2025-01-20",
      status: "Active",
      totalSessions: 5,
    },
    {
      id: 3,
      name: "Emily Davis",
      email: "emily.d@email.com",
      phone: "+1 (555) 345-6789",
      lastVisit: "2025-01-05",
      nextAppointment: "2025-01-18",
      status: "Active",
      totalSessions: 12,
    },
    {
      id: 4,
      name: "James Wilson",
      email: "james.w@email.com",
      phone: "+1 (555) 456-7890",
      lastVisit: "2024-12-28",
      nextAppointment: null,
      status: "Inactive",
      totalSessions: 3,
    },
  ]

  const filteredPatients = patients.filter((patient) => patient.name.toLowerCase().includes(searchQuery.toLowerCase()))

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">My Patients</h1>
            <p className="text-muted-foreground">Manage your patient list and records</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search patients by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{patients.filter((p) => p.status === "Active").length}</div>
              <p className="text-sm text-muted-foreground">Active Patients</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{patients.length}</div>
              <p className="text-sm text-muted-foreground">Total Patients</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{patients.reduce((sum, p) => sum + p.totalSessions, 0)}</div>
              <p className="text-sm text-muted-foreground">Total Sessions</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{patients.filter((p) => p.nextAppointment).length}</div>
              <p className="text-sm text-muted-foreground">Upcoming Appointments</p>
            </CardContent>
          </Card>
        </div>

        {/* Patient List */}
        <div className="space-y-4">
          {filteredPatients.map((patient) => (
            <Card key={patient.id}>
              <CardContent className="pt-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div className="flex gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                      <User className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="mb-1 flex items-center gap-2">
                        <h3 className="font-semibold">{patient.name}</h3>
                        <Badge
                          className={
                            patient.status === "Active"
                              ? "bg-accent text-accent-foreground"
                              : "bg-muted text-muted-foreground"
                          }
                        >
                          {patient.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{patient.email}</p>
                      <div className="mt-2 flex flex-wrap gap-4 text-sm text-muted-foreground">
                        <span>Last visit: {patient.lastVisit}</span>
                        <span>•</span>
                        <span>{patient.totalSessions} sessions</span>
                        {patient.nextAppointment && (
                          <>
                            <span>•</span>
                            <span>Next: {patient.nextAppointment}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button asChild variant="outline" size="sm" className="bg-transparent">
                      <Link href={`/patients/${patient.id}`}>
                        <FileText className="mr-2 h-4 w-4" />
                        View Notes
                      </Link>
                    </Button>
                    <Button asChild variant="outline" size="sm" className="bg-transparent">
                      <Link href={`/book-appointment?patient=${patient.id}`}>
                        <Calendar className="mr-2 h-4 w-4" />
                        Schedule
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  )
}
