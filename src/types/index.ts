export type UserRole = "CLIENT" | "PROFESSIONAL" | "ADMIN";

export type ProfessionalCategory =
  | "CAREER_MENTOR"
  | "EXECUTIVE_COACH"
  | "SECTOR_EXPERT"
  | "WORK_PSYCHOLOGIST";

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
}

export interface Professional {
  id: string;
  userId: string;
  name: string;
  image: string;
  bio: string;
  headline: string;
  category: ProfessionalCategory;
  hourlyRate: number;
  rating: number;
  reviewCount: number;
  verified: boolean;
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
  dailyRoomUrl?: string;
}

export interface Review {
  id: string;
  sessionId: string;
  userName: string;
  userImage: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export const CATEGORY_LABELS: Record<ProfessionalCategory, string> = {
  CAREER_MENTOR: "Mentor de Carrera",
  EXECUTIVE_COACH: "Coach Ejecutivo",
  SECTOR_EXPERT: "Experto Sectorial",
  WORK_PSYCHOLOGIST: "Psicólogo/a Laboral",
};

export const STATUS_LABELS: Record<SessionStatus, string> = {
  PENDING: "Pendiente",
  CONFIRMED: "Confirmada",
  COMPLETED: "Completada",
  CANCELLED: "Cancelada",
};
