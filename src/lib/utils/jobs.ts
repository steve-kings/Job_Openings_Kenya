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

// Clean a stored job description for on-page display. Scraper-imported jobs embed
// the source page's SEO scaffolding, which duplicates what the page header and
// Quick Info sidebar already show:
//   <h1>{title}</h1><h2>Meta Description</h2><p>blurb…</p>            (variant A)
//   <h1>{title}</h1><p><strong>Company:</strong> …</p><p><strong>Deadline:</strong> …</p> (variant B)
// with every word joined by &nbsp;. Strips only the leading scaffolding — real
// per-section content (e.g. "Location:" under a sub-position) is left intact.
export function cleanJobDescriptionHtml(job: Pick<JobData, 'title' | 'description'>): string {
    const original = String(job.description || '');
    // &nbsp; between every word is a scraper artifact; restore normal spaces so text wraps.
    let html = original.replace(/&nbsp;|\u00a0/g, ' ');

    const norm = (s: string) => htmlToText(s).toLowerCase().replace(/[^a-z0-9 ]+/g, '').replace(/\s+/g, ' ').trim();
    const title = norm(job.title || '');

    // Leading heading repeating the job title (already the page's H1).
    const lead = html.match(/^\s*<h([1-6])[^>]*>([\s\S]*?)<\/h\1>\s*/i);
    if (lead && title) {
        const h = norm(lead[2]);
        if (h && (h.includes(title) || title.includes(h))) html = html.slice(lead[0].length);
    }

    // "Meta Description" heading plus its blurb paragraph (pure SEO text).
    html = html.replace(/<h[1-6][^>]*>\s*Meta\s*Description\s*<\/h[1-6]>\s*(?:<p[^>]*>[\s\S]*?<\/p>\s*)?/i, '');
    html = html.replace(/<p[^>]*>\s*(?:<strong[^>]*>\s*)?Meta\s*Description\s*:?\s*(?:<\/strong>\s*)?<\/p>\s*/i, '');

    // Leading run of "Label: value" lines duplicating the header/Quick Info.
    const labelP = /^\s*<p[^>]*>\s*(?:<strong[^>]*>\s*)?(?:Company|Deadline|Closing\s*Date|Application\s*Deadline|Salary|Location|Job\s*Type|Job\s*Field|Position|Job\s*Title)\s*:?\s*(?:<\/strong>)?[\s\S]*?<\/p>\s*/i;
    for (let guard = 0; guard < 10; guard++) {
        const m = html.match(labelP);
        if (!m) break;
        html = html.slice(m[0].length);
    }

    // The page already has one H1 — demote in-body h1s to h2 (prose styles h2 nicely).
    html = html.replace(/<(\/?)h1\b/gi, '<$1h2');

    const cleaned = html.trim();
    return cleaned || original;
}

// Full cleaned plain-text summary (scraper scaffolding stripped), no length cap.
// Use for meta descriptions, JSON-LD, and anywhere a caller picks its own length.
export function cleanSummaryText(j: Pick<JobData, 'title' | 'company' | 'short_description' | 'description'>) {
    let text = htmlToText(j.short_description || j.description);

    // Scraper-imported pages often embed SEO scaffolding ahead of the real copy:
    // "<H1 title> Company: X Deadline: Y Salary: Z Meta Description <actual summary>".
    // Prefer the text after a "Meta Description" label — that's the clean summary.
    const meta = text.match(/Meta Description\s*[:\-–]?\s*(.+)/i);
    if (meta) text = meta[1].trim();

    // Strip a leading repeat of the job title (the scraped page's H1).
    const title = (j.title || '').trim();
    if (title && text.toLowerCase().startsWith(title.toLowerCase())) {
        text = text.slice(title.length).replace(/^[\s:\-–—]+/, '');
    }

    // Strip leading "Label: value" field dumps (conservative, anchored patterns only).
    for (let guard = 0; guard < 6; guard++) {
        const before = text;
        const company = (j.company || '').trim();
        if (company) {
            text = text.replace(new RegExp(`^Company\\s*:\\s*${company.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*`, 'i'), '');
        }
        text = text
            .replace(/^(?:Job\s+)?Vacanc(?:y|ies)\s*[:\-–]?\s*/i, '')
            .replace(/^(?:Application\s+)?Deadline\s*:\s*\d{1,2}(?:st|nd|rd|th)?\s+\w+,?\s+\d{4}\s*/i, '')
            .replace(/^(?:Application\s+)?Deadline\s*:\s*\d{4}-\d{2}-\d{2}\s*/i, '')
            .replace(/^Salary\s*:\s*(?:KES|KSh|Ksh\.?|USD)?\s*[\d,.]+(?:\s*[–—-]\s*(?:KES|KSh|Ksh\.?|USD)?\s*[\d,.]+)?(?:\s*per\s+\w+)?\s*/i, '')
            .replace(/^Location\s*:\s*[A-Za-z ,]+?(?=[A-Z][a-z]+ |$)\s*/, '');
        if (text === before) break;
    }

    return text.trim();
}

export function cleanSummary(j: JobData) {
    return cleanSummaryText(j).slice(0, 180);
}
