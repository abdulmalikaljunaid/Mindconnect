"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
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

  const handleStartAssessment = () => {
    setCurrentStep('input')
  }

  const handleSymptomSubmit = async (symptomsText: string) => {
    setSymptoms(symptomsText)
    setCurrentStep('loading')
    setIsLoading(true)
    setError("")

    try {
      const response = await fetch('/api/analyze-symptoms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ symptoms: symptomsText }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'حدث خطأ في التحليل')
      }

      setAssessment(data.assessment)
      setDoctors(data.doctors)
      setCurrentStep('results')
    } catch (err) {
      console.error('Assessment error:', err)
      setError(err instanceof Error ? err.message : 'حدث خطأ غير متوقع')
      setCurrentStep('input')
    } finally {
      setIsLoading(false)
    }
  }

  const handleBookAppointment = (doctor: any) => {
    // حفظ بيانات الطبيب المختار في localStorage
    localStorage.setItem('selectedDoctor', JSON.stringify(doctor))
    localStorage.setItem('assessmentResult', JSON.stringify(assessment))
    
    // توجيه لصفحة تسجيل الدخول
    router.push('/login?redirect=/book-appointment')
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
