'use client';

import { useState, useEffect } from 'react';
import { BlogRichTextEditor } from './blog-rich-text-editor';
import { Button } from '@/components/ui/button';
import { Upload, X, Edit2, Check, AlertCircle, CheckCircle2 } from 'lucide-react';
import Image from 'next/image';

interface BlogEditorProps {
    initialData?: {
        title?: string;
        slug?: string;
        content?: string;
        excerpt?: string;
        coverImage?: string;
        category?: string;
        tags?: string[];
        metaTitle?: string;
        metaDescription?: string;
        keywords?: string;
    };
    onSave: (data: BlogData) => Promise<void>;
    onPublish: (data: BlogData) => Promise<void>;
    isSaving?: boolean;
}

export interface BlogData {
    title: string;
    slug: string;
    content: string;
    excerpt: string;
    coverImage: string;
    category: string;
    tags: string[];
    metaTitle: string;
    metaDescription: string;
    keywords: string;
}

const CATEGORIES = [
    'SEO Strategy',
    'Link Building',
    'Guest Posting',
    'Publisher Tips',
    'Industry News',
    'Case Studies',
];

function generateSlug(title: string): string {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
}

function calculateSEOScore(data: Partial<BlogData>): number {
    let score = 0;

    // Title (25 points)
    if (data.title) {
        if (data.title.length >= 40 && data.title.length <= 60) score += 25;
        else if (data.title.length >= 30) score += 15;
        else if (data.title.length >= 20) score += 10;
    }

    // Meta Title (15 points)
    if (data.metaTitle && data.metaTitle.length >= 50 && data.metaTitle.length <= 60) score += 15;
    else if (data.metaTitle && data.metaTitle.length >= 40) score += 10;

    // Meta Description (20 points)
    if (data.metaDescription && data.metaDescription.length >= 120 && data.metaDescription.length <= 160) score += 20;
    else if (data.metaDescription && data.metaDescription.length >= 100) score += 12;

    // Keywords (10 points)
    if (data.keywords && data.keywords.length > 10) score += 10;

    // Content (20 points)
    if (data.content) {
        const wordCount = data.content.split(/\s+/).length;
        if (wordCount >= 1000) score += 20;
        else if (wordCount >= 500) score += 12;
        else if (wordCount >= 300) score += 8;
    }

    // Excerpt (5 points)
    if (data.excerpt && data.excerpt.length >= 100) score += 5;

    // Cover Image (5 points)
    if (data.coverImage) score += 5;

    return Math.min(100, score);
}

