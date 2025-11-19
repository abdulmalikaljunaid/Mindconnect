"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Star, Calendar, MessageCircle, Users } from "lucide-react"
import { getSpecialtyDisplayName } from "@/lib/doctors"
import type { DoctorMatch } from "@/types/assessment"

interface DoctorMatchCardProps {
  doctorMatch: DoctorMatch
  onBookAppointment: (doctor: any) => void
}

export function DoctorMatchCard({ doctorMatch, onBookAppointment }: DoctorMatchCardProps) {
  const { doctor, matchScore } = doctorMatch

  const getMatchScoreColor = (score: number) => {
    if (score >= 80) return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
    if (score >= 60) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
    return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
  }

  const getMatchScoreText = (score: number) => {
    if (score >= 80) return 'مطابق جداً'
    if (score >= 60) return 'مطابق'
    return 'مطابق جزئياً'
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={doctor.avatar} alt={doctor.nameAr} />
            <AvatarFallback className="text-lg">
              {doctor.nameAr.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 space-y-2">
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-lg">{doctor.nameAr}</CardTitle>
                <CardDescription>{doctor.name}</CardDescription>
              </div>
              <Badge className={getMatchScoreColor(matchScore)}>
                {matchScore}% {getMatchScoreText(matchScore)}
              </Badge>
            </div>
            
            <div className="flex items-center gap-4 text-sm text-foreground/70">
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span>{doctor.rating}</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span>{doctor.experience} سنة خبرة</span>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div>
          <h4 className="font-semibold text-sm mb-2">التخصصات:</h4>
          <div className="flex flex-wrap gap-2">
            {doctor.specialties.map((specialty) => (
              <Badge key={specialty} variant="secondary" className="text-xs">
                {getSpecialtyDisplayName(specialty)}
              </Badge>
            ))}
          </div>
        </div>
        
        <div>
          <h4 className="font-semibold text-sm mb-2">النبذة:</h4>
          <p className="text-sm text-foreground/80 leading-relaxed">
            {doctor.bio}
          </p>
        </div>
        
        <div>
          <h4 className="font-semibold text-sm mb-2">اللغات:</h4>
          <div className="flex flex-wrap gap-1">
            {doctor.languages.map((language) => (
              <Badge key={language} variant="outline" className="text-xs">
                {language}
              </Badge>
            ))}
          </div>
        </div>
        
        <div className="pt-4 border-t">
          <Button 
            onClick={() => onBookAppointment(doctor)}
            className="w-full"
            size="lg"
          >
            <Calendar className="h-4 w-4 mr-2" />
            احجز موعد
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
