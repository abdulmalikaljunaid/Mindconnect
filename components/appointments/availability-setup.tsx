"use client";

import { useState } from "react";
import { useDoctorAvailability } from "@/hooks/use-doctor-availability";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Trash2, Plus, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AvailabilitySetupProps {
  doctorId: string;
}

const WEEKDAYS = [
  { value: 0, label: "الأحد" },
  { value: 1, label: "الإثنين" },
  { value: 2, label: "الثلاثاء" },
  { value: 3, label: "الأربعاء" },
  { value: 4, label: "الخميس" },
  { value: 5, label: "الجمعة" },
  { value: 6, label: "السبت" },
];

const SLOT_DURATIONS = [
  { value: 15, label: "15 دقيقة" },
  { value: 30, label: "30 دقيقة" },
  { value: 45, label: "45 دقيقة" },
  { value: 60, label: "ساعة واحدة" },
];

export function AvailabilitySetup({ doctorId }: AvailabilitySetupProps) {
  const { availability, isLoading, addAvailability, deleteAvailability } = useDoctorAvailability(doctorId);
  const { toast } = useToast();

  const [newSlot, setNewSlot] = useState({
    weekday: 0,
    startTime: "09:00",
    endTime: "17:00",
    slotDuration: 30,
  });

  const handleAddSlot = async () => {
    if (newSlot.startTime >= newSlot.endTime) {
      toast({
        title: "خطأ",
        description: "وقت البداية يجب أن يكون قبل وقت النهاية",
        variant: "destructive",
      });
      return;
    }

    const success = await addAvailability({
      weekday: newSlot.weekday,
      start_time: newSlot.startTime,
      end_time: newSlot.endTime,
      slot_duration_minutes: newSlot.slotDuration,
      is_active: true,
    });

    if (success) {
      // إعادة تعيين النموذج
      setNewSlot({
        weekday: 0,
        startTime: "09:00",
        endTime: "17:00",
        slotDuration: 30,
      });
    }
  };

  // تجميع الأوقات حسب اليوم
  const availabilityByDay = WEEKDAYS.map((day) => ({
    ...day,
    slots: availability.filter((a) => a.weekday === day.value),
  }));

  return (
    <div className="space-y-6">
      {/* إضافة وقت توفر جديد */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            إضافة وقت توفر جديد
          </CardTitle>
          <CardDescription>
            حدد الأيام والأوقات التي تكون متاحاً فيها لاستقبال المرضى
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>اليوم</Label>
              <Select
                value={newSlot.weekday.toString()}
                onValueChange={(value) =>
                  setNewSlot({ ...newSlot, weekday: parseInt(value) })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {WEEKDAYS.map((day) => (
                    <SelectItem key={day.value} value={day.value.toString()}>
                      {day.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>مدة الجلسة</Label>
              <Select
                value={newSlot.slotDuration.toString()}
                onValueChange={(value) =>
                  setNewSlot({ ...newSlot, slotDuration: parseInt(value) })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SLOT_DURATIONS.map((duration) => (
                    <SelectItem key={duration.value} value={duration.value.toString()}>
                      {duration.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>من الساعة</Label>
              <Input
                type="time"
                value={newSlot.startTime}
                onChange={(e) =>
                  setNewSlot({ ...newSlot, startTime: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label>إلى الساعة</Label>
              <Input
                type="time"
                value={newSlot.endTime}
                onChange={(e) =>
                  setNewSlot({ ...newSlot, endTime: e.target.value })
                }
              />
            </div>
          </div>

          <Button onClick={handleAddSlot} disabled={isLoading} className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            إضافة
          </Button>
        </CardContent>
      </Card>

      {/* عرض الأوقات الحالية */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Clock className="h-5 w-5" />
          جدول التوفر الحالي
        </h3>

        {availabilityByDay.map((day) => (
          <Card key={day.value}>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">{day.label}</CardTitle>
            </CardHeader>
            <CardContent>
              {day.slots.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  لا توجد أوقات محددة لهذا اليوم
                </p>
              ) : (
                <div className="space-y-2">
                  {day.slots.map((slot) => (
                    <div
                      key={slot.id}
                      className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">
                          {slot.start_time.slice(0, 5)} - {slot.end_time.slice(0, 5)}
                        </span>
                        <Badge variant="outline">
                          {slot.slot_duration_minutes} دقيقة
                        </Badge>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteAvailability(slot.id)}
                        disabled={isLoading}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

