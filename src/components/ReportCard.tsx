import React from 'react';
import { TahfizhReport, AppSettings } from '../types';
import { toReadableJHB } from '../utils';

interface ReportCardProps {
  student: TahfizhReport;
  settings: AppSettings;
  onPrint?: () => void;
}

export const ReportCard: React.FC<ReportCardProps> = ({ student, settings, onPrint }) => {
  return (
    <div className="report-card relative group/card print-only bg-white w-full max-w-[21cm] mx-auto p-[1cm] sm:p-[1.5cm] text-[12pt] font-serif text-black border border-gray-200 shadow-sm print:shadow-none print:border-none print:p-[1.5cm]">
      
      {/* Individual Print Button */}
      {onPrint && (
        <div className="absolute top-4 right-4 no-print opacity-0 group-hover/card:opacity-100 transition-opacity z-10">
          <button 
            onClick={onPrint}
            className="flex items-center gap-2 px-3 py-1.5 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 text-xs font-bold rounded-lg shadow-sm border border-indigo-200 transition-colors cursor-pointer"
            title={`Cetak Raport ${student.nama}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
            Cetak Ini
          </button>
        </div>
      )}
      
      {/* Header */}
      <div className="flex items-center justify-between border-b-[3px] border-black pb-4 mb-6">
        <div className="w-24 h-24 shrink-0 flex items-center justify-center">
          {settings.logo ? (
            <img src={settings.logo} alt="Logo" className="max-w-full max-h-full object-contain" />
          ) : (
            <div className="w-20 h-20 border-2 border-dashed border-gray-300 flex items-center justify-center text-[10px] text-gray-400 text-center rounded-full bg-gray-50 uppercase tracking-widest no-print">Logo</div>
          )}
        </div>
        <div className="text-center flex-1 px-4">
          <div className="font-bold text-2xl TrajanFont tracking-widest mt-1 mb-1 uppercase">
            Iska Qur'anic Boarding School
          </div>
          <div className="text-sm font-semibold mt-2">
            Kompleks PPTQ ISKA Jl. Raya Mayang, Gatak, Sukoharjo, Jawa Tengah
          </div>
          <div className="text-sm font-semibold">
            Telp/Wa 0826 4699 2496
          </div>
        </div>
        <div className="w-24 shrink-0"></div> {/* Spacer for balance */}
      </div>

      {/* Student Info */}
      <div className="mb-6">
        <table className="text-sm font-semibold uppercase tracking-wide">
          <tbody>
            <tr className="group">
              <td className="w-32 py-1">NAMA SANTRI</td>
              <td className="w-4">:</td>
              <td 
                contentEditable 
                suppressContentEditableWarning 
                className="outline-none focus:bg-yellow-50 print:focus:bg-transparent rounded px-1 -ml-1 transition-colors relative font-bold"
                title="Klik untuk mengedit nama"
              >
                {student.nama || '-'}
                <span className="absolute left-full ml-2 text-[10px] text-gray-400 font-normal no-print opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                  Klik untuk edit
                </span>
              </td>
            </tr>
            <tr className="group">
              <td className="py-1">KELAS</td>
              <td>:</td>
              <td 
                contentEditable 
                suppressContentEditableWarning 
                className="outline-none focus:bg-yellow-50 print:focus:bg-transparent rounded px-1 -ml-1 transition-colors relative"
                title="Klik untuk mengedit kelas"
              >
                {settings.classes?.[student.id] || '..............................'}
                <span className="absolute left-full ml-2 text-[10px] text-gray-400 font-normal no-print opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                  Klik untuk isi
                </span>
              </td>
            </tr>
            <tr className="group">
              <td className="py-1">SEMESTER</td>
              <td>:</td>
              <td>{settings.semester || '..............................'}</td>
            </tr>
            <tr>
              <td className="py-1">BULAN</td>
              <td>:</td>
              <td>{`${settings.month1} - ${settings.month3}`}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Main Table: Pencapaian & Kualitas per Bulan */}
      <table className="w-full border-collapse border-[2px] border-black mb-8 text-center text-sm font-semibold uppercase">
        <thead>
          <tr>
            <th className="border-[2px] border-black p-2 w-[18%]">JENIS<br/>HAFALAN</th>
            <th className="border-[2px] border-black p-2 w-[16%]">{settings.month1}</th>
            <th className="border-[2px] border-black p-2 w-[16%]">{settings.month2}</th>
            <th className="border-[2px] border-black p-2 w-[16%]">{settings.month3}</th>
            <th className="border-[2px] border-black p-2 w-[18%]">JUMLAH</th>
            <th className="border-[2px] border-black p-2 w-[16%]">TARGET</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="border-[2px] border-black p-2 text-left">ZIYADAH</td>
            <td className="border-[2px] border-black p-2">{toReadableJHB(student.b1.ziyadahCapaian)}</td>
            <td className="border-[2px] border-black p-2">{toReadableJHB(student.b2.ziyadahCapaian)}</td>
            <td className="border-[2px] border-black p-2">{toReadableJHB(student.b3.ziyadahCapaian)}</td>
            <td className="border-[2px] border-black p-2 font-bold">{student.totalZiyadah}</td>
            <td className="border-[2px] border-black p-2">{settings.targetZiyadah || '-'}</td>
          </tr>
          <tr>
            <td className="border-[2px] border-black p-2 text-left">MURAJAAH</td>
            <td className="border-[2px] border-black p-2">{toReadableJHB(student.b1.murajaahCapaian)}</td>
            <td className="border-[2px] border-black p-2">{toReadableJHB(student.b2.murajaahCapaian)}</td>
            <td className="border-[2px] border-black p-2">{toReadableJHB(student.b3.murajaahCapaian)}</td>
            <td className="border-[2px] border-black p-2 font-bold">-</td>
            <td className="border-[2px] border-black p-2">-</td>
          </tr>
          <tr>
            <td className="border-[2px] border-black p-2 text-left">JUZIYYAH</td>
            <td className="border-[2px] border-black p-2">{toReadableJHB(student.b1.juziyyahCapaian)}</td>
            <td className="border-[2px] border-black p-2">{toReadableJHB(student.b2.juziyyahCapaian)}</td>
            <td className="border-[2px] border-black p-2">{toReadableJHB(student.b3.juziyyahCapaian)}</td>
            <td className="border-[2px] border-black p-2 font-bold">-</td>
            <td className="border-[2px] border-black p-2">-</td>
          </tr>
        </tbody>
      </table>

      {/* Kehadiran & Adab */}
      <div className="flex justify-between items-start mb-8 text-sm uppercase">
        <div className="font-bold flex gap-2 pt-1">
          <span>NILAI ADAB :</span>
          <span>{student.finalAdab}</span>
        </div>
        <table className="w-64 border-collapse border-[2px] border-black font-semibold text-xs">
          <thead>
            <tr>
              <th colSpan={2} className="border-[2px] border-black p-1 text-center">TOTAL KEHADIRAN (3 BULAN)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-black p-1 px-2 w-1/2">SAKIT (S)</td>
              <td className="border border-black p-1 text-center">{student.totalSakit}</td>
            </tr>
            <tr>
              <td className="border border-black p-1 px-2">IZIN (I)</td>
              <td className="border border-black p-1 text-center">{student.totalIzin}</td>
            </tr>
            <tr>
              <td className="border border-black p-1 px-2">ALPHA (A)</td>
              <td className="border border-black p-1 text-center">{student.totalAlpha}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Catatan Box */}
      <div className="border-[2px] border-black p-3 mb-16 min-h-[140px] text-sm font-medium relative group">
        <div className="uppercase mb-2 flex justify-between items-center">
          <span>CATATAN (TERAKHIR)</span>
          <span className="text-[10px] text-gray-400 font-normal no-print opacity-0 group-hover:opacity-100 transition-opacity">
            Klik teks untuk mengedit
          </span>
        </div>
        <div className="px-4">
          <ul 
            className="list-disc outline-none focus:bg-yellow-50 print:focus:bg-transparent min-h-[80px] p-2 print:p-0 rounded transition-colors"
            contentEditable
            suppressContentEditableWarning
          >
            <li>{student.finalCatatan && student.finalCatatan !== '-' ? student.finalCatatan : ''}</li>
          </ul>
        </div>
      </div>

      {/* Signatures */}
      <div className="flex justify-end mt-8 text-sm text-center font-semibold">
        <div className="w-64">
          <p className="mb-24">
            Pengampu Halaqah
          </p>
          <div className="font-bold border-b border-black inline-block px-4">
            {settings.pengampu || '..............................'}
          </div>
        </div>
      </div>
    </div>
  );
};
