import * as React from "react"
import { cn } from "@/src/lib/utils"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg' | 'icon'
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    const variants = {
      primary: "bg-green-600 text-white hover:bg-green-500 shadow-sm dark:bg-green-500 dark:text-black dark:hover:bg-green-400",
      secondary: "bg-amber-500 text-white hover:bg-amber-400 shadow-sm dark:bg-accent-gold dark:hover:bg-accent-gold/90",
      outline: "border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 hover:text-gray-900 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10 dark:text-white/70 dark:hover:text-white",
      ghost: "hover:bg-gray-100 text-gray-700 dark:hover:bg-white/10 dark:text-white/70",
      danger: "bg-red-600 text-white hover:bg-red-500 shadow-sm dark:hover:bg-red-700"
    }

    const sizes = {
      sm: "px-3 py-1.5 text-xs",
      md: "px-4 py-2 text-sm",
      lg: "px-6 py-3 text-base",
      icon: "p-2"
    }

    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-lg font-semibold transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none",
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
