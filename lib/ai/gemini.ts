import { GoogleGenerativeAI } from "@google/generative-ai"
import { SYMPTOM_ANALYSIS_PROMPT } from "./prompts"
import type { AssessmentResult } from "@/types/assessment"

// Validate API key exists
if (!process.env.GOOGLE_GEMINI_API_KEY) {
  console.warn("Warning: GOOGLE_GEMINI_API_KEY is not set. Symptom analysis will use fallback responses.")
}

const getGenAI = () => {
  const apiKey = process.env.GOOGLE_GEMINI_API_KEY
  if (!apiKey) {
    throw new Error("GOOGLE_GEMINI_API_KEY is not configured. Please set it in your .env.local file.")
  }
  return new GoogleGenerativeAI(apiKey)
}

export async function analyzeSymptoms(symptoms: string): Promise<AssessmentResult> {
  try {
    // Check if API key is available
    if (!process.env.GOOGLE_GEMINI_API_KEY) {
      throw new Error("Gemini API key is not configured")
    }

    const genAI = getGenAI()
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" })
    
    const prompt = SYMPTOM_ANALYSIS_PROMPT.replace("{symptoms}", symptoms)
    
    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()
    
    // تنظيف النص من markdown إذا كان موجود
    const cleanText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    
    // تحليل JSON
    const parsed = JSON.parse(cleanText)
    
    // التحقق من صحة البيانات
    if (!parsed.conditions || !Array.isArray(parsed.conditions)) {
      throw new Error("Invalid response format")
    }
    
    // التأكد من أن الاحتمالات صحيحة
    parsed.conditions = parsed.conditions.map((condition: any) => ({
      ...condition,
      probability: Math.min(Math.max(condition.probability || 0, 0), 100)
    }))
    
    return {
      conditions: parsed.conditions,
      recommendedSpecialties: parsed.recommendedSpecialties || [],
      notes: parsed.notes || ""
    }
    
  } catch (error) {
    console.error("Error analyzing symptoms:", error)
    
    // في حالة الخطأ، إرجاع نتيجة افتراضية
    return {
      conditions: [{
        name: "تقييم أولي",
        nameEn: "Initial Assessment",
        probability: 50,
        severity: "mild",
        description: "يُنصح بمراجعة طبيب نفسي للتقييم الدقيق"
      }],
      recommendedSpecialties: ["general-psychiatry"],
      notes: "حدث خطأ في التحليل. يُنصح بمراجعة طبيب نفسي للتقييم الدقيق."
    }
  }
}

export async function testGeminiConnection(): Promise<boolean> {
  try {
    if (!process.env.GOOGLE_GEMINI_API_KEY) {
      return false
    }
    const genAI = getGenAI()
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" })
    const result = await model.generateContent("Hello")
    return !!result.response
  } catch (error) {
    console.error("Gemini connection test failed:", error)
    return false
  }
}
