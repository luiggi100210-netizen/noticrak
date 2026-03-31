interface ErrorMessageProps {
  mensaje?: string;
  onReintentar?: () => void;
  className?: string;
}

export default function ErrorMessage({
  mensaje = 'Ocurrió un error al cargar el contenido.',
  onReintentar,
  className = '',
}: ErrorMessageProps) {
  return (
    <div className={`flex flex-col items-center justify-center py-10 text-center ${className}`}>
      <div className="w-14 h-14 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-3">
        <svg className="w-7 h-7 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
        </svg>
      </div>
      <p className="text-slate-600 dark:text-slate-400 mb-4 max-w-xs text-sm">{mensaje}</p>
      {onReintentar && (
        <button
          onClick={onReintentar}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors"
        >
          Reintentar
        </button>
      )}
    </div>
  );
}
