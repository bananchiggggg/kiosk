
import React, { useState, KeyboardEvent, useMemo, useEffect, useRef } from 'react';
import { isValidPlate } from '../utils/normalize';

interface SearchAreaProps {
  onSearch: (plate: string) => void;
  onClear: () => void;
  isLoading: boolean;
}

const SearchArea: React.FC<SearchAreaProps> = ({ onSearch, onClear, isLoading }) => {
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const validation = useMemo(() => isValidPlate(inputValue), [inputValue]);
  const hasInput = inputValue.trim().length > 0;

  const handleSearch = () => {
    if (validation.valid && !isLoading) {
      onSearch(inputValue);
    }
  };

  useEffect(() => {
    inputRef.current?.focus();
  }, [isLoading]);

  return (
    <div className="bg-white border-b-[12px] border-indigo-50 p-6 md:p-10 shadow-2xl relative z-10">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex justify-between items-end px-4">
          <label className={`text-sm font-black uppercase tracking-[0.2em] transition-colors duration-300 ${!validation.valid && hasInput ? 'text-rose-600' : 'text-indigo-400'}`}>
            {!validation.valid && hasInput ? (validation.error || '⚠ ОШИБКА') : 'Госномер автомобиля'}
          </label>
          <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">РУ | СНГ | ЕВРО</span>
        </div>
        
        <div className="relative group">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="A 000 AA 00"
            disabled={isLoading}
            autoComplete="off"
            className={`w-full font-black text-center uppercase tracking-tighter transition-all duration-300 outline-none rounded-[2.5rem] border-[8px]
              license-plate-font text-[clamp(2.5rem,15vw,9rem)] py-6 md:py-10 px-6
              ${isLoading 
                ? 'bg-slate-50 border-indigo-100 text-indigo-200' 
                : !validation.valid && hasInput
                  ? 'bg-rose-50 border-rose-400 text-rose-950 animate-shake'
                  : validation.valid && hasInput
                    ? 'bg-emerald-50 border-emerald-500 text-indigo-950 shadow-[0_15px_40px_rgba(16,185,129,0.15)]'
                    : 'bg-white border-indigo-100 focus:border-indigo-600 text-indigo-950'
              }`}
          />
        </div>
        
        <div className="grid grid-cols-4 gap-6 md:gap-10">
          <button
            onClick={() => { setInputValue(''); onClear(); }}
            disabled={isLoading || !inputValue}
            className="col-span-1 h-24 md:h-36 bg-slate-100 text-slate-500 text-xl font-black rounded-[2.5rem] active:scale-90 transition-all uppercase border-b-[8px] border-slate-300 shadow-lg disabled:opacity-20"
          >
            СБРОС
          </button>
          <button
            onClick={handleSearch}
            disabled={isLoading || !validation.valid}
            className={`col-span-3 h-24 md:h-36 text-white text-2xl md:text-3xl font-black rounded-[2.5rem] transition-all uppercase tracking-[0.3em] active:scale-[0.97] border-b-[8px]
              ${isLoading || !validation.valid 
                ? 'bg-slate-200 border-slate-300 text-slate-400' 
                : 'bg-indigo-600 hover:bg-indigo-700 border-indigo-900 shadow-[0_20px_50px_rgba(79,70,229,0.4)]'
              }`}
          >
            {isLoading ? 'ИЩЕМ...' : 'ПРОВЕРИТЬ'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SearchArea;
