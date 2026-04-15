interface CardSkeletonProps {
  variant?: 'hero' | 'featured' | 'stack' | 'list' | 'grid';
}

function Shimmer({ className }: { className: string }) {
  return <div className={`bg-slate-200 dark:bg-slate-700 rounded animate-pulse ${className}`} />;
}

export default function CardSkeleton({ variant = 'grid' }: CardSkeletonProps) {
  if (variant === 'hero') {
    return (
      <div className="relative h-96 lg:h-[480px] rounded-xl overflow-hidden">
        <Shimmer className="w-full h-full rounded-none" />
        <div className="absolute bottom-0 left-0 right-0 p-5 space-y-2">
          <Shimmer className="h-4 w-20 rounded" />
          <Shimmer className="h-7 w-3/4 rounded" />
          <Shimmer className="h-7 w-1/2 rounded" />
          <Shimmer className="h-4 w-32 rounded" />
        </div>
      </div>
    );
  }

  if (variant === 'featured') {
    return (
      <div className="space-y-3">
        <Shimmer className="h-52 lg:h-60 rounded-xl" />
        <Shimmer className="h-3 w-16 rounded" />
        <Shimmer className="h-5 w-full rounded" />
        <Shimmer className="h-5 w-4/5 rounded" />
        <Shimmer className="h-3 w-24 rounded" />
      </div>
    );
  }

  if (variant === 'stack') {
    return (
      <div className="flex gap-3">
        <Shimmer className="w-24 h-20 flex-shrink-0 rounded" />
        <div className="flex-1 space-y-2">
          <Shimmer className="h-3 w-16 rounded" />
          <Shimmer className="h-4 w-full rounded" />
          <Shimmer className="h-4 w-4/5 rounded" />
          <Shimmer className="h-3 w-20 rounded" />
        </div>
      </div>
    );
  }

  if (variant === 'list') {
    return (
      <div className="flex gap-3 py-3 border-b border-slate-100 dark:border-slate-800">
        <Shimmer className="w-8 h-8 flex-shrink-0 rounded" />
        <div className="flex-1 space-y-2">
          <Shimmer className="h-3 w-16 rounded" />
          <Shimmer className="h-4 w-full rounded" />
          <Shimmer className="h-4 w-3/4 rounded" />
          <Shimmer className="h-3 w-24 rounded" />
        </div>
      </div>
    );
  }

  // grid (default)
  return (
    <div className="space-y-3">
      <Shimmer className="h-44 rounded-lg" />
      <Shimmer className="h-3 w-16 rounded" />
      <Shimmer className="h-5 w-full rounded" />
      <Shimmer className="h-5 w-3/4 rounded" />
      <Shimmer className="h-3 w-28 rounded" />
    </div>
  );
}

export function GridSkeleton({ count = 8, variant = 'grid' }: { count?: number; variant?: CardSkeletonProps['variant'] }) {
  const cols =
    variant === 'stack' || variant === 'list'
      ? 'grid-cols-1'
      : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4';

  return (
    <div className={`grid ${cols} gap-5`}>
      {[...Array(count)].map((_, i) => (
        <CardSkeleton key={i} variant={variant} />
      ))}
    </div>
  );
}
