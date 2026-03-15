/**
 * Cancellation policy logic — pure functions, no side effects.
 *
 * Rules:
 *  - Free cancellation if > 24 h before session
 *  - Client cancels < 24 h: 50 % fee (client refunded 50 %)
 *  - Professional cancels: always full refund to client
 */

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
  /** Override "now" for testing. */
  now?: Date;
}

const FREE_CANCELLATION_HOURS = 24;
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

  // Client cancels > 24 h before → free
  if (hoursUntilSession >= FREE_CANCELLATION_HOURS) {
    return {
      refundAmount: input.price,
      cancellationFee: 0,
      isFree: true,
      hoursUntilSession,
    };
  }

  // Client cancels < 24 h → 50 % fee
  const fee = Math.round(input.price * LATE_CANCELLATION_FEE_RATIO * 100) / 100;
  return {
    refundAmount: input.price - fee,
    cancellationFee: fee,
    isFree: false,
    hoursUntilSession,
  };
}
