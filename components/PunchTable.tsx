import React from 'react';
import { PunchRecord } from '../types';

interface PunchTableProps {
  records: PunchRecord[];
  currentMonth: Date;
  onEdit: (date: string, type: 'inTime' | 'outTime', value: string) => void;
  onEditNote: (date: string, currentNote: string) => void;
}

const PencilSquareIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
);

const HolidayIcon = () => (
  <svg className="w-4 h-4 text-orange-500 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" title="Hujung Minggu">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);

export const PunchTable: React.FC<PunchTableProps> = ({ records, currentMonth, onEdit, onEditNote }) => {
  // Helper to calculate duration
  const calculateDuration = (inTime: string | null, outTime: string | null) => {
    if (!inTime || !outTime) return '-';
    const [inH, inM] = inTime.split(':').map(Number);
    const [outH, outM] = outTime.split(':').map(Number);
    
    let diffMinutes = (outH * 60 + outM) - (inH * 60 + inM);
    if (diffMinutes < 0) return '-'; // Invalid time range

    const hours = Math.floor(diffMinutes / 60);
    const minutes = diffMinutes % 60;
    return `${hours}j ${minutes}m`;
  };

  // Helper to determine status color (Light & Dark Mode)
  const getStatusColor = (record: PunchRecord, isRestDay: boolean, isPublicHoliday: boolean) => {
    if (isRestDay || isPublicHoliday) return 'bg-orange-100 text-orange-700 ring-orange-500/30 dark:bg-orange-900/30 dark:text-orange-300 ring-1';
    if (record.inTime && record.outTime) return 'bg-emerald-100 text-emerald-700 ring-emerald-500/30 dark:bg-emerald-900/30 dark:text-emerald-300 ring-1';
    if (record.inTime) return 'bg-amber-100 text-amber-700 ring-amber-500/30 dark:bg-amber-900/30 dark:text-amber-300 ring-1';
    return 'bg-rose-100 text-rose-700 ring-rose-500/30 dark:bg-rose-900/20 dark:text-rose-300 ring-1';
  };

  const getStatusText = (record: PunchRecord, isRestDay: boolean, isPublicHoliday: boolean) => {
    if (isPublicHoliday) return 'Cuti Umum';
    if (isRestDay) return 'Cuti Mingguan';
    if (record.inTime && record.outTime) return 'Lengkap';
    if (record.inTime) return 'Masuk';
    return 'Tiada';
  };

  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  
  // Generate array of all days in month
  const allDays = Array.from({ length: daysInMonth }, (_, i) => {
    const day = i + 1;
    const dateObj = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const record = records.find(r => r.date === dateStr) || { date: dateStr, inTime: null, outTime: null, note: '' };
    
    // Weekend logic: Friday (5) and Saturday (6)
    const isRestDay = dateObj.getDay() === 5 || dateObj.getDay() === 6;
    // Public Holiday logic: March 22nd
    const isPublicHoliday = dateObj.getMonth() === 2 && dateObj.getDate() === 22;
    const isWeekend = isRestDay || isPublicHoliday;
    
    // Format full date for display (e.g., 01/05/2024)
    const formattedDate = dateObj.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
    
    return { day, dateStr, record, isWeekend, isRestDay, isPublicHoliday, dateObj, formattedDate };
  });

  const dayNames = ['Ahad', 'Isnin', 'Selasa', 'Rabu', 'Khamis', 'Jumaat', 'Sabtu'];

  return (
    <div className="flex flex-col mt-4">
      
      {/* 
        MOBILE VIEW (Cards) 
      */}
      <div className="md:hidden space-y-4">
        {allDays.map(({ day, dateStr, record, isWeekend, isRestDay, isPublicHoliday, dateObj, formattedDate }) => (
          <div key={dateStr} className={`p-4 rounded-xl border shadow-lg transition-all ${isWeekend ? 'bg-orange-50 border-orange-200 dark:bg-orange-900/10 dark:border-orange-800/30' : 'bg-white border-gray-200 dark:bg-gray-800 dark:border-gray-700'}`}>
            {/* Header: Date and Day */}
            <div className="flex justify-between items-center mb-3 pb-2 border-b border-gray-100 dark:border-gray-700">
              <span className="font-bold text-gray-800 dark:text-gray-200 font-mono text-sm">{formattedDate}</span>
              <div className="flex items-center gap-2">
                 <span className={`text-sm font-medium ${isWeekend ? "text-orange-600 dark:text-orange-400" : "text-gray-500 dark:text-gray-400"}`}>
                   {dayNames[dateObj.getDay()]}
                 </span>
                 {isWeekend && <HolidayIcon />}
              </div>
            </div>

            {/* Body: Inputs */}
            <div className="grid grid-cols-2 gap-8 mb-3">
              <div>
                <label className="block text-[10px] font-bold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider pl-1">Masuk</label>
                <input 
                  type="time" 
                  value={record.inTime || ''} 
                  onChange={(e) => onEdit(dateStr, 'inTime', e.target.value)}
                  className={`w-full rounded-lg text-sm px-3 py-2 border border-gray-300 dark:border-gray-600 shadow-sm focus:ring-2 focus:ring-violet-500 focus:border-violet-500 bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-white placeholder-gray-400 transition-all`}
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider pl-1">Keluar</label>
                <input 
                  type="time" 
                  value={record.outTime || ''} 
                  onChange={(e) => onEdit(dateStr, 'outTime', e.target.value)}
                  className={`w-full rounded-lg text-sm px-3 py-2 border border-gray-300 dark:border-gray-600 shadow-sm focus:ring-2 focus:ring-violet-500 focus:border-violet-500 bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-white placeholder-gray-400 transition-all`}
                />
              </div>
            </div>

            {/* Footer: Stats & Actions */}
            <div className="flex items-center justify-between pt-1">
              <div className="flex flex-col">
                <span className="text-[10px] uppercase text-gray-400 dark:text-gray-500 font-bold tracking-wider">Tempoh</span>
                <span className="font-mono text-sm font-semibold text-gray-700 dark:text-gray-300">
                  {calculateDuration(record.inTime, record.outTime)}
                </span>
              </div>

              <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 text-[10px] font-bold uppercase rounded-lg ${getStatusColor(record, isRestDay, isPublicHoliday)}`}>
                    {getStatusText(record, isRestDay, isPublicHoliday)}
                 </span>
                 <button
                    onClick={() => onEditNote(dateStr, record.note || '')}
                    className={`p-2 rounded-lg transition-colors ${record.note ? 'text-violet-600 bg-violet-100 dark:text-violet-300 dark:bg-violet-900/30' : 'text-gray-400 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'}`}
                  >
                     <PencilSquareIcon />
                  </button>
              </div>
            </div>
            {/* Note Preview if exists */}
            {record.note && (
              <div className="mt-2 pt-2 border-t border-dashed border-gray-200 dark:border-gray-700">
                <p className="text-xs text-gray-500 dark:text-gray-400 italic truncate">"{record.note}"</p>
              </div>
            )}
          </div>
        ))}
      </div>


      {/* 
        DESKTOP VIEW (Table) 
      */}
      <div className="hidden md:block -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
        <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
          <div className="overflow-hidden border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Tarikh
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Hari
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Masuk (IN)
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Keluar (OUT)
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Tempoh
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Catatan
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {allDays.map(({ day, dateStr, record, isWeekend, isRestDay, isPublicHoliday, dateObj, formattedDate }) => (
                  <tr key={dateStr} className={`transition-colors duration-150 hover:bg-gray-50 dark:hover:bg-gray-700/50 ${isWeekend ? 'bg-orange-50/50 dark:bg-orange-900/5' : ''}`}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-gray-900 dark:text-white font-mono">{formattedDate}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`flex items-center gap-2 text-sm font-medium ${isWeekend ? "text-orange-600 dark:text-orange-400" : "text-gray-500 dark:text-gray-400"}`}>
                        {dayNames[dateObj.getDay()]}
                        {isWeekend && <HolidayIcon />}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input 
                        type="time" 
                        value={record.inTime || ''} 
                        onChange={(e) => onEdit(dateStr, 'inTime', e.target.value)}
                        className={`block w-32 rounded-lg text-sm border-gray-300 dark:border-gray-600 focus:ring-violet-500 focus:border-violet-500 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 shadow-sm`}
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input 
                        type="time" 
                        value={record.outTime || ''} 
                        onChange={(e) => onEdit(dateStr, 'outTime', e.target.value)}
                        className={`block w-32 rounded-lg text-sm border-gray-300 dark:border-gray-600 focus:ring-violet-500 focus:border-violet-500 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 shadow-sm`}
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-700 dark:text-gray-300 font-mono font-medium">
                        {calculateDuration(record.inTime, record.outTime)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(record, isRestDay, isPublicHoliday)}`}>
                        {getStatusText(record, isRestDay, isPublicHoliday)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      <button 
                        onClick={() => onEditNote(dateStr, record.note || '')}
                        className={`flex items-center gap-2 transition-colors ${record.note ? 'text-violet-600 dark:text-violet-400 font-medium' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`}
                      >
                        <PencilSquareIcon />
                        {record.note ? <span className="max-w-[100px] truncate">{record.note}</span> : <span className="italic opacity-50">Tambah</span>}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};