'use client';

import { useEffect, useState } from 'react';
import { Activity, TrendingUp, Calendar, Heart, ChevronRight, Clock } from 'lucide-react';
import BottomNav from '@/components/BottomNav';
import StatCard from '@/components/StatCard';
import { getUserProfile, getGlucoseReadings, calculateHbA1c, getMedications } from '@/lib/storage';

export default function HomePage() {
  const [profile, setProfile] = useState<any>({ name: 'Mikail KOCAK', birthDate: '1979-07-23' });
  const [todayAvg, setTodayAvg] = useState<number | null>(null);
  const [todayCount, setTodayCount] = useState(0);
  const [hbA1c, setHbA1c] = useState<number | null>(null);
  const [activeMeds, setActiveMeds] = useState(0);
  const [greeting, setGreeting] = useState('Good Morning');

  useEffect(() => {
    const p = getUserProfile();
    setProfile(p);

    // Greeting based on time
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good Morning');
    else if (hour < 17) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');

    // Today's stats
    const readings = getGlucoseReadings();
    const today = new Date().toISOString().split('T')[0];
    const todayReadings = readings.filter((r: any) => r.timestamp.startsWith(today));
    
    if (todayReadings.length > 0) {
      const values = todayReadings.map((r: any) => r.value);
      const avg = values.reduce((a: number, b: number) => a + b, 0) / values.length;
      setTodayAvg(Math.round(avg));
      setHbA1c(calculateHbA1c(avg));
    }
    setTodayCount(todayReadings.length);

    // Active medications
    const meds = getMedications();
    setActiveMeds(meds.filter((m: any) => m.isActive).length);
  }, []);

  const calculateAge = () => {
    const birth = new Date(profile.birthDate || '1979-07-23');
    const now = new Date();
    let age = now.getFullYear() - birth.getFullYear();
    const m = now.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--;
    return age;
  };

  const daysUntilBirthday = () => {
    const birth = new Date(profile.birthDate || '1979-07-23');
    const now = new Date();
    const nextBday = new Date(now.getFullYear(), birth.getMonth(), birth.getDate());
    if (nextBday < now) nextBday.setFullYear(nextBday.getFullYear() + 1);
    const diff = Math.ceil((nextBday.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  return (
    <div className="min-h-screen bg-white pb-24">
      {/* Hero Section */}
      <div className="gradient-header pt-14 pb-8 px-5 rounded-b-[32px] shadow-lg shadow-sky-200/50">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-sky-100 text-sm font-medium">{greeting} 👋</p>
              <h1 className="text-3xl font-bold text-white mt-1 tracking-tight">
                {profile.name || 'Mikail KOCAK'}
              </h1>
            </div>
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center overflow-hidden border-2 border-white/30">
              {profile.photoUrl ? (
                <img src={profile.photoUrl} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <span className="text-2xl font-bold text-white">MK</span>
              )}
            </div>
          </div>

          {/* Profile Info Cards */}
          <div className="flex gap-3">
            <div className="flex-1 bg-white/15 backdrop-blur-sm rounded-2xl p-3.5 border border-white/20">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                  <Calendar size={16} className="text-white" />
                </div>
                <div>
                  <p className="text-sky-100 text-[10px] font-semibold uppercase tracking-wider">Age</p>
                  <p className="text-white text-lg font-bold">{calculateAge()}</p>
                </div>
              </div>
              <p className="text-sky-200 text-[10px] mt-1.5">Born July 23, 1979</p>
            </div>

            <div className="flex-1 bg-white/15 backdrop-blur-sm rounded-2xl p-3.5 border border-white/20">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                  <Heart size={16} className="text-white" />
                </div>
                <div>
                  <p className="text-sky-100 text-[10px] font-semibold uppercase tracking-wider">Birthday</p>
                  <p className="text-white text-lg font-bold">{daysUntilBirthday()}d</p>
                </div>
              </div>
              <p className="text-sky-200 text-[10px] mt-1.5">Until next birthday</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="max-w-lg mx-auto px-5 mt-6">
        <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Today&apos;s Overview</h2>
        <div className="grid grid-cols-2 gap-3">
          <StatCard
            label="Avg Glucose"
            value={todayAvg ?? '—'}
            unit="mg/dL"
            icon={<Activity size={18} />}
            color={todayAvg ? (todayAvg <= 140 ? 'green' : todayAvg <= 180 ? 'yellow' : 'red') : 'blue'}
          />
          <StatCard
            label="Est. HbA1c"
            value={hbA1c ?? '—'}
            unit="%"
            icon={<TrendingUp size={18} />}
            color={hbA1c ? (hbA1c <= 6.5 ? 'green' : hbA1c <= 7.5 ? 'yellow' : 'red') : 'blue'}
          />
          <StatCard
            label="Readings"
            value={todayCount}
            icon={<Clock size={18} />}
            color="blue"
          />
          <StatCard
            label="Active Meds"
            value={activeMeds}
            icon={<span className="text-lg">💊</span>}
            color="blue"
          />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="max-w-lg mx-auto px-5 mt-6">
        <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Quick Actions</h2>
        <div className="space-y-2">
          {[
            { label: 'Log Glucose', desc: 'Record a new blood sugar reading', emoji: '🩸', href: '/tracker' },
            { label: 'Upload Lab Results', desc: 'Add your latest lab work', emoji: '🔬', href: '/labs' },
            { label: 'Check Medications', desc: 'Review your daily medications', emoji: '💊', href: '/medications' },
            { label: 'Ask AI Doctor', desc: 'Get instant health guidance', emoji: '🤖', href: '/ai-doctor' },
            { label: 'Medical News', desc: 'Latest diabetes & longevity updates', emoji: '📰', href: '/news' },
          ].map((action) => (
            <a
              key={action.label}
              href={action.href}
              className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl card-hover border border-gray-100 group"
            >
              <div className="w-11 h-11 rounded-xl bg-white shadow-sm flex items-center justify-center text-xl">
                {action.emoji}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-800 text-sm">{action.label}</p>
                <p className="text-gray-400 text-xs mt-0.5">{action.desc}</p>
              </div>
              <ChevronRight size={18} className="text-gray-300 group-hover:text-sky-400 transition-colors" />
            </a>
          ))}
        </div>
      </div>

      {/* Glucose Target Info */}
      <div className="max-w-lg mx-auto px-5 mt-6 mb-6">
        <div className="bg-gradient-to-br from-sky-50 to-blue-50 rounded-2xl p-5 border border-sky-100">
          <h3 className="font-bold text-sky-800 text-sm mb-3">📊 Glucose Targets</h3>
          <div className="space-y-2">
            {[
              { label: 'Fasting', range: '80–130 mg/dL', color: 'bg-emerald-400' },
              { label: 'Before Meal', range: '80–130 mg/dL', color: 'bg-sky-400' },
              { label: 'After Meal (2hr)', range: '< 180 mg/dL', color: 'bg-amber-400' },
              { label: 'Bedtime', range: '100–140 mg/dL', color: 'bg-indigo-400' },
            ].map((target) => (
              <div key={target.label} className="flex items-center gap-3">
                <div className={`w-2.5 h-2.5 rounded-full ${target.color}`} />
                <span className="text-sm text-gray-600 flex-1">{target.label}</span>
                <span className="text-sm font-semibold text-gray-800">{target.range}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
