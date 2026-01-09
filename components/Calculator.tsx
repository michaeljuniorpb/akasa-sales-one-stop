
import React, { useState, useEffect, useRef } from 'react';
import { SimulationResult, SavedSimulation } from '../types';
import { formatRupiah, parseNumber } from '../utils/formatters';
import { TENOR_YEARS_OPTIONS } from '../constants';
import NumberInput from './NumberInput';

const Calculator: React.FC = () => {
  const [hargaPL, setHargaPL] = useState<number>(0);
  const [diskonPersen, setDiskonPersen] = useState<number>(0);
  const [diskonNominal, setDiskonNominal] = useState<number>(0);
  const [dpNominal, setDpNominal] = useState<number>(0);
  const [dpPersen, setDpPersen] = useState<number>(0);
  const [utj, setUtj] = useState<number>(0);
  const [bungaBank, setBungaBank] = useState<number>(3.75);
  const [tenorTahun, setTenorTahun] = useState<number>(10);
  const [isOtherTenor, setIsOtherTenor] = useState(false);
  const [customTenor, setCustomTenor] = useState<number>(1);
  const [clientName, setClientName] = useState('');
  
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [comparison, setComparison] = useState<{ [key: number]: number }>({});
  
  const isUpdatingRef = useRef(false);

  const hargaNett = Math.max(0, hargaPL - diskonNominal);
  const plafond = Math.max(0, hargaNett - dpNominal);
  const sisaDP = Math.max(0, dpNominal - utj);

  useEffect(() => {
    const saved = localStorage.getItem('akasa_calc_state');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setHargaPL(data.hargaPL || 0);
        setDiskonNominal(data.diskonNominal || 0);
        setDiskonPersen(data.diskonPersen || 0);
        setDpNominal(data.dpNominal || 0);
        setDpPersen(data.dpPersen || 0);
        setUtj(data.utj || 0);
        setBungaBank(data.bungaBank || 3.75);
        setTenorTahun(data.tenorTahun || 10);
        setClientName(data.clientName || '');
      } catch (e) {}
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('akasa_calc_state', JSON.stringify({
      hargaPL, diskonNominal, diskonPersen, dpNominal, dpPersen, utj, bungaBank, tenorTahun, clientName
    }));
  }, [hargaPL, diskonNominal, diskonPersen, dpNominal, dpPersen, utj, bungaBank, tenorTahun, clientName]);

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

  const calculateSingle = (p: number, rate: number, years: number) => {
    const months = years * 12;
    if (months <= 0) return 0;
    if (rate <= 0) return p / months;
    const monthlyRate = (rate / 100) / 12;
    return p * monthlyRate * Math.pow(1 + monthlyRate, months) / (Math.pow(1 + monthlyRate, months) - 1);
  };

  const handleCalculate = () => {
    if (hargaPL <= 0) { alert("Masukkan Harga PL."); return; }
    const tTahun = isOtherTenor ? customTenor : tenorTahun;
    
    const monthlyInstallment = calculateSingle(plafond, bungaBank, tTahun);

    setResult({
      hargaPL, diskonPersen, diskonNominal, hargaNett,
      dpNominal, dpPercent: dpPersen, utj, sisaDP,
      bungaBank, plafond, tenorTahun: tTahun,
      tenorBulan: tTahun * 12, monthlyInstallment, 
      totalPayment: (monthlyInstallment * (tTahun * 12)) + dpNominal
    });

    const compData: { [key: number]: number } = {};
    [10, 15, 20].forEach(t => {
      compData[t] = calculateSingle(plafond, bungaBank, t);
    });
    setComparison(compData);

    if (window.innerWidth < 768) {
      const el = document.getElementById('result-section');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
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
    const existingHistory = JSON.parse(localStorage.getItem('akasa_sim_history') || '[]');
    localStorage.setItem('akasa_sim_history', JSON.stringify([newRecord, ...existingHistory]));
    alert("Berhasil disimpan ke Riwayat!");
  };

  const getSummaryText = () => {
    if (!result) return "";
    return `
*Akasa Pure Living - Simulasi Properti*
Klien: ${clientName || '-'}
---------------------------------
Harga PL: ${formatRupiah(result.hargaPL!)}
Diskon: ${result.diskonPersen!.toFixed(2).replace('.', ',')}% (${formatRupiah(result.diskonNominal!)})
Harga Nett: ${formatRupiah(result.hargaNett!)}

PEMBAYARAN AWAL:
DP Total: ${result.dpPercent!.toFixed(2).replace('.', ',')}% (${formatRupiah(result.dpNominal)})
UTJ: ${formatRupiah(result.utj!)}
*Sisa DP: ${formatRupiah(result.sisaDP!)}*

KPR:
Plafond: ${formatRupiah(result.plafond!)}
Bunga: ${result.bungaBank?.toString().replace('.', ',')}% p.a
Tenor: ${result.tenorTahun} Tahun
---------------------------------
ESTIMASI CICILAN:
*${formatRupiah(result.monthlyInstallment)} / bln*

PERBANDINGAN TENOR:
10 Thn: ${formatRupiah(comparison[10] || 0)}
15 Thn: ${formatRupiah(comparison[15] || 0)}
20 Thn: ${formatRupiah(comparison[20] || 0)}
---------------------------------
    `.trim();
  };

  const copyToClipboard = () => {
    const text = getSummaryText();
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => alert("Teks berhasil disalin!"));
  };

  const shareWhatsApp = () => {
    const text = getSummaryText();
    if (!text) return;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Kolom Input */}
      <div className="lg:col-span-5 bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
        <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
          <div className="w-1.5 h-6 bg-indigo-600 rounded-full"></div>
          Data Simulasi
        </h3>
        
        <div className="space-y-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700">Nama Klien</label>
            <input 
              type="text" 
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              placeholder="Unit / Nama Klien"
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
            <NumberInput label="Booking Fee (UTJ)" value={utj} onChange={setUtj} prefix="Rp" />
          </div>

          <div className="p-4 bg-emerald-50/30 rounded-2xl space-y-4 border border-emerald-100/30">
            <NumberInput label="Bunga Bank (% p.a)" value={bungaBank} onChange={setBungaBank} suffix="%" allowFloat />
            
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pilih Tenor (Tahun)</label>
              <div className="grid grid-cols-3 gap-2">
                {TENOR_YEARS_OPTIONS.map(opt => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => { setTenorTahun(opt); setIsOtherTenor(false); }}
                    className={`py-3 rounded-xl text-xs font-black transition-all border ${!isOtherTenor && tenorTahun === opt ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg' : 'bg-white text-slate-600 border-slate-200'}`}
                  >
                    {opt} THN
                  </button>
                ))}
                <button 
                  type="button"
                  onClick={() => setIsOtherTenor(true)} 
                  className={`py-3 rounded-xl text-xs font-black transition-all border ${isOtherTenor ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg' : 'bg-white text-slate-600 border-slate-200'}`}
                >
                  LAINNYA
                </button>
              </div>
              
              {/* FIXED: Input Manual Tenor */}
              {isOtherTenor && (
                <div className="mt-4 p-4 bg-white border border-indigo-100 rounded-2xl animate-in zoom-in-95">
                   <NumberInput label="Masukkan Tenor Manual" value={customTenor} onChange={setCustomTenor} suffix="Tahun" />
                </div>
              )}
            </div>
          </div>

          <button onClick={handleCalculate} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-4 rounded-2xl transition-all shadow-xl shadow-indigo-100 uppercase tracking-widest active:scale-[0.97]">
            Lihat Hasil Simulasi
          </button>
        </div>
      </div>

      {/* Kolom Hasil */}
      <div id="result-section" className="lg:col-span-7 space-y-6">
        {result ? (
          <>
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
              <div className="text-center mb-10">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-500 block mb-2">Cicilan Utama ({result.tenorTahun} Tahun)</span>
                <h2 className="text-5xl font-black text-slate-900 leading-tight">{formatRupiah(result.monthlyInstallment)}</h2>
                <div className="flex justify-center gap-4 mt-3">
                   <span className="text-xs font-bold text-slate-400">Plafond: {formatRupiah(result.plafond!)}</span>
                   <span className="text-xs font-bold text-slate-400">|</span>
                   <span className="text-xs font-bold text-slate-400">Sisa DP: {formatRupiah(result.sisaDP!)}</span>
                </div>
              </div>

              {/* Perbandingan Tenor 10, 15, 20 */}
              <div className="grid grid-cols-3 gap-3 mb-8">
                {[10, 15, 20].map(t => {
                  const isActive = result.tenorTahun === t;
                  return (
                    <div 
                      key={t}
                      className={`relative p-4 rounded-2xl border transition-all duration-300 ${isActive ? 'bg-indigo-600 border-indigo-600 text-white shadow-xl scale-105 z-10' : 'bg-slate-50 border-slate-100 text-slate-600 opacity-70'}`}
                    >
                      {isActive && <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-amber-400 text-amber-900 text-[8px] font-black px-2 py-0.5 rounded-full shadow-sm">TERPILIH</div>}
                      <p className={`text-[9px] font-black uppercase tracking-widest mb-1 ${isActive ? 'text-indigo-100' : 'text-slate-400'}`}>{t} Tahun</p>
                      <p className={`text-xs font-black ${isActive ? 'text-white' : 'text-slate-800'}`}>{formatRupiah(comparison[t] || 0)}</p>
                    </div>
                  );
                })}
              </div>

              {/* Action Buttons: 3 Tombol Sesuai Request */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button 
                  onClick={saveToHistory} 
                  className="bg-slate-900 text-white font-bold py-3.5 rounded-xl hover:bg-black transition-all flex items-center justify-center gap-2 text-[11px] uppercase tracking-wider"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                  Simpan
                </button>
                <button 
                  onClick={copyToClipboard} 
                  className="bg-slate-100 text-slate-700 font-bold py-3.5 rounded-xl hover:bg-slate-200 transition-all flex items-center justify-center gap-2 text-[11px] uppercase tracking-wider"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75" /></svg>
                  Salin Teks
                </button>
                <button 
                  onClick={shareWhatsApp} 
                  className="bg-emerald-500 text-white font-bold py-3.5 rounded-xl hover:bg-emerald-600 transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-100 text-[11px] uppercase tracking-wider"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.246 2.248 3.484 5.232 3.484 8.412-.003 6.557-5.338 11.892-11.893 11.892-1.997-.001-3.951-.5-5.688-1.448l-6.309 1.656zm6.29-4.143c1.589.943 3.133 1.417 4.929 1.417 5.617 0 10.188-4.57 10.191-10.187.002-5.457-4.446-10.188-10.191-10.188-2.724 0-5.284 1.06-7.21 2.984s-2.984 4.486-2.984 7.21c0 1.838.483 3.421 1.468 4.938l-1.004 3.663 3.8-.999z"/></svg>
                  WhatsApp
                </button>
              </div>
            </div>

            <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl flex gap-3">
                <div className="text-amber-500 pt-0.5">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm8.706-1.442c1.146-.573 2.437.463 2.126 1.706l-.709 2.836c-.149.598.019 1.225.44 1.645a2.25 2.25 0 001.64 1.139c.647.054 1.291-.252 1.645-.706a.75.75 0 111.168.94c-.66.82-1.84 1.34-2.95 1.246a3.75 3.75 0 01-2.733-1.899 3.75 3.75 0 01-.734-2.742l.71-2.836a.75.75 0 00-.147-.548.75.75 0 00-.547-.146.75.75 0 01-.84-1.042zM12 7.5a1.125 1.125 0 100 2.25 1.125 1.125 0 000-2.25z" clipRule="evenodd" /></svg>
                </div>
                <p className="text-[10px] text-amber-700 leading-relaxed font-bold italic">
                    *Estimasi cicilan di atas menggunakan bunga anuitas. Suku bunga dan plafon akhir tunduk pada hasil analisa kredit Bank.
                </p>
            </div>
          </>
        ) : (
          <div className="bg-slate-100/50 border-2 border-dashed border-slate-200 rounded-[2.5rem] p-20 flex flex-col items-center text-center">
            <h4 className="font-bold text-slate-400">Belum Ada Hasil</h4>
            <p className="text-xs text-slate-400 mt-2 italic">Isi data unit di samping lalu tekan tombol hitung.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Calculator;
