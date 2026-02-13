// NOTE: This route uses bcrypt which requires Node.js
// export const runtime = "edge";

import { NextRequest, NextResponse } from 'next/server';
import { sql, generateId, boolToInt, intToBool } from '@/lib/db';
import { initializeDatabaseFromContext } from '@/lib/cloudflare';
import bcrypt from 'bcrypt';
import { createSession } from '@/lib/auth';
import { sendWelcomeEmail } from '@/lib/email';
import { z } from 'zod';
import { generateAffiliateCode } from '@/lib/utils';
import { cookies } from 'next/headers';



const signupSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    roles: z.object({
        buyer: z.boolean(),
        publisher: z.boolean(),
        affiliate: z.boolean(),
    }),
});

export async function POST(request: NextRequest) {
    // Initialize D1 database
    await initializeDatabaseFromContext();

    try {
        const body = await request.json() as any;

        // Validate input
        const result = signupSchema.safeParse(body);
        if (!result.success) {
            return NextResponse.json(
                { error: result.error.issues[0].message },
                { status: 400 }
            );
        }

        const { name, email, password, roles } = result.data;

        // Check if user exists
        const existingUser = await sql`SELECT id FROM users WHERE email = ${email}`;
        if (existingUser.rows.length > 0) {
            return NextResponse.json(
                { error: 'An account with this email already exists' },
                { status: 400 }
            );
        }

        // Hash password
        const passwordHash = await bcrypt.hash(password, 10);

        // Generate affiliate code if affiliate role selected
        const affiliateCode = roles.affiliate ? generateAffiliateCode(name) : null;

        // Check for referral cookie
        const cookieStore = await cookies();
        const referredBy = cookieStore.get('affiliate_ref')?.value;
        let referrerId = null;

        if (referredBy) {
            const referrer = await sql`SELECT id FROM users WHERE affiliate_code = ${referredBy}`;
            if (referrer.rows.length > 0) {
                referrerId = referrer.rows[0].id;
            }
        }

        // Generate user ID
        const userId = generateId();

        // Create user (D1 doesn't support RETURNING, so we insert then fetch)
        await sql`
      INSERT INTO users (
        id, email, password_hash, name,
        is_buyer, is_publisher, is_affiliate,
        affiliate_code, referred_by
      )
      VALUES (
        ${userId}, ${email}, ${passwordHash}, ${name},
        ${boolToInt(roles.buyer)}, ${boolToInt(roles.publisher)}, ${boolToInt(roles.affiliate)},
        ${affiliateCode}, ${referrerId}
      )
    `;

        // Fetch the created user
        const newUser = await sql`
      SELECT id, email, name, is_buyer, is_publisher, is_affiliate
      FROM users WHERE id = ${userId}
    `;

        const dbUser = newUser.rows[0] as any;
        const user = {
            id: dbUser.id,
            email: dbUser.email,
            name: dbUser.name,
            is_buyer: intToBool(dbUser.is_buyer),
            is_publisher: intToBool(dbUser.is_publisher),
            is_affiliate: intToBool(dbUser.is_affiliate),
        };

        // Create affiliate referral record if referred
        if (referrerId) {
            const referralId = generateId();
            await sql`
        INSERT INTO affiliate_referrals (id, affiliate_id, referred_user_id, referral_code)
        VALUES (${referralId}, ${referrerId}, ${user.id}, ${referredBy})
      `;
        }

        // Create session
        await createSession(user.id as string);

        // Send welcome email (non-blocking)
        sendWelcomeEmail(user.email as string, user.name as string).catch(console.error);

        return NextResponse.json({
            success: true,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                isBuyer: user.is_buyer,
                isPublisher: user.is_publisher,
                isAffiliate: user.is_affiliate,
            },
        });
    } catch (error) {
        console.error('Signup error:', error);
        return NextResponse.json(
            { error: 'An error occurred during signup' },
            { status: 500 }
        );
    }
}
