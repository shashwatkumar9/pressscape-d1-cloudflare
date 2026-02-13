import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function generateOrderNumber(): string {
    return `PS-${Date.now().toString().slice(-6)}`;
}

export function generateAffiliateCode(name: string): string {
    const base = name.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 4);
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `${base}${random}`;
}

export function formatCurrency(cents: number, currency: string = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency,
    }).format(cents / 100);
}

export function formatNumber(num: number): string {
    if (num >= 1000000) {
        return `${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 1000) {
        return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
}

export function slugify(text: string): string {
    return text
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

export function generateVerificationCode(websiteId: string): string {
    return `pressscape-verify-${websiteId.slice(0, 8)}`;
}

// Pricing calculations
// Note: Commission is hidden from buyers - they see the final price which includes the markup
const PLATFORM_COMMISSION_RATE = 0.25; // 25% - internal only
const AFFILIATE_COMMISSION_RATE = 0.075; // 7.5%

// Convert publisher price to buyer price (add 25% markup)
// Publisher sets $100 -> Buyer sees $125
export function calculateBuyerPrice(publisherPrice: number): number {
    return Math.round(publisherPrice * (1 + PLATFORM_COMMISSION_RATE));
}

// Calculate what publisher receives from buyer price
// Buyer pays $125 -> Publisher gets $100
export function calculatePublisherEarnings(buyerPrice: number): number {
    return Math.round(buyerPrice / (1 + PLATFORM_COMMISSION_RATE));
}

// Calculate platform fee from buyer price (internal use)
export function calculatePlatformFee(buyerPrice: number): number {
    return buyerPrice - calculatePublisherEarnings(buyerPrice);
}

// Calculate affiliate commission from order total
export function calculateAffiliateFee(orderTotal: number): number {
    return Math.round(orderTotal * AFFILIATE_COMMISSION_RATE);
}

