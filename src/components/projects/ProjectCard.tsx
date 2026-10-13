'use client';

import Link from 'next/link';
import { cn, formatDate, formatRelativeTime, formatCurrency } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import { Card, CardContent, CardFooter } from '@/components/ui/Card';
import { MapPin, DollarSign, Calendar, Clock, ExternalLink } from 'lucide-react';

interface ProjectCardProps {
  project: {
    id: string;
    slug: string;
    title: string;
    summary?: string;
    status?: string;
    location?: string;
    address?: string;
    projectType?: string;
    fundingAmount?: number;
    fundingSource?: string;
    startDate?: Date | string;
    estimatedEndDate?: Date | string;
    lastObservedAt: Date | string;
    source: { name: string; canonicalUrl: string };
    _count: { changeEvents: number; snapshots: number };
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

export function ProjectCard({ project }: ProjectCardProps) {
  const statusKey = project.status?.toLowerCase() || 'unknown';
  const statusVariant = statusColors[statusKey] || 'neutral';

  return (
    <Card variant="outlined" hover padding="md" className="h-full flex flex-col">
      <div className="flex items-start justify-between gap-3 mb-3">
        <h3 className="text-lg font-semibold text-civic-900 line-clamp-2 flex-1">
          <Link href={`/projects/${project.slug}`} className="hover:text-civic-600 transition-colors">
            {project.title}
          </Link>
        </h3>
        {project.status && (
          <Badge variant={statusVariant} size="sm">
            {project.status}
          </Badge>
        )}
      </div>

      {project.summary && (
        <p className="text-civic-600 text-sm mb-4 line-clamp-3 flex-1">
          {project.summary}
        </p>
      )}

      <div className="space-y-2 text-sm text-civic-500">
        {project.location && (
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
            <span>{project.location}</span>
          </div>
        )}
        {project.address && (
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
            <span>{project.address}</span>
          </div>
        )}
        {project.projectType && (
          <div className="flex items-center gap-2">
            <span className="text-civic-400">Type:</span>
            <span className="font-medium text-civic-700">{project.projectType}</span>
          </div>
        )}
        {project.fundingAmount !== undefined && project.fundingAmount !== null && (
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
            <span>{formatCurrency(project.fundingAmount)}</span>
            {project.fundingSource && <span className="text-civic-400">({project.fundingSource})</span>}
          </div>
        )}
        {project.startDate && (
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
            <span>Start: {formatDate(project.startDate)}</span>
          </div>
        )}
        {project.estimatedEndDate && (
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
            <span>Est. End: {formatDate(project.estimatedEndDate)}</span>
          </div>
        )}
      </div>

      <CardFooter>
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2 text-xs text-civic-400">
            <Clock className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Updated {formatRelativeTime(project.lastObservedAt)}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-civic-400">{project._count.changeEvents} changes</span>
            <a
              href={project.source.canonicalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-civic-500 hover:text-civic-700 p-1.5 rounded-lg hover:bg-civic-100 transition-colors"
              aria-label={`View on ${project.source.name}`}
            >
              <ExternalLink className="h-4 w-4" aria-hidden="true" />
            </a>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}