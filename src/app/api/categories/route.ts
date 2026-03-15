import { NextResponse } from "next/server";

/**
 * Categories derived from the ProfessionalCategory enum in the Prisma schema.
 * Returned as objects with id, name, and slug for the frontend selects.
 */
const CATEGORIES = [
  { id: "CAREER_MENTOR", name: "Mentor de Carrera", slug: "career-mentor" },
  { id: "COACH", name: "Coach Ejecutivo", slug: "coach" },
  { id: "PSYCHOLOGIST", name: "Psicólogo Laboral", slug: "psychologist" },
  { id: "NUTRITIONIST", name: "Nutricionista", slug: "nutritionist" },
];

export async function GET() {
  return NextResponse.json(CATEGORIES);
}
