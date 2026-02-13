export const runtime = "edge";

import { sql } from '@/lib/db';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Search, Ban, CheckCircle, MoreHorizontal } from 'lucide-react';



async function getUsers() {
    try {
        const result = await sql`
      SELECT id, email, name, is_buyer, is_publisher, is_affiliate, 
             is_active, is_banned, created_at, last_login_at
      FROM users
      ORDER BY created_at DESC
      LIMIT 50
    `;
        return result.rows;
    } catch (error) {
        console.error('Error fetching users:', error);
        return [];
    }
}

export default async function AdminUsersPage() {
    const users = await getUsers();

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white">Users</h1>
                    <p className="text-slate-400 mt-1">Manage platform users</p>
                </div>
            </div>

            {/* Search */}
            <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                    type="text"
                    placeholder="Search users..."
                    className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white placeholder:text-slate-400"
                />
            </div>

            {/* Users Table */}
            <Card className="bg-slate-800 border-slate-700">
                <CardContent className="p-0">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-slate-700">
                                <th className="text-left p-4 text-sm font-medium text-slate-400">User</th>
                                <th className="text-left p-4 text-sm font-medium text-slate-400">Roles</th>
                                <th className="text-left p-4 text-sm font-medium text-slate-400">Status</th>
                                <th className="text-left p-4 text-sm font-medium text-slate-400">Joined</th>
                                <th className="text-left p-4 text-sm font-medium text-slate-400">Last Login</th>
                                <th className="text-right p-4 text-sm font-medium text-slate-400">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((user: any) => (
                                <tr key={user.id} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center text-white font-medium">
                                                {user.name?.charAt(0)?.toUpperCase() || '?'}
                                            </div>
                                            <div>
                                                <div className="font-medium text-white">{user.name}</div>
                                                <div className="text-sm text-slate-400">{user.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex flex-wrap gap-1">
                                            {user.is_buyer && (
                                                <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 text-xs rounded-full">Buyer</span>
                                            )}
                                            {user.is_publisher && (
                                                <span className="px-2 py-0.5 bg-violet-500/20 text-violet-400 text-xs rounded-full">Publisher</span>
                                            )}
                                            {user.is_affiliate && (
                                                <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded-full">Affiliate</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        {user.is_banned ? (
                                            <span className="flex items-center gap-1 text-red-400 text-sm">
                                                <Ban className="w-4 h-4" /> Banned
                                            </span>
                                        ) : user.is_active ? (
                                            <span className="flex items-center gap-1 text-green-400 text-sm">
                                                <CheckCircle className="w-4 h-4" /> Active
                                            </span>
                                        ) : (
                                            <span className="text-yellow-400 text-sm">Inactive</span>
                                        )}
                                    </td>
                                    <td className="p-4 text-sm text-slate-400">
                                        {new Date(user.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="p-4 text-sm text-slate-400">
                                        {user.last_login_at ? new Date(user.last_login_at).toLocaleDateString() : 'Never'}
                                    </td>
                                    <td className="p-4 text-right">
                                        <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
                                            <MoreHorizontal className="w-4 h-4" />
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                            {users.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="p-8 text-center text-slate-400">
                                        No users found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </CardContent>
            </Card>
        </div>
    );
}
