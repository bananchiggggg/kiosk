
import React, { useState, KeyboardEvent, useMemo } from 'react';
import { isValidPlate } from '../utils/normalize';

interface SearchAreaProps {
  onSearch: (plate: string) => void;
  onClear: () => void;
  isLoading: boolean;
}

const SearchArea: React.FC<SearchAreaProps> = ({ onSearch, onClear, isLoading }) => {
  const [inputValue, setInputValue] = useState('');

  const isValid = useMemo(() => isValidPlate(inputValue), [inputValue]);
  const hasInput = inputValue.trim().length > 0;

  const handleSearch = () => {
    if (isValid && !isLoading) {
      onSearch(inputValue);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSearch();
  };

  return (
    <div className="bg-white border-b-4 border-indigo-100/50 p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-4">
        <div className="flex justify-between items-center text-[clamp(10px,1.5vw,14px)] font-black uppercase tracking-widest px-2 transition-colors duration-300">
          <span className={!isValid && hasInput ? 'text-rose-500 animate-pulse' : 'text-indigo-400'}>
            {!isValid && hasInput ? '⚠ Некорректный формат' : 'Введите номер'}
          </span>
          <span className="opacity-40 italic text-slate-400">Пример: Т333УО 196</span>
        </div>
        
        <div className="relative group">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="A000AA 000"
            disabled={isLoading}
            autoComplete="off"
            className={`w-full font-mono font-black text-center uppercase tracking-tighter transition-all duration-300 outline-none rounded-3xl border-4 md:border-[6px]
              text-[clamp(2rem,12vw,7rem)] py-3 md:py-6 px-4
              ${isLoading 
                ? 'bg-slate-50 border-indigo-100 text-indigo-200 cursor-not-allowed' 
                : !isValid && hasInput
                  ? 'bg-rose-50/30 border-rose-300 focus:border-rose-500 text-rose-950 shadow-[0_0_15px_rgba(244,63,94,0.1)]'
                  : isValid && hasInput
                    ? 'bg-emerald-50/30 border-emerald-400 focus:border-emerald-600 text-indigo-950'
                    : 'bg-indigo-50/30 border-slate-200 focus:border-indigo-600 focus:bg-white text-indigo-950 shadow-[inset_0_2px_10px_rgba(0,0,0,0.05)]'
              }`}
            autoFocus
          />
        </div>
        
        <div className="grid grid-cols-3 gap-3 md:gap-6">
          <button
            onClick={() => { setInputValue(''); onClear(); }}
            disabled={isLoading || !inputValue}
            className="col-span-1 py-4 md:py-8 bg-slate-100 text-slate-500 text-sm md:text-xl font-black rounded-2xl active:scale-95 transition-all uppercase disabled:opacity-30 border-b-4 border-slate-200"
          >
            Сброс
          </button>
          <button
            onClick={handleSearch}
            disabled={isLoading || !isValid}
            className={`col-span-2 py-4 md:py-8 text-white text-sm md:text-xl font-black rounded-2xl transition-all uppercase tracking-[0.2em] shadow-xl active:scale-[0.98] border-b-4
              ${isLoading || !isValid 
                ? 'bg-slate-300 border-slate-400 cursor-not-allowed' 
                : 'bg-indigo-600 hover:bg-indigo-700 border-indigo-800 shadow-indigo-200'
              }`}
          >
            {isLoading ? 'Проверка...' : 'Найти в реестре'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SearchArea;
