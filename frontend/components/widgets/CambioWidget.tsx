const TASAS = [
  { par: 'USD', label: 'Dólar', simbolo: 'S/', valor: 3.71, variacion: +0.2, divisa: 'PEN' },
  { par: 'EUR', label: 'Euro', simbolo: 'S/', valor: 4.03, variacion: -0.1, divisa: 'PEN' },
  { par: 'ORO', label: 'Oro (oz)', simbolo: '$', valor: 3021, variacion: +0.8, divisa: 'USD' },
];

export default function CambioWidget() {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
          Tipo de Cambio
        </h3>
        <span className="text-xs text-slate-400">Referencial</span>
      </div>

      <div className="space-y-3">
        {TASAS.map((t) => {
          const sube = t.variacion >= 0;
          return (
            <div key={t.par} className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">
                  {t.par} → {t.divisa}
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400">{t.label}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-slate-800 dark:text-slate-100">
                  {t.simbolo} {t.valor.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
                <span
                  className={`inline-block text-xs font-semibold px-1.5 py-0.5 rounded ${
                    sube
                      ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400'
                      : 'bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400'
                  }`}
                >
                  {sube ? '+' : ''}{t.variacion}%
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
