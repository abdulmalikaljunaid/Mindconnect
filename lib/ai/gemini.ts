import { GoogleGenerativeAI } from "@google/generative-ai"
import { SYMPTOM_ANALYSIS_PROMPT } from "./prompts"
import { CHAT_SYSTEM_PROMPT, CHAT_FUNCTIONS_SCHEMA } from "./chat-prompts"
import type { AssessmentResult } from "@/types/assessment"

// Validate API key exists
if (!process.env.GOOGLE_GEMINI_API_KEY) {
  console.warn("Warning: GOOGLE_GEMINI_API_KEY is not set. Symptom analysis will use fallback responses.")
}

// Singleton instance for connection pooling
let genAIInstance: GoogleGenerativeAI | null = null

const getGenAI = () => {
  const apiKey = process.env.GOOGLE_GEMINI_API_KEY
  if (!apiKey) {
    throw new Error("GOOGLE_GEMINI_API_KEY is not configured. Please set it in your .env.local file.")
  }
  // Reuse instance for better performance (connection pooling)
  if (!genAIInstance) {
    genAIInstance = new GoogleGenerativeAI(apiKey)
  }
  return genAIInstance
}

export async function analyzeSymptoms(symptoms: string): Promise<AssessmentResult> {
  const API_TIMEOUT = 30000; // تقليل timeout إلى 30 ثانية للأداء الأفضل
  
  try {
    // Check if API key is available
    if (!process.env.GOOGLE_GEMINI_API_KEY) {
      throw new Error("Gemini API key is not configured")
    }

    const genAI = getGenAI()
    
    // Retry logic للتعامل مع 429 errors (Quota exceeded)
    let result;
    // استخدام نماذج 2.0 و 2.5 المجانية فقط - لا استخدام 1.5 (متوقفة)
    // ترتيب حسب الأفضلية: الأحدث والأسرع أولاً
    const models = [
      "gemini-2.5-flash-exp",     // النموذج الأحدث والأسرع
      "gemini-2.5-flash",          // نموذج 2.5 المستقر
      "gemini-2.0-flash-exp",      // نموذج 2.0 التجريبي
      "gemini-2.0-flash",          // نموذج 2.0 المستقر
    ]; 
    let currentModelIndex = 0;
    
    while (currentModelIndex < models.length) {
      try {
        const model = genAI.getGenerativeModel({ 
          model: models[currentModelIndex],
          generationConfig: {
            temperature: 0.7,
            topP: 0.8,
            topK: 40,
          }
        })
        const prompt = SYMPTOM_ANALYSIS_PROMPT.replace("{symptoms}", symptoms)
        
        // إضافة timeout لكل محاولة
        const generatePromise = model.generateContent(prompt)
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error(`Timeout: ${models[currentModelIndex]} took too long`)), API_TIMEOUT)
        )
        
        result = await Promise.race([generatePromise, timeoutPromise]) as any
        break; // نجح، نخرج من الـ loop
      } catch (error: any) {
        // التحقق من 429 error (Quota exceeded) أو 404 (Model not found)
        if (error?.message?.includes("429") || error?.message?.includes("quota") || error?.message?.includes("Quota exceeded") || 
            error?.message?.includes("404") || error?.message?.includes("Not Found") || error?.message?.includes("not found")) {
          // عند أي خطأ (quota أو model not found)، جرب النموذج التالي مباشرة
          currentModelIndex++;
          if (currentModelIndex < models.length) {
            continue;
          } else {
            // فشلت جميع النماذج
            if (error?.message?.includes("429") || error?.message?.includes("quota")) {
              throw new Error("تم تجاوز حد الطلبات اليومي لخدمة AI. يرجى المحاولة لاحقاً أو ترقية خطة الاشتراك.");
            } else {
              throw new Error("لا تتوفر نماذج AI متاحة حالياً. يرجى المحاولة لاحقاً.");
            }
          }
        } else if (error?.message?.includes("Timeout")) {
          // timeout error - جرب نموذج آخر
          currentModelIndex++;
          if (currentModelIndex < models.length) {
            continue;
          } else {
            throw new Error("انتهت مهلة التحليل. يرجى المحاولة مرة أخرى.");
          }
        } else {
          // خطأ آخر، نرميه مباشرة
          throw error;
        }
      }
    }
    
    if (!result) {
      throw new Error("فشل في الحصول على رد من خدمة AI بعد عدة محاولات");
    }
    
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
    
  } catch (error: any) {
    console.error("Error analyzing symptoms:", error)
    
    // إرجاع خطأ واضح بدلاً من fallback صامت
    // إذا كان الخطأ بسبب API key، أظهر رسالة واضحة
    if (error?.message?.includes("API key") || error?.message?.includes("GOOGLE_GEMINI_API_KEY")) {
      throw new Error("مفتاح API الخاص بـ Gemini غير مضبوط. يرجى التحقق من إعدادات البيئة.")
    }
    
    // إذا كان الخطأ بسبب Quota exceeded
    if (error?.message?.includes("429") || error?.message?.includes("quota") || error?.message?.includes("Quota exceeded") || error?.message?.includes("حد الطلبات")) {
      throw new Error("تم تجاوز حد الطلبات اليومي لخدمة AI. يرجى المحاولة بعد بضع ساعات أو ترقية خطة الاشتراك للحصول على حد أعلى.")
    }
    
    // إذا كان الخطأ في parsing JSON، حاول مرة أخرى بدون markdown
    if (error?.message?.includes("JSON") || error?.message?.includes("parse")) {
      throw new Error("حدث خطأ في تحليل نتيجة AI. يرجى المحاولة مرة أخرى.")
    }
    
    // في حالة الخطأ العام، أظهر الخطأ الفعلي للمطورين
    const errorMessage = process.env.NODE_ENV === 'development' 
      ? `خطأ في التحليل: ${error?.message || "خطأ غير معروف"}` 
      : "حدث خطأ في تحليل الأعراض. يرجى المحاولة مرة أخرى أو التواصل مع الدعم."
    
    throw new Error(errorMessage)
  }
}

