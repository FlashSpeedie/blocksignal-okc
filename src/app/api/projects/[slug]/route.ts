import { NextRequest, NextResponse } from 'next/server';
import { getProjectBySlug } from '@/lib/queries';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  try {
    const project = await getProjectBySlug(slug);
    
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: project });
  } catch (error) {
    console.error('[API] Project fetch failed:', error);
    return NextResponse.json(
      { error: 'Failed to fetch project', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}