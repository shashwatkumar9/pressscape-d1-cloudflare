import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Footer } from '@/components/shared/footer';

export default function TermsPage() {
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

            {/* Content */}
            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">Terms of Service</h1>
                <p className="text-gray-500 mb-8">Last updated: January 1, 2024</p>

                <div className="prose prose-gray max-w-none">
                    <p className="text-lg text-gray-600 mb-8">
                        Welcome to PressScape. By accessing or using our platform, you agree to be bound by these Terms of Service. Please read them carefully.
                    </p>

                    <h2 className="text-2xl font-semibold text-gray-900 mt-12 mb-4">1. Acceptance of Terms</h2>
                    <p className="text-gray-600 mb-4">
                        By creating an account or using PressScape ("the Platform," "we," "us," or "our"), you agree to these Terms of Service ("Terms"), our Privacy Policy, and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this site.
                    </p>

                    <h2 className="text-2xl font-semibold text-gray-900 mt-12 mb-4">2. Description of Service</h2>
                    <p className="text-gray-600 mb-4">
                        PressScape is a marketplace platform that connects buyers seeking guest post placements and link insertions with publishers who own websites willing to accept such content. We facilitate transactions between these parties but do not directly provide content or publish articles ourselves.
                    </p>

                    <h2 className="text-2xl font-semibold text-gray-900 mt-12 mb-4">3. User Accounts</h2>
                    <h3 className="text-xl font-medium text-gray-900 mt-8 mb-3">3.1 Account Creation</h3>
                    <p className="text-gray-600 mb-4">
                        To use our services, you must create an account. You agree to provide accurate, current, and complete information during the registration process and to update such information to keep it accurate, current, and complete.
                    </p>
                    <h3 className="text-xl font-medium text-gray-900 mt-8 mb-3">3.2 Account Security</h3>
                    <p className="text-gray-600 mb-4">
                        You are responsible for safeguarding the password you use to access the Platform and for any activities or actions under your password. We encourage you to use a strong, unique password and enable two-factor authentication.
                    </p>
                    <h3 className="text-xl font-medium text-gray-900 mt-8 mb-3">3.3 Account Types</h3>
                    <p className="text-gray-600 mb-4">
                        Users may register as Buyers, Publishers, Affiliates, or any combination thereof. Each role has specific rights and responsibilities as outlined in these Terms.
                    </p>

                    <h2 className="text-2xl font-semibold text-gray-900 mt-12 mb-4">4. Buyer Terms</h2>
                    <h3 className="text-xl font-medium text-gray-900 mt-8 mb-3">4.1 Orders and Payment</h3>
                    <p className="text-gray-600 mb-4">
                        When you place an order, you authorize us to charge your payment method for the total order amount. Payment is collected upfront and held in escrow until the order is completed and approved by you.
                    </p>
                    <h3 className="text-xl font-medium text-gray-900 mt-8 mb-3">4.2 Content Requirements</h3>
                    <p className="text-gray-600 mb-4">
                        You agree that all content you provide or request does not violate any laws, infringe on intellectual property rights, or contain misleading, defamatory, or harmful material.
                    </p>
                    <h3 className="text-xl font-medium text-gray-900 mt-8 mb-3">4.3 Approval and Revisions</h3>
                    <p className="text-gray-600 mb-4">
                        You have the right to review content before publication and request reasonable revisions. Once you approve content or fail to respond within the specified timeframe, the order will be considered complete.
                    </p>

                    <h2 className="text-2xl font-semibold text-gray-900 mt-12 mb-4">5. Publisher Terms</h2>
                    <h3 className="text-xl font-medium text-gray-900 mt-8 mb-3">5.1 Website Listings</h3>
                    <p className="text-gray-600 mb-4">
                        Publishers must provide accurate information about their websites. Misrepresenting metrics, traffic, or other website characteristics may result in account suspension or termination.
                    </p>
                    <h3 className="text-xl font-medium text-gray-900 mt-8 mb-3">5.2 Order Fulfillment</h3>
                    <p className="text-gray-600 mb-4">
                        When you accept an order, you commit to fulfilling it within the specified timeframe and according to the agreed-upon terms. Failure to do so may result in cancellation, refund to the buyer, and potential account penalties.
                    </p>
                    <h3 className="text-xl font-medium text-gray-900 mt-8 mb-3">5.3 Content Standards</h3>
                    <p className="text-gray-600 mb-4">
                        Publishers must maintain reasonable editorial standards and ensure published content meets quality expectations. Content that violates these standards may be subject to revision requests or order cancellation.
                    </p>
                    <h3 className="text-xl font-medium text-gray-900 mt-8 mb-3">5.4 Link Warranty</h3>
                    <p className="text-gray-600 mb-4">
                        All guest posts and link insertions come with a 3-month warranty. Published content and links should remain live for a minimum of 90 days. Premature removal may result in refunds. After 3 months, link permanence is at the publisher's discretion.
                    </p>

                    <h2 className="text-2xl font-semibold text-gray-900 mt-12 mb-4">6. Payments and Fees</h2>
                    <h3 className="text-xl font-medium text-gray-900 mt-8 mb-3">6.1 Escrow System & 90-Day Payment Hold</h3>
                    <p className="text-gray-600 mb-4">
                        All payments are processed through our secure escrow system. Buyer funds are held for <strong>90 days</strong> from order completion, matching our warranty period. After 90 days, publisher earnings are released for withdrawal. This ensures link permanence and buyer protection.
                    </p>
                    <h3 className="text-xl font-medium text-gray-900 mt-8 mb-3">6.2 Publisher Payouts</h3>
                    <p className="text-gray-600 mb-4">
                        Publishers receive payouts via Stripe or other supported payment methods. Payouts are processed within 7 business days of order completion.
                    </p>
                    <h3 className="text-xl font-medium text-gray-900 mt-8 mb-3">6.3 Taxes</h3>
                    <p className="text-gray-600 mb-4">
                        Users are responsible for their own tax obligations. Publishers may be required to provide tax information for compliance purposes.
                    </p>

                    <h2 className="text-2xl font-semibold text-gray-900 mt-12 mb-4">7. Prohibited Conduct</h2>
                    <p className="text-gray-600 mb-4">You agree not to:</p>
                    <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-4">
                        <li>Use the Platform for any illegal purpose or in violation of any laws</li>
                        <li>Attempt to circumvent the Platform to conduct transactions directly</li>
                        <li>Submit false or misleading information</li>
                        <li>Engage in spam, fraud, or deceptive practices</li>
                        <li>Infringe on intellectual property rights</li>
                        <li>Harass, abuse, or harm other users</li>
                        <li>Attempt to gain unauthorized access to the Platform or other users' accounts</li>
                        <li>Use automated systems to scrape or collect data from the Platform</li>
                    </ul>

                    <h2 className="text-2xl font-semibold text-gray-900 mt-12 mb-4">8. Intellectual Property</h2>
                    <p className="text-gray-600 mb-4">
                        The Platform and its original content, features, and functionality are owned by PressScape and are protected by international copyright, trademark, and other intellectual property laws.
                    </p>

                    <h2 className="text-2xl font-semibold text-gray-900 mt-12 mb-4">9. Disclaimers</h2>
                    <p className="text-gray-600 mb-4">
                        THE PLATFORM IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND. WE DO NOT GUARANTEE THE ACCURACY OF WEBSITE METRICS, THE QUALITY OF SERVICE FROM PUBLISHERS, OR THE SUITABILITY OF BUYERS' CONTENT.
                    </p>

                    <h2 className="text-2xl font-semibold text-gray-900 mt-12 mb-4">10. Limitation of Liability</h2>
                    <p className="text-gray-600 mb-4">
                        TO THE MAXIMUM EXTENT PERMITTED BY LAW, PRESSSCAPE SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING FROM YOUR USE OF THE PLATFORM.
                    </p>

                    <h2 className="text-2xl font-semibold text-gray-900 mt-12 mb-4">11. Dispute Resolution</h2>
                    <p className="text-gray-600 mb-4">
                        Any disputes between buyers and publishers should first be resolved through our internal dispute resolution process. If a resolution cannot be reached, we may issue a final decision or refund at our discretion.
                    </p>

                    <h2 className="text-2xl font-semibold text-gray-900 mt-12 mb-4">12. Termination</h2>
                    <p className="text-gray-600 mb-4">
                        We reserve the right to terminate or suspend your account at any time, with or without notice, for any violation of these Terms or for any other reason at our sole discretion.
                    </p>

                    <h2 className="text-2xl font-semibold text-gray-900 mt-12 mb-4">13. Changes to Terms</h2>
                    <p className="text-gray-600 mb-4">
                        We may modify these Terms at any time. We will notify users of significant changes via email or through the Platform. Continued use of the Platform after changes constitutes acceptance of the modified Terms.
                    </p>

                    <h2 className="text-2xl font-semibold text-gray-900 mt-12 mb-4">14. Governing Law</h2>
                    <p className="text-gray-600 mb-4">
                        These Terms shall be governed by and construed in accordance with the laws of the State of Delaware, United States, without regard to its conflict of law provisions.
                    </p>

                    <h2 className="text-2xl font-semibold text-gray-900 mt-12 mb-4">15. Contact Us</h2>
                    <p className="text-gray-600 mb-4">
                        If you have any questions about these Terms, please contact us at:
                    </p>
                    <p className="text-gray-600 mb-4">
                        Email: legal@pressscape.com<br />
                        Address: PressScape Inc., 123 Main Street, Wilmington, DE 19801, USA
                    </p>
                </div>

                <div className="mt-12 pt-8 border-t">
                    <p className="text-gray-500 text-sm">
                        By using PressScape, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
                    </p>
                </div>
            </main>

            <Footer />
        </div>
    );
}
