import stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
