import { prisma } from '@/lib/db';
import { SearchFilters, SortOptions, PaginatedResult, ProjectRecord, SourceMetadata, ChangeEventRecord, RefreshRunRecord, SourceConfig } from '@/types';

export async function getProjects(
  filters: SearchFilters = {},
  sort: SortOptions = { field: 'lastObservedAt', direction: 'desc' },
  page = 1,
  pageSize = 20
): Promise<PaginatedResult<ProjectRecord>> {
  const where: Record<string, unknown> = {};

  if (filters.query) {
    where.OR = [
      { title: { contains: filters.query, mode: 'insensitive' } },
      { summary: { contains: filters.query, mode: 'insensitive' } },
      { location: { contains: filters.query, mode: 'insensitive' } },
      { address: { contains: filters.query, mode: 'insensitive' } },
    ];
  }

  if (filters.status && filters.status.length > 0) {
    where.status = { in: filters.status };
  }

  if (filters.projectType && filters.projectType.length > 0) {
    where.projectType = { in: filters.projectType };
  }

  if (filters.sourceId) {
    where.sourceId = filters.sourceId;
  }

  if (filters.dateFrom || filters.dateTo) {
    where.lastObservedAt = {};
    if (filters.dateFrom) (where.lastObservedAt as Record<string, Date>).gte = filters.dateFrom;
    if (filters.dateTo) (where.lastObservedAt as Record<string, Date>).lte = filters.dateTo;
  }

  if (filters.hasChanges) {
    where.changeEvents = { some: {} };
  }

  const orderBy: Record<string, string> = {};
  orderBy[sort.field] = sort.direction;

  const [data, total] = await Promise.all([
    prisma.project.findMany({
      where,
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        source: {
          select: { id: true, name: true, organization: true, canonicalUrl: true },
        },
        _count: {
          select: { changeEvents: true, snapshots: true },
        },
      },
    }),
    prisma.project.count({ where }),
  ]);

  return {
    data: data.map(p => ({
      ...p,
      fundingAmount: p.fundingAmount ? Number(p.fundingAmount) : undefined,
      fields: p.fields as Record<string, unknown>,
    })) as ProjectRecord[],
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

export async function getProjectBySlug(slug: string): Promise<(ProjectRecord & { source: SourceMetadata; changeEvents: ChangeEventRecord[]; snapshots: { id: string; capturedAt: Date; fingerprint: string }[] }) | null> {
  const project = await prisma.project.findUnique({
    where: { slug },
    include: {
      source: true,
      changeEvents: {
        orderBy: { firstObservedAt: 'desc' },
        include: {
          previousSnapshot: { select: { id: true, capturedAt: true } },
          newSnapshot: { select: { id: true, capturedAt: true } },
        },
      },
      snapshots: {
        orderBy: { capturedAt: 'desc' },
        select: { id: true, capturedAt: true, fingerprint: true },
      },
    },
  });

  return project ? {
    ...project,
    fundingAmount: project.fundingAmount ? Number(project.fundingAmount) : undefined,
    fields: project.fields as Record<string, unknown>,
    source: {
      ...project.source,
      config: project.source.config as unknown as SourceConfig,
    },
  } as (ProjectRecord & { source: SourceMetadata; changeEvents: ChangeEventRecord[]; snapshots: { id: string; capturedAt: Date; fingerprint: string }[] }) : null;
}

export async function getProjectById(id: string): Promise<ProjectRecord | null> {
  const project = await prisma.project.findUnique({ where: { id } });
  if (!project) return null;
  return {
    ...project,
    fundingAmount: project.fundingAmount ? Number(project.fundingAmount) : undefined,
    fields: project.fields as Record<string, unknown>,
  } as ProjectRecord;
}

export async function getSources(): Promise<SourceMetadata[]> {
  const sources = await prisma.source.findMany({
    orderBy: { name: 'asc' },
    include: {
      _count: { select: { projects: true, refreshRuns: true } },
    },
  });
  
  return sources.map(s => ({
    ...s,
    config: s.config as unknown as SourceConfig,
  })) as SourceMetadata[];
}

export async function getSourceById(id: string): Promise<SourceMetadata | null> {
  return prisma.source.findUnique({
    where: { id },
    include: {
      _count: { select: { projects: true, refreshRuns: true } },
    },
  }) as Promise<SourceMetadata | null>;
}

export async function getRecentChanges(
  filters: SearchFilters = {},
  page = 1,
  pageSize = 50
): Promise<PaginatedResult<ChangeEventRecord & { project: Pick<ProjectRecord, 'id' | 'slug' | 'title' | 'sourceId'> }>> {
  const where: Record<string, unknown> = {};

  if (filters.projectType && filters.projectType.length > 0) {
    where.project = { projectType: { in: filters.projectType } };
  }

  if (filters.sourceId) {
    where.project = { ...(where.project as object), sourceId: filters.sourceId } as Record<string, unknown>;
  }

  if (filters.dateFrom || filters.dateTo) {
    where.firstObservedAt = {};
    if (filters.dateFrom) (where.firstObservedAt as Record<string, Date>).gte = filters.dateFrom;
    if (filters.dateTo) (where.firstObservedAt as Record<string, Date>).lte = filters.dateTo;
  }

  const [data, total] = await Promise.all([
    prisma.changeEvent.findMany({
      where,
      orderBy: { firstObservedAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        project: {
          select: { id: true, slug: true, title: true, sourceId: true },
        },
        previousSnapshot: { select: { id: true, capturedAt: true } },
        newSnapshot: { select: { id: true, capturedAt: true } },
      },
    }),
    prisma.changeEvent.count({ where }),
  ]);

  return {
    data: data.map(d => ({
      ...d,
      project: {
        ...d.project,
        fundingAmount: undefined,
        fields: {},
      },
    })) as (ChangeEventRecord & { project: Pick<ProjectRecord, 'id' | 'slug' | 'title' | 'sourceId'> })[],
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

export async function getChangeEventById(id: string): Promise<(ChangeEventRecord & { project: ProjectRecord; previousSnapshot: { id: string; capturedAt: Date; fieldValues: Record<string, unknown> } | null; newSnapshot: { id: string; capturedAt: Date; fieldValues: Record<string, unknown> } }) | null> {
  const event = await prisma.changeEvent.findUnique({
    where: { id },
    include: {
      project: true,
      previousSnapshot: { select: { id: true, capturedAt: true, fieldValues: true } },
      newSnapshot: { select: { id: true, capturedAt: true, fieldValues: true } },
    },
  });
  
  if (!event) return null;
  
  return {
    ...event,
    project: {
      ...event.project,
      fundingAmount: event.project.fundingAmount ? Number(event.project.fundingAmount) : undefined,
      fields: event.project.fields as Record<string, unknown>,
    },
    previousSnapshot: event.previousSnapshot ? {
      ...event.previousSnapshot,
      fieldValues: event.previousSnapshot.fieldValues as Record<string, unknown>,
    } : null,
    newSnapshot: {
      ...event.newSnapshot,
      fieldValues: event.newSnapshot.fieldValues as Record<string, unknown>,
    },
  } as (ChangeEventRecord & { project: ProjectRecord; previousSnapshot: { id: string; capturedAt: Date; fieldValues: Record<string, unknown> } | null; newSnapshot: { id: string; capturedAt: Date; fieldValues: Record<string, unknown> } });
}

export async function getRefreshRuns(sourceId?: string, limit = 20): Promise<RefreshRunRecord[]> {
  return prisma.refreshRun.findMany({
    where: sourceId ? { sourceId } : {},
    orderBy: { startedAt: 'desc' },
    take: limit,
  }) as Promise<RefreshRunRecord[]>;
}

export async function getStats(): Promise<{
  totalProjects: number;
  trackedProjects: number;
  totalChanges: number;
  healthySources: number;
  totalSources: number;
  lastRefreshAt: Date | null;
}> {
  const [
    totalProjects,
    trackedProjects,
    totalChanges,
    sources,
    lastRefresh,
  ] = await Promise.all([
    prisma.project.count(),
    prisma.project.count({ where: { monitoringState: 'ACTIVE' } }),
    prisma.changeEvent.count(),
    prisma.source.findMany({
      select: { health: true, lastSuccessfulAt: true },
    }),
    prisma.refreshRun.findFirst({
      where: { outcome: { in: ['SUCCESS', 'PARTIAL_SUCCESS'] } },
      orderBy: { finishedAt: 'desc' },
      select: { finishedAt: true },
    }),
  ]);

  const healthySources = sources.filter(s => s.health === 'HEALTHY').length;
  const totalSources = sources.length;

  return {
    totalProjects,
    trackedProjects,
    totalChanges,
    healthySources,
    totalSources,
    lastRefreshAt: lastRefresh?.finishedAt ?? null,
  };
}

export async function getUniqueStatuses(): Promise<string[]> {
  const projects = await prisma.project.findMany({
    where: { status: { not: null } },
    select: { status: true },
    distinct: ['status'],
  });
  return projects.map(p => p.status!).filter(Boolean).sort();
}

export async function getUniqueProjectTypes(): Promise<string[]> {
  const projects = await prisma.project.findMany({
    where: { projectType: { not: null } },
    select: { projectType: true },
    distinct: ['projectType'],
  });
  return projects.map(p => p.projectType!).filter(Boolean).sort();
}

export async function getSourceHealthSummary(): Promise<Record<string, { healthy: number; degraded: number; failed: number; unknown: number }>> {
  const sources = await prisma.source.findMany({
    select: { id: true, health: true, name: true },
  });

  const summary: Record<string, { healthy: number; degraded: number; failed: number; unknown: number }> = {};
  
  for (const source of sources) {
    summary[source.id] = {
      healthy: source.health === 'HEALTHY' ? 1 : 0,
      degraded: source.health === 'DEGRADED' ? 1 : 0,
      failed: source.health === 'FAILED' ? 1 : 0,
      unknown: source.health === 'UNKNOWN' ? 1 : 0,
    };
  }

  return summary;
}