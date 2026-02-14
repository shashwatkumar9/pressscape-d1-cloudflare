export const runtime = 'edge';

import { sql } from '@/lib/db';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    ArrowLeft,
    Globe,
    FileText,
    Link2,
    Calendar,
    DollarSign,
    Clock,
    CheckCircle,
    ExternalLink,
    User,
} from 'lucide-react';
import BuyerOrderActions from '@/components/orders/buyer-order-actions';
import MessageButton from '@/components/messaging/message-button';

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

async function getOrderDetails(orderId: string, buyerId: string) {
    const result = await sql`
        SELECT 
            o.*,
            w.domain as website_domain,
            w.domain_authority as website_da,
            w.domain_rating as website_dr,
            p.name as publisher_name,
            p.email as publisher_email
        FROM orders o
        JOIN websites w ON o.website_id = w.id
        JOIN users p ON o.publisher_id = p.id
        WHERE o.id = ${orderId} AND o.buyer_id = ${buyerId}
    `;
    return result.rows[0] || null;
}

const statusConfig: Record<string, { label: string; color: string; bgColor: string }> = {
    pending: { label: 'Pending', color: 'text-yellow-700', bgColor: 'bg-yellow-100' },
    accepted: { label: 'Accepted', color: 'text-blue-700', bgColor: 'bg-blue-100' },
    writing: { label: 'Writing', color: 'text-blue-700', bgColor: 'bg-blue-100' },
    content_submitted: { label: 'Content Submitted', color: 'text-purple-700', bgColor: 'bg-purple-100' },
    revision_needed: { label: 'Revision Needed', color: 'text-orange-700', bgColor: 'bg-orange-100' },
    approved: { label: 'Approved', color: 'text-indigo-700', bgColor: 'bg-indigo-100' },
    published: { label: 'Published - Review Required', color: 'text-violet-700', bgColor: 'bg-violet-100' },
    completed: { label: 'Completed', color: 'text-green-700', bgColor: 'bg-green-100' },
    cancelled: { label: 'Cancelled', color: 'text-gray-700', bgColor: 'bg-gray-100' },
    disputed: { label: 'Disputed', color: 'text-red-700', bgColor: 'bg-red-100' },
};

const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const day = String(date.getDate()).padStart(2, '0');
    const month = date.toLocaleString('en-US', { month: 'short' });
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
};

