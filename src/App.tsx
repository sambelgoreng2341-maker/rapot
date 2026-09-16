import React, { useState, useCallback, useEffect } from 'react';
import { UploadCloud, FileText, Printer, FileDown, ArrowLeft, CheckCircle2, X, Settings, Users, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { TahfizhReport } from './types';
import { mergeCSVData } from './utils';
import { ReportCard } from './components/ReportCard';

const SEMESTER_OPTIONS = ["1 / Ganjil", "2 / Genap"];
const MONTH_OPTIONS = [
  "Januari", "Februari", "Maret", "April", 
  "Mei", "Juni", "Juli", "Agustus", 
  "September", "Oktober", "November", "Desember"
];

interface DropzoneProps {
  label: string;
  file: File | null;
  setFile: (f: File | null) => void;
}

const Dropzone: React.FC<DropzoneProps> = ({ label, file, setFile }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{label}</label>
      </div>

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative w-full h-32 border-2 border-dashed rounded-xl flex items-center justify-center transition-all ${
          isDragging ? 'border-indigo-500 bg-indigo-50' : 'border-slate-300 bg-white hover:border-indigo-400 hover:bg-slate-50'
        } ${file ? 'border-indigo-500 bg-indigo-50' : ''}`}
      >
        <input
          type="file"
          accept=".csv"
          onChange={handleChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        
        {file ? (
          <div className="flex flex-col items-center justify-center p-4 z-10 pointer-events-none">
            <CheckCircle2 size={28} className="text-indigo-600 mb-2" />
            <p className="text-sm font-medium text-indigo-900 text-center truncate w-full px-4">{file.name}</p>
            <p className="text-xs text-indigo-600 mt-1">{(file.size / 1024).toFixed(1)} KB</p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-slate-500 pointer-events-none">
            <UploadCloud size={28} className="mb-2" />
            <span className="text-sm font-medium">Unggah CSV</span>
          </div>
        )}

        {/* Clear Button - placed on top of invisible input */}
        {file && (
          <button 
            onClick={(e) => { e.preventDefault(); setFile(null); }}
            className="absolute top-2 right-2 p-1 bg-white rounded-full text-slate-400 hover:text-red-500 shadow-sm z-20 cursor-pointer"
          >
            <X size={14} />
          </button>
        )}
      </div>
    </div>
  );
};


export default function App() {
  const [file1, setFile1] = useState<File | null>(null);
  const [file2, setFile2] = useState<File | null>(null);
  const [file3, setFile3] = useState<File | null>(null);
  
  const [settings, setSettings] = useState<AppSettings>({
    semester: '1 / Ganjil',
    month1: 'Juli',
    month2: 'Agustus',
    month3: 'September',
    pengampu: '',
    targetZiyadah: '',
    logo: '',
    classes: {}
  });

  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [classInput, setClassInput] = useState('');
  const [printId, setPrintId] = useState<string | null>(null);

  const [students, setStudents] = useState<TahfizhReport[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Hook to handle single-student printing
  useEffect(() => {
    if (printId) {
      setTimeout(() => {
        window.print();
        setPrintId(null);
      }, 100);
    }
  }, [printId]);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setSettings({ ...settings, logo: ev.target?.result as string });
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const readAsText = (file: File | null): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (!file) {
        resolve('');
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = (e) => reject(e);
      reader.readAsText(file);
    });
  };

  const handleProcessData = async () => {
    if (!file1 && !file2 && !file3) {
      setError("Harap unggah minimal 1 file CSV untuk diproses.");
      return;
    }

    try {
      const [csv1, csv2, csv3] = await Promise.all([
        readAsText(file1),
        readAsText(file2),
        readAsText(file3)
      ]);

      const mergedData = mergeCSVData(csv1, csv2, csv3);
      
      if (mergedData.length === 0) {
        setError('Data kosong atau format CSV tidak sesuai.');
      } else {
        setStudents(mergedData);
        setError(null);
      }
    } catch (err) {
      setError('Terjadi kesalahan saat memproses file.');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportPDF = () => {
    if (students.length === 0) return;
    
    const doc = new jsPDF('landscape');
    
    doc.setFontSize(16);
    doc.text("Rekap Data Raport Santri", 14, 15);
    doc.setFontSize(10);
    doc.text(`Semester: ${settings.semester} | Pengampu: ${settings.pengampu} | Bulan: ${settings.month1} - ${settings.month3}`, 14, 22);
    
    const headers = [[
      "Nama Santri", 
      "Ziyadah B1", "Ziyadah B2", "Ziyadah B3", "Total Ziyadah", 
      "Murajaah B1", "Murajaah B2", "Murajaah B3", 
      "Juziyyah B1", "Juziyyah B2", "Juziyyah B3",
      "S", "I", "A", "Adab", "Catatan"
    ]];

    const rows = students.map(s => [
      s.nama,
      s.b1.ziyadahCapaian, s.b2.ziyadahCapaian, s.b3.ziyadahCapaian, s.totalZiyadah,
      s.b1.murajaahCapaian, s.b2.murajaahCapaian, s.b3.murajaahCapaian,
      s.b1.juziyyahCapaian, s.b2.juziyyahCapaian, s.b3.juziyyahCapaian,
      s.totalSakit.toString(), s.totalIzin.toString(), s.totalAlpha.toString(),
      s.finalAdab, s.finalCatatan
    ]);

    autoTable(doc, {
      head: headers,
      body: rows,
      startY: 28,
      styles: { fontSize: 7, cellPadding: 1.5 },
      headStyles: { fillColor: [79, 70, 229] }
    });

    doc.save("Rekap_Data_Raport.pdf");
  };

  const handleReset = () => {
    setStudents([]);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Navbar - hidden during print */}
      <nav className="no-print bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-2 text-indigo-600">
          <FileText size={28} strokeWidth={2.5} />
          <h1 className="text-xl font-bold tracking-tight text-slate-800">Auto<span className="text-indigo-600">Raport</span></h1>
        </div>
        {students.length > 0 && (
          <div className="flex gap-3">
            <button
              onClick={handleReset}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              <ArrowLeft size={16} />
              Kembali
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-sm"
            >
              <Printer size={16} />
              Cetak {students.length} Raport
            </button>
            <button
              onClick={handleExportPDF}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors border border-indigo-200 shadow-sm"
              title="Export tabel rekap data ke format PDF"
            >
              <Download size={16} />
              Export Rekap PDF
            </button>
          </div>
        )}
      </nav>

      <main className="max-w-6xl mx-auto p-6">
        
        {/* Settings Block - Always Visible */}
        <div className="w-full bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200 mb-8 no-print">
          <div className="flex items-center gap-2 mb-4">
            <Settings size={20} className="text-indigo-600" />
            <h3 className="text-lg font-bold text-slate-800">Pengaturan Raport</h3>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 bg-slate-50 p-5 rounded-xl border border-slate-100">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Semester</label>
              <select value={settings.semester} onChange={e => setSettings({...settings, semester: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white cursor-pointer">
                {SEMESTER_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Nama Pengampu</label>
              <input type="text" value={settings.pengampu} onChange={e => setSettings({...settings, pengampu: e.target.value})} placeholder="Misal: Ust. Muhammad Harun" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Target Ziyadah</label>
              <input type="text" value={settings.targetZiyadah} onChange={e => setSettings({...settings, targetZiyadah: e.target.value})} placeholder="Misal: 1 Juz 5 Hal" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Bulan 1</label>
              <select value={settings.month1} onChange={e => setSettings({...settings, month1: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white cursor-pointer">
                {MONTH_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Bulan 2</label>
              <select value={settings.month2} onChange={e => setSettings({...settings, month2: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white cursor-pointer">
                {MONTH_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Bulan 3</label>
              <select value={settings.month3} onChange={e => setSettings({...settings, month3: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white cursor-pointer">
                {MONTH_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>
            <div className="sm:col-span-2 md:col-span-3">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Logo Sekolah (Kiri Atas)</label>
              <input 
                type="file" 
                accept="image/*"
                onChange={handleLogoUpload}
                className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white file:mr-4 file:py-1.5 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 file:cursor-pointer cursor-pointer" 
              />
            </div>
          </div>

          {/* Pengaturan Kelas Siswa - Muncul setelah data diproses */}
          {students.length > 0 && (
            <div className="mt-8 pt-6 border-t border-slate-200">
              <div className="flex items-center gap-2 mb-4">
                <Users size={20} className="text-indigo-600" />
                <h4 className="text-md font-bold text-slate-800">Pengaturan Kelas Santri</h4>
              </div>
              <div className="flex flex-col sm:flex-row items-end gap-4 bg-indigo-50/50 p-5 rounded-xl border border-indigo-50">
                <div className="flex-1 w-full">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Pilih Santri</label>
                  <select 
                    value={selectedStudentId}
                    onChange={(e) => {
                      setSelectedStudentId(e.target.value);
                      setClassInput(settings.classes[e.target.value] || '');
                    }}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white cursor-pointer"
                  >
                    <option value="">-- Pilih Santri --</option>
                    {students.map(s => <option key={s.id} value={s.id}>{s.nama}</option>)}
                  </select>
                </div>
                <div className="flex-1 w-full">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Isi Kelas</label>
                  <input 
                    type="text" 
                    value={classInput}
                    onChange={(e) => {
                      setClassInput(e.target.value);
                      if (selectedStudentId) {
                        setSettings(prev => ({
                          ...prev,
                          classes: { ...prev.classes, [selectedStudentId]: e.target.value }
                        }));
                      }
                    }}
                    placeholder="Misal: IX - A" 
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-100 disabled:cursor-not-allowed"
                    disabled={!selectedStudentId}
                  />
                </div>
                <button 
                  onClick={() => {
                    if (classInput) {
                      const newClasses = { ...settings.classes };
                      students.forEach(s => { newClasses[s.id] = classInput; });
                      setSettings(prev => ({ ...prev, classes: newClasses }));
                    }
                  }}
                  disabled={!classInput}
                  className="px-5 py-2.5 bg-white hover:bg-slate-50 text-indigo-700 text-sm font-semibold rounded-lg transition-colors border border-indigo-200 disabled:opacity-50 shadow-sm whitespace-nowrap"
                  title="Terapkan kelas ini ke semua santri"
                >
                  Terapkan ke Semua
                </button>
              </div>
            </div>
          )}
        </div>

        <AnimatePresence mode="wait">
          {students.length === 0 ? (
            /* Upload State */
            <motion.div
              key="upload"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="no-print flex flex-col items-center justify-center"
            >
              <div className="w-full bg-white p-8 rounded-2xl shadow-sm border border-slate-200 mb-8">
                
                <div className="text-center mb-10">
                  <h2 className="text-2xl font-bold text-slate-900 mb-3">Unggah Data Penilaian</h2>
                  <p className="text-slate-500 max-w-2xl mx-auto text-sm">
                    Unggah file CSV penilaian per bulan. Sistem akan otomatis menggabungkan nilai berdasarkan nama siswa
                    serta menghitung total capaian secara akurat.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 border-t border-slate-100 pt-8">
                  <Dropzone 
                    label={`Data ${settings.month1}`} 
                    file={file1} setFile={setFile1} 
                  />
                  <Dropzone 
                    label={`Data ${settings.month2}`} 
                    file={file2} setFile={setFile2} 
                  />
                  <Dropzone 
                    label={`Data ${settings.month3}`} 
                    file={file3} setFile={setFile3} 
                  />
                </div>

                {error && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-8 px-4 py-3 bg-red-50 text-red-700 border border-red-200 rounded-lg w-full flex items-center justify-center gap-2"
                  >
                    <span className="font-medium">{error}</span>
                  </motion.div>
                )}

                <div className="mt-10 flex justify-center border-t border-slate-100 pt-8">
                  <button
                    onClick={handleProcessData}
                    className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-base font-semibold rounded-xl transition-all shadow-md hover:shadow-lg flex items-center gap-2"
                  >
                    <FileText size={20} />
                    Proses & Gabungkan Data
                  </button>
                </div>
              </div>

            </motion.div>
          ) : (
            /* Preview State */
            <motion.div
              key="preview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              <div className="no-print flex items-center justify-between bg-indigo-50 border border-indigo-100 px-6 py-4 rounded-xl text-indigo-800">
                <div className="flex items-center gap-3">
                  <CheckCircle2 size={24} className="text-indigo-600" />
                  <div>
                    <h3 className="font-semibold">Data Berhasil Diproses & Digabungkan</h3>
                    <p className="text-sm opacity-80">Ditemukan {students.length} data siswa siap cetak.</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleExportPDF}
                    className="flex items-center gap-2 px-5 py-2.5 bg-white text-indigo-700 border border-indigo-200 hover:bg-indigo-50 font-medium rounded-lg transition-colors shadow-sm"
                  >
                    <Download size={18} />
                    Export Rekap PDF
                  </button>
                  <button
                    onClick={handlePrint}
                    className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors shadow-sm"
                  >
                    <Printer size={18} />
                    Cetak Semua
                  </button>
                </div>
              </div>

              {/* Render all report cards, or just the one selected for print */}
              <div className="flex flex-col items-center gap-12 print:gap-0">
                {students
                  .filter(student => printId === null || printId === student.id)
                  .map((student) => (
                  <ReportCard 
                    key={student.id} 
                    student={student} 
                    settings={settings}
                    onPrint={() => setPrintId(student.id)}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
