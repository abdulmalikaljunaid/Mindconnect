"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Mic, 
  MicOff, 
  Trash2, 
  CheckCircle, 
  AlertCircle,
  Clock,
  Pause,
  Play,
} from "lucide-react"
import { useVoiceRecognition } from "@/hooks/use-voice-recognition"
import { cn } from "@/lib/utils"

interface VoiceRecorderProps {
  onTranscriptChange: (text: string) => void
  currentText: string
}

export function VoiceRecorder({ onTranscriptChange, currentText }: VoiceRecorderProps) {
  const {
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
  } = useVoiceRecognition()

  // تحديث النص في الـ parent component
  useEffect(() => {
    if (transcript) {
      onTranscriptChange(transcript)
    }
  }, [transcript, onTranscriptChange])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const handleUseTranscript = () => {
    if (transcript) {
      // دمج النص الصوتي مع النص الموجود
      const combinedText = currentText ? `${currentText}\n\n${transcript}` : transcript
      onTranscriptChange(combinedText)
      clearTranscript()
    }
  }

  if (!isSupported) {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          متصفحك لا يدعم التسجيل الصوتي. يرجى استخدام متصفح حديث مثل{" "}
          <a 
            href="https://www.google.com/chrome/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="underline font-medium"
          >
            Chrome
          </a>
          {" "}أو{" "}
          <a 
            href="https://www.microsoft.com/edge" 
            target="_blank" 
            rel="noopener noreferrer"
            className="underline font-medium"
          >
            Edge
          </a>
          {" "}أو Safari.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-4 mb-4">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Mic className="h-4 w-4" />
        <span>يمكنك الكتابة أو استخدام الميكروفون لوصف أعراضك</span>
      </div>

      <Card className={cn(
        "p-4 transition-all duration-300",
        isRecording && !isPaused && "border-red-500 bg-red-50 dark:bg-red-950/20"
      )}>
        <div className="flex items-center justify-between gap-4">
          {/* أزرار التحكم */}
          <div className="flex items-center gap-2">
            {!isRecording ? (
              <Button
                onClick={startRecording}
                size="lg"
                variant="outline"
                className="gap-2"
              >
                <Mic className="h-5 w-5" />
                ابدأ التسجيل
              </Button>
            ) : (
              <>
                <Button
                  onClick={stopRecording}
                  size="lg"
                  variant="destructive"
                  className="gap-2"
                >
                  <MicOff className="h-5 w-5" />
                  إيقاف
                </Button>
                
                {!isPaused ? (
                  <Button
                    onClick={pauseRecording}
                    size="lg"
                    variant="outline"
                    className="gap-2"
                  >
                    <Pause className="h-5 w-5" />
                    إيقاف مؤقت
                  </Button>
                ) : (
                  <Button
                    onClick={resumeRecording}
                    size="lg"
                    variant="outline"
                    className="gap-2"
                  >
                    <Play className="h-5 w-5" />
                    استئناف
                  </Button>
                )}
              </>
            )}
          </div>

          {/* العداد الزمني والحالة */}
          <div className="flex items-center gap-4">
            {isRecording && (
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className={cn(
                  "font-mono text-sm",
                  timeRemaining <= 60 && "text-destructive font-bold"
                )}>
                  {formatTime(timeRemaining)}
                </span>
              </div>
            )}
            
            {/* مؤشر التسجيل النشط */}
            {isRecording && !isPaused && (
              <div className="flex items-center gap-2">
                <div className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                </div>
                <span className="text-sm font-medium text-red-600 dark:text-red-400">
                  جاري التسجيل...
                </span>
              </div>
            )}
            
            {/* مؤشر الإيقاف المؤقت */}
            {isRecording && isPaused && (
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                <span className="text-sm font-medium text-yellow-600 dark:text-yellow-400">
                  متوقف مؤقتاً
                </span>
              </div>
            )}
          </div>
        </div>

        {/* موجات صوتية متحركة أثناء التسجيل */}
        {isRecording && !isPaused && (
          <div className="flex items-center justify-center gap-1 mt-4 h-12">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="w-1 bg-red-500 rounded-full animate-pulse"
                style={{
                  height: `${20 + Math.random() * 30}px`,
                  animationDelay: `${i * 0.1}s`,
                  animationDuration: `${0.6 + Math.random() * 0.4}s`,
                }}
              />
            ))}
          </div>
        )}

        {/* النص المُسجّل */}
        {transcript && (
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">النص المُسجّل:</span>
              <div className="flex gap-2">
                {!isRecording && (
                  <Button
                    onClick={handleUseTranscript}
                    size="sm"
                    variant="default"
                    className="gap-2"
                  >
                    <CheckCircle className="h-4 w-4" />
                    استخدام النص
                  </Button>
                )}
                <Button
                  onClick={clearTranscript}
                  size="sm"
                  variant="ghost"
                  className="gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  مسح
                </Button>
              </div>
            </div>
            <div className="p-3 bg-secondary/50 rounded-lg text-sm max-h-32 overflow-y-auto">
              {transcript}
            </div>
          </div>
        )}
      </Card>

      {/* رسائل الأخطاء */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  )
}


