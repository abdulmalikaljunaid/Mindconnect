import { Database } from "@/lib/database.types";

// Message Types
export type MessageType = "text" | "system" | "video_link" | "voice_link";

export interface ConsultationMessage {
  id: string;
  appointment_id: string;
  sender_id: string;
  message: string;
  message_type: MessageType;
  is_read: boolean;
  created_at: string;
  sender?: {
    id: string;
    name: string;
    avatar_url: string | null;
    role: "patient" | "doctor" | "companion";
  };
}

export interface ConsultationMessageInsert {
  appointment_id: string;
  sender_id: string;
  message: string;
  message_type?: MessageType;
  is_read?: boolean;
}

export interface ConsultationMessageUpdate {
  message?: string;
  is_read?: boolean;
}

// Consultation Session Info
export interface ConsultationSession {
  appointmentId: string;
  doctorId: string;
  doctorName: string;
  doctorAvatar: string | null;
  patientId: string;
  patientName: string;
  patientAvatar: string | null;
  companionId?: string | null;
  mode: Database["public"]["Enums"]["appointment_mode_type"];
  status: Database["public"]["Enums"]["appointment_status_type"];
  scheduledAt: string;
  duration: number;
  reason: string | null;
  canStartVideoCall: boolean; // true if mode is video/audio and time is within 10 mins
}

// Real-time subscription status
export interface RealtimeStatus {
  isConnected: boolean;
  isSubscribed: boolean;
  error: string | null;
}





