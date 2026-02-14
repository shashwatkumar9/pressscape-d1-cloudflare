export const runtime = 'edge';


import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Footer } from '@/components/shared/footer';
import {

    DollarSign,
    Users,
    TrendingUp,
    Link2,
    Gift,
    ArrowRight,
    CheckCircle,
    Clock,
    BarChart3,
} from 'lucide-react';


export default function AffiliatePage() {
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
            <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-emerald-50 to-green-50">
                <div className="max-w-4xl mx-auto text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100 text-emerald-700 text-sm font-medium mb-6">
                        <Gift className="w-4 h-4" />
                        <span>Affiliate Program</span>
                    </div>
                    <h1 className="text-5xl font-bold text-gray-900 mb-6">
                        Earn 7.5% on Every Order
                    </h1>
                    <p className="text-xl text-gray-600 mb-8">
                        Refer users to PressScape and earn recurring commissions for 180 days.
                        No cap on earnings. Get paid monthly.
                    </p>
                    <Link href="/signup?role=affiliate">
                        <Button size="lg" variant="success" className="gap-2">
                            Join Affiliate Program <ArrowRight className="w-5 h-5" />
                        </Button>
                    </Link>
                </div>
            </section>

            {/* Commission Stats */}
            <section className="py-16 px-4 sm:px-6 lg:px-8 bg-emerald-600 text-white">
                <div className="max-w-6xl mx-auto">
                    <div className="grid md:grid-cols-4 gap-8 text-center">
                        {[
                            { value: '7.5%', label: 'Commission Rate' },
                            { value: '180', label: 'Days Cookie Duration' },
                            { value: '$0', label: 'Minimum Payout' },
                            { value: 'Monthly', label: 'Payment Frequency' },
                        ].map((stat) => (
                            <div key={stat.label}>
                                <div className="text-4xl font-bold mb-2">{stat.value}</div>
                                <div className="text-emerald-100">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section className="py-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">
                            How It Works
                        </h2>
                        <p className="text-xl text-gray-600">
                            Start earning in 3 simple steps
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                step: '1',
                                icon: Link2,
                                title: 'Get Your Link',
                                description: 'Sign up and receive your unique referral link instantly. Share it on your blog, social media, or email newsletter.',
                            },
                            {
                                step: '2',
                                icon: Users,
                                title: 'Refer Users',
                                description: 'When someone clicks your link and signs up, they\'re tracked as your referral for 180 days.',
                            },
                            {
                                step: '3',
                                icon: DollarSign,
                                title: 'Earn Commissions',
                                description: 'Earn 7.5% on every order your referrals make. Commissions are paid monthly via PayPal or bank transfer.',
                            },
                        ].map((item) => (
                            <div key={item.step} className="relative text-center">
                                <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-emerald-600 to-green-600 flex items-center justify-center text-white text-2xl font-bold mb-6">
                                    {item.step}
                                </div>
                                <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-100 flex items-center justify-center mb-4">
                                    <item.icon className="w-7 h-7 text-emerald-600" />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">{item.title}</h3>
                                <p className="text-gray-600">{item.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Earning Examples */}
            <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">
                            Potential Earnings
                        </h2>
                        <p className="text-xl text-gray-600">
                            See how much you could earn based on referral activity
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                        {[
                            { referrals: 10, avgOrder: 150, orders: 2, monthly: 225 },
                            { referrals: 50, avgOrder: 150, orders: 2, monthly: 1125 },
                            { referrals: 200, avgOrder: 150, orders: 2, monthly: 4500 },
                        ].map((tier, index) => (
                            <Card key={index} className={index === 1 ? 'border-emerald-500 ring-2 ring-emerald-100' : ''}>
                                <CardContent className="pt-6 text-center">
                                    <div className="text-gray-600 mb-2">With {tier.referrals} active referrals</div>
                                    <div className="text-4xl font-bold text-emerald-600 mb-4">
                                        ${tier.monthly.toLocaleString()}/mo
                                    </div>
                                    <div className="text-sm text-gray-500 space-y-1">
                                        <p>Average order: ${tier.avgOrder}</p>
                                        <p>Orders per referral: {tier.orders}/mo</p>
                                        <p>Commission: 7.5%</p>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    <p className="text-center text-gray-500 mt-8">
                        *Based on average order values and order frequency. Actual earnings may vary.
                    </p>
                </div>
            </section>

            {/* What You Get */}
            <section className="py-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">
                            What You Get
                        </h2>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        {[
                            { icon: CheckCircle, title: 'Unique Tracking Link', description: 'Personalized referral link with 180-day cookie tracking' },
                            { icon: BarChart3, title: 'Real-Time Dashboard', description: 'Track clicks, signups, conversions, and earnings in real-time' },

                            { icon: DollarSign, title: 'Monthly Payouts', description: 'Get paid monthly via PayPal or bank transfer. No minimum threshold.' },
                            { icon: Clock, title: '180-Day Cookie', description: 'Earn commissions on orders placed within 180 days of referral' },
                            { icon: TrendingUp, title: 'Recurring Revenue', description: 'Earn on every order your referrals make, not just the first one' },
                        ].map((item) => (
                            <div key={item.title} className="flex items-start gap-4 p-6 rounded-xl border hover:border-emerald-200 transition-colors">
                                <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
                                    <item.icon className="w-6 h-6 text-emerald-600" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900 mb-1">{item.title}</h3>
                                    <p className="text-gray-600">{item.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* FAQ */}
            <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
                <div className="max-w-3xl mx-auto">
                    <h2 className="text-4xl font-bold text-gray-900 mb-12 text-center">
                        Affiliate FAQ
                    </h2>

                    <div className="space-y-6">
                        {[
                            {
                                question: 'Who can join the affiliate program?',
                                answer: 'Anyone can join! Whether you\'re a blogger, YouTuber, SEO agency, or just someone with a network, you can earn commissions by referring users to PressScape.',
                            },
                            {
                                question: 'How do I get paid?',
                                answer: 'Commissions are paid monthly via PayPal or bank transfer. There\'s no minimum threshold - you get paid whatever you\'ve earned.',
                            },
                            {
                                question: 'Do I need to be a PressScape user to be an affiliate?',
                                answer: 'No, you don\'t need to buy or sell on PressScape to be an affiliate. However, many of our best affiliates are also active users who can speak from experience.',
                            },
                            {
                                question: 'Can I refer myself?',
                                answer: 'Self-referrals are not allowed. If detected, commissions will be forfeited and your affiliate account may be suspended.',
                            },
                            {
                                question: 'Is there a limit to how much I can earn?',
                                answer: 'No! There\'s no cap on earnings. The more users you refer and the more they order, the more you earn.',
                            },
                        ].map((faq, index) => (
                            <div key={index} className="p-6 bg-white rounded-2xl border">
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">{faq.question}</h3>
                                <p className="text-gray-600">{faq.answer}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto text-center">
                    <div className="p-12 rounded-3xl bg-gradient-to-br from-emerald-600 to-green-600 text-white">
                        <h2 className="text-4xl font-bold mb-4">Start Earning Today</h2>
                        <p className="text-xl text-emerald-100 mb-8">
                            Join our affiliate program and start earning 7.5% on every order
                        </p>
                        <Link href="/signup?role=affiliate">
                            <Button size="lg" variant="secondary" className="bg-white text-emerald-600 hover:bg-gray-100">
                                Join Affiliate Program <ArrowRight className="w-5 h-5 ml-2" />
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
}
