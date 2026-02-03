import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  colorClass: string; // expects something like "bg-blue-100 text-blue-600"
}

export const StatCard: React.FC<StatCardProps> = ({ title, value, icon, colorClass }) => {
  return (
    // Updated to dark glassmorphism
    <div className="bg-gray-800/80 backdrop-blur-md overflow-hidden shadow-xl rounded-2xl hover:shadow-2xl hover:bg-gray-800/90 transition-all duration-300 border border-white/10">
      <div className="p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            {/* Kept structure but ensured ring/bg works in dark context. 
                Using the passed colorClass directly mostly works if it's vibrant gradients, 
                but for backgrounds we rely on the parent styles. */}
            <div className={`rounded-2xl p-4 ${colorClass} bg-opacity-20 ring-1 ring-offset-2 ring-offset-gray-800 ring-opacity-30 shadow-lg`}>
              {icon}
            </div>
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-400 truncate uppercase tracking-wide text-xs mb-1">{title}</dt>
              <dd className="text-2xl font-bold text-white tracking-tight drop-shadow-sm">{value}</dd>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
};