import { Metadata } from 'next';
import { Suspense } from 'react';
import { Layout } from '@/components/layout/Layout';
import { ChangesPageContent } from './ChangesPageContent';

export const metadata: Metadata = {
  title: 'Changes',
  description: 'View recent changes detected in Oklahoma City infrastructure projects tracked by BlockSignal.',
};

export default function ChangesPage() {
  return (
    <Layout>
      <Suspense fallback={<ChangesSkeleton />}>
        <ChangesPageContent />
      </Suspense>
    </Layout>
  );
}

function ChangesSkeleton() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="animate-pulse mb-8">
        <div className="h-8 bg-civic-200 rounded w-1/3 mb-2"></div>
        <div className="h-4 bg-civic-200 rounded w-1/4"></div>
      </div>
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="bg-white border border-civic-200 rounded-2xl p-5 animate-pulse">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-civic-100"></div>
              <div className="flex-1">
                <div className="h-5 bg-civic-200 rounded w-1/3 mb-2"></div>
                <div className="h-4 bg-civic-200 rounded w-1/2 mb-3"></div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="h-20 bg-civic-100 rounded-lg"></div>
                  <div className="h-20 bg-civic-100 rounded-lg"></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-center gap-2 mt-8 animate-pulse">
        <button className="px-4 py-2 border border-civic-200 rounded-xl">Previous</button>
        <span className="px-4 text-sm text-civic-600">Page 1 of 3</span>
        <button className="px-4 py-2 border border-civic-200 rounded-xl">Next</button>
      </div>
    </div>
  );
}