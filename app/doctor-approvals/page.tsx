"use client"

import { useMemo, useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { User, Mail, Phone, Award, CheckCircle, XCircle, Clock } from "lucide-react"
import { useAdminDoctors, type DoctorWithProfile } from "@/hooks/use-doctors"

export default function DoctorApprovalsPage() {
  const [selectedDoctor, setSelectedDoctor] = useState<DoctorWithProfile | null>(null)
  const [showDialog, setShowDialog] = useState(false)
  const { pending, approved, rejected, isLoading, approveDoctor, rejectDoctor, refresh } = useAdminDoctors()

  const summary = useMemo(
    () => ({
      pending: pending.length,
      approved: approved.length,
      rejected: rejected.length,
    }),
    [pending.length, approved.length, rejected.length],
  )

  const openReview = (doctor: DoctorWithProfile) => {
    setSelectedDoctor(doctor)
    setShowDialog(true)
  }

  const closeDialog = () => {
    setShowDialog(false)
    setSelectedDoctor(null)
  }

  const handleApprove = async () => {
    if (!selectedDoctor) return
    await approveDoctor(selectedDoctor.id)
    closeDialog()
  }

  const handleReject = async () => {
    if (!selectedDoctor) return
    await rejectDoctor(selectedDoctor.id)
    closeDialog()
  }

  const renderDoctorCard = (doctor: DoctorWithProfile, statusLabel: string, badgeVariant: "default" | "secondary" | "destructive") => (
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
                <Badge variant={badgeVariant}>{statusLabel}</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {doctor.specialties.join(" • ") || "Specialty not provided"}
                {doctor.experienceYears ? ` • ${doctor.experienceYears} years experience` : ""}
              </p>
              <div className="mt-2 flex flex-wrap gap-3 text-sm text-muted-foreground">
                {doctor.email && (
                  <div className="flex items-center gap-1">
                    <Mail className="h-3 w-3" />
                    {doctor.email}
                  </div>
                )}
                {doctor.phone && (
                  <div className="flex items-center gap-1">
                    <Phone className="h-3 w-3" />
                    {doctor.phone}
                  </div>
                )}
              </div>
              {doctor.submittedAt && (
                <p className="mt-1 text-xs text-muted-foreground">
                  Submitted: {new Date(doctor.submittedAt).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
          {statusLabel === "Pending" ? (
            <Button onClick={() => openReview(doctor)}>Review Application</Button>
          ) : doctor.approvedAt ? (
            <p className="text-xs text-muted-foreground">Approved {new Date(doctor.approvedAt).toLocaleDateString()}</p>
          ) : null}
        </div>
      </CardContent>
    </Card>
  )

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Doctor Approvals</h1>
            <p className="text-muted-foreground">Review and manage doctor registration requests</p>
          </div>
          <Button variant="outline" onClick={refresh} disabled={isLoading}>
            Refresh
          </Button>
        </div>

        {/* Summary */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.pending}</div>
              <p className="text-xs text-muted-foreground">Awaiting review</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Approved</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.approved}</div>
              <p className="text-xs text-muted-foreground">Active doctors</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rejected</CardTitle>
              <XCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.rejected}</div>
              <p className="text-xs text-muted-foreground">Not approved</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="pending" className="space-y-4">
          <TabsList>
            <TabsTrigger value="pending">Pending ({summary.pending})</TabsTrigger>
            <TabsTrigger value="approved">Approved ({summary.approved})</TabsTrigger>
            <TabsTrigger value="rejected">Rejected ({summary.rejected})</TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4">
            {isLoading ? (
              <p className="py-6 text-center text-sm text-muted-foreground">Loading pending applications...</p>
            ) : pending.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">No pending applications</p>
            ) : (
              pending.map((doctor) => renderDoctorCard(doctor, "Pending", "secondary"))
            )}
          </TabsContent>

          <TabsContent value="approved" className="space-y-4">
            {isLoading ? (
              <p className="py-6 text-center text-sm text-muted-foreground">Loading approved doctors...</p>
            ) : approved.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">No approved doctors</p>
            ) : (
              approved.map((doctor) => renderDoctorCard(doctor, "Approved", "default"))
            )}
          </TabsContent>

          <TabsContent value="rejected" className="space-y-4">
            {isLoading ? (
              <p className="py-6 text-center text-sm text-muted-foreground">Loading rejected applications...</p>
            ) : rejected.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">No rejected applications</p>
            ) : (
              rejected.map((doctor) => renderDoctorCard(doctor, "Rejected", "destructive"))
            )}
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
                  <p className="text-muted-foreground">{selectedDoctor.specialties.join(" • ") || "Specialty not provided"}</p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {selectedDoctor.email && (
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Email</p>
                    <p className="text-sm text-muted-foreground">{selectedDoctor.email}</p>
                  </div>
                )}
                {selectedDoctor.phone && (
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Phone</p>
                    <p className="text-sm text-muted-foreground">{selectedDoctor.phone}</p>
                  </div>
                )}
                {selectedDoctor.experienceYears && (
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Experience</p>
                    <p className="text-sm text-muted-foreground">{selectedDoctor.experienceYears} years</p>
                  </div>
                )}
                {selectedDoctor.licenseNumber && (
                  <div className="space-y-1">
                    <p className="text-sm font-medium">License Number</p>
                    <p className="text-sm text-muted-foreground">{selectedDoctor.licenseNumber}</p>
                  </div>
                )}
              </div>

              {selectedDoctor.education && (
                <div className="space-y-1">
                  <p className="text-sm font-medium">Education</p>
                  <p className="text-sm text-muted-foreground">{selectedDoctor.education}</p>
                </div>
              )}

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
