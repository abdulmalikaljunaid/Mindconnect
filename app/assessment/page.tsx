"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { WelcomeStep } from "@/components/assessment/welcome-step"
import { SymptomInputStep } from "@/components/assessment/symptom-input-step"
import { AnalysisLoading } from "@/components/assessment/analysis-loading"
import { ResultsStep } from "@/components/assessment/results-step"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import type { AssessmentStep, AssessmentResult, DoctorMatch } from "@/types/assessment"

export default function AssessmentPage() {
  const [currentStep, setCurrentStep] = useState<AssessmentStep['step']>('welcome')
  const [symptoms, setSymptoms] = useState("")
  const [assessment, setAssessment] = useState<AssessmentResult | null>(null)
  const [doctors, setDoctors] = useState<DoctorMatch[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  
  const router = useRouter()
  const { isAuthenticated, user, isLoading: authLoading } = useAuth()

  const handleStartAssessment = () => {
    setCurrentStep('input')
  }

  const handleSymptomSubmit = async (symptomsText: string) => {
    setSymptoms(symptomsText)
    setCurrentStep('loading')
    setIsLoading(true)
    setError("")

    try {
      // إضافة timeout للطلب (70 ثانية - أكثر من timeout الـ API)
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 70000)
      
      const response = await fetch('/api/analyze-symptoms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ symptoms: symptomsText }),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'حدث خطأ في التحليل')
      }

      // التحقق من وجود البيانات المطلوبة
      if (!data.assessment) {
        console.error('Missing assessment in response:', data)
        throw new Error('لم يتم الحصول على نتائج التقييم')
      }

      if (!data.doctors || !Array.isArray(data.doctors)) {
        console.warn('No doctors in response or invalid format:', data.doctors)
        // لا نرمي خطأ هنا، قد لا يكون هناك أطباء متاحين
      }

      // التأكد من أن assessment يحتوي على البيانات المطلوبة
      if (!data.assessment.conditions || !Array.isArray(data.assessment.conditions)) {
        console.error('Invalid assessment format:', data.assessment)
        throw new Error('تنسيق نتائج التقييم غير صحيح')
      }

      // التأكد من وجود recommendedSpecialties
      if (!data.assessment.recommendedSpecialties || !Array.isArray(data.assessment.recommendedSpecialties)) {
        console.warn('Missing recommendedSpecialties, using default')
        data.assessment.recommendedSpecialties = data.assessment.recommendedSpecialties || ['general-psychiatry']
      }

      setAssessment(data.assessment)
      setDoctors(data.doctors || [])
      setCurrentStep('results')
    } catch (err: any) {
      console.error('Assessment error:', err)
      
      // معالجة مختلفة لأنواع الأخطاء
      let errorMessage = 'حدث خطأ غير متوقع'
      
      if (err?.name === 'AbortError') {
        errorMessage = 'انتهت مهلة التحليل. يرجى المحاولة مرة أخرى.'
      } else if (err?.message) {
        errorMessage = err.message
      }
      
      setError(errorMessage)
      setCurrentStep('input')
    } finally {
      setIsLoading(false)
    }
  }

  const handleBookAppointment = (doctor: any) => {
    // حفظ بيانات الطبيب المختار في localStorage (يستخدم في book-appointment page)
    localStorage.setItem('selectedDoctor', JSON.stringify(doctor))
    localStorage.setItem('assessmentResult', JSON.stringify(assessment))
    
    // التحقق من تسجيل الدخول
    if (isAuthenticated && user) {
      // إذا كان المستخدم مسجل الدخول، انتقل مباشرة إلى صفحة الحجز
      router.push(`/book-appointment?doctorId=${doctor.id}`)
    } else {
      // إذا لم يكن مسجل الدخول، انتقل إلى صفحة تسجيل الدخول مع redirect URL يحتوي على doctorId
      // هذا يضمن أن بعد تسجيل الدخول سيتم إعادة التوجيه للحجز مباشرة
      const redirectUrl = `/book-appointment?doctorId=${doctor.id}`
      router.push(`/login?redirect=${encodeURIComponent(redirectUrl)}`)
    }
  }

  const handleBack = () => {
    switch (currentStep) {
      case 'input':
        setCurrentStep('welcome')
        break
      case 'loading':
        setCurrentStep('input')
        break
      case 'results':
        setCurrentStep('input')
        break
      default:
        setCurrentStep('welcome')
    }
  }

  const handleRestart = () => {
    setCurrentStep('welcome')
    setSymptoms("")
    setAssessment(null)
    setDoctors([])
    setError("")
  }

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'welcome':
        return <WelcomeStep onNext={handleStartAssessment} />
      
      case 'input':
        return (
          <SymptomInputStep
            onBack={handleBack}
            onNext={handleSymptomSubmit}
          />
        )
      
      case 'loading':
        return <AnalysisLoading symptoms={symptoms} />
      
      case 'results':
        return (
          <ResultsStep
            assessment={assessment!}
            doctors={doctors}
            onBack={handleBack}
            onRestart={handleRestart}
            onBookAppointment={handleBookAppointment}
          />
        )
      
      default:
        return <WelcomeStep onNext={handleStartAssessment} />
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {error && (
            <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
              <p className="text-destructive text-sm">{error}</p>
            </div>
          )}
          
          {renderCurrentStep()}
        </div>
      </main>
      
      <Footer />
    </div>
  )
}
