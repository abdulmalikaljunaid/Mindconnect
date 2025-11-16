"use client";

import { useEffect, useState } from "react";
import { supabaseClient } from "@/lib/supabase-client";
import { useAuth } from "@/contexts/auth-context";

export interface ChatSuggestion {
  id: string;
  text: string;
  type: "appointment" | "doctor" | "medical_history" | "general";
}

export function useChatSuggestions() {
  const { user } = useAuth();
  const [suggestions, setSuggestions] = useState<ChatSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setSuggestions([]);
      setIsLoading(false);
      return;
    }

    const fetchSuggestions = async () => {
      setIsLoading(true);
      const newSuggestions: ChatSuggestion[] = [];

      try {
        // جلب آخر 3 مواعيد
        const { data: appointments } = await supabaseClient
          .from("appointments")
          .select("id, scheduled_at, status, doctor_id")
          .eq("patient_id", user.id)
          .order("scheduled_at", { ascending: false })
          .limit(3);

        if (appointments && appointments.length > 0) {
          // جلب أسماء الأطباء بشكل منفصل
          for (const apt of appointments) {
            let doctorName = "الطبيب";
            if (apt.doctor_id) {
              const { data: doctorProfile } = await supabaseClient
                .from("profiles")
                .select("name")
                .eq("id", apt.doctor_id)
                .single();
              doctorName = doctorProfile?.name || "الطبيب";
            }

            const date = new Date(apt.scheduled_at);
            const formattedDate = date.toLocaleDateString("ar-SA");
            newSuggestions.push({
              id: `apt-${apt.id}`,
              text: `أعرض موعدي مع ${doctorName} في ${formattedDate}`,
              type: "appointment",
            });
          }

          // إضافة اقتراح عام للمواعيد
          newSuggestions.push({
            id: "apt-all",
            text: "أعرض جميع مواعيدي القادمة",
            type: "appointment",
          });
        }

        // جلب آخر 3 أطباء تم الحجز معهم
        const { data: recentDoctors } = await supabaseClient
          .from("appointments")
          .select("doctor_id")
          .eq("patient_id", user.id)
          .not("doctor_id", "is", null)
          .order("created_at", { ascending: false })
          .limit(5);

        if (recentDoctors) {
          const uniqueDoctors = new Map<string, string>();
          
          // جلب أسماء الأطباء بشكل منفصل
          for (const apt of recentDoctors) {
            if (apt.doctor_id && !uniqueDoctors.has(apt.doctor_id)) {
              const { data: doctorProfile } = await supabaseClient
                .from("profiles")
                .select("name")
                .eq("id", apt.doctor_id)
                .single();
              
              if (doctorProfile?.name) {
                uniqueDoctors.set(apt.doctor_id, doctorProfile.name);
              }
            }
          }

          const doctors = Array.from(uniqueDoctors.values()).slice(0, 2);
          doctors.forEach((doctorName, index) => {
            newSuggestions.push({
              id: `doc-${index}`,
              text: `أريد حجز موعد مع ${doctorName}`,
              type: "doctor",
            });
          });
        }

        // اقتراحات عامة
        if (user.role === "patient") {
          newSuggestions.push({
            id: "search-doc",
            text: "ابحث عن أطباء متخصصين",
            type: "doctor",
          });
          newSuggestions.push({
            id: "medical-history",
            text: "أعرض سجلي الطبي",
            type: "medical_history",
          });
        }
      } catch (error) {
        console.error("Error fetching suggestions:", error);
        // في حالة الخطأ، نضيف اقتراحات عامة فقط
        if (user?.role === "patient") {
          newSuggestions.push({
            id: "search-doc",
            text: "ابحث عن أطباء متخصصين",
            type: "doctor",
          });
          newSuggestions.push({
            id: "medical-history",
            text: "أعرض سجلي الطبي",
            type: "medical_history",
          });
        }
      }

      setSuggestions(newSuggestions);
      setIsLoading(false);
    };

    fetchSuggestions();
  }, [user]);

  return { suggestions, isLoading };
}



