interface DividerProps {
  texto: string;
  className?: string;
}

export default function Divider({ texto, className = '' }: DividerProps) {
  return (
    <div className={`flex items-center gap-3 mb-5 ${className}`}>
      <div className="w-8 h-1 bg-blue-600 rounded-full flex-shrink-0" />
      <h2 className="text-xs font-bold uppercase tracking-widest text-slate-700 dark:text-slate-300 whitespace-nowrap">
        {texto}
      </h2>
      <div className="h-px bg-slate-200 dark:bg-slate-700 flex-1" />
    </div>
  );
}
