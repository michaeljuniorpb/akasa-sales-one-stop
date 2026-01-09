
import React, { useState } from 'react';
import { AppTab } from './types';
import { ICONS } from './constants';
import Calculator from './components/Calculator';
import FileViewer from './components/FileViewer';
import History from './components/History';

const FILE_ID = "1-KjUGZ4rkCwLT_AZegZpSzbcR-V8_bLC";
const LOGO_URL = `https://lh3.googleusercontent.com/d/${FILE_ID}`; 

const LogoComponent = () => {
  return (
    <div className="flex items-center gap-2">
      <img src={LOGO_URL} alt="Akasa Logo" className="h-8 w-auto object-contain" />
      <div className="flex flex-col">
        <span className="text-sm font-black text-slate-900 leading-tight tracking-tight uppercase">Akasa</span>
        <span className="text-[8px] font-bold text-indigo-600 tracking-[0.2em] uppercase leading-tight">Pure Living</span>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AppTab>(AppTab.CALCULATOR);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Header - Dioptimalkan untuk Mobile */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4">
          <div className="h-16 flex items-center justify-between gap-4">
            <LogoComponent />
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex p-1 bg-slate-100 rounded-xl">
              <button
                onClick={() => setActiveTab(AppTab.CALCULATOR)}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${activeTab === AppTab.CALCULATOR ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}
              >
                <ICONS.Calc /> Simulasi
              </button>
              <button
                onClick={() => setActiveTab(AppTab.HISTORY)}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${activeTab === AppTab.HISTORY ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                Riwayat
              </button>
              <button
                onClick={() => setActiveTab(AppTab.FILE_VIEWER)}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${activeTab === AppTab.FILE_VIEWER ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}
              >
                <ICONS.Folder /> File
              </button>
            </nav>
          </div>
        </div>
        
        {/* Mobile Navigation Tab - Sticky Bottom or below header */}
        <div className="md:hidden border-t border-slate-100 px-4 py-2 overflow-x-auto no-scrollbar bg-white">
          <div className="flex gap-2 min-w-max">
            <button
              onClick={() => setActiveTab(AppTab.CALCULATOR)}
              className={`flex-1 px-4 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${activeTab === AppTab.CALCULATOR ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'bg-slate-50 text-slate-500'}`}
            >
              <ICONS.Calc /> Simulasi
            </button>
            <button
              onClick={() => setActiveTab(AppTab.HISTORY)}
              className={`flex-1 px-4 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${activeTab === AppTab.HISTORY ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'bg-slate-50 text-slate-500'}`}
            >
               <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
               Riwayat
            </button>
            <button
              onClick={() => setActiveTab(AppTab.FILE_VIEWER)}
              className={`flex-1 px-4 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${activeTab === AppTab.FILE_VIEWER ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'bg-slate-50 text-slate-500'}`}
            >
              <ICONS.Folder /> File
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-6 md:py-8">
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
          {activeTab === AppTab.CALCULATOR && <Calculator />}
          {activeTab === AppTab.HISTORY && <History />}
          {activeTab === AppTab.FILE_VIEWER && <FileViewer />}
        </div>
      </main>

      {/* Footer - Minimalis untuk Mobile */}
      <footer className="bg-white border-t border-slate-200 py-8 px-4">
        <div className="max-w-7xl mx-auto flex flex-col items-center gap-4 text-center">
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">© 2024 Akasa Pure Living</p>
          <div className="flex gap-4">
             <span className="text-[9px] text-slate-400 font-medium italic">v1.2 Mobile Ready</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
