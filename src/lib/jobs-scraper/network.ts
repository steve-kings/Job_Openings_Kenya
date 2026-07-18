import dns from 'node:dns/promises';
import net from 'node:net';

const USER_AGENT = 'JobOpeningsKenyaBot/1.0 (+https://jobopenings.co.ke/contact)';
const REQUEST_TIMEOUT_MS = 12_000;
const MAX_RESPONSE_BYTES = 5 * 1024 * 1024;

export async function safeFetch(url: string, init: RequestInit = {}): Promise<Response> {
    return fetchWithRedirects(url, init, 0);
}

async function fetchWithRedirects(url: string, init: RequestInit, redirects: number): Promise<Response> {
    if (redirects > 5) throw new Error('Too many redirects');
    const parsed = new URL(url);
    if (parsed.protocol !== 'https:') throw new Error('Only HTTPS crawler URLs are allowed');
    await assertPublicHost(parsed.hostname);

    const response = await fetch(parsed, {
        ...init,
        redirect: 'manual',
        headers: {
            Accept: 'text/html,application/json,application/ld+json,application/xml;q=0.9,*/*;q=0.5',
            'User-Agent': USER_AGENT,
            ...init.headers,
        },
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });

    if (response.status >= 300 && response.status < 400) {
        const location = response.headers.get('location');
        if (!location) throw new Error(`Redirect without a location (${response.status})`);
        return fetchWithRedirects(new URL(location, parsed).toString(), init, redirects + 1);
    }

    const declaredSize = Number(response.headers.get('content-length') || 0);
    if (declaredSize > MAX_RESPONSE_BYTES) throw new Error('Crawler response is too large');
    return response;
}

export async function readLimitedText(response: Response): Promise<string> {
    if (!response.body) return '';
    const reader = response.body.getReader();
    const chunks: Uint8Array[] = [];
    let size = 0;

    while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        size += value.byteLength;
        if (size > MAX_RESPONSE_BYTES) {
            await reader.cancel();
            throw new Error('Crawler response exceeded the size limit');
        }
        chunks.push(value);
    }

    const output = new Uint8Array(size);
    let offset = 0;
    for (const chunk of chunks) {
        output.set(chunk, offset);
        offset += chunk.byteLength;
    }
    return new TextDecoder().decode(output);
}

async function assertPublicHost(hostname: string): Promise<void> {
    const normalized = hostname.toLowerCase();
    if (normalized === 'localhost' || normalized.endsWith('.local')) throw new Error('Private hosts are not allowed');

    const addresses = net.isIP(normalized)
        ? [{ address: normalized }]
        : await dns.lookup(normalized, { all: true, verbatim: true });

    if (!addresses.length || addresses.some(entry => isPrivateAddress(entry.address))) {
        throw new Error('Private or unresolved hosts are not allowed');
    }
}

function isPrivateAddress(address: string): boolean {
    if (address === '::1' || address === '::' || address.startsWith('fe80:') || address.startsWith('fc') || address.startsWith('fd')) return true;
    if (address.startsWith('::ffff:')) return isPrivateAddress(address.slice(7));
    if (net.isIPv4(address)) {
        const [a, b] = address.split('.').map(Number);
        return a === 0 || a === 10 || a === 127 || (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168) || a >= 224;
    }
    return false;
}
