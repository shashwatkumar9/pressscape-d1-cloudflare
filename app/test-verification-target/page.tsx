import Link from 'next/link';

export default function TestVerificationPage() {
    return (
        <div className="p-8 max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold mb-4">Verification Test Target</h1>
            <p className="mb-4">
                This page simulates a published guest post. It contains a link to verify.
            </p>
            <div className="p-6 bg-slate-50 border rounded-lg">
                <p>
                    Here is the context of the article. It talks about many things.
                    And here is the <a href="https://example.com" className="text-blue-600 underline">Target Link</a> that
                    the buyer wants to verify.
                </p>
            </div>
            <div className="mt-8 text-sm text-gray-500">
                URL: /test-verification-target
            </div>
        </div>
    );
}
