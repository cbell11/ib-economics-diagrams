import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    // Validate request body
    const body = await request.json();
    if (!body.prompt || typeof body.prompt !== 'string') {
      return NextResponse.json(
        { error: 'Invalid request: prompt is required and must be a string' },
        { status: 400 }
      );
    }

    // For now, just return supply-demand as default
    return NextResponse.json({ 
      diagramType: 'supply-demand' as const
    });

  } catch (error: unknown) {
    console.error('Error in analyze-prompt:', error);
    return NextResponse.json(
      { error: 'Failed to process the prompt' },
      { status: 500 }
    );
  }
} 