"use client";

import { DashboardLayout } from "@/components/dashboard-layout";
import { AvailabilitySetup } from "@/components/appointments/availability-setup";
import { useAuth } from "@/contexts/auth-context";
import { ProtectedRoute } from "@/components/protected-route";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export default function AvailabilityPage() {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  return (
    <ProtectedRoute allowedRoles={["doctor"]}>
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">إدارة التوفر</h1>
            <p className="text-muted-foreground">
              حدد الأيام والأوقات التي تكون متاحاً فيها لاستقبال المرضى
            </p>
          </div>

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              تأكد من تحديد أوقات التوفر الخاصة بك لكي يتمكن المرضى من حجز مواعيد معك.
              يمكنك إضافة أو حذف الأوقات في أي وقت.
            </AlertDescription>
          </Alert>

          <AvailabilitySetup doctorId={user.id} />
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
