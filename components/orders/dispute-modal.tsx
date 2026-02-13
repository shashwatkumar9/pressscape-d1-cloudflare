'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, X, Loader2 } from 'lucide-react';

interface DisputeModalProps {
    orderId: string;
    userRole: 'buyer' | 'publisher';
    onClose: () => void;
}

const disputeReasons = {
    buyer: [
        { value: 'link_removed', label: 'Backlink was removed' },
        { value: 'content_changed', label: 'Article content was changed' },
        { value: 'wrong_url', label: 'Published on wrong URL' },
        { value: 'nofollow_added', label: 'Link was changed to nofollow' },
        { value: 'quality_issues', label: 'Content quality doesn\'t match expectations' },
        { value: 'other', label: 'Other issue' },
    ],
    publisher: [
        { value: 'terms_violated', label: 'Buyer violated terms' },
        { value: 'quality_issues', label: 'Unreasonable revision request' },
        { value: 'deadline_missed', label: 'Payment or communication issues' },
        { value: 'other', label: 'Other issue' },
    ],
};

export default function DisputeModal({ orderId, userRole, onClose }: DisputeModalProps) {
    const router = useRouter();
    const [reason, setReason] = useState('');
    const [description, setDescription] = useState('');
    const [evidenceUrls, setEvidenceUrls] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!reason) {
            setError('Please select a reason');
            return;
        }

        if (description.length < 20) {
            setError('Please provide a detailed description (at least 20 characters)');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const urls = evidenceUrls.split('\n').filter(url => url.trim());

            const res = await fetch(`/api/orders/${orderId}/dispute`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    reason,
                    description,
                    evidenceUrls: urls,
                }),
            });

            if (!res.ok) {
                const data = await res.json() as any;
                throw new Error(data.error || 'Failed to submit dispute');
            }

            router.refresh();
            onClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to submit dispute');
        } finally {
            setLoading(false);
        }
    };

    const reasons = disputeReasons[userRole];

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-lg bg-white">
                <CardHeader className="flex flex-row items-center justify-between border-b">
                    <CardTitle className="flex items-center gap-2 text-red-600">
                        <AlertTriangle className="w-5 h-5" />
                        Raise a Dispute
                    </CardTitle>
                    <Button variant="ghost" size="icon" onClick={onClose}>
                        <X className="w-5 h-5" />
                    </Button>
                </CardHeader>
                <CardContent className="pt-6">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Reason for Dispute *
                            </label>
                            <select
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                className="w-full p-3 border border-gray-200 rounded-lg text-sm focus:border-red-500 focus:ring-2 focus:ring-red-500/20 outline-none"
                            >
                                <option value="">Select a reason...</option>
                                {reasons.map((r) => (
                                    <option key={r.value} value={r.value}>
                                        {r.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Description *
                            </label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Please describe the issue in detail..."
                                className="w-full p-3 border border-gray-200 rounded-lg text-sm resize-none h-32 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 outline-none"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                Minimum 20 characters ({description.length}/20)
                            </p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Evidence URLs (optional)
                            </label>
                            <textarea
                                value={evidenceUrls}
                                onChange={(e) => setEvidenceUrls(e.target.value)}
                                placeholder="Paste any relevant links (one per line)&#10;e.g., screenshots, archive.org links, etc."
                                className="w-full p-3 border border-gray-200 rounded-lg text-sm resize-none h-20 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 outline-none"
                            />
                        </div>

                        {error && (
                            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                                {error}
                            </div>
                        )}

                        <div className="flex gap-3 pt-2">
                            <Button
                                type="submit"
                                disabled={loading}
                                className="flex-1 bg-red-600 hover:bg-red-700"
                            >
                                {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                Submit Dispute
                            </Button>
                            <Button
                                type="button"
                                onClick={onClose}
                                variant="outline"
                                disabled={loading}
                            >
                                Cancel
                            </Button>
                        </div>

                        <p className="text-xs text-gray-500 text-center">
                            Our team will review your dispute within 24-48 hours and contact you with next steps.
                        </p>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
