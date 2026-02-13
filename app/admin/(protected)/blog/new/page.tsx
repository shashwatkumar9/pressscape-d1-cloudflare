'use client';

export const runtime = "edge";



import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { BlogEditor, BlogData } from '@/components/editor/blog-editor';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function NewBlogPage() {
    const router = useRouter();
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async (data: BlogData) => {
        try {
            setIsSaving(true);
            const response = await fetch('/api/admin/blog', {
                method: 'POST',
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
            const response = await fetch('/api/admin/blog', {
                method: 'POST',
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

    return (
        <div className="min-h-screen bg-slate-900 py-8 px-4">
            <div className="max-w-5xl mx-auto mb-6">
                <Link
                    href="/admin/blog"
                    className="inline-flex items-center gap-2 text-slate-300 hover:text-white transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Blog
                </Link>
                <h1 className="text-3xl font-bold text-white mt-4">Create New Blog Post</h1>
                <p className="text-slate-400 mt-1">Write and publish a new article</p>
            </div>

            <BlogEditor
                onSave={handleSave}
                onPublish={handlePublish}
                isSaving={isSaving}
            />
        </div>
    );
}
