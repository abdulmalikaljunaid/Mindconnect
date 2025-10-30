import { Database } from "@/lib/database.types";

// استخراج الأنواع من قاعدة البيانات
export type AppointmentMode = Database["public"]["Enums"]["appointment_mode_type"];
export type AppointmentStatus = Database["public"]["Enums"]["appointment_status_type"];

export type Appointment = Database["public"]["Tables"]["appointments"]["Row"];
export type AppointmentInsert = Database["public"]["Tables"]["appointments"]["Insert"];
export type AppointmentUpdate = Database["public"]["Tables"]["appointments"]["Update"];

export type DoctorAvailability = Database["public"]["Tables"]["doctor_availability"]["Row"];
export type DoctorAvailabilityInsert = Database["public"]["Tables"]["doctor_availability"]["Insert"];
export type DoctorAvailabilityUpdate = Database["public"]["Tables"]["doctor_availability"]["Update"];

// أنواع موسّعة تتضمن بيانات من جداول مرتبطة
export interface AppointmentWithDetails extends Appointment {
  patient: {
    id: string;
    name: string;
    email: string | null;
    avatar_url: string | null;
  };
  doctor: {
    id: string;
    name: string;
    email: string | null;
    avatar_url: string | null;
    specialty?: string;
  };
  companion?: {
    id: string;
    name: string;
    email: string | null;
  } | null;
}

// أنواع خاصة بـ Time Slots
export interface TimeSlot {
  start: string; // HH:mm format
  end: string; // HH:mm format
  isAvailable: boolean;
  isBooked: boolean;
  appointmentId?: string;
}

export interface DaySchedule {
  date: Date;
  weekday: number; // 0-6
  slots: TimeSlot[];
}

// أنواع خاصة بإعداد التوفر من قبل الدكتور
export interface AvailabilityForm {
  weekday: number;
  startTime: string;
  endTime: string;
  slotDuration: number;
  isActive: boolean;
}

// أنواع الفلترة لصفحة البحث عن الأطباء
export interface DoctorFilters {
  specialtyId?: string;
  languages?: string[];
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  availableMode?: AppointmentMode;
  date?: Date;
  time?: string;
}

// أنواع خاصة بمعلومات الدكتور الموسّعة
export interface DoctorWithAvailability {
  id: string;
  name: string;
  email: string | null;
  avatar_url: string | null;
  bio: string | null;
  specialties: Array<{
    id: string;
    name: string;
    is_primary: boolean;
  }>;
  languages: string[];
  consultationFees: {
    video: number | null;
    audio: number | null;
    messaging: number | null;
    in_person: number | null;
  };
  offeredModes: {
    video: boolean;
    audio: boolean;
    messaging: boolean;
    in_person: boolean;
  };
  availability: DoctorAvailability[];
  rating?: number;
  totalReviews?: number;
}

// أنواع خاصة بطلب الحجز
export interface BookingRequest {
  doctorId: string;
  patientId: string;
  companionId?: string | null;
  scheduledAt: string;
  duration: number;
  mode: AppointmentMode;
  reason: string;
  notes?: string;
  consultationFee: number;
}

// أنواع خاصة بتحديث حالة الموعد
export interface AppointmentActionPayload {
  appointmentId: string;
  status: AppointmentStatus;
  notes?: string;
  rejectionReason?: string;
}

// Tabs للمواعيد
export type AppointmentTab = "all" | "pending" | "confirmed" | "completed" | "cancelled";

// أنواع لإحصائيات المواعيد
export interface AppointmentStats {
  total: number;
  pending: number;
  confirmed: number;
  completed: number;
  cancelled: number;
  upcoming: number;
}

