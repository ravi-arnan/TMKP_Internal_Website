import * as React from "react"
import { cn } from "@/src/lib/utils"

const Badge = ({ className, variant = 'default', ...props }: React.HTMLAttributes<HTMLDivElement> & { variant?: 'default' | 'secondary' | 'outline' | 'success' | 'warning' | 'danger' | 'destructive' | 'info' }) => {
  const variants = {
    default: "bg-gray-100 text-gray-800 dark:bg-white/10 dark:text-white/80",
    secondary: "bg-amber-100 text-amber-800 dark:bg-accent-gold/10 dark:text-accent-gold",
    outline: "text-gray-600 border border-gray-200 dark:text-white/60 dark:border-white/20",
    success: "bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-400",
    warning: "bg-yellow-100 text-yellow-700 dark:bg-yellow-500/15 dark:text-yellow-400",
    danger: "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400",
    destructive: "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400",
    info: "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400"
  }

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider",
        variants[variant],
        className
      )}
      {...props}
    />
  )
}

export { Badge }
