export default function PortadaSkeleton() {
  return (
    <main className="animate-pulse">
      {/* Hero skeleton */}
      <div className="max-w-7xl mx-auto px-4 pt-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 h-96 lg:h-[480px] rounded-xl bg-slate-200 dark:bg-slate-700" />
          <div className="flex flex-col gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex gap-3">
                <div className="w-24 h-20 rounded bg-slate-200 dark:bg-slate-700 flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/3" />
                  <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded" />
                  <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-4/5" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sección skeleton */}
      <div className="page-grid mt-6">
        <div className="space-y-4">
          <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-48" />
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex gap-3 py-3 border-b border-slate-100 dark:border-slate-800">
              <div className="w-24 h-20 rounded bg-slate-200 dark:bg-slate-700 flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/4" />
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded" />
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4" />
              </div>
            </div>
          ))}
        </div>
        <div className="space-y-4">
          <div className="h-32 bg-slate-200 dark:bg-slate-700 rounded-xl" />
          <div className="h-24 bg-slate-200 dark:bg-slate-700 rounded-xl" />
          <div className="h-40 bg-slate-200 dark:bg-slate-700 rounded-xl" />
        </div>
      </div>
    </main>
  );
}
