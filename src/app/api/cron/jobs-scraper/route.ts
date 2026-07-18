import { timingSafeEqual } from 'node:crypto';
import { NextResponse } from 'next/server';
import { runJobScraper } from '@/lib/jobs-scraper';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function GET(request: Request) {
    return handleScrape(request);
}
export async function POST(request: Request) {
    return handleScrape(request);
}

async function handleScrape(request: Request) {
    if (!isAuthorized(request)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const url = new URL(request.url);
        const result = await runJobScraper({
            dryRun: url.searchParams.get('dryRun') === 'true',
            onlySource: url.searchParams.get('source') || undefined,
        });
        return NextResponse.json(result, { status: result.success ? 200 : 502 });
    } catch (error) {
        console.error('[Jobs scraper]', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Job scraper failed' },
            { status: 500 },
        );
    }
}

function isAuthorized(request: Request): boolean {
    const secret = process.env.CRON_SECRET;
    const authorization = request.headers.get('authorization');
    if (!secret || !authorization?.startsWith('Bearer ')) return false;
    const received = authorization.slice(7);
    const expectedBuffer = Buffer.from(secret);
    const receivedBuffer = Buffer.from(received);
    return expectedBuffer.length === receivedBuffer.length && timingSafeEqual(expectedBuffer, receivedBuffer);
}
