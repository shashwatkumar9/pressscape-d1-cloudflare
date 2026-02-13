'use client';

export const runtime = "edge";



import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { BlogEditor, BlogData } from '@/components/editor/blog-editor';
import { ArrowLeft, Loader2, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function EditBlogPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isDeleting, setIsDeleting] = useState(false);
    const [initialData, setInitialData] = useState<any>(null);
    const [postId, setPostId] = useState<string>('');

    useEffect(() => {
        // Handle potential Promise params in Next.js 15
        Promise.resolve(params).then((resolvedParams) => {
            setPostId(resolvedParams.id);
        });
    }, [params]);

    useEffect(() => {
        if (postId) {
            fetchBlogPost();
        }
    }, [postId]);

    const fetchBlogPost = async () => {
        try {
            const response = await fetch(`/api/admin/blog/${postId}`);
            if (!response.ok) throw new Error('Failed to fetch');

            const data = await response.json() as any;
            setInitialData({
                title: data.post.title,
                slug: data.post.slug,
                content: data.post.content,
                excerpt: data.post.excerpt || '',
                coverImage: data.post.cover_image || '',
                category: data.post.category,
                tags: data.post.tags || [],
                metaTitle: data.post.meta_title || '',
                metaDescription: data.post.meta_description || '',
                keywords: data.post.keywords || '',
            });
        } catch (error) {
            alert('Failed to load blog post');
            router.push('/admin/blog');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async (data: BlogData) => {
        try {
            setIsSaving(true);
            const response = await fetch(`/api/admin/blog/${postId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...data, status: 'draft' }),
            });

            if (!response.ok) {
                const error = await response.json() as any;
                throw new Error(error.error || 'Failed to save');
            }

            router.push('/admin/blog');
        } catch (error) {
            alert(error instanceof Error ? error.message : 'Failed to save blog post');
        } finally {
            setIsSaving(false);
        }
    };

    const handlePublish = async (data: BlogData) => {
        try {
            setIsSaving(true);
            const response = await fetch(`/api/admin/blog/${postId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...data, status: 'published' }),
            });

            if (!response.ok) {
                const error = await response.json() as any;
                throw new Error(error.error || 'Failed to publish');
            }

            router.push('/admin/blog');
        } catch (error) {
            alert(error instanceof Error ? error.message : 'Failed to publish blog post');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this blog post? This action cannot be undone.')) {
            return;
        }

        try {
            setIsDeleting(true);
            const response = await fetch(`/api/admin/blog/${postId}`, {
                method: 'DELETE',
            });

            if (!response.ok) throw new Error('Failed to delete');

            router.push('/admin/blog');
        } catch (error) {
            alert('Failed to delete blog post');
        } finally {
            setIsDeleting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-900 py-8 px-4">
            <div className="max-w-5xl mx-auto mb-6">
                <div className="flex items-center justify-between">
                    <div>
                        <Link
                            href="/admin/blog"
                            className="inline-flex items-center gap-2 text-slate-300 hover:text-white transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to Blog
                        </Link>
                        <h1 className="text-3xl font-bold text-white mt-4">Edit Blog Post</h1>
                        <p className="text-slate-400 mt-1">Update your article</p>
                    </div>
                    <Button
                        variant="outline"
                        className="text-red-500 border-red-500 hover:bg-red-500/10"
                        onClick={handleDelete}
                        disabled={isDeleting}
                    >
                        <Trash2 className="w-4 h-4 mr-2" />
                        {isDeleting ? 'Deleting...' : 'Delete'}
                    </Button>
                </div>
            </div>

            {initialData && (
                <BlogEditor
                    initialData={initialData}
                    onSave={handleSave}
                    onPublish={handlePublish}
                    isSaving={isSaving}
                />
            )}
        </div>
    );
}
