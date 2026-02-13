export const runtime = "edge";

import { sql } from '@/lib/db';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {

    ArrowLeft, Globe, Clock, Link2,
    ShoppingCart, FileText, Check, Users, Languages, Star, DollarSign, Pen
} from 'lucide-react';
import WebsiteReviews from '@/components/marketplace/website-reviews';


interface Website {
    id: string;
    domain: string;
    name: string;
    category: string;
    domain_authority: number;
    domain_rating: number;
    organic_traffic: number;
    price_guest_post: number;
    price_link_insertion: number;
    link_type: string;
    turnaround_days: number;
    max_links: number;
    countries: string[];
    languages: string[];
    is_featured: boolean;
    average_rating: number;
    rating_count: number;
}

interface Review {
    id: string;
    buyer_name: string;
    buyer_rating: number;
    buyer_review: string | null;
    reviewed_at: string;
}

interface Contributor {
    id: string;
    user_name: string;
    display_name: string | null;
    writing_price: number;
    bio: string | null;
    specialties: string[];
    completed_orders: number;
    average_rating: number;
    rating_count: number;
    turnaround_days: number;
}

const COUNTRY_FLAGS: Record<string, string> = {
    US: '🇺🇸', GB: '🇬🇧', CA: '🇨🇦', IN: '🇮🇳', AE: '🇦🇪', NG: '🇳🇬', AU: '🇦🇺'
};

async function getWebsite(id: string): Promise<Website | null> {
    try {
        const result = await sql`
      SELECT 
        w.id, w.domain, w.name, w.domain_authority, w.domain_rating,
        w.organic_traffic, w.price_guest_post, w.price_link_insertion,
        w.link_type, w.turnaround_days, w.max_links, w.countries,
        w.languages, w.is_featured, w.average_rating, w.rating_count,
        c.name as category
      FROM websites w
      LEFT JOIN categories c ON w.primary_category_id = c.id
      WHERE w.id = ${id} AND w.is_active = true
    `;
        return (result.rows[0] as unknown as Website) || null;
    } catch {
        return null;
    }
}

async function getWebsiteReviews(websiteId: string): Promise<Review[]> {
    try {
        const result = await sql`
            SELECT 
                o.id, o.buyer_rating, o.buyer_review, o.reviewed_at,
                u.name as buyer_name
            FROM orders o
            JOIN users u ON o.buyer_id = u.id
            WHERE o.website_id = ${websiteId}
            AND o.buyer_rating IS NOT NULL
            ORDER BY o.reviewed_at DESC
            LIMIT 10
        `;
        return result.rows as unknown as Review[];
    } catch {
        return [];
    }
}

async function getContributors(websiteId: string): Promise<Contributor[]> {
    try {
        const result = await sql`
            SELECT 
                wc.id,
                u.name as user_name,
                wc.display_name,
                wc.writing_price,
                wc.bio,
                wc.specialties,
                wc.completed_orders,
                wc.average_rating,
                wc.rating_count,
                wc.turnaround_days
            FROM website_contributors wc
            JOIN users u ON wc.user_id = u.id
            WHERE wc.website_id = ${websiteId}
              AND wc.is_active = true
              AND wc.is_approved = true
            ORDER BY wc.average_rating DESC, wc.completed_orders DESC
            LIMIT 5
        `;
        return result.rows as unknown as Contributor[];
    } catch {
        return [];
    }
}

