export const runtime = 'edge';


import { sql } from '@/lib/db';
import { getAdminSession } from '@/lib/admin-auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { MessageSquare, Package, Users } from 'lucide-react';



interface Conversation {
    id: string;
    buyer_id: string;
    publisher_id: string;
    order_number: string;
    website_domain: string;
    buyer_name: string;
    publisher_name: string;
    buyer_avatar: string | null;
    publisher_avatar: string | null;
    unread_count: string;
    last_message: string | null;
    last_message_at: string | null;
}

const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    const day = String(date.getDate()).padStart(2, '0');
    const month = date.toLocaleString('en-US', { month: 'short' });
    return `${day} ${month}`;
};

async function getAllConversations(): Promise<Conversation[]> {
    try {
        const result = await sql`
            SELECT 
                c.*,
                o.order_number,
                o.website_id,
                w.domain as website_domain,
                buyer.name as buyer_name,
                buyer.avatar_url as buyer_avatar,
                publisher.name as publisher_name,
                publisher.avatar_url as publisher_avatar,
                (
                    SELECT COUNT(*)
                    FROM messages m
                    WHERE m.conversation_id = c.id 
                    AND m.is_read = false
                ) as unread_count,
                (
                    SELECT message
                    FROM messages m
                    WHERE m.conversation_id = c.id
                    ORDER BY m.created_at DESC
                    LIMIT 1
                ) as last_message
            FROM conversations c
            JOIN orders o ON c.order_id = o.id
            JOIN websites w ON o.website_id = w.id
            JOIN users buyer ON c.buyer_id = buyer.id
            JOIN users publisher ON c.publisher_id = publisher.id
            ORDER BY c.last_message_at DESC NULLS LAST, c.created_at DESC
        `;

        return result.rows as unknown as Conversation[];
    } catch (error) {
        console.error('Error fetching conversations:', error);
        return [];
    }
}

export default async function AdminMessagesPage() {
    const adminSession = await getAdminSession();
    if (!adminSession) {
        redirect('/admin/login');
    }
    const admin = adminSession as any;

    // Only these roles can view all conversations
    const allowedRoles = ['super_admin', 'admin', 'content_manager', 'support_agent'];
    if (!allowedRoles.includes(admin.role)) {
        redirect('/admin');
    }

    const conversations = await getAllConversations();

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">All Conversations</h1>
                    <p className="text-gray-600 mt-1">
                        Monitor all buyer-publisher communications ({conversations.length} total)
                    </p>
                </div>
            </div>

            {/* Conversations List */}
            {conversations.length === 0 ? (
                <Card className="bg-white border-gray-200">
                    <CardContent className="p-12 text-center">
                        <div className="w-20 h-20 mx-auto bg-violet-100 rounded-full flex items-center justify-center mb-6">
                            <MessageSquare className="w-10 h-10 text-violet-600" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">No conversations yet</h3>
                        <p className="text-gray-500 max-w-md mx-auto">
                            Conversations will appear here when buyers and publishers communicate about orders.
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4">
                    {conversations.map((conv: Conversation) => {
                        const hasUnread = parseInt(conv.unread_count) > 0;

                        return (
                            <Link key={conv.id} href={`/admin/messages/${conv.id}`}>
                                <Card className={`bg-white border-gray-200 hover:border-violet-400 hover:shadow-md transition-all cursor-pointer ${hasUnread ? 'ring-2 ring-violet-100' : ''}`}>
                                    <CardContent className="p-4">
                                        <div className="flex items-start gap-4">
                                            {/* Avatars - Both Buyer and Publisher */}
                                            <div className="flex-shrink-0 flex -space-x-2">
                                                {/* Buyer Avatar */}
                                                {conv.buyer_avatar ? (
                                                    <img
                                                        src={conv.buyer_avatar}
                                                        alt={conv.buyer_name}
                                                        className="w-10 h-10 rounded-full border-2 border-white"
                                                    />
                                                ) : (
                                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center text-white font-bold text-sm border-2 border-white">
                                                        {conv.buyer_name[0].toUpperCase()}
                                                    </div>
                                                )}
                                                {/* Publisher Avatar */}
                                                {conv.publisher_avatar ? (
                                                    <img
                                                        src={conv.publisher_avatar}
                                                        alt={conv.publisher_name}
                                                        className="w-10 h-10 rounded-full border-2 border-white"
                                                    />
                                                ) : (
                                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-white font-bold text-sm border-2 border-white">
                                                        {conv.publisher_name[0].toUpperCase()}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Details */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between mb-1">
                                                    <div>
                                                        <h3 className={`font-semibold flex items-center gap-2 ${hasUnread ? 'text-gray-900' : 'text-gray-700'}`}>
                                                            <Users className="w-4 h-4 text-gray-400" />
                                                            <span>{conv.buyer_name}</span>
                                                            <span className="text-gray-400">↔</span>
                                                            <span>{conv.publisher_name}</span>
                                                        </h3>
                                                        <div className="flex items-center gap-2 text-sm text-gray-500 mt-0.5">
                                                            <Package className="w-3.5 h-3.5" />
                                                            <span>{conv.order_number}</span>
                                                            <span>•</span>
                                                            <span>{conv.website_domain}</span>
                                                        </div>
                                                    </div>
                                                    {conv.last_message_at && (
                                                        <div className="text-xs text-gray-500">
                                                            {formatTimeAgo(conv.last_message_at)}
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Last Message */}
                                                {conv.last_message && (
                                                    <p className={`text-sm truncate ${hasUnread ? 'text-gray-700 font-medium' : 'text-gray-500'}`}>
                                                        {conv.last_message}
                                                    </p>
                                                )}
                                            </div>

                                            {/* Unread Badge */}
                                            {hasUnread && (
                                                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-violet-600 flex items-center justify-center text-white text-xs font-bold">
                                                    {conv.unread_count}
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
