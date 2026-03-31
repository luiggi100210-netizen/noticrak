'use client';

import { useState, useRef } from 'react';
import { PlayIcon, PauseIcon, SpeakerWaveIcon, SpeakerXMarkIcon } from '@heroicons/react/24/solid';

const RADIO_STREAMS = [
  { nombre: 'NotiCrack 98.5 FM', url: 'https://stream.example.com/noticrack', genre: 'Noticias & Talk' },
  { nombre: 'Radio Cusco 96.1', url: 'https://stream.example.com/cusco961', genre: 'Noticias Locales' },
  { nombre: 'Frecuencia Latina', url: 'https://stream.example.com/latina', genre: 'Noticias Nacionales' },
];

export default function RadioPlayer() {
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(80);
  const [selectedRadio, setSelectedRadio] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (playing) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(() => {});
    }
    setPlaying(!playing);
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    audioRef.current.muted = !muted;
    setMuted(!muted);
  };

  const handleVolume = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseInt(e.target.value);
    setVolume(v);
    if (audioRef.current) {
      audioRef.current.volume = v / 100;
      if (v === 0) setMuted(true);
      else setMuted(false);
    }
  };

  const changeStation = (idx: number) => {
    setSelectedRadio(idx);
    setPlaying(false);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = RADIO_STREAMS[idx].url;
    }
  };

  return (
    <section id="radio" className="bg-gradient-to-r from-slate-900 via-primary-900 to-slate-900 text-white rounded-2xl p-6 my-8">
      <div className="flex items-center gap-2 mb-5">
        <div className={`w-3 h-3 rounded-full ${playing ? 'bg-red-500 animate-pulse' : 'bg-slate-500'}`} />
        <h2 className="text-xl font-bold">Radio en Vivo</h2>
        {playing && <span className="text-xs bg-red-600 px-2 py-0.5 rounded-full font-semibold animate-pulse">EN VIVO</span>}
      </div>

      {/* Station selector */}
      <div className="flex gap-2 flex-wrap mb-5">
        {RADIO_STREAMS.map((radio, idx) => (
          <button
            key={idx}
            onClick={() => changeStation(idx)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              selectedRadio === idx
                ? 'bg-primary-500 text-white'
                : 'bg-white/10 hover:bg-white/20 text-slate-300'
            }`}
          >
            {radio.nombre}
          </button>
        ))}
      </div>

      {/* Player controls */}
      <div className="flex items-center gap-5">
        <button
          onClick={togglePlay}
          className="w-14 h-14 bg-primary-500 hover:bg-primary-600 rounded-full flex items-center justify-center transition-colors flex-shrink-0"
        >
          {playing ? <PauseIcon className="w-7 h-7" /> : <PlayIcon className="w-7 h-7 ml-0.5" />}
        </button>

        <div className="flex-1">
          <p className="font-bold text-lg">{RADIO_STREAMS[selectedRadio].nombre}</p>
          <p className="text-slate-400 text-sm">{RADIO_STREAMS[selectedRadio].genre}</p>
          {playing && (
            <div className="flex gap-0.5 mt-2">
              {[...Array(12)].map((_, i) => (
                <div
                  key={i}
                  className="w-1 bg-primary-400 rounded-full animate-bounce"
                  style={{
                    height: `${Math.random() * 20 + 8}px`,
                    animationDelay: `${i * 0.1}s`,
                    animationDuration: `${0.5 + Math.random() * 0.5}s`,
                  }}
                />
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button onClick={toggleMute} className="text-slate-300 hover:text-white transition-colors">
            {muted ? <SpeakerXMarkIcon className="w-5 h-5" /> : <SpeakerWaveIcon className="w-5 h-5" />}
          </button>
          <input
            type="range"
            min="0"
            max="100"
            value={volume}
            onChange={handleVolume}
            className="w-20 accent-primary-500"
          />
        </div>
      </div>

      <audio ref={audioRef} src={RADIO_STREAMS[selectedRadio].url} />
    </section>
  );
}
