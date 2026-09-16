export interface MonthData {
  ziyadahCapaian: string;
  murajaahCapaian: string;
  juziyyahCapaian: string;
  ziyadahKualitas: string;
  murajaahKualitas: string;
  juziyyahKualitas: string;
  sakit: number;
  izin: number;
  alpha: number;
  adab: string;
  catatan: string;
  hasData: boolean;
}

export interface AppSettings {
  semester: string;
  month1: string;
  month2: string;
  month3: string;
  pengampu: string;
  targetZiyadah: string;
  logo: string;
  classes: Record<string, string>;
}

export interface TahfizhReport {
  id: string;
  nama: string;
  
  b1: MonthData;
  b2: MonthData;
  b3: MonthData;
  
  totalZiyadah: string;
  totalMurajaah: string;
  totalJuziyyah: string;
  
  avgZiyadahKualitas: string;
  avgMurajaahKualitas: string;
  avgJuziyyahKualitas: string;
  
  totalSakit: number;
  totalIzin: number;
  totalAlpha: number;
  
  finalAdab: string;
  finalCatatan: string;
}
