'use client';

import { useState, useEffect } from 'react';
import { ProjectCard } from '@/components/projects/ProjectCard';
import { ProjectFilters } from '@/components/projects/ProjectFilters';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { FolderOpen, Filter, Loader2, AlertCircle } from 'lucide-react';

interface ProjectsPageContentProps {
  initialData?: {
    data: Array<{
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
    }>;
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
    filters: { statuses: string[]; types: string[] };
  };
}

export function ProjectsPageContent({ initialData }: ProjectsPageContentProps) {
  const [projects, setProjects] = useState(initialData?.data || []);
  const [total, setTotal] = useState(initialData?.total || 0);
  const [page, setPage] = useState(initialData?.page || 1);
  const [pageSize] = useState(20);
  const [totalPages, setTotalPages] = useState(initialData?.totalPages || 1);
  const [statuses, setStatuses] = useState(initialData?.filters.statuses || []);
  const [projectTypes, setProjectTypes] = useState(initialData?.filters.types || []);
  const [sources, setSources] = useState<Array<{ id: string; name: string }>>([]);
  const [loading, setLoading] = useState(!initialData);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = async (pageNum = 1) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: String(pageNum),
        pageSize: String(pageSize),
      });
      const response = await fetch(`/api/projects?${params.toString()}`);
      const result = await response.json();
      if (result.success) {
        setProjects(result.data.data);
        setTotal(result.data.total);
        setPage(result.data.page);
        setTotalPages(result.data.totalPages);
        if (result.data.filters) {
          setStatuses(result.data.filters.statuses);
          setProjectTypes(result.data.filters.types);
        }
      } else {
        setError(result.error || 'Failed to load projects');
      }
    } catch {
      setError('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const fetchSources = async () => {
    try {
      const response = await fetch('/api/sources');
      const result = await response.json();
      if (result.success && result.data.sources) {
        setSources(result.data.sources.map((s: { id: string; name: string }) => ({ id: s.id, name: s.name })));
      }
    } catch {
      console.error('Failed to load sources');
    }
  };

  useEffect(() => {
    if (!initialData) {
      fetchProjects();
      fetchSources();
    } else {
      fetchSources();
    }
  }, []);

  const handlePageChange = (newPage: number) => {
    fetchProjects(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (error && projects.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <Card variant="outlined" padding="lg" className="text-center">
          <CardContent>
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" aria-hidden="true" />
            <h3 className="text-lg font-medium text-civic-700 mb-2">Failed to load projects</h3>
            <p className="text-civic-500 mb-4">{error}</p>
            <Button onClick={() => fetchProjects(page)} variant="primary">
              <Loader2 className="h-4 w-4 mr-2" aria-hidden="true" />
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-civic-900 flex items-center gap-3">
            <FolderOpen className="h-8 w-8 text-civic-600" aria-hidden="true" />
            Projects
          </h1>
          <p className="text-civic-500 mt-1">
            {total} project{total !== 1 ? 's' : ''} tracked across {sources.length} source{sources.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      <ProjectFilters
        statuses={statuses}
        projectTypes={projectTypes}
        sources={sources}
      />

      {loading && projects.length === 0 ? (
        <div className="space-y-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white border border-civic-200 rounded-2xl p-5 animate-pulse">
              <div className="h-6 bg-civic-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-civic-200 rounded w-1/2 mb-4"></div>
              <div className="space-y-2">
                <div className="h-4 bg-civic-200 rounded w-1/2"></div>
                <div className="h-4 bg-civic-200 rounded w-1/3"></div>
              </div>
            </div>
          ))}
        </div>
      ) : projects.length === 0 ? (
        <Card variant="outlined" padding="lg" className="text-center py-16">
          <CardContent>
            <FolderOpen className="h-16 w-16 text-civic-300 mx-auto mb-4" aria-hidden="true" />
            <h3 className="text-lg font-medium text-civic-700 mb-2">No projects found</h3>
            <p className="text-civic-500 mb-6">Try adjusting your search or filters, or check back later as we monitor more sources.</p>
            <Button variant="outline" onClick={() => window.location.href = '/projects'}>
              <Filter className="h-4 w-4 mr-2" aria-hidden="true" />
              Clear Filters
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map(project => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <Button variant="outline" size="sm" onClick={() => handlePageChange(page - 1)} disabled={page <= 1}>
                Previous
              </Button>
              <span className="px-4 text-sm text-civic-600">
                Page {page} of {totalPages}
              </span>
              <Button variant="outline" size="sm" onClick={() => handlePageChange(page + 1)} disabled={page >= totalPages}>
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}