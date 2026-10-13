'use client';

import { useEffect, useState } from 'react';
import { notFound } from 'next/navigation';
import { ProjectDetail } from '@/components/projects/ProjectDetail';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Loader2, AlertCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface ProjectDetailPageContentProps {
  slug: string;
}

export function ProjectDetailPageContent({ slug }: ProjectDetailPageContentProps) {
  const [project, setProject] = useState<null | {
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
  }>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProject = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/projects/${slug}`);
        const result = await response.json();
        if (result.success && result.data) {
          setProject(result.data);
        } else if (response.status === 404) {
          notFound();
        } else {
          setError(result.error || 'Failed to load project');
        }
      } catch {
        setError('Failed to load project');
      } finally {
        setLoading(false);
      }
    };
    fetchProject();
  }, [slug]);

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 animate-pulse space-y-6">
        <div>
          <div className="h-8 bg-civic-200 rounded w-1/2 mb-2"></div>
          <div className="h-4 bg-civic-200 rounded w-1/4"></div>
        </div>
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-white border border-civic-200 rounded-2xl p-5">
                <div className="h-6 bg-civic-200 rounded w-1/4 mb-4"></div>
                <div className="space-y-3">
                  <div className="h-4 bg-civic-200 rounded w-1/2"></div>
                  <div className="h-4 bg-civic-200 rounded w-1/3"></div>
                </div>
              </div>
            ))}
          </div>
          <div className="space-y-6">
            <div className="bg-white border border-civic-200 rounded-2xl p-5">
              <div className="h-6 bg-civic-200 rounded w-1/3 mb-4"></div>
              <div className="space-y-3">
                <div className="h-4 bg-civic-200 rounded w-1/2"></div>
                <div className="h-4 bg-civic-200 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <Card variant="outlined" padding="lg" className="text-center">
          <CardContent>
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" aria-hidden="true" />
            <h3 className="text-lg font-medium text-civic-700 mb-2">Project not found</h3>
            <p className="text-civic-500 mb-4">{error || 'The requested project could not be found.'}</p>
            <Link href="/projects">
              <Button variant="primary">
                <ArrowLeft className="h-4 w-4 mr-2" aria-hidden="true" />
                Back to Projects
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <ProjectDetail project={project} />;
}