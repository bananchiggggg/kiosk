
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { AppState } from './types';
import { fetchRecords } from './services/api';
import SearchArea from './components/SearchArea';
import ResultsArea from './components/ResultsArea';

const IDLE_TIMEOUT = 120000;

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({ status: 'IDLE', results: [] });
  const [deviceId, setDeviceId] = useState<string>('');
  const [isCompact, setIsCompact] = useState(false);
  const [isWide, setIsWide] = useState(false);
  const idleTimerRef = useRef<number | null>(null);

  useEffect(() => {
    // 1. Device ID initialization
    let id = localStorage.getItem('kiosk_id') || `TAB-${Math.random().toString(36).substring(7).toUpperCase()}`;
    localStorage.setItem('kiosk_id', id);
    setDeviceId(id);

    // 2. No-Scroll Assertion & Responsive Logic
    const handleResize = () => {
      const height = window.innerHeight;
      const width = window.innerWidth;
      
      setIsCompact(height <= 700);
      setIsWide(width >= 840);

      // Dev Assertion: Fail if scrollable
      if (document.documentElement.scrollHeight > height + 1) {
        console.error(`UI OVERFLOW DETECTED: ${document.documentElement.scrollHeight} > ${height}`);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const resetIdleTimer = useCallback(() => {
    if (idleTimerRef.current) window.clearTimeout(idleTimerRef.current);
    idleTimerRef.current = window.setTimeout(() => handleClear(), IDLE_TIMEOUT);
  }, []);

  const handleSearch = useCallback(async (plate: string) => {
    resetIdleTimer();
    setState({ status: 'LOADING', results: [] });
    try {
      const data = await fetchRecords(plate, deviceId);
      if (data.error) {
        setState({ status: 'ERROR', results: [], errorMessage: data.error });
      } else if (data.results?.length) {
        setState({ status: 'SUCCESS', results: data.results });
      } else {
        setState({ status: 'NOT_FOUND', results: [] });
      }
    } catch (e: any) {
      setState({ status: 'ERROR', results: [], errorMessage: e.message });
    }
  }, [deviceId, resetIdleTimer]);

  const handleClear = useCallback(() => {
    setState({ status: 'IDLE', results: [] });
  }, []);

  return (
    <div className={`flex flex-col h-full w-full bg-slate-100 overflow-hidden text-slate-900 transition-all ${isCompact ? 'compact-mode' : ''}`}>
      {/* HEADER */}
      <header className={`shrink-0 flex items-center justify-between px-6 bg-slate-900 text-white shadow-xl z-50 ${isCompact ? 'h-12' : 'h-16 md:h-20'}`}>
        <div className="flex items-center gap-3">
          <div className={`${isCompact ? 'w-8 h-8' : 'w-10 h-10'} bg-indigo-500 rounded-lg flex items-center justify-center`}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" /></svg>
          </div>
          <div>
            <h1 className={`${isCompact ? 'text-xs' : 'text-sm md:text-lg'} font-black uppercase tracking-tight`}>КПП РЕЕСТР</h1>
            {!isCompact && <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">{deviceId}</p>}
          </div>
        </div>
        <div className="text-right">
          <div className={`${isCompact ? 'text-xs' : 'text-lg'} font-black font-mono`}>
            {new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      </header>

      {/* MAIN VIEWPORT */}
      <main className={`flex-1 min-h-0 flex ${isWide ? 'flex-row' : 'flex-col'} overflow-hidden`}>
        {/* INPUT PANEL */}
        <section className={`shrink-0 flex flex-col justify-center bg-white p-6 md:p-8 z-10 border-slate-200 
          ${isWide ? 'w-[380px] xl:w-[440px] border-r' : 'w-full border-b'}`}>
          <SearchArea onSearch={handleSearch} onClear={handleClear} isLoading={state.status === 'LOADING'} isCompact={isCompact} />
        </section>

        {/* RESULT PANEL */}
        <section className="flex-1 min-h-0 bg-slate-50 relative overflow-hidden">
          <ResultsArea status={state.status} results={state.results} errorMessage={state.errorMessage} />
        </section>
      </main>

      {/* FOOTER */}
      {!isCompact && (
        <footer className="shrink-0 h-8 bg-white border-t border-slate-200 px-6 flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${navigator.onLine ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
            {navigator.onLine ? 'Система в сети' : 'Офлайн режим'}
          </div>
          <div>Strict No-Scroll UI</div>
        </footer>
      )}
    </div>
  );
};

export default App;
