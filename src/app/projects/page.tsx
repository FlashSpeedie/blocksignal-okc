import { Metadata } from 'next';
import { Suspense } from 'react';
import { Layout } from '@/components/layout/Layout';
import { ProjectsPageContent } from './ProjectsPageContent';

export const metadata: Metadata = {
  title: 'Projects',
  description: 'Browse and search Oklahoma City infrastructure projects tracked by BlockSignal.',
};

export default function ProjectsPage() {
  return (
    <Layout>
      <Suspense fallback={<ProjectsSkeleton />}>
        <ProjectsPageContent />
      </Suspense>
    </Layout>
  );
}

function ProjectsSkeleton() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="animate-pulse mb-8">
        <div className="h-8 bg-civic-200 rounded w-1/3 mb-2"></div>
        <div className="h-4 bg-civic-200 rounded w-1/4"></div>
      </div>
      <div className="animate-pulse mb-6 p-4 bg-civic-50 rounded-xl">
        <div className="h-10 bg-civic-200 rounded w-full max-w-md"></div>
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
    </div>
  );
}