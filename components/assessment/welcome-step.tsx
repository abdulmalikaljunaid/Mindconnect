"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Brain, Shield, Users, ArrowRight } from "lucide-react"

interface WelcomeStepProps {
  onNext: () => void
}

export function WelcomeStep({ onNext }: WelcomeStepProps) {
  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Brain className="h-8 w-8 text-primary" />
          </div>
        </div>
        <h1 className="text-3xl font-bold">اكتشف الطبيب المناسب لك</h1>
        <p className="text-lg text-muted-foreground">
          دع الذكاء الاصطناعي يساعدك في العثور على الطبيب النفسي الأنسب لحالتك
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-2">
              <Brain className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-lg">تحليل ذكي</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription className="text-center">
              وصف حالتك بحرية وسيقوم الذكاء الاصطناعي بتحليلها بدقة
            </CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-2">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-lg">توصيات مخصصة</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription className="text-center">
              احصل على قائمة بالأطباء الأنسب لتخصصك واحتياجاتك
            </CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-2">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-lg">آمن وخاص</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription className="text-center">
              معلوماتك محمية ولا يتم مشاركتها مع أي طرف ثالث
            </CardDescription>
          </CardContent>
        </Card>
      </div>

      <div className="bg-muted/50 rounded-lg p-6">
        <div className="flex items-start gap-3">
          <Shield className="h-5 w-5 text-muted-foreground mt-0.5" />
          <div className="space-y-2">
            <h3 className="font-semibold">تنبيه مهم</h3>
            <p className="text-sm text-muted-foreground">
              هذا التقييم هو مجرد مساعدة أولية وليس تشخيصاً طبياً نهائياً. 
              يُنصح دائماً بمراجعة طبيب نفسي مؤهل للحصول على تشخيص دقيق وخطة علاج مناسبة.
            </p>
          </div>
        </div>
      </div>

      <div className="text-center">
        <Button onClick={onNext} size="lg" className="px-8">
          ابدأ التقييم المجاني
          <ArrowRight className="h-4 w-4 mr-2" />
        </Button>
      </div>
    </div>
  )
}
