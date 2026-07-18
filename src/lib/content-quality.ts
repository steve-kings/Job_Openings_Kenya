import { htmlToText } from '@/lib/utils/jobs';

export interface JobContentCandidate {
    description?: string | null;
    short_description?: string | null;
    requirements?: string[] | null;
    responsibilities?: string[] | null;
    benefits?: string[] | null;
}

function listText(value?: string[] | null): string {
    return Array.isArray(value) ? value.filter(Boolean).join(' ') : '';
}

/**
 * A deliberately conservative indexing gate. It does not hide a listing from
 * users; it only keeps extremely sparse records out of search indexes and the
 * sitemap until an editor adds enough useful application detail.
 */
export function hasSubstantiveJobContent(job: JobContentCandidate): boolean {
    const primary = htmlToText(job.description || job.short_description);
    const supporting = htmlToText([
        listText(job.requirements),
        listText(job.responsibilities),
        listText(job.benefits),
    ].join(' '));

    return primary.length >= 200 || (primary.length >= 100 && primary.length + supporting.length >= 300);
}

/** Published articles below this level are still readable, but should be
 * expanded by an editor before search engines are asked to index them. */
export function hasSubstantiveArticleContent(content?: string | null): boolean {
    return htmlToText(content).length >= 400;
}
