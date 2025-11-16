"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Search, User, Star, ArrowRight } from "lucide-react"
import Link from "next/link"
import { findBestMatchingDoctors, getSpecialtyDisplayName } from "@/lib/doctors"
import type { Specialty } from "@/types/assessment"
import { Spinner } from "@/components/ui/spinner"

interface MatchedDoctor {
  id: string
  name: string
  specialty: string
  experience: string
  rating: number
  reviews: number
  matchScore: number
  specializations: string[]
}

// Mapping symptoms to specialties
const symptomToSpecialtyMap: Record<string, Specialty[]> = {
  "حزن مستمر": ["depression-anxiety"],
  "قلق": ["depression-anxiety", "cognitive-behavioral"],
  "تقلبات مزاجية": ["depression-anxiety", "psychotic-disorders"],
  "تهيج": ["depression-anxiety"],
  "فقدان الاهتمام": ["depression-anxiety"],
  "أرق": ["sleep-disorders"],
  "نوم مفرط": ["sleep-disorders"],
  "إرهاق": ["general-psychiatry", "depression-anxiety"],
  "انخفاض الطاقة": ["depression-anxiety"],
  "أفكار متسارعة": ["depression-anxiety", "cognitive-behavioral"],
  "صعوبة في التركيز": ["child-adolescent", "depression-anxiety"],
  "أفكار تدخلية": ["depression-anxiety", "cognitive-behavioral"],
  "سلوكيات قهرية": ["depression-anxiety", "cognitive-behavioral"],
  "صداع": ["general-psychiatry"],
  "تغيرات في الشهية": ["eating-disorders", "depression-anxiety"],
  "توتر جسدي": ["depression-anxiety"],
  "نوبات هلع": ["depression-anxiety", "trauma-ptsd"],
}

export default function SymptomsMatcherPage() {
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([])
  const [showResults, setShowResults] = useState(false)
  const [matchedDoctors, setMatchedDoctors] = useState<MatchedDoctor[]>([])
  const [isLoadingDoctors, setIsLoadingDoctors] = useState(false)

  const symptomCategories = [
    {
      category: "المزاج والعواطف",
      symptoms: ["حزن مستمر", "قلق", "تقلبات مزاجية", "تهيج", "فقدان الاهتمام"],
    },
    {
      category: "النوم والطاقة",
      symptoms: ["أرق", "نوم مفرط", "إرهاق", "انخفاض الطاقة"],
    },
    {
      category: "الأفكار والسلوك",
      symptoms: ["أفكار متسارعة", "صعوبة في التركيز", "أفكار تدخلية", "سلوكيات قهرية"],
    },
    {
      category: "الأعراض الجسدية",
      symptoms: ["صداع", "تغيرات في الشهية", "توتر جسدي", "نوبات هلع"],
    },
  ]

  const toggleSymptom = (symptom: string) => {
    setSelectedSymptoms((prev) => (prev.includes(symptom) ? prev.filter((s) => s !== symptom) : [...prev, symptom]))
  }

  const handleFindDoctors = async () => {
    setIsLoadingDoctors(true)
    setShowResults(true)

    try {
      // تحويل الأعراض المختارة إلى تخصصات مطلوبة
      const requiredSpecialties = new Set<Specialty>()
      selectedSymptoms.forEach((symptom) => {
        const specialties = symptomToSpecialtyMap[symptom] || []
        specialties.forEach((spec) => requiredSpecialties.add(spec))
      })

      // جلب الأطباء المطابقين من قاعدة البيانات
      const matches = await findBestMatchingDoctors(Array.from(requiredSpecialties))

      // تحويل البيانات إلى الصيغة المطلوبة
      const doctors: MatchedDoctor[] = matches.map((match) => ({
        id: match.doctor.id,
        name: match.doctor.nameAr || match.doctor.name,
        specialty: match.doctor.specialties
          .map((spec) => getSpecialtyDisplayName(spec))
          .join(", ") || "طبيب نفسي",
        experience: `${match.doctor.experience} سنوات`,
        rating: match.doctor.rating,
        reviews: 0, // يمكن إضافة عدد المراجعات لاحقاً
        matchScore: match.matchScore,
        specializations: match.doctor.specialties.map((spec) => getSpecialtyDisplayName(spec)),
      }))

      setMatchedDoctors(doctors)
    } catch (error) {
      console.error("Error fetching doctors:", error)
      setMatchedDoctors([])
    } finally {
      setIsLoadingDoctors(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">ابحث عن الطبيب المناسب لك</h1>
          <p className="text-muted-foreground">
            اختر أعراضك للعثور على أطباء متخصصين في علاج مشاكلك
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
                  <CardTitle className="text-lg">الأعراض المختارة ({selectedSymptoms.length})</CardTitle>
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
              البحث عن أطباء مطابقين
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
                      {isLoadingDoctors
                        ? "جاري البحث عن الأطباء..."
                        : `تم العثور على ${matchedDoctors.length} طبيب يطابق أعراضك`}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {selectedSymptoms.slice(0, 3).map((symptom) => (
                        <Badge key={symptom} variant="secondary">
                          {symptom}
                        </Badge>
                      ))}
                      {selectedSymptoms.length > 3 && (
                        <Badge variant="secondary">+{selectedSymptoms.length - 3} المزيد</Badge>
                      )}
                    </div>
                  </div>
                  <Button variant="outline" onClick={() => setShowResults(false)} className="bg-transparent">
                    تعديل الأعراض
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Matched Doctors */}
            {isLoadingDoctors ? (
              <div className="flex min-h-[400px] items-center justify-center">
                <Spinner className="h-8 w-8" />
              </div>
            ) : matchedDoctors.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="py-8 text-center text-muted-foreground">
                    <p>لم يتم العثور على أطباء مطابقين لأعراضك</p>
                    <p className="mt-2 text-sm">جرب اختيار أعراض مختلفة</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
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
                              <Badge className="bg-accent text-accent-foreground">{doctor.matchScore}% تطابق</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {doctor.specialty} • {doctor.experience} خبرة
                            </p>
                            <div className="mt-2 flex items-center gap-4 text-sm">
                              <div className="flex items-center gap-1">
                                <Star className="h-4 w-4 fill-accent text-accent" />
                                <span className="font-medium">{doctor.rating.toFixed(1)}</span>
                                {doctor.reviews > 0 && (
                                  <span className="text-muted-foreground">({doctor.reviews} تقييم)</span>
                                )}
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
                              حجز موعد
                              <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                          </Button>
                          <Button asChild variant="outline" className="flex-1 bg-transparent">
                            <Link href={`/doctors/${doctor.id}`}>عرض الملف الشخصي</Link>
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  )
}
