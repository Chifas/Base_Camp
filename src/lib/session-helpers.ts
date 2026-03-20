/**
 * Shared helpers for session API routes.
 *
 * Centralises the formatting logic and where-clause construction
 * that was previously duplicated across GET /api/sessions and
 * GET /api/sessions/[id].
 */

interface SessionUser {
  id: string;
  name: string | null;
  image: string | null;
}

interface SessionProfessional {
  user: SessionUser;
}

interface SessionRow {
  id: string;
  clientId: string;
  professionalId: string;
  scheduledAt: Date;
  duration: number;
  status: string;
  price: number;
  isFreeSession: boolean;
  dailyRoomUrl: string | null;
  notes: string | null;
  cancellationFee: number | null;
  client: SessionUser;
  professional: SessionProfessional;
}

/**
 * Format a raw Prisma session row into the shape returned by
 * `GET /api/sessions` for **client** consumers.
 */
export function formatSessionForClient(s: SessionRow) {
  return {
    id: s.id,
    clientId: s.clientId,
    professionalId: s.professionalId,
    professionalName: s.professional.user.name ?? "Profesional",
    professionalImage: s.professional.user.image ?? "",
    scheduledAt: s.scheduledAt.toISOString(),
    duration: s.duration,
    status: s.status,
    price: s.price,
    isFreeSession: s.isFreeSession,
    dailyRoomUrl: s.dailyRoomUrl,
    cancellationFee: s.cancellationFee,
    role: "client" as const,
  };
}

/**
 * Format a raw Prisma session row for **professional** consumers.
 */
export function formatSessionForProfessional(
  s: Omit<SessionRow, "professional"> & { client: SessionUser }
) {
  return {
    id: s.id,
    clientId: s.clientId,
    professionalId: s.professionalId,
    clientName: s.client.name ?? "Cliente",
    clientImage: s.client.image ?? "",
    scheduledAt: s.scheduledAt.toISOString(),
    duration: s.duration,
    status: s.status,
    price: s.price,
    isFreeSession: s.isFreeSession,
    dailyRoomUrl: s.dailyRoomUrl,
    notes: s.notes,
    cancellationFee: s.cancellationFee,
    role: "professional" as const,
  };
}

/**
 * Build the Prisma `where` clause for listing sessions.
 */
export function buildSessionWhereClause(
  userId: string,
  role: string,
  professionalProfileId: string | null,
  filters: {
    status?: string | null;
    from?: string | null;
    to?: string | null;
  }
) {
  const where: Record<string, unknown> = {};

  // Role-based filter
  if (role === "PROFESSIONAL" && professionalProfileId) {
    where.professionalId = professionalProfileId;
  } else {
    where.clientId = userId;
  }

  // Status filter (comma-separated)
  if (filters.status) {
    const statuses = filters.status.split(",").map((s) => s.trim().toUpperCase());
    where.status = { in: statuses };
  }

  // Date range filter
  if (filters.from || filters.to) {
    const scheduledAt: Record<string, Date> = {};
    if (filters.from) {
      const d = new Date(filters.from);
      if (!isNaN(d.getTime())) scheduledAt.gte = d;
    }
    if (filters.to) {
      const d = new Date(filters.to);
      if (!isNaN(d.getTime())) scheduledAt.lte = d;
    }
    if (Object.keys(scheduledAt).length > 0) {
      where.scheduledAt = scheduledAt;
    }
  }

  return where;
}
