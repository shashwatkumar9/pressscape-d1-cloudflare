'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    CheckCircle,
    XCircle,
    AlertTriangle,
    Loader2,
    Clock,
    ExternalLink,
} from 'lucide-react';

interface BuyerOrderActionsProps {
    orderId: string;
    currentStatus: string;
    articleUrl?: string | null;
    confirmationDeadline?: string | null;
    rejectionReason?: string | null;
}

export default function BuyerOrderActions({
    orderId,
    currentStatus,
    articleUrl,
    confirmationDeadline,
    rejectionReason,
}: BuyerOrderActionsProps) {
    const router = useRouter();
    const [loading, setLoading] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [showRejectForm, setShowRejectForm] = useState(false);
    const [rejectReason, setRejectReason] = useState('');
    const [showDisputeModal, setShowDisputeModal] = useState(false);

    // Calculate time remaining for confirmation
    const getTimeRemaining = () => {
        if (!confirmationDeadline) return null;
        const deadline = new Date(confirmationDeadline);
        const now = new Date();
        const diffMs = deadline.getTime() - now.getTime();

        if (diffMs <= 0) return 'Expired';

        const hours = Math.floor(diffMs / (1000 * 60 * 60));
        const days = Math.floor(hours / 24);
        const remainingHours = hours % 24;

        if (days > 0) {
            return `${days}d ${remainingHours}h remaining`;
        }
        return `${hours}h remaining`;
    };

    const handleConfirm = async () => {
        setLoading('confirm');
        setError(null);
        try {
            const res = await fetch(`/api/orders/${orderId}/confirm`, {
                method: 'POST',
            });

            if (!res.ok) {
                const data = await res.json() as any;
                throw new Error(data.error || 'Failed to confirm order');
            }

            router.refresh();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to confirm order');
        } finally {
            setLoading(null);
        }
    };

    const handleReject = async () => {
        if (!rejectReason.trim() || rejectReason.length < 10) {
            setError('Please provide a detailed reason (at least 10 characters)');
            return;
        }

        setLoading('reject');
        setError(null);
        try {
            const res = await fetch(`/api/orders/${orderId}/reject`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reason: rejectReason }),
            });

            if (!res.ok) {
                const data = await res.json() as any;
                throw new Error(data.error || 'Failed to request revision');
            }

            router.refresh();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to request revision');
        } finally {
            setLoading(null);
        }
    };

    // Show for published orders awaiting buyer confirmation
    if (currentStatus === 'published') {
        const timeRemaining = getTimeRemaining();

        return (
            <Card className="border-violet-200 bg-violet-50">
                <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2 text-violet-800">
                        <Clock className="w-5 h-5" />
                        Review Published Article
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {articleUrl && (
                        <div className="bg-white p-3 rounded-lg border border-violet-200">
                            <p className="text-sm text-gray-500 mb-1">Published Article URL:</p>
                            <a
                                href={articleUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-violet-600 hover:underline flex items-center gap-1 text-sm break-all"
                            >
                                {articleUrl}
                                <ExternalLink className="w-3 h-3 flex-shrink-0" />
                            </a>
                        </div>
                    )}

                    {timeRemaining && (
                        <div className="flex items-center gap-2 text-sm text-violet-700 bg-white px-3 py-2 rounded-lg">
                            <Clock className="w-4 h-4" />
                            <span>Auto-approve in: <strong>{timeRemaining}</strong></span>
                        </div>
                    )}

                    <p className="text-sm text-violet-700">
                        Please review the published article. If everything looks good, confirm to complete the order.
                        If you need changes, request a revision with specific feedback.
                    </p>

                    {error && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                            {error}
                        </div>
                    )}

                    {!showRejectForm ? (
                        <div className="flex gap-3">
                            <Button
                                onClick={handleConfirm}
                                disabled={loading !== null}
                                className="flex-1 bg-green-600 hover:bg-green-700"
                            >
                                {loading === 'confirm' ? (
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                ) : (
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                )}
                                Confirm & Complete
                            </Button>
                            <Button
                                onClick={() => setShowRejectForm(true)}
                                disabled={loading !== null}
                                variant="outline"
                                className="flex-1 border-orange-300 text-orange-700 hover:bg-orange-50"
                            >
                                <XCircle className="w-4 h-4 mr-2" />
                                Request Revision
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            <textarea
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                                placeholder="Please describe what needs to be changed or fixed..."
                                className="w-full p-3 border border-gray-200 rounded-lg text-sm resize-none h-24 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 outline-none"
                            />
                            <div className="flex gap-2">
                                <Button
                                    onClick={handleReject}
                                    disabled={loading !== null}
                                    variant="outline"
                                    className="flex-1 border-orange-300 text-orange-700 hover:bg-orange-50"
                                >
                                    {loading === 'reject' ? (
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    ) : null}
                                    Submit Revision Request
                                </Button>
                                <Button
                                    onClick={() => {
                                        setShowRejectForm(false);
                                        setRejectReason('');
                                        setError(null);
                                    }}
                                    variant="ghost"
                                >
                                    Cancel
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        );
    }

    // Show dispute option for completed orders within protection period
    if (currentStatus === 'completed') {
        return (
            <Card className="border-gray-200">
                <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-green-700">
                            <CheckCircle className="w-5 h-5" />
                            <span className="font-medium">Order Completed</span>
                        </div>
                        <Button
                            onClick={() => setShowDisputeModal(true)}
                            variant="ghost"
                            size="sm"
                            className="text-gray-500 hover:text-red-600"
                        >
                            <AlertTriangle className="w-4 h-4 mr-1" />
                            Report Issue
                        </Button>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                        If the article is removed or significantly changed within 90 days, you can raise a dispute.
                    </p>
                </CardContent>
            </Card>
        );
    }

    // Show rejection reason for revision_needed status
    if (currentStatus === 'revision_needed' && rejectionReason) {
        return (
            <Card className="border-orange-200 bg-orange-50">
                <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2 text-orange-800">
                        <AlertTriangle className="w-5 h-5" />
                        Revision Requested
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-orange-700 mb-2">You requested changes:</p>
                    <div className="bg-white p-3 rounded-lg border border-orange-200 text-sm text-gray-700">
                        {rejectionReason}
                    </div>
                    <p className="text-sm text-orange-600 mt-3">
                        The publisher is working on the requested changes.
                    </p>
                </CardContent>
            </Card>
        );
    }

    return null;
}
