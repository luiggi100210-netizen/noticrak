import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Página no encontrada — NotiCrack',
};

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center">
      <p className="text-7xl font-black text-blue-600 mb-4">404</p>
      <h1 className="text-2xl font-bold mb-2">Página no encontrada</h1>
      <p className="text-slate-400 mb-8">La página que buscas no existe o fue movida.</p>
      <Link
        href="/"
        className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
      >
        Volver al inicio
      </Link>
    </div>
  );
}
