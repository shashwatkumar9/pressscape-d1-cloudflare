'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';
import {
    Globe,
    ExternalLink,
    Star,
    TrendingUp,
    Clock,
    Link2,
    Heart,
    Ban,
    Eye,
    ShoppingCart,
    CheckCircle,
    Zap,
    Lock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PublisherCardProps {
    website: {
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
        link_type: string;
        turnaround_days: number;
        is_featured?: boolean;
        average_rating: number;
        rating_count: number;
        completed_orders: number;
        completion_rate: number;
        verification_status: string;
        is_indexed?: boolean;
        countries?: string[];
        languages?: string[];
        max_links?: number;
    };
    viewMode?: 'grid' | 'list';
    isFavorite?: boolean;
    isBlacklisted?: boolean;
    isSelected?: boolean;
    onFavorite?: () => void;
    onBlacklist?: () => void;
    onQuickView?: () => void;
    onSelect?: () => void;
    onAddToCart?: () => void;
    showActions?: boolean;
}

const COUNTRY_FLAGS: Record<string, string> = {
    US: '🇺🇸', GB: '🇬🇧', CA: '🇨🇦', IN: '🇮🇳', AE: '🇦🇪', NG: '🇳🇬', AU: '🇦🇺',
    DE: '🇩🇪', FR: '🇫🇷', ES: '🇪🇸', IT: '🇮🇹', NL: '🇳🇱', BR: '🇧🇷',
};

function formatTraffic(traffic: number): string {
    if (traffic >= 1000000) return `${(traffic / 1000000).toFixed(1)}M`;
    if (traffic >= 1000) return `${(traffic / 1000).toFixed(0)}K`;
    return traffic.toString();
}

function formatPrice(cents: number): string {
    return `$${Math.round(cents * 1.25 / 100)}`;
}

export function PublisherCard({
    website,
    viewMode = 'grid',
    isFavorite = false,
    isBlacklisted = false,
    isSelected = false,
    onFavorite,
    onBlacklist,
    onQuickView,
    onSelect,
    onAddToCart,
    showActions = true,
}: PublisherCardProps) {
    const isVerified = website.verification_status === 'verified';
    const isTopPerformer = website.average_rating >= 4.5 && website.completed_orders >= 10;
    const isFastDelivery = website.turnaround_days <= 3;

    // Grid View Card
    if (viewMode === 'grid') {
        return (
            <div
                className={cn(
                    "relative p-5 rounded-2xl border bg-white transition-all duration-200",
                    "hover:shadow-lg hover:border-violet-200",
                    website.is_featured && "border-violet-300 ring-2 ring-violet-100",
                    isSelected && "ring-2 ring-violet-500 border-violet-500"
                )}
            >
                {/* Selection Checkbox - moved below header to avoid overlap */}
                {onSelect && (
                    <button
                        onClick={onSelect}
                        className={cn(
                            "absolute top-20 left-3 w-5 h-5 rounded border-2 transition-colors z-10",
                            isSelected
                                ? "bg-violet-600 border-violet-600"
                                : "border-gray-300 hover:border-violet-400"
                        )}
                        aria-label="Select for comparison"
                    >
                        {isSelected && (
                            <CheckCircle className="w-4 h-4 text-white" />
                        )}
                    </button>
                )}

                {/* Featured Badge */}
                {website.is_featured && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <span className="px-3 py-1 bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-xs font-medium rounded-full">
                            Featured
                        </span>
                    </div>
                )}

                {/* Trust Badges */}
                <div className="absolute top-3 right-3 flex gap-1">
                    {isVerified && (
                        <span className="p-1 bg-green-100 rounded-full" title="Verified Publisher">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                        </span>
                    )}
                    {isTopPerformer && (
                        <span className="p-1 bg-yellow-100 rounded-full" title="Top Performer">
                            <Star className="w-4 h-4 text-yellow-600" />
                        </span>
                    )}
                    {isFastDelivery && (
                        <span className="p-1 bg-blue-100 rounded-full" title="Fast Delivery">
                            <Zap className="w-4 h-4 text-blue-600" />
                        </span>
                    )}
                    {website.is_indexed && (
                        <span className="p-1 bg-purple-100 rounded-full" title="Google Indexed">
                            <Lock className="w-4 h-4 text-purple-600" />
                        </span>
                    )}
                </div>

                {/* Header - added padding to account for select button */}
                <div className="flex items-start gap-4 mb-4 mt-2 pl-8">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center flex-shrink-0">
                        <Globe className="w-6 h-6 text-white" />
                    </div>
                    <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-gray-900 truncate">{website.domain}</h3>
                        <p className="text-sm text-gray-500">{website.category || 'General'}</p>
                        <div className="flex items-center gap-1 mt-1">
                            {(website.countries || []).slice(0, 3).map(c => (
                                <span key={c} title={c}>{COUNTRY_FLAGS[c] || '🌍'}</span>
                            ))}
                            <span className="text-xs text-gray-500 ml-1">
                                {(website.languages || ['English'])[0]}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-3 gap-3 mb-4 p-3 rounded-xl bg-gray-50">
                    <div className="text-center">
                        <div className="text-lg font-bold text-gray-900">{website.domain_authority || 'N/A'}</div>
                        <div className="text-xs text-gray-500">DA</div>
                    </div>
                    <div className="text-center border-x border-gray-200">
                        <div className="text-lg font-bold text-gray-900">{website.domain_rating || 'N/A'}</div>
                        <div className="text-xs text-gray-500">DR</div>
                    </div>
                    <div className="text-center">
                        <div className="text-lg font-bold text-gray-900">{formatTraffic(website.organic_traffic || 0)}</div>
                        <div className="text-xs text-gray-500">Traffic</div>
                    </div>
                </div>

                {/* Completion Rate Bar */}
                <div className="mb-4">
                    <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-600">Completion Rate</span>
                        <span className="font-medium text-gray-900">{website.completion_rate || 100}%</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"
                            style={{ width: `${website.completion_rate || 100}%` }}
                        />
                    </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                    <span className={cn(
                        "px-2 py-1 rounded-full text-xs font-medium",
                        website.link_type === 'dofollow'
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-600"
                    )}>
                        {website.link_type}
                    </span>
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {website.turnaround_days} days
                    </span>
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-violet-100 text-violet-700 flex items-center gap-1">
                        <Link2 className="w-3 h-3" />
                        {website.max_links || 2} links
                    </span>
                </div>

                {/* Rating */}
                {website.rating_count > 0 && (
                    <div className="flex items-center gap-2 mb-4">
                        <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-yellow-500 fill-current" />
                            <span className="font-medium text-gray-900">{website.average_rating}</span>
                        </div>
                        <span className="text-sm text-gray-500">({website.rating_count} reviews)</span>
                    </div>
                )}

                {/* Inline Actions */}
                {showActions && (
                    <div className="flex items-center gap-2 mb-4">
                        <button
                            onClick={onFavorite}
                            className={cn(
                                "p-2 rounded-lg transition-colors",
                                isFavorite
                                    ? "text-red-500 bg-red-50 hover:bg-red-100"
                                    : "text-gray-400 hover:text-red-500 hover:bg-gray-100"
                            )}
                            title={isFavorite ? "Remove from favorites" : "Add to favorites"}
                        >
                            <Heart className={cn("w-4 h-4", isFavorite && "fill-current")} />
                        </button>
                        <button
                            onClick={onBlacklist}
                            className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                            title="Add to blacklist"
                        >
                            <Ban className="w-4 h-4" />
                        </button>
                        <button
                            onClick={onQuickView}
                            className="p-2 rounded-lg text-gray-400 hover:text-violet-600 hover:bg-violet-50 transition-colors"
                            title="Quick view"
                        >
                            <Eye className="w-4 h-4" />
                        </button>
                    </div>
                )}

                {/* Pricing & CTA */}
                <div className="flex items-center justify-between pt-4 border-t">
                    <div>
                        <p className="text-2xl font-bold text-gray-900">{formatPrice(website.price_guest_post)}</p>
                        <p className="text-sm text-gray-500">Guest Post</p>
                    </div>
                    <div className="flex gap-2">
                        <Button onClick={onAddToCart} size="sm" variant="outline" className="gap-1">
                            <ShoppingCart className="w-4 h-4" />
                        </Button>
                        <Link href={`/marketplace/${website.id}`}>
                            <Button size="sm" className="gap-1">
                                View
                                <ExternalLink className="w-3 h-3" />
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    // List View Card
    return (
        <div
            className={cn(
                "relative p-4 rounded-xl border bg-white transition-all duration-200",
                "hover:shadow-md hover:border-violet-200 overflow-hidden",
                isSelected && "ring-2 ring-violet-500 border-violet-500"
            )}
        >
            <div className="flex items-center gap-3 flex-wrap">
                {/* Selection Checkbox */}
                {onSelect && (
                    <button
                        onClick={onSelect}
                        className={cn(
                            "w-5 h-5 rounded border-2 flex-shrink-0 transition-colors",
                            isSelected
                                ? "bg-violet-600 border-violet-600"
                                : "border-gray-300 hover:border-violet-400"
                        )}
                        aria-label="Select for comparison"
                    >
                        {isSelected && <CheckCircle className="w-4 h-4 text-white" />}
                    </button>
                )}

                {/* Icon */}
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center flex-shrink-0">
                    <Globe className="w-5 h-5 text-white" />
                </div>

                {/* Domain & Category */}
                <div className="min-w-0 w-48 flex-shrink-0">
                    <h3 className="font-semibold text-gray-900 truncate">{website.domain}</h3>
                    <p className="text-sm text-gray-500 truncate">{website.category || 'General'}</p>
                </div>

                {/* Trust Badges */}
                <div className="hidden lg:flex gap-1 flex-shrink-0">
                    {isVerified && (
                        <span className="p-1 bg-green-100 rounded-full" title="Verified Publisher">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                        </span>
                    )}
                    {isTopPerformer && (
                        <span className="p-1 bg-yellow-100 rounded-full" title="Top Performer">
                            <Star className="w-4 h-4 text-yellow-600" />
                        </span>
                    )}
                    {isFastDelivery && (
                        <span className="p-1 bg-blue-100 rounded-full" title="Fast Delivery">
                            <Zap className="w-4 h-4 text-blue-600" />
                        </span>
                    )}
                </div>

                {/* Metrics */}
                <div className="hidden md:flex items-center gap-3 flex-shrink-0">
                    <div className="text-center w-12">
                        <div className="font-bold text-gray-900 text-sm">{website.domain_authority || '-'}</div>
                        <div className="text-xs text-gray-500">DA</div>
                    </div>
                    <div className="text-center w-12">
                        <div className="font-bold text-gray-900 text-sm">{website.domain_rating || '-'}</div>
                        <div className="text-xs text-gray-500">DR</div>
                    </div>
                    <div className="text-center w-16">
                        <div className="font-bold text-gray-900 text-sm">{formatTraffic(website.organic_traffic || 0)}</div>
                        <div className="text-xs text-gray-500">Traffic</div>
                    </div>
                </div>

                {/* Link Type & Turnaround */}
                <div className="hidden sm:flex items-center gap-2 flex-shrink-0">
                    <span className={cn(
                        "px-2 py-1 rounded text-xs font-medium",
                        website.link_type === 'dofollow' ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                    )}>
                        {website.link_type}
                    </span>
                    <span className="text-sm text-gray-500">{website.turnaround_days}d</span>
                </div>

                {/* Completion Rate */}
                <div className="hidden md:block w-20 flex-shrink-0">
                    <div className="text-sm font-medium text-gray-900">{website.completion_rate || 100}%</div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-green-500 rounded-full"
                            style={{ width: `${website.completion_rate || 100}%` }}
                        />
                    </div>
                </div>

                {/* Rating */}
                <div className="hidden sm:flex items-center gap-1 w-14 flex-shrink-0">
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    <span className="font-medium text-sm">{website.average_rating || '-'}</span>
                </div>

                {/* Price & Actions - Always visible */}
                <div className="flex items-center gap-2 ml-auto flex-shrink-0">
                    <div className="text-right">
                        <div className="font-bold text-gray-900 text-lg">{formatPrice(website.price_guest_post)}</div>
                        <div className="text-xs text-gray-500">Guest Post</div>
                    </div>
                    <div className="flex items-center gap-1">
                        <button onClick={onFavorite} className={cn("p-1.5 rounded-lg transition-colors", isFavorite ? "text-red-500" : "text-gray-400 hover:text-red-500")} title="Favorite">
                            <Heart className={cn("w-4 h-4", isFavorite && "fill-current")} />
                        </button>
                        <button onClick={onQuickView} className="p-1.5 rounded-lg text-gray-400 hover:text-violet-600" title="Quick View">
                            <Eye className="w-4 h-4" />
                        </button>
                        <Link href={`/marketplace/${website.id}`}>
                            <Button size="sm" className="px-3">View</Button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
