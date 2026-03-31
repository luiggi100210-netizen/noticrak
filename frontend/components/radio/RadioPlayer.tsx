'use client';

import { useState, useRef, useEffect } from 'react';
import { getRadioAhora, getRadioProgramas, type RadioPrograma } from '../../lib/api';

const STREAM_URL = process.env.NEXT_PUBLIC_RADIO_STREAM || 'https://stream.example.com/noticrack';

export default function RadioPlayer() {
  const [tab, setTab] = useState<'radio' | 'video'>('radio');
  const [playing, setPlaying] = useState(false);
  const [heights, setHeights] = useState<number[]>(Array(20).fill(5));
  const [programaActual, setProgramaActual] = useState<RadioPrograma | null>(null);
  const [proximosProgramas, setProximosProgramas] = useState<RadioPrograma[]>([]);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Animación de ondas con Math.sin()
  useEffect(() => {
    if (!playing) {
      setHeights(Array(20).fill(5));
      return;
    }
    const timer = setInterval(() => {
      const t = Date.now() / 300;
      setHeights(
        Array.from({ length: 20 }, (_, i) =>
          Math.abs(Math.sin(t + i * 0.45)) * 38 + 4
        )
      );
    }, 50);
    return () => clearInterval(timer);
  }, [playing]);

  // Cargar programación
  useEffect(() => {
    getRadioAhora()
      .then((res) => { if (res.enAire && res.programa) setProgramaActual(res.programa); })
      .catch(() => {});

    getRadioProgramas()
      .then((programas) => {
        const ahora = new Date().toTimeString().slice(0, 5);
        const proximos = programas
          .filter((p) => p.hora_inicio > ahora)
          .slice(0, 3);
        setProximosProgramas(proximos);
      })
      .catch(() => {});
  }, []);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (playing) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(() => {});
    }
    setPlaying(!playing);
  };

  return (
    <section
      className="rounded-2xl overflow-hidden text-white"
      style={{ background: 'linear-gradient(135deg, #1a3a6f 0%, #0c6b7a 60%, #0fa3b1 100%)' }}
    >
      {/* Header */}
      <div className="px-5 pt-5 pb-4 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-red-600 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
            <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
            EN VIVO
          </div>
          <h2 className="text-lg font-bold tracking-tight">NotiCrack Radio</h2>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-white/10 rounded-full p-0.5">
          {(['radio', 'video'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold capitalize transition-colors ${
                tab === t ? 'bg-white text-slate-800' : 'text-white/80 hover:text-white'
              }`}
            >
              {t === 'radio' ? '📻 Radio' : '📺 Video'}
            </button>
          ))}
        </div>
      </div>

      {/* Waveform animado: 20 barras */}
      <div className="flex items-end gap-0.5 h-12 px-5 mb-4">
        {heights.map((h, i) => (
          <div
            key={i}
            className="flex-1 rounded-full transition-all duration-75"
            style={{
              height: `${h}px`,
              background: `rgba(255,255,255,${0.3 + (i % 3) * 0.15})`,
            }}
          />
        ))}
      </div>

      {/* Contenido del tab */}
      {tab === 'radio' ? (
        <div className="px-5 pb-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Izquierda: Señal principal + controles */}
          <div>
            <p className="text-xs font-bold uppercase tracking-widest opacity-60 mb-2">
              Señal Principal
            </p>
            <p className="text-xl font-bold mb-0.5">NotiCrack Radio</p>
            <p className="text-sm opacity-70 mb-4">Noticias · 24 horas · Cusco</p>

            {/* Controles */}
            <div className="flex items-center gap-4">
              <button
                onClick={togglePlay}
                className="w-14 h-14 bg-blue-500 hover:bg-blue-400 active:scale-95 rounded-full flex items-center justify-center transition-all shadow-lg flex-shrink-0"
                aria-label={playing ? 'Pausar' : 'Reproducir'}
              >
                {playing ? (
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                )}
              </button>

              <div className="flex-1">
                {/* Barra de progreso simulada */}
                <div className="w-full h-1.5 bg-white/20 rounded-full mb-2 overflow-hidden">
                  <div
                    className={`h-full bg-white rounded-full transition-all ${
                      playing ? 'w-full duration-[60000ms]' : 'w-0'
                    }`}
                  />
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className={`font-bold ${playing ? 'text-white' : 'opacity-60'}`}>
                    {playing ? '● EN VIVO' : 'DETENIDO'}
                  </span>
                  {/* Mini waveform 7 barras azules */}
                  {playing && (
                    <div className="flex items-end gap-0.5 h-5">
                      {heights.slice(0, 7).map((h, i) => (
                        <div
                          key={i}
                          className="w-1 bg-blue-300 rounded-full transition-all duration-75"
                          style={{ height: `${Math.max(3, h * 0.4)}px` }}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Derecha: Programa actual + próximos */}
          <div>
            <p className="text-xs font-bold uppercase tracking-widest opacity-60 mb-2">
              Programa Actual
            </p>

            {programaActual ? (
              <div className="mb-4">
                <p className="text-lg font-bold">{programaActual.nombre}</p>
                {programaActual.conductor && (
                  <p className="text-sm opacity-70">Con {programaActual.conductor}</p>
                )}
                <p className="text-xs opacity-50 mt-1">
                  {programaActual.hora_inicio} — {programaActual.hora_fin}
                </p>
              </div>
            ) : (
              <div className="mb-4">
                <p className="text-base font-semibold opacity-70">Programación continua</p>
                <p className="text-sm opacity-50">NotiCrack 98.5 FM · Cusco</p>
              </div>
            )}

            {proximosProgramas.length > 0 && (
              <div>
                <p className="text-xs font-bold uppercase tracking-widest opacity-50 mb-2">
                  Próximos programas
                </p>
                <div className="space-y-1.5">
                  {proximosProgramas.map((p) => (
                    <div key={p.id} className="flex items-center gap-3 text-sm">
                      <span className="font-mono text-xs opacity-60 w-10 flex-shrink-0">
                        {p.hora_inicio}
                      </span>
                      <span className="font-medium opacity-90">{p.nombre}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="px-5 pb-8 flex flex-col items-center justify-center text-center gap-3">
          <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center">
            <span className="text-3xl">📺</span>
          </div>
          <div>
            <p className="font-bold text-lg">Señal de video</p>
            <p className="text-sm opacity-70 max-w-xs">
              La transmisión de video en vivo estará disponible próximamente. Configura la URL del stream en el panel de administración.
            </p>
          </div>
        </div>
      )}

      <audio ref={audioRef} src={STREAM_URL} preload="none" />
    </section>
  );
}
