
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { SimulationResult, SavedSimulation } from '../types';
import { formatRupiah } from '../utils/formatters';
import NumberInput from './NumberInput';

const PRESET_TENORS = [10, 15, 20] as const;

const Calculator: React.FC = () => {
  // Data Unit States
  const [hargaPL, setHargaPL] = useState<number>(0);
  const [diskonNominal, setDiskonNominal] = useState<number>(0);
  const [diskonPersen, setDiskonPersen] = useState<number>(0);
  const [dpNominal, setDpNominal] = useState<number>(0);
  const [dpPersen, setDpPersen] = useState<number>(0);
  const [utj, setUtj] = useState<number>(0);
  const [clientName, setClientName] = useState('');

  // Bank Parameter States
  const [bungaBank, setBungaBank] = useState<number>(3.75);
  
  // Tenor Logic States
  const [selectedTenorYears, setSelectedTenorYears] = useState<number>(20); // Default 20
  const [isCustomTenor, setIsCustomTenor] = useState(false);
  const [customTenorInput, setCustomTenorInput] = useState<string>("");
  const [tenorError, setTenorError] = useState("");

  const isUpdatingRef = useRef(false);

  // Derivations
  const hargaNett = Math.max(0, hargaPL - diskonNominal);
  const plafond = Math.max(0, hargaNett - dpNominal);
  const sisaDP = Math.max(0, dpNominal - utj);

  // Helper Calculation
  const computeInstallment = (p: number, rate: number, years: number) => {
    const months = years * 12;
    if (months <= 0 || p <= 0) return 0;
    if (rate <= 0) return p / months;
    const monthlyRate = (rate / 100) / 12;
    return p * monthlyRate * Math.pow(1 + monthlyRate, months) / (Math.pow(1 + monthlyRate, months) - 1);
  };

  // Realtime Comparisons (10, 15, 20)
  const comparisons = useMemo(() => ({
    10: computeInstallment(plafond, bungaBank, 10),
    15: computeInstallment(plafond, bungaBank, 15),
    20: computeInstallment(plafond, bungaBank, 20),
  }), [plafond, bungaBank]);

  // Main Result Calculation (Auto update on any input change)
  const result: SimulationResult | null = useMemo(() => {
    if (hargaPL <= 0) return null;
    const monthly = computeInstallment(plafond, bungaBank, selectedTenorYears);
    return {
      hargaPL, diskonPersen, diskonNominal, hargaNett,
      dpNominal, dpPercent: dpPersen, utj, sisaDP,
      bungaBank, plafond, tenorTahun: selectedTenorYears,
      tenorBulan: selectedTenorYears * 12, monthlyInstallment: monthly,
      totalPayment: (monthly * selectedTenorYears * 12) + dpNominal
    };
  }, [hargaPL, plafond, bungaBank, selectedTenorYears, dpNominal]);

  // Debounce for Custom Tenor Input
  useEffect(() => {
    if (!isCustomTenor) return;
    const timer = setTimeout(() => {
      const val = parseInt(customTenorInput);
      if (!isNaN(val)) {
        if (val < 1 || val > 35) {
          setTenorError("Tenor: 1 - 35 Tahun");
        } else {
          setTenorError("");
          // Auto switch to preset if match
          if (PRESET_TENORS.includes(val as any)) {
            setSelectedTenorYears(val);
            setIsCustomTenor(false);
            setCustomTenorInput("");
          } else {
            setSelectedTenorYears(val);
          }
        }
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [customTenorInput, isCustomTenor]);

  // Handlers
  const handleSelectPreset = (years: number) => {
    setSelectedTenorYears(years);
    setIsCustomTenor(false);
    setCustomTenorInput("");
    setTenorError("");
  };

  const handleSelectCustom = () => {
    setIsCustomTenor(true);
    setTenorError("");
  };

  const handleDiskonPersenChange = (val: number) => {
    if (isUpdatingRef.current) return;
    const cleanVal = Math.min(100, Math.max(0, val));
    setDiskonPersen(cleanVal);
    if (hargaPL > 0) {
      isUpdatingRef.current = true;
      setDiskonNominal(Math.round(hargaPL * (cleanVal / 100)));
      isUpdatingRef.current = false;
    }
  };

  const handleDiskonNominalChange = (val: number) => {
    if (isUpdatingRef.current) return;
    const cleanVal = Math.min(hargaPL, Math.max(0, val));
    setDiskonNominal(cleanVal);
    if (hargaPL > 0) {
      isUpdatingRef.current = true;
      setDiskonPersen((cleanVal / hargaPL) * 100);
      isUpdatingRef.current = false;
    }
  };

  const handleDpPersenChange = (val: number) => {
    if (isUpdatingRef.current) return;
    const cleanVal = Math.min(100, Math.max(0, val));
    setDpPersen(cleanVal);
    if (hargaNett > 0) {
      isUpdatingRef.current = true;
      setDpNominal(Math.round(hargaNett * (cleanVal / 100)));
      isUpdatingRef.current = false;
    }
  };

  const handleDpNominalChange = (val: number) => {
    if (isUpdatingRef.current) return;
    const cleanVal = Math.min(hargaNett, Math.max(0, val));
    setDpNominal(cleanVal);
    if (hargaNett > 0) {
      isUpdatingRef.current = true;
      setDpPersen((cleanVal / hargaNett) * 100);
      isUpdatingRef.current = false;
    }
  };

  const saveToHistory = () => {
    if (!result) return;
    const newRecord: SavedSimulation = {
      id: Date.now().toString(),
      clientName: clientName || 'Klien Tanpa Nama',
      timestamp: new Date().toISOString(),
      data: result
    };
    const existing = JSON.parse(localStorage.getItem('akasa_sim_history') || '[]');
    localStorage.setItem('akasa_sim_history', JSON.stringify([newRecord, ...existing]));
    alert("Tersimpan di Riwayat.");
  };

  const shareWhatsApp = () => {
    if (!result) return;
    const text = `*Akasa Pure Living - Simulasi*\nKlien: ${clientName || '-'}\nHarga Nett: ${formatRupiah(result.hargaNett!)}\nSisa DP: ${formatRupiah(result.sisaDP!)}\n\n*Estimasi Cicilan (${result.tenorTahun} Thn):*\n*${formatRupiah(result.monthlyInstallment)} / bln*\n\nRef Tenor Lain:\n10 Thn: ${formatRupiah(comparisons[10])}\n15 Thn: ${formatRupiah(comparisons[15])}\n20 Thn: ${formatRupiah(comparisons[20])}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Input Panel */}
      <div className="lg:col-span-5 bg-white p-6 rounded-3xl shadow-sm border border-slate-200 space-y-5">
        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <div className="w-1.5 h-6 bg-indigo-600 rounded-full"></div>
          Input Data
        </h3>

        <div className="space-y-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700">Nama Klien / Unit</label>
            <input 
              type="text" 
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              placeholder="Contoh: Unit 10A / Budi"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <NumberInput label="Harga Price List" value={hargaPL} onChange={setHargaPL} prefix="Rp" />
          
          <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <NumberInput label="Diskon (%)" value={diskonPersen} onChange={handleDiskonPersenChange} suffix="%" allowFloat />
            <NumberInput label="Diskon (Rp)" value={diskonNominal} onChange={handleDiskonNominalChange} prefix="Rp" />
          </div>

          <div className="p-4 bg-indigo-50/30 rounded-2xl space-y-4 border border-indigo-100/30">
            <div className="grid grid-cols-2 gap-4">
              <NumberInput label="DP (%)" value={dpPersen} onChange={handleDpPersenChange} suffix="%" allowFloat />
              <NumberInput label="DP (Rp)" value={dpNominal} onChange={handleDpNominalChange} prefix="Rp" />
            </div>
            <NumberInput label="UTJ (Booking Fee)" value={utj} onChange={setUtj} prefix="Rp" />
          </div>

          <div className="p-4 bg-emerald-50/30 rounded-2xl space-y-4 border border-emerald-100/30">
            <NumberInput label="Bunga Bank (% p.a)" value={bungaBank} onChange={setBungaBank} suffix="%" allowFloat placeholder="3,75" />
            
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tenor KPR (Tahun)</label>
              <div className="grid grid-cols-4 gap-2">
                {PRESET_TENORS.map(t => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => handleSelectPreset(t)}
                    className={`py-3 rounded-xl text-xs font-black transition-all border ${!isCustomTenor && selectedTenorYears === t ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300'}`}
                  >
                    {t} THN
                  </button>
                ))}
                <button
                  type="button"
                  onClick={handleSelectCustom}
                  className={`py-3 rounded-xl text-xs font-black transition-all border ${isCustomTenor ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300'}`}
                >
                  LAINNYA
                </button>
              </div>

              {isCustomTenor && (
                <div className="mt-3 animate-in slide-in-from-top-2 duration-300">
                  <input 
                    type="number"
                    value={customTenorInput}
                    onChange={(e) => setCustomTenorInput(e.target.value)}
                    placeholder="Masukkan Tenor (misal: 12)"
                    autoFocus
                    className={`w-full bg-white border rounded-xl py-3 px-4 outline-none transition-all ${tenorError ? 'border-red-500 ring-2 ring-red-100' : 'border-indigo-200 focus:ring-2 focus:ring-indigo-100'}`}
                  />
                  {tenorError && <p className="text-[10px] text-red-500 font-bold mt-1 ml-1 uppercase">{tenorError}</p>}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Result Panel */}
      <div id="result-section" className="lg:col-span-7 space-y-6">
        {result ? (
          <>
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4">
                 <div className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-indigo-100">
                    Tenor: {result.tenorTahun} Thn
                 </div>
              </div>

              <div className="text-center mb-8">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-500 block mb-2">Estimasi Cicilan Per Bulan</span>
                <h2 className="text-5xl font-black text-slate-900 leading-tight">{formatRupiah(result.monthlyInstallment)}</h2>
                
                {/* Comparison Labels Row */}
                <div className="mt-4 flex flex-wrap justify-center gap-x-4 gap-y-1">
                   {PRESET_TENORS.map(t => (
                     <div key={t} className={`flex items-center gap-1.5 ${selectedTenorYears === t ? 'opacity-100' : 'opacity-40'}`}>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{t} Thn:</span>
                        <span className="text-[11px] font-black text-slate-700">{formatRupiah(comparisons[t as 10|15|20])}</span>
                        {t !== 20 && <span className="text-slate-200 text-xs">•</span>}
                     </div>
                   ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-6 border-t border-slate-100 mb-6">
                <div className="p-4 bg-slate-50 rounded-2xl">
                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Plafond KPR</p>
                    <p className="text-lg font-black text-emerald-600">{formatRupiah(result.plafond!)}</p>
                </div>
                <div className="p-4 bg-indigo-50/50 rounded-2xl">
                    <p className="text-[10px] font-bold text-indigo-400 uppercase mb-1">Sisa DP Bayar</p>
                    <p className="text-lg font-black text-indigo-600">{formatRupiah(result.sisaDP!)}</p>
                </div>
              </div>

              <div className="space-y-3 bg-slate-50/30 p-5 rounded-2xl border border-slate-100">
                 <div className="flex justify-between text-xs">
                    <span className="text-slate-400 font-medium">Harga Nett Unit</span>
                    <span className="text-slate-800 font-bold">{formatRupiah(result.hargaNett!)}</span>
                 </div>
                 <div className="flex justify-between text-xs">
                    <span className="text-slate-400 font-medium">Uang Muka (DP {result.dpPercent?.toFixed(2)}%)</span>
                    <span className="text-slate-800 font-bold">{formatRupiah(result.dpNominal)}</span>
                 </div>
                 <div className="flex justify-between text-xs border-b border-slate-200 pb-2">
                    <span className="text-slate-400 font-medium">UTJ (Booking Fee)</span>
                    <span className="text-red-500 font-bold">-{formatRupiah(result.utj!)}</span>
                 </div>
                 <div className="flex justify-between text-xs font-black pt-1">
                    <span className="text-slate-600 uppercase tracking-wider">Total Sisa DP</span>
                    <span className="text-indigo-600">{formatRupiah(result.sisaDP!)}</span>
                 </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-8">
                <button onClick={saveToHistory} className="bg-slate-900 text-white font-bold py-3.5 rounded-xl text-[10px] uppercase tracking-wider hover:bg-black transition-all">
                  Simpan Riwayat
                </button>
                <button 
                  onClick={() => {
                    const text = `Simulasi Akasa\nCicilan: ${formatRupiah(result.monthlyInstallment)}/bln (${result.tenorTahun}thn)\nDP Bayar: ${formatRupiah(result.sisaDP!)}`;
                    navigator.clipboard.writeText(text).then(() => alert("Teks disalin!"));
                  }}
                  className="bg-slate-100 text-slate-700 font-bold py-3.5 rounded-xl text-[10px] uppercase tracking-wider hover:bg-slate-200 transition-all"
                >
                  Salin Ringkasan
                </button>
                <button onClick={shareWhatsApp} className="bg-emerald-500 text-white font-bold py-3.5 rounded-xl text-[10px] uppercase tracking-wider hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-100">
                  WhatsApp
                </button>
              </div>
            </div>

            <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl flex gap-3">
              <div className="text-amber-500 pt-0.5">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>
              </div>
              <p className="text-[10px] text-amber-700 font-bold leading-relaxed italic uppercase">
                *Estimasi cicilan anuitas. Suku bunga aktual dan approval plafon mengikuti kebijakan bank saat akad.
              </p>
            </div>
          </>
        ) : (
          <div className="bg-slate-100/50 border-2 border-dashed border-slate-200 rounded-[2.5rem] p-24 flex flex-col items-center text-center">
            <h4 className="font-bold text-slate-400">Hasil Muncul Otomatis</h4>
            <p className="text-xs text-slate-400 mt-2 italic">Lengkapi input di samping untuk melihat simulasi.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Calculator;
