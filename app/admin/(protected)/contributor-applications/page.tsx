export const runtime = "edge";

import { sql } from '@/lib/db';
import { validateAdminRequest } from '@/lib/admin-auth';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, CheckCircle, XCircle, User, Globe, ExternalLink } from 'lucide-react';



async function getContributorApplications() {
    try {
        const result = await sql`
            SELECT 
                w.id,
                w.domain,
                w.contributor_application,
                w.created_at,
                w.verification_status,
                u.name as applicant_name,
                u.email as applicant_email,
                u.id as applicant_id
            FROM websites w
            JOIN users u ON w.user_id = u.id
            WHERE w.ownership_type = 'contributor'
            ORDER BY 
                CASE w.verification_status
                    WHEN 'pending' THEN 1
                    WHEN 'verified' THEN 2
                    WHEN 'rejected' THEN 3
                END,
                w.created_at DESC
            LIMIT 100
        `;
        return result.rows;
    } catch (error) {
        console.error('Error fetching applications:', error);
        return [];
    }
}

interface ApplicationStats {
    pending_count: number;
    approved_count: number;
    rejected_count: number;
}

async function getApplicationStats(): Promise<ApplicationStats> {
    try {
        const result = await sql`
            SELECT 
                COUNT(*) FILTER (WHERE verification_status = 'pending') as pending_count,
                COUNT(*) FILTER (WHERE verification_status = 'verified') as approved_count,
                COUNT(*) FILTER (WHERE verification_status = 'rejected') as rejected_count
            FROM websites
            WHERE ownership_type = 'contributor'
        `;
        const row = result.rows[0] as Record<string, unknown>;
        return {
            pending_count: parseInt(String(row.pending_count)) || 0,
            approved_count: parseInt(String(row.approved_count)) || 0,
            rejected_count: parseInt(String(row.rejected_count)) || 0,
        };
    } catch (error) {
        console.error('Error fetching stats:', error);
        return { pending_count: 0, approved_count: 0, rejected_count: 0 };
    }
}

export default async function ContributorApplicationsPage() {
    const { admin } = await validateAdminRequest();
    if (!admin) {
        return <div>Unauthorized</div>;
    }

    const applications = await getContributorApplications();
    const stats = await getApplicationStats();

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-white">Contributor Applications</h1>
                <p className="text-slate-400 mt-1">Review and approve website contributor requests</p>
            </div>

            {/* Stats */}
            <div className="grid md:grid-cols-3 gap-4">
                <Card className="bg-slate-800 border-slate-700">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-slate-400 text-sm">Pending Review</p>
                                <p className="text-2xl font-bold text-white mt-1">{stats.pending_count}</p>
                            </div>
                            <Clock className="w-8 h-8 text-yellow-400" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-slate-800 border-slate-700">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-slate-400 text-sm">Approved</p>
                                <p className="text-2xl font-bold text-white mt-1">{stats.approved_count}</p>
                            </div>
                            <CheckCircle className="w-8 h-8 text-green-400" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-slate-800 border-slate-700">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-slate-400 text-sm">Rejected</p>
                                <p className="text-2xl font-bold text-white mt-1">{stats.rejected_count}</p>
                            </div>
                            <XCircle className="w-8 h-8 text-red-400" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Applications List */}
            <div className="space-y-4">
                {applications.length === 0 ? (
                    <Card className="bg-slate-800 border-slate-700">
                        <CardContent className="p-12 text-center">
                            <User className="w-16 h-16 mx-auto text-slate-600 mb-4" />
                            <h3 className="text-xl font-semibold text-white mb-2">No applications yet</h3>
                            <p className="text-slate-400">
                                Contributor applications will appear here for review
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    applications.map((app: any) => {
                        const appData = typeof app.contributor_application === 'string'
                            ? JSON.parse(app.contributor_application)
                            : app.contributor_application;

                        return (
                            <Card key={app.id} className="bg-slate-800 border-slate-700">
                                <CardContent className="p-6">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-start gap-4">
                                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-white font-bold text-lg">
                                                {app.applicant_name[0].toUpperCase()}
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-white text-lg">{app.applicant_name}</h3>
                                                <p className="text-sm text-slate-400">{app.applicant_email}</p>
                                                <div className="flex items-center gap-2 mt-2">
                                                    <Globe className="w-4 h-4 text-slate-500" />
                                                    <span className="text-slate-300">{app.domain}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {app.verification_status === 'pending' && (
                                                <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 text-sm rounded-full flex items-center gap-1">
                                                    <Clock className="w-3.5 h-3.5" /> Pending
                                                </span>
                                            )}
                                            {app.verification_status === 'verified' && (
                                                <span className="px-3 py-1 bg-green-500/20 text-green-400 text-sm rounded-full flex items-center gap-1">
                                                    <CheckCircle className="w-3.5 h-3.5" /> Approved
                                                </span>
                                            )}
                                            {app.verification_status === 'rejected' && (
                                                <span className="px-3 py-1 bg-red-500/20 text-red-400 text-sm rounded-full flex items-center gap-1">
                                                    <XCircle className="w-3.5 h-3.5" /> Rejected
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-sm font-medium text-slate-400">Application</label>
                                            <div className="mt-2 p-4 bg-slate-900 rounded-lg text-slate-300 text-sm whitespace-pre-wrap">
                                                {appData.application}
                                            </div>
                                            <div className="mt-1 text-xs text-slate-500">
                                                {appData.application.length} characters • {Math.ceil(appData.application.split(' ').length / 100) * 100} words (approx)
                                            </div>
                                        </div>

                                        {appData.portfolioLinks && appData.portfolioLinks.length > 0 && (
                                            <div>
                                                <label className="text-sm font-medium text-slate-400">Portfolio Links</label>
                                                <div className="mt-2 space-y-1">
                                                    {appData.portfolioLinks.map((link: string, idx: number) => (
                                                        <a
                                                            key={idx}
                                                            href={link}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="flex items-center gap-2 text-violet-400 hover:text-violet-300 text-sm"
                                                        >
                                                            <ExternalLink className="w-4 h-4" />
                                                            {link}
                                                        </a>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {appData.sampleArticles && appData.sampleArticles.length > 0 && (
                                            <div>
                                                <label className="text-sm font-medium text-slate-400">Sample Articles</label>
                                                <div className="mt-2 space-y-1">
                                                    {appData.sampleArticles.map((link: string, idx: number) => (
                                                        <a
                                                            key={idx}
                                                            href={link}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="flex items-center gap-2 text-violet-400 hover:text-violet-300 text-sm"
                                                        >
                                                            <ExternalLink className="w-4 h-4" />
                                                            {link}
                                                        </a>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        <div className="text-xs text-slate-500">
                                            Applied {new Date(appData.appliedAt).toLocaleString()}
                                        </div>

                                        {app.verification_status === 'pending' && (
                                            <div className="flex items-center gap-3 pt-4">
                                                <Link href={`/admin/contributor-applications/${app.id}`} className="flex-1">
                                                    <Button className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500">
                                                        <CheckCircle className="w-4 h-4 mr-2" />
                                                        Review & Approve
                                                    </Button>
                                                </Link>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })
                )}
            </div>
        </div>
    );
}
