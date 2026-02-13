'use client';

import { useRouter } from 'next/navigation';
import { Bell, Search, LogOut, User } from 'lucide-react';

interface AdminHeaderProps {
    admin: {
        name: string;
        email: string;
        role: string;
    };
}

export function AdminHeader({ admin }: AdminHeaderProps) {
    const router = useRouter();

    const handleLogout = async () => {
        await fetch('/api/admin/auth/logout', { method: 'POST' });
        router.push('/admin/login');
        router.refresh();
    };

    return (
        <header className="h-16 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-6">
            {/* Search */}
            <div className="relative w-96">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                    type="text"
                    placeholder="Search..."
                    className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
            </div>

            {/* Right Side */}
            <div className="flex items-center gap-4">
                {/* Notifications */}
                <button className="relative p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors">
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>

                {/* User Menu */}
                <div className="relative group">
                    <button className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-800 transition-colors">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center text-white text-sm font-medium">
                            {admin.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="text-left hidden md:block">
                            <div className="text-sm font-medium text-white">{admin.name}</div>
                            <div className="text-xs text-slate-400 capitalize">{admin.role.replace('_', ' ')}</div>
                        </div>
                    </button>

                    <div className="absolute right-0 top-full mt-1 w-48 bg-slate-800 rounded-lg shadow-lg border border-slate-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                        <div className="p-3 border-b border-slate-700">
                            <div className="text-sm font-medium text-white">{admin.name}</div>
                            <div className="text-xs text-slate-400">{admin.email}</div>
                        </div>
                        <div className="py-1">
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-400 hover:bg-slate-700"
                            >
                                <LogOut className="w-4 h-4" />
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}
