"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"
import { Brain, Search, Users, CheckCircle } from "lucide-react"
import { LOADING_MESSAGES } from "@/lib/ai/prompts"

interface AnalysisLoadingProps {
  symptoms: string
}

export function AnalysisLoading({ symptoms }: AnalysisLoadingProps) {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const messageInterval = setInterval(() => {
      setCurrentMessageIndex((prev) => (prev + 1) % LOADING_MESSAGES.length)
    }, 2000)

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) return 100
        return prev + Math.random() * 15
      })
    }, 200)

    return () => {
      clearInterval(messageInterval)
      clearInterval(progressInterval)
    }
  }, [])

  const getIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Brain className="h-6 w-6 text-primary" />
      case 1:
        return <Search className="h-6 w-6 text-primary" />
      case 2:
        return <Users className="h-6 w-6 text-primary" />
      case 3:
        return <CheckCircle className="h-6 w-6 text-primary" />
      default:
        return <Brain className="h-6 w-6 text-primary" />
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="relative">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
              <Spinner className="h-8 w-8 text-primary" />
            </div>
            <div className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
              {getIcon(currentMessageIndex)}
            </div>
          </div>
        </div>
        
        <h2 className="text-2xl font-bold">جاري تحليل حالتك</h2>
        <p className="text-muted-foreground">
          نعمل على فهم أعراضك وإيجاد أفضل الأطباء المناسبين لك
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="space-y-6">
            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>التقدم</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${Math.min(progress, 100)}%` }}
                />
              </div>
            </div>

            {/* Current Message */}
            <div className="text-center">
              <p className="text-lg font-medium">
                {LOADING_MESSAGES[currentMessageIndex]}
              </p>
            </div>

            {/* Steps */}
            <div className="space-y-3">
              {LOADING_MESSAGES.map((message, index) => (
                <div 
                  key={index}
                  className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-300 ${
                    index <= currentMessageIndex 
                      ? 'bg-primary/5 border border-primary/20' 
                      : 'bg-muted/30'
                  }`}
                >
                  <div className={`flex h-8 w-8 items-center justify-center rounded-full ${
                    index < currentMessageIndex 
                      ? 'bg-primary text-primary-foreground' 
                      : index === currentMessageIndex
                      ? 'bg-primary/20 text-primary'
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    {index < currentMessageIndex ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      getIcon(index)
                    )}
                  </div>
                  <span className={`text-sm ${
                    index <= currentMessageIndex ? 'text-foreground' : 'text-muted-foreground'
                  }`}>
                    {message}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
          ما يحدث الآن:
        </h3>
        <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
          <li>• تحليل الأعراض باستخدام الذكاء الاصطناعي</li>
          <li>• مقارنة الأعراض مع قاعدة البيانات الطبية</li>
          <li>• تحديد التخصصات الطبية المناسبة</li>
          <li>• البحث عن أفضل الأطباء المتاحين</li>
        </ul>
      </div>
    </div>
  )
}
