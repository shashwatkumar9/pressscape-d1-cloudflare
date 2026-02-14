export const runtime = 'edge';

import { sql } from '@/lib/db';
import { cookies } from 'next/headers';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Globe, Plus, Search, Eye, Edit, Pause } from 'lucide-react';

async function getSession() {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get('auth_session')?.value;
    if (!sessionId) return null;

    const result = await sql`
    SELECT s.*, u.* FROM sessions s
    JOIN users u ON s.user_id = u.id
    WHERE s.id = ${sessionId} AND s.expires_at > NOW()
  `;
    return result.rows[0] || null;
}

async function getPublisherWebsites(userId: string) {
    try {
        const result = await sql`
      SELECT 
        w.id,
        w.domain,
        w.domain_authority as da,
        w.domain_rating as dr,
        w.organic_traffic as traffic,
        w.price_guest_post,
        w.price_link_insertion,
        w.is_active,
        w.verification_status as status,
        c.name as category
      FROM websites w
      LEFT JOIN categories c ON w.primary_category_id = c.id
      WHERE w.owner_id = ${userId}
      ORDER BY w.domain_authority DESC NULLS LAST
    `;
        return result.rows;
    } catch (error) {
        console.error('Error fetching websites:', error);
        return [];
    }
}

export default async function WebsitesPage() {
    const session = await getSession();

    if (!session) {
        return (
            <div className="text-center py-12">
                <p>Please log in to view your websites.</p>
                <Link href="/login"><Button className="mt-4">Login</Button></Link>
            </div>
        );
    }

    const websites = await getPublisherWebsites(session.user_id as string);

    const formatCurrency = (cents: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(cents / 100);
    };

    const formatNumber = (num: number) => {
        if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
        if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
        return num.toString();
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">My Websites</h1>
                    <p className="text-gray-600 mt-1">Manage your website listings and track performance</p>
                </div>
                <Link href="/publisher/websites/new">
                    <Button className="gap-2">
                        <Plus className="w-4 h-4" />
                        Add Website
                    </Button>
                </Link>
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="pt-4">
                        <div className="text-2xl font-bold text-gray-900">{websites.length}</div>
                        <div className="text-sm text-gray-600">Total Websites</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-4">
                        <div className="text-2xl font-bold text-gray-900">
                            {websites.filter((w: any) => w.is_active).length}
                        </div>
                        <div className="text-sm text-gray-600">Active</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-4">
                        <div className="text-2xl font-bold text-gray-900">0</div>
                        <div className="text-sm text-gray-600">Pending Orders</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-4">
                        <div className="text-2xl font-bold text-emerald-600">$0.00</div>
                        <div className="text-sm text-gray-600">Total Earnings</div>
                    </CardContent>
                </Card>
            </div>

            {/* Search & Filter */}
            <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search websites..."
                        className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                    />
                </div>
                <select className="px-4 py-2 border rounded-lg text-gray-600">
                    <option>All Status</option>
                    <option>Active</option>
                    <option>Paused</option>
                    <option>Pending</option>
                </select>
            </div>

            {/* Websites List */}
            <div className="space-y-4">
                {websites.length === 0 ? (
                    <Card>
                        <CardContent className="py-12 text-center">
                            <Globe className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900">No websites yet</h3>
                            <p className="text-gray-500 mt-1">Add your first website to start receiving orders</p>
                            <Link href="/publisher/websites/new">
                                <Button className="mt-4">Add Website</Button>
                            </Link>
                        </CardContent>
                    </Card>
                ) : (
                    websites.map((website: any) => (
                        <Card key={website.id} className="hover:shadow-md transition-shadow">
                            <CardContent className="pt-6">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 rounded-lg bg-violet-100 flex items-center justify-center">
                                            <Globe className="w-6 h-6 text-violet-600" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-semibold text-gray-900">{website.domain}</h3>
                                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${website.is_active ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                                    }`}>
                                                    {website.is_active ? 'Active' : 'Paused'}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-500">{website.category || 'General'}</p>

                                            {/* Metrics */}
                                            <div className="flex items-center gap-6 mt-3">
                                                <div className="text-sm">
                                                    <span className="text-gray-500">DA:</span>
                                                    <span className="ml-1 font-medium text-gray-900">{website.da || 'N/A'}</span>
                                                </div>
                                                <div className="text-sm">
                                                    <span className="text-gray-500">DR:</span>
                                                    <span className="ml-1 font-medium text-gray-900">{website.dr || 'N/A'}</span>
                                                </div>
                                                <div className="text-sm">
                                                    <span className="text-gray-500">Traffic:</span>
                                                    <span className="ml-1 font-medium text-gray-900">{formatNumber(website.traffic || 0)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Pricing & Actions */}
                                    <div className="flex items-start gap-6">
                                        <div className="text-right">
                                            <div className="text-lg font-semibold text-gray-900">
                                                {formatCurrency(website.price_guest_post || 0)}
                                            </div>
                                            <div className="text-sm text-gray-500">Guest Post</div>
                                            {website.price_link_insertion && (
                                                <div className="text-sm text-gray-500 mt-1">
                                                    Link Insert: {formatCurrency(website.price_link_insertion)}
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <button className="p-2 rounded-lg hover:bg-gray-100 text-gray-600">
                                                <Eye className="w-4 h-4" />
                                            </button>
                                            <button className="p-2 rounded-lg hover:bg-gray-100 text-gray-600">
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            <button className="p-2 rounded-lg hover:bg-gray-100 text-gray-600">
                                                <Pause className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Stats Footer */}
                                <div className="flex items-center gap-6 mt-4 pt-4 border-t">
                                    <div className="text-sm">
                                        <span className="text-gray-500">Pending:</span>
                                        <span className="ml-1 font-medium text-orange-600">0</span>
                                    </div>
                                    <div className="text-sm">
                                        <span className="text-gray-500">Completed:</span>
                                        <span className="ml-1 font-medium text-gray-900">0</span>
                                    </div>
                                    <div className="text-sm">
                                        <span className="text-gray-500">Earnings:</span>
                                        <span className="ml-1 font-medium text-emerald-600">$0.00</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
