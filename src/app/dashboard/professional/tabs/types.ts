export interface SessionItem {
  id: string;
  clientId: string;
  professionalId: string;
  clientName: string;
  clientImage: string;
  scheduledAt: string;
  duration: number;
  status: string;
  price: number;
  dailyRoomUrl?: string | null;
  messageCount?: number;
}

export interface ProfileData {
  id: string;
  headline: string | null;
  category: string;
  categoryName: string;
  name: string | null;
  image: string | null;
  bio: string | null;
  languages: string[];
  yearsExperience: number | null;
  hasProfile: boolean;
  impactPoints: number;
  totalSessionsCompleted: number;
  socialImpactScore: number;
}

export interface RedemptionItem {
  id: string;
  type: string;
  pointsSpent: number;
  description: string | null;
  createdAt: string;
}

export interface CertificationItem {
  id: string;
  title: string;
  institution: string;
  year?: number;
}

export interface ReviewItem {
  id: string;
  userName: string;
  rating: number;
  ratingPunctuality?: number;
  ratingKnowledge?: number;
  ratingCommunication?: number;
  ratingValue?: number;
  comment: string | null;
  professionalResponse: string | null;
  createdAt: string;
}

export type AvailabilitySlot = {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  enabled: boolean;
};

export interface CategoryOption {
  id: string;
  name: string;
}
