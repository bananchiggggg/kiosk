
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
      <div className="h-full flex flex-col items-center justify-center p-10 text-slate-300">
        <div className="w-24 h-24 mb-6 opacity-20 bg-slate-200 rounded-full flex items-center justify-center">
          <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <p className="text-sm font-black uppercase tracking-[0.3em] opacity-40">Ожидание ввода номера</p>
      </div>
    );
  }

  if (status === 'LOADING') {
    return (
      <div className="h-full flex flex-col items-center justify-center space-y-6">
        <div className="relative">
          <div className="w-20 h-20 border-8 border-indigo-100 rounded-full"></div>
          <div className="absolute top-0 left-0 w-20 h-20 border-8 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
        <p className="text-indigo-900 font-black uppercase text-sm tracking-widest animate-pulse">Идет поиск в базе...</p>
      </div>
    );
  }

  if (status === 'NOT_FOUND') {
    return (
      <div className="m-6 p-10 bg-white border-[8px] border-red-500 rounded-[3rem] text-center shadow-2xl animate-[shake_0.5s_ease-in-out]">
        <div className="text-red-500 text-8xl font-black mb-4">✕</div>
        <h3 className="text-4xl font-black text-red-900 uppercase mb-2">НЕ НАЙДЕНО</h3>
        <p className="text-xl text-red-700 font-bold">Транспортное средство отсутствует в реестре</p>
      </div>
    );
  }

  if (status === 'ERROR') {
    return (
      <div className="m-6 p-10 bg-amber-50 border-4 border-amber-200 rounded-[2rem] shadow-lg">
        <div className="flex items-center gap-4 mb-6">
          <div className="text-5xl">⚠️</div>
          <h3 className="text-2xl font-black text-amber-900 uppercase">Ошибка системы</h3>
        </div>
        <div className="bg-white p-6 rounded-2xl border-2 border-amber-100 text-amber-800 font-bold mb-6">
          {errorMessage || 'Неизвестная сетевая ошибка'}
        </div>
        <div className="space-y-4 text-sm text-amber-700 font-medium">
          <p className="flex items-start gap-2">
            <span className="text-amber-500 font-black">1.</span>
            Проверьте настройки Google Apps Script: должно быть <strong>Access: Anyone</strong>.
          </p>
          <p className="flex items-start gap-2">
            <span className="text-amber-500 font-black">2.</span>
            Убедитесь, что планшет подключен к интернету.
          </p>
          <p className="flex items-start gap-2">
            <span className="text-amber-500 font-black">3.</span>
            Перезапустите приложение (обновите страницу).
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto w-full space-y-8">
      {results.map((record, index) => (
        <div key={index} className="bg-white rounded-[2.5rem] shadow-2xl border-2 border-emerald-100 overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-500">
          <div className="bg-emerald-600 px-8 py-5 flex justify-between items-center text-white">
            <div className="flex items-center space-x-4">
              <div className="bg-white/20 p-2.5 rounded-xl">
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
              </div>
              <h4 className="text-2xl font-black uppercase tracking-tight">Допуск подтвержден</h4>
            </div>
            <span className="hidden sm:inline-block text-[10px] font-black bg-white/20 px-4 py-1.5 rounded-full uppercase tracking-widest">Лист: {String(record._sheet || 'Основной')}</span>
          </div>
          
          <div className="p-8 md:p-12 space-y-10">
            <div className="bg-indigo-50 p-8 rounded-[2rem] border-2 border-indigo-100 flex items-start space-x-6 relative overflow-hidden">
               <div className="absolute top-0 right-0 p-4 opacity-5">
                 <svg className="w-24 h-24 text-indigo-900" fill="currentColor" viewBox="0 0 20 20"><path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" /></svg>
               </div>
               <div className="text-5xl mt-1 shrink-0">🤖</div>
               <div className="relative z-10">
                 <p className="text-xs font-black text-indigo-400 uppercase mb-2 tracking-widest">Рекомендация ИИ</p>
                 <p className="text-2xl md:text-3xl text-indigo-950 font-black leading-tight italic">
                   «{aiInsights[index] || 'Анализируем запись...'}»
                 </p>
               </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-16 gap-y-8">
              {Object.entries(record).map(([key, value]) => (
                !key.startsWith('_') && (
                  <div key={key} className="border-b-2 border-slate-100 pb-4 flex justify-between items-end">
                    <span className="text-xs font-black text-slate-400 uppercase tracking-wider">{key}</span>
                    <span className="text-xl md:text-2xl text-indigo-900 font-black text-right">{String(value)}</span>
                  </div>
                )
              ))}
            </div>
          </div>
        </div>
      ))}
      <div className="h-20"></div>
    </div>
  );
};

export default ResultsArea;
