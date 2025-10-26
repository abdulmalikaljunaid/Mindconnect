"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Search, User, Star, ArrowRight } from "lucide-react"
import Link from "next/link"

export default function SymptomsMatcherPage() {
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([])
  const [showResults, setShowResults] = useState(false)

  const symptomCategories = [
    {
      category: "Mood & Emotions",
      symptoms: ["Persistent sadness", "Anxiety", "Mood swings", "Irritability", "Loss of interest"],
    },
    {
      category: "Sleep & Energy",
      symptoms: ["Insomnia", "Excessive sleeping", "Fatigue", "Low energy"],
    },
    {
      category: "Thoughts & Behavior",
      symptoms: ["Racing thoughts", "Difficulty concentrating", "Intrusive thoughts", "Compulsive behaviors"],
    },
    {
      category: "Physical Symptoms",
      symptoms: ["Headaches", "Appetite changes", "Physical tension", "Panic attacks"],
    },
  ]

  const matchedDoctors = [
    {
      id: 1,
      name: "Dr. Sarah Williams",
      specialty: "Clinical Psychologist",
      experience: "15 years",
      rating: 4.9,
      reviews: 127,
      matchScore: 95,
      specializations: ["Anxiety", "Depression", "Stress Management"],
    },
    {
      id: 2,
      name: "Dr. Michael Chen",
      specialty: "Psychiatrist",
      experience: "12 years",
      rating: 4.8,
      reviews: 98,
      matchScore: 88,
      specializations: ["Mood Disorders", "Anxiety", "Medication Management"],
    },
    {
      id: 3,
      name: "Dr. Emily Thompson",
      specialty: "Licensed Therapist",
      experience: "10 years",
      rating: 4.9,
      reviews: 156,
      matchScore: 85,
      specializations: ["CBT", "Trauma", "Sleep Disorders"],
    },
  ]

  const toggleSymptom = (symptom: string) => {
    setSelectedSymptoms((prev) => (prev.includes(symptom) ? prev.filter((s) => s !== symptom) : [...prev, symptom]))
  }

  const handleFindDoctors = () => {
    setShowResults(true)
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Find Your Perfect Match</h1>
          <p className="text-muted-foreground">
            Select your symptoms to find doctors specialized in treating your concerns
          </p>
        </div>

        {!showResults ? (
          <>
            {/* Symptoms Selection */}
            <div className="space-y-6">
              {symptomCategories.map((category) => (
                <Card key={category.category}>
                  <CardHeader>
                    <CardTitle className="text-lg">{category.category}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {category.symptoms.map((symptom) => (
                        <div key={symptom} className="flex items-center space-x-2">
                          <Checkbox
                            id={symptom}
                            checked={selectedSymptoms.includes(symptom)}
                            onCheckedChange={() => toggleSymptom(symptom)}
                          />
                          <Label htmlFor={symptom} className="cursor-pointer text-sm font-normal">
                            {symptom}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Selected Symptoms Summary */}
            {selectedSymptoms.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Selected Symptoms ({selectedSymptoms.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {selectedSymptoms.map((symptom) => (
                      <Badge
                        key={symptom}
                        variant="secondary"
                        className="cursor-pointer"
                        onClick={() => toggleSymptom(symptom)}
                      >
                        {symptom} ×
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Find Doctors Button */}
            <Button
              size="lg"
              className="w-full md:w-auto"
              onClick={handleFindDoctors}
              disabled={selectedSymptoms.length === 0}
            >
              <Search className="mr-2 h-5 w-5" />
              Find Matching Doctors
            </Button>
          </>
        ) : (
          <>
            {/* Results Header */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Found {matchedDoctors.length} doctors matching your symptoms
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {selectedSymptoms.slice(0, 3).map((symptom) => (
                        <Badge key={symptom} variant="secondary">
                          {symptom}
                        </Badge>
                      ))}
                      {selectedSymptoms.length > 3 && (
                        <Badge variant="secondary">+{selectedSymptoms.length - 3} more</Badge>
                      )}
                    </div>
                  </div>
                  <Button variant="outline" onClick={() => setShowResults(false)} className="bg-transparent">
                    Edit Symptoms
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Matched Doctors */}
            <div className="space-y-4">
              {matchedDoctors.map((doctor) => (
                <Card key={doctor.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                      <div className="flex gap-4">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                          <User className="h-8 w-8 text-primary" />
                        </div>
                        <div className="flex-1">
                          <div className="mb-1 flex items-center gap-2">
                            <h3 className="text-xl font-semibold">{doctor.name}</h3>
                            <Badge className="bg-accent text-accent-foreground">{doctor.matchScore}% Match</Badge>
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
                          <div className="mt-2 flex flex-wrap gap-2">
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
                            Book Appointment
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
          </>
        )}
      </div>
    </DashboardLayout>
  )
}
