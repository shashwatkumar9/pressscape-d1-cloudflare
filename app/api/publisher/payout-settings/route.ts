export const runtime = "edge";

import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { initializeDatabaseFromContext } from '@/lib/cloudflare';
import { validateRequest } from '@/lib/auth';
import { z } from 'zod';



const payoutSettingsSchema = z.object({
    payoutMethod: z.enum(['paypal', 'payoneer']),
    paypalEmail: z.string().email().optional(),
    payoneerEmail: z.string().email().optional(),
});

export async function GET(request: NextRequest) {
    try {
        // Initialize D1 database
        await initializeDatabaseFromContext();
        const now = new Date().toISOString();

        const { user } = await validateRequest();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const result = await sql`
            SELECT *
            FROM payout_settings
            WHERE user_id = ${user.id}
        `;

        return NextResponse.json({
            settings: result.rows[0] || null,
        });
    } catch (error) {
        console.error('Get payout settings error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch payout settings' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        // Initialize D1 database
        await initializeDatabaseFromContext();
        const now = new Date().toISOString();

        const { user } = await validateRequest();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json() as any;
        const result = payoutSettingsSchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json(
                { error: 'Invalid request', details: result.error.issues },
                { status: 400 }
            );
        }

        const { payoutMethod, paypalEmail, payoneerEmail } = result.data;

        // Validate that the appropriate email is provided
        if (payoutMethod === 'paypal' && !paypalEmail) {
            return NextResponse.json(
                { error: 'PayPal email is required' },
                { status: 400 }
            );
        }

        if (payoutMethod === 'payoneer' && !payoneerEmail) {
            return NextResponse.json(
                { error: 'Payoneer email is required' },
                { status: 400 }
            );
        }

        // Upsert payout settings
        await sql`
            INSERT INTO payout_settings (
                user_id, payout_method, paypal_email, payoneer_email, updated_at
            )
            VALUES (
                ${user.id}, ${payoutMethod}, ${paypalEmail || null}, ${payoneerEmail || null}, NOW()
            )
            ON CONFLICT (user_id)
            DO UPDATE SET
                payout_method = ${payoutMethod},
                paypal_email = ${paypalEmail || null},
                payoneer_email = ${payoneerEmail || null},
                updated_at = ${now}
        `;

        return NextResponse.json({
            success: true,
            message: 'Payout settings saved successfully',
        });
    } catch (error) {
        console.error('Save payout settings error:', error);
        return NextResponse.json(
            { error: 'Failed to save payout settings' },
            { status: 500 }
        );
    }
}
