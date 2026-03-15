import { NextResponse } from "next/server";
import { logger } from "./logger";

/**
 * Standardized API error response format.
 * All API routes should use these helpers for consistent error handling.
 *
 * Response shape: { error: string; code?: string; details?: unknown }
 */

interface ApiErrorOptions {
  status: number;
  error: string;
  code?: string;
  details?: unknown;
  /** Route context for logging */
  route?: string;
}

export function apiError({ status, error, code, details, route }: ApiErrorOptions) {
  if (route) {
    logger.warn(`API error [${status}] ${route}: ${error}`, { code, details });
  }
  const body: Record<string, unknown> = { error };
  if (code) body.code = code;
  if (details) body.details = details;
  return NextResponse.json(body, { status });
}

/** 400 — Bad Request (validation errors, missing fields) */
export function badRequest(error: string, opts?: { code?: string; details?: unknown; route?: string }) {
  return apiError({ status: 400, error, ...opts });
}

/** 401 — Unauthorized (no session) */
export function unauthorized(route?: string) {
  return apiError({ status: 401, error: "No autenticado", code: "UNAUTHORIZED", route });
}

/** 403 — Forbidden (wrong role or permissions) */
export function forbidden(route?: string) {
  return apiError({ status: 403, error: "No tienes permiso para realizar esta acción", code: "FORBIDDEN", route });
}

/** 404 — Not Found */
export function notFound(resource: string, route?: string) {
  return apiError({ status: 404, error: `${resource} no encontrado`, code: "NOT_FOUND", route });
}

/** 409 — Conflict (duplicate, already exists) */
export function conflict(error: string, route?: string) {
  return apiError({ status: 409, error, code: "CONFLICT", route });
}

/** 500 — Internal Server Error (catch-all) */
export function serverError(error: unknown, route?: string) {
  const message = error instanceof Error ? error.message : "Error interno del servidor";
  if (route) {
    logger.error(`Server error ${route}: ${message}`, { error });
  }
  return apiError({ status: 500, error: "Error interno del servidor", code: "INTERNAL_ERROR" });
}
