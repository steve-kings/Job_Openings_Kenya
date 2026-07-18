import assert from 'node:assert/strict';
import test from 'node:test';
import { deduplicateScrapedJobs } from './store';
import type { ScrapedJob } from './types';

test('deduplicates repeated source job IDs before a database batch', () => {
    const first = scrapedJob('101', 'First version');
    const latest = scrapedJob('101', 'Latest version');
    const other = scrapedJob('102', 'Another job');

    const unique = deduplicateScrapedJobs([first, latest, other]);

    assert.equal(unique.length, 2);
    assert.equal(unique[0].title, 'Latest version');
    assert.equal(unique[1].sourceJobId, '102');
});

function scrapedJob(sourceJobId: string, title: string): ScrapedJob {
    return {
        source: 'annex',
        sourceJobId,
        sourceUrl: `https://example.org/jobs/${sourceJobId}`,
        title,
        company: 'Example Ltd',
        location: 'Nairobi, Kenya',
        description: 'A substantive job description for testing safe ingestion behavior.',
        shortDescription: 'A substantive job description.',
        requirements: [],
        responsibilities: [],
        deadline: null,
        applyUrl: `https://example.org/jobs/${sourceJobId}/apply`,
        salaryMin: null,
        salaryMax: null,
        salaryCurrency: 'KES',
        thumbnailUrl: null,
        postedAt: '2026-07-10T00:00:00Z',
        remote: false,
    };
}
