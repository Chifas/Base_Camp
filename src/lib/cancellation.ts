/**
 * Cancellation policy logic — pure functions, no side effects.
 *
 * Rules:
 *  - Free cancellation if > 24 h before session (or always for Premium clients)
 *  - Client cancels < 24 h: 50 % fee (client refunded 50 %)
 *  - Professional cancels: always full refund to client
 */
import type { SubscriptionTier } from "@prisma/client";
import { getTierLimits } from "./credits-config";

export interface CancellationResult {
  /** Amount to refund to the client (EUR). */
  refundAmount: number;
  /** Fee charged for late cancellation (EUR). 0 if free. */
  cancellationFee: number;
  /** Whether the cancellation is free (no fee). */
  isFree: boolean;
  /** Hours remaining until the session. */
  hoursUntilSession: number;
}

interface CancellationInput {
  scheduledAt: Date;
  price: number;
  /** Who initiated the cancellation. */
  cancelledByRole: "CLIENT" | "PROFESSIONAL";
  /** Tier of the cancelling client — Premium gets free cancellation always. */
  clientTier?: SubscriptionTier;
  /** Override "now" for testing. */
  now?: Date;
}

const LATE_CANCELLATION_FEE_RATIO = 0.5;

export function calculateCancellation(
  input: CancellationInput
): CancellationResult {
  const now = input.now ?? new Date();
  const hoursUntilSession =
    (input.scheduledAt.getTime() - now.getTime()) / (1000 * 60 * 60);

  // Professional cancels → always full refund to client, no fee
  if (input.cancelledByRole === "PROFESSIONAL") {
    return {
      refundAmount: input.price,
      cancellationFee: 0,
      isFree: true,
      hoursUntilSession,
    };
  }

  const freeWindow = getTierLimits(input.clientTier).cancellationFreeBefore;

  if (hoursUntilSession >= freeWindow) {
    return {
      refundAmount: input.price,
      cancellationFee: 0,
      isFree: true,
      hoursUntilSession,
    };
  }

  const fee = Math.round(input.price * LATE_CANCELLATION_FEE_RATIO * 100) / 100;
  return {
    refundAmount: input.price - fee,
    cancellationFee: fee,
    isFree: false,
    hoursUntilSession,
  };
}
