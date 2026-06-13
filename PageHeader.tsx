'use client';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  rightAction?: React.ReactNode;
}

export default function PageHeader({ title, subtitle, icon, rightAction }: PageHeaderProps) {
  return (
    <div className="gradient-header pt-12 pb-6 px-5 rounded-b-3xl shadow-lg shadow-sky-200/50">
      <div className="max-w-lg mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          {icon && (
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              {icon}
            </div>
          )}
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">{title}</h1>
            {subtitle && (
              <p className="text-sky-100 text-sm font-medium mt-0.5">{subtitle}</p>
            )}
          </div>
        </div>
        {rightAction && <div>{rightAction}</div>}
      </div>
    </div>
  );
}
