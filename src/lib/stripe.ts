import Stripe from "stripe";

// Server-side Stripe client singleton
// Only import on the server — never bundle into client code
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  typescript: true,
});
