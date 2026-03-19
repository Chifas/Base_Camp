export type UserRole = "CLIENT" | "PROFESSIONAL" | "ADMIN";

export type ProfessionalCategory =
  | "PSYCHOLOGIST"
  | "COACH"
  | "CAREER_MENTOR"
  | "NUTRITIONIST";

export type SessionStatus =
  | "PENDING"
  | "CONFIRMED"
  | "COMPLETED"
  | "CANCELLED";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  image?: string;
  bio?: string;
  freeCreditsUsed?: number;
  creditsLimit?: number;
}

export interface Certification {
  id: string;
  title: string;
  institution: string;
  year?: number;
  documentUrl?: string;
}

export interface Professional {
  id: string;
  userId: string;
  name: string;
  image: string;
  bio: string;
  headline: string;
  category: ProfessionalCategory;
  categoryName?: string;
  hourlyRate?: number;
  rating: number;
  reviewCount: number;
  verified: boolean;
  verifiedAt?: string;
  languages?: string[];
  yearsExperience?: number;
  impactPoints?: number;
  totalSessionsCompleted?: number;
  socialImpactScore?: number;
  certifications?: Certification[];
  availability: AvailabilitySlot[];
}

export interface AvailabilitySlot {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

export interface Session {
  id: string;
  clientId: string;
  professionalId: string;
  professionalName: string;
  professionalImage: string;
  clientName: string;
  scheduledAt: string;
  duration: number;
  status: SessionStatus;
  price: number;
  isFreeSession?: boolean;
  dailyRoomUrl?: string;
  cancellationFee?: number;
}

export interface Review {
  id: string;
  sessionId: string;
  userName: string;
  userImage: string;
  rating: number;
  ratingPunctuality?: number;
  ratingKnowledge?: number;
  ratingCommunication?: number;
  ratingValue?: number;
  comment: string;
  professionalResponse?: string;
  respondedAt?: string;
  reported?: boolean;
  createdAt: string;
}

export const CATEGORY_LABELS: Record<ProfessionalCategory, string> = {
  CAREER_MENTOR: "Mentor de Carrera",
  COACH: "Coach Ejecutivo",
  PSYCHOLOGIST: "Psicólogo/a Laboral",
  NUTRITIONIST: "Nutricionista",
};

export interface Category {
  id: string;
  name: string;
  slug: string;
}

export const STATUS_LABELS: Record<SessionStatus, string> = {
  PENDING: "Pendiente",
  CONFIRMED: "Confirmada",
  COMPLETED: "Completada",
  CANCELLED: "Cancelada",
};
