export const runtime = "edge";

import { sql } from '@/lib/db';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mail, Plus, Trash2, Ban } from 'lucide-react';



async function getBannedEmails() {
    try {
        const result = await sql`
      SELECT be.*, au.name as banned_by_name
      FROM banned_emails be
      LEFT JOIN admin_users au ON be.banned_by = au.id
      WHERE be.is_active = true
      ORDER BY be.created_at DESC
    `;
        return result.rows;
    } catch (error) {
        console.error('Error fetching banned emails:', error);
        return [];
    }
}

export default async function AdminEmailsPage() {
    const bannedEmails = await getBannedEmails();

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white">Banned Emails</h1>
                    <p className="text-slate-400 mt-1">Block specific email addresses or patterns</p>
                </div>
                <Button className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 gap-2">
                    <Plus className="w-4 h-4" />
                    Add Pattern
                </Button>
            </div>

            {/* Add Form */}
            <Card className="bg-slate-800 border-slate-700">
                <CardContent className="pt-6">
                    <div className="flex items-center gap-4">
                        <div className="flex-1">
                            <input
                                type="text"
                                placeholder="Enter email or pattern (e.g. *@spam.com)"
                                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder:text-slate-400"
                            />
                        </div>
                        <div className="flex-1">
                            <input
                                type="text"
                                placeholder="Reason for ban"
                                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder:text-slate-400"
                            />
                        </div>
                        <Button className="gap-2">
                            <Ban className="w-4 h-4" />
                            Ban
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Banned List */}
            <Card className="bg-slate-800 border-slate-700">
                <CardContent className="p-0">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-slate-700">
                                <th className="text-left p-4 text-sm font-medium text-slate-400">Email Pattern</th>
                                <th className="text-left p-4 text-sm font-medium text-slate-400">Reason</th>
                                <th className="text-left p-4 text-sm font-medium text-slate-400">Banned By</th>
                                <th className="text-left p-4 text-sm font-medium text-slate-400">Date</th>
                                <th className="text-right p-4 text-sm font-medium text-slate-400">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {bannedEmails.map((item: any) => (
                                <tr key={item.id} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                                    <td className="p-4">
                                        <div className="flex items-center gap-2">
                                            <Mail className="w-4 h-4 text-red-400" />
                                            <span className="font-mono text-white">{item.email_pattern}</span>
                                        </div>
                                    </td>
                                    <td className="p-4 text-slate-300">{item.reason || '-'}</td>
                                    <td className="p-4 text-slate-400">{item.banned_by_name || 'System'}</td>
                                    <td className="p-4 text-sm text-slate-400">
                                        {new Date(item.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="p-4 text-right">
                                        <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-300 gap-1">
                                            <Trash2 className="w-4 h-4" />
                                            Remove
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                            {bannedEmails.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-slate-400">
                                        No banned emails. Add a pattern to block unwanted signups.
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
