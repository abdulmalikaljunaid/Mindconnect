"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useToast } from "@/hooks/use-toast"

interface UseVoiceRecognitionResult {
  transcript: string
  isRecording: boolean
  isPaused: boolean
  isSupported: boolean
  error: string | null
  timeRemaining: number // بالثواني
  startRecording: () => void
  stopRecording: () => void
  pauseRecording: () => void
  resumeRecording: () => void
  clearTranscript: () => void
}

const MAX_RECORDING_TIME = 300 // 5 دقائق بالثواني

export function useVoiceRecognition(): UseVoiceRecognitionResult {
  const [transcript, setTranscript] = useState("")
  const [isRecording, setIsRecording] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [isSupported, setIsSupported] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [timeRemaining, setTimeRemaining] = useState(MAX_RECORDING_TIME)
  
  const recognitionRef = useRef<any>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const { toast } = useToast()

  // التحقق من دعم المتصفح
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      setIsSupported(!!SpeechRecognition)
      
      if (SpeechRecognition && !recognitionRef.current) {
        const recognition = new SpeechRecognition()
        recognition.continuous = true
        recognition.interimResults = true
        recognition.lang = "ar-SA" // اللغة العربية
        recognition.maxAlternatives = 1

        // معالجة النتائج
        recognition.onresult = (event: any) => {
          let interimTranscript = ""
          let finalTranscript = ""

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcriptPiece = event.results[i][0].transcript
            if (event.results[i].isFinal) {
              finalTranscript += transcriptPiece + " "
            } else {
              interimTranscript += transcriptPiece
            }
          }

          if (finalTranscript) {
            setTranscript((prev) => prev + finalTranscript)
          }
        }

        // معالجة الأخطاء
        recognition.onerror = (event: any) => {
          console.error("Speech recognition error:", event.error)
          
          let errorMessage = ""
          switch (event.error) {
            case "not-allowed":
            case "permission-denied":
              errorMessage = "تم رفض إذن الوصول إلى الميكروفون. يرجى السماح بالوصول من إعدادات المتصفح."
              break
            case "no-speech":
              errorMessage = "لم يتم اكتشاف صوت. يرجى التحدث بوضوح."
              break
            case "network":
              errorMessage = "خطأ في الاتصال بالشبكة. يرجى التحقق من اتصالك بالإنترنت."
              break
            case "audio-capture":
              errorMessage = "لم يتم العثور على ميكروفون. يرجى التحقق من توصيل الميكروفون."
              break
            default:
              errorMessage = "حدث خطأ أثناء التسجيل. يرجى المحاولة مرة أخرى."
          }
          
          setError(errorMessage)
          setIsRecording(false)
          setIsPaused(false)
          
          toast({
            title: "خطأ في التسجيل",
            description: errorMessage,
            variant: "destructive",
          })
        }

        // عند انتهاء التسجيل
        recognition.onend = () => {
          if (isRecording && !isPaused) {
            // إعادة التشغيل إذا لم يكن متوقفاً يدوياً
            try {
              recognition.start()
            } catch (err) {
              // تجاهل الخطأ إذا كان التسجيل قد توقف
            }
          }
        }

        recognitionRef.current = recognition
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [isRecording, isPaused, toast])

  // إدارة العداد الزمني
  useEffect(() => {
    if (isRecording && !isPaused) {
      timerRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          const newTime = prev - 1
          
          // تحذير عند دقيقة واحدة متبقية
          if (newTime === 60) {
            toast({
              title: "تنبيه",
              description: "دقيقة واحدة متبقية على انتهاء التسجيل",
              variant: "default",
            })
          }
          
          // إيقاف التسجيل عند انتهاء الوقت
          if (newTime <= 0) {
            stopRecording()
            toast({
              title: "انتهى الوقت",
              description: "تم إيقاف التسجيل بعد 5 دقائق",
              variant: "default",
            })
            return 0
          }
          
          return newTime
        })
      }, 1000)
    } else if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }, [isRecording, isPaused, toast])

  const startRecording = useCallback(() => {
    if (!isSupported) {
      const errorMsg = "متصفحك لا يدعم التسجيل الصوتي. يرجى استخدام Chrome أو Edge أو Safari."
      setError(errorMsg)
      toast({
        title: "غير مدعوم",
        description: errorMsg,
        variant: "destructive",
      })
      return
    }

    if (!recognitionRef.current) {
      setError("فشل في تهيئة التسجيل الصوتي")
      return
    }

    try {
      setError(null)
      setIsRecording(true)
      setIsPaused(false)
      setTimeRemaining(MAX_RECORDING_TIME)
      recognitionRef.current.start()
      
      toast({
        title: "جاري التسجيل...",
        description: "تحدث بوضوح وسنقوم بتحويل كلامك إلى نص",
        variant: "default",
      })
    } catch (err: any) {
      console.error("Failed to start recording:", err)
      setError("فشل في بدء التسجيل")
      setIsRecording(false)
      toast({
        title: "خطأ",
        description: "فشل في بدء التسجيل. يرجى المحاولة مرة أخرى.",
        variant: "destructive",
      })
    }
  }, [isSupported, toast])

  const stopRecording = useCallback(() => {
    if (recognitionRef.current && isRecording) {
      try {
        recognitionRef.current.stop()
        setIsRecording(false)
        setIsPaused(false)
        
        if (timerRef.current) {
          clearInterval(timerRef.current)
          timerRef.current = null
        }
        
        toast({
          title: "تم إيقاف التسجيل",
          description: transcript.length > 0 ? "تم تحويل صوتك إلى نص بنجاح" : "لم يتم تسجيل أي صوت",
          variant: "default",
        })
      } catch (err) {
        console.error("Failed to stop recording:", err)
      }
    }
  }, [isRecording, transcript, toast])

  const pauseRecording = useCallback(() => {
    if (recognitionRef.current && isRecording && !isPaused) {
      try {
        recognitionRef.current.stop()
        setIsPaused(true)
      } catch (err) {
        console.error("Failed to pause recording:", err)
      }
    }
  }, [isRecording, isPaused])

  const resumeRecording = useCallback(() => {
    if (recognitionRef.current && isRecording && isPaused) {
      try {
        recognitionRef.current.start()
        setIsPaused(false)
      } catch (err) {
        console.error("Failed to resume recording:", err)
      }
    }
  }, [isRecording, isPaused])

  const clearTranscript = useCallback(() => {
    setTranscript("")
  }, [])

  return {
    transcript,
    isRecording,
    isPaused,
    isSupported,
    error,
    timeRemaining,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    clearTranscript,
  }
}


