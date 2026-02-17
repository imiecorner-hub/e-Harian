import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  colorClass: string; // expects something like "bg-blue-100 text-blue-600"
}

export const StatCard: React.FC<StatCardProps> = ({ title, value, icon, colorClass }) => {
  return (
    // Updated for Light/Dark mode
    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md overflow-hidden shadow-xl rounded-2xl hover:shadow-2xl transition-all duration-300 border border-white/50 dark:border-white/10">
      <div className="p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            {/* Icon Container */}
            <div className={`rounded-2xl p-4 ${colorClass} bg-opacity-20 ring-1 ring-offset-2 ring-offset-white dark:ring-offset-gray-800 ring-opacity-30 shadow-lg`}>
              {icon}
            </div>
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate uppercase tracking-wide text-xs mb-1">{title}</dt>
              <dd className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight drop-shadow-sm">{value}</dd>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
};