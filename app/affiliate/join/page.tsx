'use client';



import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    Link2,
    DollarSign,
    Users,
    Clock,
    CheckCircle,
    ArrowRight,
    Loader2,
} from 'lucide-react';

export default function AffiliateJoinPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleJoin = async () => {
        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/affiliate/enable', { method: 'POST' });
            const data = await res.json() as any;

            if (res.ok) {
                router.push('/affiliate/dashboard');
            } else {
                setError(data.error || 'Failed to enable affiliate program');
            }
        } catch (err) {
            setError('Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-50 flex items-center justify-center p-6">
            <div className="max-w-2xl w-full">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-500 flex items-center justify-center">
                        <Link2 className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900">Join Our Affiliate Program</h1>
                    <p className="text-gray-600 mt-2">Earn commissions by referring buyers to PressScape</p>
                </div>

                <Card className="mb-6">
                    <CardContent className="pt-6">
                        <div className="grid md:grid-cols-3 gap-6">
                            <div className="text-center">
                                <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-emerald-100 flex items-center justify-center">
                                    <DollarSign className="w-6 h-6 text-emerald-600" />
                                </div>
                                <h3 className="font-semibold text-gray-900">7.5% Commission</h3>
                                <p className="text-sm text-gray-500 mt-1">On every order from your referrals</p>
                            </div>
                            <div className="text-center">
                                <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-blue-100 flex items-center justify-center">
                                    <Clock className="w-6 h-6 text-blue-600" />
                                </div>
                                <h3 className="font-semibold text-gray-900">180-Day Cookie</h3>
                                <p className="text-sm text-gray-500 mt-1">Long tracking window for conversions</p>
                            </div>
                            <div className="text-center">
                                <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-violet-100 flex items-center justify-center">
                                    <Users className="w-6 h-6 text-violet-600" />
                                </div>
                                <h3 className="font-semibold text-gray-900">Lifetime Referrals</h3>
                                <p className="text-sm text-gray-500 mt-1">Earn on all their future orders</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="mb-6">
                    <CardContent className="pt-6">
                        <h3 className="font-semibold text-gray-900 mb-4">How It Works</h3>
                        <div className="space-y-4">
                            <div className="flex items-start gap-4">
                                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-sm flex-shrink-0">
                                    1
                                </div>
                                <div>
                                    <h4 className="font-medium text-gray-900">Get Your Unique Link</h4>
                                    <p className="text-sm text-gray-500">Join and receive your personalized affiliate link</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-sm flex-shrink-0">
                                    2
                                </div>
                                <div>
                                    <h4 className="font-medium text-gray-900">Share With Your Network</h4>
                                    <p className="text-sm text-gray-500">Promote PressScape to SEO professionals, bloggers, and marketers</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-sm flex-shrink-0">
                                    3
                                </div>
                                <div>
                                    <h4 className="font-medium text-gray-900">Earn Commissions</h4>
                                    <p className="text-sm text-gray-500">Get 7.5% of every order your referrals make</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {error && (
                    <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-lg text-sm">
                        {error}
                    </div>
                )}

                <Button
                    onClick={handleJoin}
                    disabled={loading}
                    className="w-full py-6 text-lg bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600"
                >
                    {loading ? (
                        <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    ) : (
                        <CheckCircle className="w-5 h-5 mr-2" />
                    )}
                    {loading ? 'Joining...' : 'Join Affiliate Program'}
                    {!loading && <ArrowRight className="w-5 h-5 ml-2" />}
                </Button>

                <p className="text-center text-sm text-gray-500 mt-4">
                    By joining, you agree to our affiliate terms and conditions
                </p>
            </div>
        </div>
    );
}
