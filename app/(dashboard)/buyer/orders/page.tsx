import { sql } from '@/lib/db';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import BuyerOrdersClient from '@/components/dashboard/buyer-orders-client';

async function getSession() {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get('auth_session')?.value;
    if (!sessionId) return null;
    const result = await sql`
    SELECT s.*, u.* FROM sessions s
    JOIN users u ON s.user_id = u.id
    WHERE s.id = ${sessionId} AND s.expires_at > NOW()
  `;
    return result.rows[0] || null;
}

interface Order {
    id: string;
    order_type: string;
    status: string;
    total_amount: number;
    created_at: string;
    deadline_at: string | null;
    completed_at: string | null;
    article_url: string | null;
    anchor_text: string;
    target_url: string;
    website_domain: string;
    website_da: number;
    website_dr: number;
    buyer_rating: number | null;
    link_verified: boolean | null;
    link_verified_at: string | null;
    publisher_name: string;
    publisher_email: string;
}

async function getBuyerOrders(userId: string) {
    try {
        const result = await sql`
            SELECT 
                o.id, o.order_type, o.status, o.total_amount, o.created_at, 
                o.deadline_at, o.completed_at, o.article_url, o.anchor_text, o.target_url,
                o.buyer_rating, o.link_verified, o.link_verified_at,
                w.domain as website_domain, w.domain_authority as website_da, w.domain_rating as website_dr,
                p.name as publisher_name, p.email as publisher_email
            FROM orders o
            JOIN websites w ON o.website_id = w.id
            JOIN users p ON o.publisher_id = p.id
            WHERE o.buyer_id = ${userId}
            ORDER BY o.created_at DESC
        `;
        return result.rows as unknown as Order[];
    } catch (error) {
        console.error('Error fetching buyer orders:', error);
        return [];
    }
}

interface PageProps {
    searchParams: Promise<{ status?: string }>;
}

export default async function BuyerOrdersPage({ searchParams }: PageProps) {
    const session = await getSession();
    const params = await searchParams;
    const statusFilter = params.status || 'all';

    if (!session) {
        return (
            <div className="text-center py-12">
                <p>Please log in to view your orders.</p>
                <Link href="/login"><Button className="mt-4">Login</Button></Link>
            </div>
        );
    }

    const orders = await getBuyerOrders(session.user_id as string);

    return <BuyerOrdersClient initialOrders={orders} initialStatusFilter={statusFilter} />;
}
