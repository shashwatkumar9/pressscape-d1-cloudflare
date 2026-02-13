'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';
import {
    Clock,
    Loader2,
    AlertCircle,
    RefreshCw,
    CheckCircle,
    XCircle,
    HelpCircle,
} from 'lucide-react';

interface OrderStatusCardProps {
    status: 'not_started' | 'in_progress' | 'pending_approval' | 'in_improvement' | 'completed' | 'rejected';
    count: number;
    onClick?: () => void;
}

const statusConfig = {
    not_started: {
        label: 'Not Started',
        description: 'Awaiting publisher acceptance',
        icon: Clock,
        bgColor: 'bg-gray-100',
        textColor: 'text-gray-700',
        iconColor: 'text-gray-500',
        hoverBg: 'hover:bg-gray-200',
        filterValue: 'pending',
    },
    in_progress: {
        label: 'In Progress',
        description: 'Publisher working on order',
        icon: Loader2,
        bgColor: 'bg-blue-50',
        textColor: 'text-blue-700',
        iconColor: 'text-blue-500',
        hoverBg: 'hover:bg-blue-100',
        filterValue: 'in_progress',
    },
    pending_approval: {
        label: 'Pending Approval',
        description: 'Awaiting your review',
        icon: AlertCircle,
        bgColor: 'bg-orange-50',
        textColor: 'text-orange-700',
        iconColor: 'text-orange-500',
        hoverBg: 'hover:bg-orange-100',
        filterValue: 'content_submitted',
    },
    in_improvement: {
        label: 'In Improvement',
        description: 'Sent back for revisions',
        icon: RefreshCw,
        bgColor: 'bg-yellow-50',
        textColor: 'text-yellow-700',
        iconColor: 'text-yellow-600',
        hoverBg: 'hover:bg-yellow-100',
        filterValue: 'revision_needed',
    },
    completed: {
        label: 'Completed',
        description: 'Order finished',
        icon: CheckCircle,
        bgColor: 'bg-green-50',
        textColor: 'text-green-700',
        iconColor: 'text-green-500',
        hoverBg: 'hover:bg-green-100',
        filterValue: 'completed',
    },
    rejected: {
        label: 'Rejected',
        description: 'Order cancelled or refunded',
        icon: XCircle,
        bgColor: 'bg-red-50',
        textColor: 'text-red-700',
        iconColor: 'text-red-500',
        hoverBg: 'hover:bg-red-100',
        filterValue: 'rejected',
    },
};

export function OrderStatusCard({ status, count, onClick }: OrderStatusCardProps) {
    const config = statusConfig[status];
    const Icon = config.icon;

    return (
        <Link
            href={`/buyer/orders?status=${config.filterValue}`}
            onClick={onClick}
            className={cn(
                "block p-4 rounded-xl transition-all duration-200",
                config.bgColor,
                config.hoverBg,
                "border border-transparent hover:border-gray-200 hover:shadow-md"
            )}
        >
            <div className="flex items-start justify-between">
                <div>
                    <div className={cn("text-3xl font-bold", config.textColor)}>
                        {count.toString().padStart(2, '0')}
                    </div>
                    <div className="flex items-center gap-1.5 mt-1">
                        <span className={cn("text-sm font-medium", config.textColor)}>
                            {config.label}
                        </span>
                        <div className="relative group">
                            <HelpCircle className="w-3.5 h-3.5 text-gray-400 cursor-help" />
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                                {config.description}
                            </div>
                        </div>
                    </div>
                </div>
                <div className={cn("p-2 rounded-lg", config.bgColor)}>
                    <Icon className={cn("w-5 h-5", config.iconColor)} />
                </div>
            </div>
        </Link>
    );
}

interface OrderStatusGridProps {
    stats: {
        not_started: number;
        in_progress: number;
        pending_approval: number;
        in_improvement: number;
        completed: number;
        rejected: number;
    };
}

export function OrderStatusGrid({ stats }: OrderStatusGridProps) {
    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <OrderStatusCard status="not_started" count={stats.not_started} />
            <OrderStatusCard status="in_progress" count={stats.in_progress} />
            <OrderStatusCard status="pending_approval" count={stats.pending_approval} />
            <OrderStatusCard status="in_improvement" count={stats.in_improvement} />
            <OrderStatusCard status="completed" count={stats.completed} />
            <OrderStatusCard status="rejected" count={stats.rejected} />
        </div>
    );
}
