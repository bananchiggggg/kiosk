
import React from 'react';
import { VehicleRecord, AppStatus } from '../types';

interface ResultsAreaProps {
  status: AppStatus;
  results: VehicleRecord[];
  errorMessage?: string;
}

const ResultsArea: React.FC<ResultsAreaProps> = ({ status, results, errorMessage }) => {
  if (status === 'IDLE') {
    return (
      <div className="h-full flex flex-col items-center justify-center text-slate-300 opacity-40 p-8">
        <svg className="w-20 h-20 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
        <p className="text-sm font-black uppercase tracking-[0.3em]">Ожидание ввода</p>
      </div>
    );
  }

  if (status === 'LOADING') {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (status === 'NOT_FOUND') {
    return (
      <div className="h-full flex items-center justify-center p-6 animate-in fade-in zoom-in-95">
        <div className="bg-white border-[10px] border-rose-500 rounded-[3rem] p-10 text-center shadow-2xl max-w-sm">
          <div className="w-20 h-20 bg-rose-500 text-white rounded-full flex items-center justify-center mx-auto mb-6 text-5xl font-black">✕</div>
          <h2 className="text-3xl font-black text-slate-900 uppercase leading-none mb-2">ОТКАЗАНО</h2>
          <p className="text-sm text-rose-600 font-bold uppercase">Автомобиль не найден в реестре</p>
        </div>
      </div>
    );
  }

  if (status === 'ERROR') {
    return (
      <div className="h-full flex items-center justify-center p-6">
        <div className="bg-amber-50 border-4 border-amber-200 rounded-3xl p-8 max-w-md text-center">
          <h2 className="text-xl font-black text-amber-900 uppercase mb-4">ОШИБКА СЕТИ</h2>
          <p className="font-mono text-xs text-amber-700 bg-white p-4 rounded-xl border border-amber-100">{errorMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 overflow-y-auto p-4 md:p-8 space-y-4">
      {results.map((r, i) => (
        <div key={i} className="bg-white rounded-[2.5rem] shadow-xl border-4 border-emerald-500 overflow-hidden animate-in slide-in-from-bottom-4">
          <div className="bg-emerald-500 text-white px-8 py-4 flex items-center gap-4">
            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
            <h2 className="text-2xl font-black uppercase tracking-tight">ДОПУЩЕН</h2>
          </div>
          
          <div className="p-6 md:p-8 grid gap-4">
            <div className="bg-slate-50 border-2 border-slate-100 rounded-2xl p-5 flex justify-between items-center group">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Гос. номер</span>
              <span className="text-3xl font-black text-indigo-950 license-plate-font">{r["Гос. номер"]}</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-50 border-2 border-slate-100 rounded-2xl p-5 flex flex-col gap-1">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Марка / Модель</span>
                <span className="text-lg font-black text-slate-900">{r["Марка/модель"] || '—'}</span>
              </div>
              
              <div className="bg-slate-50 border-2 border-slate-100 rounded-2xl p-5 flex flex-col gap-1">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Владелец</span>
                <span className="text-lg font-black text-slate-900">{r["Владелец"] || '—'}</span>
              </div>
            </div>
            
            <div className="mt-2 p-4 bg-indigo-50 rounded-xl flex items-center gap-3">
               <div className="text-xl">🛡️</div>
               <p className="text-[11px] font-bold text-indigo-800 uppercase leading-tight">Проверьте соответствие СТС и марки автомобиля перед пропуском.</p>
            </div>
          </div>
        </div>
      ))}
      <div className="h-8"></div>
    </div>
  );
};

export default ResultsArea;
