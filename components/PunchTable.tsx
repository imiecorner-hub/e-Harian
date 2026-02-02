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
  <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" title="Hujung Minggu">
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

  // Helper to determine status color
  const getStatusColor = (record: PunchRecord, isWeekend: boolean) => {
    if (isWeekend) return 'bg-orange-100 text-orange-600 ring-1 ring-orange-200';
    if (record.inTime && record.outTime) return 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200';
    if (record.inTime) return 'bg-amber-100 text-amber-700 ring-1 ring-amber-200';
    return 'bg-rose-50 text-rose-500 ring-1 ring-rose-100';
  };

  const getStatusText = (record: PunchRecord, isWeekend: boolean) => {
    if (isWeekend) return 'Cuti';
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
    const isWeekend = dateObj.getDay() === 5 || dateObj.getDay() === 6;
    
    // Format full date for display (e.g., 01/05/2024)
    const formattedDate = dateObj.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
    
    return { day, dateStr, record, isWeekend, dateObj, formattedDate };
  });

  const dayNames = ['Ahad', 'Isnin', 'Selasa', 'Rabu', 'Khamis', 'Jumaat', 'Sabtu'];

  return (
    <div className="flex flex-col mt-4">
      
      {/* 
        MOBILE VIEW (Cards) - Visible on small screens, hidden on md and up 
      */}
      <div className="md:hidden space-y-4">
        {allDays.map(({ day, dateStr, record, isWeekend, dateObj, formattedDate }) => (
          <div key={dateStr} className={`p-4 rounded-xl border shadow-sm transition-all ${isWeekend ? 'bg-orange-50/50 border-orange-100' : 'bg-white border-gray-100'}`}>
            {/* Header: Date and Day */}
            <div className="flex justify-between items-center mb-3 pb-2 border-b border-gray-100/50">
              <span className="font-bold text-gray-700 font-mono text-sm">{formattedDate}</span>
              <div className="flex items-center gap-2">
                 <span className={`text-sm font-medium ${isWeekend ? "text-orange-600" : "text-gray-500"}`}>
                   {dayNames[dateObj.getDay()]}
                 </span>
                 {isWeekend && <HolidayIcon />}
              </div>
            </div>

            {/* Body: Inputs */}
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1 uppercase tracking-wider">Masuk</label>
                <input 
                  type="time" 
                  value={record.inTime || ''} 
                  onChange={(e) => onEdit(dateStr, 'inTime', e.target.value)}
                  className={`w-full border-gray-200 rounded-lg text-sm px-2 py-2 focus:ring-2 focus:ring-violet-500 focus:border-violet-500 bg-gray-50/50`}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1 uppercase tracking-wider">Keluar</label>
                <input 
                  type="time" 
                  value={record.outTime || ''} 
                  onChange={(e) => onEdit(dateStr, 'outTime', e.target.value)}
                  className={`w-full border-gray-200 rounded-lg text-sm px-2 py-2 focus:ring-2 focus:ring-violet-500 focus:border-violet-500 bg-gray-50/50`}
                />
              </div>
            </div>

            {/* Footer: Stats & Actions */}
            <div className="flex items-center justify-between pt-1">
              <div className="flex flex-col">
                <span className="text-[10px] uppercase text-gray-400 font-bold tracking-wider">Tempoh</span>
                <span className="font-mono text-sm font-semibold text-gray-700">
                  {calculateDuration(record.inTime, record.outTime)}
                </span>
              </div>

              <div className="flex items-center gap-2">
                 <span className={`px-2 py-1 text-[10px] font-bold uppercase rounded-lg ${getStatusColor(record, isWeekend)}`}>
                    {getStatusText(record, isWeekend)}
                 </span>
                 <button
                    onClick={() => onEditNote(dateStr, record.note || '')}
                    className={`p-2 rounded-lg transition-colors ${record.note ? 'text-violet-600 bg-violet-50' : 'text-gray-400 bg-gray-50 hover:bg-gray-100'}`}
                  >
                     <PencilSquareIcon />
                  </button>
              </div>
            </div>
            {/* Note Preview if exists */}
            {record.note && (
              <div className="mt-2 pt-2 border-t border-dashed border-gray-200">
                <p className="text-xs text-gray-500 italic truncate">"{record.note}"</p>
              </div>
            )}
          </div>
        ))}
      </div>


      {/* 
        DESKTOP VIEW (Table) - Hidden on small screens, visible on md and up 
      */}
      <div className="hidden md:block -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
        <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
          <div className="overflow-hidden border border-gray-100 rounded-xl">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-slate-50">
                <tr>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Tarikh
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Hari
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Masuk (IN)
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Keluar (OUT)
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Tempoh
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Catatan
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-50">
                {allDays.map(({ day, dateStr, record, isWeekend, dateObj, formattedDate }) => (
                  <tr key={dateStr} className={isWeekend ? "bg-orange-50/40" : "hover:bg-slate-50 transition-colors"}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-700">
                      {formattedDate}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center gap-2">
                        <span className={isWeekend ? "font-semibold text-orange-600" : ""}>{dayNames[dateObj.getDay()]}</span>
                        {isWeekend && <HolidayIcon />}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <input 
                        type="time" 
                        value={record.inTime || ''} 
                        onChange={(e) => onEdit(dateStr, 'inTime', e.target.value)}
                        className={`border-gray-200 rounded-lg text-sm px-3 py-1.5 focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-shadow ${isWeekend ? 'bg-white/50' : 'bg-gray-50'}`}
                        disabled={false}
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <input 
                        type="time" 
                        value={record.outTime || ''} 
                        onChange={(e) => onEdit(dateStr, 'outTime', e.target.value)}
                        className={`border-gray-200 rounded-lg text-sm px-3 py-1.5 focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-shadow ${isWeekend ? 'bg-white/50' : 'bg-gray-50'}`}
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-mono">
                      {calculateDuration(record.inTime, record.outTime)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full ${getStatusColor(record, isWeekend)}`}>
                        {getStatusText(record, isWeekend)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <button
                        onClick={() => onEditNote(dateStr, record.note || '')}
                        className="flex items-center space-x-2 text-gray-400 hover:text-violet-600 focus:outline-none group transition-colors"
                      >
                         <div className="p-1.5 rounded-md group-hover:bg-violet-50 transition-colors">
                           <PencilSquareIcon />
                         </div>
                         <span className="max-w-[120px] truncate text-xs">
                           {record.note ? <span className="text-gray-600 font-medium">{record.note}</span> : <span className="italic opacity-70">Tambah nota...</span>}
                         </span>
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