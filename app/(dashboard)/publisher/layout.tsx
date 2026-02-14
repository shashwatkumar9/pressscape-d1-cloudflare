export const runtime = 'edge';

import { redirect } from 'next/navigation';
import { validateRequest } from '@/lib/auth';
import { sql } from '@/lib/db';
import { DashboardHeader } from '@/components/dashboard/header';
import { DashboardSidebar } from '@/components/dashboard/sidebar';
import { Footer } from '@/components/layouts/footer';

export default async function PublisherLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, session } = await validateRequest();

    if (!session || !user) {
        redirect('/login');
    }

    // Fetch real role flags from database
    const userResult = await sql`
        SELECT is_buyer, is_publisher, is_affiliate FROM users WHERE id = ${user.id}
    `;
    const userData = userResult.rows[0] as {
        is_buyer: boolean;
        is_publisher: boolean;
        is_affiliate: boolean;
    } | undefined;

    const headerUser = {
        name: user.name || 'User',
        email: user.email || '',
        avatarUrl: undefined,
        isBuyer: userData?.is_buyer || false,
        isPublisher: userData?.is_publisher || false,
        isAffiliate: userData?.is_affiliate || false,
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <DashboardHeader user={headerUser} currentRole="publisher" />
            <DashboardSidebar role="publisher" />
            <main className="lg:pl-64 pt-16 flex-1 flex flex-col">
                <div className="p-6 flex-1">
                    {children}
                </div>
                <div className="mt-auto">
                    <Footer />
                </div>
            </main>
        </div>
    );
}
