'use client';
import { usePathname, useRouter } from 'next/navigation';
import { Home, Activity, FlaskConical, Pill, Bot, Clock, Newspaper } from 'lucide-react';

const T = [
  { l: 'Home', i: Home, p: '/' }, { l: 'Track', i: Activity, p: '/tracker' },
  { l: 'Labs', i: FlaskConical, p: '/labs' }, { l: 'Meds', i: Pill, p: '/meds' },
  { l: 'AI Dr', i: Bot, p: '/ai-doctor' }, { l: 'History', i: Clock, p: '/history' },
  { l: 'News', i: Newspaper, p: '/news' },
];

export default function Nav() {
  const pn = usePathname(); const r = useRouter();
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-50">
      <div className="max-w-lg mx-auto flex items-center justify-around px-1 py-1">
        {T.map(t => { const I = t.i; const a = pn === t.p; return (
          <button key={t.l} onClick={() => r.push(t.p)} className={`flex flex-col items-center py-1.5 px-1.5 rounded-xl min-w-[44px] ${a ? 'text-sky-600' : 'text-gray-400'}`}>
            <I size={20} strokeWidth={a ? 2.5 : 1.5} />
            <span className={`text-[9px] mt-0.5 ${a ? 'font-bold' : 'font-medium'}`}>{t.l}</span>
          </button>
        ); })}
      </div>
    </nav>
  );
}