export default async function WebsiteDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const website = await getWebsite(id);

    if (!website) {
        notFound();
    }

    const reviews = await getWebsiteReviews(id);
    const contributors = await getContributors(id);

    const formatTraffic = (traffic: number) => {
        if (traffic >= 1000000) return `${(traffic / 1000000).toFixed(1)}M`;
        if (traffic >= 1000) return `${(traffic / 1000).toFixed(0)}K`;
        return traffic.toString();
    };

    const formatPrice = (cents: number) => Math.round(cents * 1.25 / 100);

    const guestPostPrice = formatPrice(website.price_guest_post || 0);
    const linkInsertionPrice = website.price_link_insertion
        ? formatPrice(website.price_link_insertion)
        : null;

    const countries = website.countries || ['US', 'GB', 'CA'];
    const languages = website.languages || ['English'];

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="border-b bg-white">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center">
                    <Link href="/marketplace" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
                        <ArrowLeft className="w-5 h-5" />
                        Back to Marketplace
                    </Link>
                </div>
            </header>

            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Website Header */}
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-start gap-4">
                                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center flex-shrink-0">
                                        <Globe className="w-8 h-8 text-white" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 flex-wrap">
                                            <h1 className="text-2xl font-bold text-gray-900">{website.domain}</h1>
                                            {website.is_featured && (
                                                <span className="px-3 py-1 bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-xs font-medium rounded-full">
                                                    Featured
                                                </span>
                                            )}
                                            {/* Rating Badge */}
                                            {website.rating_count > 0 && (
                                                <div className="flex items-center gap-1 px-2 py-1 bg-yellow-50 rounded-full">
                                                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                                    <span className="text-sm font-medium text-yellow-700">
                                                        {Number(website.average_rating || 0).toFixed(1)}
                                                    </span>
                                                    <span className="text-xs text-yellow-600">
                                                        ({website.rating_count})
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                        <p className="text-gray-600 mt-1">{website.category || 'General'}</p>

                                        {/* Countries & Languages */}
                                        <div className="flex flex-wrap items-center gap-4 mt-3">
                                            <div className="flex items-center gap-2">
                                                <Users className="w-4 h-4 text-gray-400" />
                                                {countries.slice(0, 3).map((c: string) => (
                                                    <span key={c} className="text-sm">
                                                        {COUNTRY_FLAGS[c] || '🌍'}
                                                    </span>
                                                ))}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Languages className="w-4 h-4 text-gray-400" />
                                                <span className="text-sm text-gray-600">{languages.join(', ')}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Metrics */}
                        <Card>
                            <CardContent className="p-6">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4">Website Metrics</h2>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div className="p-4 rounded-xl bg-violet-50 text-center">
                                        <div className="text-3xl font-bold text-violet-700">{website.domain_authority || 'N/A'}</div>
                                        <div className="text-sm text-violet-600 mt-1">Domain Authority</div>
                                    </div>
                                    <div className="p-4 rounded-xl bg-indigo-50 text-center">
                                        <div className="text-3xl font-bold text-indigo-700">{website.domain_rating || 'N/A'}</div>
                                        <div className="text-sm text-indigo-600 mt-1">Domain Rating</div>
                                    </div>
                                    <div className="p-4 rounded-xl bg-emerald-50 text-center">
                                        <div className="text-3xl font-bold text-emerald-700">{formatTraffic(website.organic_traffic || 0)}</div>
                                        <div className="text-sm text-emerald-600 mt-1">Monthly Traffic</div>
                                    </div>
                                    <div className="p-4 rounded-xl bg-blue-50 text-center">
                                        <div className="text-3xl font-bold text-blue-700">{website.turnaround_days || 3}</div>
                                        <div className="text-sm text-blue-600 mt-1">Days Turnaround</div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* What's Included */}
                        <Card>
                            <CardContent className="p-6">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4">What&apos;s Included</h2>
                                <div className="grid md:grid-cols-2 gap-3">
                                    {[
                                        `${website.link_type === 'dofollow' ? 'Dofollow' : 'Nofollow'} backlink`,
                                        `Up to ${website.max_links || 2} links allowed`,
                                        'Permanent placement',
                                        '90-day link warranty',
                                        `${website.turnaround_days || 3} day turnaround`,
                                        'Quality content required',
                                    ].map((item, i) => (
                                        <div key={i} className="flex items-center gap-2">
                                            <Check className="w-5 h-5 text-green-500" />
                                            <span className="text-gray-700">{item}</span>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Content Writers Section */}
                        {contributors.length > 0 && (
                            <Card className="border-2 border-green-200">
                                <CardContent className="p-6">
                                    <div className="flex items-center gap-2 mb-4">
                                        <Pen className="w-5 h-5 text-green-600" />
                                        <h2 className="text-lg font-semibold text-gray-900">Content Writers</h2>
                                    </div>
                                    <p className="text-sm text-gray-500 mb-4">
                                        Select a writer to create your article when ordering. Prices shown are in addition to the base posting fee.
                                    </p>
                                    <div className="space-y-3">
                                        {contributors.map((contributor) => (
                                            <div key={contributor.id} className="p-3 rounded-lg bg-green-50 border border-green-100">
                                                <div className="flex items-start gap-3">
                                                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                                                        {contributor.display_name?.[0] || contributor.user_name?.[0] || '?'}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 flex-wrap">
                                                            <span className="font-medium text-gray-900">
                                                                {contributor.display_name || contributor.user_name}
                                                            </span>
                                                            {contributor.rating_count > 0 && (
                                                                <div className="flex items-center gap-1 text-yellow-600">
                                                                    <Star className="w-3.5 h-3.5 fill-yellow-400" />
                                                                    <span className="text-xs">{Number(contributor.average_rating || 0).toFixed(1)}</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                                                            <span className="flex items-center gap-1">
                                                                <Clock className="w-3.5 h-3.5" />
                                                                {contributor.turnaround_days} days
                                                            </span>
                                                            <span>{contributor.completed_orders} articles</span>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <span className="font-bold text-green-600">+${(contributor.writing_price / 100).toFixed(0)}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <p className="text-xs text-gray-400 mt-3">
                                        You can select a writer during checkout, or write your own content.
                                    </p>
                                </CardContent>
                            </Card>
                        )}

                        {/* Reviews Section */}
                        <Card>
                            <CardContent className="p-6">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4">Customer Reviews</h2>
                                <WebsiteReviews
                                    reviews={reviews}
                                    averageRating={website.average_rating || 0}
                                    totalReviews={website.rating_count || 0}
                                />
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar - Order Options */}
                    <div className="space-y-4">
                        {/* Guest Post Option */}
                        <Card className="border-2 border-violet-200">
                            <CardContent className="p-6">
                                <div className="flex items-center gap-2 mb-4">
                                    <FileText className="w-5 h-5 text-violet-600" />
                                    <h3 className="font-semibold text-gray-900">Guest Post</h3>
                                </div>
                                <p className="text-sm text-gray-600 mb-4">
                                    Write and submit your article with up to {website.max_links || 2} {website.link_type} links.
                                </p>
                                <div className="text-3xl font-bold text-gray-900 mb-4">${guestPostPrice}</div>
                                <Link href={`/order/new?website=${website.id}&type=guest_post`}>
                                    <Button className="w-full gap-2" size="lg">
                                        <ShoppingCart className="w-5 h-5" />
                                        Order Guest Post
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>

                        {/* Link Insertion Option */}
                        {linkInsertionPrice && (
                            <Card>
                                <CardContent className="p-6">
                                    <div className="flex items-center gap-2 mb-4">
                                        <Link2 className="w-5 h-5 text-indigo-600" />
                                        <h3 className="font-semibold text-gray-900">Link Insertion</h3>
                                    </div>
                                    <p className="text-sm text-gray-600 mb-4">
                                        Add your link to an existing article. Just provide anchor text and URL.
                                    </p>
                                    <div className="text-3xl font-bold text-gray-900 mb-4">${linkInsertionPrice}</div>
                                    <Link href={`/order/new?website=${website.id}&type=link_insertion`}>
                                        <Button variant="outline" className="w-full gap-2" size="lg">
                                            <Link2 className="w-5 h-5" />
                                            Order Link Insertion
                                        </Button>
                                    </Link>
                                </CardContent>
                            </Card>
                        )}

                        {/* Trust Badges */}
                        <Card>
                            <CardContent className="p-4">
                                <div className="space-y-3 text-sm">
                                    <div className="flex items-center gap-2 text-gray-600">
                                        <Check className="w-4 h-4 text-green-500" />
                                        <span>Secure payment via Stripe</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-600">
                                        <Check className="w-4 h-4 text-green-500" />
                                        <span>90-day link warranty</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-600">
                                        <Check className="w-4 h-4 text-green-500" />
                                        <span>Money-back guarantee</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
