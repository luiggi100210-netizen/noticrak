function Shimmer({ className }: { className: string }) {
  return <div className={`bg-slate-200 dark:bg-slate-700 rounded animate-pulse ${className}`} />;
}

export default function VideosLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-6">
        <Shimmer className="h-3 w-10" />
        <Shimmer className="h-3 w-2" />
        <Shimmer className="h-3 w-16" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Video destacado */}
        <div className="lg:col-span-2 space-y-4">
          <Shimmer className="w-full aspect-video rounded-xl" />
          <Shimmer className="h-4 w-20" />
          <Shimmer className="h-7 w-full" />
          <Shimmer className="h-7 w-2/3" />
          <Shimmer className="h-4 w-full" />
          <Shimmer className="h-4 w-5/6" />
        </div>

        {/* Lista lateral */}
        <div className="space-y-4">
          <Shimmer className="h-4 w-32 mb-2" />
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex gap-3">
              <Shimmer className="w-28 h-16 flex-shrink-0 rounded-lg" />
              <div className="flex-1 space-y-2">
                <Shimmer className="h-3 w-full" />
                <Shimmer className="h-3 w-4/5" />
                <Shimmer className="h-3 w-20" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Grid de videos */}
      <div className="mt-10">
        <Shimmer className="h-6 w-40 mb-6" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="space-y-3">
              <Shimmer className="w-full aspect-video rounded-xl" />
              <Shimmer className="h-4 w-full" />
              <Shimmer className="h-4 w-3/4" />
              <Shimmer className="h-3 w-24" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
