import assert from 'node:assert/strict';
import test from 'node:test';
import { extractCandidateLinks, extractJobPostings } from './extract-jsonld';

test('extracts and normalizes a JobPosting JSON-LD record', () => {
    const html = `
        <script type="application/ld+json">
        {
            "@type": "JobPosting",
            "title": "Software Engineer",
            "hiringOrganization": { "name": "Example Ltd" },
            "url": "https://careers.example.com/jobs/123",
            "description": "<p>Build useful products &amp; services.</p>",
            "jobLocationType": "TELECOMMUTE",
            "identifier": { "value": "123" }
        }
        </script>`;

    const jobs = extractJobPostings(html, 'https://careers.example.com/jobs', 'example');
    assert.equal(jobs.length, 1);
    assert.equal(jobs[0].sourceJobId, '123');
    assert.equal(jobs[0].company, 'Example Ltd');
    assert.equal(jobs[0].location, 'Remote');
    assert.equal(jobs[0].description, 'Build useful products & services.');
});

test('discovers only same-host HTTPS job-like links', () => {
    const html = `
        <a href="/jobs/123">Job</a>
        <a href="https://evil.example/jobs/456">External</a>
        <a href="/about">About</a>`;

    assert.deepEqual(
        extractCandidateLinks(html, 'https://careers.example.com/careers'),
        ['https://careers.example.com/jobs/123'],
    );
});
