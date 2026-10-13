import { SourceType, SourceConfig, NormalizedProject, SourceMetadata } from '@/types';
import { validateNormalizedProject, validateSourceConfig } from '@/lib/validation';
import { generateFingerprint, slugify, parseCurrency, parseDate, normalizeWhitespace } from '@/lib/utils';

export interface SourceAdapter {
  readonly type: SourceType;
  readonly name: string;
  readonly description: string;
  fetchRecords(config: SourceConfig): Promise<NormalizedProject[]>;
  validateConfig(config: SourceConfig): boolean;
  getMetadata(config: SourceConfig): Partial<SourceMetadata>;
}

export abstract class BaseAdapter implements SourceAdapter {
  abstract readonly type: SourceType;
  abstract readonly name: string;
  abstract readonly description: string;

  abstract fetchRecords(config: SourceConfig): Promise<NormalizedProject[]>;

  validateConfig(config: SourceConfig): boolean {
    try {
      validateSourceConfig(config);
      return true;
    } catch {
      return false;
    }
  }

  getMetadata(config: SourceConfig): Partial<SourceMetadata> {
    return {
      canonicalUrl: config.url,
    };
  }

  protected async fetchHtml(url: string, headers?: Record<string, string>): Promise<string> {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'BlockSignal OKC/1.0 (+https://blocksignal.okc.gov)',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        ...headers,
      },
      next: { revalidate: 3600 },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    return response.text();
  }

  protected async fetchJson<T>(url: string, headers?: Record<string, string>): Promise<T> {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'BlockSignal OKC/1.0 (+https://blocksignal.okc.gov)',
        'Accept': 'application/json',
        ...headers,
      },
      next: { revalidate: 3600 },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    return response.json() as Promise<T>;
  }
}

export class OkcInfrastructureHtmlAdapter extends BaseAdapter {
  readonly type = 'HTML_SCRAPER' as const;
  readonly name = 'OKC Infrastructure Project Updates';
  readonly description = 'Scrapes project listings from okc.gov Infrastructure Project Updates page';

  async fetchRecords(config: SourceConfig): Promise<NormalizedProject[]> {
    const html = await this.fetchHtml(config.url, config.headers);
    const { load } = await import('cheerio');
    const $ = load(html);

    const projects: NormalizedProject[] = [];
    const selector = config.selectors?.projectCard || '.project-card, .project-item, article, .card, [class*="project"]';
    const elements = $(selector);

    if (elements.length === 0) {
      console.warn('[OkcInfrastructureHtmlAdapter] No project elements found with selector:', selector);
      return projects;
    }

    elements.each((_, el) => {
      try {
        const $el = $(el);
        const title = normalizeWhitespace($el.find(config.selectors?.title || 'h3, h2, .title, [class*="title"]').first().text());
        const summary = normalizeWhitespace($el.find(config.selectors?.summary || '.description, .summary, p, [class*="description"]').first().text());
        const status = normalizeWhitespace($el.find(config.selectors?.status || '.status, [class*="status"]').first().text());
        const location = normalizeWhitespace($el.find(config.selectors?.location || '.location, [class*="location"]').first().text());
        const linkEl = $el.find(config.selectors?.link || 'a').first();
        const sourceUrl = linkEl.attr('href') ? new URL(linkEl.attr('href')!, config.url).href : config.url;
        const externalId = $el.attr('id') || $el.attr('data-id') || slugify(title);

        if (!title) return;

        const fields: Record<string, unknown> = {};
        if (config.fieldMapping) {
          for (const [target, source] of Object.entries(config.fieldMapping)) {
            const value = normalizeWhitespace($el.find(source).first().text());
            if (value) fields[target] = value;
          }
        }

        const project: NormalizedProject = {
          externalId,
          title,
          summary: summary || undefined,
          status: status || undefined,
          location: location || undefined,
          fields,
          sourceUrl,
        };

        validateNormalizedProject(project);
        projects.push(project);
      } catch (error) {
        console.warn('[OkcInfrastructureHtmlAdapter] Failed to parse project:', error);
      }
    });

    return projects;
  }
}

export class ArcGisFeatureServerAdapter extends BaseAdapter {
  readonly type = 'ARCGIS_FEATURE_SERVER' as const;
  readonly name = 'ArcGIS Feature Server';
  readonly description = 'Fetches projects from ArcGIS FeatureServer REST endpoint';

