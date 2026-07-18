import type { LucideIcon } from 'lucide-react';
import { Briefcase, BookOpen, GraduationCap, DollarSign } from 'lucide-react';

export type OpportunityType = 'Job' | 'Training' | 'Grant' | 'Scholarship';

export const typeConfig: Record<OpportunityType, {
    icon: LucideIcon;
    gradient: string;
    softBg: string;
    softText: string;
    accent: string;
}> = {
    Job: { icon: Briefcase, gradient: 'from-emerald-500 to-teal-600', softBg: 'bg-emerald-50', softText: 'text-emerald-700', accent: 'border-emerald-400' },
    Training: { icon: BookOpen, gradient: 'from-violet-500 to-purple-600', softBg: 'bg-violet-50', softText: 'text-violet-700', accent: 'border-violet-400' },
    Grant: { icon: DollarSign, gradient: 'from-blue-500 to-indigo-600', softBg: 'bg-blue-50', softText: 'text-blue-700', accent: 'border-blue-400' },
    Scholarship: { icon: GraduationCap, gradient: 'from-purple-500 to-fuchsia-600', softBg: 'bg-purple-50', softText: 'text-purple-700', accent: 'border-purple-400' },
};

// Plural/display label per opportunity type (used in breadcrumbs, headings, filters)
export const typeLabel: Record<string, string> = {
    Job: 'Jobs', Training: 'Training', Grant: 'Grants', Scholarship: 'Scholarships', Banner: 'Banner',
};

export interface JobData {
    id: string;
    title: string;
    company: string;
    type: string;
    location: string;
    deadline?: string | null;
    created_at?: string;
    short_description?: string;
    description?: string;
    thumbnail_url?: string;
    requirements?: string[];
    benefits?: string[];
    responsibilities?: string[];
    salary_min?: number;
    salary_max?: number;
    salary_currency?: string;
}

export function getDaysLeft(d?: string | null) {
    if (!d) return null;
    return Math.max(0, Math.ceil((new Date(d).getTime() - Date.now()) / 86400000));
}

export function formatDaysRemaining(days: number) {
    const remaining = Math.max(0, Math.ceil(days));
    if (remaining === 0) return 'Deadline today';
    return `${remaining} ${remaining === 1 ? 'day' : 'days'} remaining`;
}

export function getPostedDaysAgo(createdAt?: string) {
    if (!createdAt) return null;
    const diffMs = Date.now() - new Date(createdAt).getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return '1d ago';
    if (diffDays < 7) return `${diffDays}d ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
    return `${Math.floor(diffDays / 30)}mo ago`;
}

export function isNew(createdAt?: string) {
    if (!createdAt) return false;
    const diffHours = (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60);
    return diffHours < 48;
}

export function fmtDate(d?: string | null) {
    if (!d) return 'Rolling';
    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// Convert rich-text HTML (e.g. from the Quill editor) to a clean plain-text snippet:
// strip tags, decode common HTML entities, and collapse whitespace. Use this anywhere
// a stored description is shown as plain text (cards, meta descriptions, etc.).
export function htmlToText(html?: string | null): string {
    return String(html || '')
        .replace(/<[^>]*>/g, ' ')                  // strip tags
        .replace(/&nbsp;/gi, ' ')
        .replace(/&#(\d+);/g, (_, d) => {
            const n = Number(d);
            return n > 0 && n <= 0x10ffff ? String.fromCodePoint(n) : ' ';
        })
        .replace(/&#x([0-9a-f]+);/gi, (_, h) => {
            const n = parseInt(h, 16);
            return n > 0 && n <= 0x10ffff ? String.fromCodePoint(n) : ' ';
        })
        .replace(/&lt;/gi, '<')
        .replace(/&gt;/gi, '>')
        .replace(/&quot;/gi, '"')
        .replace(/&amp;/gi, '&')                    // decode last to avoid double-decoding
        .replace(/\s+/g, ' ')
        .trim();
}

export function cleanSummary(j: JobData) {
    return htmlToText(j.short_description || j.description).slice(0, 180);
}
