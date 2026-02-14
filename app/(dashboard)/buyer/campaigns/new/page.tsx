'use client';


import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2 } from 'lucide-react';

export default function NewCampaignPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        url: '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/buyer/campaigns', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                router.push('/buyer/campaigns');
            } else {
                const data = await res.json() as any;
                setError(data.error || 'Failed to create campaign');
            }
        } catch {
            setError('An error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/buyer/campaigns" className="p-2 rounded-lg hover:bg-gray-100">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">New Campaign</h1>
                    <p className="text-gray-600 mt-1">Create a new campaign to track your orders</p>
                </div>
            </div>

            <Card>
                <CardContent className="pt-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-200">
                                {error}
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Campaign Name *
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="e.g., Summer SEO Push"
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-violet-500 focus:outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Target URL (Optional)
                            </label>
                            <input
                                type="url"
                                value={formData.url}
                                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                                placeholder="https://mysite.com"
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-violet-500 focus:outline-none"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                The main website this campaign is promoting
                            </p>
                        </div>

                        <div className="flex justify-end gap-3 pt-4">
                            <Link href="/buyer/campaigns">
                                <Button type="button" variant="outline">Cancel</Button>
                            </Link>
                            <Button type="submit" disabled={loading} className="gap-2">
                                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                                Create Campaign
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
