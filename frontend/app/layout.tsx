import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '../components/ThemeProvider';
import Header from '../components/Header';
import BottomNav from '../components/BottomNav';
import RedesFlotantes from '../components/ui/RedesFlotantes';

export const metadata: Metadata = {
  title: {
    default: 'NotiCrack - Noticias de Cusco y el Perú',
    template: '%s | NotiCrack',
  },
  description: 'Portal de noticias de Cusco, Perú. Política, economía, deportes, entretenimiento y más.',
  keywords: ['noticias', 'Cusco', 'Perú', 'política', 'economía', 'deportes'],
  openGraph: {
    type: 'website',
    locale: 'es_PE',
    url: 'https://noticrack.pe',
    siteName: 'NotiCrack',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <Header />
          <main className="min-h-screen pb-16 sm:pb-0">
            {children}
          </main>
          <footer className="bg-slate-800 dark:bg-slate-950 text-white py-10 mt-16 border-t-4 border-primary-600">
            <div className="max-w-7xl mx-auto px-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div>
                  <h3 className="text-xl font-bold text-primary-500 mb-3">NotiCrack</h3>
                  <p className="text-slate-400 text-sm">Portal de noticias de Cusco y el Perú. Información veraz y oportuna.</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-3">Secciones</h4>
                  <ul className="space-y-1 text-sm text-slate-400">
                    {['Cusco', 'Nacional', 'Política', 'Economía', 'Deportes', 'Tecnología'].map(s => (
                      <li key={s}><a href={`/seccion/${s.toLowerCase()}`} className="hover:text-white transition-colors">{s}</a></li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-3">Contacto</h4>
                  <p className="text-slate-400 text-sm">redaccion@noticrack.pe</p>
                  <p className="text-slate-400 text-sm">Cusco, Perú</p>
                </div>
              </div>
              <div className="border-t border-slate-700 mt-8 pt-6 text-center text-slate-500 text-sm">
                © {new Date().getFullYear()} <span className="text-primary-400">NotiCrack</span>. Todos los derechos reservados.
              </div>
            </div>
          </footer>
        <BottomNav />
        <RedesFlotantes />
        </ThemeProvider>
      </body>
    </html>
  );
}
