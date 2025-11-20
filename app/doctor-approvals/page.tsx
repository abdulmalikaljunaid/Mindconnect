"use client"

import { useMemo, useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { User, Mail, Phone, Award, CheckCircle, XCircle, Clock, FileText, Download, AlertCircle, Eye } from "lucide-react"
import { useAdminDoctors, type DoctorWithProfile } from "@/hooks/use-doctors"
import { supabaseClient } from "@/lib/supabase-client"
import { useToast } from "@/hooks/use-toast"

export default function DoctorApprovalsPage() {
  const [selectedDoctor, setSelectedDoctor] = useState<DoctorWithProfile | null>(null)
  const [showDialog, setShowDialog] = useState(false)
  const [showRejectDialog, setShowRejectDialog] = useState(false)
  const [rejectionNotes, setRejectionNotes] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [viewingDocument, setViewingDocument] = useState<{ url: string; name: string } | null>(null)
  const [documentUrl, setDocumentUrl] = useState<string | null>(null)
  const [isLoadingDocument, setIsLoadingDocument] = useState(false)
  const { pending, approved, rejected, isLoading, approveDoctor, rejectDoctor, refresh } = useAdminDoctors()
  const { toast } = useToast()

  const summary = useMemo(
    () => ({
      pending: pending.length,
      approved: approved.length,
      rejected: rejected.length,
    }),
    [pending.length, approved.length, rejected.length],
  )

  const openReview = (doctor: DoctorWithProfile) => {
    setSelectedDoctor(doctor)
    setShowDialog(true)
  }

  const closeDialog = () => {
    setShowDialog(false)
    setSelectedDoctor(null)
    setRejectionNotes("")
  }

  const handleApprove = async () => {
    if (!selectedDoctor) return
    setIsProcessing(true)
    try {
      await approveDoctor(selectedDoctor.id)
      closeDialog()
      toast({
        title: "تم القبول بنجاح",
        description: `تم قبول طلب الدكتور ${selectedDoctor.name}`,
      })
    } catch (error) {
      console.error("Error approving doctor:", error)
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء الموافقة على الطلب",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleRejectClick = () => {
    setShowDialog(false)
    setShowRejectDialog(true)
  }

  const handleRejectConfirm = async () => {
    if (!selectedDoctor) return
    setIsProcessing(true)
    try {
      await rejectDoctor(selectedDoctor.id, rejectionNotes || undefined)
      setShowRejectDialog(false)
      closeDialog()
      toast({
        title: "تم الرفض",
        description: `تم رفض طلب الدكتور ${selectedDoctor.name}`,
      })
    } catch (error) {
      console.error("Error rejecting doctor:", error)
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء رفض الطلب",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const getDocumentUrl = async (url: string | null | undefined): Promise<string | null> => {
    if (!url) return null

    try {
      // Check if URL is already a public URL or needs signed URL
      let documentUrl = url

      // If URL contains '/object/public/', it's a public URL - use directly
      if (url.includes('/object/public/')) {
        return url
      }

      // Try to extract file path from URL
      let filePath = url

      // If it's a full URL, extract the path
      if (url.startsWith('http://') || url.startsWith('https://')) {
        try {
          const urlObj = new URL(url)
          // Try different path patterns
          const publicMatch = urlObj.pathname.match(/\/object\/public\/doctor-documents\/(.+)/)
          if (publicMatch) {
            return url // Already a public URL
          } else {
            // Try to extract from pathname
            const pathMatch = urlObj.pathname.match(/doctor-documents\/(.+)/)
            if (pathMatch) {
              filePath = pathMatch[1]
            }
          }
        } catch (e) {
          // If URL parsing fails, assume url is already the file path
          filePath = url
        }
      }

      // Create a signed URL
      const { data, error } = await supabaseClient.storage
        .from('doctor-documents')
        .createSignedUrl(filePath, 3600) // صالح لمدة ساعة

      if (error) {
        console.error('Error creating signed URL:', error)
        throw error
      }

      return data?.signedUrl || null
    } catch (error: any) {
      console.error('Error getting document URL:', error)
      throw error
    }
  }

  const handleViewDocument = async (url: string | null | undefined, documentName: string) => {
    if (!url) {
      toast({
        title: "خطأ",
        description: "لا يوجد رابط للمستند",
        variant: "destructive",
      })
      return
    }

    setIsLoadingDocument(true)
    setViewingDocument({ url, name: documentName })
    setDocumentUrl(null)

    try {
      const docUrl = await getDocumentUrl(url)
      
      if (!docUrl) {
        throw new Error("فشل في الحصول على رابط الملف")
      }

      setDocumentUrl(docUrl)
    } catch (error: any) {
      console.error('Error viewing document:', error)
      toast({
        title: "خطأ",
        description: error.message || "فشل في فتح الملف. يرجى التحقق من صحة الرابط.",
        variant: "destructive",
      })
      setViewingDocument(null)
    } finally {
      setIsLoadingDocument(false)
    }
  }

  const closeDocumentViewer = () => {
    // Clear all document-related state
    setViewingDocument(null)
    setDocumentUrl(null)
    setIsLoadingDocument(false)
    // Force a re-render to ensure dialog closes
    setTimeout(() => {
      // Small delay to ensure state updates are processed
    }, 0)
  }

  const handleDownloadDocument = async (url: string | null | undefined, documentName: string, fileName: string) => {
    if (!url) {
      toast({
        title: "خطأ",
        description: "لا يوجد رابط للمستند",
        variant: "destructive",
      })
      return
    }

    try {
      const documentUrl = await getDocumentUrl(url)
      
      if (!documentUrl) {
        throw new Error("فشل في الحصول على رابط الملف")
      }

      // Fetch the file
      const response = await fetch(documentUrl)
      if (!response.ok) {
        throw new Error("فشل في تحميل الملف")
      }

      const blob = await response.blob()
      
      // Create a download link
      const downloadUrl = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = fileName || `${documentName}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(downloadUrl)

      toast({
        title: "تم التنزيل",
        description: `تم تنزيل ${documentName} بنجاح`,
      })
    } catch (error: any) {
      console.error('Error downloading document:', error)
      toast({
        title: "خطأ",
        description: error.message || "فشل في تنزيل الملف",
        variant: "destructive",
      })
    }
  }

  const renderDoctorCard = (doctor: DoctorWithProfile, statusLabel: string, badgeVariant: "default" | "secondary" | "destructive") => (
    <Card key={doctor.id}>
      <CardContent className="pt-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <User className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <div className="mb-1 flex items-center gap-2">
                <h3 className="font-semibold">{doctor.name}</h3>
                <Badge variant={badgeVariant}>{statusLabel}</Badge>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {doctor.specialties && doctor.specialties.length > 0 ? (
                  doctor.specialties.map((specialty, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {specialty}
                    </Badge>
                  ))
                ) : (
                  <span className="text-sm text-muted-foreground">لم يتم تحديد التخصص</span>
                )}
                {doctor.experienceYears && (
                  <span className="text-sm text-muted-foreground">
                    • {doctor.experienceYears} سنة خبرة
                  </span>
                )}
              </div>
              <div className="mt-2 flex flex-wrap gap-3 text-sm text-muted-foreground">
                {doctor.email && (
                  <div className="flex items-center gap-1">
                    <Mail className="h-3 w-3" />
                    {doctor.email}
                  </div>
                )}
                {doctor.phone && (
                  <div className="flex items-center gap-1">
                    <Phone className="h-3 w-3" />
                    {doctor.phone}
                  </div>
                )}
              </div>
              {doctor.submittedAt && (
                <p className="mt-1 text-xs text-muted-foreground">
                  تاريخ التقديم: {new Date(doctor.submittedAt).toLocaleDateString('ar-EG')}
                </p>
              )}
            </div>
          </div>
          {statusLabel === "قيد الانتظار" ? (
            <Button onClick={() => openReview(doctor)}>مراجعة الطلب</Button>
          ) : doctor.approvedAt ? (
            <p className="text-xs text-muted-foreground">تمت الموافقة في {new Date(doctor.approvedAt).toLocaleDateString('ar-EG')}</p>
          ) : null}
        </div>
      </CardContent>
    </Card>
  )

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">موافقات الأطباء</h1>
            <p className="text-muted-foreground">مراجعة وإدارة طلبات تسجيل الأطباء</p>
          </div>
          <Button variant="outline" onClick={refresh} disabled={isLoading}>
            تحديث
          </Button>
        </div>

        {/* Summary */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">قيد الانتظار</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.pending}</div>
              <p className="text-xs text-muted-foreground">في انتظار المراجعة</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">موافق عليه</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.approved}</div>
              <p className="text-xs text-muted-foreground">أطباء نشطون</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">مرفوض</CardTitle>
              <XCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.rejected}</div>
              <p className="text-xs text-muted-foreground">غير موافق عليه</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="pending" className="space-y-4">
          <TabsList>
            <TabsTrigger value="pending">قيد الانتظار ({summary.pending})</TabsTrigger>
            <TabsTrigger value="approved">موافق عليه ({summary.approved})</TabsTrigger>
            <TabsTrigger value="rejected">مرفوض ({summary.rejected})</TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4">
            {isLoading ? (
              <p className="py-6 text-center text-sm text-muted-foreground">جاري تحميل الطلبات المعلقة...</p>
            ) : pending.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">لا توجد طلبات معلقة</p>
            ) : (
              pending.map((doctor) => renderDoctorCard(doctor, "قيد الانتظار", "secondary"))
            )}
          </TabsContent>

          <TabsContent value="approved" className="space-y-4">
            {isLoading ? (
              <p className="py-6 text-center text-sm text-muted-foreground">جاري تحميل الأطباء الموافق عليهم...</p>
            ) : approved.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">لا يوجد أطباء موافق عليهم</p>
            ) : (
              approved.map((doctor) => renderDoctorCard(doctor, "موافق عليه", "default"))
            )}
          </TabsContent>

          <TabsContent value="rejected" className="space-y-4">
            {isLoading ? (
              <p className="py-6 text-center text-sm text-muted-foreground">جاري تحميل الطلبات المرفوضة...</p>
            ) : rejected.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">لا توجد طلبات مرفوضة</p>
            ) : (
              rejected.map((doctor) => renderDoctorCard(doctor, "مرفوض", "destructive"))
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Review Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>مراجعة طلب الطبيب</DialogTitle>
            <DialogDescription>راجع البيانات والمستندات ووافق أو ارفض الطلب</DialogDescription>
          </DialogHeader>

          {selectedDoctor && (
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <User className="h-8 w-8 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold">{selectedDoctor.name}</h3>
                  {selectedDoctor.specialties && selectedDoctor.specialties.length > 0 ? (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {selectedDoctor.specialties.map((specialty, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {specialty}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-sm mt-2">لم يتم تحديد التخصص</p>
                  )}
                  {selectedDoctor.submittedAt && (
                    <p className="text-xs text-muted-foreground mt-2">
                      تاريخ التقديم: {new Date(selectedDoctor.submittedAt).toLocaleDateString('ar-EG')}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {selectedDoctor.email && (
                  <div className="space-y-1">
                    <p className="text-sm font-medium flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      البريد الإلكتروني
                    </p>
                    <p className="text-sm text-muted-foreground">{selectedDoctor.email}</p>
                  </div>
                )}
                {selectedDoctor.phone && (
                  <div className="space-y-1">
                    <p className="text-sm font-medium flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      الهاتف
                    </p>
                    <p className="text-sm text-muted-foreground">{selectedDoctor.phone}</p>
                  </div>
                )}
                {selectedDoctor.experienceYears && (
                  <div className="space-y-1">
                    <p className="text-sm font-medium">سنوات الخبرة</p>
                    <p className="text-sm text-muted-foreground">{selectedDoctor.experienceYears} سنة</p>
                  </div>
                )}
                {selectedDoctor.licenseNumber && (
                  <div className="space-y-1">
                    <p className="text-sm font-medium">رقم الرخصة</p>
                    <p className="text-sm text-muted-foreground">{selectedDoctor.licenseNumber}</p>
                  </div>
                )}
              </div>

              {selectedDoctor.education && (
                <div className="space-y-1">
                  <p className="text-sm font-medium">المؤهل العلمي</p>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{selectedDoctor.education}</p>
                </div>
              )}

              {/* Documents Section */}
              <div className="rounded-lg border border-border p-4 space-y-4">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  <h4 className="font-semibold">المستندات المرفقة</h4>
                </div>
                
                <div className="grid gap-3 md:grid-cols-2">
                  {selectedDoctor.licenseDocumentUrl && (
                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        <span className="text-sm">صورة الرخصة</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => handleViewDocument(selectedDoctor.licenseDocumentUrl, 'license')}
                          title="عرض"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => handleDownloadDocument(selectedDoctor.licenseDocumentUrl, 'صورة الرخصة', `license_${selectedDoctor.name}.pdf`)}
                          title="تنزيل"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}

                  {selectedDoctor.certificateDocumentUrl && (
                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        <span className="text-sm">الشهادة العلمية</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => handleViewDocument(selectedDoctor.certificateDocumentUrl, 'certificate')}
                          title="عرض"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => handleDownloadDocument(selectedDoctor.certificateDocumentUrl, 'الشهادة العلمية', `certificate_${selectedDoctor.name}.pdf`)}
                          title="تنزيل"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}

                  {selectedDoctor.cvDocumentUrl && (
                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        <span className="text-sm">السيرة الذاتية</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => handleViewDocument(selectedDoctor.cvDocumentUrl, 'cv')}
                          title="عرض"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => handleDownloadDocument(selectedDoctor.cvDocumentUrl, 'السيرة الذاتية', `cv_${selectedDoctor.name}.pdf`)}
                          title="تنزيل"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}

                  {selectedDoctor.idDocumentUrl && (
                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        <span className="text-sm">صورة الهوية</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => handleViewDocument(selectedDoctor.idDocumentUrl, 'id')}
                          title="عرض"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => handleDownloadDocument(selectedDoctor.idDocumentUrl, 'صورة الهوية', `id_${selectedDoctor.name}.pdf`)}
                          title="تنزيل"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                {!selectedDoctor.licenseDocumentUrl && 
                 !selectedDoctor.certificateDocumentUrl && 
                 !selectedDoctor.cvDocumentUrl && 
                 !selectedDoctor.idDocumentUrl && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      لم يتم رفع أي مستندات من قبل الطبيب
                    </AlertDescription>
                  </Alert>
                )}
              </div>

              {selectedDoctor.approvalNotes && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>ملاحظات:</strong> {selectedDoctor.approvalNotes}
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex gap-2">
                <Button 
                  onClick={handleApprove} 
                  className="flex-1"
                  disabled={isProcessing}
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  {isProcessing ? "جاري الموافقة..." : "الموافقة على الطلب"}
                </Button>
                <Button 
                  onClick={handleRejectClick} 
                  variant="destructive" 
                  className="flex-1"
                  disabled={isProcessing}
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  رفض الطلب
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Document Viewer Dialog */}
      <Dialog 
        open={!!viewingDocument} 
        onOpenChange={(open) => {
          if (!open) {
            closeDocumentViewer()
          }
        }}
        modal={true}
      >
        <DialogContent 
          className="max-w-5xl max-h-[90vh] p-0"
          showCloseButton={true}
          onPointerDownOutside={(e) => {
            // Allow closing by clicking outside
            closeDocumentViewer()
          }}
          onEscapeKeyDown={(e) => {
            // Allow closing with Escape key
            closeDocumentViewer()
          }}
        >
          <DialogHeader className="px-6 pt-6">
            <DialogTitle>{viewingDocument?.name}</DialogTitle>
          </DialogHeader>
          <div className="px-6 pb-6">
            {isLoadingDocument ? (
              <div className="flex items-center justify-center h-96">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-sm text-muted-foreground">جاري تحميل المستند...</p>
                </div>
              </div>
            ) : documentUrl ? (
              <div className="relative w-full h-[70vh] border rounded-lg overflow-hidden bg-muted">
                {documentUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                  <img 
                    src={documentUrl} 
                    alt={viewingDocument?.name || "المستند"}
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      console.error("Error loading image:", e)
                      toast({
                        title: "خطأ",
                        description: "فشل في تحميل الصورة",
                        variant: "destructive",
                      })
                    }}
                  />
                ) : (
                  <iframe
                    src={documentUrl}
                    className="w-full h-full border-0"
                    title={viewingDocument?.name || "المستند"}
                    onError={() => {
                      toast({
                        title: "خطأ",
                        description: "فشل في تحميل المستند",
                        variant: "destructive",
                      })
                    }}
                  />
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center h-96">
                <p className="text-sm text-muted-foreground">فشل في تحميل المستند</p>
              </div>
            )}
          </div>
          <DialogFooter className="px-6 pb-6">
            {documentUrl && (
              <Button
                variant="outline"
                onClick={() => {
                  if (viewingDocument) {
                    handleDownloadDocument(
                      viewingDocument.url,
                      viewingDocument.name,
                      `${viewingDocument.name}.pdf`
                    )
                  }
                }}
              >
                <Download className="mr-2 h-4 w-4" />
                تنزيل
              </Button>
            )}
            <Button 
              variant="outline" 
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                closeDocumentViewer()
              }}
              type="button"
            >
              إغلاق
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>رفض طلب الطبيب</DialogTitle>
            <DialogDescription>
              يرجى إدخال سبب الرفض (اختياري). سيتم إرسال هذه الملاحظات إلى الطبيب.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="rejection-notes">سبب الرفض</Label>
              <Textarea
                id="rejection-notes"
                placeholder="مثال: المستندات المرفقة غير واضحة، يرجى إعادة تحميل الرخصة..."
                value={rejectionNotes}
                onChange={(e) => setRejectionNotes(e.target.value)}
                rows={4}
                disabled={isProcessing}
              />
            </div>
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowRejectDialog(false)}
              disabled={isProcessing}
            >
              إلغاء
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleRejectConfirm}
              disabled={isProcessing}
            >
              {isProcessing ? "جاري الرفض..." : "تأكيد الرفض"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}
