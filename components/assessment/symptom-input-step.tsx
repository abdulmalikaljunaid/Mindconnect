"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Brain, ArrowLeft, ArrowRight, AlertCircle } from "lucide-react"

interface SymptomInputStepProps {
  onBack: () => void
  onNext: (symptoms: string) => void
}

export function SymptomInputStep({ onBack, onNext }: SymptomInputStepProps) {
  const [symptoms, setSymptoms] = useState("")
  const [error, setError] = useState("")

  const handleSubmit = () => {
    const trimmedSymptoms = symptoms.trim()
    
    if (trimmedSymptoms.length < 10) {
      setError("يرجى تقديم وصف مفصل لأعراضك (10 أحرف على الأقل)")
      return
    }
    
    if (trimmedSymptoms.length > 2000) {
      setError("الوصف طويل جداً. يرجى تقصيره إلى أقل من 2000 حرف")
      return
    }
    
    setError("")
    onNext(trimmedSymptoms)
  }

  const characterCount = symptoms.length
  const isTooShort = characterCount < 10
  const isTooLong = characterCount > 2000

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">صف لنا ما تشعر به</h2>
        <p className="text-muted-foreground">
          اكتب بحرية عن أعراضك، مشاعرك، أو أي شيء تريد مناقشته مع طبيب نفسي
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            وصف الأعراض
          </CardTitle>
          <CardDescription>
            كلما كان الوصف أكثر تفصيلاً، كانت التوصيات أكثر دقة
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={symptoms}
            onChange={(e) => setSymptoms(e.target.value)}
            placeholder="مثلاً: أشعر بصعوبة في التركيز في العمل، وأجد نفسي أتشتت بسهولة. كما أنني أعاني من قلق مستمر وأشعر بالإرهاق معظم الوقت. أحياناً أفقد شهيتي ولا أستطيع النوم بشكل جيد..."
            className="min-h-[200px] resize-none"
            maxLength={2000}
          />
          
          <div className="flex justify-between items-center text-sm">
            <div className="flex items-center gap-2">
              {isTooShort && (
                <AlertCircle className="h-4 w-4 text-destructive" />
              )}
              <span className={isTooShort ? "text-destructive" : "text-muted-foreground"}>
                {characterCount}/2000 حرف
              </span>
            </div>
            <span className="text-muted-foreground">
              الحد الأدنى: 10 أحرف
            </span>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
          نصائح للحصول على أفضل النتائج:
        </h3>
        <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
          <li>• اذكر الأعراض الجسدية والنفسية</li>
          <li>• وصف كيف تؤثر هذه الأعراض على حياتك اليومية</li>
          <li>• اذكر المدة الزمنية لهذه الأعراض</li>
          <li>• لا تتردد في ذكر أي مخاوف أو أسئلة لديك</li>
        </ul>
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          العودة
        </Button>
        
        <Button 
          onClick={handleSubmit}
          disabled={isTooShort || isTooLong}
        >
          تحليل حالتي
          <ArrowRight className="h-4 w-4 mr-2" />
        </Button>
      </div>
    </div>
  )
}
