import { NextRequest, NextResponse } from "next/server"
import { analyzeSymptoms } from "@/lib/ai/gemini"
import { findBestMatchingDoctors } from "@/lib/doctors"

export async function POST(request: NextRequest) {
  try {
    const { symptoms } = await request.json()
    
    if (!symptoms || typeof symptoms !== 'string' || symptoms.trim().length < 10) {
      return NextResponse.json(
        { error: "يرجى تقديم وصف مفصل لأعراضك (10 أحرف على الأقل)" },
        { status: 400 }
      )
    }
    
    console.log('Analyzing symptoms:', symptoms.substring(0, 100) + '...')
    
    // تحليل الأعراض باستخدام Gemini AI
    let assessment
    try {
      assessment = await analyzeSymptoms(symptoms.trim())
      console.log('✅ Assessment received:', {
        conditionsCount: assessment.conditions?.length || 0,
        specialties: assessment.recommendedSpecialties,
        hasNotes: !!assessment.notes
      })
    } catch (analysisError: any) {
      console.error('❌ Analysis failed:', analysisError)
      
      // تحديد نوع الخطأ وإرجاع رسالة مناسبة
      let errorMessage = analysisError?.message || "حدث خطأ في تحليل الأعراض. يرجى المحاولة مرة أخرى."
      
      // إذا كان الخطأ متعلق بـ API key، أعط رسالة أوضح
      if (errorMessage.includes('API key') || errorMessage.includes('مفتاح API')) {
        errorMessage = "مفتاح API منتهي الصلاحية أو غير صالح. يرجى التحقق من GOOGLE_GEMINI_API_KEY في ملف .env.local وتحديثه إذا لزم الأمر."
      }
      
      return NextResponse.json(
        { 
          error: errorMessage,
          details: process.env.NODE_ENV === 'development' ? {
            message: analysisError?.message,
            stack: analysisError?.stack,
            hint: "تحقق من أن GOOGLE_GEMINI_API_KEY موجود وصالح في ملف .env.local"
          } : undefined
        },
        { status: 500 }
      )
    }
    
    // التأكد من أن assessment يحتوي على البيانات المطلوبة
    if (!assessment || !assessment.conditions || !Array.isArray(assessment.conditions)) {
      console.error('Invalid assessment structure:', assessment)
      return NextResponse.json(
        { error: "حدث خطأ في تنسيق نتائج التحليل" },
        { status: 500 }
      )
    }
    
    // مطابقة الأطباء بناءً على التخصصات المقترحة من قاعدة البيانات
    const doctors = await findBestMatchingDoctors(assessment.recommendedSpecialties || ['general-psychiatry'])
    console.log('Doctors found:', doctors.length)
    
    return NextResponse.json({
      success: true,
      assessment,
      doctors
    })
    
  } catch (error: any) {
    console.error("Error in analyze-symptoms API:", error)
    
    // إرجاع خطأ أكثر تفصيلاً في وضع التطوير
    const errorMessage = error?.message || "حدث خطأ في تحليل الأعراض"
    
    return NextResponse.json(
      { 
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? {
          message: error?.message,
          stack: error?.stack
        } : undefined
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json(
    { message: "Use POST method to analyze symptoms" },
    { status: 405 }
  )
}
