import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
    'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
    {
        variants: {
            variant: {
                default:
                    'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-500/25 hover:shadow-xl hover:shadow-violet-500/30 hover:from-violet-500 hover:to-indigo-500 focus-visible:ring-violet-500',
                destructive:
                    'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-lg shadow-red-500/25 hover:shadow-xl hover:shadow-red-500/30 hover:from-red-500 hover:to-rose-500 focus-visible:ring-red-500',
                outline:
                    'border-2 border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300 text-gray-700 focus-visible:ring-gray-400',
                secondary:
                    'bg-gray-100 text-gray-900 hover:bg-gray-200 focus-visible:ring-gray-400',
                ghost:
                    'hover:bg-gray-100 text-gray-700 focus-visible:ring-gray-400',
                link:
                    'text-violet-600 underline-offset-4 hover:underline focus-visible:ring-violet-500',
                success:
                    'bg-gradient-to-r from-emerald-600 to-green-600 text-white shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/30 focus-visible:ring-emerald-500',
            },
            size: {
                default: 'h-11 px-6 py-2.5',
                sm: 'h-9 rounded-md px-4 text-xs',
                lg: 'h-12 rounded-lg px-8 text-base',
                icon: 'h-10 w-10',
            },
        },
        defaultVariants: {
            variant: 'default',
            size: 'default',
        },
    }
);

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
    asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant, size, asChild = false, ...props }, ref) => {
        const Comp = asChild ? Slot : 'button';
        return (
            <Comp
                className={cn(buttonVariants({ variant, size, className }))}
                ref={ref}
                {...props}
            />
        );
    }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
