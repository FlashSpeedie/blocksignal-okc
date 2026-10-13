import { describe, it, expect } from 'vitest';
import { generateFingerprint, slugify, parseCurrency, parseDate, normalizeWhitespace, generateDeduplicationKey, classifyChange, isMaterialChange, deepEqual, formatCurrency, formatDate, formatRelativeTime } from '@/lib/utils';

describe('Utils', () => {
  describe('generateFingerprint', () => {
    it('generates consistent fingerprints for identical objects', () => {
      const obj1 = { a: 1, b: 'test', c: { nested: true } };
      const obj2 = { c: { nested: true }, a: 1, b: 'test' };
      expect(generateFingerprint(obj1)).toBe(generateFingerprint(obj2));
    });

    it('generates different fingerprints for different objects', () => {
      const obj1 = { a: 1 };
      const obj2 = { a: 2 };
      expect(generateFingerprint(obj1)).not.toBe(generateFingerprint(obj2));
    });
  });

  describe('slugify', () => {
    it('converts text to URL-friendly slug', () => {
      expect(slugify('Hello World')).toBe('hello-world');
      expect(slugify('NW Expressway Expansion')).toBe('nw-expressway-expansion');
      expect(slugify('Project @#$%')).toBe('project');
      expect(slugify('  Multiple   Spaces  ')).toBe('multiple-spaces');
    });
  });

  describe('parseCurrency', () => {
    it('parses currency strings correctly', () => {
      expect(parseCurrency('$1,000,000')).toBe(1000000);
      expect(parseCurrency('45000000')).toBe(45000000);
      expect(parseCurrency('$12.5M')).toBe(12.5);
    });

    it('handles undefined/null/empty', () => {
      expect(parseCurrency(undefined)).toBeUndefined();
      expect(parseCurrency(null as any)).toBeUndefined();
      expect(parseCurrency('')).toBeUndefined();
    });
  });

  describe('parseDate', () => {
    it('parses various date formats', () => {
      const d1 = parseDate('2024-01-15');
      expect(d1).toBeInstanceOf(Date);
      expect(d1?.getFullYear()).toBe(2024);
      expect(d1?.getMonth()).toBe(0);
      expect(d1?.getDate()).toBe(15);

      const d2 = parseDate('January 15, 2024');
      expect(d2).toBeInstanceOf(Date);
      expect(d2?.getFullYear()).toBe(2024);
    });

    it('handles undefined/null', () => {
      expect(parseDate(undefined)).toBeUndefined();
      expect(parseDate(null as any)).toBeUndefined();
    });
  });

  describe('normalizeWhitespace', () => {
    it('normalizes whitespace', () => {
      expect(normalizeWhitespace('  hello   world  ')).toBe('hello world');
      expect(normalizeWhitespace('\t\nhello\r\nworld\t')).toBe('hello world');
    });
  });

  describe('generateDeduplicationKey', () => {
    it('generates consistent keys', () => {
      const key1 = generateDeduplicationKey('proj1', 'status', 'old', 'new');
      const key2 = generateDeduplicationKey('proj1', 'status', 'old', 'new');
      expect(key1).toBe(key2);
    });

    it('handles undefined values', () => {
      const key = generateDeduplicationKey('proj1', 'status', undefined, 'new');
      expect(key).toBe('proj1|status|null|new');
    });
  });

  describe('classifyChange', () => {
    it('classifies changes correctly', () => {
      expect(classifyChange('status')).toBe('STATUS_CHANGE');
      expect(classifyChange('estimatedEndDate')).toBe('SCHEDULE_CHANGE');
      expect(classifyChange('fundingAmount')).toBe('FUNDING_CHANGE');
      expect(classifyChange('scope')).toBe('SCOPE_CHANGE');
      expect(classifyChange('location')).toBe('LOCATION_CHANGE');
      expect(classifyChange('documentUrl')).toBe('DOCUMENT_ADDED');
      expect(classifyChange('randomField')).toBe('OTHER');
    });
  });

  describe('isMaterialChange', () => {
    it('detects material changes', () => {
      expect(isMaterialChange('status', 'Planning', 'Active')).toBe(true);
      expect(isMaterialChange('funding', 1000000, 1500000)).toBe(true);
      expect(isMaterialChange('field', 'old', 'new')).toBe(true);
    });

    it('ignores immaterial changes', () => {
      expect(isMaterialChange('status', 'Active', 'Active')).toBe(false);
      expect(isMaterialChange('fingerprint', 'abc', 'def')).toBe(false);
      expect(isMaterialChange('capturedAt', new Date(), new Date())).toBe(false);
      expect(isMaterialChange('field', '  value  ', 'value')).toBe(false);
    });
  });

  describe('deepEqual', () => {
    it('compares objects deeply', () => {
      expect(deepEqual({ a: 1, b: { c: 2 } }, { a: 1, b: { c: 2 } })).toBe(true);
      expect(deepEqual({ a: 1 }, { a: 2 })).toBe(false);
      expect(deepEqual([1, 2, 3], [1, 2, 3])).toBe(true);
      expect(deepEqual(null, null)).toBe(true);
      expect(deepEqual(null, undefined)).toBe(false);
    });
  });

  describe('formatCurrency', () => {
    it('formats currency correctly', () => {
      expect(formatCurrency(1000000)).toBe('$1,000,000');
      expect(formatCurrency(45000000)).toBe('$45,000,000');
      expect(formatCurrency(0)).toBe('$0');
      expect(formatCurrency(undefined)).toBe('Not available');
    });
  });

  describe('formatDate', () => {
    it('formats dates correctly', () => {
      const date = new Date('2024-01-15T10:30:00');
      expect(formatDate(date)).toBe('January 15, 2024');
      expect(formatDate('2024-01-15')).toBe('January 15, 2024');
    });

    it('handles invalid dates', () => {
      expect(formatDate('invalid')).toBe('Invalid date');
      expect(formatDate(undefined)).toBe('Not available');
    });
  });

  describe('formatRelativeTime', () => {
    it('formats relative time correctly', () => {
      const now = new Date();
      const minuteAgo = new Date(now.getTime() - 60000);
      const hourAgo = new Date(now.getTime() - 3600000);
      const dayAgo = new Date(now.getTime() - 86400000);
      const weekAgo = new Date(now.getTime() - 604800000);

      expect(formatRelativeTime(minuteAgo)).toBe('1m ago');
      expect(formatRelativeTime(hourAgo)).toBe('1h ago');
      expect(formatRelativeTime(dayAgo)).toBe('1d ago');
      expect(formatRelativeTime(weekAgo)).toBe('1w ago');
    });
  });
});