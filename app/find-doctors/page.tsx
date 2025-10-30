"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ProtectedRoute } from "@/components/protected-route";
import { User, Search, Star, Video, Phone, MessageSquare, MapPin, Calendar, Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { SkeletonDoctorCard } from "@/components/ui/skeleton-loader";
import { useApprovedDoctors } from "@/hooks/use-doctors";

export default function FindDoctorsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [specialty, setSpecialty] = useState("all");
  const [consultationMode, setConsultationMode] = useState("all");
  const { approved: doctors, isLoading, error } = useApprovedDoctors();

  const filteredDoctors = useMemo(() => {
    const lowerQuery = searchQuery.toLowerCase();
    return doctors.filter((doctor) => {
      const matchesSearch =
        doctor.name.toLowerCase().includes(lowerQuery) ||
        doctor.specialties.some((s) => s.toLowerCase().includes(lowerQuery));

      const matchesSpecialty =
        specialty === "all" || doctor.specialties.includes(specialty);

      const matchesMode =
        consultationMode === "all" ||
        (consultationMode === "video" && doctor.offersVideo) ||
        (consultationMode === "audio" && doctor.offersAudio) ||
        (consultationMode === "messaging" && doctor.offersMessaging) ||
        (consultationMode === "in_person" && doctor.offersInPerson);

      return matchesSearch && matchesSpecialty && matchesMode;
    });
  }, [doctors, searchQuery, specialty, consultationMode]);

  const specialties = useMemo(() => {
    const unique = new Set<string>();
    doctors.forEach((doctor) => doctor.specialties.forEach((spec) => unique.add(spec)));
    return Array.from(unique);
  }, [doctors]);

  const getModeIcon = (mode: string) => {
    switch (mode) {
      case "video":
        return <Video className="h-4 w-4" />;
      case "audio":
        return <Phone className="h-4 w-4" />;
      case "messaging":
        return <MessageSquare className="h-4 w-4" />;
      case "in_person":
        return <MapPin className="h-4 w-4" />;
    }
  };

  const getModeLabel = (mode: string) => {
    switch (mode) {
      case "video":
        return "فيديو";
      case "audio":
        return "صوت";
      case "messaging":
        return "رسائل";
      case "in_person":
        return "حضوري";
    }
  };

  return (
    <ProtectedRoute allowedRoles={["patient", "companion"]}>
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">البحث عن طبيب</h1>
            <p className="text-muted-foreground">
              تصفح شبكتنا من الأطباء المعتمدين واحجز موعدك
            </p>
          </div>

          {/* Filters */}
          <div className="grid gap-4 md:grid-cols-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="ابحث بالاسم أو التخصص..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={specialty} onValueChange={setSpecialty}>
              <SelectTrigger>
                <SelectValue placeholder="التخصص" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع التخصصات</SelectItem>
                {specialties.map((spec) => (
                  <SelectItem key={spec} value={spec}>
                    {spec}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={consultationMode} onValueChange={setConsultationMode}>
              <SelectTrigger>
                <SelectValue placeholder="نوع الاستشارة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الأنواع</SelectItem>
                <SelectItem value="video">استشارة فيديو</SelectItem>
                <SelectItem value="audio">استشارة صوتية</SelectItem>
                <SelectItem value="messaging">استشارة كتابية</SelectItem>
                <SelectItem value="in_person">زيارة حضورية</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Results Count */}
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              {isLoading
                ? "جارٍ التحميل..."
                : `عرض ${filteredDoctors.length} ${
                    filteredDoctors.length === 1 ? "طبيب" : "أطباء"
                  }`}
            </p>
            {error && (
              <Alert variant="destructive">
                <AlertTitle>خطأ</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </div>

          {/* Doctor Cards */}
          {isLoading ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <SkeletonDoctorCard />
              <SkeletonDoctorCard />
              <SkeletonDoctorCard />
            </div>
          ) : filteredDoctors.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-muted-foreground">لم يتم العثور على أطباء</p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredDoctors.map((doctor) => {
                // حساب أقل سعر متاح
                const availableFees = [
                  doctor.videoConsultationFee,
                  doctor.audioConsultationFee,
                  doctor.messagingConsultationFee,
                  doctor.inPersonConsultationFee,
                ].filter((fee) => fee !== null) as number[];

                const minFee =
                  availableFees.length > 0 ? Math.min(...availableFees) : null;

                return (
                  <Card key={doctor.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start gap-4">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                          <User className="h-8 w-8 text-primary" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-lg">{doctor.name}</h3>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {doctor.specialties.slice(0, 2).map((spec, i) => (
                              <Badge key={i} variant="secondary" className="text-xs">
                                {spec}
                              </Badge>
                            ))}
                            {doctor.specialties.length > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{doctor.specialties.length - 2}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-3">
                      {/* الخبرة */}
                      {doctor.experienceYears && (
                        <p className="text-sm text-muted-foreground">
                          {doctor.experienceYears} سنوات خبرة
                        </p>
                      )}

                      {/* أنواع الاستشارات */}
                      <div className="flex flex-wrap gap-2">
                        {doctor.offersVideo && (
                          <Badge variant="outline" className="gap-1">
                            {getModeIcon("video")}
                            <span>{getModeLabel("video")}</span>
                            {doctor.videoConsultationFee && (
                              <span className="text-green-600 font-medium">
                                {doctor.videoConsultationFee} ر.س
                              </span>
                            )}
                          </Badge>
                        )}
                        {doctor.offersAudio && (
                          <Badge variant="outline" className="gap-1">
                            {getModeIcon("audio")}
                            <span>{getModeLabel("audio")}</span>
                            {doctor.audioConsultationFee && (
                              <span className="text-green-600 font-medium">
                                {doctor.audioConsultationFee} ر.س
                              </span>
                            )}
                          </Badge>
                        )}
                        {doctor.offersMessaging && (
                          <Badge variant="outline" className="gap-1">
                            {getModeIcon("messaging")}
                            <span>{getModeLabel("messaging")}</span>
                            {doctor.messagingConsultationFee && (
                              <span className="text-green-600 font-medium">
                                {doctor.messagingConsultationFee} ر.س
                              </span>
                            )}
                          </Badge>
                        )}
                        {doctor.offersInPerson && (
                          <Badge variant="outline" className="gap-1">
                            {getModeIcon("in_person")}
                            <span>{getModeLabel("in_person")}</span>
                            {doctor.inPersonConsultationFee && (
                              <span className="text-green-600 font-medium">
                                {doctor.inPersonConsultationFee} ر.س
                              </span>
                            )}
                          </Badge>
                        )}
                      </div>

                      {/* السعر الأدنى */}
                      {minFee && (
                        <p className="text-sm text-muted-foreground">
                          يبدأ من <span className="font-bold text-green-600">{minFee} ر.س</span>
                        </p>
                      )}
                    </CardContent>

                    <CardFooter className="flex gap-2">
                      <Button asChild className="flex-1">
                        <Link href={`/doctors/${doctor.id}`}>
                          <Calendar className="mr-2 h-4 w-4" />
                          حجز موعد
                        </Link>
                      </Button>
                      <Button variant="outline" asChild>
                        <Link href={`/doctors/${doctor.id}`}>التفاصيل</Link>
                      </Button>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
