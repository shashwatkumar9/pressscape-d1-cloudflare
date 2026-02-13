export default function ApiDocsPage() {
    return (
        <div className="min-h-screen bg-gray-900">
            {/* Header */}
            <header className="bg-gradient-to-r from-blue-900 to-purple-900 py-16">
                <div className="max-w-5xl mx-auto px-6">
                    <h1 className="text-4xl font-bold text-white mb-4">
                        PressScape API Documentation
                    </h1>
                    <p className="text-xl text-gray-300">
                        Programmatic access to the guest post marketplace
                    </p>
                    <div className="mt-6 flex gap-4">
                        <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm">
                            v1.0
                        </span>
                        <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm">
                            REST API
                        </span>
                    </div>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-6 py-12">
                {/* Authentication */}
                <section className="mb-16">
                    <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                        <span className="text-2xl">🔐</span> Authentication
                    </h2>
                    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                        <p className="text-gray-300 mb-4">
                            All API requests require authentication using a Bearer token. Generate an API key
                            from your Buyer Dashboard settings.
                        </p>
                        <div className="bg-gray-900 rounded-lg p-4 font-mono text-sm">
                            <span className="text-gray-500"># Include in request headers:</span>
                            <br />
                            <span className="text-blue-400">Authorization:</span>{' '}
                            <span className="text-green-400">Bearer ps_your_api_key_here</span>
                        </div>
                        <div className="mt-4 p-4 bg-yellow-900/30 border border-yellow-700 rounded-lg">
                            <p className="text-yellow-400 text-sm">
                                ⚠️ Keep your API key secret! Never expose it in client-side code.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Rate Limiting */}
                <section className="mb-16">
                    <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                        <span className="text-2xl">⏱️</span> Rate Limiting
                    </h2>
                    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                        <p className="text-gray-300 mb-4">
                            API requests are limited to <strong className="text-white">100 requests per minute</strong> per API key.
                            Rate limit headers are included in all responses:
                        </p>
                        <ul className="list-disc list-inside text-gray-300 space-y-2">
                            <li><code className="text-blue-400">X-RateLimit-Limit</code> - Maximum requests per minute</li>
                            <li><code className="text-blue-400">X-RateLimit-Remaining</code> - Remaining requests in current window</li>
                            <li><code className="text-blue-400">X-RateLimit-Reset</code> - Time when the rate limit resets</li>
                        </ul>
                    </div>
                </section>

                {/* Endpoints */}
                <section className="mb-16">
                    <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                        <span className="text-2xl">📡</span> Endpoints
                    </h2>

                    {/* Websites List */}
                    <div className="bg-gray-800 rounded-xl border border-gray-700 mb-6 overflow-hidden">
                        <div className="flex items-center gap-3 px-6 py-4 bg-gray-750 border-b border-gray-700">
                            <span className="px-3 py-1 bg-green-600 text-white text-sm font-bold rounded">GET</span>
                            <code className="text-white font-mono">/api/v1/websites</code>
                        </div>
                        <div className="p-6">
                            <p className="text-gray-300 mb-4">List all available websites with optional filters.</p>

                            <h4 className="text-white font-semibold mb-2">Query Parameters</h4>
                            <table className="w-full text-sm mb-4">
                                <thead>
                                    <tr className="text-left text-gray-400 border-b border-gray-700">
                                        <th className="pb-2">Parameter</th>
                                        <th className="pb-2">Type</th>
                                        <th className="pb-2">Description</th>
                                    </tr>
                                </thead>
                                <tbody className="text-gray-300">
                                    <tr className="border-b border-gray-700/50">
                                        <td className="py-2 font-mono text-blue-400">page</td>
                                        <td>integer</td>
                                        <td>Page number (default: 1)</td>
                                    </tr>
                                    <tr className="border-b border-gray-700/50">
                                        <td className="py-2 font-mono text-blue-400">limit</td>
                                        <td>integer</td>
                                        <td>Items per page (1-100, default: 20)</td>
                                    </tr>
                                    <tr className="border-b border-gray-700/50">
                                        <td className="py-2 font-mono text-blue-400">category</td>
                                        <td>string</td>
                                        <td>Filter by category slug</td>
                                    </tr>
                                    <tr className="border-b border-gray-700/50">
                                        <td className="py-2 font-mono text-blue-400">da_min, da_max</td>
                                        <td>integer</td>
                                        <td>Domain Authority range (0-100)</td>
                                    </tr>
                                    <tr className="border-b border-gray-700/50">
                                        <td className="py-2 font-mono text-blue-400">price_min, price_max</td>
                                        <td>integer</td>
                                        <td>Price range in USD</td>
                                    </tr>
                                    <tr className="border-b border-gray-700/50">
                                        <td className="py-2 font-mono text-blue-400">sort</td>
                                        <td>string</td>
                                        <td>da_desc, da_asc, price_asc, price_desc, traffic_desc</td>
                                    </tr>
                                    <tr>
                                        <td className="py-2 font-mono text-blue-400">search</td>
                                        <td>string</td>
                                        <td>Search by domain name</td>
                                    </tr>
                                </tbody>
                            </table>

                            <h4 className="text-white font-semibold mb-2">Example Request</h4>
                            <div className="bg-gray-900 rounded-lg p-4 font-mono text-sm overflow-x-auto">
                                <span className="text-green-400">curl</span>{' '}
                                <span className="text-gray-300">&quot;https://pressscape.com/api/v1/websites?da_min=30&amp;limit=10&quot;</span> \<br />
                                {'  '}<span className="text-blue-400">-H</span> <span className="text-yellow-400">&quot;Authorization: Bearer ps_xxx&quot;</span>
                            </div>
                        </div>
                    </div>

                    {/* Website Details */}
                    <div className="bg-gray-800 rounded-xl border border-gray-700 mb-6 overflow-hidden">
                        <div className="flex items-center gap-3 px-6 py-4 bg-gray-750 border-b border-gray-700">
                            <span className="px-3 py-1 bg-green-600 text-white text-sm font-bold rounded">GET</span>
                            <code className="text-white font-mono">/api/v1/websites/:id</code>
                        </div>
                        <div className="p-6">
                            <p className="text-gray-300 mb-4">Get detailed information about a specific website.</p>
                            <h4 className="text-white font-semibold mb-2">Example Request</h4>
                            <div className="bg-gray-900 rounded-lg p-4 font-mono text-sm overflow-x-auto">
                                <span className="text-green-400">curl</span>{' '}
                                <span className="text-gray-300">&quot;https://pressscape.com/api/v1/websites/abc123&quot;</span> \<br />
                                {'  '}<span className="text-blue-400">-H</span> <span className="text-yellow-400">&quot;Authorization: Bearer ps_xxx&quot;</span>
                            </div>
                        </div>
                    </div>

                    {/* List Orders */}
                    <div className="bg-gray-800 rounded-xl border border-gray-700 mb-6 overflow-hidden">
                        <div className="flex items-center gap-3 px-6 py-4 bg-gray-750 border-b border-gray-700">
                            <span className="px-3 py-1 bg-green-600 text-white text-sm font-bold rounded">GET</span>
                            <code className="text-white font-mono">/api/v1/orders</code>
                        </div>
                        <div className="p-6">
                            <p className="text-gray-300 mb-4">List your orders with optional status filter.</p>
                            <h4 className="text-white font-semibold mb-2">Query Parameters</h4>
                            <table className="w-full text-sm mb-4">
                                <tbody className="text-gray-300">
                                    <tr className="border-b border-gray-700/50">
                                        <td className="py-2 font-mono text-blue-400">status</td>
                                        <td>pending, accepted, writing, published, completed</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Create Order */}
                    <div className="bg-gray-800 rounded-xl border border-gray-700 mb-6 overflow-hidden">
                        <div className="flex items-center gap-3 px-6 py-4 bg-gray-750 border-b border-gray-700">
                            <span className="px-3 py-1 bg-blue-600 text-white text-sm font-bold rounded">POST</span>
                            <code className="text-white font-mono">/api/v1/orders</code>
                        </div>
                        <div className="p-6">
                            <p className="text-gray-300 mb-4">Create a new order. Requires &quot;write&quot; or &quot;orders&quot; permission on your API key.</p>

                            <h4 className="text-white font-semibold mb-2">Request Body</h4>
                            <div className="bg-gray-900 rounded-lg p-4 font-mono text-sm overflow-x-auto mb-4">
                                <pre className="text-gray-300">{`{
  "website_id": "abc123",
  "order_type": "guest_post",
  "target_url": "https://yoursite.com/page",
  "anchor_text": "your keyword",
  "content_source": "publisher_writes",
  "notes": "Optional notes for publisher",
  "is_urgent": false
}`}</pre>
                            </div>

                            <h4 className="text-white font-semibold mb-2">Example Request</h4>
                            <div className="bg-gray-900 rounded-lg p-4 font-mono text-sm overflow-x-auto">
                                <span className="text-green-400">curl</span>{' '}
                                <span className="text-blue-400">-X POST</span>{' '}
                                <span className="text-gray-300">&quot;https://pressscape.com/api/v1/orders&quot;</span> \<br />
                                {'  '}<span className="text-blue-400">-H</span> <span className="text-yellow-400">&quot;Authorization: Bearer ps_xxx&quot;</span> \<br />
                                {'  '}<span className="text-blue-400">-H</span> <span className="text-yellow-400">&quot;Content-Type: application/json&quot;</span> \<br />
                                {'  '}<span className="text-blue-400">-d</span> <span className="text-yellow-400">{`'{"website_id":"abc","order_type":"guest_post","target_url":"https://...","anchor_text":"keyword"}'`}</span>
                            </div>
                        </div>
                    </div>

                    {/* Order Details */}
                    <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
                        <div className="flex items-center gap-3 px-6 py-4 bg-gray-750 border-b border-gray-700">
                            <span className="px-3 py-1 bg-green-600 text-white text-sm font-bold rounded">GET</span>
                            <code className="text-white font-mono">/api/v1/orders/:id</code>
                        </div>
                        <div className="p-6">
                            <p className="text-gray-300">Get detailed information about a specific order.</p>
                        </div>
                    </div>
                </section>

                {/* Error Codes */}
                <section className="mb-16">
                    <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                        <span className="text-2xl">⚠️</span> Error Codes
                    </h2>
                    <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-left text-gray-400 border-b border-gray-700 bg-gray-750">
                                    <th className="px-6 py-3">HTTP Status</th>
                                    <th className="px-6 py-3">Code</th>
                                    <th className="px-6 py-3">Description</th>
                                </tr>
                            </thead>
                            <tbody className="text-gray-300">
                                <tr className="border-b border-gray-700/50">
                                    <td className="px-6 py-3">401</td>
                                    <td className="px-6 py-3 font-mono text-red-400">UNAUTHORIZED</td>
                                    <td className="px-6 py-3">Invalid or missing API key</td>
                                </tr>
                                <tr className="border-b border-gray-700/50">
                                    <td className="px-6 py-3">403</td>
                                    <td className="px-6 py-3 font-mono text-red-400">FORBIDDEN</td>
                                    <td className="px-6 py-3">API key lacks required permission</td>
                                </tr>
                                <tr className="border-b border-gray-700/50">
                                    <td className="px-6 py-3">404</td>
                                    <td className="px-6 py-3 font-mono text-red-400">NOT_FOUND</td>
                                    <td className="px-6 py-3">Resource not found</td>
                                </tr>
                                <tr className="border-b border-gray-700/50">
                                    <td className="px-6 py-3">429</td>
                                    <td className="px-6 py-3 font-mono text-red-400">RATE_LIMIT_EXCEEDED</td>
                                    <td className="px-6 py-3">Too many requests</td>
                                </tr>
                                <tr>
                                    <td className="px-6 py-3">500</td>
                                    <td className="px-6 py-3 font-mono text-red-400">INTERNAL_ERROR</td>
                                    <td className="px-6 py-3">Server error, please try again</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </section>

                {/* Get Started */}
                <section>
                    <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                        <span className="text-2xl">🚀</span> Get Started
                    </h2>
                    <div className="bg-gradient-to-r from-blue-900/50 to-purple-900/50 rounded-xl border border-blue-700 p-8">
                        <ol className="list-decimal list-inside text-gray-300 space-y-3">
                            <li>Sign up or log in to your PressScape account</li>
                            <li>Navigate to <strong className="text-white">Buyer Dashboard → Settings</strong></li>
                            <li>Generate an API key with appropriate permissions</li>
                            <li>Start making API requests!</li>
                        </ol>
                        <div className="mt-6">
                            <a
                                href="/signup"
                                className="inline-block px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-500 hover:to-purple-500 transition"
                            >
                                Create Account →
                            </a>
                        </div>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="border-t border-gray-800 py-8 mt-16">
                <div className="max-w-5xl mx-auto px-6 text-center text-gray-500">
                    <p>PressScape API v1.0 • Need help? Contact <a href="mailto:support@pressscape.com" className="text-blue-400 hover:underline">support@pressscape.com</a></p>
                </div>
            </footer>
        </div>
    );
}
