
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline:
          "text-foreground border border-input hover:bg-accent hover:text-accent-foreground",
        admin:
          "bg-blue-500/20 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300 border border-blue-500/30",
        success:
          "bg-green-500/20 text-green-700 dark:bg-green-900/50 dark:text-green-300 border border-green-500/30",
        warning:
          "bg-amber-500/20 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300 border border-amber-500/30",
        info:
          "bg-sky-500/20 text-sky-700 dark:bg-sky-900/50 dark:text-sky-300 border border-sky-500/30",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
