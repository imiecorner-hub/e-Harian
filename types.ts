export interface PunchRecord {
  date: string; // YYYY-MM-DD
  inTime: string | null; // HH:mm format
  outTime: string | null; // HH:mm format
  note?: string;
}

export enum AttendanceStatus {
  PRESENT = 'Hadir',
  ABSENT = 'Tidak Hadir',
  INCOMPLETE = 'Belum Lengkap',
  WEEKEND = 'Hujung Minggu'
}

export interface MonthlyStats {
  totalDays: number;
  presentDays: number;
  totalHours: number;
  lateArrivals: number; // Assuming 9:00 AM is late
}