'use client';

export const runtime = "edge";



import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function AddWebsitePage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        domain: '',
        name: '',
        ownerEmail: '',
        domainAuthority: '',
        domainRating: '',
        organicTraffic: '',
        priceGuestPost: '',
        priceLinkInsertion: '',
        category: 'general',
        turnaroundDays: '7',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await fetch('/api/admin/websites', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await response.json() as any;

            if (!response.ok) {
                throw new Error(data.error || 'Failed to add website');
            }

            router.push('/admin/websites');
            router.refresh();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/admin/websites" className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h1 className="text-3xl font-bold text-white">Add Website</h1>
                    <p className="text-slate-400 mt-1">Add a new website listing</p>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="grid lg:grid-cols-2 gap-6">
                    {/* Basic Info */}
                    <Card className="bg-slate-800 border-slate-700">
                        <CardHeader>
                            <CardTitle className="text-white">Basic Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {error && (
                                <div className="p-3 rounded-lg bg-red-900/50 border border-red-700 text-red-300 text-sm">
                                    {error}
                                </div>
                            )}

                            <div>
                                <Label className="text-slate-300">Domain *</Label>
                                <Input
                                    placeholder="example.com"
                                    value={formData.domain}
                                    onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                                    className="bg-slate-700 border-slate-600 text-white"
                                    required
                                />
                            </div>

                            <div>
                                <Label className="text-slate-300">Website Name *</Label>
                                <Input
                                    placeholder="Example Blog"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="bg-slate-700 border-slate-600 text-white"
                                    required
                                />
                            </div>

                            <div>
                                <Label className="text-slate-300">Owner Email *</Label>
                                <Input
                                    type="email"
                                    placeholder="owner@example.com"
                                    value={formData.ownerEmail}
                                    onChange={(e) => setFormData({ ...formData, ownerEmail: e.target.value })}
                                    className="bg-slate-700 border-slate-600 text-white"
                                    required
                                />
                                <p className="text-xs text-slate-500 mt-1">Must be a registered user</p>
                            </div>

                            <div>
                                <Label className="text-slate-300">Category</Label>
                                <select
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                                >
                                    <option value="general">General</option>
                                    <option value="tech">Technology</option>
                                    <option value="business">Business & Finance</option>
                                    <option value="health">Health & Wellness</option>
                                    <option value="lifestyle">Lifestyle</option>
                                    <option value="travel">Travel</option>
                                    <option value="marketing">Marketing & SEO</option>
                                </select>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Metrics & Pricing */}
                    <Card className="bg-slate-800 border-slate-700">
                        <CardHeader>
                            <CardTitle className="text-white">Metrics & Pricing</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-slate-300">Domain Authority (DA)</Label>
                                    <Input
                                        type="number"
                                        min="0"
                                        max="100"
                                        placeholder="50"
                                        value={formData.domainAuthority}
                                        onChange={(e) => setFormData({ ...formData, domainAuthority: e.target.value })}
                                        className="bg-slate-700 border-slate-600 text-white"
                                    />
                                </div>
                                <div>
                                    <Label className="text-slate-300">Domain Rating (DR)</Label>
                                    <Input
                                        type="number"
                                        min="0"
                                        max="100"
                                        placeholder="50"
                                        value={formData.domainRating}
                                        onChange={(e) => setFormData({ ...formData, domainRating: e.target.value })}
                                        className="bg-slate-700 border-slate-600 text-white"
                                    />
                                </div>
                            </div>

                            <div>
                                <Label className="text-slate-300">Organic Traffic (monthly)</Label>
                                <Input
                                    type="number"
                                    min="0"
                                    placeholder="10000"
                                    value={formData.organicTraffic}
                                    onChange={(e) => setFormData({ ...formData, organicTraffic: e.target.value })}
                                    className="bg-slate-700 border-slate-600 text-white"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-slate-300">Guest Post Price ($) *</Label>
                                    <Input
                                        type="number"
                                        min="1"
                                        placeholder="100"
                                        value={formData.priceGuestPost}
                                        onChange={(e) => setFormData({ ...formData, priceGuestPost: e.target.value })}
                                        className="bg-slate-700 border-slate-600 text-white"
                                        required
                                    />
                                </div>
                                <div>
                                    <Label className="text-slate-300">Link Insertion Price ($)</Label>
                                    <Input
                                        type="number"
                                        min="1"
                                        placeholder="50"
                                        value={formData.priceLinkInsertion}
                                        onChange={(e) => setFormData({ ...formData, priceLinkInsertion: e.target.value })}
                                        className="bg-slate-700 border-slate-600 text-white"
                                    />
                                </div>
                            </div>

                            <div>
                                <Label className="text-slate-300">Turnaround (days)</Label>
                                <Input
                                    type="number"
                                    min="1"
                                    max="30"
                                    value={formData.turnaroundDays}
                                    onChange={(e) => setFormData({ ...formData, turnaroundDays: e.target.value })}
                                    className="bg-slate-700 border-slate-600 text-white"
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="flex justify-end gap-4 mt-6">
                    <Link href="/admin/websites">
                        <Button type="button" variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-800">
                            Cancel
                        </Button>
                    </Link>
                    <Button
                        type="submit"
                        className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 gap-2"
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Adding...
                            </>
                        ) : (
                            <>
                                <Save className="w-4 h-4" />
                                Add Website
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </div>
    );
}
