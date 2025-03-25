import { NextResponse } from 'next/server';
import Stripe from 'stripe';

let stripe: Stripe | null = null;

// Initialize Stripe only if the secret key is available
if (process.env.STRIPE_SECRET_KEY) {
  stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2025-02-24.acacia'
  });
}

export async function POST(request: Request) {
  try {
    // If Stripe is not initialized, return false
    if (!stripe) {
      console.warn('Stripe is not initialized - payment verification is disabled');
      return NextResponse.json({ isValid: false });
    }

    const { sessionId } = await request.json();

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    // Verify the payment was successful
    const isValid = session.payment_status === 'paid';

    return NextResponse.json({ isValid });
  } catch (error) {
    console.error('Error verifying payment:', error);
    return NextResponse.json({ isValid: false });
  }
} 