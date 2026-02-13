import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Footer } from '@/components/shared/footer';
import { CheckCircle, XCircle, AlertCircle, Clock } from 'lucide-react';

export default function RefundsPage() {
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
            <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-violet-50 to-indigo-50">
                <div className="max-w-4xl mx-auto text-center">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">Refund Policy</h1>
                    <p className="text-xl text-gray-600">
                        We want you to be completely satisfied with every order. Here's everything you need to know about refunds.
                    </p>
                    <p className="text-gray-500 mt-4">Last updated: January 1, 2024</p>
                </div>
            </section>

            {/* Quick Overview */}
            <section className="py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Refund Eligibility at a Glance</h2>
                    <div className="grid md:grid-cols-3 gap-6">
                        <Card className="border-green-200 bg-green-50">
                            <CardContent className="pt-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <CheckCircle className="w-8 h-8 text-green-600" />
                                    <h3 className="font-semibold text-gray-900">Full Refund</h3>
                                </div>
                                <ul className="space-y-2 text-sm text-gray-600">
                                    <li>• Order cancelled before publisher accepts</li>
                                    <li>• Publisher fails to deliver (no response)</li>
                                    <li>• Content removed within 3 months</li>
                                    <li>• Content doesn't match specifications</li>
                                </ul>
                            </CardContent>
                        </Card>

                        <Card className="border-yellow-200 bg-yellow-50">
                            <CardContent className="pt-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <AlertCircle className="w-8 h-8 text-yellow-600" />
                                    <h3 className="font-semibold text-gray-900">Partial Refund</h3>
                                </div>
                                <ul className="space-y-2 text-sm text-gray-600">
                                    <li>• Quality issues verified by our team</li>
                                    <li>• Minor specification deviations</li>
                                    <li>• Mutual agreement between parties</li>
                                    <li>• Link removed after 30 days (pro-rated)</li>
                                </ul>
                            </CardContent>
                        </Card>

                        <Card className="border-red-200 bg-red-50">
                            <CardContent className="pt-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <XCircle className="w-8 h-8 text-red-600" />
                                    <h3 className="font-semibold text-gray-900">No Refund</h3>
                                </div>
                                <ul className="space-y-2 text-sm text-gray-600">
                                    <li>• Buyer approved and order completed</li>
                                    <li>• Link removed after 3+ months</li>
                                    <li>• Content rejected without valid reason</li>
                                    <li>• Delays in delivery (delays are allowed)</li>
                                </ul>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </section>

            {/* Detailed Policy */}
            <section className="py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
                <div className="max-w-4xl mx-auto">
                    <div className="prose prose-gray max-w-none">
                        <h2 className="text-2xl font-semibold text-gray-900 mb-6">Detailed Refund Policy</h2>

                        <h3 className="text-xl font-medium text-gray-900 mt-8 mb-3">1. Escrow Protection</h3>
                        <p className="text-gray-600 mb-4">
                            All payments on PressScape are processed through our secure escrow system. Your payment is held safely until you approve the completed work. This protects both buyers and publishers throughout the transaction.
                        </p>

                        <h3 className="text-xl font-medium text-gray-900 mt-8 mb-3">2. Order Cancellation by Buyer</h3>
                        <p className="text-gray-600 mb-4">
                            <strong>Before Publisher Accepts:</strong> You may cancel your order at any time before the publisher accepts it. A full refund will be issued to your original payment method within 5-7 business days.
                        </p>
                        <p className="text-gray-600 mb-4">
                            <strong>After Publisher Accepts:</strong> Once a publisher accepts your order, cancellation is subject to their approval. If the publisher agrees to cancel, you'll receive a full refund. If work has already begun, a partial refund may be issued based on work completed.
                        </p>

                        <h3 className="text-xl font-medium text-gray-900 mt-8 mb-3">3. Delivery Delays</h3>
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                            <p className="text-blue-800">
                                <strong>Important:</strong> Delivery delays are allowed and are not grounds for a refund. Publishers may take additional time to ensure quality content. If a publisher is completely unresponsive for 14+ days with no communication, please contact our support team.
                            </p>
                        </div>

                        <h3 className="text-xl font-medium text-gray-900 mt-8 mb-3">4. Quality Issues</h3>
                        <p className="text-gray-600 mb-4">
                            You have the right to request revisions before approving content. If the delivered content does not match the agreed specifications after reasonable revision attempts, you may request a refund. Our support team will review disputes and make a final determination.
                        </p>
                        <p className="text-gray-600 mb-4">Valid quality issues include:</p>
                        <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-4">
                            <li>Content not matching approved topic or brief</li>
                            <li>Excessive grammatical errors or poor quality writing</li>
                            <li>Wrong anchor text or target URL used</li>
                            <li>Link marked as nofollow when dofollow was promised</li>
                            <li>Article published on wrong website</li>
                        </ul>

                        <h3 className="text-xl font-medium text-gray-900 mt-8 mb-3">5. 3-Month Link Warranty</h3>
                        <div className="bg-violet-50 border border-violet-200 rounded-lg p-4 mb-4">
                            <p className="text-violet-800">
                                <strong>All guest posts and link insertions come with a 3-month warranty.</strong> This means your published link is guaranteed to remain live for 90 days from the publication date.
                            </p>
                        </div>
                        <p className="text-gray-600 mb-4">
                            <strong>Within 3 Months:</strong> If your published link is removed within 90 days of publication through no fault of your own (e.g., publisher removes article), you are entitled to a full refund.
                        </p>
                        <p className="text-gray-600 mb-4">
                            <strong>After 3 Months:</strong> Our warranty period ends after 90 days. Link removals after this period are not eligible for refunds. We encourage you to monitor your links and report any issues promptly.
                        </p>

                        <h3 className="text-xl font-medium text-gray-900 mt-8 mb-3">6. Non-Refundable Situations</h3>
                        <p className="text-gray-600 mb-4">Refunds will not be issued in the following cases:</p>
                        <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-4">
                            <li>You approved the order and marked it as complete</li>
                            <li>You provided incorrect or misleading specifications</li>
                            <li>The content was rejected without legitimate reasons</li>
                            <li>Delivery took longer than expected (delays are permitted)</li>
                            <li>Google algorithm changes affect your rankings (outside publisher control)</li>
                            <li>The website loses traffic or DA/DR after your post is published</li>
                            <li>Link removed after the 3-month warranty period</li>
                            <li>You failed to respond to revision requests within 7 days</li>
                        </ul>

                        <h3 className="text-xl font-medium text-gray-900 mt-8 mb-3">7. How to Request a Refund</h3>
                        <p className="text-gray-600 mb-4">To request a refund:</p>
                        <ol className="list-decimal pl-6 text-gray-600 space-y-2 mb-4">
                            <li>Go to your order page in your dashboard</li>
                            <li>Click "Request Refund" and select a reason</li>
                            <li>Provide any supporting documentation or screenshots</li>
                            <li>Our support team will review your request within 48 hours</li>
                            <li>You'll be notified of the decision via email</li>
                        </ol>

                        <h3 className="text-xl font-medium text-gray-900 mt-8 mb-3">8. Refund Processing Time</h3>
                        <p className="text-gray-600 mb-4">
                            Once a refund is approved, it will be processed within 5-7 business days. Depending on your payment method and bank, it may take an additional 3-10 business days to appear in your account.
                        </p>

                        <h3 className="text-xl font-medium text-gray-900 mt-8 mb-3">9. Disputes</h3>
                        <p className="text-gray-600 mb-4">
                            If you disagree with a refund decision, you may appeal by contacting our support team with additional information. Our team will review the case and make a final determination. All dispute decisions by PressScape are final.
                        </p>

                        <h3 className="text-xl font-medium text-gray-900 mt-8 mb-3">10. Publisher Protection</h3>
                        <p className="text-gray-600 mb-4">
                            Publishers are protected against fraudulent refund requests. If a buyer repeatedly requests refunds without valid reasons, their account may be suspended. Publishers who fulfill orders according to specifications will not be penalized for buyer-initiated cancellations.
                        </p>
                    </div>
                </div>
            </section>

            {/* Contact */}
            <section className="py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-2xl mx-auto text-center">
                    <Clock className="w-12 h-12 mx-auto text-violet-600 mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Need Help with a Refund?</h2>
                    <p className="text-gray-600 mb-6">
                        Our support team is here to help resolve any issues. We typically respond within 24 hours.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link href="/help">
                            <Button variant="outline">Visit Help Center</Button>
                        </Link>
                        <Button>Contact Support</Button>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
}
