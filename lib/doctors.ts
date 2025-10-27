import { getSupabaseAdminClient } from "@/lib/supabase-admin"
import type { Tables } from "@/lib/database.types"
import type { Doctor, DoctorMatch, Specialty } from "@/types/assessment"

const FALLBACK_DOCTORS: Doctor[] = [
  {
    id: "doc-1",
    name: "Dr. Sarah Williams",
    nameAr: "د. سارة ويليامز",
    specialties: ["ADHD", "Anxiety", "Depression"],
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
    specialties: ["Depression", "Bipolar", "General_Psychiatry"],
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
    specialties: ["Anxiety", "OCD", "PTSD"],
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
    specialties: ["Sleep_Disorders", "Addiction", "General_Psychiatry"],
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
    specialties: ["Eating_Disorders", "Depression", "Anxiety"],
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
    specialties: ["ADHD", "General_Psychiatry"],
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
  const normalized = slug.replace(/[-\s]/g, "_")
  const specialties: Specialty[] = [
    "ADHD",
    "Depression",
    "Anxiety",
    "Bipolar",
    "OCD",
    "PTSD",
    "Eating_Disorders",
    "Sleep_Disorders",
    "Addiction",
    "General_Psychiatry",
  ]

  return specialties.find((spec) => spec.toLowerCase() === normalized.toLowerCase()) ?? null
}

function buildDoctor(row: DoctorProfileRow): Doctor | null {
  if (!row.profile) return null

  const specialties = row.doctor_specialties
    ?.map((entry) => normalizeSpecialty(entry.specialties?.slug ?? entry.specialties?.name ?? null))
    .filter((spec): spec is Specialty => Boolean(spec)) ?? []

  return {
    id: row.profile_id,
    name: row.profile.name,
    nameAr: row.metadata?.nameAr ?? row.profile.name,
    specialties,
    experience: row.experience_years ?? 0,
    rating: row.metadata?.rating ?? 0,
    avatar: row.profile.avatar_url ?? row.metadata?.avatar ?? "/placeholder-user.jpg",
    bio: row.profile.bio ?? row.metadata?.bio ?? "",
    languages: Array.isArray(row.languages) ? row.languages : row.metadata?.languages ?? ["العربية", "الإنجليزية"],
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
  const specializationWeight = (totalMatches / doctorSpecialties.length) * 30

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
        profile:profiles (id, name, avatar_url, bio, is_approved),
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

    const doctors = (data as DoctorProfileRow[])
      .map(buildDoctor)
      .filter((doc): doc is Doctor => Boolean(doc))

    if (doctors.length === 0) {
      throw new Error("No approved doctors found")
    }

    return rankDoctors(doctors, requiredSpecialties)
  } catch (err) {
    console.warn("Falling back to default doctor list", err)
    return rankDoctors(FALLBACK_DOCTORS, requiredSpecialties)
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
        profile:profiles (id, name, avatar_url, bio, is_approved),
        doctor_specialties (
          specialties (id, name, slug)
        )
      `,
      )
      .eq("profile_id", id)
      .maybeSingle()

    if (error || !data) {
      throw error ?? new Error("Doctor not found")
    }

    return buildDoctor(data as DoctorProfileRow)
  } catch (error) {
    const fallback = FALLBACK_DOCTORS.find((doctor) => doctor.id === id)
    if (!fallback) {
      console.error("Failed to fetch doctor by id", error)
      return null
    }
    return fallback
  }
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
