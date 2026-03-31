'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { XMarkIcon, HomeIcon, NewspaperIcon, RadioIcon } from '@heroicons/react/24/outline';
import { CATEGORIAS } from '../lib/api';

interface MenuDrawerProps {
  open: boolean;
  onClose: () => void;
}

export default function MenuDrawer({ open, onClose }: MenuDrawerProps) {
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
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-700">
          <div className="bg-primary-600 text-white font-black text-lg px-2 py-1 rounded">
            Noti<span className="text-yellow-300">Crack</span>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        <nav className="py-4 overflow-y-auto h-full pb-20">
          <div className="px-3 mb-2">
            <Link href="/" onClick={onClose} className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold transition-colors">
              <HomeIcon className="w-5 h-5 text-primary-600" />
              Inicio
            </Link>
          </div>

          <div className="px-5 py-2">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Secciones</p>
          </div>

          {CATEGORIAS.map(cat => (
            <div key={cat.key} className="px-3">
              <Link
                href={`/seccion/${cat.key}`}
                onClick={onClose}
                className="flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <span className={`w-2.5 h-2.5 rounded-full ${cat.color}`} />
                <span className="font-medium">{cat.label}</span>
              </Link>
            </div>
          ))}

          <div className="border-t border-slate-200 dark:border-slate-700 mt-4 pt-4 px-3">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 px-4">Servicios</p>
            <Link href="/#radio" onClick={onClose} className="flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              <RadioIcon className="w-5 h-5 text-red-500" />
              <span className="font-medium">Radio en Vivo</span>
              <span className="ml-auto text-xs bg-red-500 text-white px-1.5 py-0.5 rounded-full animate-pulse">EN VIVO</span>
            </Link>
            <Link href="/#videos" onClick={onClose} className="flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              <NewspaperIcon className="w-5 h-5 text-blue-500" />
              <span className="font-medium">Videos</span>
            </Link>
          </div>
        </nav>
      </aside>
    </>
  );
}
