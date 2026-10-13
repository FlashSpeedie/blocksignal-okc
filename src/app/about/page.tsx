import { Metadata } from 'next';
import { Layout } from '@/components/layout/Layout';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Shield, Database, GitCompare, Clock, ExternalLink, FileText, AlertTriangle, CheckCircle } from 'lucide-react';

export const metadata: Metadata = {
  title: 'About & Methodology',
  description: 'Learn how BlockSignal OKC collects, processes, and tracks changes to Oklahoma City infrastructure project data from official sources.',
};

const METHODOLOGY_SECTIONS = [
  {
    title: 'Problem Statement',
    icon: AlertTriangle,
    content: (
      <div className="prose max-w-none">
        <p>Public infrastructure and planning information for Oklahoma City is spread across multiple government webpages, project portals, maps, PDFs, and separate agency pages. Finding a project is one problem; understanding what has changed since the last available public record is another.</p>
        <p>Residents should not have to manually revisit dozens of pages to discover whether a project has a revised timeline, a new status, a changed funding amount, an updated scope, or a new official notice.</p>
      </div>
    ),
  },
  {
    title: 'Data Collection',
    icon: Database,
    content: (
      <div className="prose max-w-none">
        <p>BlockSignal OKC collects data from verified official sources:</p>
        <ul>
          <li><strong>OKC Infrastructure Project Updates</strong> — okc.gov/Infrastructure-Development/Infrastructure-Project-Updates</li>
          <li><strong>Vision OKC Projects</strong> — vision.okc.gov/projects (ArcGIS FeatureServer)</li>
          <li><strong>OKC Open Data Portal</strong> — data.okc.gov (JSON/CSV APIs)</li>
          <li><strong>City Public Works</strong> — okc.gov/Infrastructure-Development/Public-Works</li>
        </ul>
        <p>We prioritize stable, publicly accessible, structured data (JSON, CSV, ArcGIS FeatureServer) over fragile HTML scraping. Each source is documented with its retrieval method, field mapping, and known limitations.</p>
      </div>
    ),
  },
  {
    title: 'Normalization & Identity',
    icon: Shield,
    content: (
      <div className="prose max-w-none">
        <p>Raw source data is normalized into a consistent schema before comparison:</p>
        <ul>
          <li>Official external IDs are used as primary keys whenever available</li>
          <li>When IDs are unavailable, conservative matching prevents incorrect merges</li>
          <li>Whitespace is trimmed, date formats are normalized, numeric formatting is standardized</li>
          <li>Meaningful distinctions between <code>null</code>, zero, empty, and unavailable values are preserved</li>
          <li>No source values are silently transformed in ways that change their meaning</li>
        </ul>
      </div>
    ),
  },
  {
    title: 'Snapshot Storage',
    icon: Database,
    content: (
      <div className="prose max-w-none">
        <p>Every successful fetch creates an immutable snapshot:</p>
        <ul>
          <li>All structured field values are stored with a content fingerprint (hash)</li>
          <li>Source URL and retrieval timestamp are recorded</li>
          <li>Validation status tracks data quality</li>
          <li>Snapshots are never modified after creation</li>
        </ul>
        <p>This creates a complete, auditable history of what BlockSignal observed and when.</p>
      </div>
    ),
  },
  {
    title: 'Change Detection',
    icon: GitCompare,
    content: (
      <div className="prose max-w-none">
        <p>Changes are detected by deterministic field-level comparison:</p>
        <ol>
          <li>New snapshot is compared against the previous accepted snapshot</li>
          <li>Each structured field is compared for material differences</li>
          <li>Volatile fields (timestamps, formatting, HTML) are ignored</li>
          <li>Material changes create a <strong>ChangeEvent</strong> with:
            <ul>
              <li>Field name and both values</li>
              <li>Classification (status, schedule, funding, scope, location, etc.)</li>
              <li>First observation timestamp (when BlockSignal detected it)</li>
              <li>Previous snapshot timestamp (when the old value was observed)</li>
              <li>Source URL for verification</li>
              <li>Deduplication key to prevent duplicate events</li>
            </ul>
          </li>
        </ol>
        <p>Identical refreshes produce no new snapshots or events. Failed refreshes never overwrite valid data.</p>
      </div>
    ),
  },
  {
    title: 'Timestamps & Observability',
    icon: Clock,
    content: (
      <div className="prose max-w-none">
        <p>Three distinct timestamps are maintained:</p>
        <ul>
          <li><strong>Government publication date</strong> — When the agency says the change occurred (if provided in source data)</li>
          <li><strong>BlockSignal observation time</strong> — When our system first detected the change (firstObservedAt)</li>
          <li><strong>Previous snapshot time</strong> — When the prior value was last confirmed</li>
        </ul>
        <p>These are never conflated. The UI clearly labels each timestamp so users understand the difference between when a change happened and when we noticed it.</p>
      </div>
    ),
  },
  {
    title: 'Limitations & Transparency',
    icon: AlertTriangle,
    content: (
      <div className="prose max-w-none">
        <ul>
          <li><strong>No historical data before monitoring began</strong> — We can only compare snapshots we have captured. Changes before our first observation are unknown.</li>
          <li><strong>Source-dependent completeness</strong> — If a source omits a field, we cannot track changes to it.</li>
          <li><strong>Pagination & API limits</strong> — Some sources paginate results; a missing record in one response does not mean deletion.</li>
          <li><strong>Not an official government tool</strong> — BlockSignal OKC is an independent public information tool. It is not affiliated with or endorsed by the City of Oklahoma City.</li>
          <li><strong>Verification encouraged</strong> — Every change links to the original source. Users should verify critical information directly.</li>
        </ul>
      </div>
    ),
  },
  {
    title: 'Independence Statement',
    icon: Shield,
    content: (
      <div className="prose max-w-none">
        <div className="bg-civic-50 border border-civic-200 rounded-xl p-6">
          <p className="font-semibold text-civic-900 mb-2">BlockSignal OKC is an independent civic technology project.</p>
          <p className="text-civic-700">It is not affiliated with, endorsed by, connected to, or sponsored by the City of Oklahoma City, any government agency, or any official entity. All data is sourced from publicly available government publications. BlockSignal OKC makes no guarantees about the accuracy, completeness, or timeliness of the information presented. Users should verify critical information directly with official sources.</p>
        </div>
      </div>
    ),
  },
];

