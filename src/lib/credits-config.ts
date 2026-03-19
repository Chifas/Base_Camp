/**
 * Centralized configuration for the freemium credits system.
 *
 * Change these values to adjust limits across the entire app.
 */
export const CREDITS_CONFIG = {
  /** Free sessions a client can book per calendar month. */
  FREE_SESSIONS_PER_MONTH: 3,

  /** Impact points a professional earns per completed session. */
  IMPACT_POINTS_PER_SESSION: 10,

  /** Points required to redeem a certification reward. */
  IMPACT_POINTS_CERTIFICATION: 100,

  /** Points required to redeem a philanthropic donation. */
  IMPACT_POINTS_DONATION: 50,
} as const;
