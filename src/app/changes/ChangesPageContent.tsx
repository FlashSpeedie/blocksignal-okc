'use client';

import { useState, useEffect } from 'react';
import { ChangeFeed } from '@/components/changes/ChangeFeed';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Loader2, AlertCircle, GitCompare } from 'lucide-react';

export function ChangesPageContent() {
  const [changes, setChanges] = useState<Array<{
    id: string;
    fieldName: string;
    previousValue?: string;
    newValue?: string;
    firstObservedAt: Date | string;
    previousObservedAt?: Date | string;
    sourceUrl: string;
    classification: string;
    project: { id: string; slug: string; title: string; sourceId: string };
  }>>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(50);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchChanges = async (pageNum = 1) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: String(pageNum),
        pageSize: String(pageSize),
      });
      const response = await fetch(`/api/changes?${params.toString()}`);
      const result = await response.json();
      if (result.success) {
        setChanges(result.data.data);
        setTotal(result.data.total);
        setPage(result.data.page);
        setTotalPages(result.data.totalPages);
      } else {
        setError(result.error || 'Failed to load changes');
      }
    } catch {
      setError('Failed to load changes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChanges();
  }, []);

  const handlePageChange = (newPage: number) => {
    fetchChanges(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (error && changes.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <Card variant="outlined" padding="lg" className="text-center">
          <CardContent>
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" aria-hidden="true" />
            <h3 className="text-lg font-medium text-civic-700 mb-2">Failed to load changes</h3>
            <p className="text-civic-500 mb-4">{error}</p>
            <Button onClick={() => fetchChanges(page)} variant="primary">
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
            <GitCompare className="h-8 w-8 text-civic-600" aria-hidden="true" />
            Changes
          </h1>
          <p className="text-civic-500 mt-1">
            {total} material change{total !== 1 ? 's' : ''} detected across all tracked projects
          </p>
        </div>
      </div>

      <ChangeFeed
        changes={changes}
        total={total}
        page={page}
        pageSize={pageSize}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
    </div>
  );
}