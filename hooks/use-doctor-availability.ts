"use client";

import { useState, useEffect, useCallback } from "react";
import { supabaseClient } from "@/lib/supabase-client";
import {
  DoctorAvailability,
  DoctorAvailabilityInsert,
  TimeSlot,
  DaySchedule,
} from "@/types/appointments";
import { useToast } from "@/hooks/use-toast";

export function useDoctorAvailability(doctorId?: string) {
  const [availability, setAvailability] = useState<DoctorAvailability[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // جلب جدول التوفر للدكتور
  const fetchAvailability = useCallback(async () => {
    if (!doctorId) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabaseClient
        .from("doctor_availability")
        .select("*")
        .eq("doctor_id", doctorId)
        .eq("is_active", true)
        .order("weekday", { ascending: true })
        .order("start_time", { ascending: true });

      if (error) throw error;
      setAvailability(data || []);
    } catch (error: any) {
      console.error("Error fetching availability:", error);
      toast({
        title: "خطأ",
        description: "فشل في تحميل جدول التوفر",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [doctorId, toast]);

  // إضافة وقت توفر جديد
  const addAvailability = async (
    data: Omit<DoctorAvailabilityInsert, "doctor_id">
  ) => {
    if (!doctorId) {
      toast({
        title: "خطأ",
        description: "معرّف الدكتور مطلوب",
        variant: "destructive",
      });
      return false;
    }

    setIsLoading(true);
    try {
      const { error } = await supabaseClient
        .from("doctor_availability")
        .insert({
          ...data,
          doctor_id: doctorId,
        });

      if (error) throw error;

      toast({
        title: "تم بنجاح",
        description: "تمت إضافة وقت التوفر بنجاح",
      });
      await fetchAvailability();
      return true;
    } catch (error: any) {
      console.error("Error adding availability:", error);
      toast({
        title: "خطأ",
        description: error.message || "فشل في إضافة وقت التوفر",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // تحديث وقت توفر
  const updateAvailability = async (
    id: string,
    updates: Partial<DoctorAvailability>
  ) => {
    setIsLoading(true);
    try {
      const { error } = await supabaseClient
        .from("doctor_availability")
        .update(updates)
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "تم بنجاح",
        description: "تم تحديث وقت التوفر بنجاح",
      });
      await fetchAvailability();
      return true;
    } catch (error: any) {
      console.error("Error updating availability:", error);
      toast({
        title: "خطأ",
        description: error.message || "فشل في تحديث وقت التوفر",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // حذف وقت توفر (في الواقع تعطيله)
  const deleteAvailability = async (id: string) => {
    return updateAvailability(id, { is_active: false });
  };

  // توليد time slots لتاريخ معين بناءً على جدول التوفر
  const generateTimeSlots = useCallback(
    async (date: Date): Promise<TimeSlot[]> => {
      const weekday = date.getDay();
      const dayAvailability = availability.filter((a) => a.weekday === weekday);

      if (dayAvailability.length === 0) {
        return [];
      }

      const slots: TimeSlot[] = [];

      // التحقق من المواعيد المحجوزة في هذا اليوم
      if (!doctorId) {
        return slots;
      }

      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      try {
        // Optimized query with limit and only needed fields
        const { data: bookedAppointments } = await supabaseClient
          .from("appointments")
          .select("scheduled_at, duration_minutes, id")
          .eq("doctor_id", doctorId)
          .gte("scheduled_at", startOfDay.toISOString())
          .lte("scheduled_at", endOfDay.toISOString())
          .in("status", ["pending", "confirmed"])
          .limit(100); // Limit to prevent large queries

        // توليد slots من كل فترة توفر
        for (const avail of dayAvailability) {
          const startParts = avail.start_time.split(":");
          const endParts = avail.end_time.split(":");

          let currentTime = new Date(date);
          currentTime.setHours(parseInt(startParts[0]), parseInt(startParts[1]), 0, 0);

          const endTime = new Date(date);
          endTime.setHours(parseInt(endParts[0]), parseInt(endParts[1]), 0, 0);

          while (currentTime < endTime) {
            const slotStart = new Date(currentTime);
            const slotEnd = new Date(
              currentTime.getTime() + avail.slot_duration_minutes * 60000
            );

            // التحقق إذا كان هذا الـ slot محجوز
            const isBooked = bookedAppointments?.some((apt) => {
              const aptStart = new Date(apt.scheduled_at);
              const aptEnd = new Date(
                aptStart.getTime() + apt.duration_minutes * 60000
              );
              return (
                (slotStart >= aptStart && slotStart < aptEnd) ||
                (slotEnd > aptStart && slotEnd <= aptEnd) ||
                (slotStart <= aptStart && slotEnd >= aptEnd)
              );
            });

            // التحقق إذا كان الوقت في الماضي
            const now = new Date();
            const isPast = slotEnd <= now;

            const bookedAppointment = bookedAppointments?.find((apt) => {
              const aptStart = new Date(apt.scheduled_at);
              const aptEnd = new Date(
                aptStart.getTime() + apt.duration_minutes * 60000
              );
              return (
                (slotStart >= aptStart && slotStart < aptEnd) ||
                (slotEnd > aptStart && slotEnd <= aptEnd) ||
                (slotStart <= aptStart && slotEnd >= aptEnd)
              );
            });

            slots.push({
              start: `${slotStart.getHours().toString().padStart(2, "0")}:${slotStart
                .getMinutes()
                .toString()
                .padStart(2, "0")}`,
              end: `${slotEnd.getHours().toString().padStart(2, "0")}:${slotEnd
                .getMinutes()
                .toString()
                .padStart(2, "0")}`,
              isAvailable: !isBooked && !isPast,
              isBooked: !!isBooked,
              appointmentId: bookedAppointment?.id,
            });

            currentTime = slotEnd;
          }
        }

        return slots;
      } catch (error) {
        console.error("Error generating time slots:", error);
        return [];
      }
    },
    [availability, doctorId]
  );

  // توليد جدول أسبوعي
  const generateWeekSchedule = useCallback(
    async (startDate: Date): Promise<DaySchedule[]> => {
      const schedule: DaySchedule[] = [];

      for (let i = 0; i < 7; i++) {
        const date = new Date(startDate);
        date.setDate(date.getDate() + i);

        const slots = await generateTimeSlots(date);

        schedule.push({
          date,
          weekday: date.getDay(),
          slots,
        });
      }

      return schedule;
    },
    [generateTimeSlots]
  );

  useEffect(() => {
    if (doctorId) {
      fetchAvailability();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doctorId]); // Only depend on doctorId, not fetchAvailability

  return {
    availability,
    isLoading,
    fetchAvailability,
    addAvailability,
    updateAvailability,
    deleteAvailability,
    generateTimeSlots,
    generateWeekSchedule,
  };
}