export default function AboutPage() {
  return (
    <Layout>
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12 space-y-16">
        <header className="text-center max-w-2xl mx-auto">
          <h1 className="text-4xl sm:text-5xl font-bold text-civic-900 tracking-tight mb-6">
            About & Methodology
          </h1>
          <p className="text-lg text-civic-600 leading-relaxed">
            How BlockSignal OKC collects, processes, and tracks changes to Oklahoma City infrastructure project data.
          </p>
        </header>

        <div className="space-y-12">
          {METHODOLOGY_SECTIONS.map((section, index) => (
            <section key={section.title} className="space-y-4" aria-labelledby={`section-${index}`}>
              <h2 id={`section-${index}`} className="text-2xl font-bold text-civic-900 flex items-center gap-3">
                <section.icon className="h-7 w-7 text-civic-600" aria-hidden="true" />
                {section.title}
              </h2>
              <div className="pl-10 border-l-2 border-civic-200">
                {section.content}
              </div>
            </section>
          ))}
        </div>

        <section className="border-t border-civic-200 pt-12" aria-labelledby="verification-heading">
          <h2 id="verification-heading" className="text-2xl font-bold text-civic-900 mb-6">How to Verify Information</h2>
          <div className="grid gap-6 sm:grid-cols-3">
            <Card variant="outlined" padding="lg">
              <CardHeader>
                <div className="w-12 h-12 rounded-xl bg-civic-100 flex items-center justify-center mb-4">
                  <ExternalLink className="h-6 w-6 text-civic-600" aria-hidden="true" />
                </div>
                <CardTitle>Source Links</CardTitle>
                <CardDescription>Every project and change links to the original government record</CardDescription>
              </CardHeader>
              <CardContent className="prose max-w-none">
                <p>Click "View Source" on any project or change to open the official government page where the data originated.</p>
              </CardContent>
            </Card>
            <Card variant="outlined" padding="lg">
              <CardHeader>
                <div className="w-12 h-12 rounded-xl bg-civic-100 flex items-center justify-center mb-4">
                  <FileText className="h-6 w-6 text-civic-600" aria-hidden="true" />
                </div>
                <CardTitle>API Access</CardTitle>
                <CardDescription>Programmatic access to project data and change events</CardDescription>
              </CardHeader>
              <CardContent className="prose max-w-none">
                <p>Use <code>/api/projects/[slug]</code> and <code>/api/changes</code> endpoints for raw JSON data. No API key required for public data.</p>
              </CardContent>
            </Card>
            <Card variant="outlined" padding="lg">
              <CardHeader>
                <div className="w-12 h-12 rounded-xl bg-civic-100 flex items-center justify-center mb-4">
                  <CheckCircle className="h-6 w-6 text-civic-600" aria-hidden="true" />
                </div>
                <CardTitle>Direct Government Sites</CardTitle>
                <CardDescription>Always verify with the official source</CardDescription>
              </CardHeader>
              <CardContent className="prose max-w-none">
                <ul className="space-y-1">
                  <li><a href="https://www.okc.gov" target="_blank" rel="noopener noreferrer">okc.gov</a></li>
                  <li><a href="https://vision.okc.gov" target="_blank" rel="noopener noreferrer">vision.okc.gov</a></li>
                  <li><a href="https://data.okc.gov" target="_blank" rel="noopener noreferrer">data.okc.gov</a></li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="border-t border-civic-200 pt-12" aria-labelledby="contact-heading">
          <h2 id="contact-heading" className="text-2xl font-bold text-civic-900 mb-4">Built for WarriorHacks 2.0</h2>
          <p className="text-civic-600 max-w-2xl">
            BlockSignal OKC was built as a production-ready civic infrastructure transparency platform for the WarriorHacks 2.0 hackathon.
            The goal is to create a tool that Oklahoma City residents can continue using long after the event.
          </p>
          <p className="text-civic-600 mt-4 max-w-2xl">
            Questions, suggestions, or source contributions? This is an open project — contributions are welcome.
          </p>
        </section>
      </div>
    </Layout>
  );
}