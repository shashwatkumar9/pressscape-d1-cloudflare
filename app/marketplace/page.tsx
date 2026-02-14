'use client';

export const runtime = "edge";



import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
    ArrowLeft, Search, Globe, Loader2, Grid, List, X
} from 'lucide-react';
import { AdvancedFilters, defaultFilters, type FiltersState } from '@/components/marketplace/advanced-filters';
import { PublisherCard } from '@/components/marketplace/publisher-card';
import { QuickViewPanel } from '@/components/marketplace/quick-view-panel';
import { CompareBar, CompareModal } from '@/components/marketplace/compare';

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
    price_link_insertion: number;
    price_content_writing?: number;
    price_extra_link?: number;
    link_type: string;
    turnaround_days: number;
    is_featured: boolean;
    countries: string[];
    languages: string[];
    max_links: number;
    min_word_count?: number;
    max_word_count?: number;
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
    is_indexed?: boolean;
}

const sortOptions = [
    { value: 'relevance', label: 'Most Relevant' },
    { value: 'da_desc', label: 'DA: High to Low' },
    { value: 'da_asc', label: 'DA: Low to High' },
    { value: 'dr_desc', label: 'DR: High to Low' },
    { value: 'price_asc', label: 'Price: Low to High' },
    { value: 'price_desc', label: 'Price: High to Low' },
    { value: 'traffic_desc', label: 'Traffic: High to Low' },
    { value: 'rating_desc', label: 'Highest Rated' },
    { value: 'newest', label: 'Newest First' },
];

