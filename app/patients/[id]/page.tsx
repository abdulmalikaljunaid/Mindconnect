"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { User, Calendar, Mail, Phone, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function PatientDetailPage() {
  const patient = {
    id: 1,
    name: "Sarah Johnson",
    email: "sarah.j@email.com",
    phone: "+1 (555) 123-4567",
    dateOfBirth: "1990-05-15",
    address: "123 Main St, New York, NY 10001",
    emergencyContact: "John Johnson - +1 (555) 987-6543",
    status: "Active",
    totalSessions: 8,
    lastVisit: "2025-01-10",
    nextAppointment: "2025-01-15",
  }

  const sessionNotes = [
    {
      id: 1,
      date: "2025-01-10",
      duration: "50 min",
      notes:
        "Patient showing significant improvement in managing anxiety. Discussed new coping strategies and homework assignments for the week.",
      tags: ["Progress", "Anxiety"],
    },
    {
      id: 2,
      date: "2025-01-03",
      duration: "50 min",
      notes:
        "Continued work on cognitive behavioral techniques. Patient reported better sleep patterns and reduced stress levels.",
      tags: ["CBT", "Sleep"],
    },
    {
      id: 3,
      date: "2024-12-27",
      duration: "50 min",
      notes: "Initial assessment completed. Identified primary concerns and developed treatment plan.",
      tags: ["Assessment"],
    },
  ]

  const appointments = [
    {
      id: 1,
      date: "2025-01-15",
      time: "10:00 AM",
      type: "Video Call",
      status: "Scheduled",
    },
    {
      id: 2,
      date: "2025-01-22",
      time: "10:00 AM",
      type: "Video Call",
      status: "Scheduled",
    },
  ]

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button asChild variant="ghost" size="icon">
            <Link href="/patients">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Patient Details</h1>
            <p className="text-muted-foreground">View and manage patient information</p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Patient Info Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                    <User className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <CardTitle>{patient.name}</CardTitle>
                    <Badge className="mt-1 bg-accent text-accent-foreground">{patient.status}</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{patient.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{patient.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>DOB: {patient.dateOfBirth}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Total Sessions</p>
                  <p className="text-2xl font-bold">{patient.totalSessions}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Last Visit</p>
                  <p className="font-medium">{patient.lastVisit}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Next Appointment</p>
                  <p className="font-medium">{patient.nextAppointment}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Emergency Contact</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{patient.emergencyContact}</p>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="notes" className="space-y-4">
              <TabsList>
                <TabsTrigger value="notes">Session Notes</TabsTrigger>
                <TabsTrigger value="appointments">Appointments</TabsTrigger>
                <TabsTrigger value="treatment">Treatment Plan</TabsTrigger>
              </TabsList>

              <TabsContent value="notes" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Add New Note</CardTitle>
                    <CardDescription>Document today's session</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Textarea placeholder="Enter session notes..." rows={4} />
                    <Button>Save Note</Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Previous Sessions</CardTitle>
                    <CardDescription>History of session notes</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {sessionNotes.map((note) => (
                      <div key={note.id} className="rounded-lg border border-border p-4">
                        <div className="mb-2 flex items-start justify-between">
                          <div>
                            <p className="font-medium">{note.date}</p>
                            <p className="text-sm text-muted-foreground">{note.duration}</p>
                          </div>
                          <div className="flex gap-2">
                            {note.tags.map((tag) => (
                              <Badge key={tag} variant="secondary">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <p className="text-sm leading-relaxed">{note.notes}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="appointments" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Upcoming Appointments</CardTitle>
                    <CardDescription>Scheduled sessions with this patient</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {appointments.map((appointment) => (
                      <div
                        key={appointment.id}
                        className="flex items-center justify-between rounded-lg border border-border p-4"
                      >
                        <div>
                          <p className="font-medium">{appointment.date}</p>
                          <p className="text-sm text-muted-foreground">
                            {appointment.time} • {appointment.type}
                          </p>
                        </div>
                        <Badge variant="secondary">{appointment.status}</Badge>
                      </div>
                    ))}
                    <Button asChild variant="outline" className="w-full bg-transparent">
                      <Link href={`/book-appointment?patient=${patient.id}`}>Schedule New Appointment</Link>
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="treatment" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Treatment Plan</CardTitle>
                    <CardDescription>Current treatment approach and goals</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="mb-2 font-medium">Primary Diagnosis</h4>
                      <p className="text-sm text-muted-foreground">Generalized Anxiety Disorder</p>
                    </div>
                    <div>
                      <h4 className="mb-2 font-medium">Treatment Approach</h4>
                      <p className="text-sm text-muted-foreground">
                        Cognitive Behavioral Therapy (CBT) with focus on anxiety management and coping strategies
                      </p>
                    </div>
                    <div>
                      <h4 className="mb-2 font-medium">Goals</h4>
                      <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
                        <li>Reduce anxiety symptoms by 50% within 3 months</li>
                        <li>Develop effective coping mechanisms for stress</li>
                        <li>Improve sleep quality and duration</li>
                      </ul>
                    </div>
                    <Button variant="outline" className="bg-transparent">
                      Edit Treatment Plan
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