export async function chatWithAI(
  message: string,
  conversationHistory: Array<{ role: string; content: string }>,
  functionCallbacks?: Record<string, (params: any) => Promise<any>>
): Promise<{
  response: string;
  functionCall?: {
    name: string;
    args: any;
  };
}> {
  try {
    if (!process.env.GOOGLE_GEMINI_API_KEY) {
      throw new Error("Gemini API key is not configured")
    }

    const genAI = getGenAI()
    
    // إعداد الأدوات (Tools) إذا كانت متوفرة
    // تحويل CHAT_FUNCTIONS_SCHEMA إلى الصيغة الصحيحة للـ SDK
    const tools = functionCallbacks ? [{
      functionDeclarations: CHAT_FUNCTIONS_SCHEMA.map(func => ({
        name: func.name,
        description: func.description,
        parameters: func.parameters as any, // Type assertion لـ JSON Schema
      }))
    }] : undefined

    // استخدام نموذج 2.0 أو 2.5 - الأحدث والأسرع
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash-exp",
      tools: tools as any, // Type assertion للتأكد من التوافق
      generationConfig: {
        temperature: 0.7,
        topP: 0.8,
        topK: 40,
      }
    })

    // بناء تاريخ المحادثة (أخر 10 رسائل لتجنب تجاوز الحد)
    // مهم: يجب أن يبدأ التاريخ برسالة من user، وليس model
    const history = conversationHistory
      .slice(-10)
      .filter((msg, index, arr) => {
        // إذا كانت هذه أول رسالة وكانت من model، نتخطاها
        if (index === 0 && msg.role !== "user") {
          return false
        }
        return true
      })
      .map(msg => ({
        role: msg.role === "user" ? "user" : "model",
        parts: [{ text: msg.content }],
      }))

    // إعداد المحادثة
    // systemInstruction يجب أن يكون في صيغة Content object وليس نصاً مباشراً
    const chatConfig: any = {
      systemInstruction: {
        parts: [{ text: CHAT_SYSTEM_PROMPT }],
        role: "user",
      },
    }
    
    // إضافة history فقط إذا كان صالحاً ويبدأ بـ user
    if (history.length > 0 && history[0].role === "user") {
      chatConfig.history = history
    }

    const chat = model.startChat(chatConfig)

    // Retry logic للتعامل مع 429 errors - تقليل المحاولات للأداء الأفضل
    let result;
    let retries = 0;
    const maxRetries = 2; // تقليل المحاولات
    
    while (retries <= maxRetries) {
      try {
        result = await chat.sendMessage(message);
        break; // نجح، نخرج من الـ loop
      } catch (error: any) {
        // التحقق من 429 error (Quota exceeded)
        if (error?.message?.includes("429") || error?.message?.includes("quota") || error?.message?.includes("Quota exceeded")) {
          if (retries < maxRetries) {
            // استخراج وقت الانتظار من الـ error إذا كان متوفراً
            let waitTime = 3000; // تقليل وقت الانتظار إلى 3 ثوانٍ
            try {
              const retryMatch = error.message.match(/retry.*?(\d+(?:\.\d+)?)\s*s/i);
              if (retryMatch) {
                waitTime = Math.min(parseFloat(retryMatch[1]) * 1000, 5000); // حد أقصى 5 ثوانٍ
              }
            } catch {}
            
            await new Promise(resolve => setTimeout(resolve, waitTime));
            retries++;
            continue;
          } else {
            // فشلت جميع المحاولات
            throw new Error("تم تجاوز حد الطلبات اليومي لخدمة AI. يرجى المحاولة لاحقاً أو ترقية خطة الاشتراك.");
          }
        } else {
          // خطأ آخر، نرميه مباشرة
          throw error;
        }
      }
    }

    if (!result) {
      throw new Error("فشل في الحصول على رد من خدمة AI بعد عدة محاولات");
    }

    const response = await result.response

    // التحقق من وجود Function Call في Gemini
    try {
      // في Gemini SDK، Function Calls موجودة في response.candidates[0].content.parts
      const candidates = response.candidates
      if (candidates && candidates.length > 0) {
        const candidate = candidates[0]
        if (candidate.content && candidate.content.parts) {
          for (const part of candidate.content.parts) {
            // البحث عن FunctionCall في parts
            if (part.functionCall) {
              const functionCall = part.functionCall
              
              if (functionCall.name) {
                // تحويل args إلى object إذا كان string
                let args = functionCall.args || {}
                if (typeof args === "string") {
                  try {
                    args = JSON.parse(args)
                  } catch {
                    args = {}
                  }
                }
                
                return {
                  response: "",
                  functionCall: {
                    name: functionCall.name,
                    args: args,
                  },
                }
              }
            }
          }
        }
      }
      
      // محاولة أخرى: استخدام method functionCalls() إذا كان متاحاً
      if (response && typeof (response as any).functionCalls === 'function') {
        const functionCalls = (response as any).functionCalls()
        if (functionCalls && Array.isArray(functionCalls) && functionCalls.length > 0) {
          const functionCall = functionCalls[0]
          
          if (functionCall && functionCall.name) {
            let args = functionCall.args || {}
            if (typeof args === "string") {
              try {
                args = JSON.parse(args)
              } catch {
                args = {}
              }
            }
            
            return {
              response: "",
              functionCall: {
                name: functionCall.name,
                args: args,
              },
            }
          }
        }
      }
    } catch (e: any) {
      // إذا لم تكن Function Calls متاحة، نتابع للرد النصي
      console.log("Function calls check error (will use text response):", e?.message || e)
    }

    // إرجاع رد نصي عادي
    let text = ""
    try {
      text = response.text()
    } catch (e: any) {
      console.error("Error getting text response:", e)
      text = "عذراً، لم أتمكن من الحصول على رد. يرجى المحاولة مرة أخرى."
    }
    
    return {
      response: text || "عذراً، لم أتمكن من الحصول على رد.",
    }
  } catch (error: any) {
    console.error("Error in chatWithAI:", error)
    console.error("Error details:", {
      message: error?.message,
      name: error?.name,
      stack: error?.stack,
      cause: error?.cause,
    })
    
    // معالجة خاصة لأخطاء Quota
    if (error?.message?.includes("429") || error?.message?.includes("quota") || error?.message?.includes("Quota exceeded") || error?.message?.includes("حد الطلبات")) {
      return {
        response: "عذراً، تم تجاوز حد الطلبات اليومي لخدمة AI. يرجى المحاولة بعد بضع ساعات أو ترقية خطة الاشتراك للحصول على حد أعلى.",
      }
    }
    
    // إرجاع رسالة خطأ واضحة بدلاً من throw
    return {
      response: `عذراً، حدث خطأ أثناء الاتصال بخدمة AI. ${error?.message || "يرجى المحاولة مرة أخرى لاحقاً."}`,
    }
  }
}

export async function testGeminiConnection(): Promise<boolean> {
  try {
    if (!process.env.GOOGLE_GEMINI_API_KEY) {
      return false
    }
    const genAI = getGenAI()
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-exp" })
    // استخدام timeout للاختبار
    const testPromise = model.generateContent("Hello")
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error("Test timeout")), 10000)
    )
    const result = await Promise.race([testPromise, timeoutPromise]) as any
    return !!result?.response
  } catch (error) {
    console.error("Gemini connection test failed:", error)
    return false
  }
}
