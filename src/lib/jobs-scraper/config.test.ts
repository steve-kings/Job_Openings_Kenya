import assert from 'node:assert/strict';
import test from 'node:test';
import { buildAnnexPageUrl, isLastAnnexPage, normalizeAnnexJob, parseAnnexPage } from './annex';
import { parseScraperSources } from './config';

test('Annex sources default to Kenya and remain drafts', () => {
    const [source] = parseScraperSources(JSON.stringify([
        { name: 'annex', kind: 'annex', enabled: true },
    ]));

    assert.equal(source.location, 'Kenya');
    assert.equal(source.autoPublish, false);
});

test('Annex requests include the configured location filter', () => {
    const [source] = parseScraperSources(JSON.stringify([
        { name: 'annex', kind: 'annex', location: ' Kenya ', maxPages: 3 },
    ]));
    const url = buildAnnexPageUrl(source, 2);

    assert.equal(url.searchParams.get('location'), 'Kenya');
    assert.equal(url.searchParams.get('page'), '2');
    assert.equal(url.searchParams.get('sort_by'), 'posted_date');
});

test('rejects an invalid Annex location', () => {
    assert.throws(
        () => parseScraperSources(JSON.stringify([
            { name: 'annex', kind: 'annex', location: '   ' },
        ])),
        /location must be a non-empty string/,
    );
});

test('marks an Annex crawl complete only after the reported final page', () => {
    assert.equal(isLastAnnexPage(1, 3), false);
    assert.equal(isLastAnnexPage(3, 3), true);
});

test('rejects malformed Annex pagination responses', () => {
    assert.throws(() => parseAnnexPage('{"pages":1}'), /jobs array/);
    assert.throws(() => parseAnnexPage('{"jobs":[],"pages":0}'), /page count/);
    assert.deepEqual(parseAnnexPage('{"jobs":[],"pages":1}'), { jobs: [], pages: 1 });
});

test('rejects duplicate source names because reconciliation is source-scoped', () => {
    assert.throws(
        () => parseScraperSources(JSON.stringify([
            { name: 'annex', kind: 'annex' },
            { name: 'annex', kind: 'jsonld', startUrls: ['https://example.org/jobs'] },
        ])),
        /Duplicate scraper source name/,
    );
});

test('accepts a substantive, current Kenya listing', () => {
    const [source] = parseScraperSources(JSON.stringify([
        { name: 'annex', kind: 'annex', location: 'Kenya' },
    ]));
    const job = normalizeAnnexJob(validAnnexJob(), source, new Date('2026-07-18T12:00:00Z'));

    assert.equal(job?.title, 'Community Liaison Officer');
    assert.equal(job?.location, 'Remote - Kenya');
    assert.equal(job?.source, 'annex');
});

test('rejects unsafe or low-quality Annex records', () => {
    const [source] = parseScraperSources(JSON.stringify([
        { name: 'annex', kind: 'annex', location: 'Kenya' },
    ]));
    const now = new Date('2026-07-18T12:00:00Z');
    const cases: Array<[string, Record<string, unknown>]> = [
        ['foreign location', validAnnexJob({ location: 'Austin, TX, US' })],
        ['inactive', validAnnexJob({ is_active: false })],
        ['missing active flag', validAnnexJob({ is_active: undefined })],
        ['stale', validAnnexJob({ posted_date: '2025-09-01T00:00:00Z' })],
        ['future dated', validAnnexJob({ posted_date: '2026-07-25T00:00:00Z' })],
        ['expired', validAnnexJob({ application_deadline: '2026-07-17T00:00:00Z' })],
        ['generic title', validAnnexJob({ title: 'Career Opportunities' })],
        ['thin description', validAnnexJob({ description: 'Apply now.' })],
        ['missing company', validAnnexJob({ company: '' })],
        ['invalid apply URL', validAnnexJob({ apply_url: 'javascript:alert(1)', url: '' })],
    ];

    for (const [label, value] of cases) {
        assert.equal(normalizeAnnexJob(value, source, now), null, label);
    }
});

function validAnnexJob(overrides: Record<string, unknown> = {}): Record<string, unknown> {
    return {
        id: 42877,
        title: 'Community Liaison Officer',
        company: 'Kenya Medical Research Institute',
        location: 'Remote - Kenya',
        description: 'Coordinate community engagement, stakeholder communication, field activities, and accurate project reporting for a public-health research programme in Kenya. '.repeat(2),
        url: 'https://example.org/jobs/42877',
        apply_url: 'https://example.org/jobs/42877/apply',
        requirements: 'Diploma in a relevant field\nStrong communication skills',
        posted_date: '2026-07-10T08:00:00Z',
        application_deadline: null,
        is_active: true,
        ...overrides,
    };
}
