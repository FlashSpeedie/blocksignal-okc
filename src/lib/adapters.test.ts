import { describe, it, expect, vi, beforeEach } from 'vitest';
import { OkcInfrastructureHtmlAdapter } from '@/lib/adapters';
import { SourceConfig } from '@/types';
import { validateNormalizedProject } from '@/lib/validation';
import { classifyChange, isMaterialChange } from '@/lib/utils';

describe('Adapters', () => {
  describe('OkcInfrastructureHtmlAdapter', () => {
    let adapter: OkcInfrastructureHtmlAdapter;

    beforeEach(() => {
      adapter = new OkcInfrastructureHtmlAdapter();
    });

    it('has correct metadata', () => {
      expect(adapter.type).toBe('HTML_SCRAPER');
      expect(adapter.name).toBe('OKC Infrastructure Project Updates');
    });

    it('validates config correctly', () => {
      const validConfig: SourceConfig = { url: 'https://example.com' };
      expect(adapter.validateConfig(validConfig)).toBe(true);

      const invalidConfig = { url: 'not-a-url' };
      expect(adapter.validateConfig(invalidConfig as any)).toBe(false);
    });
  });
});

describe('Validation', () => {
  it('validates normalized project schema', () => {
    const validProject = {
      externalId: '123',
      title: 'Test Project',
      fields: {},
      sourceUrl: 'https://example.com/project/123',
    };
    
    expect(() => validateNormalizedProject(validProject)).not.toThrow();
  });

  it('rejects invalid project', () => {
    const invalidProject = {
      externalId: '',
      title: '',
      fields: {},
      sourceUrl: 'not-a-url',
    };
    
    expect(() => validateNormalizedProject(invalidProject)).toThrow();
  });
});

describe('Change Detection Logic', () => {
  it('detects status changes', () => {
    expect(classifyChange('status')).toBe('STATUS_CHANGE');
    expect(isMaterialChange('status', 'Planning', 'Active')).toBe(true);
  });

  it('detects funding changes', () => {
    expect(classifyChange('fundingAmount')).toBe('FUNDING_CHANGE');
    expect(isMaterialChange('fundingAmount', 1000000, 1500000)).toBe(true);
  });

  it('detects schedule changes', () => {
    expect(classifyChange('estimatedEndDate')).toBe('SCHEDULE_CHANGE');
    expect(isMaterialChange('estimatedEndDate', '2024-12-31', '2025-03-31')).toBe(true);
  });

  it('ignores fingerprint changes', () => {
    expect(isMaterialChange('fingerprint', 'abc123', 'def456')).toBe(false);
    expect(isMaterialChange('capturedAt', new Date(), new Date())).toBe(false);
  });
});