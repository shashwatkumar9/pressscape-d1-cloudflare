import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const response = NextResponse.next();

    // Check for affiliate referral code in URL
    const ref = request.nextUrl.searchParams.get('ref');

    if (ref) {
        // Set affiliate cookie for 15 days (actual tracking duration)
        response.cookies.set('affiliate_ref', ref, {
            maxAge: 60 * 60 * 24 * 15, // 15 days in seconds
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
        });
    }

    return response;
}

// Only run middleware on pages that might have referral links
export const config = {
    matcher: [
        '/',
        '/signup',
        '/login',
        '/marketplace',
        '/marketplace/:path*',
        '/affiliate/:path*',
    ],
};
