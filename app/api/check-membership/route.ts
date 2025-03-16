import { NextResponse } from 'next/server';

// Updated to use the standard WordPress REST API endpoint for MemberPress
const MEMBERPRESS_API_URL = 'https://diplomacollective.com/wp-json/mepr/v1';
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
    // First try to validate the API connection
    const validateUrl = `${MEMBERPRESS_API_URL}/validate`;
    console.log('Validating API connection:', validateUrl);
    
    const validateResponse = await fetch(validateUrl, {
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    console.log('API Validation Response:', validateResponse.status);

    // Now check memberships
    const membershipUrl = `${MEMBERPRESS_API_URL}/members/${userId}/memberships`;
    console.log('Fetching from URL:', membershipUrl);
    
    const response = await fetch(membershipUrl, {
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    console.log('MemberPress API Response Status:', response.status);
    console.log('MemberPress API Response Headers:', Object.fromEntries(response.headers.entries()));
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('MemberPress API Error:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText,
        headers: Object.fromEntries(response.headers.entries())
      });
      throw new Error(`Failed to fetch membership status: ${response.status} ${response.statusText} - ${errorText}`);
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