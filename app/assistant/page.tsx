"use client";

import { DashboardLayout } from "@/components/dashboard-layout";
import { ProtectedRoute } from "@/components/protected-route";
import { ChatInterface } from "@/components/assistant/chat-interface";

export default function AssistantPage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="flex flex-col h-[calc(100vh-8rem)]">
          <div className="mb-6">
            <h1 className="text-3xl font-bold">المساعد الذكي</h1>
            <p className="text-muted-foreground mt-2">
              اسألني عن أي شيء أو اطلب مني تنفيذ عمليات مثل حجز مواعيد، البحث عن أطباء، وغيرها
            </p>
          </div>
          <div className="flex-1 min-h-0">
            <ChatInterface />
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}



