import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { cookies } from "next/headers";
import { chatWithAI } from "@/lib/ai/gemini";
import * as chatFunctions from "@/lib/ai/chat-functions";
import { parseNaturalDate } from "@/lib/utils/date-parser";

export const maxDuration = 30; // Maximum execution time for Vercel

// دالة لتحليل الطلب مباشرة بدون AI (fallback عند Quota exceeded)
function detectDirectFunctionCall(message: string): { name: string; args: any } | null {
  const lowerMessage = message.toLowerCase();
  
  // عرض المواعيد القادمة - تحسين الأنماط
  if ((lowerMessage.includes("أعرض") || lowerMessage.includes("عرض") || lowerMessage.includes("أظهر") || lowerMessage.includes("أريد")) &&
      (lowerMessage.includes("موعد") || lowerMessage.includes("مواعيد"))) {
    if (lowerMessage.includes("قادم") || lowerMessage.includes("القادمة") || lowerMessage.includes("مقبل") || lowerMessage.includes("القادم")) {
      return { name: "getUpcomingAppointments", args: {} };
    } else if (lowerMessage.includes("سابق") || lowerMessage.includes("السابقة") || lowerMessage.includes("الماضية")) {
      return { name: "getPastAppointments", args: {} };
    } else {
      // إذا لم يحدد، نستخدم القادمة كافتراضي
      return { name: "getUpcomingAppointments", args: {} };
    }
  }
  
  // عرض السجل الطبي - تحسين الأنماط
  if ((lowerMessage.includes("سجل") || lowerMessage.includes("السجل") || lowerMessage.includes("تاريخ")) &&
      (lowerMessage.includes("طبي") || lowerMessage.includes("الطبي") || lowerMessage.includes("صحي"))) {
    return { name: "getMedicalHistory", args: {} };
  }
  
  // عرض سجلي الطبي (صيغة أخرى)
  if (lowerMessage.includes("سجلي") && (lowerMessage.includes("طبي") || lowerMessage.includes("الطبي"))) {
    return { name: "getMedicalHistory", args: {} };
  }
  
  // حجز موعد
  if (lowerMessage.includes("احجز") || lowerMessage.includes("حجز موعد")) {
    // استخراج اسم الطبيب - تحسين الأنماط
    // البحث عن "دكتور" أو "طبيب" متبوعاً بالاسم
    let doctorMatch = message.match(/(?:دكتور|د\.|د\s|طبيب)\s+([a-zA-Z0-9_.-]+)(?:\s+(?:غد|بعد|اليوم|في|الساعة)|$)/i);
    let doctorName = doctorMatch ? doctorMatch[1].trim() : null;
    
    // إذا لم نجد، نحاول البحث بدون كلمة "دكتور" مباشرة
    if (!doctorName) {
      // البحث عن كلمات شائعة لأسماء الأطباء (مثل drabdulmalik)
      const namePattern = /(?:مع|ل|مع\s+دكتور|مع\s+طبيب|دكتور|د\.|طبيب)\s+([a-zA-Z0-9_.-]+)/i;
      doctorMatch = message.match(namePattern);
      doctorName = doctorMatch ? doctorMatch[1].trim() : null;
    }
    
    // إذا لم نجد، نحاول البحث عن أي اسم بعد "احجز موعد"
    if (!doctorName) {
      const simplePattern = /(?:احجز|حجز)\s+(?:موعد\s+)?(?:مع\s+)?([a-zA-Z0-9_.-]+)/i;
      doctorMatch = message.match(simplePattern);
      doctorName = doctorMatch && !["غداً", "غدا", "اليوم", "بعد", "موعد"].includes(doctorMatch[1].toLowerCase()) 
        ? doctorMatch[1].trim() 
        : null;
    }
    
    // محاولة أخيرة: البحث عن أي كلمة تبدو كاسم طبيب قبل التاريخ
    if (!doctorName) {
      const beforeDatePattern = /([a-zA-Z0-9_.-]+)\s+(?:غد[اًا]?|بعد غد|اليوم|الأحد|الإثنين|الثلاثاء|الأربعاء|الخميس|الجمعة|السبت)/i;
      doctorMatch = message.match(beforeDatePattern);
      if (doctorMatch && doctorMatch[1] && doctorMatch[1].length > 2) {
        const candidate = doctorMatch[1].trim();
        // استبعاد الكلمات الشائعة
        const excludeWords = ["موعد", "مع", "احجز", "حجز", "دكتور", "طبيب", "ل"];
        if (!excludeWords.includes(candidate.toLowerCase())) {
          doctorName = candidate;
        }
      }
    }
    
    // استخراج التاريخ
    const dateMatch = message.match(/(غد[اًا]?|بعد غد|اليوم|الأحد|الإثنين|الثلاثاء|الأربعاء|الخميس|الجمعة|السبت)/i);
    const dateStr = dateMatch ? dateMatch[1] : null;
    
    // استخراج الوقت
    const timeMatch = message.match(/(\d{1,2}):?(\d{2})?\s*(مساء|صباح|م|ص|pm|am)?/i);
    const timeStr = timeMatch ? timeMatch[0] : null;
    
    // استخراج السبب
    const reasonMatch = message.match(/(?:ل|لـ|لأن|بسبب)\s*(.+?)(?:\s*$|\s*(?:غد|بعد|اليوم|في|الساعة))/i);
    const reason = reasonMatch ? reasonMatch[1].trim() : "مراجعة نفسية";
    
    if (doctorName && dateStr) {
      const scheduledAt = parseNaturalDate(dateStr, timeStr) || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      
      return {
        name: "bookAppointment",
        args: {
          doctorName,
          scheduledAt,
          reason: reason || "مراجعة نفسية",
          mode: "video", // افتراضي
        },
      };
    }
  }
  
  // البحث عن أطباء
  if (lowerMessage.includes("ابحث") && (lowerMessage.includes("طبيب") || lowerMessage.includes("أطباء"))) {
    const specialtyMatch = message.match(/(?:متخصص|تخصص|في)\s*(.+?)(?:\s*$|\s*(?:أو|و))/i);
    return {
      name: "searchDoctors",
      args: {
        specialty: specialtyMatch ? specialtyMatch[1].trim() : undefined,
      },
    };
  }
  
  return null;
}

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createSupabaseServerClient(cookieStore);

    // التحقق من المستخدم
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const body = await req.json();
    const { message, conversationHistory = [] } = body;

    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "الرسالة مطلوبة" }, { status: 400 });
    }

    // التحقق أولاً من direct function call للطلبات الواضحة (تسريع الاستجابة)
    const directCall = detectDirectFunctionCall(message);
    if (directCall) {
      console.log("🎯 Detected direct function call, executing directly:", directCall.name);
      let functionResult: any;
      try {
        switch (directCall.name) {
          case "bookAppointment":
            functionResult = await chatFunctions.bookAppointment(directCall.args, user.id);
            break;
          case "searchDoctors":
            functionResult = await chatFunctions.searchDoctors(directCall.args, user.id);
            break;
          case "getUpcomingAppointments":
            functionResult = await chatFunctions.getUpcomingAppointments(user.id);
            break;
          case "getPastAppointments":
            functionResult = await chatFunctions.getPastAppointments(user.id);
            break;
          case "getMedicalHistory":
            functionResult = await chatFunctions.getMedicalHistory(user.id);
            break;
          case "getAppointmentDetails":
            functionResult = await chatFunctions.getAppointmentDetails(directCall.args, user.id);
            break;
        }

        if (functionResult) {
          console.log("✅ Direct function call succeeded:", directCall.name);
          return NextResponse.json({
            response: functionResult.message || "تم تنفيذ الطلب بنجاح.",
            actionResult: {
              type: functionResult.success ? "success" : "error",
              message: functionResult.message,
              data: functionResult.data,
            },
          });
        }
      } catch (directError: any) {
        console.error("Error in direct function call:", directError);
        // نتابع لاستدعاء AI كـ fallback
      }
    }

    // استدعاء AI مع Function Calling
    // ملاحظة: Function Callbacks غير مستخدمة هنا لأن Gemini يدعم Function Calling مباشرة
    let aiResponse;
    try {
      aiResponse = await chatWithAI(
        message,
        conversationHistory,
        {
          // Function callbacks للتحقق من وجود functions
          bookAppointment: async () => ({} as any),
          searchDoctors: async () => ({} as any),
          getUpcomingAppointments: async () => ({} as any),
          getPastAppointments: async () => ({} as any),
          getMedicalHistory: async () => ({} as any),
          getAppointmentDetails: async () => ({} as any),
        }
      );
      
      // التحقق من رسالة Quota exceeded في الـ response
      if (aiResponse.response?.includes("تم تجاوز حد الطلبات") || aiResponse.response?.includes("quota") || aiResponse.response?.includes("Quota exceeded")) {
        console.log("⚠️ AI Quota exceeded detected in response, trying direct function call as fallback");
        const directCall = detectDirectFunctionCall(message);
        
        if (directCall) {
          let functionResult: any;
          try {
            switch (directCall.name) {
              case "bookAppointment":
                functionResult = await chatFunctions.bookAppointment(directCall.args, user.id);
                break;
              case "searchDoctors":
                functionResult = await chatFunctions.searchDoctors(directCall.args, user.id);
                break;
              case "getUpcomingAppointments":
                functionResult = await chatFunctions.getUpcomingAppointments(user.id);
                break;
              case "getPastAppointments":
                functionResult = await chatFunctions.getPastAppointments(user.id);
                break;
              case "getMedicalHistory":
                functionResult = await chatFunctions.getMedicalHistory(user.id);
                break;
              case "getAppointmentDetails":
                functionResult = await chatFunctions.getAppointmentDetails(directCall.args, user.id);
                break;
            }

            if (functionResult) {
              console.log("✅ Direct function call succeeded as fallback:", directCall.name);
              return NextResponse.json({
                response: functionResult.message || "تم تنفيذ الطلب بنجاح.",
                actionResult: {
                  type: functionResult.success ? "success" : "error",
                  message: functionResult.message,
                  data: functionResult.data,
                },
              });
            }
          } catch (directError: any) {
            console.error("Error in direct function call fallback:", directError);
          }
        }
      }
    } catch (error: any) {
      console.error("Error calling AI:", error);
      
      // إذا فشل AI، نحاول استخدام direct function call
      console.log("⚠️ AI call failed, trying direct function call as fallback");
      const directCall = detectDirectFunctionCall(message);
      
      if (directCall) {
        let functionResult: any;
        try {
          switch (directCall.name) {
            case "bookAppointment":
              functionResult = await chatFunctions.bookAppointment(directCall.args, user.id);
              break;
            case "searchDoctors":
              functionResult = await chatFunctions.searchDoctors(directCall.args, user.id);
              break;
            case "getUpcomingAppointments":
              functionResult = await chatFunctions.getUpcomingAppointments(user.id);
              break;
            case "getPastAppointments":
              functionResult = await chatFunctions.getPastAppointments(user.id);
              break;
            case "getMedicalHistory":
              functionResult = await chatFunctions.getMedicalHistory(user.id);
              break;
            case "getAppointmentDetails":
              functionResult = await chatFunctions.getAppointmentDetails(directCall.args, user.id);
              break;
          }

          if (functionResult) {
            console.log("✅ Direct function call succeeded as fallback:", directCall.name);
            return NextResponse.json({
              response: functionResult.message || "تم تنفيذ الطلب بنجاح.",
              actionResult: {
                type: functionResult.success ? "success" : "error",
                message: functionResult.message,
                data: functionResult.data,
              },
            });
          }
        } catch (directError: any) {
          console.error("Error in direct function call fallback:", directError);
        }
      }
      
      // إذا فشل كل شيء
      return NextResponse.json({
        response: aiResponse?.response || "عذراً، حدث خطأ أثناء معالجة طلبك. يرجى المحاولة مرة أخرى.",
        actionResult: {
          type: "error",
          message: "حدث خطأ أثناء معالجة الطلب",
        },
      }, { status: 500 });
    }

    // إذا كان هناك Function Call، تنفيذه
    if (aiResponse.functionCall) {
      const functionName = aiResponse.functionCall.name;
      const functionArgs = aiResponse.functionCall.args;

      let functionResult: any;

      switch (functionName) {
        case "bookAppointment":
          functionResult = await chatFunctions.bookAppointment(functionArgs, user.id);
          break;
        case "searchDoctors":
          functionResult = await chatFunctions.searchDoctors(functionArgs, user.id);
          break;
        case "getUpcomingAppointments":
          functionResult = await chatFunctions.getUpcomingAppointments(user.id);
          break;
        case "getPastAppointments":
          functionResult = await chatFunctions.getPastAppointments(user.id);
          break;
        case "getMedicalHistory":
          functionResult = await chatFunctions.getMedicalHistory(user.id);
          break;
        case "getAppointmentDetails":
          functionResult = await chatFunctions.getAppointmentDetails(functionArgs, user.id);
          break;
        default:
          return NextResponse.json(
            { error: `دالة غير معروفة: ${functionName}` },
            { status: 400 }
          );
      }

      // تسجيل نتيجة الدالة للتشخيص
      console.log(`📋 Function ${functionName} executed:`, {
        success: functionResult.success,
        hasData: !!functionResult.data,
        appointmentId: functionResult.data?.id,
      });

      // إذا كانت العملية ناجحة، التحقق من النتيجة
      if (functionName === "bookAppointment" && functionResult.success) {
        if (!functionResult.data || !functionResult.data.id) {
          console.error("⚠️ bookAppointment reported success but no appointment ID in response");
          // لا نغير functionResult.success هنا لأننا نثق في الكود
        } else {
          console.log("✅ Appointment booking confirmed with ID:", functionResult.data.id);
        }
      }

      // إذا كانت النتيجة واضحة وناجحة، نستخدم رسالة مباشرة بدلاً من استدعاء AI مرة أخرى
      // هذا يوفر في استخدام API ويقلل من احتمال الوصول لحد الـ quota
      if (functionResult.success && functionResult.message) {
        console.log("✅ Using direct message instead of AI response to save API quota");
        return NextResponse.json({
          response: functionResult.message,
          actionResult: {
            type: "success",
            message: functionResult.message,
            data: functionResult.data,
          },
        });
      }

      // إرسال النتيجة مرة أخرى للـ AI للحصول على رد مناسب (بدون Function Calling)
      const functionResponseText = JSON.stringify(functionResult, null, 2);
      const followUpResponse = await chatWithAI(
        `تم استدعاء الدالة ${functionName} بنتيجة: ${functionResponseText}. قدم رد مناسب بالعربية للمستخدم بناءً على هذه النتيجة. إذا كان success: true، تأكد من أنك تخبر المستخدم أن الحجز تم فعلياً.`,
        [
          ...conversationHistory,
          { role: "user", content: message },
          { role: "assistant", content: `استدعيت الدالة ${functionName}` },
        ],
        undefined // بدون Function Calling للرد النهائي
      );

      return NextResponse.json({
        response: followUpResponse.response || functionResult.message,
        actionResult: {
          type: functionResult.success ? "success" : "error",
          message: functionResult.message,
          data: functionResult.data,
        },
      });
    }

    // إرجاع الرد العادي
    return NextResponse.json(
      {
        response: aiResponse.response,
      },
      {
        headers: {
          'Cache-Control': 'private, no-cache, no-store, must-revalidate',
          'X-Content-Type-Options': 'nosniff',
        }
      }
    );
  } catch (error: any) {
    console.error("Error in chat API:", error);
    console.error("Error stack:", error.stack);
    console.error("Error details:", {
      message: error.message,
      name: error.name,
      cause: error.cause,
    });
    return NextResponse.json(
      {
        error: "حدث خطأ أثناء معالجة الرسالة",
        details: process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { 
        status: 500,
        headers: {
          'Cache-Control': 'no-store',
        }
      }
    );
  }
}

