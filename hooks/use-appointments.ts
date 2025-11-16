import { useEffect, useMemo, useState } from "react"
import { supabaseClient } from "@/lib/supabase-client"
import type { Tables } from "@/lib/database.types"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import type { BookingRequest, AppointmentActionPayload } from "@/types/appointments"

export type AppointmentMode = Tables<"appointments">["mode"]
export type AppointmentStatus = Tables<"appointments">["status"]

interface AppointmentListItem {
  id: string
  scheduledAt: string
  durationMinutes: number
  status: AppointmentStatus
  mode: AppointmentMode
  reason: string | null
  notes: string | null
  consultationFee: number | null
  rejectionReason: string | null
  confirmedAt: string | null
  cancelledAt: string | null
  doctorName?: string | null
  patientName?: string | null
  companionName?: string | null
}

interface UseAppointmentsResult {
  appointments: AppointmentListItem[]
  upcoming: AppointmentListItem[]
  past: AppointmentListItem[]
  pending: AppointmentListItem[]
  confirmed: AppointmentListItem[]
  completed: AppointmentListItem[]
  cancelled: AppointmentListItem[]
  isLoading: boolean
  error: string | null
  refresh: () => Promise<void>
  createAppointment: (request: BookingRequest) => Promise<string | null>
  confirmAppointment: (payload: AppointmentActionPayload) => Promise<boolean>
  rejectAppointment: (payload: AppointmentActionPayload) => Promise<boolean>
  cancelAppointment: (appointmentId: string, notes?: string) => Promise<boolean>
  getAppointmentById: (appointmentId: string) => Promise<AppointmentListItem | null>
}

const APPOINTMENT_SELECT = `
  id,
  scheduled_at,
  duration_minutes,
  status,
  mode,
  reason,
  notes,
  consultation_fee,
  rejection_reason,
  confirmed_at,
  cancelled_at,
  doctor_id,
  patient_id,
  companion_id
`

type SelectedAppointment = Pick<
  Tables<"appointments">,
  | "id"
  | "scheduled_at"
  | "duration_minutes"
  | "status"
  | "mode"
  | "reason"
  | "notes"
  | "consultation_fee"
  | "rejection_reason"
  | "confirmed_at"
  | "cancelled_at"
  | "doctor_id"
  | "patient_id"
  | "companion_id"
>

const mapAppointment = async (row: SelectedAppointment): Promise<AppointmentListItem> => {
  // Fetch related names separately to avoid embedding issues
  // Handle each fetch independently with error handling
  let doctorName: string | null = null
  let patientName: string | null = null
  let companionName: string | null = null

  // Fetch all profiles in parallel with individual error handling
  const profileFetches: Promise<void>[] = []

  if (row.doctor_id) {
    profileFetches.push(
      Promise.resolve(
        supabaseClient
          .from("profiles")
          .select("name")
          .eq("id", row.doctor_id)
          .single()
      )
        .then(({ data }) => {
          doctorName = data?.name ?? null
        })
        .catch(() => {
          // Silently fail - name will remain null
          doctorName = null
        })
    )
  }

  if (row.patient_id) {
    profileFetches.push(
      Promise.resolve(
        supabaseClient
          .from("profiles")
          .select("name")
          .eq("id", row.patient_id)
          .single()
      )
        .then(({ data }) => {
          patientName = data?.name ?? null
        })
        .catch(() => {
          // Silently fail - name will remain null
          patientName = null
        })
    )
  }

  if (row.companion_id) {
    profileFetches.push(
      Promise.resolve(
        supabaseClient
          .from("profiles")
          .select("name")
          .eq("id", row.companion_id)
          .single()
      )
        .then(({ data }) => {
          companionName = data?.name ?? null
        })
        .catch(() => {
          // Silently fail - name will remain null
          companionName = null
        })
    )
  }

  // Wait for all profile fetches with timeout (5 seconds max)
  if (profileFetches.length > 0) {
    await Promise.race([
      Promise.allSettled(profileFetches),
      new Promise((resolve) => setTimeout(resolve, 5000)),
    ])
  }

  return {
    id: row.id,
    scheduledAt: row.scheduled_at,
    durationMinutes: row.duration_minutes,
    status: row.status,
    mode: row.mode,
    reason: row.reason ?? null,
    notes: row.notes ?? null,
    consultationFee: row.consultation_fee ?? null,
    rejectionReason: row.rejection_reason ?? null,
    confirmedAt: row.confirmed_at ?? null,
    cancelledAt: row.cancelled_at ?? null,
    doctorName,
    patientName,
    companionName,
  }
}

