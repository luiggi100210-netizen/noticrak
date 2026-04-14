interface DividerProps {
  texto: string;
  className?: string;
}

export default function Divider({ texto, className = '' }: DividerProps) {
  return (
    <div className={`flex items-center gap-3 mb-5 ${className}`}>
      <div className="w-1 h-5 bg-primary-600 rounded-sm flex-shrink-0" />
      <h2 className="text-sm font-black uppercase tracking-widest text-slate-900 dark:text-slate-100 whitespace-nowrap">
        {texto}
      </h2>
      <div className="h-px bg-slate-200 dark:bg-slate-700 flex-1" />
    </div>
  );
}
