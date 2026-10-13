import { describe, it, expect, vi, beforeEach } from 'vitest';
import { refreshSource, refreshAllSources } from '@/lib/refresh';
import { prisma } from '@/lib/db';

vi.mock('@/lib/db', () => ({
  prisma: {
    source: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
    },
    project: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    snapshot: {
      findFirst: vi.fn(),
      create: vi.fn(),
    },
    changeEvent: {
      create: vi.fn(),
    },
    refreshRun: {
      create: vi.fn().mockResolvedValue({ id: 'run-1' }),
      update: vi.fn(),
    },
  },
}));

vi.mock('@/lib/adapters', () => ({
  getAdapter: vi.fn(() => ({
    type: 'HTML_SCRAPER',
    name: 'Test Adapter',
    fetchRecords: vi.fn(),
    validateConfig: vi.fn(() => true),
    getMetadata: vi.fn(),
  })),
}));

describe('Refresh Engine', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('skips disabled sources', async () => {
    const { prisma } = await import('@/lib/db');
    (prisma.source.findUnique as any).mockResolvedValue({
      id: 'source-1',
      enabled: false,
      adapterType: 'HTML_SCRAPER',
      config: { url: 'https://example.com' },
    });

    const result = await refreshSource('source-1');
    
    expect(result.outcome).toBe('SKIPPED');
    expect(result.errorSummary).toBe('Source is disabled');
  });

  it('handles fetch errors gracefully', async () => {
    const { prisma } = await import('@/lib/db');
    const { getAdapter } = await import('@/lib/adapters');
    
    (prisma.source.findUnique as any).mockResolvedValue({
      id: 'source-1',
      enabled: true,
      adapterType: 'HTML_SCRAPER',
      config: { url: 'https://example.com' },
    });

    (getAdapter as any).mockReturnValue({
      fetchRecords: vi.fn().mockRejectedValue(new Error('Network error')),
    });

    const result = await refreshSource('source-1');
    
    expect(result.outcome).toBe('FAILED');
    expect(result.errorSummary).toBe('Network error');
  });

  it('creates new projects and initial snapshots', async () => {
    const { prisma } = await import('@/lib/db');
    const { getAdapter } = await import('@/lib/adapters');
    
    (prisma.source.findUnique as any).mockResolvedValue({
      id: 'source-1',
      enabled: true,
      adapterType: 'HTML_SCRAPER',
      config: { url: 'https://example.com' },
    });

    (getAdapter as any).mockReturnValue({
      fetchRecords: vi.fn().mockResolvedValue([
        {
          externalId: 'proj-1',
          title: 'Test Project',
          fields: { status: 'Active' },
          sourceUrl: 'https://example.com/proj-1',
        },
      ]),
    });

    (prisma.project.findUnique as any).mockResolvedValue(null);
    (prisma.project.create as any).mockResolvedValue({ id: 'new-project-id', slug: 'test-project' });
    (prisma.snapshot.create as any).mockResolvedValue({ id: 'snapshot-1' });
    (prisma.snapshot.findFirst as any).mockResolvedValue({ id: 'snapshot-1' });
    (prisma.changeEvent.create as any).mockResolvedValue({ id: 'change-1' });
    (prisma.refreshRun.create as any).mockResolvedValue({ id: 'run-1' });
    (prisma.refreshRun.update as any).mockResolvedValue({});
    (prisma.source.update as any).mockResolvedValue({});

    const result = await refreshSource('source-1');
    
    expect(result.validRecords).toBe(1);
    expect(result.createdSnapshots).toBe(1);
    expect(result.detectedChanges).toBe(1);
  });

  it('detects changes in existing projects', async () => {
    const { prisma } = await import('@/lib/db');
    const { getAdapter } = await import('@/lib/adapters');
    
    (prisma.source.findUnique as any).mockResolvedValue({
      id: 'source-1',
      enabled: true,
      adapterType: 'HTML_SCRAPER',
      config: { url: 'https://example.com' },
    });

    (getAdapter as any).mockReturnValue({
      fetchRecords: vi.fn().mockResolvedValue([
        {
          externalId: 'proj-1',
          title: 'Test Project',
          fields: { status: 'Active', fundingAmount: 2000000 },
          sourceUrl: 'https://example.com/proj-1',
        },
      ]),
    });

    (prisma.project.findUnique as any).mockResolvedValue({
      id: 'existing-project',
      slug: 'test-project',
      fingerprint: 'old-fingerprint',
      snapshots: [{ id: 'old-snapshot', capturedAt: new Date(), fingerprint: 'old-fingerprint', fieldValues: { status: 'Planning' } }],
    });

    (prisma.snapshot.create as any).mockResolvedValue({ id: 'new-snapshot', fieldValues: { status: 'Active', fundingAmount: 2000000 } });
    (prisma.changeEvent.create as any).mockResolvedValue({ id: 'change-1' });
    (prisma.project.update as any).mockResolvedValue({});
    (prisma.refreshRun.create as any).mockResolvedValue({ id: 'run-1' });
    (prisma.refreshRun.update as any).mockResolvedValue({});
    (prisma.source.update as any).mockResolvedValue({});

    const result = await refreshSource('source-1');
    
    expect(result.validRecords).toBe(1);
    expect(result.createdSnapshots).toBe(1);
    expect(result.detectedChanges).toBeGreaterThanOrEqual(1);
  });

  it('does not create duplicate snapshots for identical data', async () => {
    const { prisma } = await import('@/lib/db');
    const { getAdapter } = await import('@/lib/adapters');
    
    (prisma.source.findUnique as any).mockResolvedValue({
      id: 'source-1',
      enabled: true,
      adapterType: 'HTML_SCRAPER',
      config: { url: 'https://example.com' },
    });

    (getAdapter as any).mockReturnValue({
      fetchRecords: vi.fn().mockResolvedValue([
        {
          externalId: 'proj-1',
          title: 'Test Project',
          fields: { status: 'Active' },
          sourceUrl: 'https://example.com/proj-1',
        },
      ]),
    });

    (prisma.project.findUnique as any).mockResolvedValue({
      id: 'existing-project',
      slug: 'test-project',
      fingerprint: 'niwxn2', // This matches generateFingerprint({ status: 'Active' })
      snapshots: [{ id: 'old-snapshot', capturedAt: new Date(), fingerprint: 'niwxn2', fieldValues: { status: 'Active' } }],
    });

    (prisma.project.update as any).mockResolvedValue({});
    (prisma.refreshRun.create as any).mockResolvedValue({ id: 'run-1' });
    (prisma.refreshRun.update as any).mockResolvedValue({});
    (prisma.source.update as any).mockResolvedValue({});

    const result = await refreshSource('source-1');
    
    expect(result.createdSnapshots).toBe(0);
    expect(result.detectedChanges).toBe(0);
    expect(prisma.snapshot.create).not.toHaveBeenCalled();
  });
});