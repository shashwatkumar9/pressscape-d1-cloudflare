import { sql } from '@/lib/db';
import { cookies } from 'next/headers';
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import PublisherOrderActions from '@/components/orders/publisher-order-actions';
import {
    ArrowLeft,
    User,
    Globe,
    FileText,
    Link2,
    Calendar,
    DollarSign,
    Clock,
    CheckCircle,
    XCircle,
    AlertCircle,
    ExternalLink,
} from 'lucide-react';
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

async function getOrderDetails(orderId: string, publisherId: string) {
    const result = await sql`
        SELECT 
            o.*,
            w.domain as website_domain,
            w.domain_authority as website_da,
            w.domain_rating as website_dr,
            b.name as buyer_name,
            b.email as buyer_email
        FROM orders o
        JOIN websites w ON o.website_id = w.id
        JOIN users b ON o.buyer_id = b.id
        WHERE o.id = ${orderId} AND o.publisher_id = ${publisherId}
    `;
    return result.rows[0] || null;
}

const statusConfig: Record<string, { label: string; color: string; bgColor: string; icon: any }> = {
    pending: { label: 'Pending Acceptance', color: 'text-yellow-700', bgColor: 'bg-yellow-100', icon: Clock },
    accepted: { label: 'Accepted', color: 'text-blue-700', bgColor: 'bg-blue-100', icon: CheckCircle },
    writing: { label: 'Writing in Progress', color: 'text-blue-700', bgColor: 'bg-blue-100', icon: FileText },
    content_submitted: { label: 'Content Submitted', color: 'text-purple-700', bgColor: 'bg-purple-100', icon: AlertCircle },
    revision_needed: { label: 'Revision Requested', color: 'text-orange-700', bgColor: 'bg-orange-100', icon: AlertCircle },
    approved: { label: 'Approved - Ready to Publish', color: 'text-indigo-700', bgColor: 'bg-indigo-100', icon: CheckCircle },
    published: { label: 'Published', color: 'text-green-700', bgColor: 'bg-green-100', icon: CheckCircle },
    completed: { label: 'Completed', color: 'text-green-700', bgColor: 'bg-green-100', icon: CheckCircle },
    cancelled: { label: 'Cancelled', color: 'text-red-700', bgColor: 'bg-red-100', icon: XCircle },
    refunded: { label: 'Refunded', color: 'text-gray-700', bgColor: 'bg-gray-100', icon: XCircle },
    disputed: { label: 'Disputed', color: 'text-red-700', bgColor: 'bg-red-100', icon: AlertCircle },
};

interface PageProps {
    params: Promise<{ orderId: string }>;
}

