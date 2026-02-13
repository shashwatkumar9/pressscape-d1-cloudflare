export const runtime = "edge";

import { sql } from '@/lib/db';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Plus, Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';



async function getBlogPosts() {
    try {
        const result = await sql`
      SELECT bp.*, au.name as author_name
      FROM blog_posts bp
      JOIN admin_users au ON bp.author_id = au.id
      ORDER BY bp.created_at DESC
      LIMIT 50
    `;
        return result.rows;
    } catch (error) {
        console.error('Error fetching blog posts:', error);
        return [];
    }
}

export default async function AdminBlogPage() {
    const posts = await getBlogPosts();

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white">Blog</h1>
                    <p className="text-slate-400 mt-1">Manage blog posts and content</p>
                </div>
                <Link href="/admin/blog/new">
                    <Button className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 gap-2">
                        <Plus className="w-4 h-4" />
                        New Post
                    </Button>
                </Link>
            </div>

            {/* Blog Posts Table */}
            <Card className="bg-slate-800 border-slate-700">
                <CardContent className="p-0">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-slate-700">
                                <th className="text-left p-4 text-sm font-medium text-slate-400">Title</th>
                                <th className="text-left p-4 text-sm font-medium text-slate-400">Author</th>
                                <th className="text-left p-4 text-sm font-medium text-slate-400">Category</th>
                                <th className="text-left p-4 text-sm font-medium text-slate-400">Status</th>
                                <th className="text-left p-4 text-sm font-medium text-slate-400">Views</th>
                                <th className="text-left p-4 text-sm font-medium text-slate-400">Date</th>
                                <th className="text-right p-4 text-sm font-medium text-slate-400">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {posts.map((post: any) => (
                                <tr key={post.id} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center">
                                                <FileText className="w-5 h-5 text-orange-400" />
                                            </div>
                                            <span className="font-medium text-white">{post.title}</span>
                                        </div>
                                    </td>
                                    <td className="p-4 text-slate-300">{post.author_name}</td>
                                    <td className="p-4">
                                        <span className="px-2 py-1 bg-slate-700 text-slate-300 text-xs rounded-full">
                                            {post.category}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        {post.status === 'published' ? (
                                            <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full flex items-center gap-1 w-fit">
                                                <Eye className="w-3 h-3" /> Published
                                            </span>
                                        ) : (
                                            <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded-full flex items-center gap-1 w-fit">
                                                <EyeOff className="w-3 h-3" /> Draft
                                            </span>
                                        )}
                                    </td>
                                    <td className="p-4 text-slate-400">{post.views?.toLocaleString() || 0}</td>
                                    <td className="p-4 text-sm text-slate-400">
                                        {new Date(post.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="p-4 text-right">
                                        <div className="flex items-center justify-end gap-1">
                                            <Link href={`/admin/blog/${post.id}/edit`}>
                                                <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
                                                    <Edit className="w-4 h-4" />
                                                </Button>
                                            </Link>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="text-red-400 hover:text-red-300"
                                                onClick={async () => {
                                                    if (confirm('Delete this blog post?')) {
                                                        try {
                                                            const res = await fetch(`/api/admin/blog/${post.id}`, { method: 'DELETE' });
                                                            if (res.ok) window.location.reload();
                                                            else alert('Failed to delete');
                                                        } catch (error) {
                                                            alert('Error deleting post');
                                                        }
                                                    }
                                                }}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {posts.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="p-8 text-center text-slate-400">
                                        No blog posts yet. Create your first post!
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </CardContent>
            </Card>
        </div>
    );
}
