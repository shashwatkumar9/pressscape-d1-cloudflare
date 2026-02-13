import * as React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps
    extends React.InputHTMLAttributes<HTMLInputElement> {
    error?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, type, error, ...props }, ref) => {
        return (
            <div className="w-full">
                <input
                    type={type}
                    className={cn(
                        'flex h-11 w-full rounded-lg border-2 bg-white px-4 py-2 text-sm text-gray-900 transition-all duration-200',
                        'placeholder:text-gray-400',
                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
                        error
                            ? 'border-red-300 focus-visible:border-red-500 focus-visible:ring-red-500'
                            : 'border-gray-200 hover:border-gray-300 focus-visible:border-violet-500 focus-visible:ring-violet-500',
                        'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-50',
                        className
                    )}
                    ref={ref}
                    {...props}
                />
                {error && (
                    <p className="mt-1.5 text-sm text-red-600">{error}</p>
                )}
            </div>
        );
    }
);
Input.displayName = 'Input';

export { Input };
