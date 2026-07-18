import { readLimitedText, safeFetch } from './network';

interface RobotsRules {
    allows(pathname: string): boolean;
}
const cache = new Map<string, Promise<RobotsRules>>();

export function robotsAllows(url: URL): Promise<RobotsRules> {
    const origin = url.origin;
    let pending = cache.get(origin);
    if (!pending) {
        pending = loadRules(origin);
        cache.set(origin, pending);
    }
    return pending;
}

async function loadRules(origin: string): Promise<RobotsRules> {
    try {
        const response = await safeFetch(`${origin}/robots.txt`, { headers: { Accept: 'text/plain' } });
        if (response.status === 404) return { allows: () => true };
        if (!response.ok) return { allows: () => false };
        return parseRobots(await readLimitedText(response));
    } catch {
        // Fail closed when crawler permission cannot be determined.
        return { allows: () => false };
    }
}

function parseRobots(text: string): RobotsRules {
    const applicable: Array<{ type: 'allow' | 'disallow'; path: string }> = [];
    let applies = false;

    for (const rawLine of text.split(/\r?\n/)) {
        const line = rawLine.split('#', 1)[0].trim();
        if (!line) continue;
        const separator = line.indexOf(':');
        if (separator < 0) continue;
        const key = line.slice(0, separator).trim().toLowerCase();
        const value = line.slice(separator + 1).trim();

        if (key === 'user-agent') {
            const agent = value.toLowerCase();
            applies = agent === '*' || agent.includes('jobopeningskenya');
        } else if (applies && (key === 'allow' || key === 'disallow') && value) {
            applicable.push({ type: key, path: value });
        }
    }

    return {
        allows(pathname: string) {
            const matching = applicable
                .filter(rule => pathMatches(rule.path, pathname))
                .sort((a, b) => b.path.length - a.path.length);
            return matching[0]?.type !== 'disallow';
        },
    };
}

function pathMatches(rule: string, pathname: string): boolean {
    const escaped = rule.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*').replace(/\$$/, '$');
    return new RegExp(`^${escaped}`).test(pathname);
}
