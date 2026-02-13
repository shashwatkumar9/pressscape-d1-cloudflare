export const runtime = "edge";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Footer } from '@/components/shared/footer';
import { ArrowRight, Clock, User } from 'lucide-react';
import { sql } from '@/lib/db';



async function getBlogPosts(category?: string) {
    try {
        let query;
        if (category && category !== 'all') {
            query = sql`
                SELECT 
                    id, title, slug, excerpt, category, cover_image,
                    published_at, views
                FROM blog_posts
                WHERE status = 'published' AND category = ${category}
                ORDER BY published_at DESC
                LIMIT 20
            `;
        } else {
            query = sql`
                SELECT 
                    id, title, slug, excerpt, category, cover_image,
                    published_at, views
                FROM blog_posts
                WHERE status = 'published'
                ORDER BY published_at DESC
                LIMIT 20
            `;
        }

        const result = await query;
        return result.rows;
    } catch (error) {
        console.error('Error fetching blog posts:', error);
        return [];
    }
}

async function getFeaturedPosts() {
    try {
        const result = await sql`
            SELECT 
                id, title, slug, excerpt, category, cover_image,
                published_at, views
            FROM blog_posts
            WHERE status = 'published'
            ORDER BY views DESC
            LIMIT 3
        `;
        return result.rows;
    } catch (error) {
        console.error('Error fetching featured posts:', error);
        return [];
    }
}

const categories = [
    { id: 'all', name: 'All Posts' },
    { id: 'SEO Strategy', name: 'SEO Strategy' },
    { id: 'Link Building', name: 'Link Building' },
    { id: 'Guest Posting', name: 'Guest Posting' },
    { id: 'Publisher Tips', name: 'Publisher Tips' },
    { id: 'Analytics', name: 'Analytics' },
    { id: 'SEO Metrics', name: 'SEO Metrics' },
];

export default async function BlogPage({
    searchParams,
}: {
    searchParams: Promise<{ category?: string }>;
}) {
    const resolvedSearchParams = await searchParams;
    const selectedCategory = resolvedSearchParams.category || 'all';
    const posts = await getBlogPosts(selectedCategory);
    const featuredPosts = await getFeaturedPosts();

    const calculateReadTime = (content: string) => {
        const words = content?.split(' ').length || 0;
        return Math.ceil(words / 200);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-violet-50">
            {/* Header */}
            <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-lg bg-white/80 border-b border-gray-200/50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <Link href="/" className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center">
                                <span className="text-white font-bold text-sm">P</span>
                            </div>
                            <span className="font-bold text-xl text-gray-900">PressScape</span>
                        </Link>

                        <div className="flex items-center gap-4">
                            <Link href="/marketplace">
                                <Button variant="ghost">Marketplace</Button>
                            </Link>
                            <Link href="/login">
                                <Button className="bg-gradient-to-r from-violet-600 to-indigo-600">
                                    Get Started
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="pt-32 pb-16 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto text-center">
                    <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
                        SEO & Link Building{' '}
                        <span className="bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
                            Insights
                        </span>
                    </h1>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                        Expert guides on guest posting, link building, and SEO strategies to grow your online presence.
                    </p>
                </div>
            </section>

            {/* Featured Posts */}
            {featuredPosts.length > 0 && (
                <section className="pb-16 px-4 sm:px-6 lg:px-8">
                    <div className="max-w-7xl mx-auto">
                        <h2 className="text-3xl font-bold text-gray-900 mb-8">Featured Articles</h2>
                        <div className="grid md:grid-cols-3 gap-6">
                            {featuredPosts.map((post: any) => (
                                <Link key={post.id} href={`/blog/${post.slug}`}>
                                    <Card className="h-full hover:shadow-xl transition-shadow duration-300 group">
                                        {post.cover_image && (
                                            <div className="overflow-hidden rounded-t-lg">
                                                <img
                                                    src={post.cover_image}
                                                    alt={post.title}
                                                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                                                />
                                            </div>
                                        )}
                                        <CardContent className="p-6">
                                            <div className="flex items-center gap-2 mb-3">
                                                <span className="px-3 py-1 bg-violet-100 text-violet-700 rounded-full text-xs font-medium">
                                                    {post.category}
                                                </span>
                                            </div>
                                            <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-violet-600 transition-colors">
                                                {post.title}
                                            </h3>
                                            <p className="text-gray-600 mb-4 line-clamp-3">{post.excerpt}</p>
                                            <div className="flex items-center gap-4 text-sm text-gray-500">
                                                <span>{new Date(post.published_at).toLocaleDateString('en-US', {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    year: 'numeric',
                                                })}</span>
                                                <span>•</span>
                                                <span className="flex items-center gap-1">
                                                    <Clock className="w-4 h-4" />
                                                    {post.views || 0} views
                                                </span>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Category Filter */}
            <section className="pb-8 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-wrap gap-3">
                        {categories.map((cat) => (
                            <Link key={cat.id} href={`/blog?category=${cat.id}`}>
                                <Button
                                    variant={selectedCategory === cat.id ? 'default' : 'outline'}
                                    className={
                                        selectedCategory === cat.id
                                            ? 'bg-gradient-to-r from-violet-600 to-indigo-600'
                                            : ''
                                    }
                                >
                                    {cat.name}
                                </Button>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* All Posts */}
            <section className="pb-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <h2 className="text-3xl font-bold text-gray-900 mb-8">
                        {selectedCategory === 'all' ? 'All Posts' : selectedCategory}
                    </h2>

                    {posts.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-gray-500 text-lg">
                                No posts found in this category yet.
                            </p>
                        </div>
                    ) : (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {posts.map((post: any) => (
                                <Link key={post.id} href={`/blog/${post.slug}`}>
                                    <Card className="h-full hover:shadow-lg transition-shadow group">
                                        {post.cover_image && (
                                            <div className="overflow-hidden rounded-t-lg">
                                                <img
                                                    src={post.cover_image}
                                                    alt={post.title}
                                                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                                                />
                                            </div>
                                        )}
                                        <CardContent className="p-6">
                                            <div className="flex items-center gap-2 mb-3">
                                                <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                                                    {post.category}
                                                </span>
                                            </div>
                                            <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-violet-600 transition-colors">
                                                {post.title}
                                            </h3>
                                            <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                                                {post.excerpt}
                                            </p>
                                            <div className="flex items-center gap-3 text-xs text-gray-500">
                                                <span>
                                                    {new Date(post.published_at).toLocaleDateString('en-US', {
                                                        month: 'short',
                                                        day: 'numeric',
                                                    })}
                                                </span>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* Newsletter */}
            <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-violet-600 to-indigo-600">
                <div className="max-w-4xl mx-auto text-center text-white">
                    <h2 className="text-4xl font-bold mb-4">Stay Updated</h2>
                    <p className="text-xl mb-8 opacity-90">
                        Get the latest SEO insights and link building strategies delivered to your inbox.
                    </p>
                    <div className="flex gap-4 max-w-md mx-auto">
                        <input
                            type="email"
                            placeholder="Enter your email"
                            className="flex-1 px-6 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-white"
                        />
                        <Button className="bg-white text-violet-600 hover:bg-gray-100 px-8">
                            Subscribe
                        </Button>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
}
