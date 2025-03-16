import { NextResponse } from 'next/server';

const MEMBERPRESS_API_URL = 'https://diplomacollective.com/wp-json/mp/v1/members';
const API_KEY = process.env.MEMBERPRESS_API_KEY;
const ALLOWED_MEMBERSHIP_IDS = ['478', '479'];
const ALLOWED_MEMBERSHIP_NAMES = ['Econ Student Monthly', 'Economics Teacher Free Preview'];

interface MembershipResponse {
  product_id: number;
  status: string;
  created_at: string;
  expires_at: string | null;
  name?: string;
  product_name?: string;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  console.log('Checking membership for user:', userId);
  console.log('Using API Key:', API_KEY ? 'Present' : 'Missing');

  if (!userId) {
    console.log('No userId provided');
    return NextResponse.json({ hasAccess: false, error: 'User ID is required' }, { status: 400 });
  }

  if (!API_KEY) {
    console.error('MemberPress API key is not configured');
    return NextResponse.json({ hasAccess: false, error: 'API key not configured' }, { status: 500 });
  }

  try {
    console.log('Fetching from URL:', `${MEMBERPRESS_API_URL}/${userId}/active_memberships`);
    
    const response = await fetch(`${MEMBERPRESS_API_URL}/${userId}/active_memberships`, {
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    console.log('MemberPress API Response Status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('MemberPress API Error:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText
      });
      throw new Error(`Failed to fetch membership status: ${response.status} ${response.statusText}`);
    }

    const memberships = await response.json() as MembershipResponse[];
    console.log('Received memberships:', memberships);
    
    // Check if user has any of the allowed membership IDs or names
    const hasAccess = memberships.some((membership) => {
      const hasAllowedId = ALLOWED_MEMBERSHIP_IDS.includes(membership.product_id.toString());
      const hasAllowedName = membership.name ? 
        ALLOWED_MEMBERSHIP_NAMES.includes(membership.name) :
        membership.product_name ? 
          ALLOWED_MEMBERSHIP_NAMES.includes(membership.product_name) :
          false;
      const isActive = membership.status === 'active';
      
      console.log('Checking membership:', {
        product_id: membership.product_id,
        name: membership.name || membership.product_name,
        status: membership.status,
        hasAllowedId,
        hasAllowedName,
        isActive
      });
      
      return (hasAllowedId || hasAllowedName) && isActive;
    });

    console.log('Access decision:', hasAccess);
    return NextResponse.json({ hasAccess });
  } catch (error) {
    console.error('Error checking membership:', error);
    return NextResponse.json({ 
      hasAccess: false, 
      error: 'Failed to check membership status',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 