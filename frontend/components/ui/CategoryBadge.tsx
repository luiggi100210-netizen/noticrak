import { getCategoriaColor, getCategoriaLabel } from '../../lib/api';

interface CategoryBadgeProps {
  categoria: string;
  className?: string;
}

export default function CategoryBadge({ categoria, className = '' }: CategoryBadgeProps) {
  const color = getCategoriaColor(categoria);
  const label = getCategoriaLabel(categoria);
  return (
    <span
      className={`inline-block text-xs font-bold uppercase tracking-wide text-white px-2 py-0.5 rounded ${color} ${className}`}
    >
      {label}
    </span>
  );
}
