'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  HomeIcon,
  MagnifyingGlassIcon,
  Squares2X2Icon,
  FilmIcon,
  RadioIcon,
} from '@heroicons/react/24/outline';
import {
  HomeIcon as HomeIconSolid,
  MagnifyingGlassIcon as SearchIconSolid,
  Squares2X2Icon as GridIconSolid,
  FilmIcon as FilmIconSolid,
} from '@heroicons/react/24/solid';

const NAV_ITEMS = [
  {
    label: 'Inicio',
    href: '/',
    icon: HomeIcon,
    iconActive: HomeIconSolid,
    exact: true,
  },
  {
    label: 'Buscar',
    href: '/buscar',
    icon: MagnifyingGlassIcon,
    iconActive: SearchIconSolid,
    exact: false,
  },
  {
    label: 'Secciones',
    href: '/seccion/cusco',
    icon: Squares2X2Icon,
    iconActive: GridIconSolid,
    exact: false,
    matchPrefix: '/seccion',
  },
  {
    label: 'Videos',
    href: '/videos',
    icon: FilmIcon,
    iconActive: FilmIconSolid,
    exact: false,
  },
  {
    label: 'Radio',
    href: '/#radio',
    icon: RadioIcon,
    iconActive: RadioIcon,
    exact: false,
    live: true,
  },
] as const;

export default function BottomNav() {
  const pathname = usePathname();

  const isActive = (item: (typeof NAV_ITEMS)[number]) => {
    const prefix = 'matchPrefix' in item ? item.matchPrefix : item.href;
    if (item.exact) return pathname === item.href;
    return pathname.startsWith(prefix as string);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 sm:hidden safe-area-bottom">
      <div className="flex items-stretch h-16">
        {NAV_ITEMS.map((item) => {
          const active = isActive(item);
          const Icon = active ? item.iconActive : item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex-1 flex flex-col items-center justify-center gap-0.5 text-[10px] font-semibold transition-colors relative
                ${active
                  ? 'text-primary-600 dark:text-primary-400'
                  : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
                }`}
            >
              {active && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-primary-600 dark:bg-primary-400 rounded-full" />
              )}
              <div className="relative">
                <Icon className="w-5 h-5" />
                {'live' in item && item.live && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                )}
              </div>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
