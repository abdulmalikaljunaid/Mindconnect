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
  // Check if API key is available
  if (!process.env.GOOGLE_GEMINI_API_KEY) {
    console.error("❌ GOOGLE_GEMINI_API_KEY is not configured")
    throw new Error("Gemini API key is not configured. Please set GOOGLE_GEMINI_API_KEY in your .env.local file.")
  }

  try {
    const genAI = getGenAI()
    
    // استخدام نموذج صالح - حاول عدة نماذج
    let model
    let text = ""
    
    const modelNames = ["gemini-2.0-flash-exp", "gemini-1.5-flash", "gemini-pro"]
    
    for (const modelName of modelNames) {
      try {
        console.log(`Attempting to use model: ${modelName}`)
        model = genAI.getGenerativeModel({ model: modelName })
        const prompt = SYMPTOM_ANALYSIS_PROMPT.replace("{symptoms}", symptoms)
        const result = await model.generateContent(prompt)
        const response = await result.response
        text = response.text()
        console.log(`✅ Successfully got response from ${modelName}`)
        break
      } catch (modelError: any) {
        console.warn(`⚠️ Model ${modelName} failed:`, modelError?.message)
        if (modelNames.indexOf(modelName) === modelNames.length - 1) {
          // آخر نموذج فشل، ارمي الخطأ
          throw modelError
        }
        // جرب النموذج التالي
        continue
      }
    }
    
    if (!text || text.trim().length === 0) {
      throw new Error("Empty response from Gemini API")
    }
    
    console.log("Raw response length:", text.length)
    console.log("Raw response preview:", text.substring(0, 200))
    
    // تنظيف النص من markdown إذا كان موجود
    let cleanText = text
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .replace(/^[\s\S]*?(\{[\s\S]*\})[\s\S]*$/, '$1') // استخرج JSON من النص
      .trim()
    
    // إذا لم نجد JSON، حاول البحث عن أول { وآخر }
    if (!cleanText.startsWith('{')) {
      const jsonStart = cleanText.indexOf('{')
      const jsonEnd = cleanText.lastIndexOf('}') + 1
      if (jsonStart !== -1 && jsonEnd > jsonStart) {
        cleanText = cleanText.substring(jsonStart, jsonEnd)
      }
    }
    
    console.log("Cleaned JSON preview:", cleanText.substring(0, 300))
    
    // تحليل JSON
    let parsed
    try {
      parsed = JSON.parse(cleanText)
    } catch (parseError: any) {
      console.error("❌ JSON Parse Error:", parseError.message)
      console.error("Failed to parse text:", cleanText.substring(0, 500))
      throw new Error(`Failed to parse JSON response: ${parseError.message}`)
    }
    
    // التحقق من صحة البيانات
    if (!parsed.conditions || !Array.isArray(parsed.conditions)) {
      console.error("❌ Invalid response format - missing conditions array")
      console.error("Parsed data:", JSON.stringify(parsed, null, 2))
      throw new Error("Invalid response format: missing or invalid conditions array")
    }
    
    if (parsed.conditions.length === 0) {
      console.warn("⚠️ Empty conditions array")
      throw new Error("No conditions found in assessment")
    }
    
    // التأكد من أن الاحتمالات صحيحة
    parsed.conditions = parsed.conditions.map((condition: any) => ({
      ...condition,
      probability: Math.min(Math.max(condition.probability || 0, 0), 100)
    }))
    
    // التأكد من وجود recommendedSpecialties
    if (!parsed.recommendedSpecialties || !Array.isArray(parsed.recommendedSpecialties)) {
      console.warn("⚠️ Missing recommendedSpecialties, using default")
      parsed.recommendedSpecialties = ["general-psychiatry"]
    }
    
    console.log("✅ Successfully parsed assessment:", {
      conditionsCount: parsed.conditions.length,
      specialties: parsed.recommendedSpecialties
    })
    
    return {
      conditions: parsed.conditions,
      recommendedSpecialties: parsed.recommendedSpecialties || [],
      notes: parsed.notes || ""
    }
    
  } catch (error: any) {
    console.error("❌ Error analyzing symptoms:", error)
    console.error("Error details:", {
      message: error?.message,
      stack: error?.stack,
      name: error?.name
    })
    
    // معالجة أخطاء API key بشكل خاص
    const errorMessage = error?.message || ''
    if (errorMessage.includes('API key') || errorMessage.includes('API_KEY')) {
      throw new Error('مفتاح API منتهي الصلاحية أو غير صالح. يرجى تحديث GOOGLE_GEMINI_API_KEY في ملف .env.local')
    }
    
    // معالجة أخطاء النموذج
    if (errorMessage.includes('model') || errorMessage.includes('Model')) {
      throw new Error('النموذج غير متاح حالياً. يرجى المحاولة لاحقاً')
    }
    
    // لا نعيد fallback تلقائياً - ارمي الخطأ لأعلى ليتم معالجته في API route
    throw new Error(`فشل تحليل الأعراض: ${errorMessage || 'خطأ غير معروف'}`)
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
