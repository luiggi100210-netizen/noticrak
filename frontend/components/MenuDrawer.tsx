'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { XMarkIcon, FilmIcon, RadioIcon } from '@heroicons/react/24/outline';
import { HomeIcon } from '@heroicons/react/24/solid';
import { CATEGORIAS } from '../lib/api';

interface MenuDrawerProps {
  open: boolean;
  onClose: () => void;
}

export default function MenuDrawer({ open, onClose }: MenuDrawerProps) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black/50 z-50 transition-opacity duration-300 ${open ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      {/* Drawer */}
      <aside
        className={`fixed top-0 left-0 h-full w-72 bg-white dark:bg-slate-900 z-50 shadow-2xl transform transition-transform duration-300 ${open ? 'translate-x-0' : '-translate-x-full'}`}
      >
        {/* Header del drawer — mismo logo que el Header principal */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-700">
          <Link href="/" onClick={onClose} className="flex items-center text-slate-900 dark:text-white">
            <span className="font-heading font-black text-xl leading-none">Noti</span>
            <span className="inline-flex items-center justify-center rounded-full flex-shrink-0 bg-accent w-[22px] h-[22px] mx-0.5">
              <svg width="8" height="10" viewBox="0 0 9 11" fill="none">
                <polygon points="2,1 8,5.5 2,10" fill="white" />
              </svg>
            </span>
            <span className="font-heading font-black text-xl leading-none">Crack</span>
          </Link>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Cerrar menú"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        <nav className="py-4 overflow-y-auto h-full pb-20">
          {/* Inicio */}
          <div className="px-3 mb-1">
            <Link
              href="/"
              onClick={onClose}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl font-semibold transition-colors
                ${isActive('/')
                  ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                  : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
            >
              <HomeIcon className={`w-4 h-4 ${isActive('/') ? 'text-primary-600 dark:text-primary-400' : 'text-slate-400'}`} />
              Inicio
            </Link>
          </div>

          {/* Secciones */}
          <div className="px-5 py-2 mt-2">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Secciones</p>
          </div>

          {CATEGORIAS.map(cat => {
            const href = `/seccion/${cat.key}`;
            const active = isActive(href);
            return (
              <div key={cat.key} className="px-3">
                <Link
                  href={href}
                  onClick={onClose}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-colors
                    ${active
                      ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 font-semibold'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                >
                  <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${cat.color}`} />
                  <span className="font-medium">{cat.label}</span>
                  {active && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary-600 dark:bg-primary-400" />}
                </Link>
              </div>
            );
          })}

          {/* Servicios */}
          <div className="border-t border-slate-200 dark:border-slate-700 mt-4 pt-4 px-3">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 px-4">Servicios</p>
            <Link
              href="/#radio"
              onClick={onClose}
              className="flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <RadioIcon className="w-5 h-5 text-red-500" />
              <span className="font-medium">Radio en Vivo</span>
              <span className="ml-auto text-xs bg-red-500 text-white px-1.5 py-0.5 rounded-full animate-pulse">EN VIVO</span>
            </Link>
            <Link
              href="/videos"
              onClick={onClose}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-colors
                ${isActive('/videos')
                  ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 font-semibold'
                  : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
            >
              <FilmIcon className={`w-5 h-5 ${isActive('/videos') ? 'text-primary-600 dark:text-primary-400' : 'text-blue-500'}`} />
              <span className="font-medium">Videos</span>
            </Link>
          </div>
        </nav>
      </aside>
    </>
  );
}
