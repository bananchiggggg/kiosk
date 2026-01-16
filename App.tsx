
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { AppState, AppStatus } from './types';
import { normalizePlate } from './utils/normalize';
import { fetchRecords } from './services/api';
import SearchArea from './components/SearchArea';
import ResultsArea from './components/ResultsArea';

const IDLE_TIMEOUT = 180000; // 3 минуты для киоска

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    status: 'IDLE',
    results: [],
  });
  
  const idleTimerRef = useRef<number | null>(null);

  const resetIdleTimer = useCallback(() => {
    if (idleTimerRef.current) window.clearTimeout(idleTimerRef.current);
    idleTimerRef.current = window.setTimeout(() => handleClear(), IDLE_TIMEOUT);
  }, []);

  const handleSearch = useCallback(async (plate: string) => {
    resetIdleTimer();
    setState({ status: 'LOADING', results: [] });

    try {
      // Отправляем как есть, бэкенд нормализует сам
      const data = await fetchRecords(plate);
      if (data.results && data.results.length > 0) {
        setState({ status: 'SUCCESS', results: data.results });
      } else {
        setState({ status: 'NOT_FOUND', results: [] });
      }
    } catch (error: any) {
      setState({ 
        status: 'ERROR', 
        results: [], 
        errorMessage: error.message || 'Ошибка связи с базой данных' 
      });
    }
  }, [resetIdleTimer]);

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
    <div className="flex flex-col h-[100dvh] w-full bg-slate-100 overflow-hidden font-sans">
      {/* HEADER */}
      <header className="shrink-0 bg-indigo-950 text-white p-4 md:p-6 flex justify-between items-center shadow-2xl z-30">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 md:w-12 md:h-12 bg-white rounded-2xl flex items-center justify-center shadow-inner">
            <svg className="w-6 h-6 md:w-8 md:h-8 text-indigo-900" fill="currentColor" viewBox="0 0 20 20">
              <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
              <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7h1.064l1.835 4.647A.5.5 0 0116.434 12H14V7z" />
            </svg>
          </div>
          <div>
            <h1 className="text-lg md:text-2xl font-black uppercase tracking-tight leading-none">Контроль Доступа</h1>
            <p className="text-[10px] md:text-xs text-indigo-400 font-bold uppercase tracking-widest mt-1">Реестр Транспорта v2.5</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-lg md:text-2xl font-mono font-bold">
            {new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
          </div>
          <div className="text-[10px] uppercase font-black text-indigo-500 tracking-tighter">
            {new Date().toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })}
          </div>
        </div>
      </header>

      {/* SEARCH AREA (FIXED HEIGHT) */}
      <section className="shrink-0 z-20 shadow-lg">
        <SearchArea 
          onSearch={handleSearch} 
          onClear={handleClear} 
          isLoading={state.status === 'LOADING'} 
        />
      </section>

      {/* RESULTS AREA (SCROLLABLE) */}
      <main className="flex-1 min-h-0 overflow-y-auto relative bg-slate-50/50">
        <ResultsArea 
          status={state.status} 
          results={state.results} 
          errorMessage={state.errorMessage} 
        />
      </main>

      {/* FOOTER */}
      <footer className="shrink-0 bg-white border-t border-slate-200 py-2 px-6 flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${navigator.onLine ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
          {navigator.onLine ? 'Система онлайн' : 'Нет связи'}
        </div>
        <span>© Служба Безопасности 2024</span>
      </footer>
    </div>
  );
};

export default App;
