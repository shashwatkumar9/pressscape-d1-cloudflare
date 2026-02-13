/**
 * Metrics Service for PressScape
 * Provides domain authority, domain rating, and traffic metrics
 * 
 * Currently uses simulated data generation.
 * Can be upgraded to use Moz/DataForSEO API by setting environment variables.
 */

import { sql } from './db';

// Types
export interface DomainMetrics {
    domainAuthority: number;      // Moz DA (0-100)
    domainRating: number;         // Ahrefs DR (0-100)
    organicTraffic: number;       // Monthly organic traffic estimate
    referringDomains: number;     // Number of referring domains
    spamScore: number;            // Spam score (0-100)
    trustFlow: number;            // Majestic Trust Flow
    citationFlow: number;         // Majestic Citation Flow
    source: 'simulated' | 'moz' | 'dataforseo' | 'manual';
    updatedAt: Date;
}

export interface MetricsUpdateResult {
    websiteId: string;
    domain: string;
    success: boolean;
    metrics?: DomainMetrics;
    error?: string;
}

// Simulated metrics generator - creates realistic-looking metrics
function generateSimulatedMetrics(domain: string): DomainMetrics {
    // Use domain characteristics to generate consistent metrics
    const hash = domain.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const seed = hash % 1000;

    // Higher DA/DR for well-known TLDs and longer domains
    const tldBonus = domain.endsWith('.com') ? 10 :
        domain.endsWith('.org') ? 8 :
            domain.endsWith('.net') ? 5 : 0;

    // Base metrics with some randomness but consistency for same domain
    const baseDA = 20 + (seed % 60) + tldBonus;
    const baseDR = 15 + (seed % 65) + tldBonus;

    // Ensure within bounds
    const da = Math.min(95, Math.max(5, baseDA + (Math.sin(seed) * 10)));
    const dr = Math.min(95, Math.max(5, baseDR + (Math.cos(seed) * 10)));

    // Traffic correlates with DA/DR
    const trafficMultiplier = ((da + dr) / 2) * 100;
    const organicTraffic = Math.floor(trafficMultiplier + (seed * 50));

    // Referring domains correlates with traffic
    const referringDomains = Math.floor(organicTraffic / 10 + seed);

    // Spam score inversely correlates with DA
    const spamScore = Math.max(1, Math.min(30, 50 - (da / 2) + (seed % 10)));

    // Trust and citation flow
    const trustFlow = Math.min(70, Math.max(10, da - 5 + (seed % 15)));
    const citationFlow = Math.min(75, Math.max(15, dr + (seed % 20)));

    return {
        domainAuthority: Math.round(da),
        domainRating: Math.round(dr),
        organicTraffic,
        referringDomains,
        spamScore: Math.round(spamScore),
        trustFlow: Math.round(trustFlow),
        citationFlow: Math.round(citationFlow),
        source: 'simulated',
        updatedAt: new Date()
    };
}

// Real Moz API integration (for future use)
async function fetchMozMetrics(domain: string): Promise<DomainMetrics | null> {
    const accessId = process.env.MOZ_ACCESS_ID;
    const secretKey = process.env.MOZ_SECRET_KEY;

    if (!accessId || !secretKey) {
        console.log('Moz API credentials not configured, using simulated data');
        return null;
    }

    try {
        const auth = Buffer.from(`${accessId}:${secretKey}`).toString('base64');
        const response = await fetch('https://lsapi.seomoz.com/v2/url_metrics', {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${auth}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                targets: [domain]
            })
        });

        if (!response.ok) {
            throw new Error(`Moz API error: ${response.status}`);
        }

        const data = await response.json() as any;
        const result = data.results?.[0];

        if (!result) {
            return null;
        }

        return {
            domainAuthority: Math.round(result.domain_authority || 0),
            domainRating: Math.round(result.domain_authority || 0), // Moz doesn't have DR
            organicTraffic: 0, // Not available from Moz
            referringDomains: result.linking_root_domains || 0,
            spamScore: Math.round(result.spam_score || 0),
            trustFlow: 0,
            citationFlow: 0,
            source: 'moz',
            updatedAt: new Date()
        };
    } catch (error) {
        console.error('Moz API error:', error);
        return null;
    }
}

