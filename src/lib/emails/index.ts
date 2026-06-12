/**
 * Email templates and send helpers for GuidePath.
 * Re-exports everything from the modular email files.
 */

export type { EmailSessionData } from "./booking-confirmation";
export { bookingConfirmedHtml, newSessionHtml, sendBookingEmails } from "./booking-confirmation";
export { sessionReminderHtml, sendSessionReminderEmails } from "./session-reminder";
export { sessionFollowupHtml, sendSessionFollowupEmail } from "./session-followup";
export { sessionCancelledHtml, sendCancellationEmails } from "./cancellation";
export { newReviewHtml, sendNewReviewEmail } from "./review";
export { sendOnboardingEmail, sendWaitlistConfirmationEmail } from "./onboarding";
export { passwordResetHtml, sendPasswordResetEmail } from "./password-reset";
export {
  sendPremiumWelcomeEmail,
  sendPremiumTrialEndingEmail,
  sendPremiumPaymentFailedEmail,
  sendPremiumCanceledEmail,
} from "./premium";
