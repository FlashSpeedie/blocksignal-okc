import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { ChangeClassification } from '@/types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateFingerprint(data: Record<string, unknown>): string {
  const sorted = Object.keys(data)
    .sort()
    .reduce((acc, key) => {
      acc[key] = data[key];
      return acc;
    }, {} as Record<string, unknown>);
  
  const str = JSON.stringify(sorted);
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function generateDeduplicationKey(
  projectId: string,
  fieldName: string,
  previousValue: string | undefined,
  newValue: string | undefined
): string {
  const parts = [projectId, fieldName, previousValue ?? 'null', newValue ?? 'null'];
  return parts.join('|');
}

export function normalizeWhitespace(text: string): string {
  return text.replace(/\s+/g, ' ').trim();
}

export function parseCurrency(value: string | number | undefined): number | undefined {
  if (value === undefined || value === null || value === '') return undefined;
  const str = typeof value === 'string' ? value : String(value);
  // Remove currency symbols, commas, and common suffixes like M, K, B
  const cleaned = str.replace(/[$,]/g, '').replace(/[MKBmkb]/g, '');
  const num = parseFloat(cleaned);
  return isNaN(num) ? undefined : num;
}

export function parseDate(value: string | Date | undefined, fallbackFormat?: string): Date | undefined {
  if (!value) return undefined;
  if (value instanceof Date) return value;
  
  const formats = fallbackFormat ? [fallbackFormat] : [
    'yyyy-MM-dd',
    'MM/dd/yyyy',
    'MMMM d, yyyy',
    'MMM d, yyyy',
    'yyyy-MM-dd\'T\'HH:mm:ss',
    'yyyy-MM-dd\'T\'HH:mm:ss.SSSZ',
  ];
  
  for (const format of formats) {
    try {
      const parsed = parseDateWithFormat(value, format);
      if (parsed && !isNaN(parsed.getTime())) return parsed;
    } catch {}
  }
  
  const direct = new Date(value);
  return isNaN(direct.getTime()) ? undefined : direct;
}

function parseDateWithFormat(value: string, format: string): Date | null {
  const formatRegex = format
    .replace(/yyyy/g, '(\\d{4})')
    .replace(/MM/g, '(\\d{2})')
    .replace(/dd/g, '(\\d{2})')
    .replace(/HH/g, '(\\d{2})')
    .replace(/mm/g, '(\\d{2})')
    .replace(/ss/g, '(\\d{2})')
    .replace(/SSS/g, '(\\d{3})')
    .replace(/Z/g, '(Z|[+-]\\d{2}:?\\d{2})?')
    .replace(/MMMM/g, '(January|February|March|April|May|June|July|August|September|October|November|December)')
    .replace(/MMM/g, '(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)');
  
  const match = value.match(new RegExp(`^${formatRegex}$`));
  if (!match) return null;
  
  const year = match[1] ? parseInt(match[1], 10) : new Date().getFullYear();
  const month = match[2] ? parseInt(match[2], 10) - 1 : 0;
  const day = match[3] ? parseInt(match[3], 10) : 1;
  const hour = match[4] ? parseInt(match[4], 10) : 0;
  const minute = match[5] ? parseInt(match[5], 10) : 0;
  const second = match[6] ? parseInt(match[6], 10) : 0;
  
  return new Date(year, month, day, hour, minute, second);
}

export function formatCurrency(amount: number | undefined): string {
  if (amount === undefined || amount === null) return 'Not available';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(date: Date | string | undefined, options?: Intl.DateTimeFormatOptions): string {
  if (!date) return 'Not available';
  let d: Date;
  if (date instanceof Date) {
    d = date;
  } else if (typeof date === 'string') {
    // Parse date string as local date to avoid timezone issues
    const parts = date.split('T')[0].split('-');
    if (parts.length === 3) {
      d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
    } else {
      d = new Date(date);
    }
  } else {
    d = new Date(date);
  }
  if (isNaN(d.getTime())) return 'Invalid date';
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...options,
  });
}

export function formatRelativeTime(date: Date | string): string {
  const d = date instanceof Date ? date : new Date(date);
  if (isNaN(d.getTime())) return 'Unknown time';
  
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)}mo ago`;
  return `${Math.floor(diffDays / 365)}y ago`;
}

export function classifyChange(fieldName: string): ChangeClassification {
  const field = fieldName.toLowerCase();
  if (field.includes('status')) return 'STATUS_CHANGE';
  if (field.includes('date') || field.includes('schedule') || field.includes('timeline')) return 'SCHEDULE_CHANGE';
  if (field.includes('fund') || field.includes('cost') || field.includes('budget') || field.includes('amount')) return 'FUNDING_CHANGE';
  if (field.includes('scope') || field.includes('description') || field.includes('summary')) return 'SCOPE_CHANGE';
  if (field.includes('location') || field.includes('address') || field.includes('lat') || field.includes('lng') || field.includes('long')) return 'LOCATION_CHANGE';
  if (field.includes('document') || field.includes('attachment') || field.includes('file')) return 'DOCUMENT_ADDED';
  return 'OTHER';
}

export function isMaterialChange(fieldName: string, oldValue: unknown, newValue: unknown): boolean {
  if (oldValue === newValue) return false;
  if (oldValue === undefined && newValue === undefined) return false;
  if (oldValue === null && newValue === null) return false;
  if (oldValue === '' && newValue === '') return false;
  
  const normalizedOld = typeof oldValue === 'string' ? normalizeWhitespace(oldValue) : oldValue;
  const normalizedNew = typeof newValue === 'string' ? normalizeWhitespace(newValue) : newValue;
  
  if (normalizedOld === normalizedNew) return false;
  
  const immaterialFields = ['fingerprint', 'capturedAt', 'lastObservedAt', 'updatedAt', 'sourceVersion'];
  if (immaterialFields.includes(fieldName)) return false;
  
  return true;
}

export function deepEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (a === null || b === null) return false;
  if (typeof a !== 'object' || typeof b !== 'object') return false;
  
  const keysA = Object.keys(a as Record<string, unknown>);
  const keysB = Object.keys(b as Record<string, unknown>);
  
  if (keysA.length !== keysB.length) return false;
  
  for (const key of keysA) {
    if (!keysB.includes(key)) return false;
    if (!deepEqual((a as Record<string, unknown>)[key], (b as Record<string, unknown>)[key])) return false;
  }
  
  return true;
}