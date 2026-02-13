import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Footer } from '@/components/shared/footer';
import {
    Search,
    MessageCircle,
    FileText,
    CreditCard,
    Shield,
    Globe,
    Users,
    TrendingUp,
    ArrowRight,
    Mail,
    ChevronRight,
} from 'lucide-react';

const helpCategories = [
    {
        icon: FileText,
        title: 'Getting Started',
        description: 'Learn the basics of using PressScape',
        articles: [
            'How to create an account',
            'Setting up your profile',
            'Understanding user roles',
            'Navigating the dashboard',
        ],
    },
    {
        icon: Globe,
        title: 'For Buyers',
        description: 'Everything about purchasing guest posts',
        articles: [
            'How to find the right websites',
            'Understanding website metrics',
            'Placing your first order',
            'Reviewing and approving content',
        ],
    },
    {
        icon: Users,
        title: 'For Publishers',
        description: 'Guide to selling guest posts',
        articles: [
            'Listing your website',
            'Verifying website ownership',
            'Managing incoming orders',
            'Setting competitive prices',
        ],
    },
    {
        icon: CreditCard,
        title: 'Payments & Billing',
        description: 'Payment methods, invoices, and refunds',
        articles: [
            'Accepted payment methods',
            'How escrow works',
            'Requesting a refund',
            'Downloading invoices',
        ],
    },
    {
        icon: Shield,
        title: 'Account & Security',
        description: 'Protect your account and data',
        articles: [
            'Changing your password',
            'Two-factor authentication',
            'Account verification',
            'Privacy settings',
        ],
    },
    {
        icon: TrendingUp,
        title: 'Affiliate Program',
        description: 'Earn by referring others',
        articles: [
            'How the affiliate program works',
            'Getting your referral link',
            'Tracking your earnings',
            'Payout schedule',
        ],
    },
];

const popularArticles = [
    { title: 'How do I verify my website ownership?', category: 'Publishers' },
    { title: 'What happens if my order is rejected?', category: 'Buyers' },
    { title: 'How long does it take to get published?', category: 'Orders' },
    { title: 'Can I request revisions to content?', category: 'Buyers' },
    { title: 'How do I withdraw my earnings?', category: 'Payments' },
    { title: 'What metrics should I look for?', category: 'Buyers' },
];

export default function HelpPage() {
    return (
        <div className="min-h-screen bg-white">
            {/* Navigation */}
            <nav className="sticky top-0 z-50 backdrop-blur-lg bg-white/80 border-b border-gray-200/50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <Link href="/" className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center">
                                <span className="text-white font-bold text-sm">P</span>
                            </div>
                            <span className="font-bold text-xl text-gray-900">PressScape</span>
                        </Link>
                        <div className="flex items-center gap-3">
                            <Link href="/login">
                                <Button variant="ghost" size="sm">Login</Button>
                            </Link>
                            <Link href="/signup">
                                <Button size="sm">Get Started</Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero + Search */}
            <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-violet-600 to-indigo-600 text-white">
                <div className="max-w-3xl mx-auto text-center">
                    <h1 className="text-4xl font-bold mb-4">How can we help?</h1>
                    <p className="text-violet-100 mb-8">
                        Search our knowledge base or browse categories below
                    </p>
                    <div className="relative max-w-xl mx-auto">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search for answers..."
                            className="w-full pl-12 pr-4 py-4 rounded-xl text-gray-900 placeholder:text-gray-400 focus:ring-4 focus:ring-white/20 outline-none"
                        />
                    </div>
                </div>
            </section>

            {/* Help Categories */}
            <section className="py-16 px-4 sm:px-6 lg:px-8">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
                        Browse by Category
                    </h2>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {helpCategories.map((category) => (
                            <Card key={category.title} className="hover:shadow-lg transition-shadow">
                                <CardContent className="pt-6">
                                    <div className="flex items-start gap-4 mb-4">
                                        <div className="w-12 h-12 rounded-xl bg-violet-100 flex items-center justify-center flex-shrink-0">
                                            <category.icon className="w-6 h-6 text-violet-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-900">{category.title}</h3>
                                            <p className="text-sm text-gray-500">{category.description}</p>
                                        </div>
                                    </div>
                                    <ul className="space-y-2">
                                        {category.articles.map((article) => (
                                            <li key={article}>
                                                <Link
                                                    href="#"
                                                    className="flex items-center gap-2 text-sm text-gray-600 hover:text-violet-600 transition-colors"
                                                >
                                                    <ChevronRight className="w-4 h-4" />
                                                    {article}
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                    <Link
                                        href="#"
                                        className="inline-flex items-center gap-1 mt-4 text-sm text-violet-600 hover:underline"
                                    >
                                        View all articles <ArrowRight className="w-4 h-4" />
                                    </Link>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* Popular Articles */}
            <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
                <div className="max-w-4xl mx-auto">
                    <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
                        Popular Articles
                    </h2>
                    <div className="space-y-3">
                        {popularArticles.map((article, index) => (
                            <Link
                                key={index}
                                href="#"
                                className="flex items-center justify-between p-4 bg-white rounded-xl border hover:border-violet-200 hover:shadow-md transition-all"
                            >
                                <span className="font-medium text-gray-900">{article.title}</span>
                                <span className="text-sm text-gray-500 px-3 py-1 bg-gray-100 rounded-full">
                                    {article.category}
                                </span>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* Contact Support */}
            <section className="py-16 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto">
                    <div className="grid md:grid-cols-2 gap-8">
                        <Card>
                            <CardContent className="pt-6 text-center">
                                <div className="w-16 h-16 mx-auto rounded-2xl bg-violet-100 flex items-center justify-center mb-4">
                                    <MessageCircle className="w-8 h-8 text-violet-600" />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">Live Chat</h3>
                                <p className="text-gray-600 mb-4">
                                    Chat with our support team in real-time. Available Mon-Fri, 9am-6pm EST.
                                </p>
                                <Button className="w-full">Start Chat</Button>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="pt-6 text-center">
                                <div className="w-16 h-16 mx-auto rounded-2xl bg-violet-100 flex items-center justify-center mb-4">
                                    <Mail className="w-8 h-8 text-violet-600" />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">Email Support</h3>
                                <p className="text-gray-600 mb-4">
                                    Send us an email and we'll get back to you within 24 hours.
                                </p>
                                <Button variant="outline" className="w-full">
                                    support@pressscape.com
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
}
