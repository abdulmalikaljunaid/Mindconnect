"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, Calendar, Download } from "lucide-react"
import Link from "next/link"

export default function BookingConfirmationPage() {
  return (
    <DashboardLayout>
      <div className="mx-auto max-w-2xl space-y-6">
        <Card className="text-center">
          <CardHeader>
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-accent/10">
              <CheckCircle className="h-8 w-8 text-accent" />
            </div>
            <CardTitle className="text-2xl">Appointment Confirmed!</CardTitle>
            <CardDescription>Your appointment has been successfully scheduled</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="rounded-lg border border-border bg-muted p-6 text-left">
              <h3 className="mb-4 font-semibold">Appointment Details</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Doctor</span>
                  <span className="font-medium">Dr. Sarah Williams</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Date</span>
                  <span className="font-medium">Monday, January 15, 2025</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Time</span>
                  <span className="font-medium">10:00 AM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Type</span>
                  <span className="font-medium">Video Call</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Duration</span>
                  <span className="font-medium">50 minutes</span>
                </div>
              </div>
            </div>

            <div className="rounded-lg bg-secondary p-4 text-left text-sm">
              <p className="font-medium">What's Next?</p>
              <ul className="mt-2 space-y-1 text-muted-foreground">
                <li>• You'll receive a confirmation email shortly</li>
                <li>• A reminder will be sent 24 hours before your appointment</li>
                <li>• For video calls, the meeting link will be sent 15 minutes before</li>
              </ul>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <Button asChild className="flex-1">
                <Link href="/appointments">
                  <Calendar className="mr-2 h-4 w-4" />
                  View All Appointments
                </Link>
              </Button>
              <Button asChild variant="outline" className="flex-1 bg-transparent">
                <Link href="/dashboard">Go to Dashboard</Link>
              </Button>
            </div>

            <Button variant="ghost" className="w-full">
              <Download className="mr-2 h-4 w-4" />
              Download Calendar Event
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
