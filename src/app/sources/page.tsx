import { Metadata } from 'next';
import { Suspense } from 'react';
import { Layout } from '@/components/layout/Layout';
import { SourcesPageContent } from './SourcesPageContent';

export const metadata: Metadata = {
  title: 'Sources',
  description: 'View all official data sources monitored by BlockSignal OKC for infrastructure project information.',
};

export default function SourcesPage() {
  return (
    <Layout>
      <Suspense fallback={<SourcesSkeleton />}>
        <SourcesPageContent />
      </Suspense>
    </Layout>
  );
}

function SourcesSkeleton() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="animate-pulse mb-8">
        <div className="h-8 bg-civic-200 rounded w-1/3 mb-2"></div>
        <div className="h-4 bg-civic-200 rounded w-1/4"></div>
      </div>
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
    </div>
  );
}