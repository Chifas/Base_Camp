import type { Prisma } from "@prisma/client";

/** Loosely typed session record from Prisma include queries */
interface SessionWithRelations {
  id: string;
  clientId: string;
  professionalId: string;
  scheduledAt: Date;
  duration: number;
  status: string;
  price: number;
  dailyRoomUrl: string | null;
  notes: string | null;
  cancellationFee: number | null;
  client?: { name: string | null; image: string | null; [key: string]: unknown };
  professional?: { user?: { name: string | null; image: string | null }; [key: string]: unknown };
}

/**
 * Build a Prisma where clause for session listing based on filters.
 */
export function buildSessionWhereClause({
  identifier,
  identifierField,
  statusFilter,
  from,
  to,
}: {
  identifier: string;
  identifierField: "clientId" | "professionalId";
  statusFilter?: string | null;
  from?: string | null;
  to?: string | null;
}): Prisma.SessionWhereInput {
  const where: Prisma.SessionWhereInput = {
    [identifierField]: identifier,
  };

  if (statusFilter) {
    const statuses = statusFilter
      .split(",")
      .map((s) => s.trim().toUpperCase());
    where.status = {
      in: statuses as ("PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED")[],
    };
  }

  if (from) {
    const fromDate = new Date(from);
    if (!isNaN(fromDate.getTime())) {
      where.scheduledAt = { ...(where.scheduledAt as object ?? {}), gte: fromDate };
    }
  }

  if (to) {
    const toDate = new Date(to);
    if (!isNaN(toDate.getTime())) {
      where.scheduledAt = { ...(where.scheduledAt as object ?? {}), lte: toDate };
    }
  }

  return where;
}

/**
 * Format a session record for the API response based on perspective (client or professional).
 */
export function formatSessionForResponse(
  session: SessionWithRelations,
  perspective: "client" | "professional"
) {
  const base = {
    id: session.id,
    clientId: session.clientId,
    professionalId: session.professionalId,
    scheduledAt: session.scheduledAt.toISOString(),
    duration: session.duration,
    status: session.status,
    price: session.price,
    dailyRoomUrl: session.dailyRoomUrl,
  };

  if (perspective === "professional") {
    return {
      ...base,
      clientName: session.client?.name ?? "Cliente",
      clientImage: session.client?.image ?? "",
      notes: session.notes,
      cancellationFee: session.cancellationFee,
    };
  }

  return {
    ...base,
    professionalName: session.professional?.user?.name ?? "Profesional",
    professionalImage: session.professional?.user?.image ?? "",
    cancellationFee: session.cancellationFee,
  };
}
