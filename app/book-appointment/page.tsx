"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { User, Star, Video, MapPin, CalendarIcon, Clock, ArrowRight, ArrowLeft, Brain } from "lucide-react"
import { fetchApprovedDoctors } from "@/lib/server/doctor-matcher"
import type { Doctor } from "@/types/assessment"

export default function BookAppointmentPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const doctorId = searchParams.get("doctorId") || searchParams.get("doctor")

  const [step, setStep] = useState(1)
  const [selectedDoctor, setSelectedDoctor] = useState(doctorId || "")
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [selectedTime, setSelectedTime] = useState("")
  const [appointmentType, setAppointmentType] = useState<"video" | "in-person">("video")
  const [notes, setNotes] = useState("")
  const [preSelectedDoctor, setPreSelectedDoctor] = useState<Doctor | null>(null)
  const [availableDoctors, setAvailableDoctors] = useState<Doctor[]>([])

  // تحميل الطبيب المختار من localStorage إذا كان موجوداً
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedDoctor = localStorage.getItem("selectedDoctor")
      if (savedDoctor) {
        try {
          const doctor = JSON.parse(savedDoctor) as Doctor
          setPreSelectedDoctor(doctor)
          setSelectedDoctor(doctor.id)
        } catch (error) {
          console.error("Error parsing saved doctor:", error)
        }
      }
    }
  }, [])

  useEffect(() => {
    const loadDoctors = async () => {
      const doctors = await fetchApprovedDoctors()
      setAvailableDoctors(doctors)
    }

    loadDoctors()
  }, [])

  const doctors = availableDoctors

  const timeSlots = ["9:00 AM", "10:00 AM", "11:00 AM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM"]

  const handleBooking = () => {
    // In a real app, this would make an API call
    router.push("/booking-confirmation")
  }

  const selectedDoctorData = doctors.find((d) => d.id === selectedDoctor)

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-4xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold">احجز موعدك</h1>
          <p className="text-muted-foreground">جدولة جلسة مع متخصص في الصحة النفسية</p>
        </div>

        {/* عرض الطبيب المختار مسبقاً من التقييم */}
        {preSelectedDoctor && (
          <Card className="border-l-4 border-l-primary bg-primary/5">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">الطبيب المقترح لك</CardTitle>
              </div>
              <CardDescription>
                تم اختيار هذا الطبيب بناءً على تقييمك الذكي
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <User className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">{preSelectedDoctor.nameAr}</h3>
                  <p className="text-sm text-muted-foreground">{preSelectedDoctor.name}</p>
                  <div className="flex items-center gap-4 mt-1">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm">{preSelectedDoctor.rating}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {preSelectedDoctor.experience} سنة خبرة
                    </span>
                  </div>
                </div>
                <Badge className="bg-primary/10 text-primary">
                  مقترح لك
                </Badge>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-2">
          {[1, 2, 3, 4].map((stepNumber) => (
            <div key={stepNumber} className="flex items-center">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                  step >= stepNumber ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                }`}
              >
                {stepNumber}
              </div>
              {stepNumber < 4 && <div className={`h-0.5 w-12 ${step > stepNumber ? "bg-primary" : "bg-muted"}`} />}
            </div>
          ))}
        </div>

        {/* Step 1: Select Doctor */}
        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle>Select a Doctor</CardTitle>
              <CardDescription>Choose the mental health professional you'd like to see</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <RadioGroup value={selectedDoctor} onValueChange={setSelectedDoctor}>
                {doctors.map((doctor) => (
                  <div
                    key={doctor.id}
                    className="flex items-center space-x-3 rounded-lg border border-border p-4 hover:bg-accent"
                  >
                    <RadioGroupItem value={doctor.id} id={doctor.id} />
                    <Label htmlFor={doctor.id} className="flex flex-1 cursor-pointer items-start gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                        <User className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="mb-1 flex items-center gap-2">
                          <h3 className="font-semibold">{doctor.name}</h3>
                          <Badge variant="secondary">{doctor.availability}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {doctor.specialty} • {doctor.experience} experience
                        </p>
                        <div className="mt-1 flex items-center gap-2 text-sm">
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 fill-accent text-accent" />
                            <span className="font-medium">{doctor.rating}</span>
                            <span className="text-muted-foreground">({doctor.reviews})</span>
                          </div>
                        </div>
                        <div className="mt-2 flex flex-wrap gap-1">
                          {doctor.specializations.map((spec) => (
                            <Badge key={spec} variant="outline" className="text-xs">
                              {spec}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </Label>
                  </div>
                ))}
              </RadioGroup>

              <div className="flex justify-end">
                <Button onClick={() => setStep(2)} disabled={!selectedDoctor}>
                  Next
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Select Date & Time */}
        {step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle>Select Date & Time</CardTitle>
              <CardDescription>Choose when you'd like to have your appointment</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <Label className="mb-3 block">Select Date</Label>
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    disabled={(date) => date < new Date()}
                    className="rounded-md border"
                  />
                </div>

                <div>
                  <Label className="mb-3 block">Available Time Slots</Label>
                  {selectedDate ? (
                    <div className="grid gap-2">
                      {timeSlots.map((time) => (
                        <Button
                          key={time}
                          variant={selectedTime === time ? "default" : "outline"}
                          className={selectedTime === time ? "" : "bg-transparent"}
                          onClick={() => setSelectedTime(time)}
                        >
                          <Clock className="mr-2 h-4 w-4" />
                          {time}
                        </Button>
                      ))}
                    </div>
                  ) : (
                    <div className="flex h-full items-center justify-center rounded-lg border border-dashed border-border p-8 text-center">
                      <div>
                        <CalendarIcon className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">Select a date to see available times</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setStep(1)} className="bg-transparent">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                <Button onClick={() => setStep(3)} disabled={!selectedDate || !selectedTime}>
                  Next
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Appointment Type & Notes */}
        {step === 3 && (
          <Card>
            <CardHeader>
              <CardTitle>Appointment Details</CardTitle>
              <CardDescription>Choose appointment type and add any notes</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label>Appointment Type</Label>
                <RadioGroup value={appointmentType} onValueChange={(value: any) => setAppointmentType(value)}>
                  <div className="flex items-center space-x-3 rounded-lg border border-border p-4 hover:bg-accent">
                    <RadioGroupItem value="video" id="video" />
                    <Label htmlFor="video" className="flex flex-1 cursor-pointer items-center gap-3">
                      <Video className="h-5 w-5 text-primary" />
                      <div>
                        <div className="font-medium">Video Call</div>
                        <div className="text-sm text-muted-foreground">Meet online from anywhere</div>
                      </div>
                    </Label>
                  </div>

                  <div className="flex items-center space-x-3 rounded-lg border border-border p-4 hover:bg-accent">
                    <RadioGroupItem value="in-person" id="in-person" />
                    <Label htmlFor="in-person" className="flex flex-1 cursor-pointer items-center gap-3">
                      <MapPin className="h-5 w-5 text-primary" />
                      <div>
                        <div className="font-medium">In-Person</div>
                        <div className="text-sm text-muted-foreground">Visit the doctor's office</div>
                      </div>
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Additional Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Share any concerns or topics you'd like to discuss..."
                  rows={4}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setStep(2)} className="bg-transparent">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                <Button onClick={() => setStep(4)}>
                  Next
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 4: Review & Confirm */}
        {step === 4 && selectedDoctorData && (
          <Card>
            <CardHeader>
              <CardTitle>Review & Confirm</CardTitle>
              <CardDescription>Please review your appointment details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-start gap-4 rounded-lg border border-border p-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <User className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">{selectedDoctorData.name}</h3>
                    <p className="text-sm text-muted-foreground">{selectedDoctorData.specialty}</p>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-lg border border-border p-4">
                    <div className="mb-1 flex items-center gap-2 text-sm text-muted-foreground">
                      <CalendarIcon className="h-4 w-4" />
                      Date & Time
                    </div>
                    <p className="font-medium">
                      {selectedDate?.toLocaleDateString("en-US", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                    <p className="text-sm text-muted-foreground">{selectedTime}</p>
                  </div>

                  <div className="rounded-lg border border-border p-4">
                    <div className="mb-1 flex items-center gap-2 text-sm text-muted-foreground">
                      {appointmentType === "video" ? (
                        <>
                          <Video className="h-4 w-4" />
                          Appointment Type
                        </>
                      ) : (
                        <>
                          <MapPin className="h-4 w-4" />
                          Appointment Type
                        </>
                      )}
                    </div>
                    <p className="font-medium">{appointmentType === "video" ? "Video Call" : "In-Person"}</p>
                    <p className="text-sm text-muted-foreground">
                      {appointmentType === "video" ? "Online session" : "Office visit"}
                    </p>
                  </div>
                </div>

                {notes && (
                  <div className="rounded-lg border border-border p-4">
                    <div className="mb-1 text-sm text-muted-foreground">Your Notes</div>
                    <p className="text-sm">{notes}</p>
                  </div>
                )}
              </div>

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setStep(3)} className="bg-transparent">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                <Button onClick={handleBooking}>Confirm Booking</Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
