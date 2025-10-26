"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Clock, Calendar } from "lucide-react"

export default function AvailabilityPage() {
  const [selectedDays, setSelectedDays] = useState<string[]>(["monday", "tuesday", "wednesday", "thursday", "friday"])

  const daysOfWeek = [
    { id: "monday", label: "Monday" },
    { id: "tuesday", label: "Tuesday" },
    { id: "wednesday", label: "Wednesday" },
    { id: "thursday", label: "Thursday" },
    { id: "friday", label: "Friday" },
    { id: "saturday", label: "Saturday" },
    { id: "sunday", label: "Sunday" },
  ]

  const timeSlots = [
    { day: "Monday", slots: ["9:00 AM - 10:00 AM", "10:00 AM - 11:00 AM", "2:00 PM - 3:00 PM", "3:00 PM - 4:00 PM"] },
    { day: "Tuesday", slots: ["9:00 AM - 10:00 AM", "10:00 AM - 11:00 AM", "2:00 PM - 3:00 PM"] },
    { day: "Wednesday", slots: ["9:00 AM - 10:00 AM", "2:00 PM - 3:00 PM", "3:00 PM - 4:00 PM"] },
  ]

  const toggleDay = (dayId: string) => {
    setSelectedDays((prev) => (prev.includes(dayId) ? prev.filter((d) => d !== dayId) : [...prev, dayId]))
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Manage Availability</h1>
          <p className="text-muted-foreground">Set your working hours and available time slots</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Settings */}
          <div className="space-y-6 lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Working Days</CardTitle>
                <CardDescription>Select the days you're available to see patients</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  {daysOfWeek.map((day) => (
                    <div key={day.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={day.id}
                        checked={selectedDays.includes(day.id)}
                        onCheckedChange={() => toggleDay(day.id)}
                      />
                      <Label htmlFor={day.id} className="cursor-pointer font-normal">
                        {day.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Working Hours</CardTitle>
                <CardDescription>Set your default working hours for each day</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Start Time</Label>
                    <Select defaultValue="9">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="8">8:00 AM</SelectItem>
                        <SelectItem value="9">9:00 AM</SelectItem>
                        <SelectItem value="10">10:00 AM</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>End Time</Label>
                    <Select defaultValue="17">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="16">4:00 PM</SelectItem>
                        <SelectItem value="17">5:00 PM</SelectItem>
                        <SelectItem value="18">6:00 PM</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Session Duration</Label>
                  <Select defaultValue="50">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="45">45 minutes</SelectItem>
                      <SelectItem value="50">50 minutes</SelectItem>
                      <SelectItem value="60">60 minutes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Break Between Sessions</Label>
                  <Select defaultValue="10">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5 minutes</SelectItem>
                      <SelectItem value="10">10 minutes</SelectItem>
                      <SelectItem value="15">15 minutes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button>Save Settings</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Current Schedule</CardTitle>
                <CardDescription>Your available time slots for this week</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {timeSlots.map((daySchedule) => (
                  <div key={daySchedule.day}>
                    <h4 className="mb-2 font-medium">{daySchedule.day}</h4>
                    <div className="flex flex-wrap gap-2">
                      {daySchedule.slots.map((slot, index) => (
                        <Badge key={index} variant="secondary" className="px-3 py-1">
                          {slot}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Summary */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Availability Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <Calendar className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Working Days</p>
                    <p className="font-medium">{selectedDays.length} days/week</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <Clock className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Daily Hours</p>
                    <p className="font-medium">9:00 AM - 5:00 PM</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Tips</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <p>• Set realistic working hours to avoid burnout</p>
                <p>• Include breaks between sessions</p>
                <p>• Update your availability regularly</p>
                <p>• Block time for administrative tasks</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
