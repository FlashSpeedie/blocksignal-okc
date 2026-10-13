import { Metadata } from 'next';
import { Suspense } from 'react';
import { Layout } from '@/components/layout/Layout';
import { HomeDashboard } from './home/HomeDashboard';

export const metadata: Metadata = {
  title: 'Know what changed on your block',
  description: 'Independent civic infrastructure transparency for Oklahoma City residents. Track changes to public infrastructure projects from official sources.',
};

export default function HomePage() {
  return (
    <Layout>
      <Suspense fallback={<HomeDashboardSkeleton />}>
        <HomeDashboard />
      </Suspense>
    </Layout>
  );
}

function HomeDashboardSkeleton() {
  return (
    <div className="space-y-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="animate-pulse space-y-4 max-w-2xl">
          <div className="h-8 bg-civic-200 rounded w-3/4"></div>
          <div className="h-4 bg-civic-200 rounded w-1/2"></div>
          <div className="h-10 bg-civic-200 rounded w-full max-w-md"></div>
        </div>
      </div>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="animate-pulse bg-white border border-civic-200 rounded-2xl p-5">
              <div className="h-4 bg-civic-200 rounded w-1/4 mb-2"></div>
              <div className="h-8 bg-civic-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="animate-pulse">
          <div className="h-6 bg-civic-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-white border border-civic-200 rounded-2xl p-5">
                <div className="h-4 bg-civic-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-civic-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}