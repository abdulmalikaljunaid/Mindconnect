import { NextRequest, NextResponse } from "next/server"
import { analyzeSymptoms } from "@/lib/ai/gemini"
import { matchDoctors } from "@/lib/doctors"

export async function POST(request: NextRequest) {
  try {
    const { symptoms } = await request.json()
    
    if (!symptoms || typeof symptoms !== 'string' || symptoms.trim().length < 10) {
      return NextResponse.json(
        { error: "يرجى تقديم وصف مفصل لأعراضك (10 أحرف على الأقل)" },
        { status: 400 }
      )
    }
    
    // تحليل الأعراض باستخدام Gemini AI
    const assessment = await analyzeSymptoms(symptoms.trim())
    
    // مطابقة الأطباء بناءً على التخصصات المقترحة
    const doctors = matchDoctors(assessment.recommendedSpecialties)
    
    return NextResponse.json({
      success: true,
      assessment,
      doctors
    })
    
  } catch (error) {
    console.error("Error in analyze-symptoms API:", error)
    
    return NextResponse.json(
      { 
        error: "حدث خطأ في تحليل الأعراض. يرجى المحاولة مرة أخرى.",
        details: process.env.NODE_ENV === 'development' ? error : undefined
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
