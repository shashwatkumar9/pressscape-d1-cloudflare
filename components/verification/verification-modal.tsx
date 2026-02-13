'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, Users, CheckCircle, Copy, Download, AlertCircle, Globe } from 'lucide-react';

interface VerificationModalProps {
    websiteId: string;
    websiteDomain: string;
    onClose: () => void;
    ownershipType: 'owner' | 'contributor';
    setOwnershipType: (type: 'owner' | 'contributor') => void;
}

export default function VerificationModal({
    websiteId,
    websiteDomain,
    onClose,
    ownershipType,
    setOwnershipType,
}: VerificationModalProps) {
    const [activeTab, setActiveTab] = useState<'html' | 'dns'>('html');
    const [verificationData, setVerificationData] = useState<any>(null);
    const [verifying, setVerifying] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    // Contributor application
    const [application, setApplication] = useState('');
    const [portfolioLinks, setPortfolioLinks] = useState(['']);
    const [submitting, setSubmitting] = useState(false);

    const wordCount = application.split(/\s+/).filter(Boolean).length;

    const initializeHtmlVerification = async () => {
        try {
            const res = await fetch('/api/publisher/websites/verify/html-file', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ websiteId }),
            });

            if (res.ok) {
                const data = await res.json() as any;
                setVerificationData(data);
            } else {
                const error = await res.json() as any;
                setError(error.error);
            }
        } catch (error) {
            setError('Failed to initialize verification');
        }
    };

    const initializeDnsVerification = async () => {
        try {
            const res = await fetch('/api/publisher/websites/verify/dns', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ websiteId }),
            });

            if (res.ok) {
                const data = await res.json() as any;
                setVerificationData(data);
            } else {
                const error = await res.json() as any;
                setError(error.error);
            }
        } catch (error) {
            setError('Failed to initialize verification');
        }
    };

    const verifyHtmlFile = async () => {
        setVerifying(true);
        setError(null);
        try {
            const res = await fetch('/api/publisher/websites/verify/html-file/check', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ websiteId }),
            });

            const data = await res.json() as any;

            if (res.ok && data.success) {
                setSuccess(true);
                setTimeout(() => {
                    window.location.reload();
                }, 2000);
            } else {
                setError(data.error || 'Verification failed');
            }
        } catch (error) {
            setError('Failed to verify website');
        } finally {
            setVerifying(false);
        }
    };

    const verifyDns = async () => {
        setVerifying(true);
        setError(null);
        try {
            const res = await fetch('/api/publisher/websites/verify/dns/check', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ websiteId }),
            });

            const data = await res.json() as any;

            if (res.ok && data.success) {
                setSuccess(true);
                setTimeout(() => {
                    window.location.reload();
                }, 2000);
            } else {
                setError(data.error || 'Verification failed');
            }
        } catch (error) {
            setError('Failed to verify DNS record');
        } finally {
            setVerifying(false);
        }
    };

    const downloadHtmlFile = () => {
        if (!verificationData) return;

        const blob = new Blob([verificationData.htmlContent], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = verificationData.filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
    };

    const submitContributorApplication = async () => {
        if (wordCount < 500) {
            setError('Application must be at least 500 words');
            return;
        }

        setSubmitting(true);
        setError(null);

        try {
            const res = await fetch('/api/publisher/websites/apply-contributor', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    websiteId,
                    application,
                    portfolioLinks: portfolioLinks.filter(Boolean),
                }),
            });

            if (res.ok) {
                setSuccess(true);
                setTimeout(() => {
                    window.location.reload();
                }, 2000);
            } else {
                const error = await res.json() as any;
                setError(error.error);
            }
        } catch (error) {
            setError('Failed to submit application');
        } finally {
            setSubmitting(false);
        }
    };

    if (!ownershipType) {
        // Ownership type selection
        return (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <Card className="max-w-4xl w-full bg-white">
                    <CardHeader>
                        <CardTitle className="text-2xl">Verify Website Ownership</CardTitle>
                        <p className="text-gray-600">How would you like to list this website?</p>
                    </CardHeader>
                    <CardContent>
                        <div className="grid md:grid-cols-2 gap-6">
                            {/* Owner Option */}
                            <button
                                onClick={() => setOwnershipType('owner')}
                                className="p-6 border-2 border-gray-200 rounded-xl hover:border-violet-600 hover:bg-violet-50 transition-all text-left group"
                            >
                                <Shield className="w-12 h-12 text-green-500 mb-4 group-hover:scale-110 transition-transform" />
                                <h3 className="text-xl font-bold text-gray-900 mb-2">I Own This Website</h3>
                                <p className="text-gray-600 mb-4">
                                    You have full ownership and can prove it through technical verification
                                </p>
                                <ul className="space-y-2 text-sm text-gray-700">
                                    <li className="flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4 text-green-500" />
                                        Instant verification
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4 text-green-500" />
                                        Full control
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4 text-green-500" />
                                        Higher trust score
                                    </li>
                                </ul>
                            </button>

                            {/* Contributor Option */}
                            <button
                                onClick={() => setOwnershipType('contributor')}
                                className="p-6 border-2 border-gray-200 rounded-xl hover:border-violet-600 hover:bg-violet-50 transition-all text-left group"
                            >
                                <Users className="w-12 h-12 text-blue-500 mb-4 group-hover:scale-110 transition-transform" />
                                <h3 className="text-xl font-bold text-gray-900 mb-2">I'm a Contributor</h3>
                                <p className="text-gray-600 mb-4">
                                    You can publish on this site but don't own it
                                </p>
                                <ul className="space-y-2 text-sm text-gray-700">
                                    <li className="flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4 text-blue-500" />
                                        Admin approval required
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4 text-blue-500" />
                                        Submit application
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4 text-blue-500" />
                                        Show your expertise
                                    </li>
                                </ul>
                            </button>
                        </div>

                        <div className="mt-6 text-center">
                            <Button variant="ghost" onClick={onClose}>
                                Cancel
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (ownershipType === 'contributor') {
        // Contributor application form
        return (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
                <Card className="max-w-3xl w-full bg-white my-8">
                    <CardHeader>
                        <CardTitle className="text-2xl">Contributor Application</CardTitle>
                        <p className="text-gray-600">Apply to publish content on {websiteDomain}</p>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {success ? (
                            <div className="text-center py-8">
                                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                                <h3 className="text-xl font-bold text-gray-900 mb-2">Application Submitted!</h3>
                                <p className="text-gray-600">
                                    Admin will review your application and notify you via email.
                                </p>
                            </div>
                        ) : (
                            <>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Why should we approve you? *
                                    </label>
                                    <textarea
                                        value={application}
                                        onChange={(e) => setApplication(e.target.value)}
                                        rows={10}
                                        placeholder="Explain your relationship with the website, your writing experience, past work, etc. (minimum 500 words)"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none resize-none"
                                    />
                                    <div className={`text-sm mt-1 ${wordCount < 500 ? 'text-red-600' : 'text-green-600'}`}>
                                        {wordCount} / 500 words {wordCount < 500 && '(minimum required)'}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Portfolio Links (Optional)
                                    </label>
                                    {portfolioLinks.map((link, idx) => (
                                        <input
                                            key={idx}
                                            type="url"
                                            value={link}
                                            onChange={(e) => {
                                                const newLinks = [...portfolioLinks];
                                                newLinks[idx] = e.target.value;
                                                setPortfolioLinks(newLinks);
                                            }}
                                            placeholder="https://yourportfolio.com"
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-2 focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none"
                                        />
                                    ))}
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setPortfolioLinks([...portfolioLinks, ''])}
                                    >
                                        Add Another Link
                                    </Button>
                                </div>

                                {error && (
                                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-start gap-2">
                                        <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                                        {error}
                                    </div>
                                )}

                                <div className="flex items-center gap-3">
                                    <Button
                                        onClick={submitContributorApplication}
                                        disabled={submitting || wordCount < 500}
                                        className="flex-1 bg-gradient-to-r from-violet-600 to-indigo-600"
                                    >
                                        {submitting ? 'Submitting...' : 'Submit Application'}
                                    </Button>
                                    <Button variant="ghost" onClick={() => setOwnershipType(null as any)}>
                                        Back
                                    </Button>
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Owner verification
    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <Card className="max-w-3xl w-full bg-white my-8">
                <CardHeader>
                    <CardTitle className="text-2xl">Verify Website Ownership</CardTitle>
                    <p className="text-gray-600 flex items-center gap-2">
                        <Globe className="w-4 h-4" />
                        {websiteDomain}
                    </p>
                </CardHeader>
                <CardContent>
                    {success ? (
                        <div className="text-center py-8">
                            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Verification Successful!</h3>
                            <p className="text-gray-600">Your website has been verified.</p>
                        </div>
                    ) : (
                        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'html' | 'dns')}>
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="html">HTML File</TabsTrigger>
                                <TabsTrigger value="dns">DNS TXT Record</TabsTrigger>
                            </TabsList>

                            <TabsContent value="html" className="space-y-4 mt-6">
                                <div className="space-y-4">
                                    {!verificationData ? (
                                        <Button onClick={initializeHtmlVerification} className="w-full">
                                            Generate Verification File
                                        </Button>
                                    ) : (
                                        <>
                                            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                                <h4 className="font-semibold text-gray-900 mb-3">Instructions:</h4>
                                                <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
                                                    {verificationData.instructions?.map((instruction: string, idx: number) => (
                                                        <li key={idx}>{instruction}</li>
                                                    ))}
                                                </ol>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Verification File
                                                </label>
                                                <div className="flex gap-2">
                                                    <input
                                                        type="text"
                                                        value={verificationData.filename}
                                                        readOnly
                                                        className="flex-1 px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg font-mono text-sm"
                                                    />
                                                    <Button onClick={downloadHtmlFile} size="sm">
                                                        <Download className="w-4 h-4 mr-2" />
                                                        Download
                                                    </Button>
                                                </div>
                                            </div>

                                            {error && (
                                                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                                                    {error}
                                                </div>
                                            )}

                                            <Button onClick={verifyHtmlFile} disabled={verifying} className="w-full">
                                                {verifying ? 'Verifying...' : 'Verify Ownership'}
                                            </Button>
                                        </>
                                    )}
                                </div>
                            </TabsContent>

                            <TabsContent value="dns" className="space-y-4 mt-6">
                                {!verificationData ? (
                                    <Button onClick={initializeDnsVerification} className="w-full">
                                        Generate DNS Record
                                    </Button>
                                ) : (
                                    <>
                                        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                            <h4 className="font-semibold text-gray-900 mb-3">Instructions:</h4>
                                            <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
                                                {verificationData.instructions?.map((instruction: string, idx: number) => (
                                                    <li key={idx}>{instruction}</li>
                                                ))}
                                            </ol>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                TXT Record Value
                                            </label>
                                            <div className="flex gap-2">
                                                <input
                                                    type="text"
                                                    value={verificationData.txtRecord}
                                                    readOnly
                                                    className="flex-1 px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg font-mono text-sm"
                                                />
                                                <Button
                                                    onClick={() => copyToClipboard(verificationData.txtRecord)}
                                                    size="sm"
                                                >
                                                    <Copy className="w-4 h-4 mr-2" />
                                                    Copy
                                                </Button>
                                            </div>
                                        </div>

                                        {error && (
                                            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                                                {error}
                                            </div>
                                        )}

                                        <Button onClick={verifyDns} disabled={verifying} className="w-full">
                                            {verifying ? 'Verifying...' : 'Verify DNS Record'}
                                        </Button>
                                    </>
                                )}
                            </TabsContent>
                        </Tabs>
                    )}

                    {!success && (
                        <div className="mt-6 text-center">
                            <Button variant="ghost" onClick={() => setOwnershipType(null as any)}>
                                Change Verification Method
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
