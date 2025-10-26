"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { User, Star, Calendar, Award, BookOpen, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function DoctorProfilePage() {
  const doctor = {
    id: 1,
    name: "Dr. Sarah Williams",
    specialty: "Clinical Psychologist",
    experience: "15 years",
    rating: 4.9,
    reviews: 127,
    specializations: ["Anxiety", "Depression", "Stress Management", "CBT", "Mindfulness"],
    availability: "Available this week",
    bio: "Dr. Sarah Williams is a board-certified clinical psychologist with over 15 years of experience helping individuals overcome anxiety, depression, and stress-related challenges. She specializes in cognitive behavioral therapy (CBT) and mindfulness-based approaches.",
    education: [
      "Ph.D. in Clinical Psychology - Stanford University",
      "M.A. in Psychology - University of California, Berkeley",
      "B.A. in Psychology - Yale University",
    ],
    certifications: [
      "Licensed Clinical Psychologist",
      "Certified CBT Practitioner",
      "Mindfulness-Based Stress Reduction (MBSR) Certified",
    ],
    approach:
      "I believe in a collaborative, client-centered approach to therapy. My goal is to create a safe, non-judgmental space where you can explore your thoughts and feelings, develop coping strategies, and work towards meaningful change.",
  }

  const reviews = [
    {
      id: 1,
      author: "Anonymous Patient",
      rating: 5,
      date: "2 weeks ago",
      comment:
        "Dr. Williams has been incredibly helpful in managing my anxiety. Her approach is compassionate and practical.",
    },
    {
      id: 2,
      author: "Anonymous Patient",
      rating: 5,
      date: "1 month ago",
      comment: "Highly recommend! She really listens and provides actionable strategies.",
    },
    {
      id: 3,
      author: "Anonymous Patient",
      rating: 5,
      date: "2 months ago",
      comment: "Professional, caring, and effective. I've seen significant improvement in my mental health.",
    },
  ]

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button asChild variant="ghost" size="icon">
            <Link href="/find-doctors">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Doctor Profile</h1>
            <p className="text-muted-foreground">Learn more about this mental health professional</p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Profile */}
          <div className="space-y-6 lg:col-span-2">
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col gap-6 md:flex-row">
                  <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary/10">
                    <User className="h-12 w-12 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="mb-2 flex items-center gap-2">
                      <h2 className="text-2xl font-bold">{doctor.name}</h2>
                      <Badge variant="secondary">{doctor.availability}</Badge>
                    </div>
                    <p className="mb-2 text-muted-foreground">
                      {doctor.specialty} • {doctor.experience} experience
                    </p>
                    <div className="mb-4 flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <Star className="h-5 w-5 fill-accent text-accent" />
                        <span className="text-lg font-medium">{doctor.rating}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">({doctor.reviews} reviews)</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {doctor.specializations.map((spec) => (
                        <Badge key={spec} variant="outline">
                          {spec}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>About</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="leading-relaxed text-muted-foreground">{doctor.bio}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Treatment Approach</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="leading-relaxed text-muted-foreground">{doctor.approach}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Education
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {doctor.education.map((edu, index) => (
                    <li key={index} className="text-sm text-muted-foreground">
                      • {edu}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Certifications
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {doctor.certifications.map((cert, index) => (
                    <li key={index} className="text-sm text-muted-foreground">
                      • {cert}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Patient Reviews</CardTitle>
                <CardDescription>{doctor.reviews} verified reviews</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {reviews.map((review) => (
                  <div key={review.id} className="rounded-lg border border-border p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="flex">
                          {Array.from({ length: review.rating }).map((_, i) => (
                            <Star key={i} className="h-4 w-4 fill-accent text-accent" />
                          ))}
                        </div>
                        <span className="text-sm font-medium">{review.author}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">{review.date}</span>
                    </div>
                    <p className="text-sm leading-relaxed text-muted-foreground">{review.comment}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Book Appointment</CardTitle>
                <CardDescription>Schedule a session with {doctor.name}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button asChild className="w-full">
                  <Link href={`/book-appointment?doctor=${doctor.id}`}>
                    <Calendar className="mr-2 h-4 w-4" />
                    Book Now
                  </Link>
                </Button>
                <div className="rounded-lg bg-muted p-4 text-sm">
                  <p className="mb-2 font-medium">Session Details</p>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• 50-minute sessions</li>
                    <li>• Video or in-person</li>
                    <li>• Flexible scheduling</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Experience</p>
                  <p className="text-lg font-semibold">{doctor.experience}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Patient Rating</p>
                  <p className="text-lg font-semibold">{doctor.rating}/5.0</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Reviews</p>
                  <p className="text-lg font-semibold">{doctor.reviews}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
