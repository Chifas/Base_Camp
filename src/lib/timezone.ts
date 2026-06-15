const PROFESSIONAL_TZ = "Europe/Madrid";

/**
 * Converts a HH:MM time string from the professional's timezone (Europe/Madrid)
 * to the same moment expressed in the given target timezone.
 *
 * Uses the next occurrence of `dayOfWeek` from today as the reference date
 * so that DST offsets are accurate.
 */
export function convertAvailabilityTime(
  time: string,
  dayOfWeek: number,
  targetTz: string
): string {
  if (targetTz === PROFESSIONAL_TZ) return time;

  try {
    const [hourStr, minStr] = time.split(":");

    // Build a Date representing the next occurrence of dayOfWeek in Madrid time
    const now = new Date();
    const todayDow = now.getDay();
    const daysAhead = (dayOfWeek - todayDow + 7) % 7;
    const ref = new Date(now);
    ref.setDate(ref.getDate() + daysAhead);

    // Format as Madrid midnight, then add hours/mins
    const madridMidnight = new Intl.DateTimeFormat("en-CA", {
      timeZone: PROFESSIONAL_TZ,
      year:     "numeric",
      month:    "2-digit",
      day:      "2-digit",
    }).format(ref);

    // Parse as Madrid local time
    const madridDate = new Date(`${madridMidnight}T${hourStr?.padStart(2, "0")}:${minStr?.padStart(2, "0")}:00`);

    // Get the Madrid offset at this moment
    const madridStr = madridDate.toLocaleString("en-US", { timeZone: PROFESSIONAL_TZ, hour12: false, hour: "2-digit", minute: "2-digit" });
    const targetStr = madridDate.toLocaleString("en-US", { timeZone: targetTz,        hour12: false, hour: "2-digit", minute: "2-digit" });

    // Only return target if we got a valid result (guards against unsupported TZ)
    if (targetStr && targetStr !== madridStr) return targetStr;
    return time;
  } catch {
    return time;
  }
}

/** Returns a short offset label like "+1h" or "−5h" relative to Europe/Madrid */
export function getTimezoneOffsetLabel(targetTz: string): string | null {
  if (targetTz === PROFESSIONAL_TZ) return null;

  try {
    const now = new Date();
    const madridOffset = getOffsetMinutes(now, PROFESSIONAL_TZ);
    const targetOffset = getOffsetMinutes(now, targetTz);
    const diffMin = targetOffset - madridOffset;

    if (diffMin === 0) return null;

    const sign  = diffMin > 0 ? "+" : "−";
    const hours = Math.floor(Math.abs(diffMin) / 60);
    const mins  = Math.abs(diffMin) % 60;
    return mins === 0 ? `${sign}${hours}h` : `${sign}${hours}h${mins}m`;
  } catch {
    return null;
  }
}

function getOffsetMinutes(date: Date, tz: string): number {
  const utcDate   = new Date(date.toLocaleString("en-US", { timeZone: "UTC" }));
  const tzDate    = new Date(date.toLocaleString("en-US", { timeZone: tz }));
  return (tzDate.getTime() - utcDate.getTime()) / 60000;
}