const splitAppointments = (appointments: AppointmentListItem[]) => {
  const now = new Date()
  const upcoming: AppointmentListItem[] = []
  const past: AppointmentListItem[] = []

  appointments.forEach((appointment) => {
    const scheduled = new Date(appointment.scheduledAt)
    if (scheduled >= now) {
      upcoming.push(appointment)
    } else {
      past.push(appointment)
    }
  })

  upcoming.sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())
  past.sort((a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime())

  return { upcoming, past }
}

function useAppointments(
  filter: (query: ReturnType<typeof supabaseClient.from>) => ReturnType<typeof supabaseClient.from>,
  shouldFetch: boolean = true
): UseAppointmentsResult {
  const [appointments, setAppointments] = useState<AppointmentListItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const fetchAppointments = async () => {
    // Don't fetch if shouldFetch is false
    if (!shouldFetch) {
      setIsLoading(false)
      setAppointments([])
      return
    }
    setIsLoading(true)
    setError(null)

    try {
      const query = supabaseClient.from("appointments").select(APPOINTMENT_SELECT).order("scheduled_at", { ascending: true })

      const { data, error } = await filter(query)

      if (error) {
        console.error("Error fetching appointments:", error)
        setError(error.message)
        setAppointments([])
        setIsLoading(false)
        return
      }

      if (!data || data.length === 0) {
        setAppointments([])
        setIsLoading(false)
        return
      }

      // Map appointments with async function and timeout protection
      const mappingPromises = (data ?? []).map(async (appointment: SelectedAppointment) => {
        try {
          return await Promise.race([
            mapAppointment(appointment),
            new Promise<AppointmentListItem>((_, reject) =>
              setTimeout(() => reject(new Error("Mapping timeout")), 10000)
            ),
          ])
        } catch (err: any) {
          console.error("Error mapping appointment:", appointment.id, err)
          // Return a basic appointment structure even if mapping fails
          return {
            id: appointment.id,
            scheduledAt: appointment.scheduled_at,
            durationMinutes: appointment.duration_minutes,
            status: appointment.status,
            mode: appointment.mode,
            reason: appointment.reason ?? null,
            notes: appointment.notes ?? null,
            consultationFee: appointment.consultation_fee ?? null,
            rejectionReason: appointment.rejection_reason ?? null,
            confirmedAt: appointment.confirmed_at ?? null,
            cancelledAt: appointment.cancelled_at ?? null,
            doctorName: null,
            patientName: null,
            companionName: null,
          }
        }
      })

      const mappedAppointments = await Promise.all(mappingPromises)
      setAppointments(mappedAppointments)
    } catch (err: any) {
      console.error("Unexpected error in fetchAppointments:", err)
      setError(err.message || "حدث خطأ غير متوقع")
      setAppointments([])
    } finally {
      setIsLoading(false)
    }
  }

  // إنشاء موعد جديد
  const createAppointment = async (request: BookingRequest): Promise<string | null> => {
    try {
      const { data, error } = await supabaseClient.from("appointments").insert({
        patient_id: request.patientId,
        doctor_id: request.doctorId,
        companion_id: request.companionId,
        scheduled_at: request.scheduledAt,
        duration_minutes: request.duration,
        mode: request.mode,
        reason: request.reason,
        notes: request.notes,
        consultation_fee: request.consultationFee,
        created_by: request.patientId,
        status: "pending",
      }).select("id").single()

      if (error) throw error

      toast({
        title: "تم بنجاح",
        description: "تم إرسال طلب الحجز بنجاح. في انتظار موافقة الدكتور.",
      })
      await fetchAppointments()
      return data?.id || null
    } catch (error: any) {
      console.error("Error creating appointment:", error)
      toast({
        title: "خطأ",
        description: error.message || "فشل في إنشاء الموعد",
        variant: "destructive",
      })
      return null
    }
  }

  // تأكيد موعد من قبل الدكتور
  const confirmAppointment = async (payload: AppointmentActionPayload): Promise<boolean> => {
    try {
      const { error } = await supabaseClient
        .from("appointments")
        .update({
          status: "confirmed",
          confirmed_at: new Date().toISOString(),
          notes: payload.notes,
        })
        .eq("id", payload.appointmentId)

      if (error) throw error

      toast({
        title: "تم بنجاح",
        description: "تم تأكيد الموعد بنجاح",
      })
      await fetchAppointments()
      return true
    } catch (error: any) {
      console.error("Error confirming appointment:", error)
      toast({
        title: "خطأ",
        description: error.message || "فشل في تأكيد الموعد",
        variant: "destructive",
      })
      return false
    }
  }

  // رفض موعد من قبل الدكتور
  const rejectAppointment = async (payload: AppointmentActionPayload): Promise<boolean> => {
    try {
      const { error } = await supabaseClient
        .from("appointments")
        .update({
          status: "cancelled",
          rejection_reason: payload.rejectionReason,
          cancelled_at: new Date().toISOString(),
        })
        .eq("id", payload.appointmentId)

      if (error) throw error

      toast({
        title: "تم",
        description: "تم رفض طلب الموعد",
      })
      await fetchAppointments()
      return true
    } catch (error: any) {
      console.error("Error rejecting appointment:", error)
      toast({
        title: "خطأ",
        description: error.message || "فشل في رفض الموعد",
        variant: "destructive",
      })
      return false
    }
  }

  // إلغاء موعد من قبل المريض
  const cancelAppointment = async (appointmentId: string, notes?: string): Promise<boolean> => {
    try {
      const { error } = await supabaseClient
        .from("appointments")
        .update({
          status: "cancelled",
          cancelled_at: new Date().toISOString(),
          notes: notes,
        })
        .eq("id", appointmentId)

      if (error) throw error

      toast({
        title: "تم",
        description: "تم إلغاء الموعد بنجاح",
      })
      await fetchAppointments()
      return true
    } catch (error: any) {
      console.error("Error cancelling appointment:", error)
      toast({
        title: "خطأ",
        description: error.message || "فشل في إلغاء الموعد",
        variant: "destructive",
      })
      return false
    }
  }

  // جلب موعد واحد بالـ ID
  const getAppointmentById = async (appointmentId: string): Promise<AppointmentListItem | null> => {
    try {
      const { data, error } = await supabaseClient
        .from("appointments")
        .select(APPOINTMENT_SELECT)
        .eq("id", appointmentId)
        .single()

      if (error) throw error
      return data ? await mapAppointment(data) : null
    } catch (error: any) {
      console.error("Error fetching appointment:", error)
      return null
    }
  }

  useEffect(() => {
    // Only fetch if shouldFetch is true
    if (shouldFetch) {
      fetchAppointments()
    } else {
      setIsLoading(false)
      setAppointments([])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shouldFetch]) // Re-fetch if shouldFetch changes

  const { upcoming, past } = useMemo(() => splitAppointments(appointments), [appointments])
  
  // تصنيف المواعيد حسب الحالة
  const pending = useMemo(() => appointments.filter(apt => apt.status === "pending"), [appointments])
  const confirmed = useMemo(() => appointments.filter(apt => apt.status === "confirmed"), [appointments])
  const completed = useMemo(() => appointments.filter(apt => apt.status === "completed"), [appointments])
  const cancelled = useMemo(() => appointments.filter(apt => apt.status === "cancelled"), [appointments])

  return {
    appointments,
    upcoming,
    past,
    pending,
    confirmed,
    completed,
    cancelled,
    isLoading,
    error,
    refresh: fetchAppointments,
    createAppointment,
    confirmAppointment,
    rejectAppointment,
    cancelAppointment,
    getAppointmentById,
  }
}

export function usePatientAppointments(): UseAppointmentsResult {
  const { user, isLoading: authLoading } = useAuth()
  const shouldFetch = !authLoading && !!user

  return useAppointments(
    (query) => {
      if (!user) {
        // Return empty results by using an impossible condition
        return query.eq("id", "00000000-0000-0000-0000-000000000000")
      }
      return query.eq("patient_id", user.id)
    },
    shouldFetch
  )
}

export function useDoctorAppointments(): UseAppointmentsResult {
  const { user, isLoading: authLoading } = useAuth()
  const shouldFetch = !authLoading && !!user

  return useAppointments(
    (query) => {
      if (!user) {
        // Return empty results by using an impossible condition
        return query.eq("id", "00000000-0000-0000-0000-000000000000")
      }
      return query.eq("doctor_id", user.id)
    },
    shouldFetch
  )
}

export function useCompanionAppointments(): UseAppointmentsResult {
  const { user, isLoading: authLoading } = useAuth()
  const shouldFetch = !authLoading && !!user

  return useAppointments(
    (query) => {
      if (!user) {
        // Return empty results by using an impossible condition
        return query.eq("id", "00000000-0000-0000-0000-000000000000")
      }
      return query.eq("companion_id", user.id)
    },
    shouldFetch
  )
}
