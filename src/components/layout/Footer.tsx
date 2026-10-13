'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';

export function Footer() {
  return (
    <footer className="border-t border-civic-200 bg-civic-50" role="contentinfo">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4" aria-label="BlockSignal OKC Home">
              <svg className="h-8 w-8 text-civic-600" viewBox="0 0 32 32" fill="none" aria-hidden="true">
                <rect width="32" height="32" rx="8" fill="currentColor" />
                <path d="M8 12h16M8 16h12M8 20h8" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
              <span className="text-xl font-bold text-civic-900">BlockSignal OKC</span>
            </Link>
            <p className="text-civic-600 max-w-md">
              Know what changed on your block. Independent civic infrastructure transparency for Oklahoma City residents.
            </p>
            <p className="mt-4 text-sm text-civic-500">
              BlockSignal OKC is an independent public information tool. It is not affiliated with or endorsed by the City of Oklahoma City.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-civic-900 mb-4">Explore</h4>
            <nav aria-label="Footer navigation">
              <ul className="space-y-2">
                <li><Link href="/projects" className="text-civic-600 hover:text-civic-900 transition-colors">Projects</Link></li>
                <li><Link href="/changes" className="text-civic-600 hover:text-civic-900 transition-colors">Recent Changes</Link></li>
                <li><Link href="/sources" className="text-civic-600 hover:text-civic-900 transition-colors">Data Sources</Link></li>
                <li><Link href="/about" className="text-civic-600 hover:text-civic-900 transition-colors">Methodology</Link></li>
              </ul>
            </nav>
          </div>

          <div>
            <h4 className="font-semibold text-civic-900 mb-4">Resources</h4>
            <nav aria-label="Footer resources">
              <ul className="space-y-2">
                <li>
                  <a href="https://www.okc.gov" target="_blank" rel="noopener noreferrer" className="text-civic-600 hover:text-civic-900 transition-colors">
                    City of Oklahoma City
                  </a>
                </li>
                <li>
                  <a href="https://vision.okc.gov" target="_blank" rel="noopener noreferrer" className="text-civic-600 hover:text-civic-900 transition-colors">
                    Vision OKC Projects
                  </a>
                </li>
                <li>
                  <a href="https://data.okc.gov" target="_blank" rel="noopener noreferrer" className="text-civic-600 hover:text-civic-900 transition-colors">
                    OKC Open Data Portal
                  </a>
                </li>
              </ul>
            </nav>
          </div>
        </div>

        <div className="mt-10 pt-8 border-t border-civic-200 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-civic-500">
            &copy; {new Date().getFullYear()} BlockSignal OKC. Built for WarriorHacks 2.0.
          </p>
          <div className="flex items-center gap-4">
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-civic-500 hover:text-civic-700" aria-label="GitHub">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}