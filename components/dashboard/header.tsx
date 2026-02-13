'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import {
    LayoutDashboard,
    Globe,
    ShoppingCart,
    Users,
    DollarSign,
    Settings,
    LogOut,
    ChevronDown,
    User,
    Building2,
    Link2,
    Bell,
    MessageSquare,
    Wallet,
    Lock,
    Gift,
    Plus,
} from 'lucide-react';

type UserRole = 'buyer' | 'publisher' | 'affiliate';

interface DashboardHeaderProps {
    user: {
        name: string;
        email: string;
        avatarUrl?: string;
        isBuyer: boolean;
        isPublisher: boolean;
        isAffiliate: boolean;
    };
    currentRole: UserRole;
    initialBalance?: {
        main: number;
        reserved: number;
        bonus: number;
    };
    initialUnreadNotifications?: number;
}

const roleConfig = {
    buyer: {
        label: 'Buyer',
        icon: ShoppingCart,
        color: 'from-blue-600 to-cyan-600',
        path: '/buyer',
    },
    publisher: {
        label: 'Publisher',
        icon: Building2,
        color: 'from-violet-600 to-indigo-600',
        path: '/publisher',
    },
    affiliate: {
        label: 'Affiliate',
        icon: Link2,
        color: 'from-emerald-600 to-green-600',
        path: '/affiliate',
    },
};

// Format currency from cents
function formatCurrency(cents: number): string {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
    }).format(cents / 100);
}

