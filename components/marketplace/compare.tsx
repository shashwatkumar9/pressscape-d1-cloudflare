'use client';

import { X, Star, Clock, Link2, CheckCircle, Zap, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface Website {
    id: string;
    domain: string;
    category: string;
    domain_authority: number;
    domain_rating: number;
    organic_traffic: number;
    price_guest_post: number;
    link_type: string;
    turnaround_days: number;
    max_links?: number;
    average_rating: number;
    rating_count: number;
    completed_orders: number;
    completion_rate: number;
    verification_status: string;
}

interface CompareBarProps {
    selectedWebsites: Website[];
    onRemove: (id: string) => void;
    onClear: () => void;
    onCompare: () => void;
    maxSelections?: number;
}

interface CompareModalProps {
    websites: Website[];
    isOpen: boolean;
    onClose: () => void;
}

function formatPrice(cents: number): string {
    return `$${Math.round(cents * 1.25 / 100)}`;
}

function formatTraffic(traffic: number): string {
    if (traffic >= 1000000) return `${(traffic / 1000000).toFixed(1)}M`;
    if (traffic >= 1000) return `${(traffic / 1000).toFixed(0)}K`;
    return traffic.toString();
}

export function CompareBar({
    selectedWebsites,
    onRemove,
    onClear,
    onCompare,
    maxSelections = 5,
}: CompareBarProps) {
    if (selectedWebsites.length === 0) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg z-30 animate-in slide-in-from-bottom">
            <div className="max-w-7xl mx-auto px-4 py-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <span className="text-sm font-medium text-gray-700">
                            {selectedWebsites.length} of {maxSelections} selected
                        </span>
                        <div className="flex items-center gap-2">
                            {selectedWebsites.map((website) => (
                                <div
                                    key={website.id}
                                    className="flex items-center gap-2 px-3 py-1.5 bg-violet-50 rounded-lg"
                                >
                                    <span className="text-sm font-medium text-violet-700 max-w-24 truncate">
                                        {website.domain}
                                    </span>
                                    <button
                                        onClick={() => onRemove(website.id)}
                                        className="text-violet-400 hover:text-violet-600"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={onClear}
                            className="text-sm text-gray-500 hover:text-gray-700"
                        >
                            Clear all
                        </button>
                        <Button
                            onClick={onCompare}
                            disabled={selectedWebsites.length < 2}
                            className="gap-2"
                        >
                            Compare ({selectedWebsites.length})
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export function CompareModal({ websites, isOpen, onClose }: CompareModalProps) {
    if (!isOpen || websites.length === 0) return null;

    const metrics = [
        { label: 'Domain Authority', key: 'domain_authority' },
        { label: 'Domain Rating', key: 'domain_rating' },
        { label: 'Organic Traffic', key: 'organic_traffic', format: formatTraffic },
        { label: 'Guest Post Price', key: 'price_guest_post', format: formatPrice },
        { label: 'Turnaround', key: 'turnaround_days', suffix: ' days' },
        { label: 'Link Type', key: 'link_type' },
        { label: 'Max Links', key: 'max_links', default: 2 },
        { label: 'Completion Rate', key: 'completion_rate', suffix: '%' },
        { label: 'Rating', key: 'average_rating' },
        { label: 'Orders Completed', key: 'completed_orders' },
    ];

    const getBestValue = (key: string): string | null => {
        const values = websites.map(w => (w as any)[key]);
        if (key === 'price_guest_post') {
            const min = Math.min(...values.filter(v => v != null));
            return websites.find(w => w.price_guest_post === min)?.id || null;
        }
        if (key === 'turnaround_days') {
            const min = Math.min(...values.filter(v => v != null));
            return websites.find(w => w.turnaround_days === min)?.id || null;
        }
        if (['domain_authority', 'domain_rating', 'organic_traffic', 'completion_rate', 'average_rating', 'completed_orders'].includes(key)) {
            const max = Math.max(...values.filter(v => v != null));
            return websites.find(w => (w as any)[key] === max)?.id || null;
        }
        return null;
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="fixed inset-0 bg-black/50" onClick={onClose} />

            {/* Modal */}
            <div className="relative bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between z-10">
                    <h2 className="text-xl font-semibold text-gray-900">Compare Publishers</h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Comparison Table */}
                <div className="overflow-x-auto p-6">
                    <table className="w-full">
                        <thead>
                            <tr>
                                <th className="text-left p-3 bg-gray-50 font-medium text-gray-600 sticky left-0">
                                    Metric
                                </th>
                                {websites.map((website) => (
                                    <th key={website.id} className="p-3 bg-gray-50 min-w-40">
                                        <div className="flex flex-col items-center gap-2">
                                            <span className="font-semibold text-gray-900">{website.domain}</span>
                                            <span className="text-sm text-gray-500">{website.category}</span>
                                            <div className="flex gap-1">
                                                {website.verification_status === 'verified' && (
                                                    <CheckCircle className="w-4 h-4 text-green-600" />
                                                )}
                                                {website.turnaround_days <= 3 && (
                                                    <Zap className="w-4 h-4 text-blue-600" />
                                                )}
                                            </div>
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {metrics.map((metric) => {
                                const bestId = getBestValue(metric.key);
                                return (
                                    <tr key={metric.key} className="border-t">
                                        <td className="p-3 bg-gray-50 font-medium text-gray-600 sticky left-0">
                                            {metric.label}
                                        </td>
                                        {websites.map((website) => {
                                            const value = (website as any)[metric.key] ?? metric.default ?? 'N/A';
                                            const displayValue = metric.format
                                                ? metric.format(value)
                                                : `${value}${metric.suffix || ''}`;
                                            const isBest = bestId === website.id;

                                            return (
                                                <td key={website.id} className="p-3 text-center">
                                                    <span className={cn(
                                                        "font-medium",
                                                        isBest ? "text-green-600" : "text-gray-900"
                                                    )}>
                                                        {displayValue}
                                                        {isBest && <span className="text-xs ml-1">✓</span>}
                                                    </span>
                                                </td>
                                            );
                                        })}
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Footer */}
                <div className="sticky bottom-0 bg-white border-t p-4 flex justify-end gap-3">
                    <Button variant="outline" onClick={onClose}>
                        Close
                    </Button>
                    {websites.length === 1 && (
                        <Link href={`/marketplace/${websites[0].id}`}>
                            <Button className="gap-2">
                                View Details
                                <ExternalLink className="w-4 h-4" />
                            </Button>
                        </Link>
                    )}
                </div>
            </div>
        </div>
    );
}
