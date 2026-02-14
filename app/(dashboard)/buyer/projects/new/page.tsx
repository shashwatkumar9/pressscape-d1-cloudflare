'use client';


import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Globe, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function NewProjectPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        url: '',
        description: '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await fetch('/api/buyer/projects', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await response.json() as any;

            if (!response.ok) {
                throw new Error(data.error || 'Failed to create project');
            }

            // Redirect to dashboard or project page
            router.push('/buyer/dashboard');
            router.refresh();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            <Link
                href="/buyer/dashboard"
                className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
            >
                <ArrowLeft className="w-4 h-4" />
                Back to Dashboard
            </Link>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Globe className="w-5 h-5 text-violet-600" />
                        Create New Project
                    </CardTitle>
                    <CardDescription>
                        Projects help you organize your orders by website or campaign
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                                {error}
                            </div>
                        )}

                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                                Project Name *
                            </label>
                            <input
                                type="text"
                                id="name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                                placeholder="My Website SEO Campaign"
                                maxLength={100}
                                required
                            />
                            <p className="mt-1 text-xs text-gray-500">
                                {formData.name.length}/100 characters
                            </p>
                        </div>

                        <div>
                            <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-1">
                                Project URL *
                            </label>
                            <input
                                type="url"
                                id="url"
                                value={formData.url}
                                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                                placeholder="https://www.example.com"
                                required
                            />
                            <p className="mt-1 text-xs text-gray-500">
                                The main website you're building links to
                            </p>
                        </div>

                        <div>
                            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                                Description (Optional)
                            </label>
                            <textarea
                                id="description"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                                placeholder="Brief description of your project goals..."
                                rows={3}
                                maxLength={500}
                            />
                            <p className="mt-1 text-xs text-gray-500">
                                {formData.description.length}/500 characters
                            </p>
                        </div>

                        <div className="flex gap-3 pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => router.back()}
                                className="flex-1"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={loading || !formData.name || !formData.url}
                                className="flex-1 gap-2"
                            >
                                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                                {loading ? 'Creating...' : 'Create Project'}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
