import { sql } from '@/lib/db';
import { validateRequest } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, ExternalLink, Package, Globe, DollarSign } from 'lucide-react';
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

async function getConversation(id: string, userId: string): Promise<Conversation | null> {
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
            AND (c.buyer_id = ${userId} OR c.publisher_id = ${userId})
        `;

        return (result.rows[0] as unknown as Conversation) || null;
    } catch (error) {
        console.error('Error fetching conversation:', error);
        return null;
    }
}

export default async function ConversationPage({ params }: { params: Promise<{ id: string }> }) {
    const { user } = await validateRequest();
    if (!user) {
        redirect('/login');
    }

    const { id } = await params;
    const conversation = await getConversation(id, user.id);
    if (!conversation) {
        redirect('/messages');
    }

    const otherParty = conversation.buyer_id === user.id
        ? { name: conversation.publisher_name, avatar: conversation.publisher_avatar, role: 'Publisher' }
        : { name: conversation.buyer_name, avatar: conversation.buyer_avatar, role: 'Buyer' };

    const isBuyer = conversation.buyer_id === user.id;

    return (
        <div className="h-[calc(100vh-8rem)]">
            <div className="grid lg:grid-cols-3 gap-6 h-full">
                {/* Chat Area */}
                <div className="lg:col-span-2">
                    <Card className="bg-white border-gray-200 h-full flex flex-col shadow-sm">
                        <CardHeader className="border-b border-gray-200">
                            <div className="flex items-center gap-4">
                                <Link href="/messages">
                                    <Button variant="ghost" size="icon">
                                        <ArrowLeft className="w-5 h-5 text-gray-600" />
                                    </Button>
                                </Link>

                                {otherParty.avatar ? (
                                    <img
                                        src={otherParty.avatar}
                                        alt={otherParty.name}
                                        className="w-10 h-10 rounded-full"
                                    />
                                ) : (
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-white font-bold">
                                        {otherParty.name?.[0]?.toUpperCase() || '?'}
                                    </div>
                                )}

                                <div>
                                    <h2 className="font-semibold text-gray-900">{otherParty.name}</h2>
                                    <p className="text-sm text-gray-500">{otherParty.role}</p>
                                </div>
                            </div>
                        </CardHeader>

                        <div className="flex-1 overflow-hidden">
                            <ChatInterface
                                conversationId={id}
                                currentUserId={user.id}
                            />
                        </div>
                    </Card>
                </div>

                {/* Order Details Sidebar */}
                <div className="lg:col-span-1">
                    <Card className="bg-white border-gray-200 shadow-sm">
                        <CardHeader className="border-b border-gray-100">
                            <CardTitle className="text-gray-900 flex items-center gap-2">
                                <Package className="w-5 h-5 text-violet-600" />
                                Order Details
                            </CardTitle>
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
                                href={isBuyer ? `/buyer/orders/${conversation.order_id}` : `/publisher/orders/${conversation.order_id}`}
                                className="block"
                            >
                                <Button className="w-full gap-2">
                                    View Order
                                    <ExternalLink className="w-4 h-4" />
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
