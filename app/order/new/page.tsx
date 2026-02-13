'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RichTextEditor } from '@/components/editor/rich-text-editor';
import PayPalButton from '@/components/checkout/paypal-button';
import RazorpayButton from '@/components/checkout/razorpay-button';
import {
    ArrowLeft, Globe, FileText, Link2, Loader2, Check, AlertCircle, CreditCard, Wallet
} from 'lucide-react';

interface Website {
    id: string;
    domain: string;
    category: string;
    price_guest_post: number;
    price_link_insertion: number;
    link_type: string;
    max_links: number;
    turnaround_days: number;
    contributors?: Contributor[];
}

interface Contributor {
    id: string;
    user_id: string;
    user_name: string;
    display_name: string | null;
    writing_price: number;
    bio: string | null;
    specialties: string[];
    completed_orders: number;
    average_rating: number;
    rating_count: number;
    turnaround_days: number;
}

function OrderForm() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const websiteId = searchParams.get('website');
    const orderType = searchParams.get('type') || 'guest_post';
    const initialCampaignId = searchParams.get('campaign');

    const [website, setWebsite] = useState<Website | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [step, setStep] = useState(1); // 1 = payment, 2 = content

    // Campaigns
    const [campaigns, setCampaigns] = useState<{ id: string, name: string }[]>([]);
    const [selectedCampaign, setSelectedCampaign] = useState(initialCampaignId || '');

    // Guest post fields
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');

    // Link insertion fields
    const [anchorText, setAnchorText] = useState('');
    const [targetUrl, setTargetUrl] = useState('');

    // Payment
    const [paymentGateway, setPaymentGateway] = useState<'wallet' | 'stripe' | 'paypal' | 'razorpay'>('wallet');
    const [paymentIntent, setPaymentIntent] = useState<string | null>(null);
    const [paymentError, setPaymentError] = useState<string | null>(null);

    // Wallet
    const [walletBalance, setWalletBalance] = useState<number>(0);
    const [walletLoading, setWalletLoading] = useState(true);

    // Contributor selection
    const [selectedContributor, setSelectedContributor] = useState<Contributor | null>(null);

    useEffect(() => {
        // Fetch wallet balance
        fetch('/api/wallet')
            .then(res => res.json() as any)
            .then(data => {
                setWalletBalance(data.balance || 0);
                setWalletLoading(false);
            })
            .catch(() => setWalletLoading(false));

        // Fetch campaigns
        fetch('/api/buyer/campaigns')
            .then(res => res.json() as any)
            .then(data => {
                if (Array.isArray(data)) setCampaigns(data);
            })
            .catch(console.error);

        if (!websiteId) return;

        fetch(`/api/marketplace/${websiteId}`)
            .then(res => res.json() as any)
            .then(data => {
                setWebsite(data);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [websiteId]);

    // Calculate total price including contributor writing fee
    const formatPrice = (cents: number) => Math.round(cents * 1.25 / 100);

    const basePrice = website
        ? orderType === 'link_insertion'
            ? formatPrice(website.price_link_insertion || website.price_guest_post * 0.6)
            : formatPrice(website.price_guest_post)
        : 0;

    // Add contributor writing fee if selected
    const contributorFee = selectedContributor ? Math.round(selectedContributor.writing_price * 1.25 / 100) : 0;
    const price = basePrice + contributorFee;

    useEffect(() => {
        if (!website) return;

        // Only create payment intent for non-wallet payment methods
        if (paymentGateway === 'wallet') {
            setPaymentIntent(null);
            setPaymentError(null);
            return;
        }

        const createIntent = async () => {
            try {
                const res = await fetch('/api/payments/create-intent', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        website_id: websiteId,
                        order_type: orderType,
                        amount: price * 100,
                    }),
                });

                const data = await res.json() as any;

                if (res.ok) {
                    setPaymentIntent(data.clientSecret);
                    setPaymentError(null);
                } else {
                    setPaymentError(data.error || 'Failed to initialize payment');
                }
            } catch (error) {
                setPaymentError('Failed to connect to payment processor');
            }
        };

        createIntent();
    }, [website, websiteId, orderType, price, paymentGateway]);

    const handlePaymentSuccess = async (paymentIntentId: string) => {
        // Payment succeeded, move to content step
        setStep(2);
    };

    const handleWalletPayment = async () => {
        setSubmitting(true);
        setPaymentError(null);

        // For wallet payment, just verify balance and go to step 2 for content entry
        // The actual order creation happens in step 2
        if (walletBalance < price * 100) {
            setPaymentError('Insufficient wallet balance');
            setSubmitting(false);
            return;
        }

        // Move to content step
        setStep(2);
        setSubmitting(false);
    };

    const handleSubmitOrder = async () => {
        setSubmitting(true);

        try {
            // Use wallet payment API if wallet is selected
            if (paymentGateway === 'wallet') {
                const res = await fetch('/api/orders/pay-wallet', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        website_id: websiteId,
                        order_type: orderType,
                        title: orderType === 'guest_post' ? title : null,
                        content: orderType === 'guest_post' ? content : null,
                        anchor_text: anchorText || null,
                        target_url: targetUrl || null,
                    }),
                });

                const data = await res.json() as any;

                if (res.ok) {
                    router.push(`/buyer/orders?success=true&order=${data.order.order_number}`);
                } else {
                    alert(data.error || 'Failed to create order. Please try again.');
                }
            } else {
                // Stripe/PayPal/Razorpay payment
                const res = await fetch('/api/orders', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        website_id: websiteId,
                        order_type: orderType,
                        title: orderType === 'guest_post' ? title : null,
                        content: orderType === 'guest_post' ? content : null,
                        anchor_text: orderType === 'link_insertion' ? anchorText : null,
                        target_url: orderType === 'link_insertion' ? targetUrl : null,
                        amount: price * 100,
                        campaign_id: selectedCampaign || null,
                        stripe_payment_intent_id: paymentIntent,
                        contributor_id: selectedContributor?.id || null,
                    }),
                });

                if (res.ok) {
                    router.push('/buyer/orders?success=true');
                } else {
                    const data = await res.json() as any;
                    alert(data.error || 'Failed to submit order. Please try again.');
                }
            }
        } catch (error) {
            alert('An error occurred. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const hasEnoughBalance = walletBalance >= price * 100;

    // Count links in content
    const linkCount = (content.match(/<a\s/g) || []).length;
    const maxLinks = website?.max_links || 2;
    const isOverLinkLimit = linkCount > maxLinks;
    const canSubmit = orderType === 'link_insertion'
        ? anchorText && targetUrl
        : title && content && !isOverLinkLimit;

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="w-8 h-8 animate-spin text-violet-600" />
            </div>
        );
    }

    if (!website) {
        return (
            <div className="max-w-2xl mx-auto py-12 text-center">
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <h1 className="text-2xl font-bold text-gray-900">Website not found</h1>
                <Link href="/marketplace">
                    <Button className="mt-4">Back to Marketplace</Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Header */}
            <header className="border-b bg-white">
                <div className="max-w-4xl mx-auto px-4 h-16 flex items-center">
                    <Link href={`/marketplace/${websiteId}`} className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
                        <ArrowLeft className="w-5 h-5" />
                        Back to Website
                    </Link>
                </div>
            </header>

            <div className="max-w-4xl mx-auto px-4 py-8 flex-1">
                {/* Progress Steps */}
                <div className="flex items-center justify-center gap-4 mb-8">
                    <div className={`flex items-center gap-2 ${step >= 1 ? 'text-violet-600' : 'text-gray-400'}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-violet-600 text-white' : 'bg-gray-200'
                            }`}>
                            {step > 1 ? <Check className="w-5 h-5" /> : '1'}
                        </div>
                        <span className="font-medium">Details & Payment</span>
                    </div>
                    <div className="w-12 h-px bg-gray-300" />
                    <div className={`flex items-center gap-2 ${step >= 2 ? 'text-violet-600' : 'text-gray-400'}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-violet-600 text-white' : 'bg-gray-200'
                            }`}>
                            2
                        </div>
                        <span className="font-medium">
                            {orderType === 'guest_post' ? 'Write Article' : 'Submit Link'}
                        </span>
                    </div>
                </div>

                {/* Website Info Card */}
                <Card className="mb-6">
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center">
                            <Globe className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-semibold text-gray-900">{website.domain}</h3>
                            <p className="text-sm text-gray-500">
                                {orderType === 'guest_post' ? 'Guest Post' : 'Link Insertion'} •
                                {website.link_type} • {website.turnaround_days} days
                            </p>
                        </div>
                        <div className="text-right">
                            <div className="text-2xl font-bold text-gray-900">${price}</div>
                        </div>
                    </CardContent>
                </Card>

                {/* Step 1: Payment */}
                {step === 1 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Order Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Campaign Selection */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Campaign (Optional)</label>
                                <select
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-violet-500 focus:outline-none bg-white"
                                    value={selectedCampaign}
                                    onChange={(e) => setSelectedCampaign(e.target.value)}
                                >
                                    <option value="">Select a campaign...</option>
                                    {campaigns.map(c => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                                <p className="text-xs text-gray-500">
                                    Group this order under a specific campaign for better tracking.
                                </p>
                            </div>

                            {/* Contributor Selection */}
                            {orderType === 'guest_post' && website?.contributors && website.contributors.length > 0 && (
                                <div className="space-y-3">
                                    <label className="text-sm font-medium text-gray-700">Content Writer (Optional)</label>
                                    <div className="space-y-2">
                                        {/* Write my own option */}
                                        <div
                                            onClick={() => setSelectedContributor(null)}
                                            className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${selectedContributor === null
                                                ? 'border-violet-500 bg-violet-50'
                                                : 'border-gray-200 hover:border-gray-300'
                                                }`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xl">✍️</span>
                                                    <div>
                                                        <p className="font-medium text-gray-900">I&apos;ll write my own content</p>
                                                        <p className="text-xs text-gray-500">Submit your article after ordering</p>
                                                    </div>
                                                </div>
                                                <span className="font-medium text-gray-700">Free</span>
                                            </div>
                                        </div>

                                        {/* Contributor options */}
                                        {website.contributors.map((contributor) => (
                                            <div
                                                key={contributor.id}
                                                onClick={() => setSelectedContributor(contributor)}
                                                className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${selectedContributor?.id === contributor.id
                                                    ? 'border-violet-500 bg-violet-50'
                                                    : 'border-gray-200 hover:border-gray-300'
                                                    }`}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center text-white text-sm font-bold">
                                                            {contributor.display_name?.[0] || contributor.user_name?.[0] || '?'}
                                                        </div>
                                                        <div>
                                                            <p className="font-medium text-gray-900">{contributor.display_name || contributor.user_name}</p>
                                                            <p className="text-xs text-gray-500">
                                                                {contributor.turnaround_days} days • {contributor.completed_orders} articles
                                                                {contributor.rating_count > 0 && ` • ⭐ ${Number(contributor.average_rating || 0).toFixed(1)}`}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <span className="font-medium text-green-600">+${(contributor.writing_price * 1.25 / 100).toFixed(0)}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="p-4 rounded-xl bg-gray-50">
                                <div className="flex justify-between mb-2">
                                    <span className="text-gray-600">{orderType === 'guest_post' ? 'Guest Post' : 'Link Insertion'}</span>
                                    <span className="font-medium">${basePrice}</span>
                                </div>
                                {selectedContributor && (
                                    <div className="flex justify-between mb-2 text-green-600">
                                        <span>Content Writing ({selectedContributor.display_name || selectedContributor.user_name})</span>
                                        <span className="font-medium">+${contributorFee}</span>
                                    </div>
                                )}
                                <div className="flex justify-between pt-2 border-t mt-2">
                                    <span className="font-semibold text-gray-900">Total</span>
                                    <span className="font-bold text-gray-900">${price}</span>
                                </div>
                                <div className="flex justify-between text-sm text-gray-500 mt-1">
                                    <span>Platform fee included</span>
                                    <span className="text-green-600">90-day warranty</span>
                                </div>
                            </div>

                            {/* Wallet Payment */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <label className="text-sm font-medium text-gray-700">Pay with Wallet</label>
                                    <a
                                        href="/buyer/wallet"
                                        className="text-sm text-green-600 hover:text-green-700 font-medium flex items-center gap-1"
                                    >
                                        <Wallet className="w-4 h-4" />
                                        Add Funds →
                                    </a>
                                </div>

                                <div className="p-4 border-2 border-green-200 bg-green-50 rounded-xl">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <Wallet className="w-8 h-8 text-green-600" />
                                            <div>
                                                <p className="font-medium text-gray-900">Wallet Balance</p>
                                                <p className={`text-2xl font-bold ${hasEnoughBalance ? 'text-green-600' : 'text-red-500'}`}>
                                                    ${(walletBalance / 100).toFixed(2)}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm text-gray-500">Order Total</p>
                                            <p className="text-xl font-bold text-gray-900">${price}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Payment Action */}
                            <div className="mt-6 space-y-3">
                                {hasEnoughBalance ? (
                                    <Button
                                        onClick={handleWalletPayment}
                                        disabled={submitting}
                                        className="w-full bg-green-600 hover:bg-green-700"
                                        size="lg"
                                    >
                                        {submitting ? (
                                            <>
                                                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                                Processing...
                                            </>
                                        ) : (
                                            <>
                                                <Wallet className="w-5 h-5 mr-2" />
                                                Pay ${price} from Wallet
                                            </>
                                        )}
                                    </Button>
                                ) : (
                                    <div className="text-center space-y-4">
                                        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800">
                                            <p className="font-medium">Insufficient balance</p>
                                            <p className="text-sm">You need ${price} but only have ${(walletBalance / 100).toFixed(2)}</p>
                                        </div>
                                        <a
                                            href="/buyer/wallet"
                                            className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
                                        >
                                            <Wallet className="w-5 h-5" />
                                            Add Funds to Wallet
                                        </a>
                                        <p className="text-sm text-gray-500">
                                            Recharge using Stripe, PayPal, or Razorpay
                                        </p>
                                    </div>
                                )}

                                {paymentError && (
                                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                                        {paymentError}
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Step 2: Content */}
                {step === 2 && (
                    <>
                        {orderType === 'guest_post' ? (
                            <>
                                <RichTextEditor
                                    title={title}
                                    onTitleChange={setTitle}
                                    content={content}
                                    onChange={setContent}
                                    maxLinks={maxLinks}
                                    linkType={website.link_type as 'dofollow' | 'nofollow'}
                                    placeholder="Write your guest post article here. Use the toolbar to format your content, add headings, lists, quotes, and links..."
                                />

                                <div className="mt-6 flex items-center justify-between">
                                    <p className="text-sm text-gray-500">
                                        Your article will be reviewed by the publisher within {website.turnaround_days} days.
                                    </p>
                                    <Button
                                        onClick={handleSubmitOrder}
                                        disabled={!canSubmit || submitting}
                                        size="lg"
                                        className="gap-2"
                                    >
                                        {submitting ? (
                                            <>
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                Submitting...
                                            </>
                                        ) : (
                                            <>
                                                <FileText className="w-4 h-4" />
                                                Submit Article
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </>
                        ) : (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Link2 className="w-5 h-5" />
                                        Link Insertion Details
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Anchor Text *
                                        </label>
                                        <input
                                            type="text"
                                            value={anchorText}
                                            onChange={(e) => setAnchorText(e.target.value)}
                                            placeholder="e.g., best SEO tools"
                                            className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-violet-500 focus:outline-none"
                                        />
                                        <p className="text-sm text-gray-500 mt-1">
                                            The clickable text that will link to your URL
                                        </p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Target URL *
                                        </label>
                                        <input
                                            type="url"
                                            value={targetUrl}
                                            onChange={(e) => setTargetUrl(e.target.value)}
                                            placeholder="https://yourwebsite.com/page"
                                            className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-violet-500 focus:outline-none"
                                        />
                                        <p className="text-sm text-gray-500 mt-1">
                                            The URL where the link will point to
                                        </p>
                                    </div>

                                    <div className="p-4 rounded-xl bg-blue-50 text-blue-800 text-sm">
                                        <p>
                                            The publisher will find a relevant existing article on {website.domain} and
                                            naturally insert your link. You'll be notified once it's live.
                                        </p>
                                    </div>

                                    <Button
                                        onClick={handleSubmitOrder}
                                        disabled={!canSubmit || submitting}
                                        size="lg"
                                        className="w-full gap-2"
                                    >
                                        {submitting ? (
                                            <>
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                Submitting...
                                            </>
                                        ) : (
                                            <>
                                                <Link2 className="w-4 h-4" />
                                                Submit Link Request
                                            </>
                                        )}
                                    </Button>
                                </CardContent>
                            </Card>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

export default function NewOrderPage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="w-8 h-8 animate-spin text-violet-600" />
            </div>
        }>
            <OrderForm />
        </Suspense>
    );
}
