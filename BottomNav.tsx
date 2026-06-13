'use client';

import { usePathname, useRouter } from 'next/navigation';
import {
  Home,
  Activity,
  FlaskConical,
  Pill,
  Bot,
  Clock,
  Newspaper,
} from 'lucide-react';

const tabs = [
  { id: 'home', label: 'Home', icon: Home, path: '/' },
  { id: 'tracker', label: 'Tracker', icon: Activity, path: '/tracker' },
  { id: 'labs', label: 'Labs', icon: FlaskConical, path: '/labs' },
  { id: 'meds', label: 'Meds', icon: Pill, path: '/medications' },
  { id: 'ai', label: 'AI Dr.', icon: Bot, path: '/ai-doctor' },
  { id: 'history', label: 'History', icon: Clock, path: '/history' },
  { id: 'news', label: 'News', icon: Newspaper, path: '/news' },
];

export default function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 safe-bottom z-50">
      <div className="max-w-lg mx-auto flex items-center justify-around px-1 py-1">
        {tabs.map((tab) => {
          const isActive = pathname === tab.path;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => router.push(tab.path)}
              className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-xl transition-all duration-150 min-w-[48px] ${
                isActive
                  ? 'text-sky-600'
                  : 'text-gray-400 active:text-gray-600'
              }`}
            >
              <Icon
                size={22}
                strokeWidth={isActive ? 2.5 : 1.8}
                className="transition-all"
              />
              <span
                className={`text-[10px] mt-0.5 font-medium leading-tight ${
                  isActive ? 'font-semibold' : ''
                }`}
              >
                {tab.label}
              </span>
              {isActive && (
                <div className="w-1 h-1 rounded-full bg-sky-500 mt-0.5" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