  async fetchRecords(config: SourceConfig): Promise<NormalizedProject[]> {
    const baseUrl = config.url.replace(/\/$/, '');
    const queryUrl = `${baseUrl}/query`;
    
    const params = new URLSearchParams({
      where: '1=1',
      outFields: '*',
      f: 'json',
      returnGeometry: 'true',
      ...(config.pagination ? { resultOffset: '0', resultRecordCount: String(config.pagination.limit) } : {}),
    });

    const response = await this.fetchJson<{ features: Array<{ attributes: Record<string, unknown>; geometry?: { x: number; y: number } }> }>(
      `${queryUrl}?${params.toString()}`,
      config.headers
    );

    const projects: NormalizedProject[] = [];
    const mapping = config.fieldMapping || {};

    for (const feature of response.features) {
      const attrs = feature.attributes;
      const geometry = feature.geometry;

      const externalId = String(attrs[mapping.externalId || 'OBJECTID' || 'GlobalID' || 'PROJECT_ID'] ?? '');
      const title = String(attrs[mapping.title || 'PROJECT_NAME' || 'NAME' || 'TITLE'] ?? '');
      
      if (!title || !externalId) continue;

      const project: NormalizedProject = {
        externalId,
        title,
        summary: mapping.summary ? String(attrs[mapping.summary] ?? '') : undefined,
        status: mapping.status ? String(attrs[mapping.status] ?? '') : undefined,
        location: mapping.location ? String(attrs[mapping.location] ?? '') : undefined,
        address: mapping.address ? String(attrs[mapping.address] ?? '') : undefined,
        latitude: geometry?.y,
        longitude: geometry?.x,
        projectType: mapping.projectType ? String(attrs[mapping.projectType] ?? '') : undefined,
        fundingAmount: mapping.fundingAmount ? parseCurrency(String(attrs[mapping.fundingAmount] ?? '')) : undefined,
        fundingSource: mapping.fundingSource ? String(attrs[mapping.fundingSource] ?? '') : undefined,
        startDate: mapping.startDate ? parseDate(String(attrs[mapping.startDate] ?? ''), config.dateFormat) : undefined,
        estimatedEndDate: mapping.estimatedEndDate ? parseDate(String(attrs[mapping.estimatedEndDate] ?? ''), config.dateFormat) : undefined,
        actualEndDate: mapping.actualEndDate ? parseDate(String(attrs[mapping.actualEndDate] ?? ''), config.dateFormat) : undefined,
        fields: attrs,
        sourceUrl: `${baseUrl}/${externalId}`,
      };

      validateNormalizedProject(project);
      projects.push(project);
    }

    return projects;
  }
}

export class JsonApiAdapter extends BaseAdapter {
  readonly type = 'JSON_API' as const;
  readonly name = 'JSON API';
  readonly description = 'Fetches projects from a JSON REST API';

  async fetchRecords(config: SourceConfig): Promise<NormalizedProject[]> {
    const data = await this.fetchJson<unknown[]>(config.url, config.headers);
    
    if (!Array.isArray(data)) {
      throw new Error('JSON API response is not an array');
    }

    const projects: NormalizedProject[] = [];
    const mapping = config.fieldMapping || {};

    for (const item of data) {
      const obj = item as Record<string, unknown>;
      
      const externalId = String(obj[mapping.externalId || 'id' || 'project_id' || 'external_id'] ?? '');
      const title = String(obj[mapping.title || 'title' || 'name' || 'project_name'] ?? '');
      
      if (!title || !externalId) continue;

      const project: NormalizedProject = {
        externalId,
        title,
        summary: mapping.summary ? String(obj[mapping.summary] ?? '') : undefined,
        status: mapping.status ? String(obj[mapping.status] ?? '') : undefined,
        location: mapping.location ? String(obj[mapping.location] ?? '') : undefined,
        address: mapping.address ? String(obj[mapping.address] ?? '') : undefined,
        latitude: mapping.latitude ? Number(obj[mapping.latitude]) : undefined,
        longitude: mapping.longitude ? Number(obj[mapping.longitude]) : undefined,
        projectType: mapping.projectType ? String(obj[mapping.projectType] ?? '') : undefined,
        fundingAmount: mapping.fundingAmount ? parseCurrency(String(obj[mapping.fundingAmount] ?? '')) : undefined,
        fundingSource: mapping.fundingSource ? String(obj[mapping.fundingSource] ?? '') : undefined,
        startDate: mapping.startDate ? parseDate(String(obj[mapping.startDate] ?? ''), config.dateFormat) : undefined,
        estimatedEndDate: mapping.estimatedEndDate ? parseDate(String(obj[mapping.estimatedEndDate] ?? ''), config.dateFormat) : undefined,
        actualEndDate: mapping.actualEndDate ? parseDate(String(obj[mapping.actualEndDate] ?? ''), config.dateFormat) : undefined,
        fields: obj,
        sourceUrl: config.url,
      };

      validateNormalizedProject(project);
      projects.push(project);
    }

    return projects;
  }
}

export class RssFeedAdapter extends BaseAdapter {
  readonly type = 'RSS_FEED' as const;
  readonly name = 'RSS Feed';
  readonly description = 'Fetches projects from RSS/Atom feed';

  async fetchRecords(_config: SourceConfig): Promise<NormalizedProject[]> {
    return [];
  }
}

export class CsvExportAdapter extends BaseAdapter {
  readonly type = 'CSV_EXPORT' as const;
  readonly name = 'CSV Export';
  readonly description = 'Fetches projects from CSV export';

  async fetchRecords(_config: SourceConfig): Promise<NormalizedProject[]> {
    return [];
  }
}

export class ManualAdapter extends BaseAdapter {
  readonly type = 'MANUAL' as const;
  readonly name = 'Manual Entry';
  readonly description = 'Manually entered projects';

  async fetchRecords(_config: SourceConfig): Promise<NormalizedProject[]> {
    return [];
  }
}

export const adapterRegistry: Record<SourceType, SourceAdapter> = {
  HTML_SCRAPER: new OkcInfrastructureHtmlAdapter(),
  ARCGIS_FEATURE_SERVER: new ArcGisFeatureServerAdapter(),
  JSON_API: new JsonApiAdapter(),
  RSS_FEED: new RssFeedAdapter(),
  CSV_EXPORT: new CsvExportAdapter(),
  MANUAL: new ManualAdapter(),
};

export function getAdapter(type: SourceType): SourceAdapter {
  const adapter = adapterRegistry[type];
  if (!adapter) {
    throw new Error(`No adapter registered for type: ${type}`);
  }
  return adapter;
}