import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-02-24.acacia',
});

export async function GET(request: NextRequest) {
  try {
    // Get the paid_download cookie
    const sessionId = request.cookies.get('paid_download')?.value;

    if (!sessionId) {
      return NextResponse.json({ isPaid: false });
    }

    // Verify the session is still valid
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const isPaid = session.payment_status === 'paid';

    return NextResponse.json({ isPaid });
  } catch (error) {
    console.error('Error checking paid download status:', error);
    return NextResponse.json({ isPaid: false });
  }
} 