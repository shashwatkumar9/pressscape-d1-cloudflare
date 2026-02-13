'use client';

export const runtime = "edge";



import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, CheckCircle, XCircle, User, Globe, ExternalLink } from 'lucide-react';
import Link from 'next/link';

export default function ReviewApplicationPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const [application, setApplication] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [reviewNotes, setReviewNotes] = useState('');
    const [applicationId, setApplicationId] = useState<string>('');

    useEffect(() => {
        // Handle potential Promise params in Next.js 15
        Promise.resolve(params).then((resolvedParams) => {
            setApplicationId(resolvedParams.id);
        });
    }, [params]);

    useEffect(() => {
        if (applicationId) {
            fetchApplication();
        }
    }, [applicationId]);

    const fetchApplication = async () => {
        try {
            const res = await fetch(`/api/admin/contributor-applications/${applicationId}`);
            if (res.ok) {
                const data = await res.json() as any;
                setApplication(data.application);
                setReviewNotes(data.application.admin_review_notes || '');
            }
        } catch (error) {
            console.error('Error fetching application:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async () => {
        if (!confirm('Approve this contributor application?')) return;

        setProcessing(true);
        try {
            const res = await fetch(`/api/admin/contributor-applications/${applicationId}/approve`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reviewNotes }),
            });

            if (res.ok) {
                router.push('/admin/contributor-applications');
            } else {
                const error = await res.json() as any;
                alert(error.error || 'Failed to approve application');
            }
        } catch (error) {
            alert('Error approving application');
        } finally {
            setProcessing(false);
        }
    };

    const handleReject = async () => {
        const reason = prompt('Enter rejection reason (will be sent to applicant):');
        if (!reason) return;

        setProcessing(true);
        try {
            const res = await fetch(`/api/admin/contributor-applications/${applicationId}/reject`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reason }),
            });

            if (res.ok) {
                router.push('/admin/contributor-applications');
            } else {
                const error = await res.json() as any;
                alert(error.error || 'Failed to reject application');
            }
        } catch (error) {
            alert('Error rejecting application');
        } finally {
            setProcessing(false);
        }
    };

    if (loading) {
        return <div className="text-white">Loading...</div>;
    }

    if (!application) {
        return <div className="text-white">Application not found</div>;
    }

    const appData = typeof application.contributor_application === 'string'
        ? JSON.parse(application.contributor_application)
        : application.contributor_application;

    return (
        <div className="space-y-6">
            <div>
                <Link href="/admin/contributor-applications" className="inline-flex items-center gap-2 text-slate-300 hover:text-white mb-4">
                    <ArrowLeft className="w-4 h-4" />
                    Back to Applications
                </Link>
                <h1 className="text-3xl font-bold text-white">Review Contributor Application</h1>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
                {/* Application Details */}
                <div className="md:col-span-2 space-y-6">
                    <Card className="bg-slate-800 border-slate-700">
                        <CardHeader>
                            <CardTitle className="text-white">Applicant Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-start gap-4">
                                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-white font-bold text-2xl">
                                    {application.applicant_name[0].toUpperCase()}
                                </div>
                                <div>
                                    <h3 className="text-xl font-semibold text-white">{application.applicant_name}</h3>
                                    <p className="text-slate-400">{application.applicant_email}</p>
                                    <div className="flex items-center gap-2 mt-2">
                                        <Globe className="w-4 h-4 text-slate-500" />
                                        <span className="text-slate-300">{application.domain}</span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-slate-800 border-slate-700">
                        <CardHeader>
                            <CardTitle className="text-white">Application Statement</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="p-4 bg-slate-900 rounded-lg text-slate-300 whitespace-pre-wrap">
                                {appData.application}
                            </div>
                            <div className="mt-3 text-sm text-slate-500">
                                {appData.application.length} characters • {Math.ceil(appData.application.split(' ').length / 100) * 100} words (approx)
                            </div>
                        </CardContent>
                    </Card>

                    {appData.portfolioLinks && appData.portfolioLinks.length > 0 && (
                        <Card className="bg-slate-800 border-slate-700">
                            <CardHeader>
                                <CardTitle className="text-white">Portfolio Links</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                {appData.portfolioLinks.map((link: string, idx: number) => (
                                    <a
                                        key={idx}
                                        href={link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 text-violet-400 hover:text-violet-300 p-3 bg-slate-900 rounded-lg"
                                    >
                                        <ExternalLink className="w-5 h-5" />
                                        {link}
                                    </a>
                                ))}
                            </CardContent>
                        </Card>
                    )}

                    {appData.sampleArticles && appData.sampleArticles.length > 0 && (
                        <Card className="bg-slate-800 border-slate-700">
                            <CardHeader>
                                <CardTitle className="text-white">Sample Articles</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                {appData.sampleArticles.map((link: string, idx: number) => (
                                    <a
                                        key={idx}
                                        href={link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 text-violet-400 hover:text-violet-300 p-3 bg-slate-900 rounded-lg"
                                    >
                                        <ExternalLink className="w-5 h-5" />
                                        {link}
                                    </a>
                                ))}
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Review Panel */}
                <div className="md:col-span-1">
                    <Card className="bg-slate-800 border-slate-700 sticky top-6">
                        <CardHeader>
                            <CardTitle className="text-white">Review & Decision</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-slate-400 mb-2 block">
                                    Review Notes (Optional)
                                </label>
                                <textarea
                                    value={reviewNotes}
                                    onChange={(e) => setReviewNotes(e.target.value)}
                                    placeholder="Add internal notes about this application..."
                                    rows={4}
                                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 outline-none resize-none text-sm"
                                />
                            </div>

                            <div className="space-y-3">
                                <Button
                                    onClick={handleApprove}
                                    disabled={processing}
                                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500"
                                    size="lg"
                                >
                                    <CheckCircle className="w-5 h-5 mr-2" />
                                    {processing ? 'Processing...' : 'Approve Application'}
                                </Button>

                                <Button
                                    onClick={handleReject}
                                    disabled={processing}
                                    variant="outline"
                                    className="w-full border-red-500 text-red-400 hover:bg-red-500/10"
                                    size="lg"
                                >
                                    <XCircle className="w-5 h-5 mr-2" />
                                    Reject Application
                                </Button>
                            </div>

                            <div className="pt-4 border-t border-slate-700 text-xs text-slate-500">
                                Applied on {new Date(appData.appliedAt).toLocaleString()}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
