import { getSupabaseAdminClient } from "@/lib/supabase-admin";
import type { BookingRequest } from "@/types/appointments";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { parseNaturalDate } from "@/lib/utils/date-parser";

interface BookAppointmentParams {
  doctorId?: string;
  doctorName?: string;
  scheduledAt: string;
  mode?: "video" | "audio" | "messaging" | "in_person"; // Optional with default
  reason: string;
  notes?: string;
}

interface SearchDoctorsParams {
  specialty?: string;
  name?: string;
  mode?: "video" | "audio" | "messaging" | "in_person";
}

interface GetAppointmentDetailsParams {
  appointmentId: string;
}

export async function bookAppointment(
  params: BookAppointmentParams,
  userId: string
): Promise<{ success: boolean; message: string; data?: any }> {
  try {
    const supabase = getSupabaseAdminClient();

    // البحث عن الطبيب إذا تم تحديد الاسم بدلاً من المعرف
    let doctorId = params.doctorId;
    if (!doctorId && params.doctorName) {
      const { data: doctors, error: searchError } = await supabase
        .from("profiles")
        .select("id, name")
        .eq("role", "doctor")
        .eq("is_approved", true)
        .ilike("name", `%${params.doctorName}%`)
        .limit(1);

      if (searchError || !doctors || doctors.length === 0) {
        return {
          success: false,
          message: `لم يتم العثور على طبيب بالاسم "${params.doctorName}". يرجى التأكد من الاسم أو البحث عن أطباء متاحين أولاً.`,
        };
      }

      doctorId = doctors[0].id;
    }

    if (!doctorId) {
      return {
        success: false,
        message: "يرجى تحديد الطبيب (اسم أو معرف).",
      };
    }

    // تعيين نوع الاستشارة الافتراضي إذا لم يتم التحديد
    const mode = params.mode || "video";

    // تحويل التاريخ الطبيعي إلى ISO إذا كان نصاً
    let scheduledAt = params.scheduledAt;
    
    // التحقق إذا كان التاريخ بصيغة ISO 8601 كاملة
    const isISO8601 = scheduledAt.includes("T") && scheduledAt.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    
    if (!isISO8601) {
      // محاولة parsing التاريخ الطبيعي
      // البحث عن الوقت في notes أو reason إذا كان موجوداً
      const timeExtraction = params.notes || params.reason || "";
      const timeMatch = timeExtraction.match(/(\d{1,2}):?(\d{2})?\s*(مساء|صباح|م|ص|PM|AM)?/i);
      const timeStr = timeMatch ? timeMatch[0] : undefined;
      
      // إذا كان التاريخ يحتوي على الوقت في نفس النص (مثل "غداً في الساعة 2")
      const dateTimeMatch = scheduledAt.match(/(غداً|بعد غد|اليوم|الأحد|الإثنين|الثلاثاء|الأربعاء|الخميس|الجمعة|السبت).*?(\d{1,2}):?(\d{2})?\s*(مساء|صباح|م|ص)?/i);
      const extractedTime = dateTimeMatch ? dateTimeMatch[0] : timeStr;
      
      const parsed = parseNaturalDate(scheduledAt, extractedTime);
      if (parsed) {
        scheduledAt = parsed;
      } else {
        // إذا لم نتمكن من parsing، نستخدم التاريخ الأصلي ونحاول تحويله
        try {
          const testDate = new Date(scheduledAt);
          if (!isNaN(testDate.getTime())) {
            scheduledAt = testDate.toISOString();
          } else {
            return {
              success: false,
              message: `تعذر فهم التاريخ: ${params.scheduledAt}. يرجى استخدام تاريخ محدد أو كلمات مثل "غداً" أو "بعد غد". يمكنك أيضاً تحديد الوقت مثل "غداً في الساعة 2 مساءً"`,
            };
          }
        } catch {
          return {
            success: false,
            message: `تعذر فهم التاريخ: ${params.scheduledAt}. يرجى استخدام تاريخ محدد أو كلمات مثل "غداً" أو "بعد غد"`,
          };
        }
      }
    }

    // جلب معلومات الطبيب لحساب السعر
    const { data: doctorProfile, error: doctorError } = await supabase
      .from("doctor_profiles")
      .select("video_consultation_fee, audio_consultation_fee, messaging_consultation_fee, in_person_consultation_fee")
      .eq("profile_id", doctorId)
      .single();

    if (doctorError || !doctorProfile) {
      return {
        success: false,
        message: "لم يتم العثور على الطبيب أو لم يتم الموافقة عليه بعد",
      };
    }

    const fee =
      mode === "video"
        ? doctorProfile.video_consultation_fee
        : mode === "audio"
        ? doctorProfile.audio_consultation_fee
        : mode === "messaging"
        ? doctorProfile.messaging_consultation_fee
        : doctorProfile.in_person_consultation_fee;

    // التحقق من توفر الموعد قبل الحجز
    const appointmentDate = new Date(scheduledAt);
    const appointmentEnd = new Date(appointmentDate.getTime() + 50 * 60000); // 50 minutes duration
    const weekday = appointmentDate.getDay(); // 0 = Sunday, 6 = Saturday
    
    console.log("🔍 Checking appointment availability:", {
      doctor_id: doctorId,
      scheduled_at: scheduledAt,
      weekday,
    });

    // 1. التحقق من جدول توفر الطبيب
    const { data: availability, error: availError } = await supabase
      .from("doctor_availability")
      .select("*")
      .eq("doctor_id", doctorId)
      .eq("weekday", weekday)
      .eq("is_active", true);

    if (availError) {
      console.error("❌ Error checking availability:", availError);
    }

    // إذا لم يكن هناك جدول توفر محدد، نسمح بالحجز
    // لكن نتحقق من التعارض مع مواعيد أخرى
    const hasAvailabilitySchedule = availability && availability.length > 0;
    
    if (hasAvailabilitySchedule) {
      // التحقق من أن الوقت يقع ضمن ساعات العمل
      const appointmentTime = appointmentDate.toTimeString().slice(0, 5); // HH:mm format
      const isWithinHours = availability.some((avail) => {
        const startTime = avail.start_time;
        const endTime = avail.end_time;
        return appointmentTime >= startTime && appointmentTime < endTime;
      });

      if (!isWithinHours) {
        // بناء قائمة بالأوقات المتاحة
        const availableTimes = availability.map(a => `${a.start_time} - ${a.end_time}`).join("، ");
        return {
          success: false,
          message: `عذراً، الموعد المحدد (${appointmentTime}) غير متاح في جدول الطبيب. ساعات العمل المتاحة في هذا اليوم: ${availableTimes}. يرجى اختيار وقت آخر.`,
          data: {
            availableHours: availability.map(a => ({
              start: a.start_time,
              end: a.end_time,
            })),
          },
        };
      }
    }

    // 2. التحقق من التعارض مع مواعيد موجودة
    const { data: conflictingAppointments, error: conflictError } = await supabase
      .from("appointments")
      .select("id, scheduled_at, duration_minutes, status")
      .eq("doctor_id", doctorId)
      .in("status", ["pending", "confirmed"])
      .gte("scheduled_at", new Date(appointmentDate.getTime() - 24 * 60 * 60 * 1000).toISOString()) // Last 24 hours
      .lte("scheduled_at", new Date(appointmentDate.getTime() + 24 * 60 * 60 * 1000).toISOString()); // Next 24 hours

    if (conflictError) {
      console.error("❌ Error checking conflicts:", conflictError);
    }

    // التحقق من التعارض
    if (conflictingAppointments && conflictingAppointments.length > 0) {
      const hasConflict = conflictingAppointments.some((apt) => {
        const aptStart = new Date(apt.scheduled_at);
        const aptEnd = new Date(aptStart.getTime() + (apt.duration_minutes || 50) * 60000);
        
        // التحقق من التعارض (overlap)
        return (
          (appointmentDate >= aptStart && appointmentDate < aptEnd) ||
          (appointmentEnd > aptStart && appointmentEnd <= aptEnd) ||
          (appointmentDate <= aptStart && appointmentEnd >= aptEnd)
        );
      });

      if (hasConflict) {
        // البحث عن أوقات بديلة متاحة
        const conflictingTime = format(appointmentDate, "HH:mm", { locale: ar });
        const conflictingDate = format(appointmentDate, "EEEE، d MMMM yyyy", { locale: ar });
        
        // محاولة إيجاد أوقات بديلة متاحة فعلياً
        const suggestedTimes: string[] = [];
        
        if (hasAvailabilitySchedule && availability) {
          // استخدام ساعات العمل المتاحة
          for (const avail of availability) {
            const [startHour, startMin] = avail.start_time.split(":").map(Number);
            const [endHour, endMin] = avail.end_time.split(":").map(Number);
            
            // إنشاء مواعيد مقترحة كل ساعة
            let currentHour = startHour;
            let attempts = 0;
            while (currentHour < endHour && suggestedTimes.length < 3 && attempts < 10) {
              const suggestedTime = new Date(appointmentDate);
              suggestedTime.setHours(currentHour, 0, 0, 0);
              
              // التحقق من عدم التعارض
              const suggestedEnd = new Date(suggestedTime.getTime() + 50 * 60000);
              const hasConflictWithSuggested = conflictingAppointments?.some((apt) => {
                const aptStart = new Date(apt.scheduled_at);
                const aptEnd = new Date(aptStart.getTime() + (apt.duration_minutes || 50) * 60000);
                return (
                  (suggestedTime >= aptStart && suggestedTime < aptEnd) ||
                  (suggestedEnd > aptStart && suggestedEnd <= aptEnd) ||
                  (suggestedTime <= aptStart && suggestedEnd >= aptEnd)
                );
              });
              
              // التحقق من أن الوقت في المستقبل
              const isFuture = suggestedTime > new Date();
              
              if (!hasConflictWithSuggested && isFuture && suggestedTime.getTime() !== appointmentDate.getTime()) {
                suggestedTimes.push(format(suggestedTime, "HH:mm", { locale: ar }));
              }
              
              currentHour += 1;
              attempts++;
            }
          }
        }
        
        // إذا لم نجد أوقات من جدول التوفر، نقترح أوقات عامة
        if (suggestedTimes.length === 0) {
          const alternativeTime1 = new Date(appointmentDate.getTime() + 2 * 60 * 60 * 1000);
          const alternativeTime2 = new Date(appointmentDate.getTime() + 4 * 60 * 60 * 1000);
          suggestedTimes.push(
            format(alternativeTime1, "HH:mm", { locale: ar }),
            format(alternativeTime2, "HH:mm", { locale: ar })
          );
        }
        
        const suggestedTimesText = suggestedTimes.length > 0
          ? ` يمكنك تجربة الأوقات التالية: ${suggestedTimes.join("، ")}.`
          : " يرجى اختيار وقت آخر من اليوم نفسه أو يوم آخر.";
        
        return {
          success: false,
          message: `عذراً، الموعد المحدد (${conflictingDate} في الساعة ${conflictingTime}) غير متاح بسبب وجود موعد آخر محجوز في هذا الوقت.${suggestedTimesText}`,
          data: {
            conflictDate: conflictingDate,
            conflictTime: conflictingTime,
            suggestedTimes,
          },
        };
      }
    }

    console.log("✅ Appointment availability verified");

    // إنشاء الموعد
    console.log("🔄 Attempting to create appointment with:", {
      patient_id: userId,
      doctor_id: doctorId,
      scheduled_at: scheduledAt,
      mode: params.mode,
      reason: params.reason,
    });

    const { data: appointment, error } = await supabase
      .from("appointments")
      .insert({
        patient_id: userId,
        doctor_id: doctorId,
      scheduled_at: scheduledAt,
      duration_minutes: 50,
      mode: mode,
      reason: params.reason,
        notes: params.notes || null,
        consultation_fee: fee || 0,
        created_by: userId,
        status: "pending",
      })
      .select()
      .single();

    if (error) {
      console.error("❌ Error creating appointment:", {
        error: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
      });
      return {
        success: false,
        message: `فشل في حجز الموعد: ${error.message}`,
      };
    }

    if (!appointment || !appointment.id) {
      console.error("❌ Appointment created but no data returned:", appointment);
      return {
        success: false,
        message: "تم إرسال طلب الحجز لكن لم يتم الحصول على تأكيد. يرجى التحقق من المواعيد لاحقاً.",
      };
    }

    // التحقق من أن الموعد موجود فعلياً في قاعدة البيانات
    const { data: verifyAppointment, error: verifyError } = await supabase
      .from("appointments")
      .select("id, status, patient_id, doctor_id, scheduled_at")
      .eq("id", appointment.id)
      .single();

    if (verifyError || !verifyAppointment) {
      console.error("❌ Verification failed - appointment not found:", verifyError);
      return {
        success: false,
        message: "تم إنشاء الموعد لكن فشل التحقق. يرجى المحاولة مرة أخرى أو التحقق من المواعيد.",
      };
    }

    console.log("✅ Appointment created and verified successfully:", {
      appointment_id: appointment.id,
      status: verifyAppointment.status,
      patient_id: verifyAppointment.patient_id,
      doctor_id: verifyAppointment.doctor_id,
    });

    const date = new Date(scheduledAt);
    const formattedDate = format(date, "EEEE، d MMMM yyyy 'في الساعة' HH:mm", { locale: ar });

    // جلب معلومات الطبيب والمريض للإشعار
    const { data: doctorInfo } = await supabase
      .from("profiles")
      .select("name, email")
      .eq("id", doctorId)
      .single();

    const { data: patientInfo } = await supabase
      .from("profiles")
      .select("name")
      .eq("id", userId)
      .single();

    const doctorName = doctorInfo?.name || "الطبيب";
    const patientName = patientInfo?.name || "مريض";

    // إنشاء رسالة/إشعار للطبيب عن الموعد الجديد
    let notificationSent = false;
    try {
      console.log("🔄 Attempting to send notification to doctor:", doctorId);
      
      const notificationBody = `لديك طلب حجز موعد جديد من ${patientName}. التاريخ: ${formattedDate}. نوع الاستشارة: ${mode === "video" ? "فيديو" : mode === "audio" ? "صوت" : mode === "messaging" ? "رسائل" : "حضوري"}. السبب: ${params.reason}`;
      
      const { data: notification, error: messageError } = await supabase
        .from("messages")
        .insert({
          sender_id: userId,
          recipient_id: doctorId,
          appointment_id: appointment.id,
          body: notificationBody,
          metadata: {
            type: "appointment_request",
            appointment_id: appointment.id,
            action_required: "review_appointment",
          },
        })
        .select()
        .single();

      if (messageError) {
        console.error("❌ Error creating notification message:", {
          error: messageError.message,
          code: messageError.code,
          details: messageError.details,
        });
        // لا نفشل العملية إذا فشل إنشاء الإشعار، لكن نسجل الخطأ
      } else if (notification && notification.id) {
        notificationSent = true;
        console.log("✅ Notification message sent successfully:", {
          message_id: notification.id,
          doctor_id: doctorId,
          appointment_id: appointment.id,
        });
      } else {
        console.warn("⚠️ Notification insert returned no data:", notification);
      }
    } catch (notifError: any) {
      console.error("❌ Exception in notification creation:", {
        error: notifError.message,
        stack: notifError.stack,
      });
      // لا نفشل العملية إذا فشل إنشاء الإشعار
    }

    // بناء رسالة النجاح بناءً على ما تم إنجازه فعلياً
    let successMessage = `تم حجز الموعد بنجاح مع ${doctorName}! تاريخ الموعد: ${formattedDate}.`;
    
    if (notificationSent) {
      successMessage += " تم إرسال إشعار للطبيب وسيتم مراجعة الطلب والانتظار للموافقة على الموعد.";
    } else {
      successMessage += " تم إنشاء الموعد بنجاح وسيتم مراجعة الطلب من قبل الطبيب.";
      console.warn("⚠️ Appointment created but notification not sent");
    }

    console.log("✅ Final appointment booking result:", {
      success: true,
      appointment_id: appointment.id,
      notification_sent: notificationSent,
    });

    return {
      success: true,
      message: successMessage,
      data: {
        ...appointment,
        doctorName,
        patientName,
        notificationSent,
      },
    };
  } catch (error: any) {
    return {
      success: false,
      message: `حدث خطأ: ${error.message}`,
    };
  }
}

