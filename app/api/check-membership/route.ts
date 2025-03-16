import { NextResponse } from 'next/server';

// Updated to use the standard WordPress REST API endpoint for MemberPress
const MEMBERPRESS_API_URL = 'https://diplomacollective.com/wp-json/mp/v1/members';
const API_KEY = process.env.MEMBERPRESS_API_KEY;
const ALLOWED_MEMBERSHIP_IDS = ['478', '479'];
const ALLOWED_MEMBERSHIP_NAMES = ['Econ Student Monthly', 'Economics Teacher Free Preview'];

interface MembershipResponse {
  id: number;
  active_memberships: Array<{
    id: number;
    title: string;
    group: string;
    status: string;
  }>;
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
    // Make request to MemberPress API
    const membershipUrl = `${MEMBERPRESS_API_URL}/${userId}`;
    console.log('Fetching from URL:', membershipUrl);
    
    const response = await fetch(membershipUrl, {
      headers: {
        'MEMBERPRESS-API-KEY': API_KEY,
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

    const userData = await response.json() as MembershipResponse;
    console.log('Received user data:', userData);
    
    // Check if user has any of the allowed membership IDs in their active memberships
    const hasAccess = userData.active_memberships.some((membership) => {
      const hasAllowedId = ALLOWED_MEMBERSHIP_IDS.includes(membership.group);
      const hasAllowedName = ALLOWED_MEMBERSHIP_NAMES.includes(membership.title);
      const isActive = membership.status === 'publish';
      
      console.log('Checking membership:', {
        id: membership.id,
        title: membership.title,
        group: membership.group,
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