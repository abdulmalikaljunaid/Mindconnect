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
  videoConsultationFee?: number | null
  audioConsultationFee?: number | null
  messagingConsultationFee?: number | null
  inPersonConsultationFee?: number | null
  offersVideo?: boolean | null
  offersAudio?: boolean | null
  offersMessaging?: boolean | null
  offersInPerson?: boolean | null
  languages?: string[] | null
  clinicAddress?: string | null
  specialties: string[]
  phone?: string | null
  education?: string | null
  submittedAt?: string | null
  approvedAt?: string | null
  rejectedAt?: string | null
  rejectionReason?: string | null
  // New document fields
  licenseDocumentUrl?: string | null
  certificateDocumentUrl?: string | null
  cvDocumentUrl?: string | null
  idDocumentUrl?: string | null
  approvalStatus?: string | null
  approvalNotes?: string | null
}

interface DoctorsResult {
  pending: DoctorWithProfile[]
  approved: DoctorWithProfile[]
  rejected: DoctorWithProfile[]
  isLoading: boolean
  error: string | null
  approveDoctor: (doctorId: string) => Promise<void>
  rejectDoctor: (doctorId: string, notes?: string) => Promise<void>
  refresh: () => Promise<void>
}

const selectQuery = `
  id,
  name,
  email,
  role,
  is_approved,
  created_at,
  doctor_profiles!doctor_profiles_profile_id_fkey (
    license_number,
    experience_years,
    consultation_fee,
    video_consultation_fee,
    audio_consultation_fee,
    messaging_consultation_fee,
    in_person_consultation_fee,
    offers_video,
    offers_audio,
    offers_messaging,
    offers_in_person,
    languages,
    clinic_address,
    education,
    submitted_at,
    approval_status,
    approval_notes,
    approved_at,
    license_document_url,
    certificate_document_url,
    cv_document_url,
    id_document_url,
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

  // Use approval_status from doctor_profiles, fallback to metadata or is_approved
  // Priority: approval_status > metadata.status > is_approved
  // BUT: Only use is_approved if approval_status is null/undefined AND doctor_profile exists
  let approvalStatus: string
  if (doctorProfile?.approval_status) {
    // If approval_status is explicitly set, use it
    approvalStatus = doctorProfile.approval_status
  } else if (metadata.status) {
    // Fallback to metadata status
    approvalStatus = metadata.status
  } else if (Object.keys(doctorProfile).length === 0) {
    // No doctor_profile at all, fallback to is_approved
    approvalStatus = row.is_approved ? "approved" : "pending"
  } else {
    // Doctor_profile exists but no approval_status, default to pending
    approvalStatus = "pending"
  }
  const status: DoctorStatus = approvalStatus as DoctorStatus

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
    videoConsultationFee: doctorProfile?.video_consultation_fee ?? null,
    audioConsultationFee: doctorProfile?.audio_consultation_fee ?? null,
    messagingConsultationFee: doctorProfile?.messaging_consultation_fee ?? null,
    inPersonConsultationFee: doctorProfile?.in_person_consultation_fee ?? null,
    offersVideo: doctorProfile?.offers_video ?? true,
    offersAudio: doctorProfile?.offers_audio ?? true,
    offersMessaging: doctorProfile?.offers_messaging ?? true,
    offersInPerson: doctorProfile?.offers_in_person ?? true,
    languages: doctorProfile?.languages ?? null,
    clinicAddress: doctorProfile?.clinic_address ?? null,
    specialties,
    phone: metadata.phone ?? null,
    education: doctorProfile?.education ?? metadata.education ?? null,
    submittedAt: doctorProfile?.submitted_at ?? metadata.submitted_at ?? row.created_at ?? null,
    approvedAt: doctorProfile?.approved_at ?? metadata.approved_at ?? null,
    rejectedAt: metadata.rejected_at ?? null,
    rejectionReason: metadata.rejection_reason ?? null,
    // New document fields
    licenseDocumentUrl: doctorProfile?.license_document_url ?? null,
    certificateDocumentUrl: doctorProfile?.certificate_document_url ?? null,
    cvDocumentUrl: doctorProfile?.cv_document_url ?? null,
    idDocumentUrl: doctorProfile?.id_document_url ?? null,
    approvalStatus: doctorProfile?.approval_status ?? null,
    approvalNotes: doctorProfile?.approval_notes ?? null,
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
      .insert({ 
        profile_id: profileId, 
        metadata: newMetadata,
        license_number: "" // Required field, will be updated when doctor submits profile
      })

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

    try {
      // Fetch profiles
      const { data: profilesData, error: profilesError } = await supabaseClient
        .from("profiles")
        .select("id, name, email, role, is_approved, created_at")
        .eq("role", "doctor")
        .order("created_at", { ascending: true })

      if (profilesError) throw profilesError

      // Fetch doctor_profiles
      const { data: doctorProfilesData, error: doctorProfilesError } = await supabaseClient
        .from("doctor_profiles")
        .select(`
          profile_id,
          license_number,
          experience_years,
          consultation_fee,
          languages,
          offers_video,
          offers_in_person,
          clinic_address,
          education,
          submitted_at,
          approval_status,
          approval_notes,
          approved_at,
          license_document_url,
          certificate_document_url,
          cv_document_url,
          id_document_url,
          metadata
        `)

      if (doctorProfilesError) throw doctorProfilesError

      // Merge data
      const doctors = (profilesData ?? []).map((profile: any) => {
        const doctorProfile = (doctorProfilesData ?? []).find((dp: any) => dp.profile_id === profile.id)
        return mapDoctor({ ...profile, doctor_profiles: doctorProfile })
      })
      
      setPending(doctors.filter((doctor) => doctor.status === "pending"))
      setApproved(doctors.filter((doctor) => doctor.status === "approved"))
      setRejected(doctors.filter((doctor) => doctor.status === "rejected"))
    } catch (error: any) {
      console.error('❌ Error fetching doctors:', error)
      setError(error.message)
      setPending([])
      setApproved([])
      setRejected([])
    }

    setIsLoading(false)
  }

  useEffect(() => {
    fetchDoctors()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, user?.role])

  // Realtime subscription for admin view
  useEffect(() => {
    if (!user || user.role !== "admin") return

    const channel = supabaseClient
      .channel(`admin-doctors-${Math.random().toString(36).slice(2)}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "profiles" }, () => {
        fetchDoctors()
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "doctor_profiles" }, () => {
        fetchDoctors()
      })
      .subscribe()

    const poll = setInterval(fetchDoctors, 30000)

    return () => {
      clearInterval(poll)
      supabaseClient.removeChannel(channel)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, user?.role])

  const approveDoctor = async (doctorId: string) => {
    const approvedAt = new Date().toISOString()
    const adminId = user?.id

    // Update profiles table
    const { error: updateProfileError } = await supabaseClient
      .from("profiles")
      .update({ is_approved: true })
      .eq("id", doctorId)

    if (updateProfileError) throw updateProfileError

    // Update doctor_profiles table
    const { error: updateDoctorError } = await supabaseClient
      .from("doctor_profiles")
      .update({
        approval_status: "approved",
        approved_at: approvedAt,
        approved_by: adminId,
      })
      .eq("profile_id", doctorId)

    if (updateDoctorError) throw updateDoctorError

    // Also update metadata for backward compatibility
    await upsertDoctorMetadata(doctorId, (metadata) => ({
      ...metadata,
      status: "approved",
      approved_at: approvedAt,
      rejected_at: null,
      rejection_reason: null,
    }))

    await fetchDoctors()
  }

  const rejectDoctor = async (doctorId: string, notes?: string) => {
    const rejectedAt = new Date().toISOString()
    const adminId = user?.id

    // Update profiles table
    const { error: updateProfileError } = await supabaseClient
      .from("profiles")
      .update({ is_approved: false })
      .eq("id", doctorId)

    if (updateProfileError) throw updateProfileError

    // Update doctor_profiles table
    const { error: updateDoctorError } = await supabaseClient
      .from("doctor_profiles")
      .update({
        approval_status: "rejected",
        approval_notes: notes ?? "تم رفض الطلب من قبل الإدارة",
        approved_by: adminId,
      })
      .eq("profile_id", doctorId)

    if (updateDoctorError) throw updateDoctorError

    // Also update metadata for backward compatibility
    await upsertDoctorMetadata(doctorId, (metadata) => ({
      ...metadata,
      status: "rejected",
      rejected_at: rejectedAt,
      rejection_reason: notes ?? "Rejected by admin",
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

export function useApprovedDoctors() {
  const [approved, setApproved] = useState<DoctorWithProfile[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchApprovedDoctors = async () => {
    setIsLoading(true)
    setError(null)

    try {
      // جلب profiles المعتمدة مع تحسين الاستعلام
      const { data: profilesData, error: profilesError } = await supabaseClient
        .from("profiles")
        .select(selectQuery)
        .eq("role", "doctor")
        .eq("is_approved", true)
        .limit(100) // Limit results for performance

      if (profilesError) throw profilesError

      const doctors = (profilesData ?? []).map(mapDoctor)
      // فلترة الأطباء المعتمدين فقط
      const approvedDoctors = doctors.filter((d) => d.status === "approved");
      setApproved(approvedDoctors)
    } catch (err: any) {
      console.error("Error fetching approved doctors:", err)
      setError(err.message || "فشل في تحميل الأطباء")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchApprovedDoctors()
    // Realtime subscription for profiles and doctor_profiles
    const channel = supabaseClient
      .channel(`doctors-approved-${Math.random().toString(36).slice(2)}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "profiles" }, () => {
        fetchApprovedDoctors()
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "doctor_profiles" }, () => {
        fetchApprovedDoctors()
      })
      .subscribe()

    const poll = setInterval(fetchApprovedDoctors, 30000)
    return () => {
      clearInterval(poll)
      supabaseClient.removeChannel(channel)
    }
  }, [])

  return {
    approved,
    isLoading,
    error,
    refresh: fetchApprovedDoctors,
  }
}
