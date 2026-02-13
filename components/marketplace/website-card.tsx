import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
    Globe,
    ExternalLink,
    Star,
    TrendingUp,
    Clock,
    Link2,
    Heart,
} from 'lucide-react';

interface WebsiteCardProps {
    website: {
        id: string;
        domain: string;
        name: string;
        category: string;
        description?: string;
        domainAuthority: number;
        domainRating: number;
        organicTraffic: number;
        priceGuestPost: number;
        priceLinkInsertion?: number;
        linkType: 'dofollow' | 'nofollow';
        turnaroundDays: number;
        offersWriting: boolean;
        averageRating: number;
        ratingCount: number;
        isFeatured?: boolean;
    };
    isSaved?: boolean;
    onSave?: () => void;
}

export function WebsiteCard({ website, isSaved, onSave }: WebsiteCardProps) {
    const formatTraffic = (traffic: number) => {
        if (traffic >= 1000000) return `${(traffic / 1000000).toFixed(1)}M`;
        if (traffic >= 1000) return `${(traffic / 1000).toFixed(0)}K`;
        return traffic.toString();
    };

    return (
        <div className={cn(
            "relative p-5 rounded-2xl border bg-white transition-all duration-200",
            "hover:shadow-lg hover:border-violet-200",
            website.isFeatured && "border-violet-300 ring-2 ring-violet-100"
        )}>
            {/* Featured Badge */}
            {website.isFeatured && (
                <div className="absolute -top-3 left-4">
                    <span className="px-3 py-1 bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-xs font-medium rounded-full">
                        Featured
                    </span>
                </div>
            )}

            {/* Save Button */}
            <button
                onClick={onSave}
                className={cn(
                    "absolute top-4 right-4 p-2 rounded-full transition-colors",
                    isSaved
                        ? "text-red-500 bg-red-50 hover:bg-red-100"
                        : "text-gray-400 hover:text-red-500 hover:bg-gray-100"
                )}
            >
                <Heart className={cn("w-5 h-5", isSaved && "fill-current")} />
            </button>

            {/* Header */}
            <div className="flex items-start gap-4 mb-4 pr-8">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center flex-shrink-0">
                    <Globe className="w-6 h-6 text-white" />
                </div>
                <div className="min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">{website.domain}</h3>
                    <p className="text-sm text-gray-500">{website.category}</p>
                </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-3 gap-3 mb-4 p-3 rounded-xl bg-gray-50">
                <div className="text-center">
                    <div className="text-lg font-bold text-gray-900">{website.domainAuthority}</div>
                    <div className="text-xs text-gray-500">DA</div>
                </div>
                <div className="text-center border-x border-gray-200">
                    <div className="text-lg font-bold text-gray-900">{website.domainRating}</div>
                    <div className="text-xs text-gray-500">DR</div>
                </div>
                <div className="text-center">
                    <div className="text-lg font-bold text-gray-900">{formatTraffic(website.organicTraffic)}</div>
                    <div className="text-xs text-gray-500">Traffic</div>
                </div>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-4">
                <span className={cn(
                    "px-2 py-1 rounded-full text-xs font-medium",
                    website.linkType === 'dofollow'
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-600"
                )}>
                    {website.linkType}
                </span>
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {website.turnaroundDays} days
                </span>
                {website.offersWriting && (
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-violet-100 text-violet-700">
                        Writing Available
                    </span>
                )}
            </div>

            {/* Rating */}
            {website.ratingCount > 0 && (
                <div className="flex items-center gap-2 mb-4">
                    <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        <span className="font-medium text-gray-900">{website.averageRating}</span>
                    </div>
                    <span className="text-sm text-gray-500">({website.ratingCount} reviews)</span>
                </div>
            )}

            {/* Pricing - 25% markup for platform fee */}
            <div className="flex items-center justify-between pt-4 border-t">
                <div>
                    <p className="text-2xl font-bold text-gray-900">${Math.round(website.priceGuestPost * 1.25 / 100)}</p>
                    <p className="text-sm text-gray-500">Guest Post</p>
                </div>
                <Link href={`/marketplace/${website.id}`}>
                    <Button className="gap-2">
                        View Details
                        <ExternalLink className="w-4 h-4" />
                    </Button>
                </Link>
            </div>
        </div>
    );
}
