'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import ReviewModal from '@/components/reviews/review-modal';
import {
    PackageOpen,
    Clock,
    CheckCircle,
    XCircle,
    Globe,
    FileText,
    MessageSquare,
    ExternalLink,
    ChevronRight,
    AlertCircle,
    Star,
    Link2,
    Loader2,
    RefreshCw,
} from 'lucide-react';

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

interface BuyerOrdersClientProps {
    initialOrders: Order[];
    initialStatusFilter?: string;
}

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
    pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
    accepted: { label: 'In Progress', color: 'bg-blue-100 text-blue-700', icon: FileText },
    writing: { label: 'In Progress', color: 'bg-blue-100 text-blue-700', icon: FileText },
    content_submitted: { label: 'Review Content', color: 'bg-purple-100 text-purple-700', icon: AlertCircle },
    revision_needed: { label: 'Revision', color: 'bg-orange-100 text-orange-700', icon: AlertCircle },
    approved: { label: 'Processing', color: 'bg-indigo-100 text-indigo-700', icon: Clock },
    published: { label: 'Review Published', color: 'bg-violet-100 text-violet-700', icon: Star },
    completed: { label: 'Completed', color: 'bg-green-100 text-green-700', icon: CheckCircle },
    cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-700', icon: XCircle },
    refunded: { label: 'Refunded', color: 'bg-gray-100 text-gray-700', icon: XCircle },
    disputed: { label: 'Disputed', color: 'bg-red-100 text-red-700', icon: AlertCircle },
};

// Use consistent date format to avoid hydration errors
const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = date.toLocaleString('en-US', { month: 'short' });
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
};

// Filter configuration matching dashboard status cards
const filterTabs = [
    { key: 'all', label: 'All Orders', icon: PackageOpen, statuses: null },
    { key: 'action_required', label: 'Action Required', icon: Star, statuses: ['content_submitted', 'published'] }, // Review needed
    { key: 'in_progress', label: 'In Progress', icon: Loader2, statuses: ['accepted', 'writing', 'revision_needed', 'approved'] },
    { key: 'pending', label: 'Not Started', icon: Clock, statuses: ['pending'] },
    { key: 'completed', label: 'Completed', icon: CheckCircle, statuses: ['completed'] },
    { key: 'rejected', label: 'Rejected', icon: XCircle, statuses: ['cancelled', 'refunded', 'disputed'] },
];

