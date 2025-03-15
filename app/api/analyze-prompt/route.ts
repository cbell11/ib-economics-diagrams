import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { APIError } from 'openai';

// Validate environment variables
if (!process.env.OPENAI_API_KEY) {
  throw new Error('Missing OPENAI_API_KEY environment variable');
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  dangerouslyAllowBrowser: true // Add this to allow browser usage
});

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

    console.log('Sending prompt to OpenAI:', body.prompt);

    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: `You are an IB Economics expert. Analyze the given economic scenario and determine which type of diagram would be most appropriate to illustrate it. 
            Only respond with one of these three options: "supply-demand", "ppf", or "cost-curves".
            
            Guidelines:
            - Use "supply-demand" for market analysis, price changes, equilibrium shifts
            - Use "ppf" for production possibilities, opportunity cost, economic growth
            - Use "cost-curves" for firm-level analysis, production costs, profit maximization`
          },
          {
            role: "user",
            content: body.prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 60,
      });

      console.log('OpenAI response:', completion);

      const diagramType = completion.choices[0].message.content;
      
      if (!diagramType) {
        console.error('No response content from OpenAI');
        return NextResponse.json(
          { error: 'No response from AI model' },
          { status: 500 }
        );
      }

      const normalizedType = diagramType.trim().toLowerCase();
      console.log('Normalized diagram type:', normalizedType);
      
      if (!['supply-demand', 'ppf', 'cost-curves'].includes(normalizedType)) {
        console.error('Invalid diagram type received:', normalizedType);
        return NextResponse.json(
          { error: 'Invalid diagram type detected' },
          { status: 400 }
        );
      }

      return NextResponse.json({ 
        diagramType: normalizedType as 'supply-demand' | 'ppf' | 'cost-curves'
      });

    } catch (openaiError: unknown) {
      if (openaiError instanceof APIError || openaiError instanceof Error) {
        console.error('OpenAI API Error:', {
          error: openaiError,
          message: openaiError.message,
          response: openaiError instanceof APIError ? openaiError.response?.data : undefined,
          status: openaiError instanceof APIError ? openaiError.response?.status : undefined
        });

        if (openaiError instanceof APIError) {
          if (openaiError.response?.status === 401) {
            return NextResponse.json(
              { error: 'Invalid API key or unauthorized access' },
              { status: 401 }
            );
          }

          if (openaiError.response?.status === 429) {
            return NextResponse.json(
              { error: 'Rate limit exceeded' },
              { status: 429 }
            );
          }
        }
      }
      throw openaiError;
    }

  } catch (error: Error | unknown) {
    console.error('General Error in analyze-prompt:', {
      error,
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });

    return NextResponse.json(
      { 
        error: 'Failed to process the prompt: ' + (error instanceof Error ? error.message : 'Unknown error'),
        details: process.env.NODE_ENV === 'development' ? error instanceof Error ? error.stack : undefined : undefined
      },
      { status: 500 }
    );
  }
} 