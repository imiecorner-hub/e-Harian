import React, { useState, useEffect } from 'react';
import { Button } from './components/Button';
import { PunchTable } from './components/PunchTable';
import { StatCard } from './components/StatCard';
import { PunchRecord } from './types';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

// Icons (Updated styles)
const ClockIcon = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const CheckCircleIcon = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const CalendarIcon = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;
const DownloadIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>;
const DocumentTextIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;
const ChatBubbleIcon = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>;
const UserIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>;
const FilterIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>;

function App() {
  // State
  const [username, setUsername] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [records, setRecords] = useState<PunchRecord[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [exportFilter, setExportFilter] = useState<'all' | 'filled'>('all'); // New Export Filter State
  
  // Note Modal State
  const [noteModal, setNoteModal] = useState<{isOpen: boolean, date: string, text: string}>({
    isOpen: false,
    date: '',
    text: ''
  });

  // Load records and username from local storage on mount
  useEffect(() => {
    const savedRecords = localStorage.getItem('punchRecords');
    const savedUsername = localStorage.getItem('punchUsername');
    
    if (savedRecords) {
      try {
        setRecords(JSON.parse(savedRecords));
      } catch (e) {
        console.error("Failed to parse records", e);
      }
    }
    
    if (savedUsername) {
      setUsername(savedUsername);
    }
  }, []);

  // Save records when they change
  useEffect(() => {
    localStorage.setItem('punchRecords', JSON.stringify(records));
  }, [records]);

  // Save username when it changes
  useEffect(() => {
    localStorage.setItem('punchUsername', username);
  }, [username]);

  // Clock Ticker
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const getTodayStr = () => currentTime.toISOString().split('T')[0];
  const getCurrentTimeStr = () => currentTime.toTimeString().slice(0, 5); // HH:mm

  // Handle Manual Edits from Table (Time and Notes)
  const handleEdit = (date: string, type: 'inTime' | 'outTime' | 'note', value: string) => {
    setRecords(prev => {
      const existingIndex = prev.findIndex(r => r.date === date);
      let newRecords = [...prev];

      if (existingIndex >= 0) {
        newRecords[existingIndex] = {
          ...newRecords[existingIndex],
          [type]: value || null
        };
      } else {
        newRecords.push({
          date: date,
          inTime: type === 'inTime' ? value : (type === 'outTime' ? null : null), // Initialize others as null
          outTime: type === 'outTime' ? value : null,
          note: type === 'note' ? value : undefined
        });
      }
      return newRecords;
    });
  };

  // Note Modal Handlers
  const handleOpenNote = (date: string, currentText: string) => {
    setNoteModal({ isOpen: true, date, text: currentText || '' });
  };

  const handleSaveNote = () => {
    handleEdit(noteModal.date, 'note', noteModal.text);
    setNoteModal({ ...noteModal, isOpen: false });
  };

  // Month Navigation
  const changeMonth = (offset: number) => {
    const newDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + offset, 1);
    setCurrentMonth(newDate);
  };

  // Filter records for current month only
  const getMonthRecords = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth() + 1;
    return records.filter(r => {
      const [rYear, rMonth] = r.date.split('-').map(Number);
      return rYear === year && rMonth === month;
    });
  };

  // Calculate Total Hours for the month
  const calculateTotalMonthHours = () => {
    const monthRecords = getMonthRecords();
    let totalMinutes = 0;
    
    monthRecords.forEach(record => {
      if (record.inTime && record.outTime) {
        const [inH, inM] = record.inTime.split(':').map(Number);
        const [outH, outM] = record.outTime.split(':').map(Number);
        
        const diff = (outH * 60 + outM) - (inH * 60 + inM);
        if (diff > 0) {
          totalMinutes += diff;
        }
      }
    });
    
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    
    return `${hours}j ${minutes}m`;
  };

  const validateUsername = () => {
    if (!username.trim()) {
      setUsernameError("Sila masukkan nama pekerja untuk memuat turun.");
      // Optional: focus the input
      const input = document.getElementById('username');
      if (input) input.focus();
      return false;
    }
    return true;
  };

  // Export CSV Handler
  const handleExportCSV = () => {
    if (!validateUsername()) return;

    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cleanName = username.trim().replace(/\s+/g, '_');

    // Only Date, Day, In, Out
    const headers = ['Tarikh', 'Hari', 'Masuk (IN)', 'Keluar (OUT)'];
    let csvContent = headers.join(',') + '\n';

    for (let i = 1; i <= daysInMonth; i++) {
      const dateObj = new Date(year, month, i);
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      const record = records.find(r => r.date === dateStr) || { date: dateStr, inTime: null, outTime: null, note: '' };
      
      // Filter Logic
      const hasData = record.inTime || record.outTime;
      if (exportFilter === 'filled' && !hasData) {
        continue;
      }

      const formattedDate = dateObj.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
      const dayName = dateObj.toLocaleDateString('ms-MY', { weekday: 'long' });
      
      const escapeCsv = (str: string | null | undefined) => {
        if (!str) return '""';
        return `"${str.replace(/"/g, '""')}"`;
      };

      const row = [
        formattedDate,
        dayName,
        record.inTime || '',
        record.outTime || ''
      ].map(field => escapeCsv(field)).join(',');

      csvContent += row + '\n';
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `${cleanName}_${exportFilter}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // Export PDF Handler
  const handleExportPDF = () => {
    if (!validateUsername()) return;

    const doc = new jsPDF();
    const monthName = currentMonth.toLocaleDateString('ms-MY', { month: 'long', year: 'numeric' });
    const cleanName = username.trim().replace(/\s+/g, '_');
    
    // Header
    doc.setFontSize(16);
    doc.setTextColor(76, 29, 149); // Violet-900
    doc.text(`Laporan Kehadiran: ${monthName}`, 14, 20);
    
    doc.setFontSize(11);
    doc.setTextColor(55, 65, 81); // Gray-700
    doc.text(`Nama Pekerja: ${username.toUpperCase()}`, 14, 28);
    
    // Sub-header for filter type
    doc.setFontSize(10);
    doc.setTextColor(107, 114, 128); // Gray-500
    const filterText = exportFilter === 'filled' ? 'Laporan: Tarikh Berisi Sahaja' : 'Laporan: Semua Tarikh';
    doc.text(filterText, 14, 34);

    doc.text(`Dijana pada: ${new Date().toLocaleString('ms-MY')}`, 14, 39);
    doc.text(`Jumlah Jam: ${calculateTotalMonthHours()}`, 14, 44);

    // Only Date, Day, In, Out
    const tableColumn = ["Tarikh", "Hari", "Masuk", "Keluar"];
    const tableRows = [];

    const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();

    for (let i = 1; i <= daysInMonth; i++) {
      const dateObj = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), i);
      const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      const record = records.find(r => r.date === dateStr) || { date: dateStr, inTime: null, outTime: null, note: '' };
      
      // Filter Logic
      const hasData = record.inTime || record.outTime;
      if (exportFilter === 'filled' && !hasData) {
        continue;
      }

      const formattedDate = dateObj.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
      const dayName = dateObj.toLocaleDateString('ms-MY', { weekday: 'long' });
      
      const rowData = [
        formattedDate,
        dayName,
        record.inTime || '-',
        record.outTime || '-'
      ];
      tableRows.push(rowData);
    }

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 50,
      styles: { fontSize: 10, cellPadding: 3 },
      headStyles: { fillColor: [139, 92, 246], textColor: 255 }, // Violet-500
      alternateRowStyles: { fillColor: [245, 243, 255] }, // Violet-50
    });

    doc.save(`${cleanName}_${exportFilter}.pdf`);
  };

  return (
    <div 
      className="min-h-screen pb-12 bg-cover bg-center bg-fixed bg-no-repeat font-sans"
      style={{
        backgroundImage: `url('https://images.unsplash.com/photo-1620641788421-7f1c91ade639?q=80&w=2560&auto=format&fit=crop')` // Stunning Seamless Gradient
      }}
    >
      {/* 
         Unified Header Concept: 
      */}
      <header className="pt-6 sm:pt-8 pb-24 sm:pb-32 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-6">
            
            {/* Logo / Title Area */}
            <div className="w-full md:w-auto bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 shadow-xl flex items-center justify-center md:justify-start gap-4 hover:bg-white/15 transition-colors duration-300">
               <div className="bg-gradient-to-br from-violet-500 to-fuchsia-500 p-3 rounded-xl shadow-lg">
                 <CalendarIcon />
               </div>
               <div className="text-left">
                  <h1 className="text-2xl font-bold text-white tracking-tight drop-shadow-sm leading-none">e-Harian</h1>
                  <span className="text-xs text-blue-100 font-medium tracking-wider uppercase">Sistem Kehadiran</span>
               </div>
            </div>

            {/* Clock Area */}
            <div className="w-full md:w-auto flex flex-col items-center md:items-end">
               <div className="w-full md:w-auto bg-black/20 backdrop-blur-md rounded-2xl px-6 py-3 border border-white/10 shadow-lg text-white">
                  <div className="text-xs font-medium text-blue-200 uppercase tracking-widest text-center mb-1">
                    {currentTime.toLocaleDateString('ms-MY', { weekday: 'long', day: 'numeric', month: 'long' })}
                  </div>
                  <div className="text-4xl font-mono font-bold tracking-wider drop-shadow-lg text-center">
                    {currentTime.toLocaleTimeString('ms-MY')}
                  </div>
               </div>
            </div>

          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 sm:-mt-24 relative z-20">
        {/* Status Cards / Actions */}
        <div className="mb-6 sm:mb-8 transform transition-all hover:scale-[1.01] duration-300">
          {/* Stats Card - Enhanced Glassmorphism */}
          <StatCard 
            title="Jumlah Jam (Bulan Ini)"
            value={calculateTotalMonthHours()}
            icon={<ClockIcon />}
            colorClass="bg-gradient-to-br from-cyan-400 to-blue-500 text-white shadow-lg"
          />
        </div>

        {/* Month Navigation & Table - Glassmorphism Effect */}
        <div className="bg-white/90 backdrop-blur-lg shadow-2xl shadow-black/5 rounded-3xl p-1 border border-white/60">
           <div className="bg-white/50 rounded-[1.4rem] p-4 sm:p-6">
              
              {/* Username Input Section - Enhanced with Error Validation */}
              <div className={`mb-6 bg-white rounded-xl p-4 shadow-sm border transition-all duration-300 ${usernameError ? 'border-red-400 ring-4 ring-red-50' : 'border-gray-100'} flex items-center gap-4`}>
                 <div className={`p-2.5 rounded-lg transition-colors duration-300 ${usernameError ? 'bg-red-50 text-red-500' : 'bg-violet-50 text-violet-600'}`}>
                    <UserIcon />
                 </div>
                 <div className="flex-1">
                    <label htmlFor="username" className={`block text-xs font-semibold uppercase tracking-wider mb-1 transition-colors ${usernameError ? 'text-red-500' : 'text-gray-500'}`}>
                       Nama Pekerja {usernameError && <span className="normal-case text-red-400 ml-2 italic">- Diperlukan</span>}
                    </label>
                    <input 
                      type="text" 
                      id="username"
                      value={username}
                      onChange={(e) => {
                        setUsername(e.target.value);
                        if (e.target.value.trim()) setUsernameError('');
                      }}
                      placeholder="Masukkan nama penuh anda..."
                      className={`w-full border-none p-0 font-medium placeholder-gray-400 focus:ring-0 bg-transparent text-sm sm:text-base transition-colors ${usernameError ? 'text-red-900' : 'text-gray-800'}`}
                    />
                    {usernameError && (
                      <p className="text-xs text-red-500 mt-1 font-medium animate-pulse">
                         * Sila isikan nama sebelum memuat turun laporan.
                      </p>
                    )}
                 </div>
              </div>

              <div className="flex flex-col xl:flex-row items-center justify-between mb-6 sm:mb-8 gap-4">
                {/* Left: Spacer (Hidden on mobile) */}
                <div className="hidden xl:block xl:w-1/4"></div>

                {/* Center: Month Navigation */}
                <div className="w-full xl:w-1/2 flex items-center justify-between sm:justify-center space-x-2 sm:space-x-6 bg-white p-2 rounded-xl sm:rounded-full border border-gray-100 shadow-sm">
                    <button onClick={() => changeMonth(-1)} className="p-2 sm:p-2.5 hover:bg-gray-50 rounded-full transition-all text-gray-400 hover:text-violet-600">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
                    </button>
                    <h2 className="text-base sm:text-lg font-bold text-gray-800 uppercase tracking-wide whitespace-nowrap min-w-[120px] sm:min-w-[150px] text-center">
                      {currentMonth.toLocaleDateString('ms-MY', { month: 'long', year: 'numeric' })}
                    </h2>
                    <button onClick={() => changeMonth(1)} className="p-2 sm:p-2.5 hover:bg-gray-50 rounded-full transition-all text-gray-400 hover:text-violet-600">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
                    </button>
                </div>

                {/* Right: Actions */}
                <div className="flex flex-col sm:flex-col justify-center sm:justify-end xl:w-1/4 w-full gap-3">
                    {/* Export Filter Dropdown */}
                    <div className="relative w-full">
                       <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                          <FilterIcon />
                       </div>
                       <select 
                          value={exportFilter}
                          onChange={(e) => setExportFilter(e.target.value as 'all' | 'filled')}
                          className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-violet-500 focus:border-violet-500 shadow-sm appearance-none cursor-pointer hover:bg-gray-50 transition-colors text-gray-700 font-medium"
                       >
                          <option value="all">Laporan: Semua Tarikh</option>
                          <option value="filled">Laporan: Tarikh Berisi Sahaja</option>
                       </select>
                    </div>

                    <div className="flex flex-row gap-2 w-full">
                        <Button variant="secondary" onClick={handleExportCSV} className="flex-1 flex items-center justify-center gap-2 border-gray-200 !rounded-xl hover:bg-gray-50 text-xs sm:text-sm" title="Muat Turun CSV">
                          <DownloadIcon />
                          <span>CSV</span>
                        </Button>
                        <Button variant="secondary" onClick={handleExportPDF} className="flex-1 flex items-center justify-center gap-2 border-gray-200 !rounded-xl hover:bg-gray-50 text-xs sm:text-sm" title="Muat Turun PDF">
                          <DocumentTextIcon />
                          <span>PDF</span>
                        </Button>
                    </div>
                </div>
              </div>
              
              <PunchTable 
                records={records} 
                currentMonth={currentMonth}
                onEdit={handleEdit}
                onEditNote={handleOpenNote}
              />
           </div>
        </div>
      </main>

      {/* Note Modal */}
      {noteModal.isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-900 bg-opacity-60 backdrop-blur-md transition-opacity" onClick={() => setNoteModal({...noteModal, isOpen: false})}></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-3xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full border border-gray-100 ring-1 ring-black/5">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-8">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-50 sm:mx-0 sm:h-12 sm:w-12 text-blue-600 ring-8 ring-blue-50/50">
                    <ChatBubbleIcon />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-5 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-bold text-gray-900" id="modal-title">
                      Catatan: {new Date(noteModal.date).toLocaleDateString('ms-MY', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </h3>
                    <div className="mt-4">
                      <textarea
                        className="w-full shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 block w-full text-base border-gray-200 rounded-2xl p-4 border transition-shadow bg-gray-50"
                        rows={4}
                        placeholder="Masukkan catatan anda di sini..."
                        value={noteModal.text}
                        onChange={(e) => setNoteModal({...noteModal, text: e.target.value})}
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-4 sm:px-8 sm:flex sm:flex-row-reverse gap-3 flex-col sm:flex-row">
                <Button variant="primary" onClick={handleSaveNote} className="!rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 w-full sm:w-auto">
                  Simpan
                </Button>
                <Button variant="secondary" onClick={() => setNoteModal({...noteModal, isOpen: false})} className="!rounded-full w-full sm:w-auto">
                  Batal
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="mt-12 text-center text-white/70 text-sm pb-8 font-medium drop-shadow-md">
        <p>&copy; {new Date().getFullYear()} Sistem e-Harian.</p>
      </footer>
    </div>
  );
}

export default App;