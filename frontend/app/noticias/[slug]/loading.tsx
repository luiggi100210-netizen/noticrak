function Shimmer({ className }: { className: string }) {
  return <div className={`bg-slate-200 dark:bg-slate-700 rounded animate-pulse ${className}`} />;
}

export default function NoticiaLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-4">
        <Shimmer className="h-3 w-10" />
        <Shimmer className="h-3 w-2" />
        <Shimmer className="h-3 w-20" />
      </div>

      <div className="flex gap-8">
        {/* Artículo */}
        <div className="flex-1 min-w-0 space-y-4">
          <Shimmer className="h-4 w-20" />
          <Shimmer className="h-10 w-full" />
          <Shimmer className="h-10 w-3/4" />
          <Shimmer className="h-6 w-full" />
          <Shimmer className="h-6 w-5/6" />

          {/* Meta */}
          <div className="flex gap-3 py-5 border-b border-slate-200 dark:border-slate-700">
            <Shimmer className="h-4 w-24" />
            <Shimmer className="h-4 w-32" />
            <Shimmer className="h-4 w-16" />
          </div>

          {/* Imagen */}
          <Shimmer className="w-full aspect-video rounded-xl" />

          {/* Cuerpo */}
          <div className="space-y-3 pt-2">
            {[...Array(6)].map((_, i) => (
              <Shimmer key={i} className={`h-4 ${i % 3 === 2 ? 'w-2/3' : 'w-full'}`} />
            ))}
            <div className="pt-2 space-y-3">
              {[...Array(5)].map((_, i) => (
                <Shimmer key={i} className={`h-4 ${i % 4 === 3 ? 'w-3/4' : 'w-full'}`} />
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <aside className="hidden lg:flex flex-col gap-4 w-72 xl:w-80 flex-shrink-0">
          <Shimmer className="h-4 w-32 mb-1" />
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex gap-3 py-3 border-b border-slate-100 dark:border-slate-800">
              <Shimmer className="w-16 h-14 flex-shrink-0 rounded" />
              <div className="flex-1 space-y-2">
                <Shimmer className="h-3 w-full" />
                <Shimmer className="h-3 w-4/5" />
                <Shimmer className="h-3 w-20" />
              </div>
            </div>
          ))}
        </aside>
      </div>
    </div>
  );
}
