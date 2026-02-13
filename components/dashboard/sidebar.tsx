'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import {
    LayoutDashboard,
    Globe,
    PackageOpen,
    DollarSign,
    MessageSquare,
    BarChart3,
    Users,
    Settings,
    Plus,
    Folder,
    ChevronDown,
    ChevronRight,
    Heart,
    Ban,
    HelpCircle,
    Activity,
} from 'lucide-react';

type UserRole = 'buyer' | 'publisher' | 'affiliate';

interface Project {
    id: string;
    name: string;
    url: string;
    favicon: string | null;
    order_count: number;
}

interface SidebarProps {
    role: UserRole;
    projects?: Project[];
}

const buyerNavigation = [
    { name: 'Dashboard', href: '/buyer/dashboard', icon: LayoutDashboard },
    { name: 'Marketplace', href: '/marketplace', icon: Globe },
    { name: 'All Orders', href: '/buyer/orders', icon: PackageOpen },
    { name: 'Messages', href: '/buyer/messages', icon: MessageSquare },
];

const publisherNavigation = [
    { name: 'Dashboard', href: '/publisher/dashboard', icon: LayoutDashboard },
    { name: 'My Websites', href: '/publisher/websites', icon: Globe },
    { name: 'Orders', href: '/publisher/orders', icon: PackageOpen },
    { name: 'Earnings', href: '/publisher/earnings', icon: DollarSign },
    { name: 'Messages', href: '/publisher/messages', icon: MessageSquare },
];

const affiliateNavigation = [
    { name: 'Dashboard', href: '/affiliate/dashboard', icon: LayoutDashboard },
    { name: 'Referrals', href: '/affiliate/referrals', icon: Users },
    { name: 'Commissions', href: '/affiliate/commissions', icon: DollarSign },
    { name: 'Marketing', href: '/affiliate/marketing', icon: BarChart3 },
];

const bottomNavigation = [
    { name: 'Add Funds', href: '/buyer/add-funds', icon: Plus, buyerOnly: true },
    { name: 'Activity Log', href: '/buyer/activity', icon: Activity, buyerOnly: true },
    { name: 'FAQ', href: '/faq', icon: HelpCircle },
    { name: 'Settings', href: '/settings', icon: Settings },
];

const actionConfig = {
    buyer: { label: 'Browse Sites', href: '/marketplace', icon: Globe },
    publisher: { label: 'Add Website', href: '/publisher/websites/new', icon: Plus },
    affiliate: { label: 'Get Link', href: '/affiliate/referrals', icon: Plus },
};

