
import React, { useState, useEffect } from 'react';
import { SavedSimulation } from '../types';
import { formatRupiah, formatDate } from '../utils/formatters';

const History: React.FC = () => {
  const [history, setHistory] = useState<SavedSimulation[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('akasa_sim_history');
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {}
    }
  }, []);

  const deleteRecord = (id: string) => {
    const updated = history.filter(item => item.id !== id);
    setHistory(updated);
    localStorage.setItem('akasa_sim_history', JSON.stringify(updated));
  };

  const clearAll = () => {
    if (confirm("Hapus semua riwayat?")) {
      setHistory([]);
      localStorage.removeItem('akasa_sim_history');
    }
  };

  if (history.length === 0) {
    return (
      <div className="bg-white border-2 border-dashed border-slate-200 rounded-3xl p-20 flex flex-col items-center text-center">
        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6 text-slate-300">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10">
            <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-slate-800">Belum Ada Riwayat</h3>
        <p className="text-slate-400 mt-2">Simulasi yang Anda simpan akan muncul di sini untuk memudahkan review kembali.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-black text-slate-800">Riwayat Simulasi Klien</h2>
        <button onClick={clearAll} className="text-xs font-bold text-red-500 hover:text-red-700 transition-colors uppercase tracking-wider">
          Hapus Semua
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {history.sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).map(item => (
          <div key={item.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-lg transition-all">
            <div className="p-6 border-b border-slate-50 flex justify-between items-start">
              <div>
                <h4 className="font-bold text-slate-900">{item.clientName || 'Unnamed Client'}</h4>
                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">{formatDate(item.timestamp)}</p>
              </div>
              <button 
                onClick={() => deleteRecord(item.id)}
                className="text-slate-300 hover:text-red-500 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                </svg>
              </button>
            </div>
            <div className="p-6 bg-slate-50/50 space-y-3">
              <div className="flex justify-between">
                <span className="text-xs text-slate-500">Harga Nett:</span>
                <span className="text-xs font-bold text-slate-800">{formatRupiah(item.data.hargaNett!)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-slate-500">Tenor:</span>
                <span className="text-xs font-bold text-slate-800">{item.data.tenorTahun} Tahun</span>
              </div>
              <div className="pt-2 border-t border-slate-200 flex justify-between items-center">
                <span className="text-[10px] font-bold text-indigo-500 uppercase">Cicilan</span>
                <span className="text-sm font-black text-indigo-600">{formatRupiah(item.data.monthlyInstallment)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default History;
