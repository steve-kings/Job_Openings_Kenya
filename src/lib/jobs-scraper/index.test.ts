import assert from 'node:assert/strict';
import test from 'node:test';
import { selectScraperSources } from './index';
import type { ScraperSource } from './types';

const annexSource: ScraperSource = { name: 'annex', kind: 'annex', location: 'Kenya' };

test('fails loudly when no scraper sources are configured', () => {
    assert.throws(() => selectScraperSources([]), /No enabled scraper sources configured/);
});

test('fails loudly when a requested source name is unknown', () => {
    assert.throws(
        () => selectScraperSources([annexSource], 'annex-kenya'),
        /No enabled scraper source named "annex-kenya"/,
    );
});

test('selects the requested configured source', () => {
    assert.deepEqual(selectScraperSources([annexSource], 'annex'), [annexSource]);
});
