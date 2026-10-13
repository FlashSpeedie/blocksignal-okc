'use client';

import { useState } from 'react';
import Link from 'next/link';
import { formatRelativeTime, formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ProjectCard } from '@/components/projects/ProjectCard';
import { Search, ArrowRight, ExternalLink, AlertCircle, CheckCircle, Clock, Database, GitCompare, FolderOpen, Shield, Info } from 'lucide-react';

const STATS = [
  { label: 'Tracked Projects', value: '0', icon: FolderOpen, href: '/projects', description: 'Projects being monitored' },
  { label: 'Total Changes', value: '0', icon: GitCompare, href: '/changes', description: 'Material changes detected' },
  { label: 'Active Sources', value: '0', icon: Database, href: '/sources', description: 'Official data sources' },
  { label: 'Last Refresh', value: '-', icon: Clock, href: '/sources', description: 'Most recent update' },
];

const RECENT_CHANGES = [
  { id: '1', project: 'NW Expressway Expansion', field: 'Status', previous: 'Planning', current: 'Active', time: '2 hours ago', classification: 'STATUS_CHANGE' },
  { id: '2', project: 'Downtown Streetscape Phase 2', field: 'Funding', previous: '$12.5M', current: '$14.2M', time: '1 day ago', classification: 'FUNDING_CHANGE' },
  { id: '3', project: 'Bricktown Canal Repair', field: 'Estimated End', previous: 'Dec 2024', current: 'Mar 2025', time: '3 days ago', classification: 'SCHEDULE_CHANGE' },
];

const FEATURED_PROJECTS = [
  { id: '1', slug: 'nw-expressway-expansion', title: 'NW Expressway Expansion', summary: 'Widening of NW Expressway from Meridian to Portland Ave to add travel lanes and improve traffic flow.', status: 'Active', location: 'NW Expressway, Meridian to Portland', projectType: 'Roadway', fundingAmount: 45000000, lastObservedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), source: { name: 'OKC Infrastructure Updates', canonicalUrl: 'https://www.okc.gov/Infrastructure-Development/Infrastructure-Project-Updates' }, _count: { changeEvents: 3, snapshots: 5 } },
  { id: '2', slug: 'downtown-streetscape-2', title: 'Downtown Streetscape Phase 2', summary: 'Pedestrian improvements, lighting, and landscaping along Robinson and Broadway.', status: 'Construction', location: 'Downtown OKC', projectType: 'Streetscape', fundingAmount: 14200000, lastObservedAt: new Date(Date.now() - 24 * 60 * 60 * 1000), source: { name: 'OKC Infrastructure Updates', canonicalUrl: 'https://www.okc.gov/Infrastructure-Development/Infrastructure-Project-Updates' }, _count: { changeEvents: 2, snapshots: 4 } },
  { id: '3', slug: 'bricktown-canal-repair', title: 'Bricktown Canal Repair', summary: 'Structural repairs and waterproofing of the Bricktown Canal walls.', status: 'Delayed', location: 'Bricktown District', projectType: 'Water Infrastructure', fundingAmount: 8500000, lastObservedAt: new Date(Date.now() - 72 * 60 * 60 * 1000), source: { name: 'OKC Infrastructure Updates', canonicalUrl: 'https://www.okc.gov/Infrastructure-Development/Infrastructure-Project-Updates' }, _count: { changeEvents: 1, snapshots: 3 } },
];

