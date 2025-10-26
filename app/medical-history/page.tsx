"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FileText, Calendar } from "lucide-react"

export default function MedicalHistoryPage() {
  const medicalRecords = [
    {
      id: 1,
      date: "2025-01-08",
      doctor: "Dr. Sarah Williams",
      type: "Session Notes",
      summary: "Discussed coping strategies for anxiety. Patient showing improvement in managing stress.",
      tags: ["Anxiety", "Progress"],
    },
    {
      id: 2,
      date: "2025-01-05",
      doctor: "Dr. Emily Thompson",
      type: "Assessment",
      summary: "Initial assessment completed. Recommended CBT approach for treatment.",
      tags: ["Assessment", "CBT"],
    },
    {
      id: 3,
      date: "2024-12-20",
      doctor: "Dr. Michael Chen",
      type: "Prescription",
      summary: "Prescribed medication for anxiety management. Follow-up in 2 weeks.",
      tags: ["Medication", "Anxiety"],
    },
  ]

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Medical History</h1>
          <p className="text-muted-foreground">Your complete mental health journey and records</p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-muted-foreground">Since joining</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Last Session</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Jan 8</div>
              <p className="text-xs text-muted-foreground">2025</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Treatments</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2</div>
              <p className="text-xs text-muted-foreground">Ongoing</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Medical Records</CardTitle>
            <CardDescription>Chronological history of your sessions and treatments</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {medicalRecords.map((record) => (
              <div key={record.id} className="rounded-lg border border-border p-4">
                <div className="mb-2 flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold">{record.type}</h3>
                    <p className="text-sm text-muted-foreground">
                      {record.doctor} • {record.date}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {record.tags.map((tag) => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
                <p className="text-sm leading-relaxed">{record.summary}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