export default function BuyerOrdersClient({ initialOrders, initialStatusFilter = 'all' }: BuyerOrdersClientProps) {
    const router = useRouter();
    const [orders, setOrders] = useState(initialOrders);
    const [activeFilter, setActiveFilter] = useState(initialStatusFilter);
    const [reviewModalOrder, setReviewModalOrder] = useState<Order | null>(null);
    const [verifyingOrderId, setVerifyingOrderId] = useState<string | null>(null);

    // Filter orders based on active filter
    const filteredOrders = useMemo(() => {
        const currentTab = filterTabs.find(tab => tab.key === activeFilter);
        if (!currentTab || !currentTab.statuses) {
            return orders; // 'all' filter
        }
        return orders.filter(order => currentTab.statuses!.includes(order.status));
    }, [orders, activeFilter]);

    // Get counts for each filter tab
    const filterCounts = useMemo(() => {
        return filterTabs.reduce((acc, tab) => {
            if (!tab.statuses) {
                acc[tab.key] = orders.length;
            } else {
                acc[tab.key] = orders.filter(order => tab.statuses!.includes(order.status)).length;
            }
            return acc;
        }, {} as Record<string, number>);
    }, [orders]);

    const handleFilterChange = (filterKey: string) => {
        setActiveFilter(filterKey);
        // Update URL without full page reload
        const url = filterKey === 'all' ? '/buyer/orders' : `/buyer/orders?status=${filterKey}`;
        router.push(url, { scroll: false });
    };

    const formatCurrency = (cents: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(cents / 100);
    };

    const handleReviewSuccess = () => {
        // Update the order to show it's been reviewed
        if (reviewModalOrder) {
            setOrders(orders.map(o =>
                o.id === reviewModalOrder.id
                    ? { ...o, buyer_rating: 5 } // Mark as reviewed
                    : o
            ));
        }
        setReviewModalOrder(null);
    };

    const handleVerifyLink = async (orderId: string) => {
        setVerifyingOrderId(orderId);
        try {
            const res = await fetch(`/api/orders/${orderId}/verify`, { method: 'POST' });
            const data = await res.json() as any;
            if (res.ok) {
                setOrders(orders.map(o =>
                    o.id === orderId
                        ? { ...o, link_verified: data.verified, link_verified_at: new Date().toISOString() }
                        : o
                ));
            }
        } catch (error) {
            console.error('Error verifying link:', error);
        } finally {
            setVerifyingOrderId(null);
        }
    };

    const activeOrders = orders.filter(o => ['pending', 'accepted', 'writing', 'content_submitted', 'revision_needed', 'approved', 'published'].includes(o.status));
    const completedOrders = orders.filter(o => ['completed'].includes(o.status));
    const reviewOrders = orders.filter(o => ['content_submitted', 'published'].includes(o.status));

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
                    <p className="text-gray-600 mt-1">Track your guest post and link insertion orders</p>
                </div>
                <Link href="/marketplace">
                    <Button className="gap-2">
                        <Globe className="w-4 h-4" />
                        Browse Marketplace
                    </Button>
                </Link>
            </div>

            {/* Filter Tabs */}
            <div className="flex flex-wrap gap-2 p-1 bg-gray-100 rounded-xl">
                {filterTabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeFilter === tab.key;
                    const count = filterCounts[tab.key];

                    return (
                        <button
                            key={tab.key}
                            onClick={() => handleFilterChange(tab.key)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${isActive
                                ? 'bg-white text-gray-900 shadow-sm'
                                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                }`}
                        >
                            <Icon className={`w-4 h-4 ${tab.key === 'in_progress' && isActive ? '' : ''}`} />
                            <span>{tab.label}</span>
                            <span className={`px-1.5 py-0.5 rounded-full text-xs ${isActive ? 'bg-violet-100 text-violet-700' : 'bg-gray-200 text-gray-600'
                                }`}>
                                {count}
                            </span>
                        </button>
                    );
                })}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="pt-4">
                        <div className="text-2xl font-bold text-blue-600">{activeOrders.length}</div>
                        <div className="text-sm text-gray-600">Active Orders</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-4">
                        <div className="text-2xl font-bold text-purple-600">
                            {reviewOrders.length}
                        </div>
                        <div className="text-sm text-gray-600">Awaiting Review</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-4">
                        <div className="text-2xl font-bold text-green-600">{completedOrders.length}</div>
                        <div className="text-sm text-gray-600">Completed</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-4">
                        <div className="text-2xl font-bold text-gray-900">
                            {formatCurrency(orders.reduce((sum, o) => sum + o.total_amount, 0))}
                        </div>
                        <div className="text-sm text-gray-600">Total Spent</div>
                    </CardContent>
                </Card>
            </div>

            {/* Showing filtered results info */}
            {activeFilter !== 'all' && (
                <div className="flex items-center justify-between bg-violet-50 border border-violet-200 rounded-lg px-4 py-2">
                    <span className="text-sm text-violet-700">
                        Showing <strong>{filteredOrders.length}</strong> {filterTabs.find(t => t.key === activeFilter)?.label.toLowerCase()} order{filteredOrders.length !== 1 ? 's' : ''}
                    </span>
                    <button
                        onClick={() => handleFilterChange('all')}
                        className="text-sm text-violet-600 hover:text-violet-800 font-medium"
                    >
                        Clear filter
                    </button>
                </div>
            )}

            {/* Orders List */}
            <div className="space-y-4">
                {filteredOrders.length === 0 ? (
                    <Card>
                        <CardContent className="py-12 text-center">
                            <PackageOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900">
                                {activeFilter === 'all' ? 'No orders yet' : `No ${filterTabs.find(t => t.key === activeFilter)?.label.toLowerCase()} orders`}
                            </h3>
                            <p className="text-gray-500 mt-1">
                                {activeFilter === 'all'
                                    ? 'Start by browsing the marketplace'
                                    : 'Try selecting a different filter'}
                            </p>
                            {activeFilter === 'all' ? (
                                <Link href="/marketplace">
                                    <Button className="mt-4">Find Websites</Button>
                                </Link>
                            ) : (
                                <Button
                                    variant="outline"
                                    className="mt-4"
                                    onClick={() => handleFilterChange('all')}
                                >
                                    View All Orders
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                ) : (
                    filteredOrders.map((order) => {
                        const status = statusConfig[order.status] || { label: order.status, color: 'bg-gray-100', icon: Clock };
                        const StatusIcon = status.icon;
                        const canReview = ['completed', 'published'].includes(order.status) && !order.buyer_rating;
                        const hasReviewed = order.buyer_rating !== null;

                        return (
                            <Card key={order.id} className="hover:shadow-md transition-shadow">
                                <CardContent className="pt-6">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-start gap-4">
                                            <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                                                <PackageOpen className="w-6 h-6 text-blue-600" />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-3">
                                                    <span className="font-mono text-sm text-gray-500">#{order.id.slice(0, 8)}</span>
                                                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1 ${status.color}`}>
                                                        <StatusIcon className="w-3 h-3" />
                                                        {status.label}
                                                    </span>
                                                    {hasReviewed && (
                                                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700 flex items-center gap-1">
                                                            <Star className="w-3 h-3 fill-current" />
                                                            Reviewed
                                                        </span>
                                                    )}
                                                    {order.link_verified === true && (
                                                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 flex items-center gap-1">
                                                            <Link2 className="w-3 h-3" />
                                                            Link Verified
                                                        </span>
                                                    )}
                                                    {order.link_verified === false && (
                                                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700 flex items-center gap-1">
                                                            <XCircle className="w-3 h-3" />
                                                            Link Not Found
                                                        </span>
                                                    )}
                                                </div>
                                                <h3 className="font-semibold text-gray-900 mt-1 capitalize">
                                                    {order.order_type.replace('_', ' ')} on {order.website_domain}
                                                </h3>
                                                <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                                                    <span>DA: {order.website_da}</span>
                                                    <span>DR: {order.website_dr || '-'}</span>
                                                </div>
                                                <div className="mt-1 text-sm text-gray-500">
                                                    <span>Publisher: {order.publisher_name}</span>
                                                    <span className="text-gray-400 ml-1">({order.publisher_email})</span>
                                                </div>

                                                {/* Link Details */}
                                                <div className="mt-3 text-sm">
                                                    <span className="text-gray-500">Anchor:</span>
                                                    <span className="ml-1 text-gray-900">"{order.anchor_text}"</span>
                                                </div>

                                                {/* Timeline */}
                                                <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                                                    <span>Ordered: {formatDate(order.created_at)}</span>
                                                    {order.deadline_at && <span>Due: {formatDate(order.deadline_at)}</span>}
                                                    {order.completed_at && <span className="text-green-600">Completed: {formatDate(order.completed_at)}</span>}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4">
                                            <div className="text-right">
                                                <div className="text-lg font-semibold text-gray-900">
                                                    {formatCurrency(order.total_amount)}
                                                </div>
                                                <div className="text-sm text-gray-500 capitalize">{order.order_type.replace('_', ' ')}</div>
                                            </div>
                                            <Link href={`/buyer/orders/${order.id}`}>
                                                <Button variant="outline" size="sm" className="gap-1">
                                                    View <ChevronRight className="w-4 h-4" />
                                                </Button>
                                            </Link>
                                        </div>
                                    </div>

                                    {/* Actions for review status */}
                                    {order.status === 'content_submitted' && (
                                        <div className="flex items-center gap-3 mt-4 pt-4 border-t">
                                            <Link href={`/buyer/orders/${order.id}`}>
                                                <Button size="sm" className="gap-1">
                                                    <CheckCircle className="w-4 h-4" />
                                                    Review Content
                                                </Button>
                                            </Link>
                                        </div>
                                    )}

                                    {/* Review button for completed orders */}
                                    {canReview && (
                                        <div className="flex items-center gap-3 mt-4 pt-4 border-t">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="gap-1"
                                                onClick={() => setReviewModalOrder(order)}
                                            >
                                                <Star className="w-4 h-4" />
                                                Leave a Review
                                            </Button>
                                            {order.article_url && order.link_verified === null && (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="gap-1"
                                                    onClick={() => handleVerifyLink(order.id)}
                                                    disabled={verifyingOrderId === order.id}
                                                >
                                                    {verifyingOrderId === order.id ? (
                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                    ) : (
                                                        <Link2 className="w-4 h-4" />
                                                    )}
                                                    Verify Link
                                                </Button>
                                            )}
                                        </div>
                                    )}

                                    {order.article_url && (
                                        <div className="flex items-center gap-2 mt-4 pt-4 border-t">
                                            <ExternalLink className="w-4 h-4 text-gray-400" />
                                            <a
                                                href={order.article_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-sm text-violet-600 hover:underline"
                                            >
                                                {order.article_url}
                                            </a>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        );
                    })
                )}
            </div>

            {/* Review Modal */}
            {reviewModalOrder && (
                <ReviewModal
                    orderId={reviewModalOrder.id}
                    websiteDomain={reviewModalOrder.website_domain}
                    onClose={() => setReviewModalOrder(null)}
                    onSuccess={handleReviewSuccess}
                />
            )}
        </div>
    );
}
