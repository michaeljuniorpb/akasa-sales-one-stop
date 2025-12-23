
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { SalesFile, FileType } from '../types';
import { MOCK_FILES, ICONS } from '../constants';
import { formatDate } from '../utils/formatters';
import { db, storage, isFirebaseConfigured } from '../firebase';
import { 
  collection, 
  onSnapshot, 
  query, 
  orderBy, 
  addDoc, 
  deleteDoc, 
  doc, 
  serverTimestamp 
} from 'firebase/firestore';
import { 
  ref, 
  uploadBytesResumable, 
  getDownloadURL, 
  deleteObject 
} from 'firebase/storage';

const FileViewer: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'newest' | 'name'>('newest');
  
  // States for files
  const [firebaseFiles, setFirebaseFiles] = useState<SalesFile[]>([]);
  const [customFiles, setCustomFiles] = useState<SalesFile[]>([]);
  
  // Upload States
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadTags, setUploadTags] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  // Picker Detection States
  const [pickerStatus, setPickerStatus] = useState<'ready' | 'blocked' | 'waiting'>('ready');
  const [showPickerHint, setShowPickerHint] = useState(false);
  const pickerTimeoutRef = useRef<number | null>(null);

  const [newLink, setNewLink] = useState('');
  const [previewFile, setPreviewFile] = useState<SalesFile | null>(null);

  // Fetch from Firebase Firestore
  useEffect(() => {
    if (!isFirebaseConfigured) return;

    const q = query(collection(db, 'sales_files'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const files: SalesFile[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as SalesFile));
      setFirebaseFiles(files);
    });

    return () => unsubscribe();
  }, []);

  // Load local links from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('akasa_custom_links');
    if (saved) {
      try {
        setCustomFiles(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse custom links", e);
      }
    }
  }, []);

  // Save local links
  useEffect(() => {
    localStorage.setItem('akasa_custom_links', JSON.stringify(customFiles));
  }, [customFiles]);

  const allFiles = useMemo(() => [
    ...MOCK_FILES, 
    ...firebaseFiles, 
    ...customFiles
  ], [firebaseFiles, customFiles]);

  const allTags = useMemo(() => {
    const tags = new Set<string>();
    allFiles.forEach(f => f.tags.forEach(t => tags.add(t)));
    return Array.from(tags);
  }, [allFiles]);

  const filteredFiles = useMemo(() => {
    let result = allFiles.filter(f => 
      f.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (!selectedTag || f.tags.includes(selectedTag))
    );

    if (sortBy === 'newest') {
      result.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    } else {
      result.sort((a, b) => a.title.localeCompare(b.title));
    }

    return result;
  }, [allFiles, searchTerm, selectedTag, sortBy]);

  // Handle detection logic for file picker
  const handlePickerTriggerClick = () => {
    console.info("[FilePicker] click");
    setPickerStatus('waiting');
    setShowPickerHint(false);

    // If focus doesn't leave the window or input doesn't change within 2 seconds, it might be blocked
    pickerTimeoutRef.current = window.setTimeout(() => {
      if (pickerStatus === 'waiting' && !selectedFile) {
        console.warn("[FilePicker] Detection: No response. Possibly blocked.");
        setPickerStatus('blocked');
        setShowPickerHint(true);
      }
    }, 2000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (pickerTimeoutRef.current) clearTimeout(pickerTimeoutRef.current);
    
    if (file) {
      console.info("[FilePicker] selected:", file.name);
      setSelectedFile(file);
      setPickerStatus('ready');
      setShowPickerHint(false);
    } else {
      setPickerStatus('ready');
    }
  };

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFirebaseConfigured) return;
    
    if (!selectedFile) {
      alert("Pilih file terlebih dahulu.");
      return;
    }

    // Validation
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedTypes.includes(selectedFile.type)) {
      alert("Hanya file PDF, JPG, atau PNG yang diizinkan.");
      return;
    }

    if (selectedFile.size > 20 * 1024 * 1024) {
      alert("Ukuran file maksimal 20MB.");
      return;
    }

    const title = uploadTitle || selectedFile.name;
    const type: FileType = selectedFile.type === 'application/pdf' ? 'pdf' : 'image';
    const tags = uploadTags.split(',').map(t => t.trim().toLowerCase()).filter(t => t !== "");
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const storagePath = `sales_files/${year}/${month}/${Date.now()}_${selectedFile.name.replace(/\s+/g, '_')}`;

    setIsUploading(true);
    const storageRef = ref(storage, storagePath);
    const uploadTask = uploadBytesResumable(storageRef, selectedFile);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setUploadProgress(progress);
      },
      (error) => {
        console.error("Upload error:", error);
        alert("Gagal mengupload file.");
        setIsUploading(false);
      },
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        
        await addDoc(collection(db, 'sales_files'), {
          title,
          type,
          tags,
          updatedAt: now.toISOString().split('T')[0],
          downloadURL,
          storagePath,
          url: downloadURL,
          createdAt: serverTimestamp()
        });

        setIsUploading(false);
        setUploadProgress(null);
        setUploadTitle('');
        setUploadTags('');
        setSelectedFile(null);
        alert("File berhasil diupload!");
      }
    );
  };

  const handleAddLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLink) return;

    const newFile: SalesFile = {
      id: `local-${Date.now()}`,
      title: `Link: ${newLink.substring(0, 30)}...`,
      type: 'link',
      url: newLink,
      tags: ['custom'],
      updatedAt: new Date().toISOString().split('T')[0],
      isCustom: true
    };

    setCustomFiles([newFile, ...customFiles]);
    setNewLink('');
  };

  const handleDelete = async (file: SalesFile) => {
    if (!confirm(`Hapus "${file.title}"?`)) return;

    try {
      if (file.storagePath) {
        const fileRef = ref(storage, file.storagePath);
        await deleteObject(fileRef);
        await deleteDoc(doc(db, 'sales_files', file.id));
      } else if (file.isCustom) {
        setCustomFiles(customFiles.filter(f => f.id !== file.id));
      }
    } catch (error) {
      console.error("Delete error:", error);
      alert("Gagal menghapus file.");
    }
  };

  return (
    <div className="space-y-8">
      {/* Search & Main Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <div className="lg:col-span-2 space-y-6">
          {/* Status Indicators */}
          <div className="flex flex-wrap gap-3 mb-2">
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-[10px] font-bold uppercase tracking-wider ${isFirebaseConfigured ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-red-50 text-red-600 border-red-100'}`}>
              <div className={`w-1.5 h-1.5 rounded-full ${isFirebaseConfigured ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
              Firebase: {isFirebaseConfigured ? 'Connected' : 'Missing Config'}
            </div>
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-[10px] font-bold uppercase tracking-wider ${pickerStatus === 'blocked' ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>
              <div className={`w-1.5 h-1.5 rounded-full ${pickerStatus === 'blocked' ? 'bg-amber-500' : 'bg-blue-500 animate-pulse'}`}></div>
              Picker: {pickerStatus.toUpperCase()}
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1 relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                  <ICONS.Search />
                </div>
                <input 
                  type="text" 
                  placeholder="Cari brosur, harga, promo..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-12 pr-4 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                />
              </div>
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'newest' | 'name')}
                className="bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500/20"
              >
                <option value="newest">Terbaru</option>
                <option value="name">Abjad</option>
              </select>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedTag(null)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                  !selectedTag ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                }`}
              >
                SEMUA
              </button>
              {allTags.map(tag => (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(tag)}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all uppercase ${
                    selectedTag === tag ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Upload Panel */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
           <h4 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
              <div className="w-1.5 h-4 bg-indigo-600 rounded-full"></div>
              Upload File Baru
           </h4>

           {/* Blocked Hint Panel */}
           {showPickerHint && (
             <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-800 leading-relaxed animate-in fade-in slide-in-from-top-2">
               <p className="font-bold mb-1 flex items-center gap-1">
                 <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                   <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                 </svg>
                 Picker Tidak Muncul?
               </p>
               Di beberapa preview sandbox, browser membatasi akses file laptop. Coba <strong>Refresh</strong> atau gunakan fitur <strong>Simpan Link Manual</strong> di bawah.
             </div>
           )}

           <form onSubmit={handleFileUpload} className="space-y-4">
              <div className="space-y-2">
                <label className="block">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">Pilih File</span>
                  <div className="flex items-center gap-3">
                    <label 
                      onClick={handlePickerTriggerClick}
                      className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border-2 border-dashed transition-all cursor-pointer select-none
                      ${selectedFile ? 'bg-indigo-50 border-indigo-200 text-indigo-600' : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-indigo-300 hover:bg-slate-100'}`}
                    >
                      <input 
                        type="file" 
                        accept=".pdf,.png,.jpg,.jpeg"
                        onChange={handleFileChange}
                        disabled={!isFirebaseConfigured || isUploading}
                        className="hidden"
                      />
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                      </svg>
                      <span className="text-xs font-bold uppercase">{selectedFile ? 'Ganti File' : 'Pilih File'}</span>
                    </label>
                    <span className="text-[11px] text-slate-400 font-medium truncate max-w-[120px]">
                      {selectedFile ? selectedFile.name : "Belum ada file"}
                    </span>
                  </div>
                </label>
              </div>

              <div className="space-y-3">
                <input 
                  type="text" 
                  placeholder="Judul File (Opsional)" 
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  disabled={!isFirebaseConfigured || isUploading}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                />
                <input 
                  type="text" 
                  placeholder="Tags (contoh: promo, unit, brosur)" 
                  value={uploadTags}
                  onChange={(e) => setUploadTags(e.target.value)}
                  disabled={!isFirebaseConfigured || isUploading}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                />
              </div>

              {isUploading && (
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center px-1">
                    <span className="text-[10px] font-bold text-indigo-600 uppercase">Progres Upload</span>
                    <span className="text-[10px] font-bold text-indigo-600">{Math.round(uploadProgress || 0)}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div 
                      className="bg-indigo-600 h-full transition-all duration-300 ease-out" 
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                </div>
              )}

              <button 
                type="submit"
                disabled={!isFirebaseConfigured || isUploading || !selectedFile}
                className={`w-full py-3 rounded-xl text-xs font-black uppercase tracking-widest text-white transition-all shadow-lg ${
                  isUploading || !selectedFile || !isFirebaseConfigured
                    ? 'bg-slate-300 shadow-none cursor-not-allowed' 
                    : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-100 active:scale-95'
                }`}
              >
                {isUploading ? 'Proses Upload...' : 'Upload ke Firebase'}
              </button>
           </form>
           
           <div className="mt-8 pt-6 border-t border-slate-100">
              <h5 className="text-[10px] font-black uppercase text-slate-400 mb-3 tracking-widest flex items-center gap-2">
                 <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                   <path fillRule="evenodd" d="M13.887 3.182a.75.75 0 011.07 1.05l-3.99 4.07a.75.75 0 01-1.07 0l-3.99-4.07a.75.75 0 011.07-1.05l3.455 3.525 3.455-3.525zM13.887 16.818a.75.75 0 001.07-1.05l-3.99-4.07a.75.75 0 00-1.07 0l-3.99 4.07a.75.75 0 001.07 1.05l3.455-3.525 3.455 3.525z" clipRule="evenodd" />
                 </svg>
                 Workaround: Simpan Link Manual
              </h5>
              <form onSubmit={handleAddLink} className="flex flex-col gap-2">
                <input 
                  type="text" 
                  placeholder="Paste URL Google Drive / Dropbox..." 
                  value={newLink}
                  onChange={(e) => setNewLink(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-xs outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
                <button type="submit" className="w-full py-2 bg-slate-100 text-slate-600 font-bold rounded-lg hover:bg-slate-200 text-[10px] uppercase tracking-wider transition-colors">
                  Simpan Link
                </button>
              </form>
           </div>
        </div>
      </div>

      {/* Grid Rendering */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredFiles.map(file => (
          <div key={file.id} className="group bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 flex flex-col">
            <div className="p-6 flex-1 flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 rounded-xl bg-slate-50 group-hover:bg-indigo-50 transition-colors">
                  {file.type === 'pdf' && <ICONS.PDF />}
                  {file.type === 'image' && <ICONS.Image />}
                  {file.type === 'link' && <ICONS.Link />}
                </div>
                {(file.storagePath || file.isCustom) && (
                  <button 
                    onClick={() => handleDelete(file)}
                    className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                    </svg>
                  </button>
                )}
              </div>
              
              <h4 className="font-bold text-slate-800 mb-1 line-clamp-2 min-h-[2.5rem] group-hover:text-indigo-600 transition-colors leading-snug">
                {file.title}
              </h4>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">
                Update: {formatDate(file.updatedAt)}
              </p>
              
              <div className="flex flex-wrap gap-1.5 mb-6">
                {file.tags.map(t => (
                  <span key={t} className="px-2 py-0.5 bg-slate-50 text-slate-500 text-[9px] font-black rounded uppercase border border-slate-100">
                    {t}
                  </span>
                ))}
              </div>

              <div className="mt-auto grid grid-cols-2 gap-2">
                {file.type !== 'link' ? (
                  <button 
                    onClick={() => setPreviewFile(file)}
                    className="py-2.5 bg-slate-50 text-slate-600 text-[10px] font-black uppercase tracking-wider rounded-xl hover:bg-indigo-50 hover:text-indigo-600 transition-all border border-transparent hover:border-indigo-100"
                  >
                    Preview
                  </button>
                ) : (
                   <div className="py-2.5 bg-slate-100 text-slate-400 text-[10px] font-black uppercase tracking-wider rounded-xl text-center flex items-center justify-center opacity-50">
                    No Preview
                  </div>
                )}
                <a 
                  href={file.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="py-2.5 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-wider rounded-xl hover:bg-indigo-700 transition-all text-center shadow-md shadow-indigo-100 flex items-center justify-center"
                >
                  Buka {file.type === 'link' ? 'Link' : 'File'}
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Preview Modal */}
      {previewFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md">
          <div className="bg-white w-full max-w-5xl rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col h-[90vh] animate-in zoom-in-95 duration-200">
            <div className="px-8 py-5 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10">
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">Preview Dokumen</span>
                <h5 className="font-bold text-slate-800 truncate pr-8 max-w-[400px]">{previewFile.title}</h5>
              </div>
              <button 
                onClick={() => setPreviewFile(null)}
                className="p-3 bg-slate-50 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-900"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1 bg-slate-100 overflow-hidden">
              {previewFile.type === 'pdf' ? (
                <iframe 
                  src={`${previewFile.url}#toolbar=0`} 
                  className="w-full h-full border-none"
                  title="PDF Preview"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center p-8 bg-slate-200/50">
                  <img src={previewFile.url} alt={previewFile.title} className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl" />
                </div>
              )}
            </div>
            <div className="px-8 py-6 bg-white border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4">
               <div className="flex items-center gap-2 text-slate-400 text-[11px] font-medium">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                    <path d="M10 12.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" />
                    <path fillRule="evenodd" d="M.664 10.59a1.651 1.651 0 010-1.186A10.004 10.004 0 0110 3c4.257 0 7.893 2.66 9.336 6.41.147.381.146.804 0 1.186A10.004 10.004 0 0110 17c-4.257 0-7.893-2.66-9.336-6.41zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                  </svg>
                  Tampilan Preview Sesuai Format File
               </div>
               <div className="flex gap-3 w-full sm:w-auto">
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(previewFile.url);
                    alert("Link disalin!");
                  }}
                  className="flex-1 sm:flex-none px-6 py-3 text-xs font-bold text-slate-600 hover:text-indigo-600 bg-slate-50 hover:bg-indigo-50 rounded-xl transition-all border border-slate-200 hover:border-indigo-100"
                >
                  Salin Link
                </button>
                <a 
                  href={previewFile.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex-1 sm:flex-none px-10 py-3 bg-indigo-600 text-white text-xs font-black uppercase tracking-widest rounded-xl hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all text-center"
                >
                  Buka Penuh
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileViewer;
