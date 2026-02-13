import { Star } from 'lucide-react';

interface Review {
    id: string;
    buyer_name: string;
    buyer_rating: number;
    buyer_review: string | null;
    reviewed_at: string;
}

interface WebsiteReviewsProps {
    reviews: Review[];
    averageRating: number;
    totalReviews: number;
}

export default function WebsiteReviews({
    reviews,
    averageRating,
    totalReviews,
}: WebsiteReviewsProps) {
    if (totalReviews === 0) {
        return (
            <div className="text-center py-8 text-gray-500">
                <Star className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <p>No reviews yet</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Summary */}
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                <div className="text-center">
                    <div className="text-3xl font-bold text-gray-900">
                        {averageRating.toFixed(1)}
                    </div>
                    <div className="flex items-center gap-0.5 mt-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                                key={star}
                                className={`w-4 h-4 ${star <= Math.round(averageRating)
                                        ? 'fill-yellow-400 text-yellow-400'
                                        : 'text-gray-300'
                                    }`}
                            />
                        ))}
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                        {totalReviews} {totalReviews === 1 ? 'review' : 'reviews'}
                    </div>
                </div>

                {/* Rating breakdown could go here */}
            </div>

            {/* Reviews List */}
            <div className="space-y-4">
                {reviews.map((review) => (
                    <div key={review.id} className="border-b pb-4 last:border-0">
                        <div className="flex items-start justify-between">
                            <div>
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center">
                                        <span className="text-sm font-medium text-violet-600">
                                            {review.buyer_name?.charAt(0).toUpperCase() || 'A'}
                                        </span>
                                    </div>
                                    <span className="font-medium text-gray-900">
                                        {review.buyer_name || 'Anonymous'}
                                    </span>
                                </div>
                                <div className="flex items-center gap-1 mt-1">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <Star
                                            key={star}
                                            className={`w-4 h-4 ${star <= review.buyer_rating
                                                    ? 'fill-yellow-400 text-yellow-400'
                                                    : 'text-gray-300'
                                                }`}
                                        />
                                    ))}
                                </div>
                            </div>
                            <span className="text-sm text-gray-500">
                                {new Date(review.reviewed_at).toLocaleDateString()}
                            </span>
                        </div>
                        {review.buyer_review && (
                            <p className="text-gray-700 mt-3 pl-10">
                                {review.buyer_review}
                            </p>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
