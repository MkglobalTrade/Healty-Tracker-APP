// Types for the Diabetes Tracker App

export interface GlucoseReading {
  id: string;
  value: number; // mg/dL
  timestamp: string; // ISO string
  mealContext: 'fasting' | 'before_meal' | 'after_meal' | 'bedtime' | 'other';
  notes?: string;
}

export interface DailyStats {
  date: string; // YYYY-MM-DD
  readings: GlucoseReading[];
  average: number;
  min: number;
  max: number;
  hbA1cEstimate: number;
}

export interface LabResult {
  id: string;
  name: string;
  value: number;
  unit: string;
  referenceMin: number;
  referenceMax: number;
  status: 'normal' | 'borderline' | 'high' | 'low' | 'critical';
  date: string;
  source: 'manual' | 'photo' | 'pdf';
  notes?: string;
}

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: 'once_daily' | 'twice_daily' | 'three_times' | 'as_needed' | 'weekly';
  timeOfDay: ('morning' | 'afternoon' | 'evening' | 'night')[];
  category: 'medication' | 'vitamin' | 'supplement' | 'insulin';
  aiRecommendedTime?: string;
  isActive: boolean;
  notes?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  source: string;
  url: string;
  category: 'longevity' | 'diabetes' | 'medicine' | 'wellness';
  publishedAt: string;
  imageUrl?: string;
}

export type ViewPeriod = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';

export interface UserProfile {
  name: string;
  birthDate: string; // ISO date
  photoUrl?: string;
}
