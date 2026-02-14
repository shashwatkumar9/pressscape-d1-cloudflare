'use client';

import { useState } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { loginAction } from '@/app/actions/auth';

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" className="w-full" disabled={pending}>
            {pending ? (
                <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Signing in...
                </>
            ) : (
                'Sign in'
            )}
        </Button>
    );
}

export default function LoginPage() {
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);
    const [state, formAction] = useFormState(loginAction, null);

    // Redirect on success and store JWT token
    if (state?.success && state?.token) {
        // Store JWT in cookie (client-side)
        document.cookie = `auth_token=${state.token}; path=/; max-age=${30 * 24 * 60 * 60}; SameSite=Lax; Secure`;
        console.log('JWT token stored in cookie');
        window.location.href = '/buyer/dashboard';
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-violet-50 px-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <Link href="/" className="inline-flex items-center justify-center gap-2 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center">
                            <span className="text-white font-bold text-lg">P</span>
                        </div>
                    </Link>
                    <CardTitle className="text-2xl">Welcome back</CardTitle>
                    <CardDescription>Sign in to your PressScape account</CardDescription>
                </CardHeader>

                <form action={formAction}>
                    <CardContent className="space-y-4">
                        {state?.error && (
                            <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm">
                                {state.error}
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="you@example.com"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    name="password"
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="••••••••"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center justify-between text-sm">
                            <label className="flex items-center gap-2">
                                <input type="checkbox" className="rounded border-gray-300" />
                                <span className="text-gray-600">Remember me</span>
                            </label>
                            <Link href="/forgot-password" className="text-violet-600 hover:underline">
                                Forgot password?
                            </Link>
                        </div>
                    </CardContent>

                    <CardFooter className="flex flex-col gap-4">
                        <SubmitButton />

                        <p className="text-center text-sm text-gray-600">
                            Don't have an account?{' '}
                            <Link href="/signup" className="text-violet-600 hover:underline font-medium">
                                Sign up
                            </Link>
                        </p>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}
