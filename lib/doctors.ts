import type { Doctor, DoctorMatch, Specialty } from "@/types/assessment"

export const mockDoctors: Doctor[] = [
  {
    id: "doc-1",
    name: "Dr. Sarah Williams",
    nameAr: "د. سارة ويليامز",
    specialties: ["ADHD", "Anxiety", "Depression"],
    experience: 8,
    rating: 4.9,
    avatar: "/placeholder-user.jpg",
    bio: "أخصائية نفسية إكلينيكية متخصصة في اضطرابات نقص الانتباه والقلق",
    languages: ["العربية", "الإنجليزية"]
  },
  {
    id: "doc-2", 
    name: "Dr. Michael Chen",
    nameAr: "د. مايكل تشين",
    specialties: ["Depression", "Bipolar", "General_Psychiatry"],
    experience: 12,
    rating: 4.8,
    avatar: "/placeholder-user.jpg",
    bio: "طبيب نفسي متخصص في علاج الاكتئاب والاضطراب ثنائي القطب",
    languages: ["العربية", "الإنجليزية", "الصينية"]
  },
  {
    id: "doc-3",
    name: "Dr. Fatima Al-Rashid",
    nameAr: "د. فاطمة الراشد",
    specialties: ["Anxiety", "OCD", "PTSD"],
    experience: 6,
    rating: 4.7,
    avatar: "/placeholder-user.jpg",
    bio: "أخصائية نفسية متخصصة في اضطرابات القلق والوسواس القهري",
    languages: ["العربية", "الإنجليزية", "الفرنسية"]
  },
  {
    id: "doc-4",
    name: "Dr. Ahmed Hassan",
    nameAr: "د. أحمد حسن",
    specialties: ["Sleep_Disorders", "Addiction", "General_Psychiatry"],
    experience: 10,
    rating: 4.6,
    avatar: "/placeholder-user.jpg",
    bio: "طبيب نفسي متخصص في اضطرابات النوم وعلاج الإدمان",
    languages: ["العربية", "الإنجليزية"]
  },
  {
    id: "doc-5",
    name: "Dr. Lisa Anderson",
    nameAr: "د. ليزا أندرسون",
    specialties: ["Eating_Disorders", "Depression", "Anxiety"],
    experience: 7,
    rating: 4.9,
    avatar: "/placeholder-user.jpg",
    bio: "أخصائية نفسية متخصصة في اضطرابات الأكل والصحة النفسية",
    languages: ["العربية", "الإنجليزية", "الألمانية"]
  },
  {
    id: "doc-6",
    name: "Dr. Omar Khalil",
    nameAr: "د. عمر خليل",
    specialties: ["ADHD", "General_Psychiatry"],
    experience: 15,
    rating: 4.8,
    avatar: "/placeholder-user.jpg",
    bio: "طبيب نفسي ذو خبرة واسعة في علاج اضطرابات نقص الانتباه",
    languages: ["العربية", "الإنجليزية", "الإسبانية"]
  }
]

export function matchDoctors(requiredSpecialties: Specialty[]): DoctorMatch[] {
  if (!requiredSpecialties || requiredSpecialties.length === 0) {
    return mockDoctors.map(doctor => ({
      doctor,
      matchScore: 50 // درجة افتراضية
    }))
  }

  return mockDoctors
    .map(doctor => {
      // حساب درجة المطابقة
      const matchingSpecialties = doctor.specialties.filter(specialty => 
        requiredSpecialties.includes(specialty)
      )
      
      const matchScore = Math.round(
        (matchingSpecialties.length / requiredSpecialties.length) * 100
      )
      
      return {
        doctor,
        matchScore: Math.max(matchScore, 20) // حد أدنى 20%
      }
    })
    .sort((a, b) => b.matchScore - a.matchScore) // ترتيب تنازلي
    .slice(0, 5) // أفضل 5 أطباء
}

export function getDoctorById(id: string): Doctor | undefined {
  return mockDoctors.find(doctor => doctor.id === id)
}

export function getSpecialtyDisplayName(specialty: Specialty): string {
  const specialtyNames: Record<Specialty, string> = {
    ADHD: "اضطراب نقص الانتباه وفرط النشاط",
    Depression: "الاكتئاب",
    Anxiety: "القلق",
    Bipolar: "الاضطراب ثنائي القطب",
    OCD: "الوسواس القهري",
    PTSD: "اضطراب ما بعد الصدمة",
    Eating_Disorders: "اضطرابات الأكل",
    Sleep_Disorders: "اضطرابات النوم",
    Addiction: "الإدمان",
    General_Psychiatry: "طب نفسي عام"
  }
  
  return specialtyNames[specialty] || specialty
}
