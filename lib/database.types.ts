export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      appointment_notes: {
        Row: {
          appointment_id: string
          author_id: string
          created_at: string | null
          id: string
          is_private: boolean | null
          note: string
        }
        Insert: {
          appointment_id: string
          author_id: string
          created_at?: string | null
          id?: string
          is_private?: boolean | null
          note: string
        }
        Update: {
          appointment_id?: string
          author_id?: string
          created_at?: string | null
          id?: string
          is_private?: boolean | null
          note?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointment_notes_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointment_notes_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      appointments: {
        Row: {
          cancelled_at: string | null
          companion_id: string | null
          confirmed_at: string | null
          consultation_fee: number | null
          created_at: string | null
          created_by: string
          doctor_id: string
          duration_minutes: number
          id: string
          mode: Database["public"]["Enums"]["appointment_mode_type"]
          notes: string | null
          patient_id: string
          reason: string | null
          rejection_reason: string | null
          scheduled_at: string
          status: Database["public"]["Enums"]["appointment_status_type"]
          updated_at: string | null
        }
        Insert: {
          cancelled_at?: string | null
          companion_id?: string | null
          confirmed_at?: string | null
          consultation_fee?: number | null
          created_at?: string | null
          created_by: string
          doctor_id: string
          duration_minutes?: number
          id?: string
          mode?: Database["public"]["Enums"]["appointment_mode_type"]
          notes?: string | null
          patient_id: string
          reason?: string | null
          rejection_reason?: string | null
          scheduled_at: string
          status?: Database["public"]["Enums"]["appointment_status_type"]
          updated_at?: string | null
        }
        Update: {
          cancelled_at?: string | null
          companion_id?: string | null
          confirmed_at?: string | null
          consultation_fee?: number | null
          created_at?: string | null
          created_by?: string
          doctor_id?: string
          duration_minutes?: number
          id?: string
          mode?: Database["public"]["Enums"]["appointment_mode_type"]
          notes?: string | null
          patient_id?: string
          reason?: string | null
          rejection_reason?: string | null
          scheduled_at?: string
          status?: Database["public"]["Enums"]["appointment_status_type"]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "appointments_companion_id_fkey"
            columns: ["companion_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      doctor_availability: {
        Row: {
          created_at: string | null
          doctor_id: string
          end_time: string
          id: string
          is_active: boolean | null
          slot_duration_minutes: number
          start_time: string
          updated_at: string | null
          weekday: number
        }
        Insert: {
          created_at?: string | null
          doctor_id: string
          end_time: string
          id?: string
          is_active?: boolean | null
          slot_duration_minutes?: number
          start_time: string
          updated_at?: string | null
          weekday: number
        }
        Update: {
          created_at?: string | null
          doctor_id?: string
          end_time?: string
          id?: string
          is_active?: boolean | null
          slot_duration_minutes?: number
          start_time?: string
          updated_at?: string | null
          weekday?: number
        }
        Relationships: [
          {
            foreignKeyName: "doctor_availability_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctor_profiles"
            referencedColumns: ["profile_id"]
          },
        ]
      }
      doctor_profiles: {
        Row: {
          approval_notes: string | null
          approval_status: string | null
          approved_at: string | null
          approved_by: string | null
          audio_consultation_fee: number | null
          certificate_document_url: string | null
          clinic_address: string | null
          consultation_fee: number | null
          created_at: string | null
          cv_document_url: string | null
          education: string | null
          experience_years: number | null
          id_document_url: string | null
          in_person_consultation_fee: number | null
          languages: string[] | null
          license_document_url: string | null
          license_number: string
          messaging_consultation_fee: number | null
          metadata: Json | null
          offers_audio: boolean | null
          offers_in_person: boolean | null
          offers_messaging: boolean | null
          offers_video: boolean | null
          profile_id: string
          submitted_at: string | null
          updated_at: string | null
          video_consultation_fee: number | null
        }
        Insert: {
          approval_notes?: string | null
          approval_status?: string | null
          approved_at?: string | null
          approved_by?: string | null
          audio_consultation_fee?: number | null
          certificate_document_url?: string | null
          clinic_address?: string | null
          consultation_fee?: number | null
          created_at?: string | null
          cv_document_url?: string | null
          education?: string | null
          experience_years?: number | null
          id_document_url?: string | null
          in_person_consultation_fee?: number | null
          languages?: string[] | null
          license_document_url?: string | null
          license_number: string
          messaging_consultation_fee?: number | null
          metadata?: Json | null
          offers_audio?: boolean | null
          offers_in_person?: boolean | null
          offers_messaging?: boolean | null
          offers_video?: boolean | null
          profile_id: string
          submitted_at?: string | null
          updated_at?: string | null
          video_consultation_fee?: number | null
        }
        Update: {
          approval_notes?: string | null
          approval_status?: string | null
          approved_at?: string | null
          approved_by?: string | null
          audio_consultation_fee?: number | null
          certificate_document_url?: string | null
          clinic_address?: string | null
          consultation_fee?: number | null
          created_at?: string | null
          cv_document_url?: string | null
          education?: string | null
          experience_years?: number | null
          id_document_url?: string | null
          in_person_consultation_fee?: number | null
          languages?: string[] | null
          license_document_url?: string | null
          license_number?: string
          messaging_consultation_fee?: number | null
          metadata?: Json | null
          offers_audio?: boolean | null
          offers_in_person?: boolean | null
          offers_messaging?: boolean | null
          offers_video?: boolean | null
          profile_id?: string
          submitted_at?: string | null
          updated_at?: string | null
          video_consultation_fee?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "doctor_profiles_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "doctor_profiles_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      doctor_specialties: {
        Row: {
          created_at: string | null
          doctor_id: string
          is_primary: boolean | null
          specialty_id: string
        }
        Insert: {
          created_at?: string | null
          doctor_id: string
          is_primary?: boolean | null
          specialty_id: string
        }
        Update: {
          created_at?: string | null
          doctor_id?: string
          is_primary?: boolean | null
          specialty_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "doctor_specialties_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctor_profiles"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "doctor_specialties_specialty_id_fkey"
            columns: ["specialty_id"]
            isOneToOne: false
            referencedRelation: "specialties"
            referencedColumns: ["id"]
          },
        ]
      }
      doctor_time_off: {
        Row: {
          created_at: string | null
          doctor_id: string
          ends_at: string
          id: string
          reason: string | null
          starts_at: string
        }
        Insert: {
          created_at?: string | null
          doctor_id: string
          ends_at: string
          id?: string
          reason?: string | null
          starts_at: string
        }
        Update: {
          created_at?: string | null
          doctor_id?: string
          ends_at?: string
          id?: string
          reason?: string | null
          starts_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "doctor_time_off_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctor_profiles"
            referencedColumns: ["profile_id"]
          },
        ]
      }
      medical_history_entries: {
        Row: {
          created_at: string | null
          details: Json | null
          doctor_id: string | null
          id: string
          patient_id: string
          summary: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          details?: Json | null
          doctor_id?: string | null
          id?: string
          patient_id: string
          summary?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          details?: Json | null
          doctor_id?: string | null
          id?: string
          patient_id?: string
          summary?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "medical_history_entries_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctor_profiles"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "medical_history_entries_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          appointment_id: string | null
          body: string
          created_at: string | null
          id: string
          metadata: Json | null
          recipient_id: string | null
          sender_id: string
        }
        Insert: {
          appointment_id?: string | null
          body: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          recipient_id?: string | null
          sender_id: string
        }
        Update: {
          appointment_id?: string | null
          body?: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          recipient_id?: string | null
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          body: string
          created_at: string | null
          id: string
          is_read: boolean | null
          metadata: Json | null
          read_at: string | null
          related_id: string | null
          sender_id: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          body: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          metadata?: Json | null
          read_at?: string | null
          related_id?: string | null
          sender_id?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          metadata?: Json | null
          read_at?: string | null
          related_id?: string | null
          sender_id?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      patient_companions: {
        Row: {
          approved_at: string | null
          companion_id: string
          created_at: string | null
          patient_id: string
          status: Database["public"]["Enums"]["companion_link_status"]
        }
        Insert: {
          approved_at?: string | null
          companion_id: string
          created_at?: string | null
          patient_id: string
          status?: Database["public"]["Enums"]["companion_link_status"]
        }
        Update: {
          approved_at?: string | null
          companion_id?: string
          created_at?: string | null
          patient_id?: string
          status?: Database["public"]["Enums"]["companion_link_status"]
        }
        Relationships: [
          {
            foreignKeyName: "patient_companions_companion_id_fkey"
            columns: ["companion_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patient_companions_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string | null
          email: string | null
          id: string
          is_approved: boolean | null
          name: string
          phone: string | null
          role: Database["public"]["Enums"]["role_type"]
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          email?: string | null
          id: string
          is_approved?: boolean | null
          name: string
          phone?: string | null
          role: Database["public"]["Enums"]["role_type"]
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          is_approved?: boolean | null
          name?: string
          phone?: string | null
          role?: Database["public"]["Enums"]["role_type"]
          updated_at?: string | null
        }
        Relationships: []
      }
      specialties: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          slug: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          slug: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          slug?: string
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_admin_account: {
        Args: {
          admin_email: string
          admin_name: string
          admin_password_hash: string
        }
        Returns: string
      }
      create_admin_account_direct: {
        Args: { admin_email: string; admin_name: string }
        Returns: string
      }
      create_admin_profile:
        | { Args: { user_email: string; user_name: string }; Returns: string }
        | {
            Args: { user_email: string; user_id: string; user_name: string }
            Returns: undefined
          }
    }
    Enums: {
      appointment_mode_type: "video" | "in_person" | "audio" | "messaging"
      appointment_status_type:
        | "pending"
        | "confirmed"
        | "completed"
        | "cancelled"
        | "no_show"
        | "rescheduled"
      companion_link_status: "pending" | "approved" | "revoked"
      message_type_enum: "text" | "system" | "video_link" | "voice_link"
      role_type: "patient" | "doctor" | "companion" | "admin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
    : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      appointment_mode_type: ["video", "in_person", "audio", "messaging"],
      appointment_status_type: [
        "pending",
        "confirmed",
        "completed",
        "cancelled",
        "no_show",
        "rescheduled",
      ],
      companion_link_status: ["pending", "approved", "revoked"],
      message_type_enum: ["text", "system", "video_link", "voice_link"],
      role_type: ["patient", "doctor", "companion", "admin"],
    },
  },
} as const
