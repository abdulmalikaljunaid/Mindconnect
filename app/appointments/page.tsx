"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, Clock, User, Video, MapPin, Plus } from "lucide-react"
import Link from "next/link"

export default function AppointmentsPage() {
  const upcomingAppointments = [
    {
      id: 1,
      doctor: "Dr. Sarah Williams",
      specialty: "Clinical Psychologist",
      date: "2025-01-15",
      time: "10:00 AM",
      duration: "50 min",
      type: "video",
      status: "confirmed",
    },
    {
      id: 2,
      doctor: "Dr. Michael Chen",
      specialty: "Psychiatrist",
      date: "2025-01-20",
      time: "2:30 PM",
      duration: "30 min",
      type: "in-person",
      status: "confirmed",
    },
  ]

  const pastAppointments = [
    {
      id: 3,
      doctor: "Dr. Sarah Williams",
      specialty: "Clinical Psychologist",
      date: "2025-01-08",
      time: "10:00 AM",
      duration: "50 min",
      type: "video",
      status: "completed",
    },
    {
      id: 4,
      doctor: "Dr. Emily Thompson",
      specialty: "Licensed Therapist",
      date: "2025-01-05",
      time: "3:00 PM",
      duration: "50 min",
      type: "in-person",
      status: "completed",
    },
  ]

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Appointments</h1>
            <p className="text-muted-foreground">Manage your scheduled sessions</p>
          </div>
          <Button asChild>
            <Link href="/book-appointment">
              <Plus className="mr-2 h-4 w-4" />
              Book Appointment
            </Link>
          </Button>
        </div>

        <Tabs defaultValue="upcoming" className="space-y-4">
          <TabsList>
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="past">Past</TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="space-y-4">
            {upcomingAppointments.map((appointment) => (
              <Card key={appointment.id}>
                <CardContent className="pt-6">
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="flex gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                        <User className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold">{appointment.doctor}</h3>
                        <p className="text-sm text-muted-foreground">{appointment.specialty}</p>
                        <div className="mt-2 flex flex-wrap items-center gap-3 text-sm">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span>{appointment.date}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span>
                              {appointment.time} ({appointment.duration})
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            {appointment.type === "video" ? (
                              <>
                                <Video className="h-4 w-4 text-muted-foreground" />
                                <span>Video Call</span>
                              </>
                            ) : (
                              <>
                                <MapPin className="h-4 w-4 text-muted-foreground" />
                                <span>In-Person</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Badge className="bg-accent text-accent-foreground capitalize">{appointment.status}</Badge>
                      <Button variant="outline" size="sm" className="bg-transparent">
                        Reschedule
                      </Button>
                      <Button variant="outline" size="sm" className="bg-transparent">
                        Cancel
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="past" className="space-y-4">
            {pastAppointments.map((appointment) => (
              <Card key={appointment.id}>
                <CardContent className="pt-6">
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="flex gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                        <User className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold">{appointment.doctor}</h3>
                        <p className="text-sm text-muted-foreground">{appointment.specialty}</p>
                        <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>{appointment.date}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>
                              {appointment.time} ({appointment.duration})
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant="secondary" className="capitalize">
                        {appointment.status}
                      </Badge>
                      <Button variant="outline" size="sm" className="bg-transparent">
                        View Notes
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
