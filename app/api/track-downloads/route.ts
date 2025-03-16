import { NextResponse } from 'next/server';

interface DownloadCount {
  count: number;
  lastReset: string; // ISO date string
}

// In-memory storage for download counts (replace with database in production)
const downloadCounts: { [userId: string]: DownloadCount } = {};

const MONTHLY_LIMIT = 10;

function shouldResetCount(lastReset: string): boolean {
  const lastResetDate = new Date(lastReset);
  const now = new Date();
  return lastResetDate.getMonth() !== now.getMonth() || lastResetDate.getFullYear() !== now.getFullYear();
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
  }

  // Initialize or get user's download count
  if (!downloadCounts[userId]) {
    downloadCounts[userId] = {
      count: 0,
      lastReset: new Date().toISOString()
    };
  }

  // Check if we should reset the counter (new month)
  if (shouldResetCount(downloadCounts[userId].lastReset)) {
    downloadCounts[userId] = {
      count: 0,
      lastReset: new Date().toISOString()
    };
  }

  const remaining = MONTHLY_LIMIT - downloadCounts[userId].count;
  return NextResponse.json({ 
    remaining,
    canDownload: remaining > 0
  });
}

export async function POST(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
  }

  // Initialize if not exists
  if (!downloadCounts[userId]) {
    downloadCounts[userId] = {
      count: 0,
      lastReset: new Date().toISOString()
    };
  }

  // Check if we should reset the counter (new month)
  if (shouldResetCount(downloadCounts[userId].lastReset)) {
    downloadCounts[userId] = {
      count: 0,
      lastReset: new Date().toISOString()
    };
  }

  // Check if user has reached the limit
  if (downloadCounts[userId].count >= MONTHLY_LIMIT) {
    return NextResponse.json({ 
      error: 'Monthly download limit reached',
      remaining: 0,
      canDownload: false
    }, { status: 429 });
  }

  // Increment download count
  downloadCounts[userId].count++;
  const remaining = MONTHLY_LIMIT - downloadCounts[userId].count;

  return NextResponse.json({ 
    remaining,
    canDownload: remaining > 0
  });
} 