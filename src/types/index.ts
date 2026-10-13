export type SourceType = 'HTML_SCRAPER' | 'ARCGIS_FEATURE_SERVER' | 'JSON_API' | 'RSS_FEED' | 'CSV_EXPORT' | 'MANUAL';
export type SourceHealth = 'HEALTHY' | 'DEGRADED' | 'FAILED' | 'UNKNOWN';
export type ChangeClassification = 'STATUS_CHANGE' | 'SCHEDULE_CHANGE' | 'FUNDING_CHANGE' | 'SCOPE_CHANGE' | 'LOCATION_CHANGE' | 'DOCUMENT_ADDED' | 'DOCUMENT_REMOVED' | 'METADATA_CHANGE' | 'NEW_PROJECT' | 'PROJECT_REMOVED' | 'OTHER';
export type RefreshOutcome = 'SUCCESS' | 'PARTIAL_SUCCESS' | 'FAILED' | 'SKIPPED';
export type MonitoringState = 'ACTIVE' | 'ARCHIVED' | 'PAUSED' | 'ERROR';

export interface SourceConfig {
  url: string;
  selectors?: Record<string, string>;
  headers?: Record<string, string>;
  pagination?: {
    type: 'offset' | 'page' | 'cursor';
    param: string;
    limit: number;
  };
  dateFormat?: string;
  fieldMapping?: Record<string, string>;
}

export interface NormalizedProject {
  externalId: string;
  title: string;
  summary?: string;
  status?: string;
  location?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  projectType?: string;
  fundingAmount?: number;
  fundingSource?: string;
  startDate?: Date;
  estimatedEndDate?: Date;
  actualEndDate?: Date;
  fields: Record<string, unknown>;
  sourceUrl: string;
}

export interface SourceMetadata {
  id: string;
  name: string;
  organization?: string;
  canonicalUrl: string;
  adapterType: SourceType;
  config: SourceConfig;
  enabled: boolean;
  lastAttemptedAt?: Date;
  lastSuccessfulAt?: Date;
  lastError?: string;
  health: SourceHealth;
  recordCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProjectRecord {
  id: string;
  sourceId: string;
  externalId: string;
  slug: string;
  title: string;
  summary?: string;
  status?: string;
  location?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  projectType?: string;
  fundingAmount?: number;
  fundingSource?: string;
  startDate?: Date;
  estimatedEndDate?: Date;
  actualEndDate?: Date;
  fields: Record<string, unknown>;
  sourceUrl: string;
  fingerprint: string;
  firstObservedAt: Date;
  lastObservedAt: Date;
  monitoringState: MonitoringState;
}

export interface SnapshotRecord {
  id: string;
  projectId: string;
  capturedAt: Date;
  fieldValues: Record<string, unknown>;
  fingerprint: string;
  sourceUrl: string;
  validationStatus: string;
  sourceVersion?: string;
}

export interface ChangeEventRecord {
  id: string;
  projectId: string;
  previousSnapshotId?: string;
  newSnapshotId: string;
  fieldName: string;
  previousValue?: string;
  newValue?: string;
  firstObservedAt: Date;
  previousObservedAt?: Date;
  sourceUrl: string;
  classification: ChangeClassification;
  deduplicationKey: string;
}

export interface RefreshRunRecord {
  id: string;
  sourceId: string;
  startedAt: Date;
  finishedAt?: Date;
  fetchedRecords: number;
  validRecords: number;
  invalidRecords: number;
  createdSnapshots: number;
  detectedChanges: number;
  outcome: RefreshOutcome;
  errorSummary?: string;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface SearchFilters {
  query?: string;
  status?: string[];
  projectType?: string[];
  sourceId?: string;
  dateFrom?: Date;
  dateTo?: Date;
  hasChanges?: boolean;
}

export interface SortOptions {
  field: 'title' | 'lastObservedAt' | 'firstObservedAt' | 'status' | 'projectType';
  direction: 'asc' | 'desc';
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  meta?: Record<string, unknown>;
}