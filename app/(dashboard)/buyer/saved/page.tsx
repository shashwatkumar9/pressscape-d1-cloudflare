export const runtime = 'edge';

import { sql } from '@/lib/db';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Globe, Heart, ShoppingCart, ArrowRight } from 'lucide-react';
import { WebsiteCard } from '@/components/marketplace/website-card';

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

interface SavedWebsite {
    id: string;
    domain: string;
    primary_category_id: string | null;
    domain_authority: number;
    domain_rating: number | null;
    organic_traffic: number;
    price_guest_post: number;
    saved_at: string;
}

async function getSavedWebsites(userId: string): Promise<SavedWebsite[]> {
    try {
        const result = await sql`
      SELECT w.*, sw.created_at as saved_at
      FROM saved_websites sw
      JOIN websites w ON sw.website_id = w.id
      WHERE sw.user_id = ${userId}
      ORDER BY sw.created_at DESC
    `;
        return result.rows as unknown as SavedWebsite[];
    } catch (error) {
        console.error('Error fetching saved websites:', error);
        return [];
    }
}

export default async function SavedWebsitesPage() {
    const session = await getSession();

    if (!session) {
        return (
            <div className="text-center py-12">
                <p>Please log in to view your saved items.</p>
                <Link href="/login"><Button className="mt-4">Login</Button></Link>
            </div>
        );
    }

    const websites = await getSavedWebsites(session.user_id as string);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Saved Websites</h1>
                <p className="text-gray-600 mt-1">Websites you've bookmarked for later</p>
            </div>

            {websites.length === 0 ? (
                <Card>
                    <CardContent className="py-16 text-center">
                        <Heart className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-900">No saved websites yet</h3>
                        <p className="text-gray-500 mt-2 mb-6 max-w-md mx-auto">
                            Browse the marketplace and click the heart icon to save websites you're interested in.
                        </p>
                        <Link href="/marketplace">
                            <Button size="lg" className="gap-2">
                                <Globe className="w-4 h-4" />
                                Browse Marketplace
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {websites.map((website) => (
                        // Reusing the WebsiteCard logic but we might need to adapt it if it's not exported or if we want a simpler view
                        // For now let's create a simpler card specifically for saved items or reuse the marketplace card if possible
                        <div key={website.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all group">
                            <div className="p-5">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center text-white font-bold">
                                            {website.domain.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-900 truncate max-w-[150px]">{website.domain}</h3>
                                            <p className="text-xs text-gray-500 capitalize">{website.primary_category_id || 'General'}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-2 mb-4 p-2 bg-gray-50 rounded-lg">
                                    <div className="text-center">
                                        <div className="font-bold text-gray-900">{website.domain_authority}</div>
                                        <div className="text-[10px] text-gray-500 uppercase">DA</div>
                                    </div>
                                    <div className="text-center border-x border-gray-200">
                                        <div className="font-bold text-gray-900">{website.domain_rating || '-'}</div>
                                        <div className="text-[10px] text-gray-500 uppercase">DR</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="font-bold text-gray-900">
                                            {website.organic_traffic > 1000 ? `${(website.organic_traffic / 1000).toFixed(1)}k` : website.organic_traffic}
                                        </div>
                                        <div className="text-[10px] text-gray-500 uppercase">Traffic</div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-2">
                                    <div>
                                        <p className="text-lg font-bold text-gray-900">${(website.price_guest_post * 1.25 / 100).toFixed(0)}</p>
                                        <p className="text-xs text-gray-500">Guest Post</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <Link href={`/marketplace/${website.id}`}>
                                            <Button size="sm" className="h-9 w-full gap-2">
                                                Buy
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
