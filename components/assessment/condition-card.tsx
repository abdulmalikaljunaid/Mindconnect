"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Brain, AlertCircle, TrendingUp } from "lucide-react"
import type { Condition } from "@/types/assessment"

interface ConditionCardProps {
  condition: Condition
}

export function ConditionCard({ condition }: ConditionCardProps) {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'mild':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
      case 'moderate':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
      case 'severe':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
    }
  }

  const getSeverityText = (severity: string) => {
    switch (severity) {
      case 'mild':
        return 'خفيف'
      case 'moderate':
        return 'متوسط'
      case 'severe':
        return 'شديد'
      default:
        return severity
    }
  }

  const getProbabilityColor = (probability: number) => {
    if (probability >= 80) return 'text-green-600 dark:text-green-400'
    if (probability >= 60) return 'text-yellow-600 dark:text-yellow-400'
    return 'text-red-600 dark:text-red-400'
  }

  return (
    <Card className="border-l-4 border-l-primary">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              {condition.name}
            </CardTitle>
            <CardDescription>
              {condition.nameEn}
            </CardDescription>
          </div>
          <div className="text-right space-y-2">
            <div className={`text-2xl font-bold ${getProbabilityColor(condition.probability)}`}>
              {condition.probability}%
            </div>
            <Badge className={getSeverityColor(condition.severity)}>
              {getSeverityText(condition.severity)}
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <h4 className="font-semibold text-sm">الوصف:</h4>
          <p className="text-sm text-foreground/80 leading-relaxed">
            {condition.description}
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-foreground/70">
          <TrendingUp className="h-3 w-3" />
          <span>نسبة الاحتمالية: {condition.probability}%</span>
        </div>

        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-sm">
            هذا تقييم أولي وليس تشخيصاً طبياً نهائياً. يُنصح بمراجعة طبيب نفسي مؤهل للتأكد من التشخيص.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  )
}
