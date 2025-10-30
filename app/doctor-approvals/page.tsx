"use client"

import { useMemo, useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { User, Mail, Phone, Award, CheckCircle, XCircle, Clock, FileText, ExternalLink, Download, AlertCircle } from "lucide-react"
import { useAdminDoctors, type DoctorWithProfile } from "@/hooks/use-doctors"
import { supabaseClient } from "@/lib/supabase-client"
import { useToast } from "@/hooks/use-toast"

export default function DoctorApprovalsPage() {
  const [selectedDoctor, setSelectedDoctor] = useState<DoctorWithProfile | null>(null)
  const [showDialog, setShowDialog] = useState(false)
  const [showRejectDialog, setShowRejectDialog] = useState(false)
  const [rejectionNotes, setRejectionNotes] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
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

  const handleViewDocument = async (url: string | null | undefined) => {
    if (!url) return

    try {
      // استخراج اسم الملف من الـ URL
      const urlObj = new URL(url)
      const pathParts = urlObj.pathname.split('/object/public/doctor-documents/')
      if (pathParts.length < 2) {
        toast({
          title: "خطأ",
          description: "رابط الملف غير صحيح",
          variant: "destructive",
        })
        return
      }

      const filePath = pathParts[1]

      // الحصول على signed URL
      const { data, error } = await supabaseClient.storage
        .from('doctor-documents')
        .createSignedUrl(filePath, 60) // صالح لمدة 60 ثانية

      if (error) {
        console.error('Error creating signed URL:', error)
        toast({
          title: "خطأ في فتح الملف",
          description: error.message,
          variant: "destructive",
        })
        return
      }

      if (data?.signedUrl) {
        window.open(data.signedUrl, '_blank')
      }
    } catch (error) {
      console.error('Error viewing document:', error)
      toast({
        title: "خطأ",
        description: "فشل في فتح الملف",
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
              <p className="text-sm text-muted-foreground">
                {doctor.specialties.join(" • ") || "Specialty not provided"}
                {doctor.experienceYears ? ` • ${doctor.experienceYears} years experience` : ""}
              </p>
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
                  Submitted: {new Date(doctor.submittedAt).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
          {statusLabel === "Pending" ? (
            <Button onClick={() => openReview(doctor)}>Review Application</Button>
          ) : doctor.approvedAt ? (
            <p className="text-xs text-muted-foreground">Approved {new Date(doctor.approvedAt).toLocaleDateString()}</p>
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
            <h1 className="text-3xl font-bold">Doctor Approvals</h1>
            <p className="text-muted-foreground">Review and manage doctor registration requests</p>
          </div>
          <Button variant="outline" onClick={refresh} disabled={isLoading}>
            Refresh
          </Button>
        </div>

        {/* Summary */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.pending}</div>
              <p className="text-xs text-muted-foreground">Awaiting review</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Approved</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.approved}</div>
              <p className="text-xs text-muted-foreground">Active doctors</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rejected</CardTitle>
              <XCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.rejected}</div>
              <p className="text-xs text-muted-foreground">Not approved</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="pending" className="space-y-4">
          <TabsList>
            <TabsTrigger value="pending">Pending ({summary.pending})</TabsTrigger>
            <TabsTrigger value="approved">Approved ({summary.approved})</TabsTrigger>
            <TabsTrigger value="rejected">Rejected ({summary.rejected})</TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4">
            {isLoading ? (
              <p className="py-6 text-center text-sm text-muted-foreground">Loading pending applications...</p>
            ) : pending.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">No pending applications</p>
            ) : (
              pending.map((doctor) => renderDoctorCard(doctor, "Pending", "secondary"))
            )}
          </TabsContent>

          <TabsContent value="approved" className="space-y-4">
            {isLoading ? (
              <p className="py-6 text-center text-sm text-muted-foreground">Loading approved doctors...</p>
            ) : approved.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">No approved doctors</p>
            ) : (
              approved.map((doctor) => renderDoctorCard(doctor, "Approved", "default"))
            )}
          </TabsContent>

          <TabsContent value="rejected" className="space-y-4">
            {isLoading ? (
              <p className="py-6 text-center text-sm text-muted-foreground">Loading rejected applications...</p>
            ) : rejected.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">No rejected applications</p>
            ) : (
              rejected.map((doctor) => renderDoctorCard(doctor, "Rejected", "destructive"))
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
                  <p className="text-muted-foreground">{selectedDoctor.specialties.join(" • ") || "لم يتم تحديد التخصص"}</p>
                  {selectedDoctor.submittedAt && (
                    <p className="text-xs text-muted-foreground mt-1">
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
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => handleViewDocument(selectedDoctor.licenseDocumentUrl)}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>
                  )}

                  {selectedDoctor.certificateDocumentUrl && (
                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        <span className="text-sm">الشهادة العلمية</span>
                      </div>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => handleViewDocument(selectedDoctor.certificateDocumentUrl)}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>
                  )}

                  {selectedDoctor.cvDocumentUrl && (
                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        <span className="text-sm">السيرة الذاتية</span>
                      </div>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => handleViewDocument(selectedDoctor.cvDocumentUrl)}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>
                  )}

                  {selectedDoctor.idDocumentUrl && (
                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        <span className="text-sm">صورة الهوية</span>
                      </div>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => handleViewDocument(selectedDoctor.idDocumentUrl)}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
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
