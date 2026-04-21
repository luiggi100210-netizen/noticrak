'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useTheme } from './ThemeProvider';
import MenuDrawer from './MenuDrawer';
import {
  Bars3Icon,
  MagnifyingGlassIcon,
  SunIcon,
  MoonIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { getTickerNoticias, type Noticia } from '../lib/api';

export default function Header() {
  const { theme, toggleTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [ticker, setTicker] = useState<Noticia[]>([]);
  const [scrolled, setScrolled] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const searchRef = useRef<HTMLInputElement>(null);

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  useEffect(() => {
    getTickerNoticias().then(setTicker).catch(() => {});
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (searchOpen) searchRef.current?.focus();
  }, [searchOpen]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/buscar?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  return (
    <>
      {/* Top bar */}
      <div className="bg-slate-900 text-slate-300 text-xs py-1 px-4 flex justify-between items-center">
        <span>Cusco, Perú — {new Date().toLocaleDateString('es-PE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
        <span className="hidden sm:block font-semibold text-primary-400">EN VIVO: Radio NotiCrack 98.5 FM</span>
      </div>

      {/* Main header */}
      <header className={`sticky top-0 z-50 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 transition-shadow duration-200 ${scrolled ? 'shadow-md' : ''}`}>
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          {/* Hamburger */}
          <button
            onClick={() => setMenuOpen(true)}
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Abrir menú"
          >
            <Bars3Icon className="w-6 h-6" />
          </button>

          {/* Logo */}
          <Link href="/" className="flex items-center flex-shrink-0 text-slate-900 dark:text-white">
            <span className="font-heading font-black text-2xl leading-none">Noti</span>
            <span className="inline-flex items-center justify-center rounded-full flex-shrink-0 bg-accent w-[26px] h-[26px]">
              <svg width="9" height="11" viewBox="0 0 9 11" fill="none">
                <polygon points="2,1 8,5.5 2,10" fill="white" />
              </svg>
            </span>
            <span className="font-heading font-black text-2xl leading-none">Crack</span>
          </Link>

          {/* Nav categorías (desktop) */}
          <nav className="hidden lg:flex items-center gap-0.5 flex-1 justify-center overflow-x-auto">
            {[
              { label: 'Cusco',           href: '/seccion/cusco' },
              { label: 'Nacional',        href: '/seccion/nacional' },
              { label: 'Política',        href: '/seccion/politica' },
              { label: 'Economía',        href: '/seccion/economia' },
              { label: 'Deportes',        href: '/seccion/deportes' },
              { label: 'Tecnología',      href: '/seccion/tecnologia' },
              { label: 'Internacional',   href: '/seccion/internacional' },
              { label: 'Entretenimiento', href: '/seccion/entretenimiento' },
              { label: 'Videos',          href: '/videos' },
              { label: 'Radio',           href: '/#radio' },
            ].map(item => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative px-2.5 py-1.5 text-sm font-medium rounded-lg whitespace-nowrap transition-colors
                    ${active
                      ? 'text-primary-600 dark:text-primary-400'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                >
                  {item.label}
                  {active && (
                    <span className="absolute bottom-0 left-2.5 right-2.5 h-0.5 bg-primary-600 dark:bg-primary-400 rounded-full" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Search inline visible en desktop (md+) */}
            <form
              onSubmit={handleSearch}
              className="hidden md:flex items-center relative"
            >
              <MagnifyingGlassIcon className="w-4 h-4 absolute left-3 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Buscar noticias..."
                className="border border-slate-200 dark:border-slate-700 rounded-full pl-9 pr-4 py-1.5 text-sm bg-slate-50 dark:bg-slate-800 w-56 lg:w-64 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white dark:focus:bg-slate-900 transition-all"
              />
            </form>

            {/* Search icono en mobile */}
            {searchOpen ? (
              <form onSubmit={handleSearch} className="md:hidden flex items-center gap-1">
                <input
                  ref={searchRef}
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Buscar..."
                  className="border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-1.5 text-sm bg-white dark:bg-slate-800 w-40 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <button type="button" onClick={() => setSearchOpen(false)} className="p-1.5">
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </form>
            ) : (
              <button
                onClick={() => setSearchOpen(true)}
                className="md:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                aria-label="Buscar"
              >
                <MagnifyingGlassIcon className="w-5 h-5" />
              </button>
            )}

            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Cambiar tema"
            >
              {theme === 'dark' ? <SunIcon className="w-5 h-5" /> : <MoonIcon className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Ticker */}
        {ticker.length > 0 && (
          <div className="ticker-container">
            <span className="bg-yellow-400 text-slate-900 text-xs font-black px-2 py-0.5 rounded flex-shrink-0 uppercase tracking-wide">
              ÚLTIMA HORA
            </span>
            <div className="overflow-hidden flex-1">
              <div className="ticker-text">
                {ticker.map((n, i) => (
                  <span key={n.id}>
                    <Link href={`/noticias/${n.slug}`} className="hover:underline">
                      {n.titulo}
                    </Link>
                    {i < ticker.length - 1 && <span className="mx-6 opacity-50">•</span>}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </header>

      <MenuDrawer open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}
