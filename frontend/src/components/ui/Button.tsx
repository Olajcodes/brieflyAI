import React, { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', isLoading, children, ...props }, ref) => {
    
    const variants = {
      // Added explicit 'text-white' to ensure visibility
      primary: 'bg-blue-600 text-white hover:bg-blue-700 shadow-md border-transparent',
      secondary: 'bg-slate-800 text-white hover:bg-slate-900 border-transparent',
      outline: 'border-2 border-slate-200 bg-white hover:bg-slate-50 text-slate-600',
      ghost: 'bg-transparent hover:bg-slate-100 text-slate-500 border-transparent',
    };

    return (
      <button
        ref={ref}
        disabled={isLoading || props.disabled}
        className={cn(
          'inline-flex items-center justify-center rounded-xl px-6 py-3 text-sm font-bold transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98] w-full cursor-pointer',
          variants[variant],
          className
        )}
        {...props}
      >
        {isLoading && (
          <svg 
            className="animate-spin -ml-1 mr-3 h-5 w-5 text-current" 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        )}
        {/* Wrapping in span ensures the text is treated as a flex child */}
        <span className={cn("relative z-10 block", isLoading && "opacity-90")}>
          {isLoading ? "Summarizing..." : children}
        </span>
      </button>
    );
  }
);

Button.displayName = "Button";