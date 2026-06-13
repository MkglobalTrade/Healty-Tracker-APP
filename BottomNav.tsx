'use client';
import { usePathname, useRouter } from 'next/navigation';
import { Home, Activity, FlaskConical, Pill, Bot, Clock, Newspaper } from 'lucide-react';

const tabs = [
  { l: 'Home', i: Home, p: '/' }, { l: 'Tracker', i: Activity, p: '/tracker' },
  { l: 'Labs', i: FlaskConical, p: '/labs' }, { l: 'Meds', i: Pill, p: '/medications' },
  { l: 'AI Dr.', i: Bot, p: '/ai-doctor' }, { l: 'History', i: Clock, p: '/history' },
  { l: 'News', i: Newspaper, p: '/news' },
];

export default function BottomNav() {
  const pn = usePathname(); const r = useRouter();
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 safe-bottom z-50">
      <div className="max-w-lg mx-auto flex items-center justify-around px-1 py-1">
        {tabs.map(t => { const I = t.i; const a = pn === t.p; return (
          <button key={t.l} onClick={() => r.push(t.p)} className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-xl min-w-[48px] ${a ? 'text-sky-600' : 'text-gray-400'}`}>
            <I size={22} strokeWidth={a ? 2.5 : 1.8} /><span className={`text-[10px] mt-0.5 font-medium ${a ? 'font-semibold' : ''}`}>{t.l}</span>
            {a && <div className="w-1 h-1 rounded-full bg-sky-500 mt-0.5" />}
          </button>
        ); })}
      </div>
    </nav>
  );
}
