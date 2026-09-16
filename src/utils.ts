import Papa from "papaparse";
import { MonthData, TahfizhReport } from "./types";

export const parseJHB = (str: string) => {
  if (!str || str === '-' || str.trim() === '') return { j: 0, h: 0, b: 0 };
  const parts = str.split(':').map(s => parseInt(s.trim()) || 0);
  return {
    j: parts[0] || 0,
    h: parts[1] || 0,
    b: parts[2] || 0
  };
};

export const addJHB = (a: {j:number, h:number, b:number}, b: {j:number, h:number, b:number}) => {
  // 1 Juz = 20 Halaman, 1 Halaman = 15 Baris
  let totalB = a.b + b.b;
  let carryH = Math.floor(totalB / 15);
  let finalB = totalB % 15;

  let totalH = a.h + b.h + carryH;
  let carryJ = Math.floor(totalH / 20);
  let finalH = totalH % 20;

  let finalJ = a.j + b.j + carryJ;

  return { j: finalJ, h: finalH, b: finalB };
};

export const formatJHB = (obj: {j:number, h:number, b:number}) => {
  if (obj.j === 0 && obj.h === 0 && obj.b === 0) return "-";
  const res = [];
  if (obj.j > 0) res.push(`${obj.j} Juz`);
  if (obj.h > 0) res.push(`${obj.h} Halaman`);
  if (obj.b > 0) res.push(`${obj.b} Baris`);
  return res.join(" ");
};

export const toReadableJHB = (str: string) => {
  if (!str || str === '-' || str.trim() === '') return '-';
  const parts = str.split(':').map(s => parseInt(s.trim()) || 0);
  if (parts.length === 0) return '-';
  return formatJHB({ j: parts[0] || 0, h: parts[1] || 0, b: parts[2] || 0 });
};

const emptyMonth = (): MonthData => ({
  ziyadahCapaian: '-', murajaahCapaian: '-', juziyyahCapaian: '-',
  ziyadahKualitas: '-', murajaahKualitas: '-', juziyyahKualitas: '-',
  sakit: 0, izin: 0, alpha: 0, adab: '-', catatan: '-', hasData: false
});

const parseCSVToMap = (csvText: string) => {
  const result = Papa.parse(csvText, { header: true, skipEmptyLines: true });
  const map = new Map<string, MonthData>();
  
  result.data.forEach((row: any) => {
    const nama = (row['NAMA'] || row['Nama'] || row['nama'] || '').trim();
    if (!nama) return;
    
    map.set(nama.toLowerCase(), {
      ziyadahCapaian: row['ZIYADAH (J : H : B)'] || '-',
      murajaahCapaian: row['MURAJAAH (J : H : B)'] || '-',
      juziyyahCapaian: row['JUZIYYAH (J : H : B)'] || '-',
      ziyadahKualitas: row['KUAL. ZIYADAH'] || '-',
      murajaahKualitas: row['KUAL. MURAJAAH'] || '-',
      juziyyahKualitas: row['KUAL. JUZIYYAH'] || '-',
      sakit: parseInt(row['S']) || 0,
      izin: parseInt(row['I']) || 0,
      alpha: parseInt(row['A']) || 0,
      adab: row['ADAB'] || '-',
      catatan: row['CATATAN TERAKHIR (ZIYADAH)'] || '-',
      hasData: true
    });
  });
  return map;
};

const calcAvg = (vals: string[]) => {
  const valid = vals.map(v => parseFloat(v)).filter(v => !isNaN(v));
  if (valid.length === 0) return '-';
  const sum = valid.reduce((a, b) => a + b, 0);
  return (sum / valid.length).toFixed(1);
};

export const mergeCSVData = (csv1: string, csv2: string, csv3: string): TahfizhReport[] => {
  const map1 = csv1 ? parseCSVToMap(csv1) : new Map();
  const map2 = csv2 ? parseCSVToMap(csv2) : new Map();
  const map3 = csv3 ? parseCSVToMap(csv3) : new Map();

  const allNames = new Set([...map1.keys(), ...map2.keys(), ...map3.keys()]);
  const students: TahfizhReport[] = [];

  let idCounter = 0;
  
  const getOriginalName = (csvText: string, key: string) => {
    if (!csvText) return null;
    const result = Papa.parse(csvText, { header: true, skipEmptyLines: true });
    const row = result.data.find((r: any) => {
      const n = (r['NAMA'] || r['Nama'] || r['nama'] || '').trim().toLowerCase();
      return n === key;
    }) as any;
    if (row) return (row['NAMA'] || row['Nama'] || row['nama']).trim();
    return null;
  };

  allNames.forEach(nameKey => {
    const b1 = map1.get(nameKey) || emptyMonth();
    const b2 = map2.get(nameKey) || emptyMonth();
    const b3 = map3.get(nameKey) || emptyMonth();

    const nama = getOriginalName(csv3, nameKey) || getOriginalName(csv2, nameKey) || getOriginalName(csv1, nameKey) || nameKey;

    // Hitung Ziyadah (J:H:B)
    const zTotal = formatJHB(
      addJHB(addJHB(parseJHB(b1.ziyadahCapaian), parseJHB(b2.ziyadahCapaian)), parseJHB(b3.ziyadahCapaian))
    );
    // Hitung Murajaah (J:H:B)
    const mTotal = formatJHB(
      addJHB(addJHB(parseJHB(b1.murajaahCapaian), parseJHB(b2.murajaahCapaian)), parseJHB(b3.murajaahCapaian))
    );
    // Hitung Juziyyah (J:H:B)
    const jTotal = formatJHB(
      addJHB(addJHB(parseJHB(b1.juziyyahCapaian), parseJHB(b2.juziyyahCapaian)), parseJHB(b3.juziyyahCapaian))
    );

    // Kualitas (Rata-rata)
    const zAvg = calcAvg([b1.ziyadahKualitas, b2.ziyadahKualitas, b3.ziyadahKualitas]);
    const mAvg = calcAvg([b1.murajaahKualitas, b2.murajaahKualitas, b3.murajaahKualitas]);
    const jAvg = calcAvg([b1.juziyyahKualitas, b2.juziyyahKualitas, b3.juziyyahKualitas]);

    // Adab dan Catatan (Ambil dari data terbaru yang tersedia)
    const finalAdab = b3.hasData ? b3.adab : (b2.hasData ? b2.adab : b1.adab);
    const finalCatatan = (b3.hasData && b3.catatan !== '-') ? b3.catatan : 
                         ((b2.hasData && b2.catatan !== '-') ? b2.catatan : b1.catatan);

    students.push({
      id: `std-${idCounter++}-${Date.now()}`,
      nama,
      b1, b2, b3,
      totalZiyadah: zTotal,
      totalMurajaah: mTotal,
      totalJuziyyah: jTotal,
      avgZiyadahKualitas: zAvg,
      avgMurajaahKualitas: mAvg,
      avgJuziyyahKualitas: jAvg,
      totalSakit: b1.sakit + b2.sakit + b3.sakit,
      totalIzin: b1.izin + b2.izin + b3.izin,
      totalAlpha: b1.alpha + b2.alpha + b3.alpha,
      finalAdab,
      finalCatatan
    });
  });

  students.sort((a,b) => a.nama.localeCompare(b.nama));
  return students;
};
