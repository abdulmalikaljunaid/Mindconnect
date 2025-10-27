import { useEffect, useMemo, useState } from "react"
import { supabaseClient } from "@/lib/supabase-client"
import type { Tables } from "@/lib/database.types"
import { useAuth } from "@/contexts/auth-context"

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
  doctorName?: string | null
  patientName?: string | null
  companionName?: string | null
}

interface UseAppointmentsResult {
  appointments: AppointmentListItem[]
  upcoming: AppointmentListItem[]
  past: AppointmentListItem[]
  isLoading: boolean
  error: string | null
  refresh: () => Promise<void>
}

const APPOINTMENT_SELECT = `
  id,
  scheduled_at,
  duration_minutes,
  status,
  mode,
  reason,
  notes,
  doctor:doctor_profiles(
    profile:profiles(name)
  ),
  patient:profiles!appointments_patient_id_fkey(name),
  companion:profiles!appointments_companion_id_fkey(name)
`

type RawAppointment = Tables<"appointments"> & {
  doctor?: {
    profile?: {
      name: string | null
    } | null
  } | null
  patient?: {
    name: string | null
  } | null
  companion?: {
    name: string | null
  } | null
}

const mapAppointment = (row: RawAppointment): AppointmentListItem => ({
  id: row.id,
  scheduledAt: row.scheduled_at,
  durationMinutes: row.duration_minutes,
  status: row.status,
  mode: row.mode,
  reason: row.reason ?? null,
  notes: row.notes ?? null,
  doctorName: row.doctor?.profile?.name ?? null,
  patientName: row.patient?.name ?? null,
  companionName: row.companion?.name ?? null,
})

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

  const fetchAppointments = async () => {
    setIsLoading(true)
    setError(null)

    const query = supabaseClient.from("appointments").select(APPOINTMENT_SELECT).order("scheduled_at", { ascending: true })

    const { data, error } = await filter(query)

    if (error) {
      setError(error.message)
      setAppointments([])
  } else {
    setAppointments((data ?? []).map(mapAppointment))
  }

    setIsLoading(false)
  }

  useEffect(() => {
    fetchAppointments()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const { upcoming, past } = useMemo(() => splitAppointments(appointments), [appointments])

  return {
    appointments,
    upcoming,
    past,
    isLoading,
    error,
    refresh: fetchAppointments,
  }
}

export function usePatientAppointments(): UseAppointmentsResult {
  const { user } = useAuth()

  return useAppointments((query) => {
    if (!user) {
      return query.eq("patient_id", "__none__")
    }
    return query.eq("patient_id", user.id)
  })
}

export function useDoctorAppointments(): UseAppointmentsResult {
  const { user } = useAuth()

  return useAppointments((query) => {
    if (!user) {
      return query.eq("doctor_id", "__none__")
    }
    return query.eq("doctor_id", user.id)
  })
}

export function useCompanionAppointments(): UseAppointmentsResult {
  const { user } = useAuth()

  return useAppointments((query) => {
    if (!user) {
      return query.eq("companion_id", "__none__")
    }
    return query.eq("companion_id", user.id)
  })
}