export function BlogEditor({ initialData, onSave, onPublish, isSaving }: BlogEditorProps) {
    const [title, setTitle] = useState(initialData?.title || '');
    const [slug, setSlug] = useState(initialData?.slug || '');
    const [isEditingSlug, setIsEditingSlug] = useState(false);
    const [content, setContent] = useState(initialData?.content || '');
    const [excerpt, setExcerpt] = useState(initialData?.excerpt || '');
    const [coverImage, setCoverImage] = useState(initialData?.coverImage || '');
    const [isUploadingCover, setIsUploadingCover] = useState(false);
    const [category, setCategory] = useState(initialData?.category || CATEGORIES[0]);
    const [tagsInput, setTagsInput] = useState(initialData?.tags?.join(', ') || '');
    const [metaTitle, setMetaTitle] = useState(initialData?.metaTitle || '');
    const [metaDescription, setMetaDescription] = useState(initialData?.metaDescription || '');
    const [keywords, setKeywords] = useState(initialData?.keywords || '');
    const [seoScore, setSeoScore] = useState(0);

    // Auto-generate slug from title
    useEffect(() => {
        if (!isEditingSlug && title && !initialData?.slug) {
            setSlug(generateSlug(title));
        }
    }, [title, isEditingSlug, initialData?.slug]);

    // Auto-fill meta title from title
    useEffect(() => {
        if (title && !metaTitle) {
            setMetaTitle(title);
        }
    }, [title, metaTitle]);

    // Calculate SEO score
    useEffect(() => {
        const score = calculateSEOScore({
            title,
            metaTitle,
            metaDescription,
            keywords,
            content,
            excerpt,
            coverImage,
        });
        setSeoScore(score);
    }, [title, metaTitle, metaDescription, keywords, content, excerpt, coverImage]);

    const handleCoverImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            setIsUploadingCover(true);
            const formData = new FormData();
            formData.append('image', file);

            const response = await fetch('/api/upload/image', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) throw new Error('Upload failed');

            const data = await response.json() as any;
            setCoverImage(data.url);
        } catch (error) {
            alert('Failed to upload cover image');
            console.error(error);
        } finally {
            setIsUploadingCover(false);
        }
    };

    const handleImageUpload = async (file: File): Promise<string> => {
        const formData = new FormData();
        formData.append('image', file);

        const response = await fetch('/api/upload/image', {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) throw new Error('Upload failed');

        const data = await response.json() as any;
        return data.url;
    };

    const getBlogData = (): BlogData => ({
        title,
        slug,
        content,
        excerpt,
        coverImage,
        category,
        tags: tagsInput.split(',').map(t => t.trim()).filter(Boolean),
        metaTitle,
        metaDescription,
        keywords,
    });

    const handleSave = () => onSave(getBlogData());
    const handlePublish = () => onPublish(getBlogData());

    const getSEOColor = (score: number) => {
        if (score >= 80) return 'text-green-600 bg-green-100';
        if (score >= 60) return 'text-yellow-600 bg-yellow-100';
        return 'text-red-600 bg-red-100';
    };

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            {/* Cover Image */}
            <div className="bg-white rounded-xl border p-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                    Cover Image *
                </label>
                {coverImage ? (
                    <div className="relative aspect-video rounded-lg overflow-hidden group">
                        <Image
                            src={coverImage}
                            alt="Cover"
                            fill
                            className="object-cover"
                        />
                        <button
                            onClick={() => setCoverImage('')}
                            className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                ) : (
                    <label className="aspect-video border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-violet-500 transition-colors">
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleCoverImageUpload}
                            className="hidden"
                            disabled={isUploadingCover}
                        />
                        <Upload className="w-12 h-12 text-gray-400 mb-2" />
                        <span className="text-sm text-gray-500">
                            {isUploadingCover ? 'Uploading...' : 'Click to upload cover image'}
                        </span>
                        <span className="text-xs text-gray-400 mt-1">Max 5MB • JPG, PNG, WebP</span>
                    </label>
                )}
            </div>

            {/* Title & Slug */}
            <div className="bg-white rounded-xl border p-6 space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Title *
                    </label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Enter blog post title..."
                        className="w-full px-4 py-3 text-xl font-semibold text-gray-900 bg-white border rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none placeholder:text-gray-400"
                    />
                    <div className="mt-1 text-sm text-gray-500">{title.length} characters</div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        URL Slug
                    </label>
                    <div className="flex items-center gap-2">
                        <span className="text-gray-500">pressscape.com/blog/</span>
                        {isEditingSlug ? (
                            <>
                                <input
                                    type="text"
                                    value={slug}
                                    onChange={(e) => setSlug(generateSlug(e.target.value))}
                                    className="flex-1 px-3 py-2 text-gray-900 bg-white border rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none placeholder:text-gray-400"
                                />
                                <Button size="sm" onClick={() => setIsEditingSlug(false)}>
                                    <Check className="w-4 h-4" />
                                </Button>
                            </>
                        ) : (
                            <>
                                <span className="flex-1 text-violet-600 font-mono">{slug}</span>
                                <Button size="sm" variant="outline" onClick={() => setIsEditingSlug(true)}>
                                    <Edit2 className="w-4 h-4" />
                                </Button>
                            </>
                        )}
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Category *
                    </label>
                    <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full px-4 py-3 text-gray-900 bg-white border rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none"
                    >
                        {CATEGORIES.map((cat) => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tags (comma-separated)
                    </label>
                    <input
                        type="text"
                        value={tagsInput}
                        onChange={(e) => setTagsInput(e.target.value)}
                        placeholder="seo, link building, guest post"
                        className="w-full px-4 py-3 text-gray-900 bg-white border rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none placeholder:text-gray-400"
                    />
                </div>
            </div>

            {/* Content Editor */}
            <div className="bg-white rounded-xl border p-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                    Content *
                </label>
                <BlogRichTextEditor
                    content={content}
                    onChange={setContent}
                    onImageUpload={handleImageUpload}
                />
                <div className="mt-2 text-sm text-gray-500">
                    {content ? `${content.split(/\s+/).length} words` : '0 words'}
                </div>
            </div>

            {/* Excerpt */}
            <div className="bg-white rounded-xl border p-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Excerpt
                </label>
                <textarea
                    value={excerpt}
                    onChange={(e) => setExcerpt(e.target.value)}
                    placeholder="Brief summary of your post..."
                    rows={3}
                    className="w-full px-4 py-3 text-gray-900 bg-white border rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none resize-none placeholder:text-gray-400"
                />
                <div className="mt-1 text-sm text-gray-500">{excerpt.length} characters</div>
            </div>

            {/* SEO Section */}
            <div className="bg-white rounded-xl border p-6 space-y-4">
                <div className="flex  items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">SEO Optimization</h3>
                    <div className={`px-4 py-2 rounded-full font-semibold flex items-center gap-2 ${getSEOColor(seoScore)}`}>
                        {seoScore >= 80 ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                        Score: {seoScore}/100
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Meta Title
                    </label>
                    <input
                        type="text"
                        value={metaTitle}
                        onChange={(e) => setMetaTitle(e.target.value)}
                        placeholder="SEO-optimized title for search engines"
                        className="w-full px-4 py-3 text-gray-900 bg-white border rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none placeholder:text-gray-400"
                    />
                    <div className="mt-1 flex justify-between text-sm">
                        <span className={metaTitle.length < 50 || metaTitle.length > 60 ? 'text-yellow-600' : 'text-green-600'}>
                            {metaTitle.length} characters (ideal: 50-60)
                        </span>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Meta Description
                    </label>
                    <textarea
                        value={metaDescription}
                        onChange={(e) => setMetaDescription(e.target.value)}
                        placeholder="Compelling description for search results..."
                        rows={3}
                        className="w-full px-4 py-3 text-gray-900 bg-white border rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none resize-none placeholder:text-gray-400"
                    />
                    <div className="mt-1 flex justify-between text-sm">
                        <span className={metaDescription.length < 120 || metaDescription.length > 160 ? 'text-yellow-600' : 'text-green-600'}>
                            {metaDescription.length} characters (ideal: 120-160)
                        </span>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Focus Keywords
                    </label>
                    <input
                        type="text"
                        value={keywords}
                        onChange={(e) => setKeywords(e.target.value)}
                        placeholder="primary keyword, secondary keyword"
                        className="w-full px-4 py-3 text-gray-900 bg-white border rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none placeholder:text-gray-400"
                    />
                </div>

                {/* Search Preview */}
                <div className="border-t pt-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Search Preview</h4>
                    <div className="p-4 bg-gray-50 rounded-lg">
                        <div className="text-sm text-gray-500 mb-1">pressscape.com/blog/{slug}</div>
                        <div className="text-blue-600 text-lg mb-1">{metaTitle || title || 'Your Title Here'}</div>
                        <div className="text-gray-600 text-sm">{metaDescription || excerpt || 'Your meta description will appear here...'}</div>
                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between bg-white rounded-xl border p-6">
                <div className="text-sm text-gray-500">
                    {!title || !content || !coverImage ? (
                        <span className="text-red-600">* Required fields missing</span>
                    ) : (
                        <span className="text-green-600">✓ Ready to publish</span>
                    )}
                </div>
                <div className="flex gap-3">
                    <Button
                        variant="outline"
                        size="lg"
                        onClick={handleSave}
                        disabled={isSaving || !title || !content}
                    >
                        Save Draft
                    </Button>
                    <Button
                        size="lg"
                        onClick={handlePublish}
                        disabled={isSaving || !title || !content || !coverImage}
                        className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500"
                    >
                        {isSaving ? 'Publishing...' : 'Publish'}
                    </Button>
                </div>
            </div>
        </div>
    );
}
