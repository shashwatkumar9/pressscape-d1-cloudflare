'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Eye, EyeOff, Loader2, Check } from 'lucide-react';

export function SignupForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        roles: {
            buyer: true,
            publisher: false,
            affiliate: false,
        },
    });

    // Set default role from URL params
    useEffect(() => {
        const role = searchParams.get('role');
        if (role === 'publisher') {
            setFormData(prev => ({
                ...prev,
                roles: { buyer: false, publisher: true, affiliate: false }
            }));
        } else if (role === 'affiliate') {
            setFormData(prev => ({
                ...prev,
                roles: { buyer: false, publisher: false, affiliate: true }
            }));
        }
    }, [searchParams]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (!formData.roles.buyer && !formData.roles.publisher && !formData.roles.affiliate) {
            setError('Please select at least one role');
            setLoading(false);
            return;
        }

        try {
            const response = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await response.json() as any;

            if (!response.ok) {
                throw new Error(data.error || 'Signup failed');
            }

            if (formData.roles.publisher) {
                router.push('/publisher/dashboard');
            } else {
                router.push('/buyer/dashboard');
            }
            router.refresh();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    const toggleRole = (role: 'buyer' | 'publisher' | 'affiliate') => {
        setFormData({
            ...formData,
            roles: {
                ...formData.roles,
                [role]: !formData.roles[role],
            },
        });
    };

    return (
        <Card className="w-full max-w-md">
            <CardHeader className="text-center">
                <Link href="/" className="inline-flex items-center justify-center gap-2 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center">
                        <span className="text-white font-bold text-lg">P</span>
                    </div>
                </Link>
                <CardTitle className="text-2xl">Create your account</CardTitle>
                <CardDescription>Join PressScape and start today</CardDescription>
            </CardHeader>

            <form onSubmit={handleSubmit}>
                <CardContent className="space-y-4">
                    {error && (
                        <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm">
                            {error}
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                            id="name"
                            type="text"
                            placeholder="John Doe"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="you@example.com"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <div className="relative">
                            <Input
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                required
                                minLength={8}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>
                        <p className="text-xs text-gray-500">Minimum 8 characters</p>
                    </div>

                    <div className="space-y-3">
                        <Label>How would you like to use PressScape?</Label>
                        <div className="space-y-2">
                            {[
                                { key: 'buyer', label: 'Buy guest posts & links', desc: 'Purchase content and backlinks' },
                                { key: 'publisher', label: 'Sell guest posts', desc: 'List your website and earn' },
                                { key: 'affiliate', label: 'Earn as affiliate', desc: 'Refer users and earn commissions' },
                            ].map((role) => (
                                <button
                                    key={role.key}
                                    type="button"
                                    onClick={() => toggleRole(role.key as 'buyer' | 'publisher' | 'affiliate')}
                                    className={`w-full flex items-center justify-between p-3 rounded-lg border-2 transition-all ${formData.roles[role.key as keyof typeof formData.roles]
                                            ? 'border-violet-500 bg-violet-50'
                                            : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                >
                                    <div className="text-left">
                                        <div className="font-medium text-gray-900">{role.label}</div>
                                        <div className="text-sm text-gray-500">{role.desc}</div>
                                    </div>
                                    <div className={`w-5 h-5 rounded-full flex items-center justify-center ${formData.roles[role.key as keyof typeof formData.roles]
                                            ? 'bg-violet-600'
                                            : 'border-2 border-gray-300'
                                        }`}>
                                        {formData.roles[role.key as keyof typeof formData.roles] && (
                                            <Check className="w-3 h-3 text-white" />
                                        )}
                                    </div>
                                </button>
                            ))}
                        </div>
                        <p className="text-xs text-gray-500">You can activate more roles later</p>
                    </div>
                </CardContent>

                <CardFooter className="flex flex-col gap-4">
                    <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Creating account...
                            </>
                        ) : (
                            'Create account'
                        )}
                    </Button>

                    <p className="text-center text-xs text-gray-500">
                        By creating an account, you agree to our{' '}
                        <Link href="/terms" className="text-violet-600 hover:underline">Terms</Link>
                        {' '}and{' '}
                        <Link href="/privacy" className="text-violet-600 hover:underline">Privacy Policy</Link>
                    </p>

                    <p className="text-center text-sm text-gray-600">
                        Already have an account?{' '}
                        <Link href="/login" className="text-violet-600 hover:underline font-medium">
                            Sign in
                        </Link>
                    </p>
                </CardFooter>
            </form>
        </Card>
    );
}
