import Link from 'next/link';

export function Footer() {
    return (
        <footer className="bg-gray-900 text-gray-400 py-16 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
                    <div className="col-span-2 md:col-span-1">
                        <Link href="/" className="flex items-center gap-2 mb-4">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center">
                                <span className="text-white font-bold text-sm">P</span>
                            </div>
                            <span className="font-bold text-xl text-white">PressScape</span>
                        </Link>
                        <p className="text-sm">
                            The most transparent guest post marketplace. Quality content meets premium publishers.
                        </p>
                    </div>

                    <div>
                        <h4 className="font-semibold text-white mb-4">Platform</h4>
                        <ul className="space-y-2 text-sm">
                            <li><Link href="/marketplace" className="hover:text-white transition-colors">Marketplace</Link></li>
                            <li><Link href="/how-it-works" className="hover:text-white transition-colors">How It Works</Link></li>
                            <li><Link href="/affiliate" className="hover:text-white transition-colors">Affiliate Program</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-semibold text-white mb-4">Resources</h4>
                        <ul className="space-y-2 text-sm">
                            <li><Link href="/blog" className="hover:text-white transition-colors">Blog</Link></li>
                            <li><Link href="/help" className="hover:text-white transition-colors">Help Center</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-semibold text-white mb-4">Legal</h4>
                        <ul className="space-y-2 text-sm">
                            <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
                            <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                            <li><Link href="/refunds" className="hover:text-white transition-colors">Refund Policy</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-gray-800 pt-8 text-center text-sm">
                    <p>© {new Date().getFullYear()} PressScape. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
}
