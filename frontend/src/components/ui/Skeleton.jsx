import { cn } from '../../lib/utils'

export default function Skeleton({ className, ...props }) {
  return (
    <div
      className={cn('animate-pulse rounded-lg bg-border/70', className)}
      {...props}
    />
  )
}

export function SkeletonLessonCard() {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-white p-4">
      <Skeleton className="h-11 w-11 shrink-0 rounded-full" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
  )
}
