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
  createAppointment: (request: BookingRequest) => Promise<boolean>
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
  companion_id,
  doctor:profiles!appointments_doctor_id_fkey(name),
  patient:profiles!appointments_patient_id_fkey(name),
  companion:profiles!appointments_companion_id_fkey(name)
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

const mapAppointment = (row: any): AppointmentListItem => {
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
    doctorName: row.doctor?.name ?? null,
    patientName: row.patient?.name ?? null,
    companionName: row.companion?.name ?? null,
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

function useAppointments(filter: (query: ReturnType<typeof supabaseClient.from>) => ReturnType<typeof supabaseClient.from>): UseAppointmentsResult {
  const [appointments, setAppointments] = useState<AppointmentListItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const fetchAppointments = async () => {
    setIsLoading(true)
    setError(null)

    const query = supabaseClient.from("appointments").select(APPOINTMENT_SELECT).order("scheduled_at", { ascending: true })

    const { data, error } = await filter(query)

    if (error) {
      setError(error.message)
      setAppointments([])
    } else {
      const mappedAppointments = (data ?? []).map(mapAppointment)
      setAppointments(mappedAppointments)
    }

    setIsLoading(false)
  }

  // إنشاء موعد جديد
  const createAppointment = async (request: BookingRequest): Promise<boolean> => {
    try {
      const { error } = await supabaseClient.from("appointments").insert({
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
      })

      if (error) throw error

      toast({
        title: "تم بنجاح",
        description: "تم إرسال طلب الحجز بنجاح. في انتظار موافقة الدكتور.",
      })
      await fetchAppointments()
      return true
    } catch (error: any) {
      console.error("Error creating appointment:", error)
      toast({
        title: "خطأ",
        description: error.message || "فشل في إنشاء الموعد",
        variant: "destructive",
      })
      return false
    }
  }

  // تأكيد موعد من قبل الدكتور
  const confirmAppointment = async (payload: AppointmentActionPayload): Promise<boolean> => {
    try {
      // Optimistic update
      setAppointments((prev) => prev.map((apt) => apt.id === payload.appointmentId ? { ...apt, status: "confirmed", confirmedAt: new Date().toISOString(), notes: payload.notes ?? apt.notes } : apt))
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
      // Revert optimistic change on error
      await fetchAppointments()
      return false
    }
  }

  // رفض موعد من قبل الدكتور
  const rejectAppointment = async (payload: AppointmentActionPayload): Promise<boolean> => {
    try {
      // Optimistic update
      setAppointments((prev) => prev.map((apt) => apt.id === payload.appointmentId ? { ...apt, status: "cancelled", rejectionReason: payload.rejectionReason ?? apt.rejectionReason, cancelledAt: new Date().toISOString() } : apt))
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
      await fetchAppointments()
      return false
    }
  }

  // إلغاء موعد من قبل المريض
  const cancelAppointment = async (appointmentId: string, notes?: string): Promise<boolean> => {
    try {
      // Optimistic update
      setAppointments((prev) => prev.map((apt) => apt.id === appointmentId ? { ...apt, status: "cancelled", cancelledAt: new Date().toISOString(), notes: notes ?? apt.notes } : apt))
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
      await fetchAppointments()
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
    let active = true
    fetchAppointments()

    // Realtime subscription
    const channel = supabaseClient
      .channel(`appointments-${Math.random().toString(36).slice(2)}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "appointments" }, (payload) => {
        const row: any = (payload as any).new ?? (payload as any).old
        if (!row) return
        // Lightweight client-side visibility filter: refetch if current list may include this row
        if ([row.patient_id, row.doctor_id, row.companion_id].some(Boolean)) {
          if (active) fetchAppointments()
        }
      })
      .subscribe()

    // Polling fallback (every 30s)
    const poll = setInterval(() => {
      if (active) fetchAppointments()
    }, 30000)

    return () => {
      active = false
      clearInterval(poll)
      supabaseClient.removeChannel(channel)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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
  const { user } = useAuth()

  return useAppointments((query) => {
    if (!user) {
      // Return empty results by using an impossible condition
      return query.limit(0)
    }
    return query.eq("patient_id", user.id)
  })
}

export function useDoctorAppointments(): UseAppointmentsResult {
  const { user } = useAuth()

  return useAppointments((query) => {
    if (!user) {
      // Return empty results by using an impossible condition
      return query.limit(0)
    }
    return query.eq("doctor_id", user.id)
  })
}

export function useCompanionAppointments(): UseAppointmentsResult {
  const { user } = useAuth()

  return useAppointments((query) => {
    if (!user) {
      // Return empty results by using an impossible condition
      return query.limit(0)
    }
    return query.eq("companion_id", user.id)
  })
}
