import React, { useState, useEffect } from 'react';
import { Button } from './components/Button';
import { PunchTable } from './components/PunchTable';
import { StatCard } from './components/StatCard';
import { PunchRecord } from './types';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

// Theme Types
type Theme = "light" | "dark" | "system";
const THEME_KEY = "theme";

// Icons
const ClockIcon = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const CheckCircleIcon = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const CalendarIcon = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;
const DownloadIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>;
const DocumentTextIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;
const TxtIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;
const ChatBubbleIcon = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>;
const UserIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>;
const FilterIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>;

// Theme Icons
const SunIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>;
const MoonIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>;
const SystemIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>;


function App() {
  // Theme State
  const [theme, setTheme] = useState<Theme>('system');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [activeThemeIcon, setActiveThemeIcon] = useState<React.ReactNode>(<SystemIcon />);

  // App State
  const [username, setUsername] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [records, setRecords] = useState<PunchRecord[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [exportFilter, setExportFilter] = useState<'all' | 'filled'>('all');
  
  // Note Modal State
  const [noteModal, setNoteModal] = useState<{isOpen: boolean, date: string, text: string}>({
    isOpen: false,
    date: '',
    text: ''
  });

  // --- Theme Logic ---
  function setRootDark(isDark: boolean) {
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }

  function getSystemPref(): boolean {
    return window.matchMedia?.("(prefers-color-scheme: dark)")?.matches ?? false;
  }

  function applyTheme(selectedTheme: Theme) {
    if (selectedTheme === "system") {
      setRootDark(getSystemPref());
      setActiveThemeIcon(<SystemIcon />);
    } else {
      setRootDark(selectedTheme === "dark");
      setActiveThemeIcon(selectedTheme === "dark" ? <MoonIcon /> : <SunIcon />);
    }
    localStorage.setItem(THEME_KEY, selectedTheme);
    setTheme(selectedTheme);
  }

  // Initialize Theme
  useEffect(() => {
    const savedTheme = (localStorage.getItem(THEME_KEY) as Theme) || 'system';
    applyTheme(savedTheme);

    // Listener for system changes if mode is 'system'
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      if (localStorage.getItem(THEME_KEY) === 'system') {
        setRootDark(mediaQuery.matches);
      }
    };
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  // --- End Theme Logic ---

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
    doc.setTextColor(76, 29, 149); // Violet-900 (Kept dark for white PDF paper)
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

  // Export TXT Handler
  const handleExportTXT = () => {
    if (!validateUsername()) return;

    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cleanName = username.trim().replace(/\s+/g, '_');
    const monthName = currentMonth.toLocaleDateString('ms-MY', { month: 'long', year: 'numeric' });

    let txtContent = `LAPORAN KEHADIRAN\n`;
    txtContent += `=================================================================\n`;
    txtContent += `Nama Pekerja : ${username}\n`;
    txtContent += `Bulan        : ${monthName}\n`;
    txtContent += `Jenis Laporan: ${exportFilter === 'filled' ? 'Tarikh Berisi Sahaja' : 'Semua Tarikh'}\n`;
    txtContent += `Jumlah Jam   : ${calculateTotalMonthHours()}\n`;
    txtContent += `=================================================================\n\n`;

    // Table Header with better spacing
    txtContent += `| Tarikh     | Hari       | Masuk | Keluar | Tempoh   |\n`;
    txtContent += `|------------|------------|-------|--------|----------|\n`;

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
      
      const inTime = record.inTime || '-';
      const outTime = record.outTime || '-';
      
      // Calculate Duration Inline
      let duration = '-';
      if (record.inTime && record.outTime) {
        const [inH, inM] = record.inTime.split(':').map(Number);
        const [outH, outM] = record.outTime.split(':').map(Number);
        let diff = (outH * 60 + outM) - (inH * 60 + inM);
        if (diff > 0) {
          duration = `${Math.floor(diff / 60)}j ${diff % 60}m`;
        }
      }

      // Format Row (Padding for alignment)
      txtContent += `| ${formattedDate.padEnd(10)} | ${dayName.padEnd(10)} | ${inTime.padEnd(5)} | ${outTime.padEnd(6)} | ${duration.padEnd(8)} |\n`;
    }
    
    txtContent += `-----------------------------------------------------------------\n`;
    txtContent += `Dijana pada: ${new Date().toLocaleString('ms-MY')}`;

    const blob = new Blob([txtContent], { type: 'text/plain;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `${cleanName}_${exportFilter}.txt`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // Determine Background Style based on current document class
  // Since React render might happen before document class update, using a simple check or CSS approach is safer.
  // Here we use standard classes and let Tailwind 'dark:' handle it.
  
  return (
    <div 
      className="min-h-screen pb-12 bg-cover bg-center bg-fixed bg-no-repeat font-sans transition-all duration-500 ease-in-out"
      style={{
        // For Light Mode: Use a different image or gradient via CSS in real app, here we simulate with inline logic if needed or just use classes.
        // Let's use Tailwind classes for background to switch efficiently.
      }}
    >
      {/* Background Layer: Handled via absolute div to support transitions */}
      <div className="fixed inset-0 z-0 bg-gradient-to-br from-slate-100 to-gray-200 dark:hidden"></div>
      <div className="fixed inset-0 z-0 hidden dark:block bg-cover bg-center bg-no-repeat" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?q=80&w=2560&auto=format&fit=crop')` }}></div>

      {/* 
         Unified Header Concept: 
      */}
      <header className="pt-6 sm:pt-8 pb-24 sm:pb-32 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-6">
            
            {/* Logo / Title Area - Glassmorphism optimized for dark */}
            <div className="flex items-center gap-4 w-full md:w-auto">
              <div className="flex-1 md:flex-none bg-white/70 dark:bg-gray-900/40 backdrop-blur-md border border-white/20 dark:border-white/10 rounded-2xl p-4 shadow-xl flex items-center justify-start gap-4 hover:bg-white/80 dark:hover:bg-gray-900/50 transition-colors duration-300">
                <div className="bg-gradient-to-br from-violet-600 to-fuchsia-600 p-3 rounded-xl shadow-lg shadow-violet-900/20">
                  <CalendarIcon />
                </div>
                <div className="text-left">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight drop-shadow-sm leading-none">e-Harian</h1>
                    <span className="text-xs text-gray-500 dark:text-gray-300 font-medium tracking-wider uppercase">Sistem Kehadiran</span>
                </div>
              </div>

              {/* Theme Toggle Button */}
              <div className="relative">
                <button 
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="bg-white/70 dark:bg-gray-900/40 backdrop-blur-md border border-white/20 dark:border-white/10 rounded-2xl p-4 shadow-xl text-gray-700 dark:text-gray-200 hover:bg-white/80 dark:hover:bg-gray-900/50 transition-all active:scale-95"
                  title="Tukar Tema"
                >
                  {activeThemeIcon}
                </button>

                {isDropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsDropdownOpen(false)}></div>
                    <div className="absolute top-full mt-2 left-0 z-50 w-36 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden ring-1 ring-black/5">
                      <div className="p-1 space-y-0.5">
                        <button onClick={() => { applyTheme('light'); setIsDropdownOpen(false); }} className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors ${theme === 'light' ? 'bg-violet-50 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>
                          <SunIcon /> Light
                        </button>
                        <button onClick={() => { applyTheme('dark'); setIsDropdownOpen(false); }} className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors ${theme === 'dark' ? 'bg-violet-50 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>
                          <MoonIcon /> Dark
                        </button>
                        <button onClick={() => { applyTheme('system'); setIsDropdownOpen(false); }} className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors ${theme === 'system' ? 'bg-violet-50 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>
                          <SystemIcon /> System
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Clock Area */}
            <div className="w-full md:w-auto flex flex-col items-center md:items-end">
               <div className="w-full md:w-auto bg-white/50 dark:bg-black/40 backdrop-blur-md rounded-2xl px-6 py-3 border border-white/20 dark:border-white/5 shadow-lg text-gray-900 dark:text-white">
                  <div className="text-xs font-medium text-violet-600 dark:text-blue-300 uppercase tracking-widest text-center mb-1">
                    {currentTime.toLocaleDateString('ms-MY', { weekday: 'long', day: 'numeric', month: 'long' })}
                  </div>
                  <div className="text-4xl font-mono font-bold tracking-wider drop-shadow-sm text-center text-gray-800 dark:text-white">
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
          {/* Stats Card - Enhanced Glassmorphism for Dark Mode */}
          <StatCard 
            title="Jumlah Jam (Bulan Ini)"
            value={calculateTotalMonthHours()}
            icon={<ClockIcon />}
            colorClass="bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-lg"
          />
        </div>

        {/* Month Navigation & Table - Glassmorphism Effect Dark */}
        <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl shadow-2xl shadow-black/5 dark:shadow-black/20 rounded-3xl p-1 border border-white/40 dark:border-white/10">
           <div className="bg-white/50 dark:bg-gray-800/50 rounded-[1.4rem] p-4 sm:p-6">
              
              {/* Username Input Section - Enhanced with Error Validation */}
              <div className={`mb-6 bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border transition-all duration-300 ${usernameError ? 'border-red-400/50 ring-4 ring-red-900/10' : 'border-gray-200 dark:border-gray-700'} flex items-center gap-4`}>
                 <div className={`p-2.5 rounded-lg transition-colors duration-300 ${usernameError ? 'bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400' : 'bg-violet-50 dark:bg-violet-900/30 text-violet-600 dark:text-violet-300'}`}>
                    <UserIcon />
                 </div>
                 <div className="flex-1">
                    <label htmlFor="username" className={`block text-xs font-semibold uppercase tracking-wider mb-1 transition-colors ${usernameError ? 'text-red-500 dark:text-red-400' : 'text-gray-500 dark:text-gray-400'}`}>
                       Nama Pekerja {usernameError && <span className="normal-case text-red-500 ml-2 italic">- Diperlukan</span>}
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
                      className={`w-full border-none p-0 font-medium placeholder-gray-400 focus:ring-0 bg-transparent text-sm sm:text-base transition-colors ${usernameError ? 'text-red-600 dark:text-red-300' : 'text-gray-900 dark:text-white'}`}
                    />
                    {usernameError && (
                      <p className="text-xs text-red-500 dark:text-red-400 mt-1 font-medium animate-pulse">
                         * Sila isikan nama sebelum memuat turun laporan.
                      </p>
                    )}
                 </div>
              </div>

              <div className="flex flex-col xl:flex-row items-center justify-between mb-6 sm:mb-8 gap-4">
                {/* Left: Spacer (Hidden on mobile) */}
                <div className="hidden xl:block xl:w-1/4"></div>

                {/* Center: Month Navigation */}
                <div className="w-full xl:w-1/2 flex items-center justify-between sm:justify-center space-x-2 sm:space-x-6 bg-white dark:bg-gray-800 p-2 rounded-xl sm:rounded-full border border-gray-200 dark:border-gray-700 shadow-sm">
                    <button onClick={() => changeMonth(-1)} className="p-2 sm:p-2.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-all text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
                    </button>
                    <h2 className="text-base sm:text-lg font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wide whitespace-nowrap min-w-[120px] sm:min-w-[150px] text-center">
                      {currentMonth.toLocaleDateString('ms-MY', { month: 'long', year: 'numeric' })}
                    </h2>
                    <button onClick={() => changeMonth(1)} className="p-2 sm:p-2.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-all text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
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
                          className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-violet-500 focus:border-violet-500 shadow-sm appearance-none cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-200 font-medium"
                       >
                          <option value="all">Laporan: Semua Tarikh</option>
                          <option value="filled">Laporan: Tarikh Berisi Sahaja</option>
                       </select>
                    </div>

                    <div className="flex flex-row gap-2 w-full">
                        <Button variant="secondary" onClick={handleExportCSV} className="flex-1 flex items-center justify-center gap-2 !rounded-xl text-xs sm:text-sm" title="Muat Turun CSV">
                          <DownloadIcon />
                          <span>CSV</span>
                        </Button>
                        <Button variant="secondary" onClick={handleExportPDF} className="flex-1 flex items-center justify-center gap-2 !rounded-xl text-xs sm:text-sm" title="Muat Turun PDF">
                          <DocumentTextIcon />
                          <span>PDF</span>
                        </Button>
                        <Button variant="secondary" onClick={handleExportTXT} className="flex-1 flex items-center justify-center gap-2 !rounded-xl text-xs sm:text-sm" title="Muat Turun TXT">
                          <TxtIcon />
                          <span>TXT</span>
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
            <div className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm transition-opacity" onClick={() => setNoteModal({...noteModal, isOpen: false})}></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-3xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full border border-gray-200 dark:border-gray-700 ring-1 ring-black/5 dark:ring-white/10">
              <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-8">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/30 sm:mx-0 sm:h-12 sm:w-12 text-blue-600 dark:text-blue-400 ring-8 ring-blue-50 dark:ring-blue-900/10">
                    <ChatBubbleIcon />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-5 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-bold text-gray-900 dark:text-white" id="modal-title">
                      Catatan: {new Date(noteModal.date).toLocaleDateString('ms-MY', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </h3>
                    <div className="mt-4">
                      <textarea
                        className="w-full shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 block w-full text-base border-gray-300 dark:border-gray-700 rounded-2xl p-4 transition-shadow bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400"
                        rows={4}
                        placeholder="Masukkan catatan anda di sini..."
                        value={noteModal.text}
                        onChange={(e) => setNoteModal({...noteModal, text: e.target.value})}
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800/50 px-4 py-4 sm:px-8 sm:flex sm:flex-row-reverse gap-3 flex-col sm:flex-row border-t border-gray-200 dark:border-gray-700">
                <Button variant="primary" onClick={handleSaveNote} className="!rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 w-full sm:w-auto">
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
      <footer className="mt-12 text-center text-gray-500 dark:text-white/50 text-sm pb-8 font-medium drop-shadow-md">
        <p>&copy; {new Date().getFullYear()} Sistem e-Harian.</p>
      </footer>
    </div>
  );
}

export default App;