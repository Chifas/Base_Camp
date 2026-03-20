import sanitizeHtml from "sanitize-html";

/**
 * Strip ALL HTML from a string. For text-only fields (bio, notes, feedback, etc.)
 * where we never want any HTML markup.
 */
export function stripHtml(input: string): string {
  return sanitizeHtml(input, {
    allowedTags: [],
    allowedAttributes: {},
  }).trim();
}

/**
 * Sanitize all string fields in an object (shallow, one level deep).
 * Non-string values are passed through unchanged.
 */
export function sanitizeFields<T extends Record<string, unknown>>(obj: T): T {
  const result = { ...obj };
  for (const key in result) {
    if (typeof result[key] === "string") {
      (result as Record<string, unknown>)[key] = stripHtml(result[key] as string);
    }
  }
  return result;
}
