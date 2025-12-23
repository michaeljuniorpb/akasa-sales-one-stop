
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
  const [bungaBank, setBungaBank] = useState<number>(3.75); // Contoh desimal
  const [tenorTahun, setTenorTahun] = useState<number>(10);
  const [isOtherTenor, setIsOtherTenor] = useState(false);
  const [customTenor, setCustomTenor] = useState<number>(1);
  const [clientName, setClientName] = useState('');
  
  const [result, setResult] = useState<SimulationResult | null>(null);
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

  const handleCalculate = () => {
    if (hargaPL <= 0) { alert("Masukkan Harga PL."); return; }
    const tTahun = isOtherTenor ? customTenor : tenorTahun;
    const tBulan = tTahun * 12;
    
    // Logika Perhitungan Anuitas (Mendukung bunga desimal)
    let monthlyInstallment = 0;
    if (tBulan > 0) {
      if (bungaBank > 0) {
        const monthlyRate = (bungaBank / 100) / 12;
        monthlyInstallment = plafond * monthlyRate * Math.pow(1 + monthlyRate, tBulan) / (Math.pow(1 + monthlyRate, tBulan) - 1);
      } else {
        monthlyInstallment = plafond / tBulan;
      }
    }

    setResult({
      hargaPL, diskonPersen, diskonNominal, hargaNett,
      dpNominal, dpPercent: dpPersen, utj, sisaDP,
      bungaBank, plafond, tenorTahun: tTahun,
      tenorBulan: tBulan, monthlyInstallment, 
      totalPayment: (monthlyInstallment * tBulan) + dpNominal
    });

    if (window.innerWidth < 768) {
      document.getElementById('result-section')?.scrollIntoView({ behavior: 'smooth' });
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

  const copyToClipboard = () => {
    if (!result) return;
    const text = `
*Akasa Pure Living - Simulasi Properti*
Klien: ${clientName || '-'}
---------------------------------
Harga PL: ${formatRupiah(result.hargaPL!)}
Diskon: ${result.diskonPersen!.toFixed(2).replace('.', ',')}% (${formatRupiah(result.diskonNominal!)})
Harga Nett: ${formatRupiah(result.hargaNett!)}

PEMBAYARAN AWAL:
DP Total: ${result.dpPercent!.toFixed(2).replace('.', ',')}% (${formatRupiah(result.dpNominal)})
Booking Fee (UTJ): ${formatRupiah(result.utj!)}
*Sisa DP Dibayar: ${formatRupiah(result.sisaDP!)}*
(UTJ mengurangi nilai DP yang dibayar)

KPR:
Plafond: ${formatRupiah(result.plafond!)}
Bunga: ${result.bungaBank?.toString().replace('.', ',')}% p.a (Anuitas)
Tenor: ${result.tenorTahun} Tahun
---------------------------------
ESTIMASI CICILAN:
*${formatRupiah(result.monthlyInstallment)} / bln*
---------------------------------
    `.trim();
    navigator.clipboard.writeText(text).then(() => alert("Berhasil disalin!"));
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      <div className="lg:col-span-5 bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
        <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
          <div className="w-1.5 h-6 bg-indigo-600 rounded-full"></div>
          Input Data Unit
        </h3>
        
        <div className="space-y-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700">Nama Klien / Unit</label>
            <input 
              type="text" 
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              placeholder="Contoh: Bpk. Budi / Unit 12A"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          <NumberInput label="Harga Price List" value={hargaPL} onChange={setHargaPL} prefix="Rp" />
          
          <div className="p-4 bg-slate-50 rounded-2xl space-y-4 border border-slate-100">
            <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Potongan Harga</h4>
            <div className="grid grid-cols-2 gap-4">
              <NumberInput label="Diskon (%)" value={diskonPersen} onChange={handleDiskonPersenChange} suffix="%" allowFloat />
              <NumberInput label="Diskon (Rp)" value={diskonNominal} onChange={handleDiskonNominalChange} prefix="Rp" />
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-slate-200">
                <span className="text-xs font-bold text-slate-500">Harga Nett</span>
                <span className="text-sm font-black text-indigo-600">{formatRupiah(hargaNett)}</span>
            </div>
          </div>

          <div className="p-4 bg-indigo-50/30 rounded-2xl space-y-4 border border-indigo-100/30">
            <h4 className="text-[10px] font-black uppercase text-indigo-400 tracking-widest">Uang Muka & Booking</h4>
            <div className="grid grid-cols-2 gap-4">
              <NumberInput label="DP (%)" value={dpPersen} onChange={handleDpPersenChange} suffix="%" allowFloat />
              <NumberInput label="DP (Rp)" value={dpNominal} onChange={handleDpNominalChange} prefix="Rp" />
            </div>
            <NumberInput label="UTJ (Booking Fee)" value={utj} onChange={setUtj} prefix="Rp" />
            
            <div className="p-3 bg-white rounded-xl border border-indigo-100 flex justify-between items-center">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase">Sisa DP Dibayar</p>
                <p className="text-sm font-black text-slate-800">{formatRupiah(sisaDP)}</p>
              </div>
              <div className="text-[9px] text-indigo-500 font-medium text-right max-w-[120px]">
                *UTJ otomatis mengurangi DP yang dibayar
              </div>
            </div>
          </div>

          <div className="p-4 bg-emerald-50/30 rounded-2xl space-y-4 border border-emerald-100/30">
            <h4 className="text-[10px] font-black uppercase text-emerald-500 tracking-widest">Parameter Bank</h4>
            <NumberInput label="Suku Bunga (% p.a)" value={bungaBank} onChange={setBungaBank} suffix="%" allowFloat placeholder="Contoh: 3,75" />
            
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-slate-700">Tenor KPR (Tahun)</label>
              <div className="grid grid-cols-3 gap-2">
                {TENOR_YEARS_OPTIONS.map(opt => (
                  <button
                    key={opt}
                    onClick={() => { setTenorTahun(opt); setIsOtherTenor(false); }}
                    className={`py-2 rounded-xl text-sm font-bold border transition-all ${!isOtherTenor && tenorTahun === opt ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' : 'bg-white text-slate-600 border-slate-200'}`}
                  >
                    {opt} Thn
                  </button>
                ))}
                <button onClick={() => setIsOtherTenor(true)} className={`py-2 rounded-xl text-sm font-bold border transition-all ${isOtherTenor ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' : 'bg-white text-slate-600 border-slate-200'}`}>Lainnya</button>
              </div>
              {isOtherTenor && (
                <div className="mt-2">
                   <NumberInput label="Input Tahun" value={customTenor} onChange={setCustomTenor} suffix="Thn" />
                </div>
              )}
            </div>
          </div>

          <button onClick={handleCalculate} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-2xl transition-all shadow-xl shadow-indigo-100 active:scale-[0.98]">
            Hitung Simulasi
          </button>
        </div>
      </div>

      <div id="result-section" className="lg:col-span-7 space-y-6">
        {result ? (
          <>
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
              <div className="text-center mb-8">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-500 block mb-2">Estimasi Angsuran KPR</span>
                <h2 className="text-5xl font-black text-slate-900">{formatRupiah(result.monthlyInstallment)}</h2>
                <p className="text-slate-400 font-medium text-sm mt-2">Selama {result.tenorTahun} Tahun @ {result.bungaBank?.toString().replace('.', ',')}%</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6 border-t border-slate-100">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Plafond Pinjaman</p>
                    <p className="text-lg font-black text-emerald-600">{formatRupiah(result.plafond!)}</p>
                </div>
                <div className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100">
                    <p className="text-[10px] font-bold text-indigo-400 uppercase mb-1">Sisa DP yang Dibayar</p>
                    <p className="text-lg font-black text-indigo-600">{formatRupiah(result.sisaDP!)}</p>
                </div>
              </div>

              <div className="mt-6 space-y-3 bg-slate-50/30 p-4 rounded-2xl">
                 <div className="flex justify-between text-xs font-medium">
                    <span className="text-slate-400">Harga Nett Unit</span>
                    <span className="text-slate-700 font-bold">{formatRupiah(result.hargaNett!)}</span>
                 </div>
                 <div className="flex justify-between text-xs font-medium">
                    <span className="text-slate-400">Uang Muka (DP {result.dpPercent?.toFixed(2).replace('.', ',')}%)</span>
                    <span className="text-slate-700 font-bold">{formatRupiah(result.dpNominal)}</span>
                 </div>
                 <div className="flex justify-between text-xs font-medium border-b border-slate-100 pb-2">
                    <span className="text-slate-400">Booking Fee (UTJ)</span>
                    <span className="text-red-500 font-bold">-{formatRupiah(result.utj!)}</span>
                 </div>
                 <div className="flex justify-between text-xs font-black pt-1">
                    <span className="text-slate-600 uppercase">Sisa Kewajiban DP</span>
                    <span className="text-indigo-600">{formatRupiah(result.sisaDP!)}</span>
                 </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 mt-8">
                <button onClick={saveToHistory} className="flex-1 bg-slate-900 text-white font-bold py-3.5 rounded-xl hover:bg-black transition-all flex items-center justify-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                  Simpan Riwayat
                </button>
                <button onClick={copyToClipboard} className="flex-1 bg-emerald-500 text-white font-bold py-3.5 rounded-xl hover:bg-emerald-600 transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-100">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.246 2.248 3.484 5.232 3.484 8.412-.003 6.557-5.338 11.892-11.893 11.892-1.997-.001-3.951-.5-5.688-1.448l-6.309 1.656zm6.29-4.143c1.589.943 3.133 1.417 4.929 1.417 5.617 0 10.188-4.57 10.191-10.187.002-5.457-4.446-10.188-10.191-10.188-2.724 0-5.284 1.06-7.21 2.984s-2.984 4.486-2.984 7.21c0 1.838.483 3.421 1.468 4.938l-1.004 3.663 3.8-.999z"/></svg>
                  WhatsApp Share
                </button>
              </div>
            </div>

            <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl flex gap-3 shadow-sm shadow-amber-50">
                <div className="text-amber-500">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                        <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm8.706-1.442c1.146-.573 2.437.463 2.126 1.706l-.709 2.836c-.149.598.019 1.225.44 1.645a2.25 2.25 0 001.64 1.139c.647.054 1.291-.252 1.645-.706a.75.75 0 111.168.94c-.66.82-1.84 1.34-2.95 1.246a3.75 3.75 0 01-2.733-1.899 3.75 3.75 0 01-.734-2.742l.71-2.836a.75.75 0 00-.147-.548.75.75 0 00-.547-.146.75.75 0 01-.84-1.042zM12 7.5a1.125 1.125 0 100 2.25 1.125 1.125 0 000-2.25z" clipRule="evenodd" />
                    </svg>
                </div>
                <p className="text-[10px] text-amber-700 leading-relaxed font-medium italic">
                    *Nilai cicilan adalah estimasi menggunakan suku bunga desimal yang Anda input. Suku bunga aktual mengikuti kebijakan Bank pada saat penandatanganan akad kredit.
                </p>
            </div>
          </>
        ) : (
          <div className="bg-slate-100/50 border-2 border-dashed border-slate-200 rounded-3xl p-20 flex flex-col items-center text-center">
            <h4 className="font-bold text-slate-400">Hasil Muncul di Sini</h4>
            <p className="text-xs text-slate-400 mt-2 italic">Pastikan UTJ telah diisi untuk melihat sisa kewajiban DP.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Calculator;
