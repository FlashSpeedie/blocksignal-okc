import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { Layout } from '@/components/layout/Layout';
import { ProjectDetailPageContent } from './ProjectDetailPageContent';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  return {
    title: slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
    description: 'View detailed information and change history for this Oklahoma City infrastructure project.',
  };
}

export default async function ProjectDetailPage({ params }: PageProps) {
  const { slug } = await params;
  return (
    <Layout>
      <Suspense fallback={<ProjectDetailSkeleton />}>
        <ProjectDetailPageContent slug={slug} />
      </Suspense>
    </Layout>
  );
}

function ProjectDetailSkeleton() {
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