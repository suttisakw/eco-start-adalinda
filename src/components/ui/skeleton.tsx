import { cn } from '@/lib/utils'

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-gray-200",
        className
      )}
      {...props}
    />
  )
}

// Card Skeleton
function CardSkeleton() {
  return (
    <div className="rounded-lg border bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between space-y-0 pb-2">
        <Skeleton className="h-4 w-[100px]" />
        <Skeleton className="h-4 w-4" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-8 w-[60px]" />
        <Skeleton className="h-3 w-[120px]" />
      </div>
    </div>
  )
}

// Table Skeleton
function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="rounded-lg border bg-white">
      <div className="border-b p-4">
        <Skeleton className="h-6 w-[150px]" />
      </div>
      <div className="divide-y">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center space-x-4 p-4">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-[200px]" />
              <Skeleton className="h-3 w-[150px]" />
            </div>
            <Skeleton className="h-8 w-[80px]" />
            <Skeleton className="h-8 w-8" />
          </div>
        ))}
      </div>
    </div>
  )
}

// Stats Grid Skeleton
function StatsGridSkeleton({ cols = 4 }: { cols?: number }) {
  return (
    <div className={`grid gap-4 md:grid-cols-2 lg:grid-cols-${cols}`}>
      {Array.from({ length: cols }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  )
}

// Chart Skeleton
function ChartSkeleton() {
  return (
    <div className="rounded-lg border bg-white p-6">
      <div className="space-y-2 mb-4">
        <Skeleton className="h-6 w-[120px]" />
        <Skeleton className="h-4 w-[200px]" />
      </div>
      <div className="h-[300px] flex items-end space-x-2">
        {Array.from({ length: 12 }).map((_, i) => (
          <Skeleton 
            key={i} 
            className="flex-1" 
            style={{ height: `${Math.random() * 200 + 50}px` }}
          />
        ))}
      </div>
    </div>
  )
}

// Product Grid Skeleton
function ProductGridSkeleton({ items = 6 }: { items?: number }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="rounded-lg border bg-white p-4 space-y-3">
          <Skeleton className="h-48 w-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <div className="flex items-center justify-between">
              <Skeleton className="h-6 w-[80px]" />
              <Skeleton className="h-5 w-[60px]" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

// Page Skeleton
function PageSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-[200px]" />
        <Skeleton className="h-4 w-[300px]" />
      </div>
      
      {/* Stats */}
      <StatsGridSkeleton />
      
      {/* Content */}
      <div className="grid gap-6 lg:grid-cols-2">
        <ChartSkeleton />
        <TableSkeleton rows={3} />
      </div>
    </div>
  )
}

export { 
  Skeleton, 
  CardSkeleton, 
  TableSkeleton, 
  StatsGridSkeleton, 
  ChartSkeleton, 
  ProductGridSkeleton,
  PageSkeleton 
}