export async function searchDoctors(
  params: SearchDoctorsParams,
  userId: string
): Promise<{ success: boolean; message: string; data?: any }> {
  try {
    const supabase = getSupabaseAdminClient();

    // البحث من خلال doctor_profiles أولاً
    let query = supabase
      .from("doctor_profiles")
      .select(
        `
        profile_id,
        video_consultation_fee,
        audio_consultation_fee,
        messaging_consultation_fee,
        in_person_consultation_fee,
        offers_video,
        offers_audio,
        offers_messaging,
        offers_in_person,
        profile:profiles!doctor_profiles_profile_id_fkey (
          id,
          name,
          email,
          avatar_url,
          bio,
          is_approved,
          role
        ),
        doctor_specialties (
          specialties (name, slug)
        )
      `
      )
      .eq("profile.is_approved", true)
      .eq("profile.role", "doctor");

    if (params.mode) {
      const modeField =
        params.mode === "video"
          ? "offers_video"
          : params.mode === "audio"
          ? "offers_audio"
          : params.mode === "messaging"
          ? "offers_messaging"
          : "offers_in_person";
      query = query.eq(modeField, true);
    }

    const { data: doctors, error } = await query.limit(20);

    if (error) {
      return {
        success: false,
        message: `فشل في البحث: ${error.message}`,
      };
    }

    let formattedDoctors = doctors?.map((doctor: any) => {
      const profile = Array.isArray(doctor.profile) ? doctor.profile[0] : doctor.profile;
      return {
        id: profile?.id,
        name: profile?.name,
        email: profile?.email,
        avatar_url: profile?.avatar_url,
        bio: profile?.bio,
        specialties: doctor.doctor_specialties?.map((ds: any) => ds.specialties?.name).filter(Boolean) || [],
        videoConsultationFee: doctor.video_consultation_fee,
        audioConsultationFee: doctor.audio_consultation_fee,
        messagingConsultationFee: doctor.messaging_consultation_fee,
        inPersonConsultationFee: doctor.in_person_consultation_fee,
        offersVideo: doctor.offers_video,
        offersAudio: doctor.offers_audio,
        offersMessaging: doctor.offers_messaging,
        offersInPerson: doctor.offers_in_person,
      };
    }).filter((doc: any) => doc.id) || [];

    // تصفية حسب الاسم إذا تم التحديد
    if (params.name) {
      formattedDoctors = formattedDoctors.filter((doc: any) =>
        doc.name?.toLowerCase().includes(params.name!.toLowerCase())
      );
    }

    // تصفية حسب التخصص إذا تم التحديد
    if (params.specialty) {
      formattedDoctors = formattedDoctors.filter((doc: any) =>
        doc.specialties.some((spec: string) =>
          spec.toLowerCase().includes(params.specialty!.toLowerCase())
        )
      );
    }

    // تحديد النتائج إلى 10
    formattedDoctors = formattedDoctors.slice(0, 10);

    return {
      success: true,
      message: `تم العثور على ${formattedDoctors.length} طبيب`,
      data: formattedDoctors,
    };
  } catch (error: any) {
    return {
      success: false,
      message: `حدث خطأ: ${error.message}`,
    };
  }
}

