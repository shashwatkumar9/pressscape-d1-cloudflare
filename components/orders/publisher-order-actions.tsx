'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    CheckCircle,
    XCircle,
    Globe,
    Loader2,
    AlertCircle,
    ExternalLink,
    AlertTriangle,
    Clock,
} from 'lucide-react';
import DisputeModal from './dispute-modal';

interface PublisherOrderActionsProps {
    orderId: string;
    currentStatus: string;
    articleUrl: string | null;
    rejectionReason?: string | null;
}

export default function PublisherOrderActions({
    orderId,
    currentStatus,
    articleUrl,
    rejectionReason,
}: PublisherOrderActionsProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [actionType, setActionType] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [publishUrl, setPublishUrl] = useState(articleUrl || '');
    const [showPublishForm, setShowPublishForm] = useState(false);
    const [showDisputeModal, setShowDisputeModal] = useState(false);

    const handleAction = async (status: string, data?: Record<string, unknown>) => {
        setIsLoading(true);
        setActionType(status);
        setError(null);

        try {
            const response = await fetch(`/api/orders/${orderId}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status, ...data }),
            });

            const result = await response.json() as any;

            if (!response.ok) {
                throw new Error(result.error || 'Failed to update order');
            }

            router.refresh();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Something went wrong');
        } finally {
            setIsLoading(false);
            setActionType(null);
        }
    };

    const handlePublish = async () => {
        if (!publishUrl.trim()) {
            setError('Please enter the published article URL');
            return;
        }

        try {
            new URL(publishUrl);
        } catch {
            setError('Please enter a valid URL');
            return;
        }

        await handleAction('published', { publishedUrl: publishUrl });
    };

    // Determine which actions to show based on current status
    const renderActions = () => {
        switch (currentStatus) {
            case 'pending':
                return (
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base flex items-center gap-2">
                                <AlertCircle className="w-5 h-5 text-yellow-600" />
                                Action Required
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-gray-600">
                                Review the order details and accept or decline this order.
                            </p>
                            {error && (
                                <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">
                                    {error}
                                </div>
                            )}
                            <div className="flex gap-3">
                                <Button
                                    onClick={() => handleAction('accepted')}
                                    disabled={isLoading}
                                    className="flex-1 gap-2"
                                >
                                    {isLoading && actionType === 'accepted' ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <CheckCircle className="w-4 h-4" />
                                    )}
                                    Accept Order
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => handleAction('cancelled', { reason: 'Publisher declined the order' })}
                                    disabled={isLoading}
                                    className="flex-1 gap-2 text-red-600 border-red-200 hover:bg-red-50"
                                >
                                    {isLoading && actionType === 'cancelled' ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <XCircle className="w-4 h-4" />
                                    )}
                                    Decline
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                );

            case 'accepted':
            case 'writing':
            case 'approved':
                return (
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base flex items-center gap-2">
                                <Globe className="w-5 h-5 text-blue-600" />
                                Mark as Published
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {!showPublishForm ? (
                                <>
                                    <p className="text-gray-600">
                                        Once you've published the article, enter the live URL to complete the order.
                                    </p>
                                    <Button
                                        onClick={() => setShowPublishForm(true)}
                                        className="w-full gap-2"
                                    >
                                        <Globe className="w-4 h-4" />
                                        I've Published the Article
                                    </Button>
                                </>
                            ) : (
                                <>
                                    <div>
                                        <label className="text-sm font-medium text-gray-700">
                                            Published Article URL
                                        </label>
                                        <input
                                            type="url"
                                            value={publishUrl}
                                            onChange={(e) => setPublishUrl(e.target.value)}
                                            placeholder="https://example.com/your-article"
                                            className="mt-1 w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                                        />
                                    </div>
                                    {error && (
                                        <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">
                                            {error}
                                        </div>
                                    )}
                                    <div className="flex gap-3">
                                        <Button
                                            variant="outline"
                                            onClick={() => {
                                                setShowPublishForm(false);
                                                setError(null);
                                            }}
                                            disabled={isLoading}
                                            className="flex-1"
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            onClick={handlePublish}
                                            disabled={isLoading}
                                            className="flex-1 gap-2"
                                        >
                                            {isLoading ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <CheckCircle className="w-4 h-4" />
                                            )}
                                            Submit for Buyer Review
                                        </Button>
                                    </div>
                                </>
                            )}
                        </CardContent>
                    </Card>
                );

            case 'published':
                return (
                    <Card className="bg-violet-50 border-violet-200">
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-3 mb-4">
                                <Clock className="w-8 h-8 text-violet-600" />
                                <div>
                                    <p className="font-medium text-violet-800">Awaiting Buyer Confirmation</p>
                                    <p className="text-sm text-violet-600">
                                        The buyer has 3 days to review and confirm the published article.
                                    </p>
                                </div>
                            </div>
                            {articleUrl && (
                                <a
                                    href={articleUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 text-sm text-violet-700 hover:underline"
                                >
                                    <ExternalLink className="w-4 h-4" />
                                    View Published Article
                                </a>
                            )}
                            <div className="mt-4 p-3 bg-white rounded-lg border border-violet-200">
                                <p className="text-sm text-gray-600">
                                    <strong>What happens next:</strong>
                                </p>
                                <ul className="text-sm text-gray-500 mt-2 space-y-1 list-disc list-inside">
                                    <li>If buyer confirms, earnings will be credited to your wallet</li>
                                    <li>If buyer requests revision, you'll be notified</li>
                                    <li>If buyer doesn't respond in 3 days, order auto-completes</li>
                                </ul>
                            </div>
                        </CardContent>
                    </Card>
                );

            case 'completed':
                return (
                    <Card className="bg-green-50 border-green-200">
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-3">
                                <CheckCircle className="w-8 h-8 text-green-600" />
                                <div>
                                    <p className="font-medium text-green-800">Order Completed</p>
                                    <p className="text-sm text-green-600">
                                        The payment has been released to your wallet.
                                    </p>
                                </div>
                            </div>
                            {articleUrl && (
                                <a
                                    href={articleUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="mt-4 flex items-center gap-2 text-sm text-green-700 hover:underline"
                                >
                                    <ExternalLink className="w-4 h-4" />
                                    View Published Article
                                </a>
                            )}
                        </CardContent>
                    </Card>
                );

            case 'revision_needed':
                return (
                    <>
                        <Card className="border-orange-200 bg-orange-50">
                            <CardHeader>
                                <CardTitle className="text-base flex items-center gap-2 text-orange-800">
                                    <AlertTriangle className="w-5 h-5" />
                                    Revision Requested
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {rejectionReason && (
                                    <div className="bg-white p-3 rounded-lg border border-orange-200">
                                        <p className="text-sm text-gray-500 mb-1">Buyer's feedback:</p>
                                        <p className="text-gray-800">{rejectionReason}</p>
                                    </div>
                                )}
                                <p className="text-sm text-orange-700">
                                    Please review the feedback and make the necessary changes. Once updated, you can mark the article as published again.
                                </p>
                                <div className="flex gap-3">
                                    <Button
                                        onClick={() => setShowPublishForm(true)}
                                        className="flex-1 gap-2"
                                    >
                                        <Globe className="w-4 h-4" />
                                        I've Made Changes
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={() => setShowDisputeModal(true)}
                                        className="text-red-600 border-red-200 hover:bg-red-50"
                                    >
                                        <AlertTriangle className="w-4 h-4 mr-1" />
                                        Raise Dispute
                                    </Button>
                                </div>
                                {showPublishForm && (
                                    <div className="space-y-3 pt-3 border-t">
                                        <div>
                                            <label className="text-sm font-medium text-gray-700">
                                                Updated Article URL
                                            </label>
                                            <input
                                                type="url"
                                                value={publishUrl}
                                                onChange={(e) => setPublishUrl(e.target.value)}
                                                placeholder="https://example.com/your-article"
                                                className="mt-1 w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                                            />
                                        </div>
                                        {error && (
                                            <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">
                                                {error}
                                            </div>
                                        )}
                                        <Button
                                            onClick={handlePublish}
                                            disabled={isLoading}
                                            className="w-full gap-2"
                                        >
                                            {isLoading ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <CheckCircle className="w-4 h-4" />
                                            )}
                                            Submit Updated Article
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                        {showDisputeModal && (
                            <DisputeModal
                                orderId={orderId}
                                userRole="publisher"
                                onClose={() => setShowDisputeModal(false)}
                            />
                        )}
                    </>
                );

            case 'cancelled':
            case 'refunded':
                return (
                    <Card className="bg-gray-50 border-gray-200">
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-3">
                                <XCircle className="w-8 h-8 text-gray-500" />
                                <div>
                                    <p className="font-medium text-gray-700">Order {currentStatus}</p>
                                    <p className="text-sm text-gray-500">
                                        This order is no longer active.
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                );

            default:
                return null;
        }
    };

    return renderActions();
}