/**
 * Get metrics for a domain
 * Tries real API first if configured, falls back to simulated
 */
export async function getDomainMetrics(domain: string): Promise<DomainMetrics> {
    // Try Moz API first if configured
    if (process.env.MOZ_ACCESS_ID && process.env.MOZ_SECRET_KEY) {
        const mozMetrics = await fetchMozMetrics(domain);
        if (mozMetrics) return mozMetrics;
    }

    // Fall back to simulated metrics
    return generateSimulatedMetrics(domain);
}

/**
 * Update metrics for a single website in the database
 */
export async function updateWebsiteMetrics(websiteId: string): Promise<MetricsUpdateResult> {
    try {
        // Get website domain
        const websiteResult = await sql`
            SELECT id, domain FROM websites WHERE id = ${websiteId}
        `;

        if (websiteResult.rows.length === 0) {
            return {
                websiteId,
                domain: '',
                success: false,
                error: 'Website not found'
            };
        }

        const website = websiteResult.rows[0] as { id: string; domain: string };
        const metrics = await getDomainMetrics(website.domain);

        // Update website with new metrics
        await sql`
            UPDATE websites SET
                domain_authority = ${metrics.domainAuthority},
                domain_rating = ${metrics.domainRating},
                organic_traffic = ${metrics.organicTraffic},
                referring_domains = ${metrics.referringDomains},
                spam_score = ${metrics.spamScore},
                trust_flow = ${metrics.trustFlow},
                citation_flow = ${metrics.citationFlow},
                metrics_source = ${metrics.source},
                metrics_updated_at = NOW(),
                updated_at = NOW()
            WHERE id = ${websiteId}
        `;

        return {
            websiteId,
            domain: website.domain,
            success: true,
            metrics
        };
    } catch (error) {
        console.error('Error updating website metrics:', error);
        return {
            websiteId,
            domain: '',
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        };
    }
}

/**
 * Update metrics for all active websites
 * Returns summary of updates
 */
export async function updateAllMetrics(batchSize: number = 50): Promise<{
    total: number;
    successful: number;
    failed: number;
    results: MetricsUpdateResult[];
}> {
    // Get all active websites
    const websitesResult = await sql`
        SELECT id, domain FROM websites 
        WHERE is_active = true
        ORDER BY metrics_updated_at ASC NULLS FIRST
        LIMIT ${batchSize}
    `;

    const results: MetricsUpdateResult[] = [];
    let successful = 0;
    let failed = 0;

    for (const website of websitesResult.rows as { id: string; domain: string }[]) {
        const result = await updateWebsiteMetrics(website.id);
        results.push(result);

        if (result.success) {
            successful++;
        } else {
            failed++;
        }

        // Small delay to avoid rate limiting if using real API
        if (process.env.MOZ_ACCESS_ID) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
    }

    return {
        total: websitesResult.rows.length,
        successful,
        failed,
        results
    };
}

/**
 * Get metrics freshness status
 */
export async function getMetricsFreshness(): Promise<{
    total: number;
    fresh: number;      // Updated within 24 hours
    stale: number;      // Updated 1-7 days ago
    outdated: number;   // Older than 7 days or never updated
}> {
    const result = await sql`
        SELECT 
            COUNT(*) as total,
            COUNT(CASE WHEN metrics_updated_at > NOW() - INTERVAL '24 hours' THEN 1 END) as fresh,
            COUNT(CASE WHEN metrics_updated_at > NOW() - INTERVAL '7 days' 
                        AND metrics_updated_at <= NOW() - INTERVAL '24 hours' THEN 1 END) as stale,
            COUNT(CASE WHEN metrics_updated_at IS NULL 
                        OR metrics_updated_at <= NOW() - INTERVAL '7 days' THEN 1 END) as outdated
        FROM websites
        WHERE is_active = true
    `;

    const stats = result.rows[0] as { total: string; fresh: string; stale: string; outdated: string };

    return {
        total: parseInt(stats.total),
        fresh: parseInt(stats.fresh),
        stale: parseInt(stats.stale),
        outdated: parseInt(stats.outdated)
    };
}
