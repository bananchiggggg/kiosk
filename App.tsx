
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { AppState, AppStatus } from './types';
import { fetchRecords } from './services/api';
import SearchArea from './components/SearchArea';
import ResultsArea from './components/ResultsArea';

const IDLE_TIMEOUT = 120000; // 2 minutes for high security auto-reset

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    status: 'IDLE',
    results: [],
  });
  
  const [deviceId, setDeviceId] = useState<string>('');
  const idleTimerRef = useRef<number | null>(null);

  useEffect(() => {
    let id = localStorage.getItem('kiosk_device_id');
    if (!id) {
      id = 'dev-' + Math.random().toString(36).substring(2, 15) + '-' + Date.now();
      localStorage.setItem('kiosk_device_id', id);
    }
    setDeviceId(id);
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
        if (data.code === 'UNAUTHORIZED') setState({ status: 'UNAUTHORIZED', results: [] });
        else if (data.code === 'RATE_LIMIT') setState({ status: 'ERROR', results: [], errorMessage: 'Превышен лимит запросов. Подождите.' });
        else throw new Error(data.error);
      } else if (data.results && data.results.length > 0) {
        setState({ status: 'SUCCESS', results: data.results });
      } else {
        setState({ status: 'NOT_FOUND', results: [] });
      }
    } catch (error: any) {
      setState({ 
        status: 'ERROR', 
        results: [], 
        errorMessage: error.message || 'Сбой соединения' 
      });
    }
  }, [deviceId, resetIdleTimer]);

  const handleClear = useCallback(() => {
    setState({ status: 'IDLE', results: [] });
  }, []);

  useEffect(() => {
    const events = ['mousedown', 'touchstart', 'keypress'];
    events.forEach(evt => document.addEventListener(evt, resetIdleTimer));
    return () => {
      events.forEach(evt => document.removeEventListener(evt, resetIdleTimer));
      if (idleTimerRef.current) window.clearTimeout(idleTimerRef.current);
    };
  }, [resetIdleTimer]);

  return (
    <div className="flex flex-col h-[100dvh] w-full bg-slate-100 overflow-hidden font-sans select-none">
      {/* HEADER */}
      <header className="shrink-0 bg-indigo-950 text-white p-4 md:p-6 flex justify-between items-center shadow-2xl z-30">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-inner">
            <svg className="w-8 h-8 text-indigo-900" fill="currentColor" viewBox="0 0 20 20">
              <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
              <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7h1.064l1.835 4.647A.5.5 0 0116.434 12H14V7z" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-black uppercase tracking-tight leading-none">Контроль Доступа</h1>
            <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest mt-1">Охрана | Реестр ПТС</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-xl font-mono font-bold">
            {new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
          </div>
          <div className="text-[10px] uppercase font-black text-indigo-500">
            {deviceId.split('-')[0].toUpperCase()} - SECURE
          </div>
        </div>
      </header>

      <section className="shrink-0 z-20 shadow-lg">
        <SearchArea 
          onSearch={handleSearch} 
          onClear={handleClear} 
          isLoading={state.status === 'LOADING'} 
        />
      </section>

      <main className="flex-1 min-h-0 overflow-y-auto bg-slate-50/50">
        <ResultsArea 
          status={state.status} 
          results={state.results} 
          errorMessage={state.errorMessage} 
        />
      </main>

      <footer className="shrink-0 bg-white border-t border-slate-200 py-3 px-6 flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
        <div className="flex items-center gap-2">
          <div className={`w-2.5 h-2.5 rounded-full ${navigator.onLine ? 'bg-emerald-500' : 'bg-red-500 animate-pulse'}`}></div>
          {navigator.onLine ? 'Система активна' : 'Сбой связи'}
        </div>
        <span className="opacity-50">Kiosk v3.1 | {deviceId.slice(-6)}</span>
      </footer>
    </div>
  );
};

export default App;
