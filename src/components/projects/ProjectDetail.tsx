'use client';

import { cn, formatDate, formatCurrency, formatRelativeTime } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { MapPin, DollarSign, Calendar, Clock, ExternalLink, FileText, Link as LinkIcon, AlertTriangle, CheckCircle, Info } from 'lucide-react';

interface ProjectDetailProps {
  project: {
    id: string;
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
    startDate?: Date | string;
    estimatedEndDate?: Date | string;
    actualEndDate?: Date | string;
    fields: Record<string, unknown>;
    sourceUrl: string;
    fingerprint: string;
    firstObservedAt: Date | string;
    lastObservedAt: Date | string;
    monitoringState: string;
    source: {
      id: string;
      name: string;
      organization?: string;
      canonicalUrl: string;
      adapterType: string;
      health: string;
      lastSuccessfulAt?: Date | string;
    };
    changeEvents: Array<{
      id: string;
      fieldName: string;
      previousValue?: string;
      newValue?: string;
      firstObservedAt: Date | string;
      previousObservedAt?: Date | string;
      sourceUrl: string;
      classification: string;
      previousSnapshot?: { id: string; capturedAt: Date | string } | null;
      newSnapshot: { id: string; capturedAt: Date | string };
    }>;
    snapshots: Array<{ id: string; capturedAt: Date | string; fingerprint: string }>;
  };
}

const statusColors: Record<string, 'default' | 'success' | 'warning' | 'danger' | 'info' | 'neutral'> = {
  planning: 'info',
  active: 'success',
  construction: 'success',
  delayed: 'warning',
  completed: 'success',
  cancelled: 'danger',
  'on hold': 'warning',
  design: 'info',
  bidding: 'neutral',
  unknown: 'neutral',
};

const classificationLabels: Record<string, string> = {
  STATUS_CHANGE: 'Status Change',
  SCHEDULE_CHANGE: 'Schedule Change',
  FUNDING_CHANGE: 'Funding Change',
  SCOPE_CHANGE: 'Scope Change',
  LOCATION_CHANGE: 'Location Change',
  DOCUMENT_ADDED: 'Document Added',
  DOCUMENT_REMOVED: 'Document Removed',
  METADATA_CHANGE: 'Metadata Change',
  NEW_PROJECT: 'New Project',
  PROJECT_REMOVED: 'Project Removed',
  OTHER: 'Other Change',
};

function formatFieldValue(value: unknown): string {
  if (value === undefined || value === null) return 'Not available';
  if (typeof value === 'object') return JSON.stringify(value, null, 2);
  return String(value);
}

