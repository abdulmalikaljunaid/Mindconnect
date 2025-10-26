"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { User, Mail, Phone, Award, CheckCircle, XCircle, Clock } from "lucide-react"

export default function DoctorApprovalsPage() {
  const [selectedDoctor, setSelectedDoctor] = useState<any>(null)
  const [showDialog, setShowDialog] = useState(false)

  const pendingDoctors = [
    {
      id: 1,
      name: "Dr. Robert Johnson",
      specialty: "Psychiatrist",
      email: "robert.j@email.com",
      phone: "+1 (555) 111-2222",
      experience: "8 years",
      education: "MD - Harvard Medical School",
      license: "PSY-12345",
      submittedDate: "2025-01-10",
      status: "pending",
    },
    {
      id: 2,
      name: "Dr. Lisa Anderson",
      specialty: "Clinical Psychologist",
      email: "lisa.a@email.com",
      phone: "+1 (555) 333-4444",
      experience: "12 years",
      education: "Ph.D. - Stanford University",
      license: "PSY-67890",
      submittedDate: "2025-01-12",
      status: "pending",
    },
  ]

  const approvedDoctors = [
    {
      id: 3,
      name: "Dr. Sarah Williams",
      specialty: "Clinical Psychologist",
      email: "sarah.w@email.com",
      approvedDate: "2025-01-05",
      status: "approved",
    },
    {
      id: 4,
      name: "Dr. Michael Chen",
      specialty: "Psychiatrist",
      email: "michael.c@email.com",
      approvedDate: "2025-01-03",
      status: "approved",
    },
  ]

  const rejectedDoctors = [
    {
      id: 5,
      name: "Dr. John Smith",
      specialty: "Therapist",
      email: "john.s@email.com",
      rejectedDate: "2025-01-08",
      reason: "Incomplete credentials",
      status: "rejected",
    },
  ]

  const handleReview = (doctor: any) => {
    setSelectedDoctor(doctor)
    setShowDialog(true)
  }

  const handleApprove = () => {
    // In a real app, this would make an API call
    console.log("Approved:", selectedDoctor)
    setShowDialog(false)
  }

  const handleReject = () => {
    // In a real app, this would make an API call
    console.log("Rejected:", selectedDoctor)
    setShowDialog(false)
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Doctor Approvals</h1>
          <p className="text-muted-foreground">Review and manage doctor registration requests</p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingDoctors.length}</div>
              <p className="text-xs text-muted-foreground">Awaiting review</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Approved</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{approvedDoctors.length}</div>
              <p className="text-xs text-muted-foreground">Active doctors</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rejected</CardTitle>
              <XCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{rejectedDoctors.length}</div>
              <p className="text-xs text-muted-foreground">Not approved</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="pending" className="space-y-4">
          <TabsList>
            <TabsTrigger value="pending">Pending ({pendingDoctors.length})</TabsTrigger>
            <TabsTrigger value="approved">Approved ({approvedDoctors.length})</TabsTrigger>
            <TabsTrigger value="rejected">Rejected ({rejectedDoctors.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4">
            {pendingDoctors.map((doctor) => (
              <Card key={doctor.id}>
                <CardContent className="pt-6">
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="flex gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                        <User className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="mb-1 flex items-center gap-2">
                          <h3 className="font-semibold">{doctor.name}</h3>
                          <Badge variant="secondary">Pending</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {doctor.specialty} • {doctor.experience} experience
                        </p>
                        <div className="mt-2 flex flex-wrap gap-3 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {doctor.email}
                          </div>
                          <div className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {doctor.phone}
                          </div>
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">Submitted: {doctor.submittedDate}</p>
                      </div>
                    </div>
                    <Button onClick={() => handleReview(doctor)}>Review Application</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="approved" className="space-y-4">
            {approvedDoctors.map((doctor) => (
              <Card key={doctor.id}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/10">
                        <User className="h-6 w-6 text-accent" />
                      </div>
                      <div>
                        <div className="mb-1 flex items-center gap-2">
                          <h3 className="font-semibold">{doctor.name}</h3>
                          <Badge className="bg-accent text-accent-foreground">Approved</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{doctor.specialty}</p>
                        <p className="text-xs text-muted-foreground">Approved: {doctor.approvedDate}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="rejected" className="space-y-4">
            {rejectedDoctors.map((doctor) => (
              <Card key={doctor.id}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
                        <User className="h-6 w-6 text-destructive" />
                      </div>
                      <div>
                        <div className="mb-1 flex items-center gap-2">
                          <h3 className="font-semibold">{doctor.name}</h3>
                          <Badge variant="destructive">Rejected</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{doctor.specialty}</p>
                        <p className="text-xs text-muted-foreground">
                          Rejected: {doctor.rejectedDate} • Reason: {doctor.reason}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </div>

      {/* Review Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Review Doctor Application</DialogTitle>
            <DialogDescription>Review the credentials and approve or reject this application</DialogDescription>
          </DialogHeader>

          {selectedDoctor && (
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <User className="h-8 w-8 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold">{selectedDoctor.name}</h3>
                  <p className="text-muted-foreground">{selectedDoctor.specialty}</p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Email</p>
                  <p className="text-sm text-muted-foreground">{selectedDoctor.email}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">Phone</p>
                  <p className="text-sm text-muted-foreground">{selectedDoctor.phone}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">Experience</p>
                  <p className="text-sm text-muted-foreground">{selectedDoctor.experience}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">License Number</p>
                  <p className="text-sm text-muted-foreground">{selectedDoctor.license}</p>
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-sm font-medium">Education</p>
                <p className="text-sm text-muted-foreground">{selectedDoctor.education}</p>
              </div>

              <div className="rounded-lg bg-muted p-4">
                <div className="mb-2 flex items-center gap-2 text-sm font-medium">
                  <Award className="h-4 w-4" />
                  Verification Checklist
                </div>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>✓ Valid medical license verified</li>
                  <li>✓ Education credentials confirmed</li>
                  <li>✓ Background check completed</li>
                  <li>✓ Professional references verified</li>
                </ul>
              </div>

              <div className="flex gap-2">
                <Button onClick={handleApprove} className="flex-1">
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Approve Application
                </Button>
                <Button onClick={handleReject} variant="destructive" className="flex-1">
                  <XCircle className="mr-2 h-4 w-4" />
                  Reject Application
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}