export default async function BuyerOrderDetailPage({
    params,
}: {
    params: Promise<{ orderId: string }>;
}) {
    const session = await getSession();
    if (!session) {
        redirect('/login');
    }

    const { orderId } = await params;
    const order = await getOrderDetails(orderId, session.user_id as string);

    if (!order) {
        redirect('/buyer/orders');
    }

    const status = statusConfig[order.status as string] || statusConfig.pending;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link href="/buyer/orders">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                </Link>
                <div className="flex-1">
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-bold text-gray-900">
                            Order {order.order_number as string}
                        </h1>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${status.color} ${status.bgColor}`}>
                            {status.label}
                        </span>
                    </div>
                    <p className="text-gray-500 mt-1">
                        Placed on {formatDate(order.created_at as string)}
                    </p>
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Order Details */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="w-5 h-5 text-violet-600" />
                                Order Details
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid sm:grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-gray-500">Order Type</p>
                                    <p className="font-medium text-gray-900 capitalize">
                                        {(order.order_type as string).replace('_', ' ')}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Content Source</p>
                                    <p className="font-medium text-gray-900 capitalize">
                                        {(order.content_source as string).replace('_', ' ')}
                                    </p>
                                </div>
                            </div>

                            <div className="border-t pt-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <Globe className="w-4 h-4 text-gray-400" />
                                    <p className="text-sm text-gray-500">Website</p>
                                </div>
                                <p className="font-medium text-gray-900">{order.website_domain as string}</p>
                                <div className="flex gap-4 text-sm text-gray-500 mt-1">
                                    <span>DA: {order.website_da as number}</span>
                                    <span>DR: {order.website_dr as number}</span>
                                </div>
                            </div>

                            {order.article_title && (
                                <div className="border-t pt-4">
                                    <p className="text-sm text-gray-500">Article Title</p>
                                    <p className="font-medium text-gray-900">{order.article_title as string}</p>
                                </div>
                            )}

                            <div className="border-t pt-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <Link2 className="w-4 h-4 text-gray-400" />
                                    <p className="text-sm text-gray-500">Backlink Details</p>
                                </div>
                                <div className="bg-gray-50 p-3 rounded-lg space-y-2">
                                    <div>
                                        <span className="text-sm text-gray-500">Anchor Text:</span>
                                        <span className="ml-2 font-medium">{order.anchor_text as string}</span>
                                    </div>
                                    <div>
                                        <span className="text-sm text-gray-500">Target URL:</span>
                                        <a
                                            href={order.target_url as string}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="ml-2 text-violet-600 hover:underline text-sm break-all"
                                        >
                                            {order.target_url as string}
                                        </a>
                                    </div>
                                </div>
                            </div>

                            {order.article_url && (
                                <div className="border-t pt-4">
                                    <p className="text-sm text-gray-500 mb-2">Published Article</p>
                                    <a
                                        href={order.article_url as string}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 text-violet-600 hover:underline"
                                    >
                                        <ExternalLink className="w-4 h-4" />
                                        View Published Article
                                    </a>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Buyer Actions (Confirm/Reject for published orders) */}
                    <BuyerOrderActions
                        orderId={order.id as string}
                        currentStatus={order.status as string}
                        articleUrl={order.article_url as string | null}
                        confirmationDeadline={order.buyer_confirmation_deadline as string | null}
                        rejectionReason={order.buyer_rejection_reason as string | null}
                    />
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Publisher Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base flex items-center gap-2">
                                <User className="w-5 h-5 text-violet-600" />
                                Publisher Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div>
                                <p className="font-medium text-gray-900">{order.publisher_name as string}</p>
                                <p className="text-sm text-gray-500">{order.publisher_email as string}</p>
                            </div>
                            <MessageButton
                                orderId={order.id as string}
                                label="Message Publisher"
                                variant="outline"
                                size="sm"
                                className="w-full"
                            />
                        </CardContent>
                    </Card>

                    {/* Payment Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base flex items-center gap-2">
                                <DollarSign className="w-5 h-5 text-emerald-600" />
                                Payment
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-gray-900 mb-1">
                                ${((order.total_amount as number) / 100).toFixed(2)}
                            </div>
                            <p className="text-sm text-gray-500 mb-3">Total Amount Paid</p>

                            {(order.writing_fee as number) > 0 && (
                                <div className="text-sm text-gray-600 mb-3">
                                    <div className="flex justify-between">
                                        <span>Content Writing Service</span>
                                        <span>+${((order.writing_fee as number) / 100).toFixed(2)}</span>
                                    </div>
                                </div>
                            )}

                            <div className="pt-3 border-t">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${order.payment_status === 'released'
                                    ? 'bg-green-100 text-green-700'
                                    : order.payment_status === 'paid'
                                        ? 'bg-blue-100 text-blue-700'
                                        : 'bg-gray-100 text-gray-700'
                                    }`}>
                                    {(order.payment_status as string).charAt(0).toUpperCase() + (order.payment_status as string).slice(1)}
                                </span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Timeline */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base flex items-center gap-2">
                                <Clock className="w-5 h-5 text-violet-600" />
                                Timeline
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-500">Created</span>
                                <span className="text-gray-900">{formatDate(order.created_at as string)}</span>
                            </div>
                            {order.accepted_at && (
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Accepted</span>
                                    <span className="text-gray-900">{formatDate(order.accepted_at as string)}</span>
                                </div>
                            )}
                            {order.published_at && (
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Published</span>
                                    <span className="text-gray-900">{formatDate(order.published_at as string)}</span>
                                </div>
                            )}
                            {order.completed_at && (
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Completed</span>
                                    <span className="text-gray-900">{formatDate(order.completed_at as string)}</span>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
