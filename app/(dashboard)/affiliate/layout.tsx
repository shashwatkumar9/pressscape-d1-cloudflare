import { redirect } from 'next/navigation';
import { validateRequest } from '@/lib/auth';
import { sql } from '@/lib/db';
import { DashboardHeader } from '@/components/dashboard/header';
import { DashboardSidebar } from '@/components/dashboard/sidebar';

export default async function AffiliateLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, session } = await validateRequest();

    if (!session || !user) {
        redirect('/login');
    }

    // Fetch user roles from database
    const userResult = await sql`
        SELECT is_buyer, is_publisher, is_affiliate FROM users WHERE id = ${user.id}
    `;
    const userData = userResult.rows[0] as {
        is_buyer: boolean;
        is_publisher: boolean;
        is_affiliate: boolean;
    } | undefined;

    // If not an affiliate, redirect to join page
    if (!userData?.is_affiliate) {
        redirect('/affiliate/join');
    }

    const headerUser = {
        name: user.name || 'User',
        email: user.email || '',
        avatarUrl: undefined,
        isBuyer: userData?.is_buyer || false,
        isPublisher: userData?.is_publisher || false,
        isAffiliate: userData?.is_affiliate || false,
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <DashboardHeader user={headerUser} currentRole="affiliate" />
            <DashboardSidebar role="affiliate" />
            <main className="lg:pl-64 pt-16">
                <div className="p-6">
                    {children}
                </div>
            </main>
        </div>
    );
}