export function ProjectDetail({ project }: ProjectDetailProps) {
  const statusKey = project.status?.toLowerCase() || 'unknown';
  const statusVariant = statusColors[statusKey] || 'neutral';

  const fieldGroups = [
    { label: 'Basic Information', fields: ['title', 'summary', 'status', 'projectType'] },
    { label: 'Location', fields: ['location', 'address', 'latitude', 'longitude'] },
    { label: 'Schedule', fields: ['startDate', 'estimatedEndDate', 'actualEndDate'] },
    { label: 'Funding', fields: ['fundingAmount', 'fundingSource'] },
    { label: 'Source & Tracking', fields: ['sourceUrl', 'firstObservedAt', 'lastObservedAt', 'monitoringState', 'fingerprint'] },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <nav className="flex items-center gap-2 text-sm text-civic-500 mb-2" aria-label="Breadcrumb">
            <a href="/projects" className="hover:text-civic-700">Projects</a>
            <span aria-hidden="true">/</span>
            <span className="text-civic-900 font-medium" aria-current="page">{project.title}</span>
          </nav>
          <h1 className="text-3xl font-bold text-civic-900">{project.title}</h1>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {project.status && (
            <Badge variant={statusVariant} size="md" className="text-base px-3 py-1">
              {project.status}
            </Badge>
          )}
          <Badge variant="neutral" size="md">
            {project.monitoringState}
          </Badge>
          <a
            href={project.source.canonicalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-2 text-sm text-civic-600 hover:text-civic-900 border border-civic-200 rounded-xl hover:bg-civic-50 transition-colors"
          >
            <ExternalLink className="h-4 w-4" aria-hidden="true" />
            View Source
          </a>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {project.summary && (
            <Card padding="md">
              <CardHeader>
                <CardTitle>Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-civic-700 whitespace-pre-wrap">{project.summary}</p>
              </CardContent>
            </Card>
          )}

          <Card padding="md">
            <CardHeader>
              <CardTitle>Project Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {fieldGroups.map(group => (
                <div key={group.label} className="border-t border-civic-100 pt-4 first:border-0 first:pt-0">
                  <h4 className="text-sm font-medium text-civic-500 uppercase tracking-wide mb-3">{group.label}</h4>
                  <dl className="grid sm:grid-cols-2 gap-3">
                    {group.fields.map(field => {
                      let value: unknown;
                      let label = field;
                      
                      switch (field) {
                        case 'title': value = project.title; label = 'Title'; break;
                        case 'summary': value = project.summary; label = 'Summary'; break;
                        case 'status': value = project.status; label = 'Status'; break;
                        case 'projectType': value = project.projectType; label = 'Project Type'; break;
                        case 'location': value = project.location; label = 'Location'; break;
                        case 'address': value = project.address; label = 'Address'; break;
                        case 'latitude': value = project.latitude; label = 'Latitude'; break;
                        case 'longitude': value = project.longitude; label = 'Longitude'; break;
                        case 'startDate': value = project.startDate; label = 'Start Date'; break;
                        case 'estimatedEndDate': value = project.estimatedEndDate; label = 'Estimated End'; break;
                        case 'actualEndDate': value = project.actualEndDate; label = 'Actual End'; break;
                        case 'fundingAmount': value = project.fundingAmount; label = 'Funding Amount'; break;
                        case 'fundingSource': value = project.fundingSource; label = 'Funding Source'; break;
                        case 'sourceUrl': value = project.sourceUrl; label = 'Source URL'; break;
                        case 'firstObservedAt': value = project.firstObservedAt; label = 'First Observed'; break;
                        case 'lastObservedAt': value = project.lastObservedAt; label = 'Last Observed'; break;
                        case 'monitoringState': value = project.monitoringState; label = 'Monitoring State'; break;
                        case 'fingerprint': value = project.fingerprint; label = 'Record Fingerprint'; break;
                        default: value = project.fields[field]; label = field;
                      }
                      
                      if (value === undefined || value === null || value === '') return null;
                      
                      let formattedValue: React.ReactNode = formatFieldValue(value);
                      if (field === 'fundingAmount' && typeof value === 'number') formattedValue = formatCurrency(value);
                      if (['startDate', 'estimatedEndDate', 'actualEndDate', 'firstObservedAt', 'lastObservedAt'].includes(field)) {
                        formattedValue = formatDate(value as Date | string, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
                      }
                      if (field === 'sourceUrl') {
                        const url = String(value);
                        formattedValue = (
                          <a href={url} target="_blank" rel="noopener noreferrer" className="text-civic-600 hover:text-civic-900 underline break-all">
                            {url}
                          </a>
                        );
                      }
                      
                      return (
                        <div key={field} className="flex flex-col sm:flex-row sm:items-baseline gap-1">
                          <dt className="text-sm text-civic-500 w-full sm:w-32 flex-shrink-0">{label}</dt>
                          <dd className="text-sm text-civic-900 font-medium break-all">{formattedValue}</dd>
                        </div>
                      );
                    })}
                  </dl>
                </div>
              ))}
            </CardContent>
          </Card>

          {project.changeEvents.length > 0 && (
            <Card padding="md">
              <CardHeader>
                <CardTitle>Change History</CardTitle>
                <CardDescription>
                  {project.changeEvents.length} material change{project.changeEvents.length !== 1 ? 's' : ''} detected since monitoring began
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {project.changeEvents.map((change, index) => (
                    <div key={change.id} className="border-l-2 border-civic-200 pl-4 pb-4 last:pb-0 relative">
                      <div className="absolute left-[-6px] top-0 h-2 w-2 rounded-full bg-civic-400" aria-hidden="true" />
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="info" size="sm">
                              {classificationLabels[change.classification] || change.classification}
                            </Badge>
                            <span className="text-xs text-civic-500">
                              Observed {formatRelativeTime(change.firstObservedAt)}
                              {change.previousObservedAt && ` (previous: ${formatRelativeTime(change.previousObservedAt)})`}
                            </span>
                          </div>
                          <div className="grid sm:grid-cols-2 gap-4 text-sm">
                            {change.previousValue !== undefined && (
                              <div className="bg-red-50 p-3 rounded-lg border border-red-100">
                                <div className="flex items-center gap-1.5 text-red-700 mb-1">
                                  <span className="font-medium">Previous</span>
                                  {change.previousObservedAt && (
                                    <span className="text-xs text-red-500">
                                      ({formatDate(change.previousObservedAt, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })})
                                    </span>
                                  )}
                                </div>
                                <pre className="text-red-900 whitespace-pre-wrap text-xs font-mono">{change.previousValue}</pre>
                              </div>
                            )}
                            <div className="bg-green-50 p-3 rounded-lg border border-green-100">
                              <div className="flex items-center gap-1.5 text-green-700 mb-1">
                                <span className="font-medium">Current</span>
                                <span className="text-xs text-green-500">
                                  ({formatDate(change.firstObservedAt, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })})
                                </span>
                              </div>
                              <pre className="text-green-900 whitespace-pre-wrap text-xs font-mono">{change.newValue || 'Removed'}</pre>
                            </div>
                          </div>
                          <a
                            href={change.sourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-2 inline-flex items-center gap-1 text-xs text-civic-500 hover:text-civic-700"
                          >
                            <FileText className="h-3 w-3" aria-hidden="true" />
                            View source record
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {project.changeEvents.length === 0 && (
            <Card padding="md" variant="outlined">
              <CardContent className="flex items-center gap-3 p-4">
                <Info className="h-6 w-6 text-civic-400 flex-shrink-0" aria-hidden="true" />
                <div>
                  <p className="font-medium text-civic-700">No changes detected yet</p>
                  <p className="text-sm text-civic-500">
                    This project has been tracked since {formatDate(project.firstObservedAt, { month: 'long', day: 'numeric', year: 'numeric' })}.
                    Changes will appear here when detected.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card padding="md">
            <CardHeader>
              <CardTitle>Source Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <Database className="h-5 w-5 text-civic-400" aria-hidden="true" />
                <span className="font-medium text-civic-700">{project.source.name}</span>
              </div>
              {project.source.organization && (
                <div className="flex items-center gap-2 text-civic-600">
                  <Building className="h-5 w-5 text-civic-400" aria-hidden="true" />
                  <span>{project.source.organization}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-sm text-civic-500">
                <span className="font-medium text-civic-700 w-28">Type:</span>
                <span>{project.source.adapterType.replace('_', ' ')}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-civic-500">
                <span className="font-medium text-civic-700 w-28">Health:</span>
                <Badge variant={project.source.health === 'HEALTHY' ? 'success' : project.source.health === 'DEGRADED' ? 'warning' : project.source.health === 'FAILED' ? 'danger' : 'neutral'} size="sm">
                  {project.source.health}
                </Badge>
              </div>
              {project.source.lastSuccessfulAt && (
                <div className="flex items-center gap-2 text-sm text-civic-500">
                  <Clock className="h-4 w-4 text-civic-400" aria-hidden="true" />
                  <span>Last refresh: {formatRelativeTime(project.source.lastSuccessfulAt)}</span>
                </div>
              )}
              <a
                href={project.source.canonicalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex items-center gap-1.5 text-sm text-civic-600 hover:text-civic-900"
              >
                <ExternalLink className="h-4 w-4" aria-hidden="true" />
                View source website
              </a>
            </CardContent>
          </Card>

          <Card padding="md" variant="outlined">
            <CardHeader>
              <CardTitle>Raw Data Access</CardTitle>
              <CardDescription className="text-xs">For verification and research</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <a
                href={project.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 w-full px-4 py-2.5 text-sm font-medium text-civic-600 hover:text-civic-900 border border-civic-200 rounded-xl hover:bg-civic-50 transition-colors justify-center"
              >
                <FileText className="h-4 w-4" aria-hidden="true" />
                Current source record
              </a>
              <a
                href={`/api/projects/${project.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 w-full px-4 py-2.5 text-sm font-medium text-civic-600 hover:text-civic-900 border border-civic-200 rounded-xl hover:bg-civic-50 transition-colors justify-center"
              >
                <LinkIcon className="h-4 w-4" aria-hidden="true" />
                API endpoint (JSON)
              </a>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

import { Database, Building } from 'lucide-react';