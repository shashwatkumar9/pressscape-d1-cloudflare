'use client';

import { X, Globe, Star, Clock, Link2, CheckCircle, ExternalLink, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface Website {
    id: string;
    domain: string;
    name: string;
    category: string;
    description?: string;
    domain_authority: number;
    domain_rating: number;
    organic_traffic: number;
    price_guest_post: number;
    price_link_insertion?: number;
    price_content_writing?: number;
    price_extra_link?: number;
    link_type: string;
    turnaround_days: number;
    min_word_count?: number;
    max_word_count?: number;
    max_links?: number;
    allows_casino?: boolean;
    allows_cbd?: boolean;
    allows_adult?: boolean;
    allows_crypto?: boolean;
    sample_post_url?: string;
    average_rating: number;
    rating_count: number;
    completed_orders: number;
    completion_rate: number;
    verification_status: string;
}

interface QuickViewPanelProps {
    website: Website;
    isOpen: boolean;
    onClose: () => void;
    onAddToCart?: () => void;
}

function formatPrice(cents: number): string {
    return `$${Math.round(cents * 1.25 / 100)}`;
}

function formatTraffic(traffic: number): string {
    if (traffic >= 1000000) return `${(traffic / 1000000).toFixed(1)}M`;
    if (traffic >= 1000) return `${(traffic / 1000).toFixed(0)}K`;
    return traffic.toString();
}

export function QuickViewPanel({ website, isOpen, onClose, onAddToCart }: QuickViewPanelProps) {
    if (!isOpen) return null;

    const allowedNiches = [];
    if (website.allows_casino) allowedNiches.push('Casino');
    if (website.allows_cbd) allowedNiches.push('CBD');
    if (website.allows_adult) allowedNiches.push('Adult');
    if (website.allows_crypto) allowedNiches.push('Crypto');

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 z-40"
                onClick={onClose}
            />

            {/* Panel */}
            <div className="fixed right-0 top-0 h-full w-full max-w-lg bg-white shadow-2xl z-50 overflow-y-auto animate-in slide-in-from-right">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between z-10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center">
                            <Globe className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h2 className="font-semibold text-gray-900">{website.domain}</h2>
                            <p className="text-sm text-gray-500">{website.category}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Metrics */}
                    <div className="grid grid-cols-4 gap-4 p-4 bg-gray-50 rounded-xl">
                        <div className="text-center">
                            <div className="text-xl font-bold text-gray-900">{website.domain_authority}</div>
                            <div className="text-xs text-gray-500">DA</div>
                        </div>
                        <div className="text-center">
                            <div className="text-xl font-bold text-gray-900">{website.domain_rating}</div>
                            <div className="text-xs text-gray-500">DR</div>
                        </div>
                        <div className="text-center">
                            <div className="text-xl font-bold text-gray-900">{formatTraffic(website.organic_traffic)}</div>
                            <div className="text-xs text-gray-500">Traffic</div>
                        </div>
                        <div className="text-center">
                            <div className="text-xl font-bold text-gray-900 flex items-center justify-center gap-1">
                                <Star className="w-4 h-4 text-yellow-500 fill-current" />
                                {website.average_rating}
                            </div>
                            <div className="text-xs text-gray-500">{website.rating_count} reviews</div>
                        </div>
                    </div>

                    {/* Completion Rate */}
                    <div>
                        <div className="flex justify-between text-sm mb-2">
                            <span className="text-gray-600">Completion Rate</span>
                            <span className="font-semibold text-gray-900">{website.completion_rate}%</span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"
                                style={{ width: `${website.completion_rate}%` }}
                            />
                        </div>
                    </div>

                    {/* Description */}
                    {website.description && (
                        <div>
                            <h3 className="font-medium text-gray-900 mb-2">About</h3>
                            <p className="text-gray-600 text-sm">{website.description}</p>
                        </div>
                    )}

                    {/* Content Requirements */}
                    <div>
                        <h3 className="font-medium text-gray-900 mb-3">Content Requirements</h3>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="p-3 bg-gray-50 rounded-lg">
                                <div className="text-sm text-gray-500">Word Count</div>
                                <div className="font-medium">{website.min_word_count || 500} - {website.max_word_count || 2000}</div>
                            </div>
                            <div className="p-3 bg-gray-50 rounded-lg">
                                <div className="text-sm text-gray-500">Max Links</div>
                                <div className="font-medium">{website.max_links || 2} links</div>
                            </div>
                            <div className="p-3 bg-gray-50 rounded-lg">
                                <div className="text-sm text-gray-500">Link Type</div>
                                <div className={cn(
                                    "font-medium",
                                    website.link_type === 'dofollow' ? "text-green-600" : "text-gray-600"
                                )}>
                                    {website.link_type}
                                </div>
                            </div>
                            <div className="p-3 bg-gray-50 rounded-lg">
                                <div className="text-sm text-gray-500">Turnaround</div>
                                <div className="font-medium">{website.turnaround_days} days</div>
                            </div>
                        </div>
                    </div>

                    {/* Allowed Niches */}
                    {allowedNiches.length > 0 && (
                        <div>
                            <h3 className="font-medium text-gray-900 mb-3">Allowed Niches</h3>
                            <div className="flex flex-wrap gap-2">
                                {allowedNiches.map(niche => (
                                    <span
                                        key={niche}
                                        className="px-3 py-1 bg-green-100 text-green-700 text-sm rounded-full"
                                    >
                                        ✓ {niche}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Sample Post */}
                    {website.sample_post_url && (
                        <div>
                            <h3 className="font-medium text-gray-900 mb-2">Sample Post</h3>
                            <a
                                href={website.sample_post_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-violet-600 hover:text-violet-700 text-sm flex items-center gap-1"
                            >
                                View sample article
                                <ExternalLink className="w-3 h-3" />
                            </a>
                        </div>
                    )}

                    {/* Pricing */}
                    <div>
                        <h3 className="font-medium text-gray-900 mb-3">Pricing</h3>
                        <div className="space-y-2">
                            <div className="flex justify-between items-center p-3 bg-violet-50 rounded-lg">
                                <span className="font-medium text-violet-900">Guest Post</span>
                                <span className="text-xl font-bold text-violet-600">
                                    {formatPrice(website.price_guest_post)}
                                </span>
                            </div>
                            {website.price_link_insertion && (
                                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                    <span className="text-gray-700">Link Insertion</span>
                                    <span className="font-semibold text-gray-900">
                                        {formatPrice(website.price_link_insertion)}
                                    </span>
                                </div>
                            )}
                            {website.price_content_writing && (
                                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                    <span className="text-gray-700">Content Writing</span>
                                    <span className="font-semibold text-gray-900">
                                        +{formatPrice(website.price_content_writing)}
                                    </span>
                                </div>
                            )}
                            {website.price_extra_link && (
                                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                    <span className="text-gray-700">Extra Link</span>
                                    <span className="font-semibold text-gray-900">
                                        +{formatPrice(website.price_extra_link)}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer CTA */}
                <div className="sticky bottom-0 bg-white border-t p-4 flex gap-3">
                    <Button
                        onClick={onAddToCart}
                        variant="outline"
                        className="flex-1 gap-2"
                    >
                        <ShoppingCart className="w-4 h-4" />
                        Add to Cart
                    </Button>
                    <Link href={`/marketplace/${website.id}`} className="flex-1">
                        <Button className="w-full gap-2">
                            Order Now
                            <ExternalLink className="w-4 h-4" />
                        </Button>
                    </Link>
                </div>
            </div>
        </>
    );
}
