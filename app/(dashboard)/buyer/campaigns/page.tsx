'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, TrendingUp, ChevronRight, Globe, Loader2 } from 'lucide-react';

interface Campaign {
    id: string;
    name: string;
    url: string | null;
    order_count: number;
    created_at: string;
}

export default function CampaignsPage() {
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCampaigns();
    }, []);

    const fetchCampaigns = async () => {
        try {
            const res = await fetch('/api/buyer/campaigns');
            if (res.ok) {
                setCampaigns(await res.json());
            }
        } catch (error) {
            console.error('Error loading campaigns:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Campaigns</h1>
                    <p className="text-gray-600 mt-1">Organize your orders by campaign</p>
                </div>
                <Link href="/buyer/campaigns/new">
                    <Button className="gap-2">
                        <Plus className="w-4 h-4" />
                        New Campaign
                    </Button>
                </Link>
            </div>

            {loading ? (
                <div className="text-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-violet-600" />
                </div>
            ) : campaigns.length === 0 ? (
                <Card>
                    <CardContent className="py-16 text-center">
                        <TrendingUp className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-900">No campaigns yet</h3>
                        <p className="text-gray-500 mt-2 mb-6">
                            Create a campaign to group your orders and track performance.
                        </p>
                        <Link href="/buyer/campaigns/new">
                            <Button>Create Your First Campaign</Button>
                        </Link>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {campaigns.map((campaign) => (
                        <Link key={campaign.id} href={`/buyer/campaigns/${campaign.id}`}>
                            <Card className="hover:border-violet-300 hover:shadow-md transition-all h-full">
                                <CardHeader className="flex flex-row items-start justify-between pb-2">
                                    <div className="w-10 h-10 rounded-lg bg-violet-100 flex items-center justify-center">
                                        <TrendingUp className="w-5 h-5 text-violet-600" />
                                    </div>
                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                        <ChevronRight className="w-4 h-4 text-gray-400" />
                                    </Button>
                                </CardHeader>
                                <CardContent>
                                    <h3 className="font-semibold text-lg text-gray-900 mb-1">{campaign.name}</h3>
                                    {campaign.url && (
                                        <div className="flex items-center gap-1 text-sm text-gray-500 mb-4">
                                            <Globe className="w-3 h-3" />
                                            <span className="truncate max-w-[200px]">{campaign.url}</span>
                                        </div>
                                    )}
                                    <div className="flex items-center justify-between text-sm pt-4 border-t mt-4">
                                        <span className="text-gray-600">{campaign.order_count} Orders</span>
                                        <span className="text-gray-400">
                                            {new Date(campaign.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
