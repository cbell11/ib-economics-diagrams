import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-02-24.acacia'
});

export async function POST(request: Request) {
  try {
    const { sessionId } = await request.json();

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    // Verify the payment was successful
    if (session.payment_status === 'paid') {
      // Store the session ID in a cookie to verify watermark-free downloads
      const response = NextResponse.json({ isValid: true });
      response.cookies.set('paid_download', sessionId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60, // 1 hour expiry
      });
      return response;
    }

    return NextResponse.json({ isValid: false });
  } catch (error) {
    console.error('Error verifying payment:', error);
    return NextResponse.json(
      { error: 'Failed to verify payment' },
      { status: 500 }
    );
  }
} 