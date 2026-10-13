import { NextRequest, NextResponse } from 'next/server';
import { getRecentChanges } from '@/lib/queries';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
  const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get('pageSize') || '50', 10)));
  const projectType = searchParams.get('projectType')?.split(',').filter(Boolean) || undefined;
  const sourceId = searchParams.get('sourceId') || undefined;
  const dateFrom = searchParams.get('dateFrom') ? new Date(searchParams.get('dateFrom')!) : undefined;
  const dateTo = searchParams.get('dateTo') ? new Date(searchParams.get('dateTo')!) : undefined;

  try {
    const changes = await getRecentChanges(
      { projectType, sourceId, dateFrom, dateTo },
      page,
      pageSize
    );

    return NextResponse.json({ success: true, data: changes });
  } catch (error) {
    console.error('[API] Changes fetch failed:', error);
    return NextResponse.json(
      { error: 'Failed to fetch changes', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}