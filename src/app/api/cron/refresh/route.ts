import { NextRequest, NextResponse } from 'next/server';
import { refreshAllSources } from '@/lib/refresh';

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    console.error('[Cron] CRON_SECRET not configured');
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
  }

  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const results = await refreshAllSources();
    
    const summary = {
      totalSources: results.length,
      successful: results.filter(r => r.outcome === 'SUCCESS').length,
      partial: results.filter(r => r.outcome === 'PARTIAL_SUCCESS').length,
      failed: results.filter(r => r.outcome === 'FAILED').length,
      skipped: results.filter(r => r.outcome === 'SKIPPED').length,
      totalFetched: results.reduce((sum, r) => sum + r.fetchedRecords, 0),
      totalValid: results.reduce((sum, r) => sum + r.validRecords, 0),
      totalChanges: results.reduce((sum, r) => sum + r.detectedChanges, 0),
    };

    return NextResponse.json({ success: true, summary, results });
  } catch (error) {
    console.error('[Cron] Refresh failed:', error);
    return NextResponse.json(
      { error: 'Refresh failed', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}