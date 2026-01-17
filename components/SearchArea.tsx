
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { isValidPlate } from '../utils/normalize';
import { fitPlateText } from '../utils/typography';

interface SearchAreaProps {
  onSearch: (plate: string) => void;
  onClear: () => void;
  isLoading: boolean;
  isCompact: boolean;
}

const SearchArea: React.FC<SearchAreaProps> = ({ onSearch, onClear, isLoading, isCompact }) => {
  const [val, setVal] = useState('');
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [dynamicFontSize, setDynamicFontSize] = useState(64);
  
  const inputContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const validation = useMemo(() => isValidPlate(val), [val]);
  const hasVal = val.trim().length > 0;

  // Monitor container size for typography calculations
  useEffect(() => {
    if (!inputContainerRef.current) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        setContainerSize({ width, height });
      }
    });

    observer.observe(inputContainerRef.current);
    return () => observer.disconnect();
  }, []);

  // Re-calculate font size on value change, size change, or mode change
  useEffect(() => {
    const size = fitPlateText({
      containerWidth: containerSize.width,
      containerHeight: containerSize.height,
      textLength: val.length,
      isCompact
    });
    setDynamicFontSize(size);
  }, [val, containerSize, isCompact]);

  const triggerSearch = () => {
    if (validation.valid && !isLoading) onSearch(val);
  };

  useEffect(() => {
    const focusTimer = setInterval(() => {
      if (document.activeElement?.tagName !== 'INPUT') inputRef.current?.focus();
    }, 5000);
    return () => clearInterval(focusTimer);
  }, []);

  return (
    <div className={`w-full flex flex-col ${isCompact ? 'gap-3' : 'gap-6'}`}>
      <div className="flex justify-between items-end">
        <label className={`text-[11px] font-black uppercase tracking-widest ${!validation.valid && hasVal ? 'text-rose-600' : 'text-slate-400'}`}>
          {!validation.valid && hasVal ? validation.error : 'Введите госномер'}
        </label>
        <div className={`px-2 py-0.5 rounded-full text-[9px] font-black ${validation.valid ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-400'}`}>
          {validation.valid ? 'OK' : '...'}
        </div>
      </div>

      {/* Container used for measurement and layout anchor */}
      <div 
        ref={inputContainerRef}
        className={`relative group w-full ${isCompact ? 'h-24' : 'h-32 md:h-44'}`}
      >
        <input
          ref={inputRef}
          type="text"
          value={val}
          onChange={(e) => setVal(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && triggerSearch()}
          placeholder="A000AA77"
          disabled={isLoading}
          style={{ 
            fontSize: `${dynamicFontSize}px`,
            lineHeight: '1',
            paddingInline: 'clamp(24px, 3vw, 40px)'
          }}
          className={`w-full h-full font-black text-center uppercase tracking-tighter outline-none rounded-2xl border-4 transition-all
            license-plate-font flex items-center justify-center
            ${isLoading ? 'bg-slate-50 border-slate-100 text-slate-300' 
              : !validation.valid && hasVal ? 'bg-rose-50 border-rose-200 text-rose-900 animate-shake'
              : validation.valid ? 'bg-emerald-50 border-emerald-500 text-indigo-950 shadow-inner'
              : 'bg-slate-50 border-slate-200 focus:border-indigo-600 focus:bg-white'
            }`}
        />
        
        {/* Hidden measurement element to assist if needed, though math is preferred for JetBrains Mono */}
        <span className="sr-only" aria-hidden="true">{val}</span>
      </div>

      <div className={`grid grid-cols-4 gap-3 ${isCompact ? 'h-12' : 'h-16 md:h-20'}`}>
        <button
          onClick={() => { setVal(''); onClear(); }}
          className="bg-slate-100 text-slate-500 font-black rounded-xl border-b-4 border-slate-300 active:translate-y-0.5 active:border-b-0 transition-all uppercase text-[10px]"
        >
          СБРОС
        </button>
        <button
          onClick={triggerSearch}
          disabled={isLoading || !validation.valid}
          className={`col-span-3 text-white font-black rounded-xl border-b-4 transition-all uppercase tracking-widest
            active:translate-y-0.5 active:border-b-0
            ${isLoading || !validation.valid 
              ? 'bg-slate-200 border-slate-300 text-slate-400' 
              : 'bg-indigo-600 border-indigo-900 text-lg'
            }`}
        >
          {isLoading ? '...' : 'ПРОВЕРИТЬ'}
        </button>
      </div>
    </div>
  );
};

export default SearchArea;
