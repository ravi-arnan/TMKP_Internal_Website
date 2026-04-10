import { type CSSProperties } from 'react';
import { cn } from '@/src/lib/utils';

interface SkeletonProps {
  className?: string;
  style?: CSSProperties;
}

export function Skeleton({ className, style }: SkeletonProps) {
  return (
    <div className={cn('animate-pulse bg-white/10 rounded', className)} style={style} />
  );
}

export function TableSkeleton({ rows = 5, columns = 6 }: { rows?: number; columns?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4">
          {Array.from({ length: columns }).map((_, j) => (
            <div key={j} className="flex-1">
              <Skeleton className="h-12 w-full" />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

export function StatCardSkeleton() {
  return (
    <div className="bg-white/5 p-6 rounded-2xl border border-white/10 shadow-2xl backdrop-blur-md space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="w-12 h-12 rounded-xl" />
        <Skeleton className="w-16 h-6 rounded-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="w-24 h-3" />
        <Skeleton className="w-32 h-8" />
      </div>
      <Skeleton className="w-full h-2 rounded-full" />
      <Skeleton className="w-40 h-3" />
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div className="bg-white/5 p-8 rounded-2xl border border-white/10 shadow-2xl backdrop-blur-md">
      <div className="flex justify-between items-start mb-8">
        <div className="space-y-2">
          <Skeleton className="w-48 h-6" />
          <Skeleton className="w-32 h-4" />
        </div>
        <Skeleton className="w-24 h-4" />
      </div>
      <div className="h-64 flex items-end gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex-1 flex flex-col justify-end">
            <Skeleton className="w-full rounded-t" style={{ height: `${Math.random() * 100 + 50}%` }} />
          </div>
        ))}
      </div>
    </div>
  );
}

export function MemberCardSkeleton() {
  return (
    <div className="flex items-center gap-3 p-4">
      <Skeleton className="w-10 h-10 rounded-full" />
      <div className="flex-1 space-y-2">
        <Skeleton className="w-48 h-4" />
        <Skeleton className="w-32 h-3" />
      </div>
      <Skeleton className="w-20 h-6 rounded-full" />
    </div>
  );
}
