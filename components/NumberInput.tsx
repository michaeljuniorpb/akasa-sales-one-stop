
import React, { useState, useEffect } from 'react';
import { parseNumber } from '../utils/formatters';

interface NumberInputProps {
  label: string;
  value: number;
  onChange: (val: number) => void;
  prefix?: string;
  suffix?: string;
  placeholder?: string;
  className?: string;
  allowFloat?: boolean;
}

const NumberInput: React.FC<NumberInputProps> = ({ 
  label, value, onChange, prefix, suffix, placeholder, className = "", allowFloat = false 
}) => {
  // Gunakan local state string agar user bisa mengetik koma/titik tanpa hilang seketika
  const [inputValue, setInputValue] = useState<string>("");

  // Sinkronisasi saat nilai dari parent (props) berubah secara eksternal (misal: Reset atau Load History)
  useEffect(() => {
    const formattedValue = prefix === 'Rp' 
      ? value.toLocaleString('id-ID')
      : value.toString().replace('.', ',');
    
    // Hanya update jika secara numerik berbeda untuk menghindari gangguan saat mengetik desimal
    if (parseNumber(inputValue, allowFloat) !== value) {
      setInputValue(value === 0 && !prefix ? "" : formattedValue);
    }
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let raw = e.target.value;

    if (allowFloat) {
      // Izinkan hanya angka, koma, dan titik
      raw = raw.replace(/[^0-9,.]/g, '');
      
      // Pastikan hanya ada satu separator desimal
      const parts = raw.split(/[.,]/);
      if (parts.length > 2) return; 
      
      setInputValue(raw);
      const num = parseNumber(raw, true);
      onChange(num);
    } else {
      // Untuk Rupiah / Angka Bulat
      const num = parseNumber(raw, false);
      setInputValue(num === 0 ? "" : num.toLocaleString('id-ID'));
      onChange(num);
    }
  };

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label className="text-sm font-medium text-slate-700">{label}</label>
      <div className="relative group">
        {prefix && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 font-medium transition-colors">
            {prefix}
          </span>
        )}
        <input
          type="text"
          value={inputValue}
          onChange={handleChange}
          placeholder={placeholder}
          className={`w-full bg-white border border-slate-200 rounded-lg py-2.5 transition-all outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500
            ${prefix ? 'pl-10' : 'pl-4'} ${suffix ? 'pr-10' : 'pr-4'}`}
        />
        {suffix && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium">
            {suffix}
          </span>
        )}
      </div>
    </div>
  );
};

export default NumberInput;
