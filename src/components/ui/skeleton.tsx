
import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props}
    />
  )
}

// Add additional skeleton components for common use cases
function SkeletonText({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <Skeleton className={cn("h-4 w-full", className)} {...props} />
  )
}

function SkeletonAvatar({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <Skeleton className={cn("h-12 w-12 rounded-full", className)} {...props} />
  )
}

function SkeletonCard({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("space-y-3", className)} {...props}>
      <Skeleton className="h-40 w-full rounded-lg" />
      <SkeletonText className="h-4 w-2/3" />
      <SkeletonText className="h-4 w-1/2" />
    </div>
  )
}

function SkeletonHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("space-y-2", className)} {...props}>
      <Skeleton className="h-10 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
    </div>
  )
}

export { 
  Skeleton, 
  SkeletonText,
  SkeletonAvatar,
  SkeletonCard,
  SkeletonHeader
}
