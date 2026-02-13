'use client';

export const runtime = "edge";



import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, CheckCircle, XCircle } from 'lucide-react';
import Link from 'next/link';

export default function ProcessPayoutPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const [payout, setPayout] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [adminNotes, setAdminNotes] = useState('');

    useEffect(() => {
        fetchPayout();
    }, [id]);

    const fetchPayout = async () => {
        try {
            const res = await fetch(`/api/admin/payouts/${id}`);
            if (res.ok) {
                const data = await res.json() as any;
                setPayout(data.payout);
                setAdminNotes(data.payout.admin_notes || '');
            }
        } catch (error) {
            console.error('Error fetching payout:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleMarkAsPaid = async () => {
        if (!confirm('Confirm that you have manually sent the payment via PayPal/Payoneer?')) {
            return;
        }

        setProcessing(true);
        try {
            const res = await fetch(`/api/admin/payouts/${id}/mark-paid`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ adminNotes }),
            });

            if (res.ok) {
                router.push('/admin/payouts');
            } else {
                const error = await res.json() as any;
                alert(error.error || 'Failed to process payout');
            }
        } catch (error) {
            alert('Error processing payout');
        } finally {
            setProcessing(false);
        }
    };

    const handleReject = async () => {
        const reason = prompt('Enter rejection reason:');
        if (!reason) return;

        setProcessing(true);
        try {
            const res = await fetch(`/api/admin/payouts/${id}/reject`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reason }),
            });

            if (res.ok) {
                router.push('/admin/payouts');
            } else {
                const error = await res.json() as any;
                alert(error.error || 'Failed to reject payout');
            }
        } catch (error) {
            alert('Error rejecting payout');
        } finally {
            setProcessing(false);
        }
    };

    if (loading) {
        return <div className="text-white">Loading...</div>;
    }

    if (!payout) {
        return <div className="text-white">Payout not found</div>;
    }

    return (
        <div className="space-y-6">
            <div>
                <Link href="/admin/payouts" className="inline-flex items-center gap-2 text-slate-300 hover:text-white mb-4">
                    <ArrowLeft className="w-4 h-4" />
                    Back to Payouts
                </Link>
                <h1 className="text-3xl font-bold text-white">Process Payout Request</h1>
                <p className="text-slate-400 mt-1">Review and process publisher withdrawal</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                {/* Payout Details */}
                <Card className="bg-slate-800 border-slate-700">
                    <CardHeader>
                        <CardTitle className="text-white">Payout Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <label className="text-sm text-slate-400">Amount</label>
                            <div className="text-2xl font-bold text-white mt-1">
                                ${(payout.amount / 100).toFixed(2)}
                            </div>
                        </div>

                        <div>
                            <label className="text-sm text-slate-400">Payment Method</label>
                            <div className="text-white mt-1 capitalize">{payout.payout_method}</div>
                        </div>

                        <div>
                            <label className="text-sm text-slate-400">Payout Email</label>
                            <div className="text-white mt-1">{payout.payout_email}</div>
                        </div>

                        <div>
                            <label className="text-sm text-slate-400">Requested On</label>
                            <div className="text-white mt-1">
                                {new Date(payout.created_at).toLocaleString()}
                            </div>
                        </div>

                        <div>
                            <label className="text-sm text-slate-400">Status</label>
                            <div className="mt-1">
                                <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 text-sm rounded-full capitalize">
                                    {payout.status}
                                </span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Publisher Details */}
                <Card className="bg-slate-800 border-slate-700">
                    <CardHeader>
                        <CardTitle className="text-white">Publisher Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <label className="text-sm text-slate-400">Name</label>
                            <div className="text-white mt-1">{payout.publisher_name}</div>
                        </div>

                        <div>
                            <label className="text-sm text-slate-400">Email</label>
                            <div className="text-white mt-1">{payout.publisher_email}</div>
                        </div>

                        <div>
                            <label className="text-sm text-slate-400">User ID</label>
                            <div className="text-white mt-1 font-mono text-sm">{payout.user_id}</div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Admin Notes */}
            <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                    <CardTitle className="text-white">Admin Notes</CardTitle>
                </CardHeader>
                <CardContent>
                    <textarea
                        value={adminNotes}
                        onChange={(e) => setAdminNotes(e.target.value)}
                        placeholder="Add notes about this payout (transaction ID, confirmation details, etc.)"
                        rows={4}
                        className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 outline-none resize-none"
                    />
                </CardContent>
            </Card>

            {/* Instructions */}
            <Card className="bg-blue-500/10 border-blue-500/30">
                <CardContent className="p-4">
                    <h3 className="font-semibold text-blue-400 mb-2">Processing Instructions</h3>
                    <ol className="list-decimal list-inside text-blue-300 space-y-1 text-sm">
                        <li>Log in to your {payout.payout_method === 'paypal' ? 'PayPal' : 'Payoneer'} account</li>
                        <li>Send ${(payout.amount / 100).toFixed(2)} to: {payout.payout_email}</li>
                        <li>Add transaction notes: "PressScape Payout #{payout.id}"</li>
                        <li>Copy the transaction ID and add to admin notes above</li>
                        <li>Click "Mark as Paid" below to complete</li>
                    </ol>
                </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex items-center gap-4">
                <Button
                    onClick={handleMarkAsPaid}
                    disabled={processing}
                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 gap-2"
                    size="lg"
                >
                    <CheckCircle className="w-5 h-5" />
                    {processing ? 'Processing...' : 'Mark as Paid'}
                </Button>

                <Button
                    onClick={handleReject}
                    disabled={processing}
                    variant="outline"
                    className="border-red-500 text-red-400 hover:bg-red-500/10 gap-2"
                    size="lg"
                >
                    <XCircle className="w-5 h-5" />
                    Reject Request
                </Button>
            </div>
        </div>
    );
}
