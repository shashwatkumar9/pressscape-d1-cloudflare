'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import {
    ChevronDown,
    ChevronUp,
    X,
    SlidersHorizontal,
    Link2,
    FileText,
    Award,
    Shield,
    RotateCcw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface AdvancedFiltersState {
    // Basic
    search: string;
    category: string;

    // SEO & Link
    linkType: string[];
    homepageLink: boolean | null;
    linkPosition: string[];

    // Metrics
    daMin: number | null;
    daMax: number | null;
    drMin: number | null;
    drMax: number | null;
    trafficMin: number | null;
    trafficMax: number | null;

    // Pricing
    priceMin: number | null;
    priceMax: number | null;

    // Content
    minWordCount: number | null;
    maxLinks: number | null;
    anchorTypes: string[];

    // Quality
    completionRateMin: number | null;
    deliveryDaysMax: number | null;

    // Trust
    verifiedOnly: boolean;
    indexedOnly: boolean;
    trafficTrend: string[];
    spamScoreMax: number | null;

    // Turnaround
    turnaroundMax: number | null;
}

const defaultFilters: AdvancedFiltersState = {
    search: '',
    category: '',
    linkType: [],
    homepageLink: null,
    linkPosition: [],
    daMin: null,
    daMax: null,
    drMin: null,
    drMax: null,
    trafficMin: null,
    trafficMax: null,
    priceMin: null,
    priceMax: null,
    minWordCount: null,
    maxLinks: null,
    anchorTypes: [],
    completionRateMin: null,
    deliveryDaysMax: null,
    verifiedOnly: false,
    indexedOnly: false,
    trafficTrend: [],
    spamScoreMax: null,
    turnaroundMax: null,
};

interface AdvancedFiltersProps {
    filters: AdvancedFiltersState;
    onChange: (filters: AdvancedFiltersState) => void;
    onClear: () => void;
    activeCount: number;
}

const categories = [
    { value: '', label: 'All Categories' },
    { value: 'technology', label: 'Technology' },
    { value: 'business-finance', label: 'Business & Finance' },
    { value: 'health-wellness', label: 'Health & Wellness' },
    { value: 'marketing-seo', label: 'Marketing & SEO' },
    { value: 'lifestyle', label: 'Lifestyle' },
    { value: 'travel', label: 'Travel' },
    { value: 'education', label: 'Education' },
    { value: 'crypto-blockchain', label: 'Crypto & Blockchain' },
    { value: 'news-media', label: 'News & Media' },
    { value: 'entertainment', label: 'Entertainment' },
    { value: 'sports', label: 'Sports' },
];

interface FilterSectionProps {
    title: string;
    icon: React.ReactNode;
    defaultOpen?: boolean;
    children: React.ReactNode;
}

