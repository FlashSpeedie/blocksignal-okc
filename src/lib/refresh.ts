import { prisma } from '@/lib/db';
import { getAdapter } from '@/lib/adapters';
import { SourceType, SourceConfig, NormalizedProject, ChangeClassification, RefreshOutcome, ChangeEventRecord } from '@/types';
import { generateFingerprint, slugify, generateDeduplicationKey, classifyChange, isMaterialChange, deepEqual } from '@/lib/utils';

export interface RefreshResult {
  sourceId: string;
  fetchedRecords: number;
  validRecords: number;
  invalidRecords: number;
  createdSnapshots: number;
  detectedChanges: number;
  outcome: RefreshOutcome;
  errorSummary?: string;
}

export async function refreshSource(sourceId: string): Promise<RefreshResult> {
  const source = await prisma.source.findUnique({
    where: { id: sourceId },
  });

  if (!source) {
    throw new Error(`Source not found: ${sourceId}`);
  }

  if (!source.enabled) {
    return {
      sourceId,
      fetchedRecords: 0,
      validRecords: 0,
      invalidRecords: 0,
      createdSnapshots: 0,
      detectedChanges: 0,
      outcome: 'SKIPPED',
      errorSummary: 'Source is disabled',
    };
  }

  const adapter = getAdapter(source.adapterType as SourceType);
  const config = source.config as unknown as SourceConfig;

  const run = await prisma.refreshRun.create({
    data: {
      sourceId,
      startedAt: new Date(),
      fetchedRecords: 0,
      validRecords: 0,
      invalidRecords: 0,
      createdSnapshots: 0,
      detectedChanges: 0,
      outcome: 'SUCCESS',
    },
  });

  let fetchedRecords = 0;
  let validRecords = 0;
  let invalidRecords = 0;
  let createdSnapshots = 0;
  let detectedChanges = 0;
  let outcome: RefreshOutcome = 'SUCCESS';
  let errorSummary: string | undefined;

  try {
    await prisma.source.update({
      where: { id: sourceId },
      data: { lastAttemptedAt: new Date() },
    });

    let projects: NormalizedProject[];
    try {
      projects = await adapter.fetchRecords(config);
      fetchedRecords = projects.length;
    } catch (fetchError) {
      const message = fetchError instanceof Error ? fetchError.message : 'Unknown fetch error';
      console.error(`[Refresh] Fetch failed for source ${sourceId}:`, message);
      
      await prisma.refreshRun.update({
        where: { id: run.id },
        data: {
          finishedAt: new Date(),
          fetchedRecords,
          validRecords,
          invalidRecords,
          createdSnapshots,
          detectedChanges,
          outcome: 'FAILED',
          errorSummary: message,
        },
      });

      await prisma.source.update({
        where: { id: sourceId },
        data: {
          lastError: message,
          health: 'FAILED',
        },
      });

      return {
        sourceId,
        fetchedRecords,
        validRecords,
        invalidRecords,
        createdSnapshots,
        detectedChanges,
        outcome: 'FAILED',
        errorSummary: message,
      };
    }

    for (const project of projects) {
      try {
        const existingProject = await prisma.project.findUnique({
          where: {
            sourceId_externalId: {
              sourceId,
              externalId: project.externalId,
            },
          },
          include: {
            snapshots: {
              orderBy: { capturedAt: 'desc' },
              take: 1,
            },
          },
        });

        const projectSlug = slugify(`${project.title}-${project.externalId}`).substring(0, 100);
        const fingerprint = generateFingerprint(project.fields);
        const now = new Date();

        if (existingProject) {
          const latestSnapshot = existingProject.snapshots[0];
          
          if (latestSnapshot && latestSnapshot.fingerprint === fingerprint) {
            await prisma.project.update({
              where: { id: existingProject.id },
              data: { lastObservedAt: now },
            });
            continue;
          }

          const newSnapshot = await prisma.snapshot.create({
            data: {
              projectId: existingProject.id,
              capturedAt: now,
              fieldValues: project.fields as any,
              fingerprint,
              sourceUrl: project.sourceUrl,
              validationStatus: 'VALID',
            },
          });

          createdSnapshots++;

          if (latestSnapshot) {
            const changes = detectChanges(
              existingProject.id,
              { ...latestSnapshot, fieldValues: latestSnapshot.fieldValues as Record<string, unknown> },
              { ...newSnapshot, fieldValues: newSnapshot.fieldValues as Record<string, unknown> },
              project.sourceUrl
            );
            
            for (const change of changes) {
              await prisma.changeEvent.create({
                data: {
                  projectId: existingProject.id,
                  previousSnapshotId: latestSnapshot.id,
                  newSnapshotId: newSnapshot.id,
                  fieldName: change.fieldName,
                  previousValue: change.previousValue,
                  newValue: change.newValue,
                  firstObservedAt: change.firstObservedAt,
                  previousObservedAt: change.previousObservedAt,
                  sourceUrl: change.sourceUrl,
                  classification: change.classification,
                  deduplicationKey: change.deduplicationKey,
                },
              });
              detectedChanges++;
            }
          }

          await prisma.project.update({
            where: { id: existingProject.id },
            data: {
              title: project.title,
              summary: project.summary,
              status: project.status,
              location: project.location,
              address: project.address,
              latitude: project.latitude,
              longitude: project.longitude,
              projectType: project.projectType,
              fundingAmount: project.fundingAmount ? String(project.fundingAmount) : null,
              fundingSource: project.fundingSource,
              startDate: project.startDate,
              estimatedEndDate: project.estimatedEndDate,
              actualEndDate: project.actualEndDate,
              fields: project.fields as any,
              sourceUrl: project.sourceUrl,
              fingerprint,
              lastObservedAt: now,
            },
          });
        } else {
          const newProject = await prisma.project.create({
            data: {
              sourceId,
              externalId: project.externalId,
              slug: projectSlug,
              title: project.title,
              summary: project.summary,
              status: project.status,
              location: project.location,
              address: project.address,
              latitude: project.latitude,
              longitude: project.longitude,
              projectType: project.projectType,
              fundingAmount: project.fundingAmount ? String(project.fundingAmount) : null,
              fundingSource: project.fundingSource,
              startDate: project.startDate,
              estimatedEndDate: project.estimatedEndDate,
              actualEndDate: project.actualEndDate,
              fields: project.fields as any,
              sourceUrl: project.sourceUrl,
              fingerprint,
              firstObservedAt: now,
              lastObservedAt: now,
              monitoringState: 'ACTIVE',
            },
          });

          await prisma.snapshot.create({
            data: {
              projectId: newProject.id,
              capturedAt: now,
              fieldValues: project.fields as any,
              fingerprint,
              sourceUrl: project.sourceUrl,
              validationStatus: 'VALID',
            },
          });

          createdSnapshots++;

          await prisma.changeEvent.create({
            data: {
              projectId: newProject.id,
              newSnapshotId: (await prisma.snapshot.findFirst({
                where: { projectId: newProject.id },
                orderBy: { capturedAt: 'desc' },
              }))!.id,
              fieldName: 'initial_record',
              previousValue: null,
              newValue: JSON.stringify(project.fields),
              firstObservedAt: now,
              sourceUrl: project.sourceUrl,
              classification: 'NEW_PROJECT',
              deduplicationKey: generateDeduplicationKey(newProject.id, 'initial_record', undefined, JSON.stringify(project.fields)),
            },
          });
          detectedChanges++;
        }

        validRecords++;
      } catch (projectError) {
        console.error(`[Refresh] Failed to process project:`, projectError);
        invalidRecords++;
      }
    }

    if (invalidRecords > 0 && validRecords === 0) {
      outcome = 'FAILED';
      errorSummary = 'All records failed validation';
    } else if (invalidRecords > 0) {
      outcome = 'PARTIAL_SUCCESS';
      errorSummary = `${invalidRecords} records failed validation`;
    }

    await prisma.source.update({
      where: { id: sourceId },
      data: {
        lastSuccessfulAt: new Date(),
        lastError: errorSummary || null,
        health: outcome === 'FAILED' ? 'FAILED' : outcome === 'PARTIAL_SUCCESS' ? 'DEGRADED' : 'HEALTHY',
        recordCount: validRecords,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error(`[Refresh] Unexpected error for source ${sourceId}:`, message);
    outcome = 'FAILED';
    errorSummary = message;

    await prisma.source.update({
      where: { id: sourceId },
      data: {
        lastError: message,
        health: 'FAILED',
      },
    });
  } finally {
    await prisma.refreshRun.update({
      where: { id: run.id },
      data: {
        finishedAt: new Date(),
        fetchedRecords,
        validRecords,
        invalidRecords,
        createdSnapshots,
        detectedChanges,
        outcome,
        errorSummary,
      },
    });
  }

  return {
    sourceId,
    fetchedRecords,
    validRecords,
    invalidRecords,
    createdSnapshots,
    detectedChanges,
    outcome,
    errorSummary,
  };
}

function detectChanges(
  projectId: string,
  previousSnapshot: { id: string; fieldValues: Record<string, unknown>; capturedAt: Date },
  newSnapshot: { id: string; fieldValues: Record<string, unknown>; capturedAt: Date },
  sourceUrl: string
): Omit<ChangeEventRecord, 'id' | 'projectId' | 'previousSnapshotId' | 'newSnapshotId'>[] {
  const changes: Omit<ChangeEventRecord, 'id' | 'projectId' | 'previousSnapshotId' | 'newSnapshotId'>[] = [];
  const allFields = Array.from(new Set([
    ...Object.keys(previousSnapshot.fieldValues),
    ...Object.keys(newSnapshot.fieldValues),
  ]));

  for (const field of allFields) {
    const oldValue = previousSnapshot.fieldValues[field];
    const newValue = newSnapshot.fieldValues[field];

    if (!isMaterialChange(field, oldValue, newValue)) continue;

    const classification = classifyChange(field);
    const now = new Date();

    changes.push({
      fieldName: field,
      previousValue: oldValue !== undefined ? String(oldValue) : undefined,
      newValue: newValue !== undefined ? String(newValue) : undefined,
      firstObservedAt: now,
      previousObservedAt: previousSnapshot.capturedAt,
      sourceUrl,
      classification,
      deduplicationKey: generateDeduplicationKey(
        projectId,
        field,
        oldValue !== undefined ? String(oldValue) : undefined,
        newValue !== undefined ? String(newValue) : undefined
      ),
    });
  }

  return changes;
}

export async function refreshAllSources(): Promise<RefreshResult[]> {
  const sources = await prisma.source.findMany({
    where: { enabled: true },
  });

  const results: RefreshResult[] = [];
  for (const source of sources) {
    const result = await refreshSource(source.id);
    results.push(result);
  }

  return results;
}