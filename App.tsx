
import React, { useState } from 'react';
import { AppTab } from './types';
import { ICONS } from './constants';
import Calculator from './components/Calculator';
import FileViewer from './components/FileViewer';
import History from './components/History';

// Menggunakan format link direct yang lebih stabil untuk Google Drive images
const FILE_ID = "1-KjUGZ4rkCwLT_AZegZpSzbcR-V8_bLC";
const LOGO_URL = `https://lh3.googleusercontent.com/d/${FILE_ID}`; 

const LogoComponent = () => {
  if (LOGO_URL) {
    return <img src={LOGO_URL} alt="Akasa Logo" className="h-10 w-auto object-contain" />;
  }
  
  // Default Branding jika LOGO_URL kosong (Menggunakan SVG Rumah Minimalis + Gradient)
  return (
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-violet-700 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
          <path d="M11.47 3.84a.75.75 0 011.06 0l8.69 8.69a.75.75 0 101.06-1.06l-8.689-8.69a2.25 2.25 0 00-3.182 0l-8.69 8.69a.75.75 0 001.061 1.06l8.69-8.69z" />
          <path d="M12 5.432l8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 01-.75-.75v-4.5a.75.75 0 00-.75-.75h-3a.75.75 0 00-.75.75V21a.75.75 0 01-.75.75H5.719c-1.035 0-1.875-.84-1.875-1.875v-6.198c.03-.028.06-.056.091-.086L12 5.432z" />
        </svg>
      </div>
      <div className="flex flex-col">
        <span className="text-xl font-black text-slate-900 leading-none tracking-tight">AKASA</span>
        <span className="text-[10px] font-bold text-indigo-600 tracking-[0.2em] uppercase">Pure Living</span>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AppTab>(AppTab.CALCULATOR);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-5 flex flex-col lg:flex-row justify-between items-center gap-6">
            <div className="flex flex-col items-center lg:items-start">
              <LogoComponent />
              <h1 className="mt-2 text-[10px] font-black text-slate-400 tracking-[0.25em] uppercase whitespace-nowrap">
                Akasa Sales One-Stop
              </h1>
            </div>

            {/* Navigasi Tab */}
            <nav className="flex p-1.5 bg-slate-100 rounded-2xl w-full lg:w-auto overflow-x-auto no-scrollbar">
              <button
                onClick={() => setActiveTab(AppTab.CALCULATOR)}
                className={`flex-none px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
                  activeTab === AppTab.CALCULATOR 
                    ? 'bg-white text-indigo-600 shadow-sm border border-slate-200/50' 
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <ICONS.Calc />
                Simulasi
              </button>
              <button
                onClick={() => setActiveTab(AppTab.HISTORY)}
                className={`flex-none px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
                  activeTab === AppTab.HISTORY 
                    ? 'bg-white text-indigo-600 shadow-sm border border-slate-200/50' 
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Riwayat
              </button>
              <button
                onClick={() => setActiveTab(AppTab.FILE_VIEWER)}
                className={`flex-none px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
                  activeTab === AppTab.FILE_VIEWER 
                    ? 'bg-white text-indigo-600 shadow-sm border border-slate-200/50' 
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <ICONS.Folder />
                File Penjualan
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
          {activeTab === AppTab.CALCULATOR && <Calculator />}
          {activeTab === AppTab.HISTORY && <History />}
          {activeTab === AppTab.FILE_VIEWER && <FileViewer />}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-12 mt-auto">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex flex-col items-center md:items-start gap-2">
            <div className="grayscale opacity-70 hover:grayscale-0 transition-all cursor-default">
               <LogoComponent />
            </div>
            <p className="text-slate-400 text-[11px] font-medium max-w-[200px] text-center md:text-left mt-2 leading-relaxed">
              Penyedia hunian modern dan nyaman dengan konsep Pure Living.
            </p>
          </div>
          
          <div className="flex flex-col items-center md:items-end gap-1">
            <p className="text-slate-500 text-xs font-bold">
              © 2024 Akasa Pure Living
            </p>
            <p className="text-slate-400 text-[10px] font-medium italic">
              Internal Sales One-Stop Tool v1.2
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
