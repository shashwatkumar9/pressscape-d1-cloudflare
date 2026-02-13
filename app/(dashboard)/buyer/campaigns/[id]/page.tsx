'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2, PackageOpen, ExternalLink, Plus } from 'lucide-react';

interface Campaign {
    id: string;
    name: string;
    url: string | null;
    created_at: string;
}

interface Order {
    id: string;
    order_type: string;
    status: string;
    total_amount: number;
    created_at: string;
    website_domain: string;
}

export default function CampaignDetailsPage() {
    const params = useParams();
    const [campaign, setCampaign] = useState<Campaign | null>(null);
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCampaignDetails();
    }, []);

    const fetchCampaignDetails = async () => {
        try {
            const res = await fetch(`/api/buyer/campaigns/${params.id}`);
            if (res.ok) {
                const data = await res.json() as any;
                setCampaign(data.campaign);
                setOrders(data.orders);
            }
        } catch (error) {
            console.error('Error loading campaign:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="text-center py-12">
                <Loader2 className="w-8 h-8 animate-spin mx-auto text-violet-600" />
            </div>
        );
    }

    if (!campaign) {
        return (
            <div className="text-center py-12">
                <p>Campaign not found</p>
                <Link href="/buyer/campaigns">
                    <Button variant="outline" className="mt-4">Back to Campaigns</Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/buyer/campaigns" className="p-2 rounded-lg hover:bg-gray-100">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">{campaign.name}</h1>
                        {campaign.url && (
                            <a
                                href={campaign.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 text-gray-500 hover:text-violet-600 mt-1"
                            >
                                <ExternalLink className="w-3 h-3" />
                                {campaign.url}
                            </a>
                        )}
                    </div>
                </div>
                <Link href={`/marketplace?campaign=${campaign.id}`}>
                    <Button className="gap-2">
                        <Plus className="w-4 h-4" />
                        Find Websites for Campaign
                    </Button>
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle>Orders in this Campaign</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {orders.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                <PackageOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                <p>No orders yet</p>
                                <Link href={`/marketplace?campaign=${campaign.id}`}>
                                    <Button variant="outline" className="mt-4">Start Ordering</Button>
                                </Link>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {orders.map((order) => (
                                    <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                                        <div>
                                            <p className="font-medium text-gray-900">
                                                {order.order_type.replace('_', ' ')} on {order.website_domain}
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                Placed on {new Date(order.created_at).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${order.status === 'completed' ? 'bg-green-100 text-green-700' :
                                                    order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                                        'bg-blue-100 text-blue-700'
                                                }`}>
                                                {order.status.replace('_', ' ')}
                                            </span>
                                            <Link href={`/buyer/orders/${order.id}`}>
                                                <Button variant="ghost" size="sm">View</Button>
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Campaign Stats</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex justify-between items-center">
                            <span className="text-gray-500">Total Orders</span>
                            <span className="font-bold text-gray-900">{orders.length}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-500">Total Spent</span>
                            <span className="font-bold text-gray-900">
                                ${(orders.reduce((sum, o) => sum + o.total_amount, 0) / 100).toLocaleString()}
                            </span>
                        </div>
                        <div className="pt-4 border-t">
                            <p className="text-xs text-gray-400">Created: {new Date(campaign.created_at).toLocaleDateString()}</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
