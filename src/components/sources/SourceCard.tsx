'use client';

import { cn, formatRelativeTime } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import { Card, CardContent, CardFooter } from '@/components/ui/Card';
import { Database, Globe, Clock, AlertCircle, CheckCircle, XCircle, Loader2 } from 'lucide-react';

interface SourceCardProps {
  source: {
    id: string;
    name: string;
    organization?: string;
    canonicalUrl: string;
    adapterType: string;
    enabled: boolean;
    health: string;
    recordCount: number;
    lastSuccessfulAt?: Date | string;
    lastAttemptedAt?: Date | string;
    lastError?: string;
    createdAt: Date | string;
    _count: { projects: number; refreshRuns: number };
  };
}

const healthIcons = {
  HEALTHY: CheckCircle,
  DEGRADED: AlertCircle,
  FAILED: XCircle,
  UNKNOWN: Loader2,
};

const healthColors: Record<string, 'success' | 'warning' | 'danger' | 'neutral'> = {
  HEALTHY: 'success',
  DEGRADED: 'warning',
  FAILED: 'danger',
  UNKNOWN: 'neutral',
};

export function SourceCard({ source }: SourceCardProps) {
  const HealthIcon = healthIcons[source.health as keyof typeof healthIcons] || Loader2;
  const healthVariant = healthColors[source.health] || 'neutral';

  return (
    <Card variant="outlined" padding="md" className="h-full">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-civic-900 truncate">{source.name}</h3>
          {source.organization && (
            <p className="text-sm text-civic-500 mt-0.5">{source.organization}</p>
          )}
        </div>
        <Badge variant={healthVariant} size="sm" className="gap-1">
          <HealthIcon className="h-3.5 w-3.5" aria-hidden="true" />
          {source.health}
        </Badge>
      </div>

      <div className="space-y-3 text-sm">
        <div className="flex items-center gap-2 text-civic-600">
          <Globe className="h-4 w-4 flex-shrink-0 text-civic-400" aria-hidden="true" />
          <a href={source.canonicalUrl} target="_blank" rel="noopener noreferrer" className="hover:text-civic-900 truncate block">
            {source.canonicalUrl}
          </a>
        </div>
        
        <div className="flex items-center gap-2 text-civic-600">
          <Database className="h-4 w-4 flex-shrink-0 text-civic-400" aria-hidden="true" />
          <span>Type: {source.adapterType.replace('_', ' ')}</span>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-2 border-t border-civic-100">
          <div>
            <p className="text-xs text-civic-400 uppercase tracking-wide">Projects</p>
            <p className="text-2xl font-bold text-civic-900">{source._count.projects}</p>
          </div>
          <div>
            <p className="text-xs text-civic-400 uppercase tracking-wide">Refresh Runs</p>
            <p className="text-2xl font-bold text-civic-900">{source._count.refreshRuns}</p>
          </div>
        </div>

        <div className="space-y-1.5 text-xs text-civic-500">
          <div className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Monitoring since: {formatRelativeTime(source.createdAt)}</span>
          </div>
          {source.lastSuccessfulAt && (
            <div className="flex items-center gap-1.5">
              <CheckCircle className="h-3.5 w-3.5 text-green-500" aria-hidden="true" />
              <span>Last successful: {formatRelativeTime(source.lastSuccessfulAt)}</span>
            </div>
          )}
          {source.lastAttemptedAt && source.lastAttemptedAt !== source.lastSuccessfulAt && (
            <div className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-amber-500" aria-hidden="true" />
              <span>Last attempt: {formatRelativeTime(source.lastAttemptedAt)}</span>
            </div>
          )}
        </div>

        {source.lastError && (
          <div className="p-3 bg-red-50 border border-red-100 rounded-lg">
            <div className="flex items-center gap-1.5 text-red-700 mb-1">
              <AlertCircle className="h-4 w-4" aria-hidden="true" />
              <span className="font-medium text-xs">Last Error</span>
            </div>
            <p className="text-red-600 text-xs font-mono truncate">{source.lastError}</p>
          </div>
        )}
      </div>

      <CardFooter>
        <a
          href={source.canonicalUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-sm text-civic-600 hover:text-civic-900 w-full justify-center"
        >
          <Globe className="h-4 w-4" aria-hidden="true" />
          View Source
        </a>
      </CardFooter>
    </Card>
  );
}