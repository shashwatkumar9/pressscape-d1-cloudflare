'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    ArrowLeft, Users, Star, Clock, DollarSign,
    Check, X, Loader2, UserPlus
} from 'lucide-react';

interface Contributor {
    id: string;
    user_id: string;
    user_name: string;
    user_email: string;
    avatar_url: string | null;
    display_name: string | null;
    writing_price: number;
    bio: string | null;
    specialties: string[];
    sample_work_url: string | null;
    total_orders: number;
    completed_orders: number;
    average_rating: number;
    rating_count: number;
    turnaround_days: number;
    is_active: boolean;
    is_approved: boolean;
    approved_at: string | null;
    rejection_reason: string | null;
    created_at: string;
}

export default function ContributorsPage() {
    const params = useParams();
    const websiteId = params.id as string;

    const [contributors, setContributors] = useState<Contributor[]>([]);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState<string | null>(null);
    const [isOwner, setIsOwner] = useState(false);

    useEffect(() => {
        fetchContributors();
    }, [websiteId]);

    const fetchContributors = async () => {
        try {
            const res = await fetch(`/api/publisher/websites/${websiteId}/contributors`);
            const data = await res.json() as any;
            if (res.ok) {
                setContributors(data.contributors);
                setIsOwner(data.isOwner);
            }
        } catch (error) {
            console.error('Failed to fetch contributors:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (contributorId: string) => {
        setUpdating(contributorId);
        try {
            const res = await fetch(`/api/publisher/websites/${websiteId}/contributors/${contributorId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ is_approved: true })
            });
            if (res.ok) {
                fetchContributors();
            }
        } catch (error) {
            console.error('Failed to approve contributor:', error);
        } finally {
            setUpdating(null);
        }
    };

    const handleReject = async (contributorId: string) => {
        const reason = prompt('Reason for rejection (optional):');
        setUpdating(contributorId);
        try {
            const res = await fetch(`/api/publisher/websites/${websiteId}/contributors/${contributorId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ is_approved: false, rejection_reason: reason })
            });
            if (res.ok) {
                fetchContributors();
            }
        } catch (error) {
            console.error('Failed to reject contributor:', error);
        } finally {
            setUpdating(null);
        }
    };

    const handleToggleActive = async (contributorId: string, currentActive: boolean) => {
        setUpdating(contributorId);
        try {
            const res = await fetch(`/api/publisher/websites/${websiteId}/contributors/${contributorId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ is_active: !currentActive })
            });
            if (res.ok) {
                fetchContributors();
            }
        } catch (error) {
            console.error('Failed to toggle contributor:', error);
        } finally {
            setUpdating(null);
        }
    };

    const handleRemove = async (contributorId: string) => {
        if (!confirm('Are you sure you want to remove this contributor?')) return;
        setUpdating(contributorId);
        try {
            const res = await fetch(`/api/publisher/websites/${websiteId}/contributors/${contributorId}`, {
                method: 'DELETE'
            });
            if (res.ok) {
                fetchContributors();
            } else {
                const data = await res.json() as any;
                alert(data.error || 'Failed to remove contributor');
            }
        } catch (error) {
            console.error('Failed to remove contributor:', error);
        } finally {
            setUpdating(null);
        }
    };

    const pendingContributors = contributors.filter(c => !c.is_approved && !c.rejection_reason);
    const approvedContributors = contributors.filter(c => c.is_approved);
    const rejectedContributors = contributors.filter(c => !c.is_approved && c.rejection_reason);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-violet-600" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href={`/publisher/websites/${websiteId}`}>
                        <Button variant="ghost" size="sm">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Content Writers</h1>
                        <p className="text-gray-500">Manage contributors who can write content for this website</p>
                    </div>
                </div>
                <Button disabled className="gap-2">
                    <UserPlus className="w-4 h-4" />
                    Invite Writer (Coming Soon)
                </Button>
            </div>

            {/* Pending Applications */}
            {pendingContributors.length > 0 && isOwner && (
                <Card className="border-yellow-200 bg-yellow-50">
                    <CardHeader>
                        <CardTitle className="text-yellow-800 flex items-center gap-2">
                            <Users className="w-5 h-5" />
                            Pending Applications ({pendingContributors.length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {pendingContributors.map(contributor => (
                            <ContributorCard
                                key={contributor.id}
                                contributor={contributor}
                                isOwner={isOwner}
                                isPending
                                updating={updating === contributor.id}
                                onApprove={() => handleApprove(contributor.id)}
                                onReject={() => handleReject(contributor.id)}
                            />
                        ))}
                    </CardContent>
                </Card>
            )}

            {/* Approved Contributors */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Check className="w-5 h-5 text-green-600" />
                        Active Writers ({approvedContributors.filter(c => c.is_active).length})
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {approvedContributors.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                            <p>No approved contributors yet.</p>
                            <p className="text-sm">Writers can apply to contribute content for this website.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {approvedContributors.map(contributor => (
                                <ContributorCard
                                    key={contributor.id}
                                    contributor={contributor}
                                    isOwner={isOwner}
                                    updating={updating === contributor.id}
                                    onToggleActive={() => handleToggleActive(contributor.id, contributor.is_active)}
                                    onRemove={() => handleRemove(contributor.id)}
                                />
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Rejected (if any) */}
            {rejectedContributors.length > 0 && isOwner && (
                <Card className="border-gray-200 opacity-75">
                    <CardHeader>
                        <CardTitle className="text-gray-500 flex items-center gap-2">
                            <X className="w-5 h-5" />
                            Rejected ({rejectedContributors.length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {rejectedContributors.map(contributor => (
                            <ContributorCard
                                key={contributor.id}
                                contributor={contributor}
                                isOwner={isOwner}
                                isRejected
                            />
                        ))}
                    </CardContent>
                </Card>
            )}
        </div>
    );
}

function ContributorCard({
    contributor,
    isOwner,
    isPending,
    isRejected,
    updating,
    onApprove,
    onReject,
    onToggleActive,
    onRemove
}: {
    contributor: Contributor;
    isOwner: boolean;
    isPending?: boolean;
    isRejected?: boolean;
    updating?: boolean;
    onApprove?: () => void;
    onReject?: () => void;
    onToggleActive?: () => void;
    onRemove?: () => void;
}) {
    return (
        <div className={`p-4 rounded-xl border ${isPending ? 'border-yellow-300 bg-white' : isRejected ? 'bg-gray-50' : 'bg-white'} ${!contributor.is_active && !isPending && !isRejected ? 'opacity-60' : ''}`}>
            <div className="flex items-start gap-4">
                {/* Avatar */}
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                    {contributor.display_name?.[0] || contributor.user_name?.[0] || '?'}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-gray-900">
                            {contributor.display_name || contributor.user_name}
                        </h3>
                        {contributor.rating_count > 0 && (
                            <div className="flex items-center gap-1 text-yellow-600">
                                <Star className="w-4 h-4 fill-yellow-400" />
                                <span className="text-sm">{Number(contributor.average_rating || 0).toFixed(1)}</span>
                                <span className="text-xs text-gray-400">({contributor.rating_count})</span>
                            </div>
                        )}
                        {!contributor.is_active && !isPending && !isRejected && (
                            <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">Inactive</span>
                        )}
                    </div>

                    {contributor.bio && (
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">{contributor.bio}</p>
                    )}

                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                            <DollarSign className="w-4 h-4" />
                            <span className="font-medium text-gray-900">${(contributor.writing_price / 100).toFixed(0)}</span>
                            <span>/article</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>{contributor.turnaround_days} days</span>
                        </div>
                        <span>{contributor.completed_orders} orders</span>
                    </div>

                    {contributor.specialties && contributor.specialties.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                            {contributor.specialties.slice(0, 4).map((s, i) => (
                                <span key={i} className="px-2 py-0.5 bg-violet-50 text-violet-700 text-xs rounded-full">
                                    {s}
                                </span>
                            ))}
                        </div>
                    )}

                    {isRejected && contributor.rejection_reason && (
                        <p className="text-sm text-red-600 mt-2">Reason: {contributor.rejection_reason}</p>
                    )}
                </div>

                {/* Actions */}
                {isOwner && (
                    <div className="flex items-center gap-2 flex-shrink-0">
                        {isPending ? (
                            <>
                                <Button
                                    size="sm"
                                    onClick={onApprove}
                                    disabled={updating}
                                    className="bg-green-600 hover:bg-green-700"
                                >
                                    {updating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                                </Button>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={onReject}
                                    disabled={updating}
                                    className="border-red-200 text-red-600 hover:bg-red-50"
                                >
                                    <X className="w-4 h-4" />
                                </Button>
                            </>
                        ) : !isRejected && (
                            <>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={onToggleActive}
                                    disabled={updating}
                                >
                                    {updating ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                                        contributor.is_active ? 'Pause' : 'Activate'
                                    )}
                                </Button>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={onRemove}
                                    disabled={updating}
                                    className="text-red-600 hover:bg-red-50"
                                >
                                    Remove
                                </Button>
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