export function DashboardSidebar({ role, projects: initialProjects }: SidebarProps) {
    const pathname = usePathname();
    const action = actionConfig[role];
    const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set());
    const [projects, setProjects] = useState<Project[]>(initialProjects || []);

    // Fetch projects for buyers
    useEffect(() => {
        if (role === 'buyer' && !initialProjects) {
            fetch('/api/buyer/projects?stats=true')
                .then(res => res.json() as any)
                .then(data => {
                    if (data.projects) setProjects(data.projects);
                })
                .catch(() => { });
        }
    }, [role, initialProjects]);

    const toggleProject = (id: string) => {
        const next = new Set(expandedProjects);
        if (next.has(id)) {
            next.delete(id);
        } else {
            next.add(id);
        }
        setExpandedProjects(next);
    };

    const getNavigation = () => {
        switch (role) {
            case 'buyer': return buyerNavigation;
            case 'publisher': return publisherNavigation;
            case 'affiliate': return affiliateNavigation;
            default: return [];
        }
    };

    const navigation = getNavigation();

    return (
        <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 lg:pt-16 bg-gray-50 border-r">
            <div className="flex-1 flex flex-col gap-1 p-4 overflow-y-auto">
                {/* Primary Action */}
                <Link
                    href={action.href}
                    className={cn(
                        "flex items-center gap-2 px-4 py-3 rounded-lg font-medium text-sm mb-4",
                        "bg-gradient-to-r from-violet-600 to-indigo-600 text-white",
                        "hover:from-violet-500 hover:to-indigo-500 transition-all shadow-lg shadow-violet-500/25"
                    )}
                >
                    <action.icon className="w-5 h-5" />
                    {action.label}
                </Link>

                {/* Main Navigation */}
                <nav className="space-y-1">
                    {navigation.map((item) => {
                        const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors",
                                    isActive
                                        ? "bg-white text-violet-600 shadow-sm"
                                        : "text-gray-600 hover:bg-white hover:text-gray-900"
                                )}
                            >
                                <item.icon className={cn("w-5 h-5", isActive ? "text-violet-600" : "text-gray-400")} />
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>

                {/* Projects Section - Buyers Only */}
                {role === 'buyer' && projects.length > 0 && (
                    <>
                        <div className="mt-4 mb-2">
                            <div className="flex items-center justify-between px-4 py-2">
                                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Projects</span>
                                <Link
                                    href="/buyer/projects/new"
                                    className="text-violet-600 hover:text-violet-700"
                                    title="Create Project"
                                >
                                    <Plus className="w-4 h-4" />
                                </Link>
                            </div>

                            <div className="space-y-1">
                                {projects.map((project) => {
                                    const isExpanded = expandedProjects.has(project.id);
                                    return (
                                        <div key={project.id}>
                                            <button
                                                onClick={() => toggleProject(project.id)}
                                                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-600 hover:bg-white rounded-lg transition-colors"
                                            >
                                                {project.favicon ? (
                                                    <img src={project.favicon} alt="" className="w-4 h-4 rounded" />
                                                ) : (
                                                    <Folder className="w-4 h-4 text-gray-400" />
                                                )}
                                                <span className="flex-1 text-left truncate">{project.name}</span>
                                                {project.order_count > 0 && (
                                                    <span className="text-xs bg-gray-200 px-1.5 py-0.5 rounded">
                                                        {project.order_count}
                                                    </span>
                                                )}
                                                {isExpanded ? (
                                                    <ChevronDown className="w-4 h-4 text-gray-400" />
                                                ) : (
                                                    <ChevronRight className="w-4 h-4 text-gray-400" />
                                                )}
                                            </button>

                                            {isExpanded && (
                                                <div className="ml-4 mt-1 space-y-1">
                                                    <Link
                                                        href={`/buyer/projects/${project.id}/publishers`}
                                                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-500 hover:text-gray-700 hover:bg-white rounded-lg"
                                                    >
                                                        <Globe className="w-4 h-4" />
                                                        All Publishers
                                                    </Link>
                                                    <Link
                                                        href={`/buyer/projects/${project.id}/orders`}
                                                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-500 hover:text-gray-700 hover:bg-white rounded-lg"
                                                    >
                                                        <PackageOpen className="w-4 h-4" />
                                                        Orders
                                                    </Link>
                                                    <Link
                                                        href={`/buyer/projects/${project.id}/favorites`}
                                                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-500 hover:text-gray-700 hover:bg-white rounded-lg"
                                                    >
                                                        <Heart className="w-4 h-4" />
                                                        Favorites
                                                    </Link>
                                                    <Link
                                                        href={`/buyer/projects/${project.id}/blacklist`}
                                                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-500 hover:text-gray-700 hover:bg-white rounded-lg"
                                                    >
                                                        <Ban className="w-4 h-4" />
                                                        Blacklist
                                                    </Link>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </>
                )}

                {/* Create Project CTA - Buyers Only, when no projects */}
                {role === 'buyer' && projects.length === 0 && (
                    <div className="mt-4 p-4 bg-violet-50 rounded-lg">
                        <p className="text-sm text-violet-700 mb-2">Organize your orders with projects</p>
                        <Link
                            href="/buyer/projects/new"
                            className="flex items-center gap-2 text-sm font-medium text-violet-600 hover:text-violet-700"
                        >
                            <Plus className="w-4 h-4" />
                            Create your first project
                        </Link>
                    </div>
                )}
            </div>

            {/* Bottom Section */}
            <div className="p-4 border-t space-y-1">
                {bottomNavigation
                    .filter(item => !item.buyerOnly || role === 'buyer')
                    .map((item) => (
                        <Link
                            key={item.name}
                            href={item.href}
                            className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-white hover:text-gray-900 transition-colors"
                        >
                            <item.icon className="w-5 h-5 text-gray-400" />
                            {item.name}
                        </Link>
                    ))}
            </div>
        </aside>
    );
}