export async function getUpcomingAppointments(
  userId: string
): Promise<{ success: boolean; message: string; data?: any }> {
  try {
    const supabase = getSupabaseAdminClient();
    const now = new Date().toISOString();

    const { data: appointments, error } = await supabase
      .from("appointments")
      .select("id, scheduled_at, status, mode, reason, doctor_id")
      .eq("patient_id", userId)
      .gte("scheduled_at", now)
      .order("scheduled_at", { ascending: true });

    if (error) {
      return {
        success: false,
        message: `فشل في جلب المواعيد: ${error.message}`,
      };
    }

    // جلب أسماء الأطباء بشكل منفصل
    const formatted = await Promise.all(
      (appointments || []).map(async (apt: any) => {
        let doctorName = "غير محدد";
        if (apt.doctor_id) {
          const { data: doctorProfile } = await supabase
            .from("profiles")
            .select("name")
            .eq("id", apt.doctor_id)
            .single();
          doctorName = doctorProfile?.name || "غير محدد";
        }

        return {
          id: apt.id,
          date: format(new Date(apt.scheduled_at), "EEEE، d MMMM yyyy 'في الساعة' HH:mm", { locale: ar }),
          doctor: doctorName,
          status: apt.status,
          mode: apt.mode,
          reason: apt.reason,
        };
      })
    );

    return {
      success: true,
      message: `لديك ${formatted.length} موعد قادم`,
      data: formatted,
    };
  } catch (error: any) {
    return {
      success: false,
      message: `حدث خطأ: ${error.message}`,
    };
  }
}

