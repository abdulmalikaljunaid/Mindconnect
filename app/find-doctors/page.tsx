"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { User, Search, Star, ArrowRight, BookOpen } from "lucide-react"

import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { supabaseClient } from "@/lib/supabase-client"
import { useToast } from "@/components/ui/use-toast"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface DoctorWithDetails {
  id: string
  name: string
  specialties: string[]
  experienceYears: number | null
  rating: number | null
  reviewsCount: number | null
  offersVideo: boolean | null
  offersInPerson: boolean | null
  bio: string | null
}

const FALLBACK_DOCTORS: DoctorWithDetails[] = [
  {
    id: "doc-1",
    name: "Dr. Sarah Williams",
    specialties: ["Anxiety", "Depression", "Stress Management"],
    experienceYears: 15,
    rating: 4.9,
    reviewsCount: 127,
    offersVideo: true,
    offersInPerson: true,
    bio: "أخصائية نفسية إكلينيكية متخصصة في علاج اضطرابات القلق والاكتئاب وإدارة التوتر.",
  },
  {
    id: "doc-2",
    name: "Dr. Michael Chen",
    specialties: ["Mood Disorders", "Medication Management", "Anxiety"],
    experienceYears: 12,
    rating: 4.8,
    reviewsCount: 98,
    offersVideo: true,
    offersInPerson: false,
    bio: "طبيب نفسي يوفر خطط علاج دوائية وسلوكية متكاملة لاضطرابات المزاج والقلق.",
  },
  {
    id: "doc-3",
    name: "Dr. Emily Thompson",
    specialties: ["CBT", "Trauma", "Sleep Disorders"],
    experienceYears: 10,
    rating: 4.9,
    reviewsCount: 156,
    offersVideo: true,
    offersInPerson: true,
    bio: "معالجة مرخّصة تقدم العلاج المعرفي السلوكي والتركيز على الصدمات واضطرابات النوم.",
  },
]

const useFindDoctors = () => {
  const [doctors, setDoctors] = useState<DoctorWithDetails[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    const fetchDoctors = async () => {
      setIsLoading(true)
      const { data, error } = await supabaseClient
        .from("doctor_profiles")
        .select(
          `
          profile_id,
          experience_years,
          offers_video,
          offers_in_person,
          metadata,
          profile:profiles(name, bio, is_approved),
          doctor_specialties(specialties(name))
        `,
        )
        .eq("profile.is_approved", true)

      if (error) {
        console.error("Failed to fetch doctors", error)
        setError("تعذر تحميل قائمة الأطباء. تم عرض قائمة افتراضية مؤقتاً.")
        toast({
          variant: "destructive",
          title: "تعذر تحميل الأطباء",
          description: "تم استخدام قائمة أطباء افتراضية مؤقتاً لحين توافر البيانات",
        })
        setDoctors(FALLBACK_DOCTORS)
      } else {
        const mapped = (data ?? []).map((row) => ({
            id: row.profile_id,
            name: row.profile?.name ?? "بدون اسم",
            specialties:
              row.doctor_specialties
                ?.map((item) => item.specialties?.name ?? "")
                .filter((name): name is string => Boolean(name)) ?? [],
            experienceYears: row.experience_years ?? null,
            rating: row.metadata?.rating ?? null,
            reviewsCount: row.metadata?.reviews_count ?? null,
            offersVideo: row.offers_video,
            offersInPerson: row.offers_in_person,
            bio: row.profile?.bio ?? row.metadata?.bio ?? null,
          }))

        if (mapped.length === 0) {
          setError("لا توجد بيانات أطباء معتمدة حتى الآن. تم عرض قائمة افتراضية مؤقتاً.")
          toast({
            title: "قائمة الأطباء فارغة",
            description: "قم بإتمام إعداد الأطباء في لوحة الإدارة للحصول على نتائج حقيقية",
          })
          setDoctors(FALLBACK_DOCTORS)
        } else {
          setDoctors(mapped)
          setError(null)
        }
      }
      setIsLoading(false)
    }

    fetchDoctors()
  }, [])

  return { doctors, isLoading, error }
}

export default function FindDoctorsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [specialty, setSpecialty] = useState("all")
  const { doctors, isLoading, error } = useFindDoctors()

  const filteredDoctors = useMemo(() => {
    const lowerQuery = searchQuery.toLowerCase()
    return doctors.filter((doctor) => {
      const matchesSearch = doctor.name.toLowerCase().includes(lowerQuery)
      const matchesSpecialty = specialty === "all" || doctor.specialties.includes(specialty)
      return matchesSearch && matchesSpecialty
    })
  }, [doctors, searchQuery, specialty])

  const specialties = useMemo(() => {
    const unique = new Set<string>()
    doctors.forEach((doctor) => doctor.specialties.forEach((spec) => unique.add(spec)))
    return Array.from(unique)
  }, [doctors])

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
              {specialties.map((spec) => (
                <SelectItem key={spec} value={spec}>
                  {spec}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Results Count */}
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            {isLoading
              ? "Loading doctors..."
              : `Showing ${filteredDoctors.length} ${filteredDoctors.length === 1 ? "doctor" : "doctors"}`}
          </p>
          {error && (
            <Alert variant="destructive" className="max-w-xl">
              <AlertTitle>تنبيه</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>

        {/* Doctor List */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="py-10 text-center text-muted-foreground">Loading doctors...</div>
          ) : filteredDoctors.length === 0 ? (
            <div className="py-10 text-center text-muted-foreground">No doctors found</div>
          ) : (
            filteredDoctors.map((doctor) => (
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
                          <Badge variant="secondary">{doctor.specialties[0] ?? "Mental Health"}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {doctor.experienceYears ? `${doctor.experienceYears} years experience` : "Experience not provided"}
                        </p>
                        <div className="mt-2 flex items-center gap-4 text-sm">
                          {doctor.rating && (
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 fill-accent text-accent" />
                              <span className="font-medium">{doctor.rating.toFixed(1)}</span>
                              {doctor.reviewsCount && (
                                <span className="text-muted-foreground">({doctor.reviewsCount} reviews)</span>
                              )}
                            </div>
                          )}
                        </div>
                        {doctor.bio && <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{doctor.bio}</p>}
                        <div className="mt-3 flex flex-wrap gap-2">
                          {doctor.specialties.map((spec) => (
                            <Badge key={spec} variant="outline">
                              {spec}
                            </Badge>
                          ))}
                          {doctor.offersVideo && <Badge variant="outline">Video sessions</Badge>}
                          {doctor.offersInPerson && <Badge variant="outline">In-person sessions</Badge>}
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
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
