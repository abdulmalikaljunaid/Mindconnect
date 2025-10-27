import { useEffect, useState } from "react"
import { supabaseClient } from "@/lib/supabase-client"
import type { Tables } from "@/lib/database.types"
import { useAuth } from "@/contexts/auth-context"

export type DoctorStatus = "pending" | "approved" | "rejected"

export interface DoctorWithProfile {
  id: string
  name: string
  email: string | null
  role: Tables<"profiles">["role"]
  isApproved: boolean
  status: DoctorStatus
  licenseNumber?: string | null
  experienceYears?: number | null
  consultationFee?: number | null
  languages?: string[] | null
  offersVideo?: boolean | null
  offersInPerson?: boolean | null
  clinicAddress?: string | null
  specialties: string[]
  phone?: string | null
  education?: string | null
  submittedAt?: string | null
  approvedAt?: string | null
  rejectedAt?: string | null
  rejectionReason?: string | null
}

interface DoctorsResult {
  pending: DoctorWithProfile[]
  approved: DoctorWithProfile[]
  rejected: DoctorWithProfile[]
  isLoading: boolean
  error: string | null
  approveDoctor: (doctorId: string) => Promise<void>
  rejectDoctor: (doctorId: string) => Promise<void>
  refresh: () => Promise<void>
}

const selectQuery = `
  id,
  name,
  email,
  role,
  is_approved,
  created_at,
  doctor_profiles (
    license_number,
    experience_years,
    consultation_fee,
    languages,
    offers_video,
    offers_in_person,
    clinic_address,
    metadata,
    doctor_specialties (
      specialties ( name )
    )
  )
`

const mapDoctor = (row: any): DoctorWithProfile => {
  const doctorProfile = Array.isArray(row.doctor_profiles) ? row.doctor_profiles[0] : row.doctor_profiles ?? {}
  const metadata = (doctorProfile?.metadata ?? {}) as Record<string, any>
  const specialties: string[] =
    doctorProfile?.doctor_specialties?.map((item: any) => item?.specialties?.name).filter(Boolean) ?? []

  const status: DoctorStatus = metadata.status
    ? metadata.status
    : row.is_approved
      ? "approved"
      : "pending"

  return {
    id: row.id,
    name: row.name,
    email: row.email ?? null,
    role: row.role,
    isApproved: row.is_approved ?? false,
    status,
    licenseNumber: doctorProfile?.license_number ?? null,
    experienceYears: doctorProfile?.experience_years ?? null,
    consultationFee: doctorProfile?.consultation_fee ?? null,
    languages: doctorProfile?.languages ?? null,
    offersVideo: doctorProfile?.offers_video ?? null,
    offersInPerson: doctorProfile?.offers_in_person ?? null,
    clinicAddress: doctorProfile?.clinic_address ?? null,
    specialties,
    phone: metadata.phone ?? null,
    education: metadata.education ?? null,
    submittedAt: metadata.submitted_at ?? row.created_at ?? null,
    approvedAt: metadata.approved_at ?? null,
    rejectedAt: metadata.rejected_at ?? null,
    rejectionReason: metadata.rejection_reason ?? null,
  }
}

const upsertDoctorMetadata = async (profileId: string, updater: (metadata: Record<string, any>) => Record<string, any>) => {
  const { data: existing, error: fetchError } = await supabaseClient
    .from("doctor_profiles")
    .select("metadata")
    .eq("profile_id", profileId)
    .maybeSingle()

  if (fetchError) throw fetchError

  const currentMetadata = (existing?.metadata ?? {}) as Record<string, any>
  const newMetadata = updater({ ...currentMetadata })

  const { data: profileExists } = await supabaseClient
    .from("doctor_profiles")
    .select("profile_id")
    .eq("profile_id", profileId)
    .maybeSingle()

  if (profileExists) {
    const { error } = await supabaseClient
      .from("doctor_profiles")
      .update({ metadata: newMetadata })
      .eq("profile_id", profileId)

    if (error) throw error
  } else {
    const { error } = await supabaseClient
      .from("doctor_profiles")
      .insert({ profile_id: profileId, metadata: newMetadata })

    if (error) throw error
  }
}

export function useAdminDoctors(): DoctorsResult {
  const { user } = useAuth()
  const [pending, setPending] = useState<DoctorWithProfile[]>([])
  const [approved, setApproved] = useState<DoctorWithProfile[]>([])
  const [rejected, setRejected] = useState<DoctorWithProfile[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchDoctors = async () => {
    if (!user || user.role !== "admin") {
      setPending([])
      setApproved([])
      setRejected([])
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)

    const { data, error } = await supabaseClient
      .from("profiles")
      .select(selectQuery)
      .eq("role", "doctor")
      .order("created_at", { ascending: true })

    if (error) {
      setError(error.message)
      setPending([])
      setApproved([])
      setRejected([])
    } else {
      const doctors = (data ?? []).map(mapDoctor)
      setPending(doctors.filter((doctor) => doctor.status === "pending"))
      setApproved(doctors.filter((doctor) => doctor.status === "approved"))
      setRejected(doctors.filter((doctor) => doctor.status === "rejected"))
    }

    setIsLoading(false)
  }

  useEffect(() => {
    fetchDoctors()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, user?.role])

  const approveDoctor = async (doctorId: string) => {
    const approvedAt = new Date().toISOString()

    const { error: updateProfileError } = await supabaseClient
      .from("profiles")
      .update({ is_approved: true })
      .eq("id", doctorId)

    if (updateProfileError) throw updateProfileError

    await upsertDoctorMetadata(doctorId, (metadata) => ({
      ...metadata,
      status: "approved",
      approved_at: approvedAt,
      rejected_at: null,
      rejection_reason: null,
    }))

    await fetchDoctors()
  }

  const rejectDoctor = async (doctorId: string) => {
    const rejectedAt = new Date().toISOString()

    const { error: updateProfileError } = await supabaseClient
      .from("profiles")
      .update({ is_approved: false })
      .eq("id", doctorId)

    if (updateProfileError) throw updateProfileError

    await upsertDoctorMetadata(doctorId, (metadata) => ({
      ...metadata,
      status: "rejected",
      rejected_at: rejectedAt,
      rejection_reason: metadata.rejection_reason ?? "Rejected by admin",
    }))

    await fetchDoctors()
  }

  return {
    pending,
    approved,
    rejected,
    isLoading,
    error,
    approveDoctor,
    rejectDoctor,
    refresh: fetchDoctors,
  }
}