export async function getPastAppointments(
  userId: string
): Promise<{ success: boolean; message: string; data?: any }> {
  try {
    const supabase = getSupabaseAdminClient();
    const now = new Date().toISOString();

    const { data: appointments, error } = await supabase
      .from("appointments")
      .select("id, scheduled_at, status, mode, reason, doctor_id")
      .eq("patient_id", userId)
      .lt("scheduled_at", now)
      .order("scheduled_at", { ascending: false })
      .limit(10);

    if (error) {
      return {
        success: false,
        message: `فشل في جلب المواعيد: ${error.message}`,
      };
    }

    // جلب أسماء الأطباء بشكل منفصل
    const formatted = await Promise.all(
      (appointments || []).map(async (apt: any) => {
        let doctorName = "غير محدد";
        if (apt.doctor_id) {
          const { data: doctorProfile } = await supabase
            .from("profiles")
            .select("name")
            .eq("id", apt.doctor_id)
            .single();
          doctorName = doctorProfile?.name || "غير محدد";
        }

        return {
          id: apt.id,
          date: format(new Date(apt.scheduled_at), "EEEE، d MMMM yyyy 'في الساعة' HH:mm", { locale: ar }),
          doctor: doctorName,
          status: apt.status,
          mode: apt.mode,
        };
      })
    );

    return {
      success: true,
      message: `لديك ${formatted.length} موعد سابق`,
      data: formatted,
    };
  } catch (error: any) {
    return {
      success: false,
      message: `حدث خطأ: ${error.message}`,
    };
  }
}