export default async function PublisherOrderDetailPage({ params }: PageProps) {
    const session = await getSession();
    const { orderId } = await params;

    if (!session) {
        redirect('/login');
    }

    const order = await getOrderDetails(orderId, session.user_id as string);

    if (!order) {
        notFound();
    }

    const status = statusConfig[order.status as string] || statusConfig.pending;
    const StatusIcon = status.icon;

    const formatCurrency = (cents: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(cents / 100);
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link href="/publisher/orders">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                </Link>
                <div className="flex-1">
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-bold text-gray-900">
                            Order #{(order.order_number as string) || (order.id as string).slice(0, 8)}
                        </h1>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1.5 ${status.bgColor} ${status.color}`}>
                            <StatusIcon className="w-4 h-4" />
                            {status.label}
                        </span>
                    </div>
                    <p className="text-gray-600 mt-1">
                        {(order.order_type as string).replace('_', ' ')} on {order.website_domain as string}
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Order Details */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="w-5 h-5" />
                                Order Details
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {order.article_title && (
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Article Title</label>
                                    <p className="mt-1 text-gray-900 font-medium">{order.article_title as string}</p>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Anchor Text</label>
                                    <p className="mt-1 text-gray-900">"{order.anchor_text as string}"</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Target URL</label>
                                    <a
                                        href={order.target_url as string}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="mt-1 text-violet-600 hover:underline flex items-center gap-1"
                                    >
                                        {(order.target_url as string).substring(0, 40)}...
                                        <ExternalLink className="w-3 h-3" />
                                    </a>
                                </div>
                            </div>

                            {order.buyer_notes && (
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Buyer Notes</label>
                                    <p className="mt-1 text-gray-900 bg-gray-50 p-3 rounded-lg">{order.buyer_notes as string}</p>
                                </div>
                            )}

                            {order.article_content && (
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Article Content</label>
                                    <div
                                        className="mt-2 prose prose-sm max-w-none bg-gray-50 p-4 rounded-lg border"
                                        dangerouslySetInnerHTML={{ __html: order.article_content as string }}
                                    />
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Published Article */}
                    {order.article_url && (
                        <Card className="bg-green-50 border-green-200">
                            <CardContent className="pt-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                        <CheckCircle className="w-5 h-5 text-green-600" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-medium text-green-800">Article Published</p>
                                        <a
                                            href={order.article_url as string}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-sm text-green-600 hover:underline flex items-center gap-1"
                                        >
                                            {order.article_url as string}
                                            <ExternalLink className="w-3 h-3" />
                                        </a>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Actions Component */}
                    <PublisherOrderActions
                        orderId={order.id as string}
                        currentStatus={order.status as string}
                        articleUrl={order.article_url as string | null}
                        rejectionReason={order.buyer_rejection_reason as string | null}
                    />
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Buyer Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base flex items-center gap-2">
                                <User className="w-4 h-4" />
                                Buyer Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div>
                                <p className="font-medium text-gray-900">{order.buyer_name as string}</p>
                                <p className="text-sm text-gray-500">{order.buyer_email as string}</p>
                            </div>
                            <MessageButton
                                orderId={order.id as string}
                                label="Message Buyer"
                                variant="outline"
                                size="sm"
                                className="w-full"
                            />
                        </CardContent>
                    </Card>

                    {/* Website Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base flex items-center gap-2">
                                <Globe className="w-4 h-4" />
                                Website
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <p className="font-medium text-gray-900">{order.website_domain as string}</p>
                            <div className="flex gap-4 text-sm">
                                <span className="text-gray-600">DA: <strong>{order.website_da as number}</strong></span>
                                {order.website_dr && (
                                    <span className="text-gray-600">DR: <strong>{order.website_dr as number}</strong></span>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Earnings */}
                    <Card className="bg-emerald-50 border-emerald-200">
                        <CardHeader>
                            <CardTitle className="text-base flex items-center gap-2 text-emerald-800">
                                <DollarSign className="w-4 h-4" />
                                Your Earnings
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-3xl font-bold text-emerald-600">
                                {formatCurrency(order.publisher_earnings as number)}
                            </p>
                            <p className="text-sm text-emerald-700 mt-1">
                                {order.status === 'completed' || order.status === 'published'
                                    ? 'Released to your wallet'
                                    : 'Will be released upon completion'}
                            </p>
                        </CardContent>
                    </Card>

                    {/* Timeline */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                Timeline
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-500">Ordered</span>
                                <span className="text-gray-900">{formatDate(order.created_at as string)}</span>
                            </div>
                            {order.deadline_at && (
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Deadline</span>
                                    <span className="text-gray-900">{formatDate(order.deadline_at as string)}</span>
                                </div>
                            )}
                            {order.accepted_at && (
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Accepted</span>
                                    <span className="text-gray-900">{formatDate(order.accepted_at as string)}</span>
                                </div>
                            )}
                            {order.published_at && (
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Published</span>
                                    <span className="text-green-600 font-medium">{formatDate(order.published_at as string)}</span>
                                </div>
                            )}
                            {order.completed_at && (
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Completed</span>
                                    <span className="text-green-600 font-medium">{formatDate(order.completed_at as string)}</span>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
