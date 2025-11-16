"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Spinner } from "@/components/ui/spinner"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { AlertCircle, Stethoscope, Shield, Upload, FileText, CheckCircle, Brain } from "lucide-react"
import type { UserRole } from "@/lib/auth"
import { supabaseClient } from "@/lib/supabase-client"
import { useToast } from "@/hooks/use-toast"
import { SpecialtySelector } from "@/components/specialties/specialty-selector"
import type { Specialty } from "@/hooks/use-specialties"

interface DocumentFile {
  file: File | null
  uploaded: boolean
}

export default function DoctorSignUpPage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [role, setRole] = useState<UserRole>("doctor")
  const [licenseNumber, setLicenseNumber] = useState("")
  const [education, setEducation] = useState("")
  const [experienceYears, setExperienceYears] = useState("")
  const [selectedSpecialties, setSelectedSpecialties] = useState<Specialty[]>([])
  
  // Document files
  const [licenseDoc, setLicenseDoc] = useState<DocumentFile>({ file: null, uploaded: false })
  const [certificateDoc, setCertificateDoc] = useState<DocumentFile>({ file: null, uploaded: false })
  const [cvDoc, setCvDoc] = useState<DocumentFile>({ file: null, uploaded: false })
  const [idDoc, setIdDoc] = useState<DocumentFile>({ file: null, uploaded: false })
  
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState("")
  const { signUp } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  const uploadDocument = async (file: File, userId: string, docType: string): Promise<string> => {
    // Validate file type
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    if (!allowedTypes.includes(file.type)) {
      throw new Error(`نوع الملف غير مدعوم. يرجى رفع ملف PDF أو صورة (JPG/PNG) أو ملف Word`)
    }

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024 // 10MB in bytes
    if (file.size > maxSize) {
      throw new Error(`حجم الملف كبير جداً. الحد الأقصى هو 10 ميجابايت`)
    }

    const fileExt = file.name.split('.').pop()
    const fileName = `${userId}/${docType}.${fileExt}`
    
    const { error: uploadError } = await supabaseClient.storage
      .from('doctor-documents')
      .upload(fileName, file, { 
        upsert: true,
        contentType: file.type 
      })

    if (uploadError) throw uploadError
    
    // Return the file path instead of public URL for better security
    // The admin can generate signed URLs when viewing documents
    return fileName
  }

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: React.Dispatch<React.SetStateAction<DocumentFile>>
  ) => {
    const file = e.target.files?.[0]
    if (file) {
      // Basic validation - detailed validation happens during upload
      const maxSize = 10 * 1024 * 1024 // 10MB
      if (file.size > maxSize) {
        setError("حجم الملف يجب أن يكون أقل من 10 ميجابايت")
        return
      }
      
      // Check file type
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
      if (!allowedTypes.includes(file.type)) {
        setError("نوع الملف غير مدعوم. يرجى رفع ملف PDF أو صورة (JPG/PNG) أو ملف Word")
        return
      }
      
      setError("") // Clear any previous errors
      setter({ file, uploaded: false })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (password !== confirmPassword) {
      setError("كلمات المرور غير متطابقة")
      return
    }

    if (password.length < 8) {
      setError("يجب أن تكون كلمة المرور 8 أحرف على الأقل")
      return
    }

    if (role === "doctor") {
      if (!licenseNumber) {
        setError("رقم الرخصة مطلوب")
        return
      }
      if (!licenseDoc.file) {
        setError("يرجى رفع صورة الرخصة")
        return
      }
      if (!certificateDoc.file) {
        setError("يرجى رفع الشهادة")
        return
      }
      if (selectedSpecialties.length === 0) {
        setError("يرجى اختيار تخصص واحد على الأقل")
        return
      }
    }

    setIsLoading(true)
    setUploadProgress("جاري إنشاء الحساب...")

    try {
      // Create account first
      console.log("Starting signup process...")
      setUploadProgress("جاري إنشاء الحساب...")
      
      await signUp(email, password, name, role)
      console.log("Signup completed successfully")
      setUploadProgress("تم إنشاء الحساب بنجاح ✓")

      if (role === "doctor") {
        // Get current user
        const { data: { user } } = await supabaseClient.auth.getUser()
        if (!user) throw new Error("فشل الحصول على معلومات المستخدم")

        // Upload documents with progress
        setUploadProgress("جاري رفع المستندات...")
        
        const licenseUrl = licenseDoc.file ? await uploadDocument(licenseDoc.file, user.id, 'license') : null
        const certificateUrl = certificateDoc.file ? await uploadDocument(certificateDoc.file, user.id, 'certificate') : null
        const cvUrl = cvDoc.file ? await uploadDocument(cvDoc.file, user.id, 'cv') : null
        const idUrl = idDoc.file ? await uploadDocument(idDoc.file, user.id, 'id') : null

        setUploadProgress("تم رفع المستندات ✓")

        // Create doctor profile with documents
        setUploadProgress("جاري حفظ البيانات...")
        const { error: profileError } = await supabaseClient
          .from('doctor_profiles')
          .insert({
            profile_id: user.id,
            license_number: licenseNumber,
            education: education || null,
            experience_years: experienceYears ? parseInt(experienceYears) : null,
            license_document_url: licenseUrl,
            certificate_document_url: certificateUrl,
            cv_document_url: cvUrl,
            id_document_url: idUrl,
            approval_status: 'pending',
            submitted_at: new Date().toISOString(),
          })

        if (profileError) throw profileError

        // Save specialties
        if (selectedSpecialties.length > 0) {
          setUploadProgress("جاري حفظ التخصصات...")
          const specialtyInserts = selectedSpecialties.map((specialty, index) => ({
            doctor_id: user.id,
            specialty_id: specialty.id,
            is_primary: index === 0, // أول تخصص يكون رئيسي
          }))

          const { error: specialtyError } = await supabaseClient
            .from('doctor_specialties')
            .insert(specialtyInserts)

          if (specialtyError) {
            console.error("Error saving specialties:", specialtyError)
            // Don't throw - continue even if specialties fail to save
          }
        }

        setUploadProgress("تم إرسال الطلب بنجاح! ✓")
        
        // Show success toast and redirect with small delay
        toast({
          title: "✅ تم إنشاء الحساب بنجاح!",
          description: "جاري تحويلك إلى صفحة الانتظار...",
          duration: 2000,
        })

        // Small delay to ensure auth state is fully synced
        await new Promise(resolve => setTimeout(resolve, 100))
        router.replace("/pending-approval")
      } else {
        // For non-doctor roles (admin, etc)
        toast({
          title: "تم إنشاء الحساب بنجاح!",
          description: "جاري تحويلك إلى لوحة التحكم...",
        })
        
        // Small delay to ensure auth state is fully synced
        await new Promise(resolve => setTimeout(resolve, 100))
        router.replace("/dashboard")
      }
    } catch (err: any) {
      console.error("Signup error:", err)
      console.error("Error details:", {
        message: err?.message,
        name: err?.name,
        stack: err?.stack,
      })
      
      let errorMessage = err?.message ?? "فشل إنشاء الحساب. يرجى المحاولة مرة أخرى."
      
      // Handle rate limit error with Arabic message
      if (err?.message?.toLowerCase().includes("rate limit") || 
          err?.message?.toLowerCase().includes("email")) {
        errorMessage = "تم تجاوز الحد المسموح من محاولات إرسال البريد الإلكتروني. يرجى الانتظار 15 دقيقة أو استخدام بريد إلكتروني آخر."
      }
      
      // Handle timeout errors
      if (err?.message?.includes("timeout") || err?.message?.includes("مهلة")) {
        errorMessage = "انتهت مهلة العملية. يرجى التحقق من الاتصال بالإنترنت والمحاولة مرة أخرى."
      }
      
      setError(errorMessage)
      setUploadProgress("")
      setIsLoading(false)
      
      toast({
        title: "حدث خطأ",
        description: errorMessage,
        variant: "destructive",
      })
    }
    // Don't set isLoading to false in finally block on success
    // Let it stay true until redirect completes for better UX
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted px-4 py-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="mb-4 flex justify-center">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 shadow-md">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Mindconnect
              </span>
            </Link>
          </div>
          <CardTitle className="text-center text-2xl flex items-center gap-2">
            <Stethoscope className="h-6 w-6" />
            إنشاء حساب طبيب / إداري
          </CardTitle>
          <CardDescription className="text-center">انضم إلى فريقنا المتخصص في الصحة النفسية</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-3">
              <Label>أنا...</Label>
              <RadioGroup value={role} onValueChange={(value) => setRole(value as UserRole)}>
                <div className="flex items-center space-x-2 space-x-reverse rounded-lg border border-border p-3 hover:bg-accent">
                  <RadioGroupItem value="doctor" id="doctor" />
                  <Label htmlFor="doctor" className="flex flex-1 cursor-pointer items-center gap-2">
                    <Stethoscope className="h-4 w-4" />
                    <div>
                      <div className="font-medium">طبيب</div>
                      <div className="text-xs text-muted-foreground">متخصص في الصحة النفسية</div>
                    </div>
                  </Label>
                </div>

                <div className="flex items-center space-x-2 space-x-reverse rounded-lg border border-border p-3 opacity-50 cursor-not-allowed">
                  <RadioGroupItem value="admin" id="admin" disabled />
                  <Label htmlFor="admin" className="flex flex-1 cursor-not-allowed items-center gap-2">
                    <Shield className="h-4 w-4" />
                    <div>
                      <div className="font-medium">إداري</div>
                      <div className="text-xs text-muted-foreground">غير متاح للعامة</div>
                    </div>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">الاسم الكامل</Label>
              <Input
                id="name"
                type="text"
                placeholder="د. محمد أحمد"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">البريد الإلكتروني</Label>
              <Input
                id="email"
                type="email"
                placeholder="doctor@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">كلمة المرور</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">تأكيد كلمة المرور</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            {role === "doctor" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="licenseNumber">رقم الرخصة *</Label>
                  <Input
                    id="licenseNumber"
                    type="text"
                    placeholder="رقم الرخصة الطبية"
                    value={licenseNumber}
                    onChange={(e) => setLicenseNumber(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="education">المؤهل العلمي</Label>
                  <Textarea
                    id="education"
                    placeholder="مثال: بكالوريوس الطب والجراحة، جامعة..."
                    value={education}
                    onChange={(e) => setEducation(e.target.value)}
                    disabled={isLoading}
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="experienceYears">سنوات الخبرة</Label>
                  <Input
                    id="experienceYears"
                    type="number"
                    min="0"
                    placeholder="5"
                    value={experienceYears}
                    onChange={(e) => setExperienceYears(e.target.value)}
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <SpecialtySelector
                    selectedSpecialties={selectedSpecialties}
                    onSpecialtiesChange={setSelectedSpecialties}
                    maxSelection={3}
                  />
                  <p className="text-xs text-muted-foreground">
                    * يمكنك اختيار حتى 3 تخصصات، أو إضافة تخصص مخصص إذا لم تجده في القائمة
                  </p>
                </div>

                <div className="space-y-4 rounded-lg border border-border p-4">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    <Label className="font-semibold">المستندات المطلوبة</Label>
                  </div>

                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label htmlFor="license" className="flex items-center gap-2">
                        صورة الرخصة *
                        {licenseDoc.file && <CheckCircle className="h-4 w-4 text-green-500" />}
                      </Label>
                      <div className="flex items-center gap-2">
                        <Input
                          id="license"
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) => handleFileChange(e, setLicenseDoc)}
                          disabled={isLoading}
                          className="cursor-pointer"
                        />
                      </div>
                      {licenseDoc.file && (
                        <p className="text-xs text-muted-foreground">{licenseDoc.file.name}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="certificate" className="flex items-center gap-2">
                        الشهادة العلمية *
                        {certificateDoc.file && <CheckCircle className="h-4 w-4 text-green-500" />}
                      </Label>
                      <Input
                        id="certificate"
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => handleFileChange(e, setCertificateDoc)}
                        disabled={isLoading}
                        className="cursor-pointer"
                      />
                      {certificateDoc.file && (
                        <p className="text-xs text-muted-foreground">{certificateDoc.file.name}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="cv" className="flex items-center gap-2">
                        السيرة الذاتية (اختياري)
                        {cvDoc.file && <CheckCircle className="h-4 w-4 text-green-500" />}
                      </Label>
                      <Input
                        id="cv"
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={(e) => handleFileChange(e, setCvDoc)}
                        disabled={isLoading}
                        className="cursor-pointer"
                      />
                      {cvDoc.file && (
                        <p className="text-xs text-muted-foreground">{cvDoc.file.name}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="id" className="flex items-center gap-2">
                        صورة الهوية (اختياري)
                        {idDoc.file && <CheckCircle className="h-4 w-4 text-green-500" />}
                      </Label>
                      <Input
                        id="id"
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => handleFileChange(e, setIdDoc)}
                        disabled={isLoading}
                        className="cursor-pointer"
                      />
                      {idDoc.file && (
                        <p className="text-xs text-muted-foreground">{idDoc.file.name}</p>
                      )}
                    </div>
                  </div>
                </div>

                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-sm">
                    حسابات الأطباء تتطلب موافقة المدير قبل أن تتمكن من البدء في قبول المرضى. 
                    سيتم مراجعة مستنداتك والرد عليك في أقرب وقت ممكن.
                  </AlertDescription>
                </Alert>
              </>
            )}

            {uploadProgress && (
              <Alert className="bg-blue-50 border-blue-200">
                <Spinner className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800">
                  {uploadProgress}
                </AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Spinner className="ml-2 h-4 w-4" />
                  {uploadProgress || "جاري إنشاء الحساب..."}
                </>
              ) : (
                "إنشاء حساب"
              )}
            </Button>
          </form>

          <div className="mt-6 space-y-3">
            <div className="text-center text-sm">
              <span className="text-muted-foreground">لديك حساب بالفعل؟ </span>
              <Link href="/login/doctor" className="font-medium text-primary hover:underline">
                سجل الدخول
              </Link>
            </div>
            <div className="text-center text-sm">
              <Link href="/signup" className="text-muted-foreground hover:underline">
                ← العودة لاختيار نوع الحساب
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
