'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Star, Loader2, X, CheckCircle } from 'lucide-react';

interface ReviewModalProps {
    orderId: string;
    websiteDomain: string;
    onClose: () => void;
    onSuccess: () => void;
}

export default function ReviewModal({
    orderId,
    websiteDomain,
    onClose,
    onSuccess,
}: ReviewModalProps) {
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [review, setReview] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async () => {
        if (rating === 0) {
            setError('Please select a rating');
            return;
        }

        setSubmitting(true);
        setError(null);

        try {
            const res = await fetch(`/api/orders/${orderId}/review`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ rating, review }),
            });

            if (!res.ok) {
                const data = await res.json() as any;
                throw new Error(data.error || 'Failed to submit review');
            }

            setSuccess(true);
            setTimeout(() => {
                onSuccess();
                onClose();
            }, 1500);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to submit review');
        } finally {
            setSubmitting(false);
        }
    };

    const displayRating = hoverRating || rating;

    if (success) {
        return (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                <Card className="w-full max-w-md mx-4">
                    <CardContent className="py-12 text-center">
                        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                            <CheckCircle className="w-8 h-8 text-green-600" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900">
                            Review Submitted!
                        </h3>
                        <p className="text-gray-600 mt-2">
                            Thank you for your feedback.
                        </p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="w-full max-w-md mx-4">
                <CardHeader className="relative">
                    <button
                        onClick={onClose}
                        className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
                    >
                        <X className="w-5 h-5" />
                    </button>
                    <CardTitle className="text-xl">
                        Review Your Experience
                    </CardTitle>
                    <p className="text-sm text-gray-600 mt-1">
                        How was your order with <span className="font-medium">{websiteDomain}</span>?
                    </p>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Star Rating */}
                    <div className="text-center">
                        <div className="flex items-center justify-center gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => setRating(star)}
                                    onMouseEnter={() => setHoverRating(star)}
                                    onMouseLeave={() => setHoverRating(0)}
                                    className="p-1 transition-transform hover:scale-110"
                                >
                                    <Star
                                        className={`w-10 h-10 transition-colors ${star <= displayRating
                                                ? 'fill-yellow-400 text-yellow-400'
                                                : 'text-gray-300'
                                            }`}
                                    />
                                </button>
                            ))}
                        </div>
                        <p className="text-sm text-gray-600 mt-2">
                            {displayRating === 0 && 'Click to rate'}
                            {displayRating === 1 && 'Poor'}
                            {displayRating === 2 && 'Fair'}
                            {displayRating === 3 && 'Good'}
                            {displayRating === 4 && 'Very Good'}
                            {displayRating === 5 && 'Excellent'}
                        </p>
                    </div>

                    {/* Review Text */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Write a Review (Optional)
                        </label>
                        <textarea
                            value={review}
                            onChange={(e) => setReview(e.target.value)}
                            placeholder="Share your experience with this publisher..."
                            rows={4}
                            className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-violet-500 focus:outline-none resize-none"
                            maxLength={500}
                        />
                        <p className="text-xs text-gray-500 mt-1 text-right">
                            {review.length}/500
                        </p>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                            {error}
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3">
                        <Button
                            variant="outline"
                            onClick={onClose}
                            className="flex-1"
                            disabled={submitting}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSubmit}
                            disabled={rating === 0 || submitting}
                            className="flex-1"
                        >
                            {submitting ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                    Submitting...
                                </>
                            ) : (
                                'Submit Review'
                            )}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
