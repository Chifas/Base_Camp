"use client";

import { useEffect } from "react";

/**
 * Fires a single fire-and-forget POST to /api/professionals/[id]/track-view
 * once per page load. Swallows errors — analytics must never break the page.
 */
export function TrackProfileView({ professionalId }: { professionalId: string }) {
  useEffect(() => {
    fetch(`/api/professionals/${professionalId}/track-view`, {
      method: "POST",
      keepalive: true,
    }).catch(() => {});
  }, [professionalId]);

  return null;
}
