export const runtime = "edge";

import { sql } from '@/lib/db';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Globe, Search, CheckCircle, XCircle, Clock, ExternalLink, Plus, Upload } from 'lucide-react';
import Link from 'next/link';



async function getWebsites() {
    try {
        const result = await sql`
      SELECT w.*, u.name as owner_name, u.email as owner_email
      FROM websites w
      JOIN users u ON w.owner_id = u.id
      ORDER BY w.created_at DESC
      LIMIT 50
    `;
        return result.rows;
    } catch (error) {
        console.error('Error fetching websites:', error);
        return [];
    }
}

export default async function AdminWebsitesPage() {
    const websites = await getWebsites();

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white">Websites</h1>
                    <p className="text-slate-400 mt-1">Review and approve website listings</p>
                </div>
                <div className="flex items-center gap-2">
                    <Link href="/admin/websites/bulk">
                        <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-800 gap-2">
                            <Upload className="w-4 h-4" />
                            Bulk Import
                        </Button>
                    </Link>
                    <Link href="/admin/websites/add">
                        <Button className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 gap-2">
                            <Plus className="w-4 h-4" />
                            Add Website
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search websites..."
                        className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white placeholder:text-slate-400"
                    />
                </div>
                <select className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white">
                    <option>All Status</option>
                    <option>Pending</option>
                    <option>Approved</option>
                    <option>Rejected</option>
                </select>
            </div>

            {/* Websites List */}
            <div className="space-y-4">
                {websites.map((website: any) => (
                    <Card key={website.id} className="bg-slate-800 border-slate-700">
                        <CardContent className="pt-6">
                            <div className="flex items-start justify-between">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-lg bg-violet-500/20 flex items-center justify-center">
                                        <Globe className="w-6 h-6 text-violet-400" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-semibold text-white">{website.domain}</h3>
                                            <a href={`https://${website.domain}`} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white">
                                                <ExternalLink className="w-4 h-4" />
                                            </a>
                                        </div>
                                        <p className="text-sm text-slate-400 mt-1">
                                            Owner: {website.owner_name} ({website.owner_email})
                                        </p>

                                        {/* Metrics */}
                                        <div className="flex items-center gap-6 mt-3">
                                            <div className="text-sm">
                                                <span className="text-slate-500">DA:</span>
                                                <span className="ml-1 font-medium text-white">{website.domain_authority || '-'}</span>
                                            </div>
                                            <div className="text-sm">
                                                <span className="text-slate-500">DR:</span>
                                                <span className="ml-1 font-medium text-white">{website.domain_rating || '-'}</span>
                                            </div>
                                            <div className="text-sm">
                                                <span className="text-slate-500">Traffic:</span>
                                                <span className="ml-1 font-medium text-white">{website.organic_traffic?.toLocaleString() || '-'}</span>
                                            </div>
                                            <div className="text-sm">
                                                <span className="text-slate-500">Price:</span>
                                                <span className="ml-1 font-medium text-emerald-400">
                                                    ${((website.price_guest_post || 0) / 100).toFixed(0)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    {website.verification_status === 'pending' && (
                                        <>
                                            <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 text-sm rounded-full flex items-center gap-1">
                                                <Clock className="w-4 h-4" /> Pending
                                            </span>
                                            <Button size="sm" className="bg-green-600 hover:bg-green-500 gap-1">
                                                <CheckCircle className="w-4 h-4" /> Approve
                                            </Button>
                                            <Button size="sm" variant="outline" className="border-red-600 text-red-400 hover:bg-red-600/20 gap-1">
                                                <XCircle className="w-4 h-4" /> Reject
                                            </Button>
                                        </>
                                    )}
                                    {website.verification_status === 'approved' && (
                                        <span className="px-3 py-1 bg-green-500/20 text-green-400 text-sm rounded-full flex items-center gap-1">
                                            <CheckCircle className="w-4 h-4" /> Approved
                                        </span>
                                    )}
                                    {website.verification_status === 'rejected' && (
                                        <span className="px-3 py-1 bg-red-500/20 text-red-400 text-sm rounded-full flex items-center gap-1">
                                            <XCircle className="w-4 h-4" /> Rejected
                                        </span>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}

                {websites.length === 0 && (
                    <Card className="bg-slate-800 border-slate-700">
                        <CardContent className="py-12 text-center text-slate-400">
                            No websites found
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}