export async function getMedicalHistory(
  userId: string
): Promise<{ success: boolean; message: string; data?: any }> {
  try {
    const supabase = getSupabaseAdminClient();

    const { data: history, error } = await supabase
      .from("medical_history_entries")
      .select("id, title, summary, details, created_at, doctor_id")
      .eq("patient_id", userId)
      .order("created_at", { ascending: false })
      .limit(10);

    if (error) {
      return {
        success: false,
        message: `فشل في جلب السجل الطبي: ${error.message}`,
      };
    }

    // جلب أسماء الأطباء بشكل منفصل
    const formatted = await Promise.all(
      (history || []).map(async (entry: any) => {
        let doctorName = "غير محدد";
        if (entry.doctor_id) {
          const { data: doctorProfile } = await supabase
            .from("profiles")
            .select("name")
            .eq("id", entry.doctor_id)
            .single();
          doctorName = doctorProfile?.name || "غير محدد";
        }

        return {
          id: entry.id,
          title: entry.title,
          summary: entry.summary,
          date: format(new Date(entry.created_at), "EEEE، d MMMM yyyy", { locale: ar }),
          doctor: doctorName,
        };
      })
    );

    return {
      success: true,
      message: `لديك ${formatted.length} سجل طبي`,
      data: formatted,
    };
  } catch (error: any) {
    return {
      success: false,
      message: `حدث خطأ: ${error.message}`,
    };
  }
}

