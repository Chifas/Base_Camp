import { NextResponse } from "next/server";

/**
 * @deprecated Use POST /api/auth/register instead.
 * This endpoint is kept only to return a helpful error for any stale clients.
 */
export async function POST() {
  return NextResponse.json(
    { error: "Este endpoint ha sido eliminado. Usa /api/auth/register." },
    { status: 410 }
  );
}
