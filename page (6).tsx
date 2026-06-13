'use client';
import { useEffect, useState } from 'react';
import { Activity, TrendingUp, Calendar, Heart, ChevronRight, Clock } from 'lucide-react';
import BottomNav from '@/components/BottomNav';
import { getUserProfile, getGlucoseReadings, calculateHbA1c, getMedications } from '@/lib/storage';

export default function Home() {
  const [profile, setProfile] = useState({ name: 'Mikail KOCAK', birthDate: '1979-07-23', photoUrl: '' });
  const [todayAvg, setTodayAvg] = useState<number | null>(null);
  const [todayCount, setTodayCount] = useState(0);
  const [hbA1c, setHbA1c] = useState<number | null>(null);
  const [activeMeds, setActiveMeds] = useState(0);
  const [greeting, setGreeting] = useState('Good Morning');

  useEffect(() => {
    setProfile(getUserProfile());
    const h = new Date().getHours();
    setGreeting(h < 12 ? 'Good Morning' : h < 17 ? 'Good Afternoon' : 'Good Evening');
    const readings = getGlucoseReadings();
    const today = new Date().toISOString().split('T')[0];
    const tr = readings.filter((r: any) => r.timestamp.startsWith(today));
    if (tr.length) { const v = tr.map((r: any) => r.value); const a = v.reduce((s: number, n: number) => s + n, 0) / v.length; setTodayAvg(Math.round(a)); setHbA1c(calculateHbA1c(a)); }
    setTodayCount(tr.length);
    setActiveMeds(getMedications().filter((m: any) => m.isActive).length);
  }, []);

  const age = () => { const b = new Date('1979-07-23'); const n = new Date(); let a = n.getFullYear() - b.getFullYear(); if (n.getMonth() < b.getMonth() || (n.getMonth() === b.getMonth() && n.getDate() < b.getDate())) a--; return a; };
  const daysToBday = () => { const b = new Date('1979-07-23'); const n = new Date(); const next = new Date(n.getFullYear(), b.getMonth(), b.getDate()); if (next < n) next.setFullYear(next.getFullYear() + 1); return Math.ceil((next.getTime() - n.getTime()) / 86400000); };

  const Stat = ({ l, v, u, c }: { l: string; v: any; u?: string; c: string }) => (
    <div className={`rounded-2xl border p-3.5 ${c}`}>
      <p className="text-[10px] font-semibold uppercase tracking-wider opacity-70">{l}</p>
      <div className="flex items-baseline gap-1 mt-1"><span className="text-2xl font-bold">{v}</span>{u && <span className="text-xs font-medium opacity-70">{u}</span>}</div>
    </div>
  );

  const cm = (v: number, g: number, y: number) => v <= g ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : v <= y ? 'bg-amber-50 text-amber-700 border-amber-100' : 'bg-red-50 text-red-700 border-red-100';

  return (
    <div className="min-h-screen bg-white pb-24">
      <div className="bg-gradient-to-br from-sky-600 via-sky-500 to-sky-400 pt-14 pb-8 px-5 rounded-b-[32px] shadow-lg shadow-sky-200/50">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-sky-100 text-sm font-medium">{greeting} 👋</p>
              <h1 className="text-3xl font-bold text-white mt-1 tracking-tight">{profile.name}</h1>
            </div>
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center overflow-hidden border-2 border-white/30">
              {profile.photoUrl ? <img src={profile.photoUrl} alt="" className="w-full h-full object-cover" /> : <span className="text-2xl font-bold text-white">MK</span>}
            </div>
          </div>
          <div className="flex gap-3">
            <div className="flex-1 bg-white/15 backdrop-blur-sm rounded-2xl p-3.5 border border-white/20">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center"><Calendar size={16} className="text-white" /></div>
                <div><p className="text-sky-100 text-[10px] font-semibold uppercase tracking-wider">Age</p><p className="text-white text-lg font-bold">{age()}</p></div>
              </div>
              <p className="text-sky-200 text-[10px] mt-1.5">Born July 23, 1979</p>
            </div>
            <div className="flex-1 bg-white/15 backdrop-blur-sm rounded-2xl p-3.5 border border-white/20">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center"><Heart size={16} className="text-white" /></div>
                <div><p className="text-sky-100 text-[10px] font-semibold uppercase tracking-wider">Birthday</p><p className="text-white text-lg font-bold">{daysToBday()}d</p></div>
              </div>
              <p className="text-sky-200 text-[10px] mt-1.5">Until next birthday</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-5 mt-6">
        <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Today&apos;s Overview</h2>
        <div className="grid grid-cols-2 gap-3">
          <Stat l="Avg Glucose" v={todayAvg ?? '—'} u="mg/dL" c={todayAvg ? cm(todayAvg, 140, 180) : 'bg-sky-50 text-sky-700 border-sky-100'} />
          <Stat l="Est. HbA1c" v={hbA1c ?? '—'} u="%" c={hbA1c ? cm(hbA1c, 6.5, 7.5) : 'bg-sky-50 text-sky-700 border-sky-100'} />
          <Stat l="Readings" v={todayCount} c="bg-sky-50 text-sky-700 border-sky-100" />
          <Stat l="Active Meds" v={activeMeds} c="bg-sky-50 text-sky-700 border-sky-100" />
        </div>
      </div>

      <div className="max-w-lg mx-auto px-5 mt-6">
        <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Quick Actions</h2>
        <div className="space-y-2">
          {[
            { l: 'Log Glucose', d: 'Record blood sugar reading', e: '🩸', h: '/tracker' },
            { l: 'Upload Lab Results', d: 'Add your latest lab work', e: '🔬', h: '/labs' },
            { l: 'Check Medications', d: 'Review your daily medications', e: '💊', h: '/medications' },
            { l: 'Ask AI Doctor', d: 'Get instant health guidance', e: '🤖', h: '/ai-doctor' },
            { l: 'Medical News', d: 'Latest diabetes & longevity updates', e: '📰', h: '/news' },
          ].map(a => (
            <a key={a.l} href={a.h} className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100 group">
              <div className="w-11 h-11 rounded-xl bg-white shadow-sm flex items-center justify-center text-xl">{a.e}</div>
              <div className="flex-1 min-w-0"><p className="font-semibold text-gray-800 text-sm">{a.l}</p><p className="text-gray-400 text-xs mt-0.5">{a.d}</p></div>
              <ChevronRight size={18} className="text-gray-300 group-hover:text-sky-400" />
            </a>
          ))}
        </div>
      </div>

      <div className="max-w-lg mx-auto px-5 mt-6 mb-6">
        <div className="bg-gradient-to-br from-sky-50 to-blue-50 rounded-2xl p-5 border border-sky-100">
          <h3 className="font-bold text-sky-800 text-sm mb-3">📊 Glucose Targets</h3>
          <div className="space-y-2">
            {[
              { l: 'Fasting', r: '80–130 mg/dL', c: 'bg-emerald-400' },
              { l: 'Before Meal', r: '80–130 mg/dL', c: 'bg-sky-400' },
              { l: 'After Meal (2hr)', r: '< 180 mg/dL', c: 'bg-amber-400' },
              { l: 'Bedtime', r: '100–140 mg/dL', c: 'bg-indigo-400' },
            ].map(t => (
              <div key={t.l} className="flex items-center gap-3"><div className={`w-2.5 h-2.5 rounded-full ${t.c}`} /><span className="text-sm text-gray-600 flex-1">{t.l}</span><span className="text-sm font-semibold text-gray-800">{t.r}</span></div>
            ))}
          </div>
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
