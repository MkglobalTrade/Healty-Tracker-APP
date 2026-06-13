'use client';

interface StatCardProps {
  label: string;
  value: string | number;
  unit?: string;
  icon?: React.ReactNode;
  trend?: 'up' | 'down' | 'stable';
  color?: 'blue' | 'green' | 'yellow' | 'red';
}

const colorMap = {
  blue: 'bg-sky-50 text-sky-700 border-sky-100',
  green: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  yellow: 'bg-amber-50 text-amber-700 border-amber-100',
  red: 'bg-red-50 text-red-700 border-red-100',
};

export default function StatCard({ label, value, unit, icon, trend, color = 'blue' }: StatCardProps) {
  return (
    <div className={`rounded-2xl border p-3.5 ${colorMap[color]} card-hover`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider opacity-70">{label}</p>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-bold">{value}</span>
            {unit && <span className="text-xs font-medium opacity-70">{unit}</span>}
          </div>
        </div>
        {icon && <div className="opacity-60">{icon}</div>}
      </div>
      {trend && (
        <div className="mt-2 flex items-center gap-1">
          <span className={`text-xs font-semibold ${
            trend === 'down' ? 'text-emerald-600' : trend === 'up' ? 'text-red-500' : 'text-gray-500'
          }`}>
            {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'}
          </span>
          <span className="text-xs opacity-60">
            {trend === 'stable' ? 'Stable' : trend === 'up' ? 'Higher' : 'Lower'}
          </span>
        </div>
      )}
    </div>
  );
}
