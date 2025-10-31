import { getSupabaseAdminClient } from "@/lib/supabase-admin"
import type { Tables } from "@/lib/database.types"
import type { Doctor, DoctorMatch, Specialty } from "@/types/assessment"

const FALLBACK_DOCTORS: Doctor[] = [
  {
    id: "doc-1",
    name: "Dr. Sarah Williams",
    nameAr: "د. سارة ويليامز",
    specialties: ["depression-anxiety", "cognitive-behavioral"],
    experience: 8,
    rating: 4.9,
    avatar: "/placeholder-user.jpg",
    bio: "أخصائية نفسية إكلينيكية متخصصة في اضطرابات نقص الانتباه والقلق",
    languages: ["العربية", "الإنجليزية"],
  },
  {
    id: "doc-2",
    name: "Dr. Michael Chen",
    nameAr: "د. مايكل تشين",
    specialties: ["depression-anxiety", "psychotic-disorders", "general-psychiatry"],
    experience: 12,
    rating: 4.8,
    avatar: "/placeholder-user.jpg",
    bio: "طبيب نفسي متخصص في علاج الاكتئاب والاضطراب ثنائي القطب",
    languages: ["العربية", "الإنجليزية", "الصينية"],
  },
  {
    id: "doc-3",
    name: "Dr. Fatima Al-Rashid",
    nameAr: "د. فاطمة الراشد",
    specialties: ["depression-anxiety", "trauma-ptsd"],
    experience: 6,
    rating: 4.7,
    avatar: "/placeholder-user.jpg",
    bio: "أخصائية نفسية متخصصة في اضطرابات القلق والوسواس القهري",
    languages: ["العربية", "الإنجليزية", "الفرنسية"],
  },
  {
    id: "doc-4",
    name: "Dr. Ahmed Hassan",
    nameAr: "د. أحمد حسن",
    specialties: ["sleep-disorders", "addiction-treatment", "general-psychiatry"],
    experience: 10,
    rating: 4.6,
    avatar: "/placeholder-user.jpg",
    bio: "طبيب نفسي متخصص في اضطرابات النوم وعلاج الإدمان",
    languages: ["العربية", "الإنجليزية"],
  },
  {
    id: "doc-5",
    name: "Dr. Lisa Anderson",
    nameAr: "د. ليزا أندرسون",
    specialties: ["eating-disorders", "depression-anxiety"],
    experience: 7,
    rating: 4.9,
    avatar: "/placeholder-user.jpg",
    bio: "أخصائية نفسية متخصصة في اضطرابات الأكل والصحة النفسية",
    languages: ["العربية", "الإنجليزية", "الألمانية"],
  },
  {
    id: "doc-6",
    name: "Dr. Omar Khalil",
    nameAr: "د. عمر خليل",
    specialties: ["child-adolescent", "general-psychiatry"],
    experience: 15,
    rating: 4.8,
    avatar: "/placeholder-user.jpg",
    bio: "طبيب نفسي ذو خبرة واسعة في علاج اضطرابات نقص الانتباه",
    languages: ["العربية", "الإنجليزية", "الإسبانية"],
  },
]

interface DoctorProfileRow extends Tables<"doctor_profiles"> {
  profile: {
    id: string
    name: string
    avatar_url: string | null
    bio: string | null
    is_approved: boolean | null
  } | null
  doctor_specialties: Array<{
    specialties: {
      id: string
      name: string
      slug: string
    } | null
  }>
}

// Type for selected columns only (matches the query in findBestMatchingDoctors)
type SelectedDoctorProfileRow = {
  profile_id: string
  experience_years: number | null
  languages: string[] | null
  metadata: Tables<"doctor_profiles">["metadata"]
  profile: {
    id: string
    name: string
    avatar_url: string | null
    bio: string | null
    is_approved: boolean | null
  } | null
  doctor_specialties: Array<{
    specialties: {
      id: string
      name: string
      slug: string
    } | null
  }>
}

function normalizeSpecialty(slug: string | null): Specialty | null {
  if (!slug) return null
  
  // تنظيف الـ slug وتوحيد الصيغة
  const normalized = slug.toLowerCase().trim().replace(/\s+/g, "-")
  
  const specialties: Specialty[] = [
    "general-psychiatry",
    "depression-anxiety",
    "child-adolescent",
    "addiction-treatment",
    "eating-disorders",
    "psychotic-disorders",
    "family-couples-therapy",
    "sleep-disorders",
    "trauma-ptsd",
    "cognitive-behavioral",
  ]

  // محاولة التطابق المباشر
  if (specialties.includes(normalized as Specialty)) {
    return normalized as Specialty
  }

  // محاولة التطابق الجزئي للتوافق مع الأنماط القديمة
  const legacyMappings: Record<string, Specialty> = {
    "adhd": "child-adolescent",
    "depression": "depression-anxiety",
    "anxiety": "depression-anxiety",
    "bipolar": "psychotic-disorders",
    "ocd": "depression-anxiety",
    "ptsd": "trauma-ptsd",
    "eating_disorders": "eating-disorders",
    "eating-disorders": "eating-disorders",
    "sleep_disorders": "sleep-disorders",
    "sleep-disorders": "sleep-disorders",
    "addiction": "addiction-treatment",
    "general_psychiatry": "general-psychiatry",
    "general-psychiatry": "general-psychiatry",
  }

  return legacyMappings[normalized] || null
}