function FilterSection({ title, icon, defaultOpen = false, children }: FilterSectionProps) {
    const [open, setOpen] = useState(defaultOpen);

    return (
        <div className="border-b border-gray-200 py-3">
            <button
                onClick={() => setOpen(!open)}
                className="w-full flex items-center justify-between text-sm font-medium text-gray-900 hover:text-gray-700"
            >
                <span className="flex items-center gap-2">
                    {icon}
                    {title}
                </span>
                {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            {open && <div className="mt-3 space-y-3">{children}</div>}
        </div>
    );
}

export function AdvancedFilters({ filters, onChange, onClear, activeCount }: AdvancedFiltersProps) {
    const [mobileOpen, setMobileOpen] = useState(false);

    const updateFilter = <K extends keyof AdvancedFiltersState>(
        key: K,
        value: AdvancedFiltersState[K]
    ) => {
        onChange({ ...filters, [key]: value });
    };

    const toggleArrayFilter = (key: 'linkType' | 'linkPosition' | 'anchorTypes' | 'trafficTrend', value: string) => {
        const current = filters[key];
        const next = current.includes(value)
            ? current.filter(v => v !== value)
            : [...current, value];
        updateFilter(key, next);
    };

    const FilterContent = () => (
        <div className="p-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <SlidersHorizontal className="w-5 h-5" />
                    Filters
                    {activeCount > 0 && (
                        <span className="px-2 py-0.5 bg-violet-100 text-violet-700 text-xs rounded-full">
                            {activeCount}
                        </span>
                    )}
                </h3>
                {activeCount > 0 && (
                    <button
                        onClick={onClear}
                        className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
                    >
                        <RotateCcw className="w-4 h-4" />
                        Clear all
                    </button>
                )}
            </div>

            {/* Category */}
            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                    value={filters.category}
                    onChange={(e) => updateFilter('category', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-violet-500"
                >
                    {categories.map(cat => (
                        <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                </select>
            </div>

            {/* SEO & Link Filters */}
            <FilterSection title="SEO & Links" icon={<Link2 className="w-4 h-4" />} defaultOpen>
                <div>
                    <label className="block text-xs font-medium text-gray-600 mb-2">Link Type</label>
                    <div className="flex flex-wrap gap-2">
                        {['dofollow', 'nofollow', 'sponsored'].map(type => (
                            <button
                                key={type}
                                onClick={() => toggleArrayFilter('linkType', type)}
                                className={cn(
                                    "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
                                    filters.linkType.includes(type)
                                        ? "bg-violet-100 text-violet-700"
                                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                )}
                            >
                                {type}
                            </button>
                        ))}
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-medium text-gray-600 mb-2">Homepage Link</label>
                    <div className="flex gap-2">
                        {[
                            { value: null, label: 'Any' },
                            { value: true, label: 'Available' },
                            { value: false, label: 'Not available' },
                        ].map(opt => (
                            <button
                                key={String(opt.value)}
                                onClick={() => updateFilter('homepageLink', opt.value)}
                                className={cn(
                                    "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
                                    filters.homepageLink === opt.value
                                        ? "bg-violet-100 text-violet-700"
                                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                )}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                    <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">DA Min</label>
                        <input
                            type="number"
                            value={filters.daMin ?? ''}
                            onChange={(e) => updateFilter('daMin', e.target.value ? Number(e.target.value) : null)}
                            placeholder="0"
                            className="w-full px-2 py-1.5 border rounded-lg text-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">DA Max</label>
                        <input
                            type="number"
                            value={filters.daMax ?? ''}
                            onChange={(e) => updateFilter('daMax', e.target.value ? Number(e.target.value) : null)}
                            placeholder="100"
                            className="w-full px-2 py-1.5 border rounded-lg text-sm"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                    <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">DR Min</label>
                        <input
                            type="number"
                            value={filters.drMin ?? ''}
                            onChange={(e) => updateFilter('drMin', e.target.value ? Number(e.target.value) : null)}
                            placeholder="0"
                            className="w-full px-2 py-1.5 border rounded-lg text-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">DR Max</label>
                        <input
                            type="number"
                            value={filters.drMax ?? ''}
                            onChange={(e) => updateFilter('drMax', e.target.value ? Number(e.target.value) : null)}
                            placeholder="100"
                            className="w-full px-2 py-1.5 border rounded-lg text-sm"
                        />
                    </div>
                </div>
            </FilterSection>

            {/* Content Rules */}
            <FilterSection title="Content Rules" icon={<FileText className="w-4 h-4" />}>
                <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Min Word Count</label>
                    <input
                        type="number"
                        value={filters.minWordCount ?? ''}
                        onChange={(e) => updateFilter('minWordCount', e.target.value ? Number(e.target.value) : null)}
                        placeholder="Any"
                        className="w-full px-2 py-1.5 border rounded-lg text-sm"
                    />
                </div>

                <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Max Outgoing Links</label>
                    <input
                        type="number"
                        value={filters.maxLinks ?? ''}
                        onChange={(e) => updateFilter('maxLinks', e.target.value ? Number(e.target.value) : null)}
                        placeholder="Any"
                        className="w-full px-2 py-1.5 border rounded-lg text-sm"
                    />
                </div>

                <div>
                    <label className="block text-xs font-medium text-gray-600 mb-2">Anchor Types Allowed</label>
                    <div className="flex flex-wrap gap-2">
                        {['branded', 'exact', 'url', 'generic'].map(type => (
                            <button
                                key={type}
                                onClick={() => toggleArrayFilter('anchorTypes', type)}
                                className={cn(
                                    "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
                                    filters.anchorTypes.includes(type)
                                        ? "bg-violet-100 text-violet-700"
                                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                )}
                            >
                                {type}
                            </button>
                        ))}
                    </div>
                </div>
            </FilterSection>

            {/* Quality */}
            <FilterSection title="Publisher Quality" icon={<Award className="w-4 h-4" />}>
                <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                        Min Completion Rate: {filters.completionRateMin ?? 0}%
                    </label>
                    <input
                        type="range"
                        min="0"
                        max="100"
                        value={filters.completionRateMin ?? 0}
                        onChange={(e) => updateFilter('completionRateMin', Number(e.target.value) || null)}
                        className="w-full accent-violet-600"
                    />
                </div>

                <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Max Delivery Days</label>
                    <select
                        value={filters.deliveryDaysMax ?? ''}
                        onChange={(e) => updateFilter('deliveryDaysMax', e.target.value ? Number(e.target.value) : null)}
                        className="w-full px-2 py-1.5 border rounded-lg text-sm"
                    >
                        <option value="">Any</option>
                        <option value="3">3 days or less</option>
                        <option value="5">5 days or less</option>
                        <option value="7">7 days or less</option>
                        <option value="14">14 days or less</option>
                    </select>
                </div>

                <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Max Turnaround</label>
                    <select
                        value={filters.turnaroundMax ?? ''}
                        onChange={(e) => updateFilter('turnaroundMax', e.target.value ? Number(e.target.value) : null)}
                        className="w-full px-2 py-1.5 border rounded-lg text-sm"
                    >
                        <option value="">Any</option>
                        <option value="3">Up to 3 days</option>
                        <option value="7">Up to 7 days</option>
                        <option value="14">Up to 14 days</option>
                    </select>
                </div>
            </FilterSection>

            {/* Trust & Safety */}
            <FilterSection title="Trust & Safety" icon={<Shield className="w-4 h-4" />}>
                <div className="space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={filters.verifiedOnly}
                            onChange={(e) => updateFilter('verifiedOnly', e.target.checked)}
                            className="w-4 h-4 rounded border-gray-300 text-violet-600 focus:ring-violet-500"
                        />
                        <span className="text-sm text-gray-700">Verified publishers only</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={filters.indexedOnly}
                            onChange={(e) => updateFilter('indexedOnly', e.target.checked)}
                            className="w-4 h-4 rounded border-gray-300 text-violet-600 focus:ring-violet-500"
                        />
                        <span className="text-sm text-gray-700">Google indexed only</span>
                    </label>
                </div>

                <div>
                    <label className="block text-xs font-medium text-gray-600 mb-2">Traffic Trend</label>
                    <div className="flex gap-2">
                        {['up', 'stable', 'down'].map(trend => (
                            <button
                                key={trend}
                                onClick={() => toggleArrayFilter('trafficTrend', trend)}
                                className={cn(
                                    "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1",
                                    filters.trafficTrend.includes(trend)
                                        ? "bg-violet-100 text-violet-700"
                                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                )}
                            >
                                {trend === 'up' && '📈'}
                                {trend === 'stable' && '➖'}
                                {trend === 'down' && '📉'}
                                {trend}
                            </button>
                        ))}
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                        Max Spam Score: {filters.spamScoreMax ?? 100}
                    </label>
                    <input
                        type="range"
                        min="0"
                        max="100"
                        value={filters.spamScoreMax ?? 100}
                        onChange={(e) => updateFilter('spamScoreMax', Number(e.target.value))}
                        className="w-full accent-violet-600"
                    />
                </div>
            </FilterSection>

            {/* Pricing */}
            <FilterSection title="Pricing" icon={<span className="text-sm">💰</span>}>
                <div className="grid grid-cols-2 gap-2">
                    <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Min ($)</label>
                        <input
                            type="number"
                            value={filters.priceMin ?? ''}
                            onChange={(e) => updateFilter('priceMin', e.target.value ? Number(e.target.value) : null)}
                            placeholder="0"
                            className="w-full px-2 py-1.5 border rounded-lg text-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Max ($)</label>
                        <input
                            type="number"
                            value={filters.priceMax ?? ''}
                            onChange={(e) => updateFilter('priceMax', e.target.value ? Number(e.target.value) : null)}
                            placeholder="Any"
                            className="w-full px-2 py-1.5 border rounded-lg text-sm"
                        />
                    </div>
                </div>
            </FilterSection>
        </div>
    );

    return (
        <>
            {/* Desktop Sidebar */}
            <aside className="hidden lg:block w-72 flex-shrink-0">
                <div className="sticky top-20 bg-white rounded-xl border shadow-sm max-h-[calc(100vh-6rem)] overflow-y-auto">
                    <FilterContent />
                </div>
            </aside>

            {/* Mobile Filter Button */}
            <div className="lg:hidden fixed bottom-4 left-4 z-40">
                <Button
                    onClick={() => setMobileOpen(true)}
                    className="gap-2 shadow-lg"
                >
                    <SlidersHorizontal className="w-4 h-4" />
                    Filters
                    {activeCount > 0 && (
                        <span className="px-1.5 py-0.5 bg-white/20 rounded-full text-xs">
                            {activeCount}
                        </span>
                    )}
                </Button>
            </div>

            {/* Mobile Filter Drawer */}
            {mobileOpen && (
                <div className="lg:hidden fixed inset-0 z-50 flex">
                    <div
                        className="fixed inset-0 bg-black/50"
                        onClick={() => setMobileOpen(false)}
                    />
                    <div className="relative w-80 max-w-[90vw] bg-white h-full overflow-y-auto ml-auto">
                        <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between">
                            <h3 className="font-semibold">Filters</h3>
                            <button onClick={() => setMobileOpen(false)}>
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <FilterContent />
                    </div>
                </div>
            )}
        </>
    );
}

export { defaultFilters };
export type { AdvancedFiltersState as FiltersState };
