import { Suspense } from 'react';
import { SignupForm } from '@/components/auth/signup-form';
import { Loader2 } from 'lucide-react';

function SignupFormFallback() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-violet-50 px-4 py-8">
            <div className="flex items-center gap-2 text-gray-600">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Loading...</span>
            </div>
        </div>
    );
}

export default function SignupPage() {
    return (
        <Suspense fallback={<SignupFormFallback />}>
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-violet-50 px-4 py-8">
                <SignupForm />
            </div>
        </Suspense>
    );
}
