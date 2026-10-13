import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const dbStart = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    const dbLatency = Date.now() - dbStart;

    const sources = await prisma.source.findMany({
      select: { id: true, name: true, health: true, lastSuccessfulAt: true, lastError: true, recordCount: true },
    });

    const healthSummary = {
      healthy: sources.filter(s => s.health === 'HEALTHY').length,
      degraded: sources.filter(s => s.health === 'DEGRADED').length,
      failed: sources.filter(s => s.health === 'FAILED').length,
      unknown: sources.filter(s => s.health === 'UNKNOWN').length,
    };

    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: { status: 'connected', latencyMs: dbLatency },
      sources: healthSummary,
      version: process.env.npm_package_version || '0.1.0',
    });
  } catch (error) {
    console.error('[Health] Check failed:', error);
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        database: { status: 'disconnected' },
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 503 }
    );
  }
}