export async function getAppointmentDetails(
  params: GetAppointmentDetailsParams,
  userId: string
): Promise<{ success: boolean; message: string; data?: any }> {
  try {
    const supabase = getSupabaseAdminClient();

    const { data: appointment, error } = await supabase
      .from("appointments")
      .select("id, scheduled_at, status, mode, reason, notes, consultation_fee, doctor_id")
      .eq("id", params.appointmentId)
      .eq("patient_id", userId)
      .single();

    if (error || !appointment) {
      return {
        success: false,
        message: "لم يتم العثور على الموعد",
      };
    }

    // جلب بيانات الطبيب
    let doctorName = "غير محدد";
    let doctorEmail = null;
    if (appointment.doctor_id) {
      const { data: doctorProfile } = await supabase
        .from("profiles")
        .select("name, email")
        .eq("id", appointment.doctor_id)
        .single();
      doctorName = doctorProfile?.name || "غير محدد";
      doctorEmail = doctorProfile?.email || null;
    }

    const formatted = {
      id: appointment.id,
      date: format(new Date(appointment.scheduled_at), "EEEE، d MMMM yyyy 'في الساعة' HH:mm", { locale: ar }),
      doctor: doctorName,
      doctorEmail: doctorEmail,
      status: appointment.status,
      mode: appointment.mode,
      reason: appointment.reason,
      notes: appointment.notes,
      fee: appointment.consultation_fee,
    };

    return {
      success: true,
      message: "تفاصيل الموعد:",
      data: formatted,
    };
  } catch (error: any) {
    return {
      success: false,
      message: `حدث خطأ: ${error.message}`,
    };
  }
}

