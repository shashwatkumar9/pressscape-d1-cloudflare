import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Footer } from '@/components/shared/footer';
import {
    Search,
    MousePointer,
    FileText,
    CheckCircle,
    ArrowRight,
    Globe,
    Shield,
    Clock,
    DollarSign,
    Star,
    Users,
} from 'lucide-react';

export default function HowItWorksPage() {
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

            {/* Hero */}
            <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-violet-50 to-indigo-50">
                <div className="max-w-4xl mx-auto text-center">
                    <h1 className="text-5xl font-bold text-gray-900 mb-6">
                        How PressScape Works
                    </h1>
                    <p className="text-xl text-gray-600">
                        Get quality backlinks from verified publishers in just a few simple steps.
                        Our platform makes it easy to scale your SEO efforts.
                    </p>
                </div>
            </section>

            {/* For Buyers */}
            <section className="py-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                        <span className="text-sm font-medium text-violet-600 bg-violet-100 px-4 py-2 rounded-full">
                            For Buyers
                        </span>
                        <h2 className="text-4xl font-bold text-gray-900 mt-6 mb-4">
                            Get Quality Backlinks in 4 Steps
                        </h2>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                            From finding the perfect website to getting your link published
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {[
                            {
                                step: '1',
                                icon: Search,
                                title: 'Browse & Filter',
                                description: 'Search our marketplace of 5,000+ verified websites. Filter by DA, DR, niche, price, and more to find your perfect match.',
                            },
                            {
                                step: '2',
                                icon: MousePointer,
                                title: 'Place Your Order',
                                description: 'Select guest post or link insertion. Provide your content or let the publisher write for you. Set your anchor text and target URL.',
                            },
                            {
                                step: '3',
                                icon: FileText,
                                title: 'Review & Approve',
                                description: 'Review the content before publication. Request revisions if needed. You have full control over what gets published.',
                            },
                            {
                                step: '4',
                                icon: CheckCircle,
                                title: 'Get Published',
                                description: 'Once approved, your article goes live. Receive the published URL and start building authority.',
                            },
                        ].map((item) => (
                            <div key={item.step} className="relative">
                                <div className="absolute -top-4 -left-4 w-10 h-10 rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-white font-bold">
                                    {item.step}
                                </div>
                                <div className="pt-8 pl-4">
                                    <div className="w-14 h-14 rounded-2xl bg-violet-100 flex items-center justify-center mb-4">
                                        <item.icon className="w-7 h-7 text-violet-600" />
                                    </div>
                                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{item.title}</h3>
                                    <p className="text-gray-600">{item.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="text-center mt-12">
                        <Link href="/marketplace">
                            <Button size="lg" className="gap-2">
                                Browse Marketplace <ArrowRight className="w-5 h-5" />
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* For Publishers */}
            <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                        <span className="text-sm font-medium text-emerald-600 bg-emerald-100 px-4 py-2 rounded-full">
                            For Publishers
                        </span>
                        <h2 className="text-4xl font-bold text-gray-900 mt-6 mb-4">
                            Monetize Your Website in 4 Steps
                        </h2>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                            Turn your website traffic into a steady income stream
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {[
                            {
                                step: '1',
                                icon: Globe,
                                title: 'List Your Website',
                                description: 'Add your website details, set your prices, and define your content requirements. It only takes 5 minutes.',
                            },
                            {
                                step: '2',
                                icon: Shield,
                                title: 'Get Verified',
                                description: 'Verify ownership via DNS, meta tag, or file upload. We pull your real metrics from trusted sources.',
                            },
                            {
                                step: '3',
                                icon: FileText,
                                title: 'Receive Orders',
                                description: 'Get notified when buyers place orders. Accept, reject, or negotiate terms. You\'re always in control.',
                            },
                            {
                                step: '4',
                                icon: DollarSign,
                                title: 'Get Paid',
                                description: 'Complete the order and receive payment via Stripe. Funds are released automatically upon buyer approval.',
                            },
                        ].map((item) => (
                            <div key={item.step} className="relative">
                                <div className="absolute -top-4 -left-4 w-10 h-10 rounded-full bg-gradient-to-br from-emerald-600 to-green-600 flex items-center justify-center text-white font-bold">
                                    {item.step}
                                </div>
                                <div className="pt-8 pl-4">
                                    <div className="w-14 h-14 rounded-2xl bg-emerald-100 flex items-center justify-center mb-4">
                                        <item.icon className="w-7 h-7 text-emerald-600" />
                                    </div>
                                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{item.title}</h3>
                                    <p className="text-gray-600">{item.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="text-center mt-12">
                        <Link href="/signup?role=publisher">
                            <Button size="lg" variant="success" className="gap-2">
                                List Your Website <ArrowRight className="w-5 h-5" />
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Why Choose PressScape */}
            <section className="py-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">
                            Why Choose PressScape?
                        </h2>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                            We've built the most transparent and secure marketplace for guest posts
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                icon: Shield,
                                title: 'Verified Metrics',
                                description: 'All website metrics are verified via Moz and Ahrefs APIs. No fake DA or inflated traffic numbers.',
                            },
                            {
                                icon: DollarSign,
                                title: 'Secure Escrow',
                                description: 'Funds are held securely until you approve the work. 100% money-back guarantee if not satisfied.',
                            },
                            {
                                icon: Clock,
                                title: 'Fast Turnaround',
                                description: 'Most orders completed within 7 days. Need it faster? Premium publishers offer urgent delivery.',
                            },
                            {
                                icon: Star,
                                title: 'Quality Guarantee',
                                description: 'All content is reviewed for quality. Publishers maintain high ratings or get delisted.',
                            },
                            {
                                icon: Users,
                                title: 'Dedicated Support',
                                description: 'Our team is here to help with any questions or disputes. Real humans, real solutions.',
                            },
                            {
                                icon: Globe,
                                title: 'Global Network',
                                description: 'Publishers from 50+ countries across every niche. Find the perfect fit for your brand.',
                            },
                        ].map((item) => (
                            <div key={item.title} className="p-6 rounded-2xl border border-gray-200 hover:border-violet-200 hover:shadow-lg transition-all">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-100 to-indigo-100 flex items-center justify-center mb-4">
                                    <item.icon className="w-6 h-6 text-violet-600" />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">{item.title}</h3>
                                <p className="text-gray-600">{item.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* FAQ */}
            <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
                <div className="max-w-3xl mx-auto">
                    <h2 className="text-4xl font-bold text-gray-900 mb-12 text-center">
                        Frequently Asked Questions
                    </h2>

                    <div className="space-y-6">
                        {[
                            {
                                question: 'How do I know the metrics are real?',
                                answer: 'We pull metrics directly from Moz and Ahrefs APIs and update them weekly. Publishers cannot edit their own metrics. What you see is what you get.',
                            },
                            {
                                question: 'What if I\'m not satisfied with the content?',
                                answer: 'You can request unlimited revisions before approving publication. If you\'re still not satisfied, you can cancel the order and receive a full refund.',
                            },
                            {
                                question: 'How long does it take to get published?',
                                answer: 'Standard turnaround is 7-14 days depending on the publisher. Many publishers offer urgent delivery (3-5 days) for an additional fee.',
                            },
                            {
                                question: 'Can I provide my own content?',
                                answer: 'Yes! You can provide your own article, have the publisher write it, or use our content writing service. It\'s your choice.',
                            },
                            {
                                question: 'How do payments work?',
                                answer: 'Payment is collected upfront and held in escrow. The publisher only receives payment after you approve the published article. This protects both parties.',
                            },
                            {
                                question: 'What types of links do publishers offer?',
                                answer: 'Most publishers offer dofollow links. Some may use sponsored tags (rel="sponsored") per Google guidelines. Link type is clearly shown on each listing.',
                            },
                        ].map((faq, index) => (
                            <div key={index} className="p-6 bg-white rounded-2xl border">
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">{faq.question}</h3>
                                <p className="text-gray-600">{faq.answer}</p>
                            </div>
                        ))}
                    </div>

                    <div className="text-center mt-12">
                        <p className="text-gray-600 mb-4">Still have questions?</p>
                        <Link href="/help">
                            <Button variant="outline">Visit Help Center</Button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto text-center">
                    <div className="p-12 rounded-3xl bg-gradient-to-br from-violet-600 to-indigo-600 text-white">
                        <h2 className="text-4xl font-bold mb-4">Ready to Get Started?</h2>
                        <p className="text-xl text-violet-100 mb-8">
                            Join thousands of SEO professionals and publishers on PressScape
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link href="/marketplace">
                                <Button size="lg" variant="secondary" className="bg-white text-violet-600 hover:bg-gray-100">
                                    Browse Marketplace
                                </Button>
                            </Link>
                            <Link href="/signup?role=publisher">
                                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                                    List Your Website
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
}
