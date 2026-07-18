import test from 'node:test';
import assert from 'node:assert/strict';
import { hasSubstantiveArticleContent, hasSubstantiveJobContent } from './content-quality';

test('rejects sparse job records and accepts detailed listings', () => {
    assert.equal(hasSubstantiveJobContent({ description: '<p>Apply now.</p>' }), false);
    assert.equal(hasSubstantiveJobContent({ description: `<p>${'Detailed role information. '.repeat(12)}</p>` }), true);
});

test('supporting job fields can make a concise description substantive', () => {
    assert.equal(hasSubstantiveJobContent({
        description: 'This role supports customers and coordinates service delivery across the organization. '.repeat(2),
        requirements: ['Relevant professional training and demonstrated experience. '.repeat(3)],
    }), true);
});

test('requires useful article depth before indexing', () => {
    assert.equal(hasSubstantiveArticleContent('<p>Short announcement.</p>'), false);
    assert.equal(hasSubstantiveArticleContent(`<p>${'Original career guidance for Kenyan applicants. '.repeat(12)}</p>`), true);
});
