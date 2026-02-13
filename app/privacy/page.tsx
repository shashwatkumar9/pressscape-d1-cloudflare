import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Footer } from '@/components/shared/footer';

export default function PrivacyPage() {
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
                <h1 className="text-4xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
                <p className="text-gray-500 mb-8">Last updated: January 1, 2024</p>

                <div className="prose prose-gray max-w-none">
                    <p className="text-lg text-gray-600 mb-8">
                        At PressScape, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform.
                    </p>

                    <h2 className="text-2xl font-semibold text-gray-900 mt-12 mb-4">1. Information We Collect</h2>

                    <h3 className="text-xl font-medium text-gray-900 mt-8 mb-3">1.1 Information You Provide</h3>
                    <p className="text-gray-600 mb-4">We collect information you provide directly to us, including:</p>
                    <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-4">
                        <li><strong>Account Information:</strong> Name, email address, password, and profile information</li>
                        <li><strong>Payment Information:</strong> Billing address, payment method details (processed securely through Stripe)</li>
                        <li><strong>Publisher Information:</strong> Website URLs, ownership verification, and website metrics</li>
                        <li><strong>Communications:</strong> Messages exchanged with other users or our support team</li>
                        <li><strong>Content:</strong> Articles, anchor text, and URLs you submit for guest posts</li>
                    </ul>

                    <h3 className="text-xl font-medium text-gray-900 mt-8 mb-3">1.2 Information Collected Automatically</h3>
                    <p className="text-gray-600 mb-4">When you use our Platform, we automatically collect:</p>
                    <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-4">
                        <li><strong>Device Information:</strong> IP address, browser type, operating system, and device identifiers</li>
                        <li><strong>Usage Data:</strong> Pages viewed, features used, time spent on Platform, and click patterns</li>
                        <li><strong>Cookies:</strong> Session cookies, preference cookies, and analytics cookies</li>
                        <li><strong>Referral Data:</strong> How you arrived at our Platform (e.g., affiliate links, search engines)</li>
                    </ul>

                    <h3 className="text-xl font-medium text-gray-900 mt-8 mb-3">1.3 Information from Third Parties</h3>
                    <p className="text-gray-600 mb-4">We may receive information from:</p>
                    <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-4">
                        <li><strong>Moz and Ahrefs:</strong> Website metrics (Domain Authority, Domain Rating, traffic estimates)</li>
                        <li><strong>Stripe:</strong> Payment verification and fraud prevention data</li>
                        <li><strong>Analytics Providers:</strong> Aggregated usage statistics</li>
                    </ul>

                    <h2 className="text-2xl font-semibold text-gray-900 mt-12 mb-4">2. How We Use Your Information</h2>
                    <p className="text-gray-600 mb-4">We use the information we collect to:</p>
                    <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-4">
                        <li>Provide, maintain, and improve our Platform</li>
                        <li>Process transactions and send related information</li>
                        <li>Verify publisher website ownership and metrics</li>
                        <li>Send promotional communications (with your consent)</li>
                        <li>Respond to comments, questions, and customer service requests</li>
                        <li>Monitor and analyze usage trends and preferences</li>
                        <li>Detect, investigate, and prevent fraudulent transactions and abuse</li>
                        <li>Personalize your experience on the Platform</li>
                        <li>Comply with legal obligations</li>
                    </ul>

                    <h2 className="text-2xl font-semibold text-gray-900 mt-12 mb-4">3. Information Sharing</h2>
                    <p className="text-gray-600 mb-4">We may share your information in the following circumstances:</p>

                    <h3 className="text-xl font-medium text-gray-900 mt-8 mb-3">3.1 With Other Users</h3>
                    <p className="text-gray-600 mb-4">
                        When you place an order, your profile name and communication may be shared with the publisher. Publishers' publicly listed information is visible to potential buyers.
                    </p>

                    <h3 className="text-xl font-medium text-gray-900 mt-8 mb-3">3.2 With Service Providers</h3>
                    <p className="text-gray-600 mb-4">
                        We share information with third-party vendors who perform services on our behalf, including payment processing (Stripe), email delivery, hosting, and analytics.
                    </p>

                    <h3 className="text-xl font-medium text-gray-900 mt-8 mb-3">3.3 For Legal Reasons</h3>
                    <p className="text-gray-600 mb-4">
                        We may disclose information if required by law or if we believe disclosure is necessary to protect our rights, protect your safety or the safety of others, or investigate fraud.
                    </p>

                    <h3 className="text-xl font-medium text-gray-900 mt-8 mb-3">3.4 Business Transfers</h3>
                    <p className="text-gray-600 mb-4">
                        In the event of a merger, acquisition, or sale of assets, your information may be transferred to the acquiring entity.
                    </p>

                    <h2 className="text-2xl font-semibold text-gray-900 mt-12 mb-4">4. Data Retention</h2>
                    <p className="text-gray-600 mb-4">
                        We retain your information for as long as your account is active or as needed to provide services. We may retain certain information for legitimate business purposes or as required by law, such as:
                    </p>
                    <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-4">
                        <li>Transaction records: 7 years (for tax and accounting purposes)</li>
                        <li>Communication logs: 3 years</li>
                        <li>Analytics data: 2 years (in aggregated form)</li>
                    </ul>

                    <h2 className="text-2xl font-semibold text-gray-900 mt-12 mb-4">5. Data Security</h2>
                    <p className="text-gray-600 mb-4">
                        We implement appropriate technical and organizational measures to protect your personal information, including:
                    </p>
                    <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-4">
                        <li>Encryption of data in transit (TLS/SSL) and at rest</li>
                        <li>Regular security assessments and penetration testing</li>
                        <li>Access controls and authentication requirements</li>
                        <li>Secure payment processing through PCI-compliant providers</li>
                    </ul>

                    <h2 className="text-2xl font-semibold text-gray-900 mt-12 mb-4">6. Your Rights and Choices</h2>

                    <h3 className="text-xl font-medium text-gray-900 mt-8 mb-3">6.1 Access and Update</h3>
                    <p className="text-gray-600 mb-4">
                        You can access and update your account information at any time through your account settings.
                    </p>

                    <h3 className="text-xl font-medium text-gray-900 mt-8 mb-3">6.2 Delete Your Account</h3>
                    <p className="text-gray-600 mb-4">
                        You can request deletion of your account by contacting support. Note that some information may be retained for legal or legitimate business purposes.
                    </p>

                    <h3 className="text-xl font-medium text-gray-900 mt-8 mb-3">6.3 Marketing Communications</h3>
                    <p className="text-gray-600 mb-4">
                        You can opt out of promotional emails by clicking "unsubscribe" in any marketing email or adjusting your notification preferences.
                    </p>

                    <h3 className="text-xl font-medium text-gray-900 mt-8 mb-3">6.4 Cookies</h3>
                    <p className="text-gray-600 mb-4">
                        Most browsers allow you to refuse or delete cookies. Note that disabling cookies may affect the functionality of the Platform.
                    </p>

                    <h2 className="text-2xl font-semibold text-gray-900 mt-12 mb-4">7. International Data Transfers</h2>
                    <p className="text-gray-600 mb-4">
                        Your information may be transferred to, stored, and processed in countries other than your own. We ensure appropriate safeguards are in place for such transfers in compliance with applicable data protection laws.
                    </p>

                    <h2 className="text-2xl font-semibold text-gray-900 mt-12 mb-4">8. European Users (GDPR)</h2>
                    <p className="text-gray-600 mb-4">
                        If you are located in the European Economic Area, you have additional rights under the General Data Protection Regulation (GDPR), including:
                    </p>
                    <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-4">
                        <li>Right to access your personal data</li>
                        <li>Right to rectification of inaccurate data</li>
                        <li>Right to erasure ("right to be forgotten")</li>
                        <li>Right to data portability</li>
                        <li>Right to object to processing</li>
                        <li>Right to lodge a complaint with a supervisory authority</li>
                    </ul>

                    <h2 className="text-2xl font-semibold text-gray-900 mt-12 mb-4">9. California Users (CCPA)</h2>
                    <p className="text-gray-600 mb-4">
                        California residents have additional rights under the California Consumer Privacy Act (CCPA), including the right to know what personal information we collect, the right to request deletion, and the right to opt out of the sale of personal information. We do not sell your personal information.
                    </p>

                    <h2 className="text-2xl font-semibold text-gray-900 mt-12 mb-4">10. Children's Privacy</h2>
                    <p className="text-gray-600 mb-4">
                        Our Platform is not intended for children under 18 years of age. We do not knowingly collect personal information from children. If we learn we have collected information from a child, we will delete it promptly.
                    </p>

                    <h2 className="text-2xl font-semibold text-gray-900 mt-12 mb-4">11. Changes to This Policy</h2>
                    <p className="text-gray-600 mb-4">
                        We may update this Privacy Policy from time to time. We will notify you of significant changes by email or through a notice on the Platform. Your continued use of the Platform after changes constitutes acceptance of the updated policy.
                    </p>

                    <h2 className="text-2xl font-semibold text-gray-900 mt-12 mb-4">12. Contact Us</h2>
                    <p className="text-gray-600 mb-4">
                        If you have questions about this Privacy Policy or our data practices, please contact us:
                    </p>
                    <p className="text-gray-600 mb-4">
                        Email: privacy@pressscape.com<br />
                        Address: PressScape Inc., 123 Main Street, Wilmington, DE 19801, USA
                    </p>
                </div>
            </main>

            <Footer />
        </div>
    );
}
