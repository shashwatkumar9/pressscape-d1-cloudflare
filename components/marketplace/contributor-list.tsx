'use client';

import { Star, Clock, DollarSign, Check } from 'lucide-react';

export interface Contributor {
    id: string;
    user_id: string;
    user_name: string;
    avatar_url: string | null;
    display_name: string | null;
    writing_price: number;
    bio: string | null;
    specialties: string[];
    completed_orders: number;
    average_rating: number;
    rating_count: number;
    turnaround_days: number;
}

interface ContributorListProps {
    contributors: Contributor[];
    selectedId: string | null;
    onSelect: (contributor: Contributor | null) => void;
    websiteWritingFee?: number; // Publisher's own writing fee
}

export default function ContributorList({
    contributors,
    selectedId,
    onSelect,
    websiteWritingFee
}: ContributorListProps) {
    if (contributors.length === 0 && !websiteWritingFee) {
        return null; // No writing options available
    }

    return (
        <div className="space-y-3">
            <h3 className="font-semibold text-gray-900">Choose a Content Writer</h3>
            <p className="text-sm text-gray-500">Select a writer to create your article, or write it yourself.</p>

            {/* I'll write my own content option */}
            <div
                onClick={() => onSelect(null)}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${selectedId === null
                        ? 'border-violet-500 bg-violet-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                            ✍️
                        </div>
                        <div>
                            <h4 className="font-medium text-gray-900">I&apos;ll write my own content</h4>
                            <p className="text-sm text-gray-500">Submit your article after ordering</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-900">Free</span>
                        {selectedId === null && (
                            <div className="w-5 h-5 rounded-full bg-violet-500 flex items-center justify-center">
                                <Check className="w-3 h-3 text-white" />
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Publisher writes option (if available) */}
            {websiteWritingFee && websiteWritingFee > 0 && (
                <div
                    onClick={() => onSelect({
                        id: 'publisher',
                        user_id: 'publisher',
                        user_name: 'Publisher',
                        avatar_url: null,
                        display_name: 'Publisher',
                        writing_price: websiteWritingFee,
                        bio: null,
                        specialties: [],
                        completed_orders: 0,
                        average_rating: 0,
                        rating_count: 0,
                        turnaround_days: 0
                    })}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${selectedId === 'publisher'
                            ? 'border-violet-500 bg-violet-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                                📰
                            </div>
                            <div>
                                <h4 className="font-medium text-gray-900">Publisher writes</h4>
                                <p className="text-sm text-gray-500">Website owner will create the content</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="font-bold text-green-600">+${(websiteWritingFee / 100).toFixed(0)}</span>
                            {selectedId === 'publisher' && (
                                <div className="w-5 h-5 rounded-full bg-violet-500 flex items-center justify-center">
                                    <Check className="w-3 h-3 text-white" />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Contributor options */}
            {contributors.map((contributor) => (
                <div
                    key={contributor.id}
                    onClick={() => onSelect(contributor)}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${selectedId === contributor.id
                            ? 'border-violet-500 bg-violet-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                >
                    <div className="flex items-start gap-3">
                        {/* Avatar */}
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center text-white font-bold flex-shrink-0">
                            {contributor.display_name?.[0] || contributor.user_name?.[0] || '?'}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                                <h4 className="font-medium text-gray-900">
                                    {contributor.display_name || contributor.user_name}
                                </h4>
                                {contributor.rating_count > 0 && (
                                    <div className="flex items-center gap-1 text-yellow-600">
                                        <Star className="w-3.5 h-3.5 fill-yellow-400" />
                                        <span className="text-xs font-medium">{contributor.average_rating?.toFixed(1)}</span>
                                        <span className="text-xs text-gray-400">({contributor.rating_count})</span>
                                    </div>
                                )}
                            </div>

                            {contributor.bio && (
                                <p className="text-sm text-gray-500 mt-0.5 line-clamp-1">{contributor.bio}</p>
                            )}

                            <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-500">
                                <div className="flex items-center gap-1">
                                    <Clock className="w-3.5 h-3.5" />
                                    <span>{contributor.turnaround_days} days</span>
                                </div>
                                <span>{contributor.completed_orders} articles</span>
                            </div>

                            {contributor.specialties && contributor.specialties.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                    {contributor.specialties.slice(0, 3).map((s, i) => (
                                        <span key={i} className="px-2 py-0.5 bg-violet-50 text-violet-700 text-xs rounded-full">
                                            {s}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Price & Selection */}
                        <div className="flex items-center gap-2 flex-shrink-0">
                            <span className="font-bold text-green-600">+${(contributor.writing_price / 100).toFixed(0)}</span>
                            {selectedId === contributor.id && (
                                <div className="w-5 h-5 rounded-full bg-violet-500 flex items-center justify-center">
                                    <Check className="w-3 h-3 text-white" />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
