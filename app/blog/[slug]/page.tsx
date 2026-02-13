export const runtime = "edge";

import { sql } from '@/lib/db';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Calendar, User, ArrowLeft } from 'lucide-react';
import { Metadata } from 'next';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';



interface BlogPost {
    id: string;
    title: string;
    slug: string;
    content: string;
    excerpt: string;
    category: string;
    cover_image: string | null;
    tags: string[];
    meta_title: string | null;
    meta_description: string | null;
    keywords: string | null;
    published_at: string;
    updated_at: string;
    author_name: string | null;
}

interface RelatedPost {
    id: string;
    title: string;
    slug: string;
    excerpt: string;
    cover_image: string | null;
    published_at: string;
}

async function getPostBySlug(slug: string): Promise<BlogPost | null> {
    try {
        const result = await sql`
            SELECT 
                bp.*,
                au.name as author_name,
                au.email as author_email
            FROM blog_posts bp
            LEFT JOIN admin_users au ON bp.author_id = au.id
            WHERE bp.slug = ${slug} AND bp.status = 'published'
        `;

        return (result.rows[0] as unknown as BlogPost) || null;
    } catch (error) {
        console.error('Error fetching blog post:', error);
        return null;
    }
}

async function getRelatedPosts(category: string, excludeId: string): Promise<RelatedPost[]> {
    try {
        const result = await sql`
            SELECT id, title, slug, excerpt, cover_image, published_at
            FROM blog_posts
            WHERE category = ${category} 
            AND id != ${excludeId}
            AND status = 'published'
            ORDER BY published_at DESC
            LIMIT 3
        `;

        return result.rows as unknown as RelatedPost[];
    } catch (error) {
        console.error('Error fetching related posts:', error);
        return [];
    }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params;
    const post = await getPostBySlug(slug);

    if (!post) {
        return {
            title: 'Post Not Found',
        };
    }

    return {
        title: post.meta_title || post.title,
        description: post.meta_description || post.excerpt,
        keywords: post.keywords?.split(',').map((k: string) => k.trim()) || [],
        openGraph: {
            title: post.meta_title || post.title,
            description: post.meta_description || post.excerpt,
            images: post.cover_image ? [post.cover_image] : [],
            type: 'article',
            publishedTime: post.published_at,
        },
        twitter: {
            card: 'summary_large_image',
            title: post.meta_title || post.title,
            description: post.meta_description || post.excerpt,
            images: post.cover_image ? [post.cover_image] : [],
        },
    };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const post = await getPostBySlug(slug);

    if (!post) {
        notFound();
    }

    const relatedPosts = await getRelatedPosts(post.category, post.id);
    const readingTime = Math.ceil(post.content.split(' ').length / 200); // 200 words per minute

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

                        <Link href="/blog">
                            <Button variant="ghost" size="sm" className="gap-2">
                                <ArrowLeft className="w-4 h-4" />
                                All Posts
                            </Button>
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Article */}
            <article className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto">
                    {/* Category Badge */}
                    <div className="mb-6">
                        <span className="px-4 py-2 bg-violet-100 text-violet-700 rounded-full text-sm font-medium">
                            {post.category}
                        </span>
                    </div>

                    {/* Title */}
                    <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                        {post.title}
                    </h1>

                    {/* Meta Info */}
                    <div className="flex items-center gap-6 text-gray-600 mb-8">
                        <div className="flex items-center gap-2">
                            <User className="w-5 h-5" />
                            <span>{post.author_name || 'PressScape Team'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Calendar className="w-5 h-5" />
                            <span>{new Date(post.published_at).toLocaleDateString('en-US', {
                                month: 'long',
                                day: 'numeric',
                                year: 'numeric',
                            })}</span>
                        </div>
                        <div>{readingTime} min read</div>
                    </div>

                    {/* Cover Image */}
                    {post.cover_image && (
                        <div className="mb-12 rounded-2xl overflow-hidden">
                            <img
                                src={post.cover_image}
                                alt={post.title}
                                className="w-full h-auto"
                            />
                        </div>
                    )}

                    {/* Content */}
                    <div
                        className="prose prose-lg prose-slate max-w-none
                            prose-headings:font-bold prose-headings:text-gray-900
                            prose-h2:text-3xl prose-h2:mt-12 prose-h2:mb-6
                            prose-h3:text-2xl prose-h3:mt-8 prose-h3:mb-4
                            prose-p:text-gray-700 prose-p:leading-relaxed
                            prose-a:text-violet-600 prose-a:no-underline hover:prose-a:underline
                            prose-strong:text-gray-900 prose-strong:font-semibold
                            prose-ul:my-6 prose-ol:my-6
                            prose-li:text-gray-700
                            prose-blockquote:border-l-4 prose-blockquote:border-violet-600 prose-blockquote:pl-6 prose-blockquote:italic
                            prose-code:text-violet-600 prose-code:bg-violet-50 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded
                            prose-pre:bg-gray-900 prose-pre:text-gray-100
                            prose-img:rounded-lg"
                        dangerouslySetInnerHTML={{ __html: post.content }}
                    />

                    {/* Tags */}
                    {post.tags && post.tags.length > 0 && (
                        <div className="mt-12 pt-8 border-t border-gray-200">
                            <div className="flex flex-wrap gap-2">
                                {post.tags.map((tag: string) => (
                                    <span
                                        key={tag}
                                        className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                                    >
                                        #{tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Share */}
                    <div className="mt-8 pt-8 border-t border-gray-200">
                        <div className="flex items-center gap-4">
                            <div className="font-semibold text-gray-900">Share this post:</div>
                            <div className="flex gap-2">
                                <a
                                    href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(`https://pressscape.com/blog/${post.slug}`)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                                >
                                    Twitter
                                </a>
                                <a
                                    href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(`https://pressscape.com/blog/${post.slug}`)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-4 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition-colors"
                                >
                                    LinkedIn
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </article>

            {/* Related Posts */}
            {relatedPosts.length > 0 && (
                <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
                    <div className="max-w-7xl mx-auto">
                        <h2 className="text-3xl font-bold text-gray-900 mb-8">Related Articles</h2>
                        <div className="grid md:grid-cols-3 gap-6">
                            {relatedPosts.map((related) => (
                                <Link key={related.id} href={`/blog/${related.slug}`}>
                                    <Card className="h-full hover:shadow-lg transition-shadow">
                                        {related.cover_image && (
                                            <img
                                                src={related.cover_image}
                                                alt={related.title}
                                                className="w-full h-48 object-cover rounded-t-lg"
                                            />
                                        )}
                                        <CardContent className="p-6">
                                            <h3 className="font-semibold text-lg text-gray-900 mb-2 line-clamp-2">
                                                {related.title}
                                            </h3>
                                            <p className="text-gray-600 text-sm line-clamp-3">
                                                {related.excerpt}
                                            </p>
                                            <div className="mt-4 text-sm text-gray-500">
                                                {new Date(related.published_at).toLocaleDateString()}
                                            </div>
                                        </CardContent>
                                    </Card>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* JSON-LD Structured Data */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        '@context': 'https://schema.org',
                        '@type': 'BlogPosting',
                        headline: post.title,
                        image: post.cover_image,
                        datePublished: post.published_at,
                        dateModified: post.updated_at,
                        author: {
                            '@type': 'Person',
                            name: post.author_name || 'PressScape Team',
                        },
                        publisher: {
                            '@type': 'Organization',
                            name: 'PressScape',
                            logo: {
                                '@type': 'ImageObject',
                                url: 'https://pressscape.com/logo.png',
                            },
                        },
                        description: post.excerpt,
                        keywords: post.keywords,
                    }),
                }}
            />
        </div>
    );
}
