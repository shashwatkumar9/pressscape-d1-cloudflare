/**
 * Link Verification Utility
 * Verifies that a published article contains the buyer's target backlink
 */

export interface LinkVerificationResult {
    verified: boolean;
    foundLinks: {
        url: string;
        anchorText: string;
        isDofollow: boolean;
    }[];
    targetFound: boolean;
    anchorMatched: boolean;
    error?: string;
}

/**
 * Verify that the published article contains the target URL
 * @param articleUrl - The URL where the article is published
 * @param targetUrl - The URL that should be linked in the article
 * @param expectedAnchorText - Optional: the expected anchor text for the link
 */
export async function verifyLink(
    articleUrl: string,
    targetUrl: string,
    expectedAnchorText?: string
): Promise<LinkVerificationResult> {
    try {
        // Fetch the published article
        const response = await fetch(articleUrl, {
            headers: {
                'User-Agent': 'PressScape Link Verifier/1.0',
                'Accept': 'text/html,application/xhtml+xml',
            },
            redirect: 'follow',
        });

        if (!response.ok) {
            return {
                verified: false,
                foundLinks: [],
                targetFound: false,
                anchorMatched: false,
                error: `Failed to fetch article: HTTP ${response.status}`,
            };
        }

        const html = await response.text();

        // Parse the HTML and extract all links
        const foundLinks = extractLinks(html);

        // Normalize the target URL for comparison
        const normalizedTarget = normalizeUrl(targetUrl);

        // Check if target URL exists in the links
        const matchingLinks = foundLinks.filter(link =>
            normalizeUrl(link.url) === normalizedTarget
        );

        const targetFound = matchingLinks.length > 0;

        // Check anchor text if provided
        let anchorMatched = true;
        if (expectedAnchorText && targetFound) {
            anchorMatched = matchingLinks.some(link =>
                link.anchorText.toLowerCase().includes(expectedAnchorText.toLowerCase())
            );
        }

        return {
            verified: targetFound,
            foundLinks: matchingLinks,
            targetFound,
            anchorMatched,
        };
    } catch (error) {
        return {
            verified: false,
            foundLinks: [],
            targetFound: false,
            anchorMatched: false,
            error: error instanceof Error ? error.message : 'Unknown error occurred',
        };
    }
}

/**
 * Extract all links from HTML content
 */
function extractLinks(html: string): { url: string; anchorText: string; isDofollow: boolean }[] {
    const links: { url: string; anchorText: string; isDofollow: boolean }[] = [];

    // Regular expression to match anchor tags
    const linkRegex = /<a\s+([^>]*href\s*=\s*["']([^"']+)["'][^>]*)>([^<]*)<\/a>/gi;

    let match;
    while ((match = linkRegex.exec(html)) !== null) {
        const attributes = match[1];
        const url = match[2];
        const anchorText = match[3].trim();

        // Check for nofollow
        const isNofollow = /rel\s*=\s*["'][^"']*nofollow[^"']*["']/i.test(attributes);

        if (url && !url.startsWith('#') && !url.startsWith('javascript:')) {
            links.push({
                url,
                anchorText,
                isDofollow: !isNofollow,
            });
        }
    }

    return links;
}

/**
 * Normalize URL for comparison
 */
function normalizeUrl(url: string): string {
    try {
        const parsed = new URL(url);
        // Remove trailing slash, convert to lowercase
        let normalized = `${parsed.protocol}//${parsed.host}${parsed.pathname}`.toLowerCase();
        if (normalized.endsWith('/')) {
            normalized = normalized.slice(0, -1);
        }
        return normalized;
    } catch {
        // If URL parsing fails, just lowercase and trim
        return url.toLowerCase().trim().replace(/\/$/, '');
    }
}

/**
 * Check if a URL is accessible (HEAD request)
 */
export async function checkUrlAccessible(url: string): Promise<{ accessible: boolean; error?: string }> {
    try {
        const response = await fetch(url, {
            method: 'HEAD',
            headers: {
                'User-Agent': 'PressScape Link Verifier/1.0',
            },
            redirect: 'follow',
        });

        return {
            accessible: response.ok,
            error: response.ok ? undefined : `HTTP ${response.status}`,
        };
    } catch (error) {
        return {
            accessible: false,
            error: error instanceof Error ? error.message : 'Unknown error',
        };
    }
}
