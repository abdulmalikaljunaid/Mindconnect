import { getSupabaseAdminClient } from "@/lib/supabase-admin"
import type { Tables } from "@/lib/database.types"
import type { Doctor, DoctorMatch, Specialty } from "@/types/assessment"

const SPECIALTIES: Specialty[] = [
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

type DoctorProfileRow = Tables<"doctor_profiles"> & {
  profile: {
    id: string
    name: string
    avatar_url: string | null
    bio: string | null
    is_approved: boolean | null
    role?: string | null
  } | null
  doctor_specialties: Array<{
    specialties: {
      id: string
      name: string
      slug: string
    } | null
  }> | null
}

const specialtyDisplayMap: Record<Specialty, string> = {
  ADHD: "ADHD",
  Depression: "Depression",
  Anxiety: "Anxiety",
  Bipolar: "Bipolar",
  OCD: "OCD",
  PTSD: "PTSD",
  Eating_Disorders: "Eating_Disorders",
  Sleep_Disorders: "Sleep_Disorders",
  Addiction: "Addiction",
  General_Psychiatry: "General_Psychiatry",
}

function normalizeSpecialty(value: string | null): Specialty | null {
  if (!value) return null

  const normalized = value.replace(/[-\s]/g, "_").toLowerCase()
  return SPECIALTIES.find((spec) => spec.toLowerCase() === normalized) ?? null
}

function buildDoctor(row: DoctorProfileRow): Doctor | null {
  if (!row.profile || row.profile.role !== "doctor" || !row.profile.is_approved) {
    return null
  }

  const metadata = (row.metadata ?? {}) as Record<string, any>

  const specialties = row.doctor_specialties
    ?.map((entry) => normalizeSpecialty(entry.specialties?.slug ?? entry.specialties?.name ?? null))
    .filter((spec): spec is Specialty => Boolean(spec)) ?? []

  return {
    id: row.profile_id,
    name: row.profile.name,
    nameAr: metadata.nameAr ?? row.profile.name,
    specialties: specialties.length > 0 ? specialties : ["General_Psychiatry"],
    experience: row.experience_years ?? metadata.experience ?? 0,
    rating: metadata.rating ?? 0,
    avatar: row.profile.avatar_url ?? metadata.avatar ?? "/placeholder-user.jpg",
    bio: row.profile.bio ?? metadata.bio ?? "",
    languages: Array.isArray(row.languages)
      ? row.languages
      : Array.isArray(metadata.languages)
        ? metadata.languages
        : ["العربية", "الإنجليزية"],
  }
}

function computeMatchScore(required: Specialty[], doctor: Doctor): number {
  if (required.length === 0) {
    return 60
  }

  const matched = required.filter((spec) => doctor.specialties.includes(spec))

  if (matched.length === 0) {
    return 15
  }

  const coverage = (matched.length / required.length) * 70
  const depth = (matched.length / doctor.specialties.length) * 30

  return Math.max(20, Math.round(Math.min(coverage + depth, 100)))
}

export async function findBestMatchingDoctors(requiredSpecialties: Specialty[]): Promise<DoctorMatch[]> {
  const supabase = getSupabaseAdminClient()

  const { data, error } = await supabase
    .from("doctor_profiles")
    .select(
      `
      profile_id,
      experience_years,
      languages,
      metadata,
      profile:profiles (id, name, avatar_url, bio, is_approved, role),
      doctor_specialties (
        specialties (id, name, slug)
      )
    `,
    )

  if (error) {
    console.error("Failed to load doctors from Supabase", error)
    return []
  }

  const doctors = (data as DoctorProfileRow[])
    .map(buildDoctor)
    .filter((doctor): doctor is Doctor => Boolean(doctor))

  if (doctors.length === 0) {
    return []
  }

  return doctors
    .map((doctor) => ({
      doctor,
      matchScore: computeMatchScore(requiredSpecialties, doctor),
    }))
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 5)
}

export async function fetchDoctorById(id: string): Promise<Doctor | null> {
  const supabase = getSupabaseAdminClient()

  const { data, error } = await supabase
    .from("doctor_profiles")
    .select(
      `
      profile_id,
      experience_years,
      languages,
      metadata,
      profile:profiles (id, name, avatar_url, bio, is_approved, role),
      doctor_specialties (
        specialties (id, name, slug)
      )
    `,
    )
    .eq("profile_id", id)
    .maybeSingle()

  if (error || !data) {
    console.error("Failed to fetch doctor", error)
    return null
  }

  return buildDoctor(data as DoctorProfileRow)
}

export async function fetchApprovedDoctors(): Promise<Doctor[]> {
  const supabase = getSupabaseAdminClient()

  const { data, error } = await supabase
    .from("doctor_profiles")
    .select(
      `
      profile_id,
      experience_years,
      languages,
      metadata,
      profile:profiles (id, name, avatar_url, bio, is_approved, role),
      doctor_specialties (
        specialties (id, name, slug)
      )
    `,
    )

  if (error) {
    console.error("Failed to fetch approved doctors", error)
    return []
  }

  return (data as DoctorProfileRow[])
    .map(buildDoctor)
    .filter((doctor): doctor is Doctor => Boolean(doctor))
}

export function getSpecialtyDisplayValue(specialty: Specialty): string {
  return specialtyDisplayMap[specialty] ?? specialty
}




