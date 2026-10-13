import { NextRequest, NextResponse } from 'next/server';
import { getProjects, getUniqueStatuses, getUniqueProjectTypes, getStats } from '@/lib/queries';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
  const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get('pageSize') || '20', 10)));
  const query = searchParams.get('q') || undefined;
  const status = searchParams.get('status')?.split(',').filter(Boolean) || undefined;
  const projectType = searchParams.get('projectType')?.split(',').filter(Boolean) || undefined;
  const sourceId = searchParams.get('sourceId') || undefined;
  const sortField = (searchParams.get('sortField') as 'title' | 'lastObservedAt' | 'firstObservedAt' | 'status' | 'projectType') || 'lastObservedAt';
  const sortDirection = (searchParams.get('sortDirection') as 'asc' | 'desc') || 'desc';

  try {
    const [projects, statuses, types, stats] = await Promise.all([
      getProjects({ query, status, projectType, sourceId }, { field: sortField, direction: sortDirection }, page, pageSize),
      getUniqueStatuses(),
      getUniqueProjectTypes(),
      getStats(),
    ]);

    return NextResponse.json({
      success: true,
      data: projects,
      filters: { statuses, types },
      stats,
    });
  } catch (error) {
    console.error('[API] Projects fetch failed:', error);
    return NextResponse.json(
      { error: 'Failed to fetch projects', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}