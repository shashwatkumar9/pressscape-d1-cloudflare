'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
    Search,
    SlidersHorizontal,
    X,
    ChevronDown,
} from 'lucide-react';

interface FiltersState {
    search: string;
    category: string;
    daMin: string;
    daMax: string;
    drMin: string;
    drMax: string;
    priceMin: string;
    priceMax: string;
    linkType: string;
    turnaround: string;
}

interface MarketplaceFiltersProps {
    onFiltersChange: (filters: FiltersState) => void;
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
];

export function MarketplaceFilters({ onFiltersChange }: MarketplaceFiltersProps) {
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [filters, setFilters] = useState<FiltersState>({
        search: '',
        category: '',
        daMin: '',
        daMax: '',
        drMin: '',
        drMax: '',
        priceMin: '',
        priceMax: '',
        linkType: '',
        turnaround: '',
    });

    const updateFilter = (key: keyof FiltersState, value: string) => {
        const newFilters = { ...filters, [key]: value };
        setFilters(newFilters);
        onFiltersChange(newFilters);
    };

    const clearFilters = () => {
        const emptyFilters: FiltersState = {
            search: '',
            category: '',
            daMin: '',
            daMax: '',
            drMin: '',
            drMax: '',
            priceMin: '',
            priceMax: '',
            linkType: '',
            turnaround: '',
        };
        setFilters(emptyFilters);
        onFiltersChange(emptyFilters);
    };

    const hasActiveFilters = Object.values(filters).some(v => v !== '');

    return (
        <div className="bg-white rounded-2xl border p-6 mb-8">
            {/* Search Bar */}
            <div className="flex gap-4 mb-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                        type="text"
                        placeholder="Search by domain, niche, or keyword..."
                        value={filters.search}
                        onChange={(e) => updateFilter('search', e.target.value)}
                        className="pl-10"
                    />
                </div>
                <select
                    value={filters.category}
                    onChange={(e) => updateFilter('category', e.target.value)}
                    className="h-11 px-4 rounded-lg border-2 border-gray-200 bg-white text-sm focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 outline-none"
                >
                    {categories.map((cat) => (
                        <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                </select>
                <Button
                    variant="outline"
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="gap-2"
                >
                    <SlidersHorizontal className="w-4 h-4" />
                    Filters
                    <ChevronDown className={`w-4 h-4 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
                </Button>
            </div>

            {/* Advanced Filters */}
            {showAdvanced && (
                <div className="pt-4 border-t">
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        {/* DA Range */}
                        <div className="space-y-2">
                            <Label className="text-xs">DA Min</Label>
                            <Input
                                type="number"
                                placeholder="0"
                                value={filters.daMin}
                                onChange={(e) => updateFilter('daMin', e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs">DA Max</Label>
                            <Input
                                type="number"
                                placeholder="100"
                                value={filters.daMax}
                                onChange={(e) => updateFilter('daMax', e.target.value)}
                            />
                        </div>

                        {/* DR Range */}
                        <div className="space-y-2">
                            <Label className="text-xs">DR Min</Label>
                            <Input
                                type="number"
                                placeholder="0"
                                value={filters.drMin}
                                onChange={(e) => updateFilter('drMin', e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs">DR Max</Label>
                            <Input
                                type="number"
                                placeholder="100"
                                value={filters.drMax}
                                onChange={(e) => updateFilter('drMax', e.target.value)}
                            />
                        </div>

                        {/* Price Range */}
                        <div className="space-y-2">
                            <Label className="text-xs">Price Min ($)</Label>
                            <Input
                                type="number"
                                placeholder="0"
                                value={filters.priceMin}
                                onChange={(e) => updateFilter('priceMin', e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs">Price Max ($)</Label>
                            <Input
                                type="number"
                                placeholder="Any"
                                value={filters.priceMax}
                                onChange={(e) => updateFilter('priceMax', e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                        {/* Link Type */}
                        <div className="space-y-2">
                            <Label className="text-xs">Link Type</Label>
                            <select
                                value={filters.linkType}
                                onChange={(e) => updateFilter('linkType', e.target.value)}
                                className="w-full h-11 px-4 rounded-lg border-2 border-gray-200 bg-white text-sm focus:border-violet-500 outline-none"
                            >
                                <option value="">Any</option>
                                <option value="dofollow">Dofollow Only</option>
                                <option value="nofollow">Nofollow</option>
                            </select>
                        </div>

                        {/* Turnaround */}
                        <div className="space-y-2">
                            <Label className="text-xs">Turnaround</Label>
                            <select
                                value={filters.turnaround}
                                onChange={(e) => updateFilter('turnaround', e.target.value)}
                                className="w-full h-11 px-4 rounded-lg border-2 border-gray-200 bg-white text-sm focus:border-violet-500 outline-none"
                            >
                                <option value="">Any</option>
                                <option value="3">3 days or less</option>
                                <option value="7">7 days or less</option>
                                <option value="14">14 days or less</option>
                            </select>
                        </div>

                        {/* Clear Button */}
                        {hasActiveFilters && (
                            <div className="flex items-end">
                                <Button variant="ghost" onClick={clearFilters} className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50">
                                    <X className="w-4 h-4" />
                                    Clear Filters
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
