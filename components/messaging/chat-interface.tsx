'use client';

import { useState, useEffect, useRef } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Message {
    id: string;
    sender_id: string;
    sender_name: string;
    sender_avatar: string | null;
    message: string;
    created_at: string;
    is_read: boolean;
}

interface ChatInterfaceProps {
    conversationId: string;
    currentUserId: string;
}

// Use consistent date format to avoid hydration errors
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

export default function ChatInterface({ conversationId, currentUserId }: ChatInterfaceProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const pollingInterval = useRef<NodeJS.Timeout | undefined>(undefined);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const fetchMessages = async () => {
        try {
            const res = await fetch(`/api/conversations/${conversationId}/messages`);
            if (res.ok) {
                const data = await res.json() as any;
                setMessages(data.messages);
                setError(null);
                if (!loading) scrollToBottom();
            } else {
                const data = await res.json() as any;
                setError(`Failed to load messages: ${data.error || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Error fetching messages:', error);
            setError('Failed to connect to server');
        } finally {
            setLoading(false);
        }
    };

    const sendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || sending) return;

        setSending(true);
        setError(null);
        try {
            const res = await fetch(`/api/conversations/${conversationId}/messages`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: newMessage }),
            });

            if (res.ok) {
                setNewMessage('');
                await fetchMessages();
                scrollToBottom();
            } else {
                const data = await res.json() as any;
                setError(`Failed to send message: ${data.error || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Error sending message:', error);
            setError('Failed to send message. Please check your connection.');
        } finally {
            setSending(false);
        }
    };

    const markAsRead = async () => {
        try {
            await fetch(`/api/conversations/${conversationId}/mark-read`, {
                method: 'POST',
            });
        } catch (error) {
            console.error('Error marking as read:', error);
        }
    };

    useEffect(() => {
        fetchMessages();
        markAsRead();

        // Poll for new messages every 3 seconds
        pollingInterval.current = setInterval(fetchMessages, 3000);

        return () => {
            if (pollingInterval.current) {
                clearInterval(pollingInterval.current);
            }
        };
    }, [conversationId]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="flex items-center gap-2 text-gray-500">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Loading messages...
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full">
            {/* Messages List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                {messages.length === 0 ? (
                    <div className="text-center text-gray-500 py-8">
                        No messages yet. Start the conversation!
                    </div>
                ) : (
                    messages.map((msg) => {
                        const isOwn = msg.sender_id === currentUserId;
                        return (
                            <div
                                key={msg.id}
                                className={`flex items-start gap-3 ${isOwn ? 'flex-row-reverse' : ''}`}
                            >
                                {/* Avatar */}
                                <div className="flex-shrink-0">
                                    {msg.sender_avatar ? (
                                        <img
                                            src={msg.sender_avatar}
                                            alt={msg.sender_name}
                                            className="w-8 h-8 rounded-full"
                                        />
                                    ) : (
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-white font-semibold text-sm">
                                            {msg.sender_name[0].toUpperCase()}
                                        </div>
                                    )}
                                </div>

                                {/* Message Bubble */}
                                <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'} max-w-[70%]`}>
                                    <div
                                        className={`px-4 py-2.5 rounded-2xl shadow-sm ${isOwn
                                            ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white'
                                            : 'bg-white text-gray-900 border border-gray-200'
                                            }`}
                                    >
                                        {!isOwn && (
                                            <div className="text-xs font-semibold mb-1 text-violet-600">
                                                {msg.sender_name}
                                            </div>
                                        )}
                                        <p className="whitespace-pre-wrap break-words">{msg.message}</p>
                                    </div>
                                    <div className="text-xs text-gray-400 mt-1 px-2">
                                        {formatTimeAgo(msg.created_at)}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Error Alert */}
            {error && (
                <div className="px-4 py-3 bg-red-50 border-t border-red-200 text-red-700 text-sm">
                    <strong>Error:</strong> {error}
                </div>
            )}

            {/* Message Input */}
            <form onSubmit={sendMessage} className="p-4 border-t border-gray-200 bg-white">
                <div className="flex items-end gap-2">
                    <textarea
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                sendMessage(e);
                            }
                        }}
                        placeholder="Type your message... (Enter to send, Shift+Enter for new line)"
                        rows={2}
                        className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 outline-none resize-none"
                    />
                    <Button
                        type="submit"
                        disabled={!newMessage.trim() || sending}
                        className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500"
                        size="lg"
                    >
                        {sending ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <Send className="w-5 h-5" />
                        )}
                    </Button>
                </div>
            </form>
        </div>
    );
}
