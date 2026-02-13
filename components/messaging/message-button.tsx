'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { MessageSquare, Loader2 } from 'lucide-react';

interface MessageButtonProps {
    orderId: string;
    label?: string;
    variant?: 'default' | 'outline' | 'ghost';
    size?: 'default' | 'sm' | 'lg';
    className?: string;
}

export default function MessageButton({
    orderId,
    label = 'Message',
    variant = 'outline',
    size = 'sm',
    className = ''
}: MessageButtonProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const handleClick = async () => {
        setLoading(true);
        try {
            // Create or get existing conversation
            const res = await fetch('/api/conversations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ orderId }),
            });

            if (res.ok) {
                const data = await res.json() as any;
                if (data.conversation?.id) {
                    // Route to appropriate role-based messages page
                    const role = data.conversation.userRole || 'buyer';
                    router.push(`/${role}/messages/${data.conversation.id}`);
                    return;
                }
            }

            // Fallback to messages page
            router.push('/messages');
        } catch (error) {
            console.error('Error starting conversation:', error);
            router.push('/messages');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Button
            variant={variant}
            size={size}
            onClick={handleClick}
            disabled={loading}
            className={`gap-2 ${className}`}
        >
            {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
                <MessageSquare className="w-4 h-4" />
            )}
            {label}
        </Button>
    );
}
