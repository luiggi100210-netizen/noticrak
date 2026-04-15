function Shimmer({ className }: { className: string }) {
  return <div className={`bg-slate-200 dark:bg-slate-700 rounded animate-pulse ${className}`} />;
}

export default function BuscarLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-3">
        <Shimmer className="h-3 w-10" />
        <Shimmer className="h-3 w-2" />
        <Shimmer className="h-3 w-16" />
      </div>

      {/* Título */}
      <Shimmer className="h-8 w-72 mb-1" />
      <Shimmer className="h-4 w-40 mb-8" />

      {/* Input de búsqueda */}
      <div className="flex gap-3 max-w-2xl mb-10">
        <Shimmer className="flex-1 h-12 rounded-lg" />
        <Shimmer className="w-24 h-12 rounded-lg" />
      </div>

      {/* Grid de resultados */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="space-y-3">
            <Shimmer className="h-44 rounded-lg" />
            <Shimmer className="h-3 w-16" />
            <Shimmer className="h-5 w-full" />
            <Shimmer className="h-5 w-4/5" />
            <Shimmer className="h-3 w-28" />
          </div>
        ))}
      </div>
    </div>
  );
}
