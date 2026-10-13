'use client';

import { useEffect, useState } from 'react';
import { SourceCard } from '@/components/sources/SourceCard';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Loader2, AlertCircle, Database, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function SourcesPageContent() {
  const [sources, setSources] = useState<Array<{
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
  }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState<string | null>(null);

  const fetchSources = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/sources');
      const result = await response.json();
      if (result.success && result.data.sources) {
        setSources(result.data.sources);
      } else {
        setError(result.error || 'Failed to load sources');
      }
    } catch {
      setError('Failed to load sources');
    } finally {
      setLoading(false);
    }
  };

  const triggerRefresh = async (sourceId: string) => {
    setRefreshing(sourceId);
    try {
      const response = await fetch('/api/cron/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sourceId }),
      });
      if (response.ok) {
        await fetchSources();
      }
    } catch {
      console.error('Refresh failed');
    } finally {
      setRefreshing(null);
    }
  };

  useEffect(() => {
    fetchSources();
  }, []);

  const healthCounts = sources.reduce((acc, s) => {
    acc[s.health] = (acc[s.health] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  if (error && sources.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <Card variant="outlined" padding="lg" className="text-center">
          <CardContent>
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" aria-hidden="true" />
            <h3 className="text-lg font-medium text-civic-700 mb-2">Failed to load sources</h3>
            <p className="text-civic-500 mb-4">{error}</p>
            <Button onClick={fetchSources} variant="primary">
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
            <Database className="h-8 w-8 text-civic-600" aria-hidden="true" />
            Data Sources
          </h1>
          <p className="text-civic-500 mt-1">
            {sources.length} official source{sources.length !== 1 ? 's' : ''} monitored
            {Object.keys(healthCounts).length > 0 && (
              <>
                {' • '}
                <span className="font-medium text-green-600">{healthCounts.HEALTHY || 0} healthy</span>
                {healthCounts.DEGRADED && <span className="text-amber-600 ml-2">{healthCounts.DEGRADED} degraded</span>}
                {healthCounts.FAILED && <span className="text-red-600 ml-2">{healthCounts.FAILED} failed</span>}
                {healthCounts.UNKNOWN && <span className="text-civic-500 ml-2">{healthCounts.UNKNOWN} unknown</span>}
              </>
            )}
          </p>
        </div>
      </div>

      {loading && sources.length === 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white border border-civic-200 rounded-2xl p-5 animate-pulse">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="h-6 bg-civic-200 rounded w-1/2"></div>
                <div className="h-5 bg-civic-200 rounded w-20"></div>
              </div>
              <div className="space-y-3">
                <div className="h-4 bg-civic-200 rounded w-3/4"></div>
                <div className="h-4 bg-civic-200 rounded w-1/2"></div>
                <div className="grid grid-cols-2 gap-4 pt-2 border-t border-civic-100">
                  <div className="h-12 bg-civic-100 rounded"></div>
                  <div className="h-12 bg-civic-100 rounded"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : sources.length === 0 ? (
        <Card variant="outlined" padding="lg" className="text-center py-16">
          <CardContent>
            <Database className="h-16 w-16 text-civic-300 mx-auto mb-4" aria-hidden="true" />
            <h3 className="text-lg font-medium text-civic-700 mb-2">No sources configured</h3>
            <p className="text-civic-500">Data sources will appear here once configured in the system.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {sources.map(source => (
            <SourceCard key={source.id} source={source} />
          ))}
        </div>
      )}

      <section className="mt-16" aria-labelledby="source-info-heading">
        <h2 id="source-info-heading" className="text-2xl font-bold text-civic-900 mb-6">About Our Sources</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <Card variant="outlined" padding="lg">
            <CardHeader>
              <CardTitle>OKC Infrastructure Project Updates</CardTitle>
              <CardDescription>Official project listings from the City of Oklahoma City</CardDescription>
            </CardHeader>
            <CardContent className="prose max-w-none">
              <p className="mb-3">Primary source for infrastructure project information.</p>
              <ul className="space-y-1 text-sm">
                <li>• URL: okc.gov/Infrastructure-Development/Infrastructure-Project-Updates</li>
                <li>• Type: HTML scraping with structured extraction</li>
                <li>• Update frequency: Daily scheduled refresh</li>
              </ul>
            </CardContent>
          </Card>
          <Card variant="outlined" padding="lg">
            <CardHeader>
              <CardTitle>Vision OKC Projects</CardTitle>
              <CardDescription>Capital improvement projects from the Vision OKC program</CardDescription>
            </CardHeader>
            <CardContent className="prose max-w-none">
              <p className="mb-3">Map-based project portal with detailed project information.</p>
              <ul className="space-y-1 text-sm">
                <li>• URL: vision.okc.gov/projects</li>
                <li>• Type: ArcGIS FeatureServer integration</li>
                <li>• Update frequency: Daily scheduled refresh</li>
              </ul>
            </CardContent>
          </Card>
          <Card variant="outlined" padding="lg">
            <CardHeader>
              <CardTitle>OKC Open Data Portal</CardTitle>
              <CardDescription>Structured datasets from the City's open data initiative</CardDescription>
            </CardHeader>
            <CardContent className="prose max-w-none">
              <p className="mb-3">Machine-readable datasets for various city departments.</p>
              <ul className="space-y-1 text-sm">
                <li>• URL: data.okc.gov</li>
                <li>• Type: JSON/CSV API endpoints</li>
                <li>• Update frequency: As published by city</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}