import { z } from 'zod';
import { SourceType, SourceConfig, NormalizedProject } from '@/types';

export const SourceConfigSchema = z.object({
  url: z.string().url(),
  selectors: z.record(z.string()).optional(),
  headers: z.record(z.string()).optional(),
  pagination: z.object({
    type: z.enum(['offset', 'page', 'cursor']),
    param: z.string(),
    limit: z.number().positive(),
  }).optional(),
  dateFormat: z.string().optional(),
  fieldMapping: z.record(z.string()).optional(),
});

export const NormalizedProjectSchema = z.object({
  externalId: z.string().min(1),
  title: z.string().min(1),
  summary: z.string().optional(),
  status: z.string().optional(),
  location: z.string().optional(),
  address: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  projectType: z.string().optional(),
  fundingAmount: z.number().optional(),
  fundingSource: z.string().optional(),
  startDate: z.date().optional(),
  estimatedEndDate: z.date().optional(),
  actualEndDate: z.date().optional(),
  fields: z.record(z.unknown()),
  sourceUrl: z.string().url(),
});

export const SourceCreateSchema = z.object({
  name: z.string().min(1),
  organization: z.string().optional(),
  canonicalUrl: z.string().url(),
  adapterType: z.enum(['HTML_SCRAPER', 'ARCGIS_FEATURE_SERVER', 'JSON_API', 'RSS_FEED', 'CSV_EXPORT', 'MANUAL']),
  config: SourceConfigSchema,
  enabled: z.boolean().default(true),
});

export const RefreshRunCreateSchema = z.object({
  sourceId: z.string(),
  fetchedRecords: z.number().default(0),
  validRecords: z.number().default(0),
  invalidRecords: z.number().default(0),
  createdSnapshots: z.number().default(0),
  detectedChanges: z.number().default(0),
  outcome: z.enum(['SUCCESS', 'PARTIAL_SUCCESS', 'FAILED', 'SKIPPED']),
  errorSummary: z.string().optional(),
});

export function validateNormalizedProject(data: unknown): NormalizedProject {
  return NormalizedProjectSchema.parse(data);
}

export function validateSourceConfig(data: unknown): SourceConfig {
  return SourceConfigSchema.parse(data);
}

export function validateRefreshRun(data: unknown) {
  return RefreshRunCreateSchema.parse(data);
}