function buildDoctor(row: DoctorProfileRow | SelectedDoctorProfileRow): Doctor | null {
  if (!row.profile) return null

  const specialties = row.doctor_specialties
    ?.map((entry) => normalizeSpecialty(entry.specialties?.slug ?? entry.specialties?.name ?? null))
    .filter((spec): spec is Specialty => Boolean(spec)) ?? []

  const metadata = row.metadata as Record<string, any> | null

  return {
    id: row.profile_id,
    name: row.profile.name,
    nameAr: (metadata?.nameAr as string | undefined) ?? row.profile.name,
    specialties,
    experience: row.experience_years ?? 0,
    rating: (metadata?.rating as number | undefined) ?? 0,
    avatar: row.profile.avatar_url ?? (metadata?.avatar as string | undefined) ?? "/placeholder-user.jpg",
    bio: row.profile.bio ?? (metadata?.bio as string | undefined) ?? "",
    languages: Array.isArray(row.languages) ? row.languages : (metadata?.languages as string[] | undefined) ?? ["العربية", "الإنجليزية"],
  }
}

function computeMatchScore(required: Specialty[], doctorSpecialties: Specialty[]): number {
  if (required.length === 0) {
    return 40
  }

  const totalMatches = required.filter((spec) => doctorSpecialties.includes(spec)).length
  if (totalMatches === 0) {
    return 10
  }

  const coverageScore = (totalMatches / required.length) * 70
  const specializationWeight = doctorSpecialties.length > 0 
    ? (totalMatches / doctorSpecialties.length) * 30 
    : 0

  return Math.round(Math.min(coverageScore + specializationWeight, 100))
}

function rankDoctors(doctors: Doctor[], requiredSpecialties: Specialty[]): DoctorMatch[] {
  const matches = doctors
    .map((doctor) => ({
      doctor,
      matchScore: computeMatchScore(requiredSpecialties, doctor.specialties),
    }))
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 5)

  return matches.map((match) => ({
    ...match,
    matchScore: Math.max(match.matchScore, 20),
  }))
}

export async function findBestMatchingDoctors(requiredSpecialties: Specialty[]): Promise<DoctorMatch[]> {
  try {
    const supabaseAdmin = getSupabaseAdminClient()

    const { data, error } = await supabaseAdmin
      .from("doctor_profiles")
      .select(
        `
        profile_id,
        experience_years,
        languages,
        metadata,
        profile:profiles!doctor_profiles_profile_id_fkey!inner (id, name, avatar_url, bio, is_approved, role),
        doctor_specialties!inner (
          specialties!inner (id, name, slug)
        )
      `,
      )
      .eq("profile.is_approved", true)
      .eq("profile.role", "doctor")

    if (error) {
      console.error("Failed to load doctors from Supabase", error)
      throw error
    }

    // فلترة إضافية للتأكد من أن جميع الأطباء موافق عليهم
    const doctors = (data as SelectedDoctorProfileRow[])
      .map(buildDoctor)
      .filter((doc): doc is Doctor => Boolean(doc))
      .filter((doc) => {
        // فلترة إضافية للتأكد من الموافقة
        const profileData = data?.find((row) => row.profile_id === doc.id)?.profile
        return profileData?.is_approved === true && profileData?.role === "doctor"
      })

    if (doctors.length === 0) {
      throw new Error("No approved doctors found")
    }

    return rankDoctors(doctors, requiredSpecialties)
  } catch (err) {
    console.warn("Falling back to default doctor list", err)
    // لا نرجع الأطباء الافتراضيين - نرجع قائمة فارغة بدلاً من ذلك
    return []
  }
}

export async function getDoctorById(id: string): Promise<Doctor | null> {
  try {
    const supabaseAdmin = getSupabaseAdminClient()
    const { data, error } = await supabaseAdmin
      .from("doctor_profiles")
      .select(
        `
        profile_id,
        experience_years,
        languages,
        metadata,
        profile:profiles!doctor_profiles_profile_id_fkey!inner (id, name, avatar_url, bio, is_approved, role),
        doctor_specialties (
          specialties (id, name, slug)
        )
      `,
      )
      .eq("profile_id", id)
      .eq("profile.is_approved", true)
      .eq("profile.role", "doctor")
      .maybeSingle()

    if (error || !data) {
      throw error ?? new Error("Doctor not found")
    }

    // التحقق الإضافي من الموافقة
    if (!data.profile?.is_approved || data.profile?.role !== "doctor") {
      return null
    }

    return buildDoctor(data as SelectedDoctorProfileRow)
  } catch (error) {
    console.error("Failed to fetch doctor by id", error)
    return null
  }
}

export function getSpecialtyDisplayName(specialty: Specialty): string {
  const specialtyNames: Record<Specialty, string> = {
    "general-psychiatry": "الطب النفسي العام",
    "depression-anxiety": "علاج الاكتئاب والقلق",
    "child-adolescent": "الطب النفسي للأطفال والمراهقين",
    "addiction-treatment": "علاج الإدمان",
    "eating-disorders": "اضطرابات الأكل",
    "psychotic-disorders": "الاضطرابات الذهانية",
    "family-couples-therapy": "العلاج الأسري والزوجي",
    "sleep-disorders": "اضطرابات النوم",
    "trauma-ptsd": "الصدمات والضغط النفسي",
    "cognitive-behavioral": "علم النفس السلوكي المعرفي"
  }
  
  return specialtyNames[specialty] || specialty
}
