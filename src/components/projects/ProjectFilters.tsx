'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { X, Filter, ChevronDown } from 'lucide-react';

interface ProjectFiltersProps {
  statuses: string[];
  projectTypes: string[];
  sources: { id: string; name: string }[];
}

export function ProjectFilters({ statuses, projectTypes, sources }: ProjectFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentQuery = searchParams.get('q') || '';
  const currentStatus = searchParams.get('status')?.split(',').filter(Boolean) || [];
  const currentProjectType = searchParams.get('projectType')?.split(',').filter(Boolean) || [];
  const currentSourceId = searchParams.get('sourceId') || '';
  const currentSortField = searchParams.get('sortField') || 'lastObservedAt';
  const currentSortDirection = searchParams.get('sortDirection') || 'desc';

  const hasActiveFilters = useMemo(() => 
    currentQuery || currentStatus.length > 0 || currentProjectType.length > 0 || currentSourceId,
    [currentQuery, currentStatus, currentProjectType, currentSourceId]
  );

  const updateParams = useCallback((updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    
    for (const [key, value] of Object.entries(updates)) {
      if (value === null || value === '') {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    }
    
    params.set('page', '1');
    router.push(`/projects?${params.toString()}`);
  }, [router, searchParams]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const timer = setTimeout(() => {
      updateParams({ q: value || null });
    }, 300);
    return () => clearTimeout(timer);
  };

  const handleMultiSelectChange = (param: string, selected: string[]) => {
    updateParams({ [param]: selected.length > 0 ? selected.join(',') : null });
  };

  const handleSourceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateParams({ sourceId: e.target.value || null });
  };

  const handleSortChange = (field: string) => {
    let direction = 'desc';
    if (currentSortField === field && currentSortDirection === 'desc') {
      direction = 'asc';
    }
    updateParams({ sortField: field, sortDirection: direction });
  };

  const clearAllFilters = () => {
    updateParams({ q: null, status: null, projectType: null, sourceId: null });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <label htmlFor="project-search" className="sr-only">Search projects</label>
        <div className="relative flex-1">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-civic-400" aria-hidden="true" />
          <input
            id="project-search"
            type="search"
            value={currentQuery}
            onChange={handleSearchChange}
            placeholder="Search projects by name, location, or description..."
            className="w-full pl-10 pr-4 py-2.5 text-civic-900 bg-white border border-civic-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-civic-500 focus:border-transparent placeholder:text-civic-400"
            aria-label="Search projects"
          />
        </div>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearAllFilters} className="gap-1.5">
            <X className="h-4 w-4" aria-hidden="true" />
            Clear
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <Select
          label="Status"
          placeholder="All statuses"
          options={[{ value: '', label: 'All statuses' }, ...statuses.map(s => ({ value: s, label: s }))]}
          value={currentStatus.join(',')}
          onChange={(e) => handleMultiSelectChange('status', e.target.value.split(',').filter(Boolean))}
        >
          <option value="">All statuses</option>
          {statuses.map(s => <option key={s} value={s}>{s}</option>)}
        </Select>

        <Select
          label="Project Type"
          placeholder="All types"
          options={[{ value: '', label: 'All types' }, ...projectTypes.map(t => ({ value: t, label: t }))]}
          value={currentProjectType.join(',')}
          onChange={(e) => handleMultiSelectChange('projectType', e.target.value.split(',').filter(Boolean))}
        >
          <option value="">All types</option>
          {projectTypes.map(t => <option key={t} value={t}>{t}</option>)}
        </Select>

        <Select
          label="Source"
          placeholder="All sources"
          options={[{ value: '', label: 'All sources' }, ...sources.map(s => ({ value: s.id, label: s.name }))]}
          value={currentSourceId}
          onChange={handleSourceChange}
        >
          <option value="">All sources</option>
          {sources.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </Select>

        <div>
          <label className="block text-sm font-medium text-civic-700 mb-1.5">Sort by</label>
          <div className="relative">
            <select
              value={`${currentSortField},${currentSortDirection}`}
              onChange={(e) => {
                const [field, direction] = e.target.value.split(',');
                updateParams({ sortField: field, sortDirection: direction });
              }}
              className="w-full px-4 py-2.5 text-civic-900 bg-white border border-civic-200 rounded-xl appearance-none focus:outline-none focus:ring-2 focus:ring-civic-500 focus:border-transparent pr-10"
              aria-label="Sort projects"
            >
              <option value="lastObservedAt,desc">Recently Updated</option>
              <option value="lastObservedAt,asc">Oldest First</option>
              <option value="title,asc">Name (A-Z)</option>
              <option value="title,desc">Name (Z-A)</option>
              <option value="firstObservedAt,desc">Newest Tracked</option>
              <option value="firstObservedAt,asc">Oldest Tracked</option>
              <option value="status,asc">Status</option>
              <option value="projectType,asc">Project Type</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-civic-400 pointer-events-none" aria-hidden="true" />
          </div>
        </div>
      </div>
    </div>
  );
}