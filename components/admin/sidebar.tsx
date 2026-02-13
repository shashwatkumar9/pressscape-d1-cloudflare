'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
    LayoutDashboard,
    Users,
    Globe,
    PackageOpen,
    DollarSign,
    Mail,
    FileText,
    UserCog,
    Settings,
    Shield,
    MessageSquare,
} from 'lucide-react';

type AdminRole = 'super_admin' | 'admin' | 'finance_manager' | 'content_manager' | 'support_agent' | 'editor';

interface SidebarProps {
    role: AdminRole;
}

const allNavItems = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard, roles: ['super_admin', 'admin', 'finance_manager', 'content_manager', 'support_agent', 'editor'] },
    { name: 'Users', href: '/admin/users', icon: Users, roles: ['super_admin', 'admin', 'support_agent'] },
    { name: 'Websites', href: '/admin/websites', icon: Globe, roles: ['super_admin', 'admin', 'content_manager', 'support_agent'] },
    { name: 'Orders', href: '/admin/orders', icon: PackageOpen, roles: ['super_admin', 'admin', 'finance_manager', 'support_agent'] },
    { name: 'Messages', href: '/admin/messages', icon: MessageSquare, roles: ['super_admin', 'admin', 'support_agent'] },
    { name: 'Refunds', href: '/admin/refunds', icon: DollarSign, roles: ['super_admin', 'admin', 'finance_manager'] },
    { name: 'Banned Emails', href: '/admin/emails', icon: Mail, roles: ['super_admin', 'admin'] },
    { name: 'Blog', href: '/admin/blog', icon: FileText, roles: ['super_admin', 'admin', 'content_manager', 'editor'] },
    { name: 'Employees', href: '/admin/employees', icon: UserCog, roles: ['super_admin'] },
    { name: 'Settings', href: '/admin/settings', icon: Settings, roles: ['super_admin', 'admin'] },
];

export function AdminSidebar({ role }: SidebarProps) {
    const pathname = usePathname();

    const navItems = allNavItems.filter(item => item.roles.includes(role));

    return (
        <aside className="fixed inset-y-0 left-0 w-64 bg-slate-900 border-r border-slate-800 z-50">
            {/* Logo */}
            <div className="h-16 flex items-center gap-3 px-6 border-b border-slate-800">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 to-orange-600 flex items-center justify-center">
                    <Shield className="w-5 h-5 text-white" />
                </div>
                <div>
                    <div className="font-bold text-white">PressScape</div>
                    <div className="text-xs text-slate-400">Admin Panel</div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="p-4 space-y-1">
                {navItems.map((item) => {
                    const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors",
                                isActive
                                    ? "bg-slate-800 text-white"
                                    : "text-slate-400 hover:bg-slate-800/50 hover:text-white"
                            )}
                        >
                            <item.icon className={cn("w-5 h-5", isActive ? "text-orange-500" : "")} />
                            {item.name}
                        </Link>
                    );
                })}
            </nav>

            {/* Role Badge */}
            <div className="absolute bottom-4 left-4 right-4">
                <div className="px-4 py-3 rounded-lg bg-slate-800">
                    <div className="text-xs text-slate-400 mb-1">Logged in as</div>
                    <div className="text-sm font-medium text-white capitalize">
                        {role.replace('_', ' ')}
                    </div>
                </div>
            </div>
        </aside>
    );
}
