"use client";

import { useState, useEffect, useRef } from "react";
import { useDoctorAvailability } from "@/hooks/use-doctor-availability";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import type { TimeSlot } from "@/types/appointments";

interface TimeSlotPickerProps {
  doctorId: string;
  onSelectSlot: (date: Date, slot: TimeSlot) => void;
  selectedDate?: Date;
  selectedSlot?: TimeSlot;
}

export function TimeSlotPicker({
  doctorId,
  onSelectSlot,
  selectedDate: externalSelectedDate,
  selectedSlot: externalSelectedSlot,
}: TimeSlotPickerProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    externalSelectedDate || undefined
  );
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | undefined>(
    externalSelectedSlot
  );
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);

  const { generateTimeSlots, availability, isLoading: isLoadingAvailability } = useDoctorAvailability(doctorId);

  // Cache for time slots
  const slotsCacheRef = useRef<Map<string, { slots: TimeSlot[], timestamp: number }>>(new Map());
  const CACHE_DURATION = 60000; // 1 minute cache

  // جلب الـ time slots عند تغيير التاريخ
  useEffect(() => {
    if (!selectedDate) {
      setAvailableSlots([]);
      return;
    }

    const cacheKey = `${doctorId}-${selectedDate.toISOString().split('T')[0]}`;
    const cached = slotsCacheRef.current.get(cacheKey);
    const now = Date.now();

    // Check cache first
    if (cached && (now - cached.timestamp) < CACHE_DURATION) {
      // Filter out past slots
      const validSlots = cached.slots.filter(slot => {
        const [hours, minutes] = slot.start.split(':');
        const slotTime = new Date(selectedDate);
        slotTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
        return slotTime > new Date();
      });

      if (validSlots.length > 0) {
        setAvailableSlots(validSlots);
        setIsLoadingSlots(false);
        return;
      }
    }

    // Don't generate slots if availability is not loaded yet
    if (isLoadingAvailability || availability.length === 0) {
      return;
    }

    setIsLoadingSlots(true);
    generateTimeSlots(selectedDate)
      .then((slots) => {
        // Cache the slots
        slotsCacheRef.current.set(cacheKey, { slots, timestamp: now });
        setAvailableSlots(slots);
      })
      .catch((error) => {
        console.error("Error generating time slots:", error);
        setAvailableSlots([]);
      })
      .finally(() => {
        setIsLoadingSlots(false);
      });
  }, [selectedDate, generateTimeSlots, doctorId, isLoadingAvailability, availability]);

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    setSelectedSlot(undefined);
  };

  const handleSlotSelect = (slot: TimeSlot) => {
    if (!slot.isAvailable || !selectedDate) return;

    setSelectedSlot(slot);
    onSelectSlot(selectedDate, slot);
  };

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* اختيار التاريخ */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            اختر التاريخ
          </CardTitle>
          <CardDescription>اختر اليوم المناسب لموعدك</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleDateSelect}
            disabled={(date) => date < tomorrow}
            locale={ar}
            className="rounded-md border"
          />
        </CardContent>
      </Card>

      {/* اختيار الوقت */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            اختر الوقت
          </CardTitle>
          <CardDescription>
            {selectedDate
              ? `الأوقات المتاحة في ${format(selectedDate, "d MMMM yyyy", { locale: ar })}`
              : "اختر تاريخاً أولاً"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!selectedDate ? (
            <div className="flex items-center justify-center h-48 text-muted-foreground">
              <p>الرجاء اختيار تاريخ أولاً</p>
            </div>
          ) : isLoadingSlots ? (
            <div className="flex items-center justify-center h-48">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
            </div>
          ) : availableSlots.length === 0 ? (
            <div className="flex items-center justify-center h-48 text-muted-foreground">
              <p>لا توجد أوقات متاحة في هذا اليوم</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2 max-h-96 overflow-y-auto">
              {availableSlots.map((slot, index) => (
                <Button
                  key={index}
                  variant={
                    selectedSlot?.start === slot.start
                      ? "default"
                      : slot.isAvailable
                      ? "outline"
                      : "ghost"
                  }
                  disabled={!slot.isAvailable}
                  onClick={() => handleSlotSelect(slot)}
                  className="relative"
                >
                  <span className="text-xs">{slot.start}</span>
                  {slot.isBooked && (
                    <Badge
                      variant="destructive"
                      className="absolute -top-2 -right-2 h-4 px-1 text-[10px]"
                    >
                      محجوز
                    </Badge>
                  )}
                </Button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

