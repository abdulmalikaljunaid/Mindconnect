export type Specialty = 
  | "general-psychiatry"
  | "depression-anxiety"
  | "child-adolescent"
  | "addiction-treatment"
  | "eating-disorders"
  | "psychotic-disorders"
  | "family-couples-therapy"
  | "sleep-disorders"
  | "trauma-ptsd"
  | "cognitive-behavioral";

export interface Condition {
  name: string;
  nameEn: string;
  probability: number;
  severity: 'mild' | 'moderate' | 'severe';
  description: string;
}

export interface AssessmentResult {
  conditions: Condition[];
  recommendedSpecialties: Specialty[];
  notes: string;
}

export interface Doctor {
  id: string;
  name: string;
  nameAr: string;
  specialties: Specialty[];
  experience: number;
  rating: number;
  avatar?: string;
  bio: string;
  languages: string[];
}

export interface DoctorMatch {
  doctor: Doctor;
  matchScore: number;
}

export interface AssessmentStep {
  step: 'welcome' | 'input' | 'loading' | 'results';
  data?: any;
}
