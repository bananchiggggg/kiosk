
import React, { useState, useEffect } from 'react';
import { VehicleRecord, AppStatus } from '../types';
import { getAiInsight } from '../services/api';

interface ResultsAreaProps {
  status: AppStatus;
  results: VehicleRecord[];
  errorMessage?: string;
}

const ResultsArea: React.FC<ResultsAreaProps> = ({ status, results, errorMessage }) => {
  const [aiInsights, setAiInsights] = useState<Record<number, string>>({});

  useEffect(() => {
    if (status === 'SUCCESS' && results.length > 0) {
      results.forEach(async (record, idx) => {
        const insight = await getAiInsight(record);
        setAiInsights(prev => ({ ...prev, [idx]: insight }));
      });
    } else {
      setAiInsights({});
    }
  }, [status, results]);

  if (status === 'IDLE') {
    return (
      <div className="h-full flex flex-col items-center justify-center p-12 text-slate-400">
        <div className="w-40 h-40 mb-10 opacity-10 bg-indigo-900 rounded-[3rem] flex items-center justify-center">
          <svg className="w-20 h-20 text-indigo-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-5.09 4.83-9.063 10-9.063 5.17 0 9.36 3.973 10 9.063" />
          </svg>
        </div>
        <p className="text-lg font-black uppercase tracking-[0.4em] opacity-30">Режим ожидания</p>
        <p className="text-sm font-bold opacity-20 mt-4 uppercase tracking-widest text-center">Система готова к сканированию госномеров</p>
      </div>
    );
  }

  if (status === 'NOT_FOUND') {
    return (
      <div className="m-6 p-12 bg-white border-[12px] border-rose-500 rounded-[4rem] text-center shadow-[0_20px_60px_rgba(244,63,94,0.3)] animate-shake">
        <div className="w-32 h-32 bg-rose-500 text-white rounded-full flex items-center justify-center mx-auto mb-8 text-6xl font-black">✕</div>
        <h3 className="text-5xl md:text-7xl font-black text-rose-950 uppercase mb-4">Отказ</h3>
        <p className="text-2xl md:text-3xl text-rose-700 font-bold uppercase tracking-tight">Транспортное средство отсутствует в реестре</p>
        <div className="mt-10 pt-8 border-t-4 border-rose-50 text-rose-400 font-black text-sm uppercase tracking-widest">
          Рекомендуется повторный ввод или проверка документов
        </div>
      </div>
    );
  }

  if (status === 'ERROR') {
    return (
      <div className="m-6 p-10 bg-amber-50 border-[6px] border-amber-200 rounded-[3rem] shadow-xl">
        <div className="flex items-center gap-6 mb-8">
          <div className="text-6xl">⚠️</div>
          <h3 className="text-3xl font-black text-amber-900 uppercase">Сбой системы</h3>
        </div>
        <div className="bg-white p-8 rounded-3xl border-2 border-amber-100 text-amber-900 font-bold text-xl mb-8 shadow-inner">
          {errorMessage || 'Ошибка подключения к базе данных'}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-amber-800 font-bold">
          <div className="bg-amber-100/50 p-4 rounded-2xl flex items-center gap-3">
            <span className="bg-amber-500 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">1</span>
            Проверьте Wi-Fi соединение
          </div>
          <div className="bg-amber-100/50 p-4 rounded-2xl flex items-center gap-3">
            <span className="bg-amber-500 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">2</span>
            Свяжитесь с IT-отделом
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto w-full space-y-10">
      {results.map((record, index) => (
        <div key={index} className="bg-white rounded-[3.5rem] shadow-2xl border-[1px] border-emerald-200 overflow-hidden animate-in fade-in zoom-in-95 duration-500">
          <div className="bg-emerald-600 px-10 py-8 flex justify-between items-center text-white shadow-lg">
            <div className="flex items-center space-x-6">
              <div className="bg-white/20 p-4 rounded-2xl backdrop-blur-md">
                <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
              </div>
              <div>
                <h4 className="text-3xl md:text-5xl font-black uppercase tracking-tight">Допуск разрешен</h4>
                <p className="text-emerald-100 text-xs font-bold uppercase tracking-widest mt-1">Запись верифицирована в реестре</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[12px] font-black bg-emerald-800/40 px-6 py-2 rounded-full uppercase tracking-widest backdrop-blur-sm border border-emerald-400/30">
                {String(record._sheet || 'Основной')}
              </span>
            </div>
          </div>
          
          <div className="p-10 md:p-14 space-y-12">
            <div className="bg-indigo-50 p-10 rounded-[2.5rem] border-[4px] border-indigo-100 flex items-start space-x-8 relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:scale-110 transition-transform duration-700">
                 <svg className="w-40 h-40 text-indigo-900" fill="currentColor" viewBox="0 0 20 20"><path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" /></svg>
               </div>
               <div className="text-6xl md:text-7xl shrink-0 mt-2">🛡️</div>
               <div className="relative z-10 flex-1">
                 <p className="text-xs font-black text-indigo-500 uppercase mb-3 tracking-[0.3em]">Инструкция службы безопасности</p>
                 <p className="text-3xl md:text-4xl text-indigo-950 font-black leading-[1.15] italic">
                   «{aiInsights[index] || 'Формирование вердикта...'}»
                 </p>
               </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-20 gap-y-10">
              {Object.entries(record).map(([key, value]) => (
                !key.startsWith('_') && (
                  <div key={key} className="border-b-[3px] border-slate-100 pb-5 flex justify-between items-end hover:border-indigo-200 transition-colors">
                    <span className="text-xs font-black text-slate-400 uppercase tracking-widest">{key}</span>
                    <span className="text-2xl md:text-3xl text-indigo-900 font-black text-right tracking-tight">{String(value)}</span>
                  </div>
                )
              ))}
            </div>
          </div>
        </div>
      ))}
      <div className="h-24"></div>
    </div>
  );
};

export default ResultsArea;