export function DashboardHeader({
    user,
    currentRole,
    initialBalance = { main: 0, reserved: 0, bonus: 0 },
    initialUnreadNotifications = 0
}: DashboardHeaderProps) {
    const pathname = usePathname();
    const config = roleConfig[currentRole];
    const availableRoles = [
        user.isBuyer && 'buyer',
        user.isPublisher && 'publisher',
        user.isAffiliate && 'affiliate',
    ].filter(Boolean) as UserRole[];

    const [balance, setBalance] = useState(initialBalance);
    const [unreadCount, setUnreadCount] = useState(initialUnreadNotifications);
    const [notifications, setNotifications] = useState<any[]>([]);
    const [notificationsOpen, setNotificationsOpen] = useState(false);

    // Fetch latest balance and notifications on mount
    useEffect(() => {
        if (currentRole === 'buyer') {
            fetch('/api/buyer/dashboard')
                .then(res => res.json() as any)
                .then(data => {
                    if (data.balance) setBalance(data.balance);
                    if (data.unreadNotifications !== undefined) setUnreadCount(data.unreadNotifications);
                })
                .catch(() => { });

            fetch('/api/buyer/notifications?per_page=5')
                .then(res => res.json() as any)
                .then(data => {
                    if (data.notifications) setNotifications(data.notifications);
                })
                .catch(() => { });
        }
    }, [currentRole]);

    const markAllRead = async () => {
        try {
            await fetch('/api/buyer/notifications/mark-all-read', { method: 'PUT' });
            setUnreadCount(0);
            setNotifications(notifications.map(n => ({ ...n, is_read: true })));
        } catch { }
    };

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
            <div className="flex h-16 items-center justify-between px-4 md:px-6">
                {/* Logo */}
                <div className="flex items-center gap-6">
                    <Link href="/" className="flex items-center gap-2">
                        <div className={cn(
                            "w-8 h-8 rounded-lg bg-gradient-to-br flex items-center justify-center",
                            config.color
                        )}>
                            <span className="text-white font-bold text-sm">P</span>
                        </div>
                        <span className="font-bold text-xl text-gray-900 hidden md:block">PressScape</span>
                    </Link>

                    {/* Role Badge */}
                    <div className={cn(
                        "hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium",
                        "bg-gradient-to-r text-white",
                        config.color
                    )}>
                        <config.icon className="w-4 h-4" />
                        {config.label} Dashboard
                    </div>
                </div>

                {/* Right Side */}
                <div className="flex items-center gap-2 md:gap-4">
                    {/* Balance Display - Only for Buyer */}
                    {currentRole === 'buyer' && (
                        <div className="hidden lg:flex items-center gap-2">
                            {/* Main Balance */}
                            <Link
                                href="/buyer/add-funds"
                                className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors group"
                                title="Main Balance - Click to add funds"
                            >
                                <Wallet className="w-4 h-4 text-emerald-600" />
                                <span className="text-sm font-semibold text-emerald-700">{formatCurrency(balance.main)}</span>
                                <Plus className="w-3 h-3 text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </Link>

                            {/* Reserved Balance */}
                            <div
                                className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 rounded-lg cursor-help"
                                title="Reserved - Funds held for active orders"
                            >
                                <Lock className="w-4 h-4 text-amber-600" />
                                <span className="text-sm font-semibold text-amber-700">{formatCurrency(balance.reserved)}</span>
                            </div>

                            {/* Bonus Balance */}
                            {balance.bonus > 0 && (
                                <div
                                    className="flex items-center gap-2 px-3 py-1.5 bg-purple-50 rounded-lg cursor-help"
                                    title="Bonus Credits"
                                >
                                    <Gift className="w-4 h-4 text-purple-600" />
                                    <span className="text-sm font-semibold text-purple-700">{formatCurrency(balance.bonus)}</span>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Mobile Balance - Compact */}
                    {currentRole === 'buyer' && (
                        <Link
                            href="/buyer/add-funds"
                            className="lg:hidden flex items-center gap-1 px-2 py-1 bg-emerald-50 rounded-lg"
                        >
                            <Wallet className="w-4 h-4 text-emerald-600" />
                            <span className="text-xs font-semibold text-emerald-700">{formatCurrency(balance.main)}</span>
                        </Link>
                    )}

                    {/* Messages */}
                    <Link
                        href={`/${currentRole}/messages`}
                        className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <MessageSquare className="w-5 h-5" />
                    </Link>

                    {/* Notifications */}
                    <div className="relative">
                        <button
                            onClick={() => setNotificationsOpen(!notificationsOpen)}
                            className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <Bell className="w-5 h-5" />
                            {unreadCount > 0 && (
                                <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                                    {unreadCount > 9 ? '9+' : unreadCount}
                                </span>
                            )}
                        </button>

                        {/* Notifications Dropdown */}
                        {notificationsOpen && (
                            <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-xl border max-h-96 overflow-hidden z-50">
                                <div className="flex items-center justify-between p-3 border-b">
                                    <h3 className="font-semibold text-gray-900">Notifications</h3>
                                    {unreadCount > 0 && (
                                        <button
                                            onClick={markAllRead}
                                            className="text-xs text-violet-600 hover:text-violet-700"
                                        >
                                            Mark all as read
                                        </button>
                                    )}
                                </div>
                                <div className="max-h-72 overflow-y-auto">
                                    {notifications.length === 0 ? (
                                        <div className="p-4 text-center text-gray-500 text-sm">
                                            No notifications yet
                                        </div>
                                    ) : (
                                        notifications.map((notif) => (
                                            <Link
                                                key={notif.id}
                                                href={notif.link || '#'}
                                                onClick={() => setNotificationsOpen(false)}
                                                className={cn(
                                                    "block px-4 py-3 border-b hover:bg-gray-50 transition-colors",
                                                    !notif.is_read && "bg-violet-50/50"
                                                )}
                                            >
                                                <div className="text-sm font-medium text-gray-900">{notif.title}</div>
                                                <div className="text-xs text-gray-500 mt-0.5 line-clamp-2">{notif.message}</div>
                                                <div className="text-xs text-gray-400 mt-1">
                                                    {new Date(notif.created_at).toLocaleDateString()}
                                                </div>
                                            </Link>
                                        ))
                                    )}
                                </div>
                                <Link
                                    href={`/${currentRole}/notifications`}
                                    className="block p-3 text-center text-sm text-violet-600 hover:bg-gray-50 border-t"
                                >
                                    View all notifications
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Role Switch Buttons - Always Visible */}
                    <div className="hidden md:flex items-center gap-2">
                        {currentRole !== 'buyer' && (
                            <Link
                                href="/buyer/dashboard"
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
                            >
                                <ShoppingCart className="w-4 h-4" />
                                Switch to Buyer
                            </Link>
                        )}
                        {currentRole !== 'publisher' && (
                            <Link
                                href="/publisher/dashboard"
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-violet-50 text-violet-700 hover:bg-violet-100 transition-colors"
                            >
                                <Building2 className="w-4 h-4" />
                                Switch to Publisher
                            </Link>
                        )}
                        {currentRole !== 'affiliate' && (
                            <Link
                                href="/affiliate/dashboard"
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors"
                            >
                                <Link2 className="w-4 h-4" />
                                Switch to Affiliate
                            </Link>
                        )}
                    </div>

                    {/* Mobile Role Switcher Dropdown */}
                    <div className="md:hidden relative group">
                        <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                            <ChevronDown className="w-5 h-5 text-gray-600" />
                        </button>
                        <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                            {currentRole !== 'buyer' && (
                                <Link
                                    href="/buyer/dashboard"
                                    className="flex items-center gap-3 px-4 py-3 text-sm text-gray-600 hover:bg-gray-50"
                                >
                                    <ShoppingCart className="w-4 h-4" />
                                    Switch to Buyer
                                </Link>
                            )}
                            {currentRole !== 'publisher' && (
                                <Link
                                    href="/publisher/dashboard"
                                    className="flex items-center gap-3 px-4 py-3 text-sm text-gray-600 hover:bg-gray-50"
                                >
                                    <Building2 className="w-4 h-4" />
                                    Switch to Publisher
                                </Link>
                            )}
                            {currentRole !== 'affiliate' && (
                                <Link
                                    href="/affiliate/dashboard"
                                    className="flex items-center gap-3 px-4 py-3 text-sm text-gray-600 hover:bg-gray-50"
                                >
                                    <Link2 className="w-4 h-4" />
                                    Switch to Affiliate
                                </Link>
                            )}
                        </div>
                    </div>

                    {/* User Menu */}
                    <div className="relative group">
                        <button className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center text-white text-sm font-medium">
                                {user.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="hidden md:block text-left">
                                <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                <div className="text-xs text-gray-500">{user.email}</div>
                            </div>
                            <ChevronDown className="w-4 h-4 text-gray-400" />
                        </button>
                        <div className="absolute right-0 top-full mt-1 w-56 bg-white rounded-lg shadow-lg border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                            <div className="p-3 border-b">
                                <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                <div className="text-xs text-gray-500">{user.email}</div>
                            </div>
                            <div className="py-1">
                                <Link href="/buyer/add-funds" className="flex items-center gap-3 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50">
                                    <Plus className="w-4 h-4" />
                                    Add Funds
                                </Link>
                                <Link href="/settings" className="flex items-center gap-3 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50">
                                    <Settings className="w-4 h-4" />
                                    Settings
                                </Link>
                                <button
                                    onClick={async () => {
                                        await fetch('/api/auth/logout', { method: 'POST' });
                                        window.location.href = '/login';
                                    }}
                                    className="flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full"
                                >
                                    <LogOut className="w-4 h-4" />
                                    Log out
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}
