"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Search } from "lucide-react";

interface Props {
  value: string;
  onChange: (val: string) => void;
  options: string[];
  placeholder?: string;
  className?: string;
}

export default function SearchableCombobox({ value, onChange, options, placeholder = "请选择...", className = "" }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filtered = options.filter(opt => 
    opt.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <div 
        className="w-full bg-bg-main border border-white/5 rounded-xl px-4 py-3 text-white flex justify-between items-center cursor-pointer hover:border-brand/30 transition-colors focus-within:ring-1 focus-within:ring-brand/50"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={value ? "text-white" : "text-text-secondary/50"}>
          {value || placeholder}
        </span>
        <ChevronDown className={`w-4 h-4 text-text-secondary transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-[#1a1b1e] border border-white/10 rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.5)] overflow-hidden">
          <div className="p-3 border-b border-white/5 relative bg-bg-surface">
             <Search className="w-4 h-4 text-text-secondary absolute left-6 top-1/2 -translate-y-1/2" />
             <input 
               type="text"
               autoFocus
               value={searchTerm}
               onChange={e => setSearchTerm(e.target.value)}
               placeholder="搜索关键字..."
               className="w-full bg-black/40 text-sm text-white rounded-lg pl-9 pr-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-brand/50 border border-white/5 transition-shadow"
             />
          </div>
          
          <div className="max-h-64 overflow-y-auto p-2 bg-bg-surface/50 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
            {filtered.length > 0 ? (
              filtered.map(opt => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => {
                    onChange(opt);
                    setIsOpen(false);
                    setSearchTerm("");
                  }}
                  className={`w-full text-left px-4 py-3 rounded-lg text-sm transition-all ${
                    value === opt 
                    ? "bg-brand/20 text-brand font-bold border border-brand/20" 
                    : "text-text-secondary hover:text-white hover:bg-white/5 border border-transparent"
                  }`}
                >
                  {opt}
                </button>
              ))
            ) : (
              <div className="p-6 text-center text-text-secondary text-sm flex flex-col items-center">
                <Search className="w-8 h-8 text-white/10 mb-2" />
                没有找到匹配的选项
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
