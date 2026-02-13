export const runtime = "edge";

import { NextRequest, NextResponse } from 'next/server';
import { validateAdminRequest } from '@/lib/admin-auth';
import { updateWebsiteMetrics, updateAllMetrics, getMetricsFreshness } from '@/lib/metrics';
import { initializeDatabaseFromContext } from '@/lib/cloudflare';



/**
 * POST /api/admin/metrics/update
 * Update metrics for websites
 * 
 * Query params:
 * - websiteId: Update single website
 * - batchSize: Number of websites to update in batch (default: 50)
 */
export async function POST(request: NextRequest) {
    try {
        // Initialize D1 database
        await initializeDatabaseFromContext();

        // Verify admin session
        const { admin } = await validateAdminRequest();
        if (!admin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const websiteId = searchParams.get('websiteId');
        const batchSize = parseInt(searchParams.get('batchSize') || '50');

        if (websiteId) {
            // Update single website
            const result = await updateWebsiteMetrics(websiteId);

            if (!result.success) {
                return NextResponse.json({
                    error: result.error || 'Failed to update metrics'
                }, { status: 400 });
            }

            return NextResponse.json({
                message: 'Metrics updated successfully',
                result
            });
        } else {
            // Batch update
            const results = await updateAllMetrics(batchSize);

            return NextResponse.json({
                message: `Updated metrics for ${results.successful} websites`,
                ...results
            });
        }
    } catch (error) {
        console.error('Error updating metrics:', error);
        return NextResponse.json({
            error: 'Failed to update metrics'
        }, { status: 500 });
    }
}

/**
 * GET /api/admin/metrics/update
 * Get metrics freshness status
 */
export async function GET() {
    try {
        // Initialize D1 database
        await initializeDatabaseFromContext();

        const { admin } = await validateAdminRequest();
        if (!admin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const freshness = await getMetricsFreshness();

        return NextResponse.json({
            freshness,
            recommendation: freshness.outdated > 10
                ? 'Consider running a batch update'
                : 'Metrics are up to date'
        });
    } catch (error) {
        console.error('Error getting metrics status:', error);
        return NextResponse.json({
            error: 'Failed to get metrics status'
        }, { status: 500 });
    }
}