export default function MarketplacePage() {
    const [websites, setWebsites] = useState<Website[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [sort, setSort] = useState('relevance');
    const [total, setTotal] = useState(0);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [checkingAuth, setCheckingAuth] = useState(true);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [filters, setFilters] = useState<FiltersState>(defaultFilters);
    const [favorites, setFavorites] = useState<Set<string>>(new Set());
    const [blacklist, setBlacklist] = useState<Set<string>>(new Set());
    const [selectedForCompare, setSelectedForCompare] = useState<Website[]>([]);
    const [quickViewWebsite, setQuickViewWebsite] = useState<Website | null>(null);
    const [compareModalOpen, setCompareModalOpen] = useState(false);
    const loaderRef = useRef<HTMLDivElement>(null);

    // Count active filters
    const activeFilterCount = Object.entries(filters).filter(([key, value]) => {
        if (key === 'search' && !value) return false;
        if (key === 'category' && !value) return false;
        if (Array.isArray(value) && value.length === 0) return false;
        if (value === null || value === false) return false;
        if (typeof value === 'number' && value === 0) return false;
        return !!value;
    }).length;

    // Check auth status - redirect to login if not authenticated
    useEffect(() => {
        fetch('/api/auth/check')
            .then(res => res.json() as any)
            .then((data: any) => {
                if (!data.isAuthenticated) {
                    // Redirect to login with return URL
                    window.location.href = `/login?redirect=/marketplace`;
                } else {
                    setIsAuthenticated(true);
                    setCheckingAuth(false);
                }
            })
            .catch(() => {
                // On error, redirect to login
                window.location.href = `/login?redirect=/marketplace`;
            });
    }, []);

    // Load favorites from API
    useEffect(() => {
        if (isAuthenticated) {
            fetch('/api/buyer/favorites')
                .then(res => res.json() as any)
                .then((data: any) => {
                    if (data.favorites) {
                        setFavorites(new Set(data.favorites.map((f: any) => f.website_id)));
                    }
                })
                .catch(() => { });
        }
    }, [isAuthenticated]);

    // Build query params from filters
    const buildQueryParams = useCallback((pageNum: number) => {
        const params = new URLSearchParams({
            page: pageNum.toString(),
            limit: '24',
            sort,
        });

        if (filters.search) params.set('search', filters.search);
        if (filters.category) params.set('category', filters.category);
        if (filters.linkType.length) params.set('link_type', filters.linkType.join(','));
        if (filters.daMin) params.set('da_min', filters.daMin.toString());
        if (filters.daMax) params.set('da_max', filters.daMax.toString());
        if (filters.drMin) params.set('dr_min', filters.drMin.toString());
        if (filters.drMax) params.set('dr_max', filters.drMax.toString());
        if (filters.priceMin) params.set('price_min', (filters.priceMin * 100).toString());
        if (filters.priceMax) params.set('price_max', (filters.priceMax * 100).toString());
        if (filters.turnaroundMax) params.set('turnaround_max', filters.turnaroundMax.toString());
        if (filters.verifiedOnly) params.set('verified', 'true');
        if (filters.indexedOnly) params.set('indexed', 'true');

        return params;
    }, [filters, sort]);

    const fetchWebsites = useCallback(async (pageNum: number, reset = false) => {
        if (reset) setLoading(true);
        else setLoadingMore(true);

        try {
            const params = buildQueryParams(pageNum);
            const res = await fetch(`/api/marketplace?${params}`);
            const data = await res.json() as any;

            // Handle missing or error response gracefully
            const websiteList = data.websites || [];

            // Filter out blacklisted websites
            const filteredWebsites = websiteList.filter(
                (w: Website) => !blacklist.has(w.id)
            );

            if (reset) {
                setWebsites(filteredWebsites);
            } else {
                setWebsites(prev => [...prev, ...filteredWebsites]);
            }
            setHasMore(data.pagination?.hasMore ?? false);
            setTotal(data.pagination?.total ?? filteredWebsites.length);
        } catch (error) {
            console.error('Error fetching websites:', error);
            if (reset) {
                setWebsites([]);
                setTotal(0);
            }
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    }, [buildQueryParams, blacklist]);

    // Initial load - runs once on mount
    useEffect(() => {
        let mounted = true;

        const loadInitial = async () => {
            setLoading(true);
            try {
                const params = new URLSearchParams({
                    page: '1',
                    limit: '24',
                    sort: 'relevance',
                });
                const res = await fetch(`/api/marketplace?${params}`);
                const data = await res.json() as any;

                if (mounted && data.websites) {
                    setWebsites(data.websites);
                    setTotal(data.pagination?.total ?? data.websites.length);
                    setHasMore(data.pagination?.hasMore ?? false);
                }
            } catch (error) {
                console.error('Error loading initial websites:', error);
            } finally {
                if (mounted) {
                    setLoading(false);
                }
            }
        };

        loadInitial();

        return () => { mounted = false; };
    }, []);

    // Fetch when filters or sort change (but not on initial mount)
    const isFirstRender = useRef(true);
    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }

        setPage(1);
        fetchWebsites(1, true);
    }, [filters, sort, fetchWebsites]);

    // Infinite scroll
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasMore && !loadingMore && !loading) {
                    setPage(p => p + 1);
                }
            },
            { threshold: 0.1 }
        );

        if (loaderRef.current) {
            observer.observe(loaderRef.current);
        }

        return () => observer.disconnect();
    }, [hasMore, loadingMore, loading]);

    // Load more when page changes
    useEffect(() => {
        if (page > 1) {
            fetchWebsites(page);
        }
    }, [page, fetchWebsites]);

    // Handlers
    const handleFavorite = async (websiteId: string) => {
        if (!isAuthenticated) {
            window.location.href = `/login?redirect=/marketplace`;
            return;
        }

        const isFav = favorites.has(websiteId);
        const newFavorites = new Set(favorites);

        if (isFav) {
            newFavorites.delete(websiteId);
            await fetch(`/api/buyer/favorites/${websiteId}`, { method: 'DELETE' });
        } else {
            newFavorites.add(websiteId);
            await fetch('/api/buyer/favorites', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ website_id: websiteId }),
            });
        }

        setFavorites(newFavorites);
    };

    const handleBlacklist = async (websiteId: string) => {
        if (!isAuthenticated) {
            window.location.href = `/login?redirect=/marketplace`;
            return;
        }

        if (confirm('Add this publisher to your blacklist? They will be hidden from your search results.')) {
            const newBlacklist = new Set(blacklist);
            newBlacklist.add(websiteId);
            setBlacklist(newBlacklist);

            await fetch('/api/buyer/blacklist', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ website_id: websiteId }),
            });

            // Remove from results
            setWebsites(prev => prev.filter(w => w.id !== websiteId));
        }
    };

    const handleSelect = (website: Website) => {
        const isSelected = selectedForCompare.some(w => w.id === website.id);
        if (isSelected) {
            setSelectedForCompare(prev => prev.filter(w => w.id !== website.id));
        } else if (selectedForCompare.length < 5) {
            setSelectedForCompare(prev => [...prev, website]);
        }
    };

    const handleClearFilters = () => {
        setFilters(defaultFilters);
    };

    // Show loading screen while checking authentication
    if (checkingAuth) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-violet-600 mx-auto mb-4" />
                    <p className="text-gray-600">Checking authentication...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="border-b bg-white sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center">
                            <span className="text-white font-bold text-sm">P</span>
                        </div>
                        <span className="font-bold text-xl text-gray-900">PressScape</span>
                    </Link>
                    <div className="flex items-center gap-4">
                        {isAuthenticated ? (
                            <>
                                <Link href="/buyer/dashboard"><Button variant="outline">Dashboard</Button></Link>
                                <Link href="/publisher/websites"><Button>My Websites</Button></Link>
                            </>
                        ) : (
                            <>
                                <Link href="/login"><Button variant="outline">Sign in</Button></Link>
                                <Link href="/signup"><Button>Get Started</Button></Link>
                            </>
                        )}
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Page Header */}
                <div className="flex items-center gap-4 mb-6">
                    <Link href="/" className="p-2 rounded-lg hover:bg-gray-100">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Publisher Marketplace</h1>
                        <p className="text-gray-600">{total} publishers available</p>
                    </div>
                </div>

                {/* Search & Controls Bar */}
                <div className="flex flex-wrap items-center gap-4 mb-6 p-4 bg-white rounded-xl border">
                    {/* Search */}
                    <div className="relative flex-1 min-w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by domain, niche, or keywords..."
                            value={filters.search}
                            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                            className="w-full pl-10 pr-4 py-3 border rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                        />
                        {filters.search && (
                            <button
                                onClick={() => setFilters({ ...filters, search: '' })}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </div>

                    {/* Sort */}
                    <select
                        value={sort}
                        onChange={(e) => setSort(e.target.value)}
                        className="px-4 py-3 border rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                    >
                        {sortOptions.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>

                    {/* View Toggle */}
                    <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-lg">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-white shadow text-violet-600' : 'text-gray-500 hover:text-gray-700'}`}
                            title="Grid view"
                        >
                            <Grid className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-white shadow text-violet-600' : 'text-gray-500 hover:text-gray-700'}`}
                            title="List view"
                        >
                            <List className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex gap-6">
                    {/* Filters Sidebar */}
                    <AdvancedFilters
                        filters={filters}
                        onChange={setFilters}
                        onClear={handleClearFilters}
                        activeCount={activeFilterCount}
                    />

                    {/* Results */}
                    <div className="flex-1 min-w-0">
                        {loading ? (
                            <div className="flex items-center justify-center py-20">
                                <Loader2 className="w-8 h-8 animate-spin text-violet-600" />
                            </div>
                        ) : websites.length === 0 ? (
                            <div className="text-center py-20">
                                <Globe className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900">No publishers found</h3>
                                <p className="text-gray-500 mt-1">Try adjusting your filters or search terms</p>
                                {activeFilterCount > 0 && (
                                    <Button onClick={handleClearFilters} variant="outline" className="mt-4">
                                        Clear all filters
                                    </Button>
                                )}
                            </div>
                        ) : (
                            <>
                                {/* Grid View */}
                                {viewMode === 'grid' ? (
                                    <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                                        {websites.map((website) => (
                                            <PublisherCard
                                                key={website.id}
                                                website={website}
                                                viewMode="grid"
                                                isFavorite={favorites.has(website.id)}
                                                isSelected={selectedForCompare.some(w => w.id === website.id)}
                                                onFavorite={() => handleFavorite(website.id)}
                                                onBlacklist={() => handleBlacklist(website.id)}
                                                onQuickView={() => setQuickViewWebsite(website)}
                                                onSelect={() => handleSelect(website)}
                                            />
                                        ))}
                                    </div>
                                ) : (
                                    /* List View */
                                    <div className="space-y-3">
                                        {websites.map((website) => (
                                            <PublisherCard
                                                key={website.id}
                                                website={website}
                                                viewMode="list"
                                                isFavorite={favorites.has(website.id)}
                                                isSelected={selectedForCompare.some(w => w.id === website.id)}
                                                onFavorite={() => handleFavorite(website.id)}
                                                onBlacklist={() => handleBlacklist(website.id)}
                                                onQuickView={() => setQuickViewWebsite(website)}
                                                onSelect={() => handleSelect(website)}
                                            />
                                        ))}
                                    </div>
                                )}

                                {/* Infinite Scroll Loader */}
                                <div ref={loaderRef} className="py-8 flex justify-center">
                                    {loadingMore && <Loader2 className="w-6 h-6 animate-spin text-violet-600" />}
                                    {!hasMore && websites.length > 0 && (
                                        <p className="text-gray-500">You've seen all {total} publishers</p>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Quick View Panel */}
            {quickViewWebsite && (
                <QuickViewPanel
                    website={quickViewWebsite}
                    isOpen={!!quickViewWebsite}
                    onClose={() => setQuickViewWebsite(null)}
                />
            )}

            {/* Compare Bar */}
            <CompareBar
                selectedWebsites={selectedForCompare}
                onRemove={(id) => setSelectedForCompare(prev => prev.filter(w => w.id !== id))}
                onClear={() => setSelectedForCompare([])}
                onCompare={() => setCompareModalOpen(true)}
            />

            {/* Compare Modal */}
            <CompareModal
                websites={selectedForCompare}
                isOpen={compareModalOpen}
                onClose={() => setCompareModalOpen(false)}
            />
        </div>
    );
}
