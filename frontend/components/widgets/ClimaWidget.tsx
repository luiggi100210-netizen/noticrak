export default function ClimaWidget() {
  return (
    <div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl p-4 text-white">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-bold uppercase tracking-widest opacity-80">Clima</h3>
        <span className="text-xs opacity-70">Cusco, Perú</span>
      </div>

      <div className="flex items-center gap-3 mb-3">
        <span className="text-5xl">⛅</span>
        <div>
          <p className="text-5xl font-bold leading-none">14°</p>
          <p className="text-sm opacity-80 mt-0.5">Parcialmente nublado</p>
        </div>
      </div>

      <p className="text-xs opacity-70 mb-3">Altitud: 3,399 m.s.n.m.</p>

      <div className="flex justify-between text-xs border-t border-white/20 pt-3">
        <div className="text-center">
          <p className="opacity-70">Mín</p>
          <p className="font-bold text-blue-200 text-base">8°</p>
        </div>
        <div className="text-center">
          <p className="opacity-70">Máx</p>
          <p className="font-bold text-orange-300 text-base">18°</p>
        </div>
        <div className="text-center">
          <p className="opacity-70">Humedad</p>
          <p className="font-bold text-base">62%</p>
        </div>
        <div className="text-center">
          <p className="opacity-70">UV</p>
          <p className="font-bold text-yellow-300 text-base">Alto</p>
        </div>
      </div>
    </div>
  );
}
