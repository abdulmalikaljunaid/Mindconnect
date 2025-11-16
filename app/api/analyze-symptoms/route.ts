import { NextRequest, NextResponse } from "next/server"
import { analyzeSymptoms } from "@/lib/ai/gemini"
import { findBestMatchingDoctors } from "@/lib/doctors"

export const maxDuration = 30; // Maximum execution time for Vercel

export async function POST(request: NextRequest) {
  const timeout = 35000; // 35 ثانية timeout (أقل من maxDuration)
  
  try {
    const { symptoms } = await request.json()
    
    if (!symptoms || typeof symptoms !== 'string' || symptoms.trim().length < 10) {
      return NextResponse.json(
        { error: "يرجى تقديم وصف مفصل لأعراضك (10 أحرف على الأقل)" },
        { status: 400 }
      )
    }
    
    // تحليل الأعراض باستخدام Gemini AI مع timeout
    const assessmentPromise = analyzeSymptoms(symptoms.trim())
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error("انتهت مهلة التحليل. يرجى المحاولة مرة أخرى.")), timeout)
    )
    
    const assessment = await Promise.race([assessmentPromise, timeoutPromise]) as any
    
    // مطابقة الأطباء بناءً على التخصصات المقترحة من قاعدة البيانات
    const doctors = await findBestMatchingDoctors(assessment.recommendedSpecialties)
    
    // إضافة caching headers للاستجابة
    return NextResponse.json(
      {
        success: true,
        assessment,
        doctors
      },
      {
        headers: {
          'Cache-Control': 'private, no-cache, no-store, must-revalidate',
          'X-Content-Type-Options': 'nosniff',
        }
      }
    )
    
  } catch (error: any) {
    console.error("Error in analyze-symptoms API:", error)
    
    // عرض رسالة الخطأ الفعلية إذا كانت متوفرة
    const errorMessage = error?.message || "حدث خطأ في تحليل الأعراض. يرجى المحاولة مرة أخرى."
    
    return NextResponse.json(
      { 
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? {
          message: error?.message,
          stack: error?.stack,
          name: error?.name
        } : undefined
      },
      { 
        status: 500,
        headers: {
          'Cache-Control': 'no-store',
        }
      }
    )
  }
}

export async function GET() {
  return NextResponse.json(
    { message: "Use POST method to analyze symptoms" },
    { status: 405 }
  )
}
