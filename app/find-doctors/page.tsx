"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { User, Search, Star, ArrowRight } from "lucide-react"
import Link from "next/link"

export default function FindDoctorsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [specialty, setSpecialty] = useState("all")

  const doctors = [
    {
      id: 1,
      name: "Dr. Sarah Williams",
      specialty: "Clinical Psychologist",
      experience: "15 years",
      rating: 4.9,
      reviews: 127,
      specializations: ["Anxiety", "Depression", "Stress Management"],
      availability: "Available this week",
      bio: "Specializing in cognitive behavioral therapy with a focus on anxiety and depression management.",
    },
    {
      id: 2,
      name: "Dr. Michael Chen",
      specialty: "Psychiatrist",
      experience: "12 years",
      rating: 4.8,
      reviews: 98,
      specializations: ["Mood Disorders", "Anxiety", "Medication Management"],
      availability: "Available this week",
      bio: "Board-certified psychiatrist with expertise in medication management and mood disorders.",
    },
    {
      id: 3,
      name: "Dr. Emily Thompson",
      specialty: "Licensed Therapist",
      experience: "10 years",
      rating: 4.9,
      reviews: 156,
      specializations: ["CBT", "Trauma", "Sleep Disorders"],
      availability: "Available next week",
      bio: "Experienced therapist specializing in trauma-informed care and cognitive behavioral therapy.",
    },
    {
      id: 4,
      name: "Dr. James Martinez",
      specialty: "Clinical Psychologist",
      experience: "8 years",
      rating: 4.7,
      reviews: 84,
      specializations: ["Relationship Issues", "Family Therapy", "Stress"],
      availability: "Available this week",
      bio: "Focused on relationship counseling and family therapy with a holistic approach.",
    },
  ]

  const filteredDoctors = doctors.filter((doctor) => {
    const matchesSearch = doctor.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesSpecialty = specialty === "all" || doctor.specialty === specialty
    return matchesSearch && matchesSpecialty
  })

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Find a Doctor</h1>
          <p className="text-muted-foreground">Browse our network of qualified mental health professionals</p>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-4 md:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={specialty} onValueChange={setSpecialty}>
            <SelectTrigger className="w-full md:w-64">
              <SelectValue placeholder="Select specialty" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Specialties</SelectItem>
              <SelectItem value="Clinical Psychologist">Clinical Psychologist</SelectItem>
              <SelectItem value="Psychiatrist">Psychiatrist</SelectItem>
              <SelectItem value="Licensed Therapist">Licensed Therapist</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Results Count */}
        <p className="text-sm text-muted-foreground">
          Showing {filteredDoctors.length} {filteredDoctors.length === 1 ? "doctor" : "doctors"}
        </p>

        {/* Doctor List */}
        <div className="space-y-4">
          {filteredDoctors.map((doctor) => (
            <Card key={doctor.id} className="transition-shadow hover:shadow-lg">
              <CardContent className="pt-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="flex gap-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                      <User className="h-8 w-8 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="mb-1 flex items-center gap-2">
                        <h3 className="text-xl font-semibold">{doctor.name}</h3>
                        <Badge variant="secondary">{doctor.availability}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {doctor.specialty} • {doctor.experience} experience
                      </p>
                      <div className="mt-2 flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-accent text-accent" />
                          <span className="font-medium">{doctor.rating}</span>
                          <span className="text-muted-foreground">({doctor.reviews} reviews)</span>
                        </div>
                      </div>
                      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{doctor.bio}</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {doctor.specializations.map((spec) => (
                          <Badge key={spec} variant="outline">
                            {spec}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 md:flex-col">
                    <Button asChild className="flex-1">
                      <Link href={`/book-appointment?doctor=${doctor.id}`}>
                        Book Now
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                    <Button asChild variant="outline" className="flex-1 bg-transparent">
                      <Link href={`/doctors/${doctor.id}`}>View Profile</Link>
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
