import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  colorClass: string; // expects something like "bg-blue-100 text-blue-600"
}

export const StatCard: React.FC<StatCardProps> = ({ title, value, icon, colorClass }) => {
  return (
    <div className="bg-white/95 backdrop-blur-sm overflow-hidden shadow-sm rounded-2xl hover:shadow-lg transition-shadow duration-300 border border-white/40">
      <div className="p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            {/* We extract the color base to apply a ring/glow effect */}
            <div className={`rounded-2xl p-4 ${colorClass} bg-opacity-20 ring-1 ring-offset-2 ring-opacity-20 ${colorClass.replace('bg-', 'ring-')}`}>
              {icon}
            </div>
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate uppercase tracking-wide text-xs mb-1">{title}</dt>
              <dd className="text-2xl font-bold text-gray-800 tracking-tight">{value}</dd>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
};