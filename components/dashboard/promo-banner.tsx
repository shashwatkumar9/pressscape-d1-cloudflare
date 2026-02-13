'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { X, Gift, ArrowRight, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PromoBannerProps {
    id: string;
    title: string;
    description: string;
    ctaText: string;
    ctaUrl: string;
    icon?: 'gift' | 'clock' | 'percent';
    dismissDurationDays?: number;
    countdown?: {
        enabled: boolean;
        endDate: string;
    };
    variant?: 'gradient' | 'solid';
}

const storageKey = (id: string) => `promo_banner_${id}_dismissed`;

function shouldShowBanner(id: string, durationDays: number): boolean {
    if (typeof window === 'undefined') return true;

    const dismissed = localStorage.getItem(storageKey(id));
    if (!dismissed) return true;

    try {
        const dismissedAt = new Date(dismissed);
        const now = new Date();
        const daysSince = (now.getTime() - dismissedAt.getTime()) / (1000 * 60 * 60 * 24);
        return daysSince > durationDays;
    } catch {
        return true;
    }
}

function dismissBanner(id: string) {
    if (typeof window === 'undefined') return;
    localStorage.setItem(storageKey(id), new Date().toISOString());
}

const icons = {
    gift: Gift,
    clock: Clock,
    percent: Gift,
};

export function PromoBanner({
    id,
    title,
    description,
    ctaText,
    ctaUrl,
    icon = 'gift',
    dismissDurationDays = 7,
    countdown,
    variant = 'gradient',
}: PromoBannerProps) {
    const [visible, setVisible] = useState(false);
    const [timeLeft, setTimeLeft] = useState<string | null>(null);

    useEffect(() => {
        setVisible(shouldShowBanner(id, dismissDurationDays));
    }, [id, dismissDurationDays]);

    useEffect(() => {
        if (!countdown?.enabled || !countdown.endDate) return;

        const updateCountdown = () => {
            const end = new Date(countdown.endDate).getTime();
            const now = new Date().getTime();
            const diff = end - now;

            if (diff <= 0) {
                setTimeLeft(null);
                return;
            }

            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

            if (days > 0) {
                setTimeLeft(`${days}d ${hours}h left`);
            } else {
                setTimeLeft(`${hours}h ${minutes}m left`);
            }
        };

        updateCountdown();
        const interval = setInterval(updateCountdown, 60000);
        return () => clearInterval(interval);
    }, [countdown]);

    const handleDismiss = () => {
        dismissBanner(id);
        setVisible(false);
    };

    if (!visible) return null;

    const Icon = icons[icon];

    return (
        <div
            className={cn(
                "relative rounded-xl p-4 md:p-6 mb-6",
                variant === 'gradient'
                    ? "bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600"
                    : "bg-violet-600"
            )}
        >
            <button
                onClick={handleDismiss}
                className="absolute top-3 right-3 p-1 text-white/70 hover:text-white transition-colors"
                aria-label="Dismiss"
            >
                <X className="w-5 h-5" />
            </button>

            <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <Icon className="w-6 h-6 text-white" />
                </div>

                <div className="flex-1">
                    <div className="flex items-center gap-2">
                        <h3 className="text-lg font-bold text-white">{title}</h3>
                        {timeLeft && (
                            <span className="px-2 py-0.5 bg-white/20 rounded-full text-xs text-white font-medium">
                                {timeLeft}
                            </span>
                        )}
                    </div>
                    <p className="text-white/90 text-sm mt-1">{description}</p>
                </div>

                <Link
                    href={ctaUrl}
                    className="flex items-center gap-2 px-6 py-2.5 bg-white text-violet-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors whitespace-nowrap"
                >
                    {ctaText}
                    <ArrowRight className="w-4 h-4" />
                </Link>
            </div>
        </div>
    );
}

// Default deposit bonus banner config
export function DepositBonusBanner() {
    return (
        <PromoBanner
            id="deposit_bonus_2025"
            title="Get a 100% Deposit Match"
            description="Double your first deposit! Your bonus credit is added instantly."
            ctaText="Get My Bonus"
            ctaUrl="/buyer/add-funds"
            icon="gift"
            dismissDurationDays={7}
            countdown={{
                enabled: true,
                endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            }}
            variant="gradient"
        />
    );
}
