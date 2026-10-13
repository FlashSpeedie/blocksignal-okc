'use client';

import { useState } from 'react';
import { cn, formatDate, formatRelativeTime, classifyChange } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Clock, ArrowRight, ExternalLink, FileText, ChevronDown, ChevronUp } from 'lucide-react';

interface ChangeFeedProps {
  changes: Array<{
    id: string;
    fieldName: string;
    previousValue?: string;
    newValue?: string;
    firstObservedAt: Date | string;
    previousObservedAt?: Date | string;
    sourceUrl: string;
    classification: string;
    project: { id: string; slug: string; title: string; sourceId: string };
  }>;
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

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

const classificationColors: Record<string, 'default' | 'success' | 'warning' | 'danger' | 'info' | 'neutral'> = {
  STATUS_CHANGE: 'info',
  SCHEDULE_CHANGE: 'warning',
  FUNDING_CHANGE: 'success',
  SCOPE_CHANGE: 'info',
  LOCATION_CHANGE: 'neutral',
  DOCUMENT_ADDED: 'success',
  DOCUMENT_REMOVED: 'danger',
  METADATA_CHANGE: 'neutral',
  NEW_PROJECT: 'info',
  PROJECT_REMOVED: 'danger',
  OTHER: 'neutral',
};

export function ChangeFeed({ changes, total, page, pageSize, totalPages, onPageChange }: ChangeFeedProps) {
  const [expandedIds, setExpandedIds] = useState<string[]>([]);

  const toggleExpanded = (id: string) => {
    setExpandedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  if (changes.length === 0) {
    return (
      <Card padding="lg" className="text-center py-12">
        <FileText className="h-12 w-12 text-civic-300 mx-auto mb-4" aria-hidden="true" />
        <h3 className="text-lg font-medium text-civic-700 mb-2">No changes found</h3>
        <p className="text-civic-500">
          No material changes have been detected yet. Changes will appear here when detected.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-sm text-civic-500">
        <span>Showing {((page - 1) * pageSize) + 1}–{Math.min(page * pageSize, total)} of {total} changes</span>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => onPageChange(page - 1)} disabled={page <= 1}>
            Previous
          </Button>
          <span className="px-3">Page {page} of {totalPages}</span>
          <Button variant="outline" size="sm" onClick={() => onPageChange(page + 1)} disabled={page >= totalPages}>
            Next
          </Button>
        </div>
      </div>

      <div className="space-y-3" role="feed" aria-label="Change feed">
        {changes.map(change => {
          const isExpanded = expandedIds.includes(change.id);
          const variant = classificationColors[change.classification] || 'neutral';
          
          return (
            <Card key={change.id} variant="outlined" padding="md" className="hover:shadow-card-hover transition-shadow">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-civic-50 flex items-center justify-center">
                  <Badge variant={variant} size="md" className="text-xs px-2 py-1 whitespace-normal text-center">
                    {classificationLabels[change.classification] || change.classification}
                  </Badge>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <Link href={`/projects/${change.project.slug}`} className="font-semibold text-civic-900 hover:text-civic-600 transition-colors line-clamp-1">
                        {change.project.title}
                      </Link>
                      <div className="flex items-center gap-3 mt-1 text-sm text-civic-500">
                        <span className="font-medium text-civic-700">{change.fieldName}</span>
                        <span>•</span>
                        <span>Observed {formatRelativeTime(change.firstObservedAt)}</span>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleExpanded(change.id)}
                      className="flex-shrink-0 p-1"
                      aria-expanded={isExpanded}
                      aria-controls={`change-detail-${change.id}`}
                    >
                      {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                    </Button>
                  </div>

                  <div id={`change-detail-${change.id}`} className={cn('mt-3 overflow-hidden transition-all duration-200', isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0')}>
                    <div className="grid sm:grid-cols-2 gap-4">
                      {change.previousValue !== undefined && (
                        <div className="bg-red-50 p-3 rounded-lg border border-red-100">
                          <div className="flex items-center gap-1.5 text-red-700 mb-1">
                            <span className="font-medium text-xs">Previous</span>
                            {change.previousObservedAt && (
                              <span className="text-xs text-red-500">
                                ({formatDate(change.previousObservedAt, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })})
                              </span>
                            )}
                          </div>
                          <pre className="text-red-900 whitespace-pre-wrap text-xs font-mono max-h-32 overflow-auto">{change.previousValue}</pre>
                        </div>
                      )}
                      <div className="bg-green-50 p-3 rounded-lg border border-green-100">
                        <div className="flex items-center gap-1.5 text-green-700 mb-1">
                          <span className="font-medium text-xs">Current</span>
                          <span className="text-xs text-green-500">
                            ({formatDate(change.firstObservedAt, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })})
                          </span>
                        </div>
                        <pre className="text-green-900 whitespace-pre-wrap text-xs font-mono max-h-32 overflow-auto">{change.newValue || 'Removed'}</pre>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center gap-4 text-sm">
                      <a
                        href={change.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-civic-500 hover:text-civic-700"
                      >
                        <FileText className="h-4 w-4" aria-hidden="true" />
                        Source record
                      </a>
                      <Link
                        href={`/projects/${change.project.slug}`}
                        className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-civic-600 hover:text-civic-900 border border-civic-200 rounded-xl hover:bg-civic-50 transition-colors"
                      >
                        <ArrowRight className="h-4 w-4" aria-hidden="true" />
                        View project
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <Button variant="outline" size="sm" onClick={() => onPageChange(page - 1)} disabled={page <= 1}>
            Previous
          </Button>
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            let pageNum: number;
            if (totalPages <= 5) pageNum = i + 1;
            else if (page <= 3) pageNum = i + 1;
            else if (page >= totalPages - 2) pageNum = totalPages - 4 + i;
            else pageNum = page - 2 + i;
            
            return (
              <Button
                key={pageNum}
                variant={page === pageNum ? 'primary' : 'outline'}
                size="sm"
                onClick={() => onPageChange(pageNum)}
                className="w-10 h-10"
              >
                {pageNum}
              </Button>
            );
          })}
          <Button variant="outline" size="sm" onClick={() => onPageChange(page + 1)} disabled={page >= totalPages}>
            Next
          </Button>
        </div>
      )}
    </div>
  );
}

import Link from 'next/link';