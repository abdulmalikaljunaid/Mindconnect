"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, RefreshCw, Users, AlertCircle, CheckCircle } from "lucide-react"
import { ConditionCard } from "./condition-card"
import { DoctorMatchCard } from "./doctor-match-card"
import type { AssessmentResult, DoctorMatch } from "@/types/assessment"

interface ResultsStepProps {
  assessment: AssessmentResult
  doctors: DoctorMatch[]
  onBack: () => void
  onRestart: () => void
  onBookAppointment: (doctor: any) => void
}

export function ResultsStep({ 
  assessment, 
  doctors, 
  onBack, 
  onRestart, 
  onBookAppointment 
}: ResultsStepProps) {
  const [selectedCondition, setSelectedCondition] = useState(0)

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
            <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>
        </div>
        <h2 className="text-2xl font-bold">تم تحليل حالتك بنجاح</h2>
        <p className="text-muted-foreground">
          بناءً على وصفك، وجدنا التخصصات والطبيب المناسبين لك
        </p>
      </div>

      {/* Assessment Results */}
      <div className="space-y-6">
        <h3 className="text-xl font-semibold">نتائج التقييم</h3>
        
        {assessment.conditions.length > 0 && (
          <div className="space-y-4">
            {assessment.conditions.length === 1 ? (
              <ConditionCard condition={assessment.conditions[0]} />
            ) : (
              <div className="space-y-4">
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {assessment.conditions.map((condition, index) => (
                    <Button
                      key={index}
                      variant={selectedCondition === index ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedCondition(index)}
                      className="whitespace-nowrap"
                    >
                      {condition.name} ({condition.probability}%)
                    </Button>
                  ))}
                </div>
                <ConditionCard condition={assessment.conditions[selectedCondition]} />
              </div>
            )}
          </div>
        )}

        {assessment.notes && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>ملاحظات إضافية:</strong> {assessment.notes}
            </AlertDescription>
          </Alert>
        )}
      </div>

      {/* Recommended Doctors */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold">الأطباء المقترحون</h3>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>{doctors.length} طبيب متاح</span>
          </div>
        </div>

        {doctors.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2">
            {doctors.map((doctorMatch) => (
              <DoctorMatchCard
                key={doctorMatch.doctor.id}
                doctorMatch={doctorMatch}
                onBookAppointment={onBookAppointment}
              />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <Users className="h-12 w-12 text-muted-foreground mx-auto" />
                <div>
                  <h4 className="font-semibold">لا توجد أطباء متاحين</h4>
                  <p className="text-sm text-muted-foreground">
                    لم نتمكن من العثور على أطباء متخصصين في حالتك حالياً
                  </p>
                </div>
                <Button variant="outline" onClick={onRestart}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  جرب تقييماً آخر
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex gap-2">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            العودة
          </Button>
          <Button variant="outline" onClick={onRestart}>
            <RefreshCw className="h-4 w-4 mr-2" />
            تقييم جديد
          </Button>
        </div>
        
        {doctors.length > 0 && (
          <Button 
            variant="outline" 
            onClick={() => {
              // يمكن إضافة منطق للانتقال لصفحة جميع الأطباء
              console.log("عرض جميع الأطباء")
            }}
          >
            <Users className="h-4 w-4 mr-2" />
            عرض جميع الأطباء
          </Button>
        )}
      </div>

      {/* Disclaimer */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>تنبيه مهم:</strong> هذا التقييم هو مجرد مساعدة أولية وليس تشخيصاً طبياً نهائياً. 
          يُنصح دائماً بمراجعة طبيب نفسي مؤهل للحصول على تشخيص دقيق وخطة علاج مناسبة.
        </AlertDescription>
      </Alert>
    </div>
  )
}
