import { NextResponse } from 'next/server';

const MEMBERPRESS_API_URL = 'https://diplomacollective.com/wp-json/mp/v1/members';
const API_KEY = process.env.MEMBERPRESS_API_KEY;
const ALLOWED_MEMBERSHIP_IDS = ['478', '479'];

interface MembershipResponse {
  product_id: number;
  status: string;
  created_at: string;
  expires_at: string | null;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ hasAccess: false, error: 'User ID is required' }, { status: 400 });
  }

  try {
    const response = await fetch(`${MEMBERPRESS_API_URL}/${userId}/active_memberships`, {
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch membership status');
    }

    const memberships = await response.json() as MembershipResponse[];
    
    // Check if user has any of the allowed membership IDs
    const hasAccess = memberships.some((membership) => 
      ALLOWED_MEMBERSHIP_IDS.includes(membership.product_id.toString())
    );

    return NextResponse.json({ hasAccess });
  } catch (error) {
    console.error('Error checking membership:', error);
    return NextResponse.json({ hasAccess: false, error: 'Failed to check membership status' }, { status: 500 });
  }
} 