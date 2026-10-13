import { NextRequest, NextResponse } from 'next/server';
import { getSources, getRefreshRuns } from '@/lib/queries';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const sourceId = searchParams.get('sourceId') || undefined;

  try {
    const [sources, runs] = await Promise.all([
      getSources(),
      sourceId ? getRefreshRuns(sourceId, 10) : Promise.resolve([]),
    ]);

    return NextResponse.json({ success: true, data: { sources, recentRuns: runs } });
  } catch (error) {
    console.error('[API] Sources fetch failed:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sources', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}