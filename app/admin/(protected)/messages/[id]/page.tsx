export const runtime = "edge";

import { sql } from '@/lib/db';
import { getAdminSession } from '@/lib/admin-auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { ArrowLeft, Package, Globe, DollarSign, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ChatInterface from '@/components/messaging/chat-interface';



interface Conversation {
    buyer_id: string;
    publisher_id: string;
    buyer_name: string;
    publisher_name: string;
    buyer_avatar: string | null;
    publisher_avatar: string | null;
    order_id: string;
    order_number: string;
    order_type: string;
    order_status: string;
    total_amount: number;
    website_domain: string;
}

const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-700',
    accepted: 'bg-blue-100 text-blue-700',
    writing: 'bg-blue-100 text-blue-700',
    content_submitted: 'bg-purple-100 text-purple-700',
    revision_needed: 'bg-orange-100 text-orange-700',
    approved: 'bg-indigo-100 text-indigo-700',
    published: 'bg-green-100 text-green-700',
    completed: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
};

async function getConversation(id: string): Promise<Conversation | null> {
    try {
        const result = await sql`
            SELECT 
                c.*,
                o.id as order_id,
                o.order_number,
                o.order_type,
                o.status as order_status,
                o.total_amount,
                o.website_id,
                w.domain as website_domain,
                buyer.name as buyer_name,
                buyer.avatar_url as buyer_avatar,
                publisher.name as publisher_name,
                publisher.avatar_url as publisher_avatar
            FROM conversations c
            JOIN orders o ON c.order_id = o.id
            JOIN websites w ON o.website_id = w.id
            JOIN users buyer ON c.buyer_id = buyer.id
            JOIN users publisher ON c.publisher_id = publisher.id
            WHERE c.id = ${id}
        `;

        return (result.rows[0] as unknown as Conversation) || null;
    } catch (error) {
        console.error('Error fetching conversation:', error);
        return null;
    }
}

export default async function AdminConversationPage({ params }: { params: Promise<{ id: string }> }) {
    const adminSession = await getAdminSession();
    if (!adminSession) {
        redirect('/admin/login');
    }
    const admin = adminSession as any;

    // Only these roles can view conversations
    const allowedRoles = ['super_admin', 'admin', 'content_manager', 'support_agent'];
    if (!allowedRoles.includes(admin.role)) {
        redirect('/admin');
    }

    const { id } = await params;
    const conversation = await getConversation(id);

    if (!conversation) {
        redirect('/admin/messages');
    }

    // For admin view, we'll show as an observer (use buyer_id as currentUserId to display messages correctly)
    return (
        <div className="h-[calc(100vh-8rem)]">
            <div className="grid lg:grid-cols-3 gap-6 h-full">
                {/* Chat Area */}
                <div className="lg:col-span-2">
                    <Card className="bg-white border-gray-200 h-full flex flex-col shadow-sm">
                        <CardHeader className="border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <Link href="/admin/messages">
                                        <Button variant="ghost" size="icon">
                                            <ArrowLeft className="w-5 h-5 text-gray-600" />
                                        </Button>
                                    </Link>

                                    <div className="flex items-center gap-3">
                                        {/* Buyer */}
                                        <div className="flex items-center gap-2">
                                            {conversation.buyer_avatar ? (
                                                <img
                                                    src={conversation.buyer_avatar}
                                                    alt={conversation.buyer_name}
                                                    className="w-8 h-8 rounded-full"
                                                />
                                            ) : (
                                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center text-white font-bold text-xs">
                                                    {conversation.buyer_name[0].toUpperCase()}
                                                </div>
                                            )}
                                            <div>
                                                <div className="text-sm font-medium text-gray-900">{conversation.buyer_name}</div>
                                                <div className="text-xs text-gray-500">Buyer</div>
                                            </div>
                                        </div>

                                        <div className="text-gray-400">↔</div>

                                        {/* Publisher */}
                                        <div className="flex items-center gap-2">
                                            {conversation.publisher_avatar ? (
                                                <img
                                                    src={conversation.publisher_avatar}
                                                    alt={conversation.publisher_name}
                                                    className="w-8 h-8 rounded-full"
                                                />
                                            ) : (
                                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xs">
                                                    {conversation.publisher_name[0].toUpperCase()}
                                                </div>
                                            )}
                                            <div>
                                                <div className="text-sm font-medium text-gray-900">{conversation.publisher_name}</div>
                                                <div className="text-xs text-gray-500">Publisher</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="px-3 py-1 bg-violet-100 text-violet-700 rounded-full text-xs font-medium">
                                    Admin View
                                </div>
                            </div>
                        </CardHeader>

                        <div className="flex-1 overflow-hidden">
                            <ChatInterface
                                conversationId={id}
                                currentUserId={admin.id as string}
                            />
                        </div>
                    </Card>
                </div>

                {/* Order Details Sidebar */}
                <div className="lg:col-span-1">
                    <Card className="bg-white border-gray-200 shadow-sm">
                        <CardHeader className="border-b border-gray-100">
                            <div className="flex items-center gap-2">
                                <Package className="w-5 h-5 text-violet-600" />
                                <h3 className="text-gray-900 font-semibold">Order Details</h3>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4 pt-4">
                            <div>
                                <label className="text-sm text-gray-500">Order Number</label>
                                <div className="font-mono text-gray-900 mt-1">{conversation.order_number}</div>
                            </div>

                            <div className="flex items-center gap-2">
                                <Globe className="w-4 h-4 text-gray-400" />
                                <div>
                                    <label className="text-sm text-gray-500">Website</label>
                                    <div className="text-gray-900">{conversation.website_domain}</div>
                                </div>
                            </div>

                            <div>
                                <label className="text-sm text-gray-500">Type</label>
                                <div className="text-gray-900 mt-1 capitalize">
                                    {conversation.order_type.replace('_', ' ')}
                                </div>
                            </div>

                            <div>
                                <label className="text-sm text-gray-500">Status</label>
                                <div className="mt-1">
                                    <span className={`px-2.5 py-1 text-sm rounded-full capitalize font-medium ${statusColors[conversation.order_status] || 'bg-gray-100 text-gray-700'}`}>
                                        {conversation.order_status.replace('_', ' ')}
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                                <DollarSign className="w-4 h-4 text-emerald-600" />
                                <div>
                                    <label className="text-sm text-gray-500">Amount</label>
                                    <div className="text-gray-900 font-semibold text-lg">
                                        ${(conversation.total_amount / 100).toFixed(2)}
                                    </div>
                                </div>
                            </div>

                            <Link
                                href={`/admin/orders/${conversation.order_id}`}
                                className="block"
                            >
                                <Button className="w-full gap-2">
                                    View Order Details
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
