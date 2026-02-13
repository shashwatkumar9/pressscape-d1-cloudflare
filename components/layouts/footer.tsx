import Link from 'next/link';
import { Shield } from 'lucide-react';

export function Footer() {
    return (
        <footer className="bg-white border-t border-gray-200 mt-auto">
            <div className="max-w-7xl mx-auto px-6 py-8">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center">
                            <Shield className="w-4 h-4 text-white" />
                        </div>
                        <span className="font-bold text-gray-900">PressScape</span>
                    </div>
                    <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-600">
                        <Link href="/marketplace" className="hover:text-violet-600 transition-colors">Marketplace</Link>
                        <Link href="/how-it-works" className="hover:text-violet-600 transition-colors">How it Works</Link>
                        <Link href="/privacy" className="hover:text-violet-600 transition-colors">Privacy Policy</Link>
                        <Link href="/terms" className="hover:text-violet-600 transition-colors">Terms of Service</Link>
                        <Link href="/help" className="hover:text-violet-600 transition-colors">Help Center</Link>
                    </div>
                    <div className="text-sm text-gray-500">
                        © {new Date().getFullYear()} PressScape. All rights reserved.
                    </div>
                </div>
            </div>
        </footer>
    );
}
