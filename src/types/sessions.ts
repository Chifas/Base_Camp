import type { Session } from "@prisma/client";

/**
 * A Prisma Session row with the professional relation included.
 * Used in GET /api/sessions for the CLIENT perspective.
 */
export type SessionWithProfessional = Session & {
  professional: { user: { id: string; name: string | null; image: string | null } };
};
