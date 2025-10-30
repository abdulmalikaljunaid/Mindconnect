"use client";

import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { ProtectedRoute } from "@/components/protected-route";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus, Loader2, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";
import {
  usePatientAppointments,
  useDoctorAppointments,
  useCompanionAppointments,
} from "@/hooks/use-appointments";
import { AppointmentCard } from "@/components/appointments/appointment-card";
import { AppointmentDetailsDialog } from "@/components/appointments/appointment-details-dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import type { AppointmentTab } from "@/types/appointments";

export default function AppointmentsPage() {
  const { user } = useAuth();
  const [selectedTab, setSelectedTab] = useState<AppointmentTab>("all");
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);

  // اختيار الـ hook المناسب حسب دور المستخدم
  const patientAppointments = usePatientAppointments();
  const doctorAppointments = useDoctorAppointments();
  const companionAppointments = useCompanionAppointments();

  const appointmentsData =
    user?.role === "doctor"
      ? doctorAppointments
      : user?.role === "companion"
      ? companionAppointments
      : patientAppointments;

  const {
    appointments,
    upcoming,
    past,
    pending,
    confirmed,
    completed,
    cancelled,
    isLoading,
    error,
    confirmAppointment,
    rejectAppointment,
    cancelAppointment,
    getAppointmentById,
  } = appointmentsData;

  const handleViewDetails = (id: string) => {
    setSelectedAppointmentId(id);
    setShowDetailsDialog(true);
  };

  const handleConfirmClick = async (id: string) => {
    setSelectedAppointmentId(id);
    setShowDetailsDialog(true);
  };

  const handleRejectClick = async (id: string) => {
    setSelectedAppointmentId(id);
    setShowDetailsDialog(true);
  };

  const handleConfirm = async (notes?: string) => {
    if (!selectedAppointmentId) return;
    const success = await confirmAppointment({
      appointmentId: selectedAppointmentId,
      notes,
    } as any);
    if (success) {
      setShowDetailsDialog(false);
      setSelectedAppointmentId(null);
    }
  };

  const handleReject = async (reason: string) => {
    if (!selectedAppointmentId) return;
    const success = await rejectAppointment({
      appointmentId: selectedAppointmentId,
      rejectionReason: reason,
    } as any);
    if (success) {
      setShowDetailsDialog(false);
      setSelectedAppointmentId(null);
    }
  };

  const handleCancel = async (notes?: string) => {
    if (!selectedAppointmentId) return;
    const success = await cancelAppointment(selectedAppointmentId, notes);
    if (success) {
      setShowDetailsDialog(false);
      setSelectedAppointmentId(null);
    }
  };

  // جلب بيانات الموعد المحدد عند تغيير ID أو فتح الـ dialog
  const selectedAppointment = selectedAppointmentId 
    ? appointments.find(apt => apt.id === selectedAppointmentId) || null
    : null;

  if (!user) return null;

  const getTabAppointments = (tab: AppointmentTab) => {
    switch (tab) {
      case "all":
        return appointments;
      case "pending":
        return pending;
      case "confirmed":
        return confirmed;
      case "completed":
        return completed;
      case "cancelled":
        return cancelled;
      default:
        return appointments;
    }
  };

  return (
    <ProtectedRoute allowedRoles={["patient", "doctor", "companion"]}>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">المواعيد</h1>
              <p className="text-muted-foreground">
                {user.role === "doctor"
                  ? "إدارة طلبات المواعيد والجدول الزمني"
                  : "إدارة مواعيدك مع الأطباء"}
              </p>
            </div>
            {(user.role === "patient" || user.role === "companion") && (
              <Button asChild>
                <Link href="/find-doctors">
                  <Plus className="mr-2 h-4 w-4" />
                  حجز موعد جديد
                </Link>
              </Button>
            )}
          </div>

          {/* Error Alert */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>خطأ</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Loading State */}
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
              {/* Tabs */}
              <Tabs value={selectedTab} onValueChange={(val) => setSelectedTab(val as AppointmentTab)}>
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="all">
                    الكل ({appointments.length})
                  </TabsTrigger>
                  <TabsTrigger value="pending">
                    قيد الانتظار ({pending.length})
                  </TabsTrigger>
                  <TabsTrigger value="confirmed">
                    مؤكد ({confirmed.length})
                  </TabsTrigger>
                  <TabsTrigger value="completed">
                    مكتمل ({completed.length})
                  </TabsTrigger>
                  <TabsTrigger value="cancelled">
                    ملغي ({cancelled.length})
                  </TabsTrigger>
                </TabsList>

                {["all", "pending", "confirmed", "completed", "cancelled"].map((tab) => (
                  <TabsContent key={tab} value={tab} className="space-y-4">
                    {getTabAppointments(tab as AppointmentTab).length === 0 ? (
                      <div className="text-center py-12">
                        <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium mb-2">لا توجد مواعيد</h3>
                        <p className="text-muted-foreground">
                          {tab === "all"
                            ? "لم تقم بحجز أي مواعيد بعد"
                            : `لا توجد مواعيد ${
                                tab === "pending"
                                  ? "قيد الانتظار"
                                  : tab === "confirmed"
                                  ? "مؤكدة"
                                  : tab === "completed"
                                  ? "مكتملة"
                                  : "ملغاة"
                              }`}
                        </p>
                      </div>
                    ) : (
                      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {getTabAppointments(tab as AppointmentTab).map((appointment) => (
                          <AppointmentCard
                            key={appointment.id}
                            id={appointment.id}
                            scheduledAt={appointment.scheduledAt}
                            duration={appointment.durationMinutes}
                            status={appointment.status}
                            mode={appointment.mode}
                            reason={appointment.reason}
                            consultationFee={appointment.consultationFee}
                            doctorName={appointment.doctorName}
                            patientName={appointment.patientName}
                            rejectionReason={appointment.rejectionReason}
                            onConfirm={
                              user.role === "doctor"
                                ? handleConfirmClick
                                : undefined
                            }
                            onReject={
                              user.role === "doctor"
                                ? handleRejectClick
                                : undefined
                            }
                            onCancel={
                              user.role === "patient" || user.role === "companion"
                                ? handleViewDetails
                                : undefined
                            }
                            onViewDetails={handleViewDetails}
                            showActions={true}
                            userRole={user.role === "admin" ? "doctor" : user.role}
                          />
                        ))}
                      </div>
                    )}
                  </TabsContent>
                ))}
              </Tabs>
            </>
          )}

          {/* Appointment Details Dialog */}
          <AppointmentDetailsDialog
            open={showDetailsDialog}
            onClose={() => {
              setShowDetailsDialog(false);
              setSelectedAppointmentId(null);
            }}
            appointment={selectedAppointment}
            userRole={user.role === "admin" ? "doctor" : user.role}
            onConfirm={user.role === "doctor" ? handleConfirm : undefined}
            onReject={user.role === "doctor" ? handleReject : undefined}
            onCancel={
              user.role === "patient" || user.role === "companion"
                ? handleCancel
                : undefined
            }
            isLoading={false}
          />
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