export function HomeDashboard() {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/projects?q=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden" aria-labelledby="hero-heading">
        <div className="absolute inset-0 bg-gradient-to-br from-civic-900 via-civic-700 to-civic-500" aria-hidden="true" />
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-5" aria-hidden="true" />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-32 relative">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 text-white/80 text-sm mb-4">
              <Shield className="h-4 w-4" aria-hidden="true" />
              <span>Independent civic transparency tool</span>
              <span aria-hidden="true">•</span>
              <span>Not affiliated with the City of Oklahoma City</span>
            </div>
            <h1 id="hero-heading" className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white tracking-tight leading-tight mb-6">
              Know what changed on your block.
            </h1>
            <p className="text-lg sm:text-xl text-white/90 mb-8 max-w-2xl leading-relaxed">
              BlockSignal OKC tracks changes to public infrastructure projects from official Oklahoma City sources.
              Search projects, view change history, and verify information directly from government records.
            </p>
            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 max-w-xl">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/50" aria-hidden="true" />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search projects by name, location, or keyword..."
                  className="w-full pl-12 pr-4 py-4 text-white bg-white/10 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent placeholder:text-white/40 backdrop-blur-sm"
                  aria-label="Search projects"
                />
              </div>
              <Button type="submit" size="lg" className="whitespace-nowrap bg-white text-civic-700 hover:bg-white/90">
                Search Projects
                <ArrowRight className="h-5 w-5" aria-hidden="true" />
              </Button>
            </form>
            <p className="mt-4 text-sm text-white/70">
              Data sourced from official OKC government websites.{' '}
              <a href="/about" className="underline hover:text-white">Learn about our methodology</a>
              {' '}→
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" aria-labelledby="stats-heading">
        <h2 id="stats-heading" className="sr-only">Key Statistics</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {STATS.map((stat, index) => (
            <Card key={stat.label} variant="elevated" padding="md" className="group hover:border-civic-300 transition-colors">
              <Link href={stat.href} className="block">
                <CardContent className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-civic-100 flex items-center justify-center group-hover:bg-civic-200 transition-colors">
                    <stat.icon className="h-6 w-6 text-civic-600" aria-hidden="true" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <dt className="text-sm text-civic-500">{stat.label}</dt>
                    <dd className="text-3xl font-bold text-civic-900 mt-1">{stat.value}</dd>
                    <dd className="text-xs text-civic-400 mt-1">{stat.description}</dd>
                  </div>
                </CardContent>
              </Link>
            </Card>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" aria-labelledby="recent-changes-heading">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 id="recent-changes-heading" className="text-2xl font-bold text-civic-900">Recent Changes</h2>
            <p className="text-civic-500 mt-1">Material changes detected in tracked projects</p>
          </div>
          <Link href="/changes" className="text-sm font-medium text-civic-600 hover:text-civic-900 flex items-center gap-1">
            View all changes
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
        <div className="space-y-3">
          {RECENT_CHANGES.map(change => (
            <Card key={change.id} variant="outlined" padding="md" className="border-l-4 border-l-civic-500">
              <CardContent className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Link href={`/projects/${change.project.toLowerCase().replace(/\s+/g, '-')}`} className="font-medium text-civic-900 hover:text-civic-600">
                      {change.project}
                    </Link>
                    <Badge variant="info" size="sm">
                      {change.classification.replace('_', ' ')}
                    </Badge>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4 text-sm">
                    <div className="bg-red-50 p-3 rounded-lg border border-red-100">
                      <div className="flex items-center gap-1.5 text-red-700 mb-1 text-xs">
                        <span className="font-medium">Previous</span>
                      </div>
                      <p className="text-red-900 font-mono text-sm">{change.previous}</p>
                    </div>
                    <div className="bg-green-50 p-3 rounded-lg border border-green-100">
                      <div className="flex items-center gap-1.5 text-green-700 mb-1 text-xs">
                        <span className="font-medium">Current</span>
                      </div>
                      <p className="text-green-900 font-mono text-sm">{change.current}</p>
                    </div>
                  </div>
                  <p className="mt-2 text-xs text-civic-500">Field: {change.field} • {change.time}</p>
                </div>
                <Link
                    href={`/projects/${change.project.toLowerCase().replace(/\s+/g, '-')}`}
                    className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-civic-600 hover:text-civic-900 border border-civic-200 rounded-xl hover:bg-civic-50 transition-colors"
                  >
                    View Details
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" aria-labelledby="featured-projects-heading">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 id="featured-projects-heading" className="text-2xl font-bold text-civic-900">Featured Projects</h2>
            <p className="text-civic-500 mt-1">Recently updated infrastructure projects</p>
          </div>
          <Link href="/projects" className="text-sm font-medium text-civic-600 hover:text-civic-900 flex items-center gap-1">
            Browse all projects
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURED_PROJECTS.map(project => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4" aria-labelledby="how-it-works-heading">
        <h2 id="how-it-works-heading" className="text-2xl font-bold text-civic-900 text-center mb-12">How It Works</h2>
        <div className="grid gap-8 sm:grid-cols-3 max-w-4xl mx-auto">
          <Card variant="outlined" padding="lg" className="text-center">
            <CardHeader>
              <div className="w-14 h-14 rounded-xl bg-civic-100 flex items-center justify-center mx-auto mb-4">
                <Database className="h-7 w-7 text-civic-600" aria-hidden="true" />
              </div>
              <CardTitle>Official Sources</CardTitle>
              <CardDescription>We monitor official Oklahoma City government websites and data portals for infrastructure project information.</CardDescription>
            </CardHeader>
          </Card>
          <Card variant="outlined" padding="lg" className="text-center">
            <CardHeader>
              <div className="w-14 h-14 rounded-xl bg-civic-100 flex items-center justify-center mx-auto mb-4">
                <GitCompare className="h-7 w-7 text-civic-600" aria-hidden="true" />
              </div>
              <CardTitle>Change Detection</CardTitle>
              <CardDescription>When project data changes, we create a snapshot and compare it field-by-field against the previous version.</CardDescription>
            </CardHeader>
          </Card>
          <Card variant="outlined" padding="lg" className="text-center">
            <CardHeader>
              <div className="w-14 h-14 rounded-xl bg-civic-100 flex items-center justify-center mx-auto mb-4">
                <Shield className="h-7 w-7 text-civic-600" aria-hidden="true" />
              </div>
              <CardTitle>Transparent Records</CardTitle>
              <CardDescription>Every change links to the original source so you can verify the information yourself.</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      <section className="bg-civic-50 py-16" aria-labelledby="disclaimer-heading">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Card variant="outlined" padding="lg">
            <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-6 w-6 text-amber-600 flex-shrink-0" aria-hidden="true" />
                <div>
                  <h3 id="disclaimer-heading" className="text-lg font-semibold text-civic-900">Important Disclaimer</h3>
                  <p className="text-civic-600 text-sm mt-1">
                    BlockSignal OKC is an independent public information tool. It is not affiliated with, endorsed by, or connected to the City of Oklahoma City or any government agency.
                  </p>
                </div>
              </div>
              <Link href="/about" className="flex items-center gap-1.5 text-sm font-medium text-civic-600 hover:text-civic-900 whitespace-nowrap">
                Read full methodology
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </CardHeader>
            <CardContent className="prose max-w-none">
              <ul className="space-y-2">
                <li>All data comes from publicly available government sources</li>
                <li>Changes are detected by comparing structured data fields between snapshots</li>
                <li>"First observed" means when BlockSignal detected the change, not when the government made it</li>
                <li>Historical comparisons are only available from when monitoring began</li>
                <li>Always verify critical information directly with official sources</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}