import { getSupabaseAdminClient } from "@/lib/supabase-admin"
import type { Tables } from "@/lib/database.types"
import type { Doctor, DoctorMatch, Specialty } from "@/types/assessment"
import { cache, CacheKeys } from "@/lib/cache"

// تم إزالة البيانات الوهمية - يجب جلب البيانات الحقيقية من قاعدة البيانات فقط
// FALLBACK_DOCTORS removed - must fetch real data from database only

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
    // Check cache first
    const cacheKey = CacheKeys.doctors(requiredSpecialties);
    const cached = cache.get<DoctorMatch[]>(cacheKey);
    if (cached) {
      return cached;
    }

    const supabaseAdmin = getSupabaseAdminClient()

    const { data, error } = await supabaseAdmin
      .from("doctor_profiles")
      .select(
        `
        profile_id,
        experience_years,
        languages,
        metadata,
        profile:profiles!doctor_profiles_profile_id_fkey (id, name, avatar_url, bio, is_approved),
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

    const doctors = (data as SelectedDoctorProfileRow[])
      .map(buildDoctor)
      .filter((doc): doc is Doctor => Boolean(doc))

    if (doctors.length === 0) {
      throw new Error("No approved doctors found")
    }

    const result = rankDoctors(doctors, requiredSpecialties);
    
    // Cache the result for 5 minutes
    cache.set(cacheKey, result, 5 * 60 * 1000);
    
    return result;
  } catch (err) {
    console.error("Failed to fetch doctors from database:", err)
    // لا نستخدم بيانات وهمية - نعيد قائمة فارغة بدلاً من ذلك
    // Don't use fake data - return empty list instead
    return []
  }
}

export async function getDoctorById(id: string): Promise<Doctor | null> {
  try {
    // Check cache first
    const cacheKey = CacheKeys.doctorById(id);
    const cached = cache.get<Doctor>(cacheKey);
    if (cached) {
      return cached;
    }

    const supabaseAdmin = getSupabaseAdminClient()
    const { data, error } = await supabaseAdmin
      .from("doctor_profiles")
      .select(
        `
        profile_id,
        experience_years,
        languages,
        metadata,
        profile:profiles!doctor_profiles_profile_id_fkey (id, name, avatar_url, bio, is_approved),
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

    const result = buildDoctor(data as SelectedDoctorProfileRow);
    
    // Cache the result for 10 minutes
    if (result) {
      cache.set(cacheKey, result, 10 * 60 * 1000);
    }
    
    return result;
  } catch (error) {
    console.error("Failed to fetch doctor by id", error)
    // لا نستخدم بيانات وهمية - نعيد null بدلاً من ذلك
    // Don't use fake data - return null instead
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
